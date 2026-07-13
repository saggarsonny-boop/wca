import { requireAuth } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequestGet({ request, env }) {
  try {
    const user = await requireAuth(request, env);
    
    const dbUser = await env.DB.prepare(
      "SELECT email, subscription_status, role FROM organiser_users WHERE id = ?"
    ).bind(user.uid).first();

    if (!dbUser) return err("User not found", 404);

    return json({
      email: dbUser.email,
      role: dbUser.role || "user",
      subscription_status: dbUser.subscription_status
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return err(e.message, 500);
  }
}
