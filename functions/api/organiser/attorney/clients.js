import { requireActiveSubscription } from "../../../_shared/auth.js";
import { json, err } from "../../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    const user = await requireActiveSubscription(request, env);
    const attorney_id = user.uid;

    const url = new URL(request.url);

    // GET: List all clients linked to this attorney
    if (request.method === "GET") {
      const clients = await env.DB.prepare(`
        SELECT 
          c.id as link_id, 
          u.id as client_id, 
          u.email as client_email, 
          c.linked_at, 
          c.status,
          u.share_token
        FROM organiser_attorney_clients c
        JOIN organiser_users u ON c.client_id = u.id
        WHERE c.attorney_id = ?
        ORDER BY c.linked_at DESC
      `).bind(attorney_id).all();

      const results = clients.results || [];

      // If any approved client has no share_token, automatically generate and save one
      for (const row of results) {
        if (row.status === "approved" && !row.share_token) {
          const arr = new Uint8Array(24);
          crypto.getRandomValues(arr);
          const token = Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
          
          await env.DB.prepare(
            "UPDATE organiser_users SET share_token = ? WHERE id = ?"
          ).bind(token, row.client_id).run();
          
          row.share_token = token;
        }
      }

      return json({ clients: results });
    }

    // DELETE: Attorney unlinks/revokes client
    if (request.method === "DELETE") {
      const body = await request.json();
      const { link_id } = body;
      if (!link_id) {
        return err("Missing link_id", 400);
      }

      await env.DB.prepare(
        "DELETE FROM organiser_attorney_clients WHERE id = ? AND attorney_id = ?"
      ).bind(link_id, attorney_id).run();
      
      return json({ ok: true });
    }

    return err("Method not allowed", 405);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("attorney-clients error", e);
    return err("Server error", 500);
  }
}
