import { requireAuth } from "../../_shared/auth.js";
import { json } from "../../_shared/response.js";

export async function onRequestGet({ request, env }) {
  try {
    const user = await requireAuth(request, env);
    const row = await env.DB.prepare(
      "SELECT email, subscription_status, trial_ends_at, stripe_customer_id FROM organiser_users WHERE id = ?"
    ).bind(user.uid).first();
    if (!row) return json({ error: "User not found" }, 404);
    return json({ uid: user.uid, ...row });
  } catch (e) {
    if (e instanceof Response) return e;
    return json({ error: "Server error" }, 500);
  }
}
