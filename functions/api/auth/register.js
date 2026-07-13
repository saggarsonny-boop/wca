import { hashPassword } from "../../_shared/crypto.js";
import { signJWT, sessionCookie } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { email, password, phone, phone_confirm } = body;
    if (phone_confirm) {
      return json({ ok: true });
    }
    if (!email || !password) return err("Email and password are required.");
    if (password.length < 8) return err("Password must be at least 8 characters.");

    const emailLower = email.toLowerCase().trim();
    const existing = await env.DB.prepare("SELECT id FROM organiser_users WHERE email = ?").bind(emailLower).first();
    if (existing) return err("An account with that email already exists.");

    const origin = new URL(request.url).hostname;
    const { hash, salt } = await hashPassword(password);
    const result = await env.DB.prepare(
      "INSERT INTO organiser_users (email, phone, password_hash, password_salt, subscription_status, trial_ends_at, origin_domain, created_at) VALUES (?, ?, ?, ?, 'trial', datetime('now', '+7 days'), ?, datetime('now')) RETURNING id"
    ).bind(emailLower, phone || "", hash, salt, origin).first();

    const token = await signJWT({ uid: result.id, email: emailLower }, env.JWT_SECRET || "wca-dev-fallback-secret-set-jwt-secret-in-production");
    return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(token) });
  } catch (e) {
    console.error("register error", e);
    return err("Registration failed. Please try again.", 500);
  }
}
