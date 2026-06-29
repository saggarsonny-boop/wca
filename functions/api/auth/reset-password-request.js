import { json, err } from "../../_shared/response.js";

export async function onRequestPost({ request, env }) {
  try {
    const { email: rawEmail } = await request.json();
    const email = (rawEmail || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return err("Please enter a valid email address.", 400);
    }

    // 1. Check if user exists
    const user = await env.DB.prepare(
      "SELECT id FROM organiser_users WHERE email = ?"
    ).bind(email).first();

    if (!user) {
      // Return 200 OK to prevent user enumeration
      return json({ ok: true, message: "If this email is registered, we have sent a reset code." });
    }

    // 2. Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    // 3. Clear old codes and insert new
    await env.DB.prepare("DELETE FROM organiser_reset_tokens WHERE email = ?").bind(email).run();
    await env.DB.prepare(
      "INSERT INTO organiser_reset_tokens (email, code, expires_at, created_at) VALUES (?, ?, ?, datetime('now'))"
    ).bind(email, code, expiresAt).run();

    console.log(`Password reset code for ${email}: ${code}`);

    // 4. Send email using Resend
    const resendKey = env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "White Collar Academy <support@whitecollaracademy.com>",
            to: email,
            subject: "Reset your WCA Case Organiser Password",
            html: `<div style="font-family:sans-serif; max-width:500px; margin:0 auto; padding:20px; border:1px solid #e2e8f0; border-radius:8px;">
                     <h2 style="color:#2c4a7c; font-size:20px; margin-bottom:15px;">Reset your Case Organiser Password</h2>
                     <p style="color:#4a5568; font-size:15px; line-height:1.5;">You requested to reset your password. Use the following 6-digit code to verify your identity:</p>
                     <div style="font-size:32px; letter-spacing:4px; font-family:monospace; font-weight:bold; text-align:center; padding:15px; background:#f7fafc; color:#2c4a7c; margin:20px 0; border-radius:6px;">
                       ${code}
                     </div>
                     <p style="color:#718096; font-size:13px; line-height:1.4;">This code will expire in 15 minutes. If you did not request this reset, you can safely ignore this email.</p>
                   </div>`
          })
        });
      } catch (err) {
        console.error("Resend API error:", err);
      }
    }

    return json({ ok: true, message: "If this email is registered, we have sent a reset code." });
  } catch (e) {
    console.error("reset-password-request error", e);
    return err("Server error", 500);
  }
}
