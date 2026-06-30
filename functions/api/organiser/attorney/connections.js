import { requireActiveSubscription } from "../../../_shared/auth.js";
import { json, err } from "../../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    const user = await requireActiveSubscription(request, env);
    const client_id = user.uid;

    const url = new URL(request.url);

    // GET: List connections for the client
    if (request.method === "GET") {
      const connections = await env.DB.prepare(`
        SELECT 
          c.id, 
          u.email as attorney_email, 
          c.linked_at, 
          c.status 
        FROM organiser_attorney_clients c
        JOIN organiser_users u ON c.attorney_id = u.id
        WHERE c.client_id = ?
      `).bind(client_id).all();

      return json({ connections: connections.results || [] });
    }

    const body = await request.json();

    // POST: Approve or decline a connection request
    if (request.method === "POST") {
      const { link_id, action } = body;
      if (!link_id || !action) {
        return err("Missing link_id or action", 400);
      }

      if (action === "approve") {
        await env.DB.prepare(
          "UPDATE organiser_attorney_clients SET status = 'approved' WHERE id = ? AND client_id = ?"
        ).bind(link_id, client_id).run();
        return json({ ok: true });
      } else if (action === "decline") {
        await env.DB.prepare(
          "DELETE FROM organiser_attorney_clients WHERE id = ? AND client_id = ?"
        ).bind(link_id, client_id).run();
        return json({ ok: true });
      }

      return err("Invalid action", 400);
    }

    // DELETE: Revoke/delete a link
    if (request.method === "DELETE") {
      const { link_id } = body;
      if (!link_id) {
        return err("Missing link_id", 400);
      }

      await env.DB.prepare(
        "DELETE FROM organiser_attorney_clients WHERE id = ? AND client_id = ?"
      ).bind(link_id, client_id).run();
      return json({ ok: true });
    }

    return err("Method not allowed", 405);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("connections error", e);
    return err("Server error", 500);
  }
}
