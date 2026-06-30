import { requireAuth } from "../../../_shared/auth.js";
import { json, err } from "../../../_shared/response.js";

export async function onRequestPost({ request, env }) {
  try {
    const user = await requireAuth(request, env);
    const client_id = user.uid;

    const { code } = await request.json();
    if (!code) {
      return err("Firm code is required", 400);
    }

    const clean_code = code.trim().toUpperCase();

    // 1. Look up the attorney who owns the firm code
    const attorney = await env.DB.prepare(
      "SELECT id, subscription_status FROM organiser_users WHERE firm_code = ?"
    ).bind(clean_code).first();

    if (!attorney) {
      return err("Invalid firm code. Please double check with your attorney.", 404);
    }

    // 2. Verify attorney's subscription status
    if (attorney.subscription_status !== "active" && attorney.subscription_status !== "lifetime") {
      return err("This firm's subscription is currently inactive.", 402);
    }

    if (attorney.id === client_id) {
      return err("You cannot redeem your own firm code.", 400);
    }

    // 3. Count active slots for this attorney
    const slotCount = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM organiser_attorney_clients WHERE attorney_id = ? AND is_active_slot = 1"
    ).bind(attorney.id).first();

    const current_slots = slotCount?.count || 0;

    if (current_slots >= 5) {
      return err("This firm code has reached its limit of 5 active clients. Please contact your attorney to upgrade or manage slots.", 403);
    }

    // 4. Link client to attorney as approved and active
    const linked_at = new Date().toISOString();

    // Delete any existing link first to avoid unique constraint issues
    await env.DB.prepare(
      "DELETE FROM organiser_attorney_clients WHERE attorney_id = ? AND client_id = ?"
    ).bind(attorney.id, client_id).run();

    // Insert new active link
    await env.DB.prepare(
      "INSERT INTO organiser_attorney_clients (attorney_id, client_id, linked_at, status, is_active_slot) VALUES (?, ?, ?, 'approved', 1)"
    ).bind(attorney.id, client_id, linked_at).run();

    return json({ 
      ok: true, 
      message: "Firm code applied successfully! Your Case Organiser workspace has been unlocked." 
    });

  } catch (e) {
    if (e instanceof Response) return e;
    console.error("redeem-code error", e);
    return err("Server error", 500);
  }
}
