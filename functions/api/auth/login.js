import { verifyPassword } from "../../_shared/crypto.js";
import { signJWT, sessionCookie } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequestPost({ request, env }) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return err("Email and password are required.");

    const emailLower = email.toLowerCase().trim();
    const user = await env.DB.prepare(
      "SELECT id, password_hash, password_salt, subscription_status FROM organiser_users WHERE email = ?"
    ).bind(emailLower).first();

    if (!user) return err("Incorrect email or password.", 401);

    const ok = await verifyPassword(password, user.password_hash, user.password_salt);
    if (!ok) return err("Incorrect email or password.", 401);

    if (user.subscription_status === "cancelled") {
      return err("Your subscription has ended. Please resubscribe to access the organiser.", 403);
    }

    const token = await signJWT({ uid: user.id, email: emailLower, sub: user.subscription_status }, env.JWT_SECRET || "wca-dev-fallback-secret-set-jwt-secret-in-production");
    return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(token) });
  } catch (e) {
    console.error("login error", e);
    return err("Login failed. Please try again.", 500);
  }
}
