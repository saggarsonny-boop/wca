import { hashPassword } from "../../_shared/crypto.js";
import { json, err } from "../../_shared/response.js";

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { email, code, password } = body;

    if (!email || !code || !password) {
      return err("All fields are required.", 400);
    }
    if (password.length < 8) {
      return err("Password must be at least 8 characters.", 400);
    }

    const emailLower = email.toLowerCase().trim();
    const codeClean = String(code).trim();

    // 1. Verify code
    const token = await env.DB.prepare(
      "SELECT expires_at FROM organiser_reset_tokens WHERE email = ? AND code = ?"
    ).bind(emailLower, codeClean).first();

    if (!token) {
      return err("Invalid or expired verification code.", 400);
    }

    const expiresAt = new Date(token.expires_at);
    if (expiresAt < new Date()) {
      return err("Verification code has expired. Please request a new one.", 400);
    }

    // 2. Hash new password
    const { hash, salt } = await hashPassword(password);

    // 3. Update password in database
    await env.DB.prepare(
      "UPDATE organiser_users SET password_hash = ?, password_salt = ?, updated_at = datetime('now') WHERE email = ?"
    ).bind(hash, salt, emailLower).run();

    // 4. Clean up token
    await env.DB.prepare(
      "DELETE FROM organiser_reset_tokens WHERE email = ?"
    ).bind(emailLower).run();

    return json({ ok: true });
  } catch (e) {
    console.error("reset-password-confirm error", e);
    return err("Password reset failed. Please try again.", 500);
  }
}
