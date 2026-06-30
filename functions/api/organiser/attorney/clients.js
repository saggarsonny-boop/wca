import { requireAuth } from "../../../_shared/auth.js";
import { json, err } from "../../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    const authUser = await requireAuth(request, env);
    const attorney_id = authUser.uid;

    // Fetch user details to verify active subscription
    const dbUser = await env.DB.prepare(
      "SELECT subscription_status, firm_code FROM organiser_users WHERE id = ?"
    ).bind(attorney_id).first();

    if (!dbUser) return err("User not found", 404);

    const hasSub = dbUser.subscription_status === "active" || dbUser.subscription_status === "lifetime";

    if (!hasSub) {
      if (request.method === "GET") {
        return json({ 
          clients: [], 
          used_slots: 0, 
          firm_code: null,
          needs_subscription: true 
        });
      }
      return err("Active subscription required for this action.", 402);
    }

    const url = new URL(request.url);

    // GET: List all clients and slot details
    if (request.method === "GET") {
      const clients = await env.DB.prepare(`
        SELECT 
          c.id as link_id, 
          u.id as client_id, 
          u.email as client_email, 
          c.linked_at, 
          c.status,
          c.is_active_slot,
          u.share_token
        FROM organiser_attorney_clients c
        JOIN organiser_users u ON c.client_id = u.id
        WHERE c.attorney_id = ?
        ORDER BY c.linked_at DESC
      `).bind(attorney_id).all();

      const results = clients.results || [];

      // Auto-generate share tokens if missing for approved clients
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

      // Count active slots
      const activeCount = await env.DB.prepare(
        "SELECT COUNT(*) as count FROM organiser_attorney_clients WHERE attorney_id = ? AND is_active_slot = 1"
      ).bind(attorney_id).first();

      return json({ 
        clients: results,
        used_slots: activeCount?.count || 0,
        firm_code: dbUser.firm_code || null
      });
    }

    const body = await request.json();

    // POST: Manage slot toggle (Revoke or restore active billing seat)
    if (request.method === "POST") {
      const { action, client_id } = body;
      if (!action || !client_id) {
        return err("Missing action or client_id", 400);
      }

      if (action === "toggle_slot") {
        // Find current status
        const link = await env.DB.prepare(
          "SELECT is_active_slot FROM organiser_attorney_clients WHERE attorney_id = ? AND client_id = ?"
        ).bind(attorney_id, client_id).first();

        if (!link) {
          return err("Link not found.", 404);
        }

        const next_state = link.is_active_slot === 1 ? 0 : 1;

        // If activating, verify slots remain
        if (next_state === 1) {
          const activeCount = await env.DB.prepare(
            "SELECT COUNT(*) as count FROM organiser_attorney_clients WHERE attorney_id = ? AND is_active_slot = 1"
          ).bind(attorney_id).first();

          if ((activeCount?.count || 0) >= 5) {
            return err("You have reached your maximum limit of 5 active client slots. Please release another seat first.", 403);
          }
        }

        await env.DB.prepare(
          "UPDATE organiser_attorney_clients SET is_active_slot = ? WHERE attorney_id = ? AND client_id = ?"
        ).bind(next_state, attorney_id, client_id).run();

        return json({ ok: true, is_active_slot: next_state });
      }

      return err("Invalid action", 400);
    }

    // DELETE: Attorney unlinks/revokes client relation completely
    if (request.method === "DELETE") {
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
