import { hashPassword } from "../../_shared/crypto.js";
import { signJWT, sessionCookie } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequestPost({ request, env }) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return err("Email and password are required.");
    if (password.length < 8) return err("Password must be at least 8 characters.");

    const emailLower = email.toLowerCase().trim();
    const existing = await env.DB.prepare("SELECT id FROM organiser_users WHERE email = ?").bind(emailLower).first();
    if (existing) return err("An account with that email already exists.");

    // Check subscription status via Stripe customer lookup or invitation
    // For now: open registration; Stripe webhook will update subscription_status
    const { hash, salt } = await hashPassword(password);
    const result = await env.DB.prepare(
      "INSERT INTO organiser_users (email, password_hash, password_salt, subscription_status, created_at) VALUES (?, ?, ?, 'trial', datetime('now')) RETURNING id"
    ).bind(emailLower, hash, salt).first();

    const token = await signJWT({ uid: result.id, email: emailLower }, env.JWT_SECRET);
    return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(token) });
  } catch (e) {
    console.error("register error", e);
    return err("Registration failed. Please try again.", 500);
  }
}
