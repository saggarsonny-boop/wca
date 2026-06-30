import { requireAuth } from "../../_shared/auth.js";
import { json } from "../../_shared/response.js";

export async function onRequestGet({ request, env }) {
  try {
    const user = await requireAuth(request, env);
    let row = await env.DB.prepare(
      "SELECT email, subscription_status, trial_ends_at, stripe_customer_id, firm_code FROM organiser_users WHERE id = ?"
    ).bind(user.uid).first();
    if (!row) return json({ error: "User not found" }, 404);

    // Auto-generate firm code for active/lifetime subscriptions if missing
    if ((row.subscription_status === "active" || row.subscription_status === "lifetime") && !row.firm_code) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "FIRM-";
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      await env.DB.prepare(
        "UPDATE organiser_users SET firm_code = ? WHERE id = ?"
      ).bind(code, user.uid).run();
      
      row.firm_code = code;
    }

    // Attorney Sponsorship: check if client is sponsored by a linked active attorney
    if (row.subscription_status !== "active" && row.subscription_status !== "lifetime") {
      const sponsor = await env.DB.prepare(`
        SELECT u.subscription_status 
        FROM organiser_attorney_clients c
        JOIN organiser_users u ON c.attorney_id = u.id
        WHERE c.client_id = ? AND c.status = 'approved' AND c.is_active_slot = 1
        LIMIT 1
      `).bind(user.uid).first();
      
      if (sponsor && (sponsor.subscription_status === "active" || sponsor.subscription_status === "lifetime")) {
        row.subscription_status = "active";
      }
    }

    return json({ uid: user.uid, ...row });
  } catch (e) {
    if (e instanceof Response) return e;
    return json({ error: "Server error" }, 500);
  }
}
