import { requireActiveSubscription } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    const user = await requireActiveSubscription(request, env);
    const uid = user.uid;

    if (request.method === "GET") {
      // 1. Fetch user alerts config
      const userConfig = await env.DB.prepare(
        "SELECT alert_email, phone_number FROM organiser_users WHERE id = ?"
      ).bind(uid).first();

      // 2. Fetch custom reminders
      const { results: reminders } = await env.DB.prepare(
        "SELECT id, title, due_date, alert_type FROM organiser_reminders WHERE user_id = ?"
      ).bind(uid).all();

      // 3. Fetch dates milestones
      const { results: dates } = await env.DB.prepare(
        "SELECT id, label, date_val FROM organiser_dates WHERE user_id = ?"
      ).bind(uid).all();

      return json({
        alert_email: userConfig?.alert_email || "",
        phone_number: userConfig?.phone_number || "",
        reminders,
        dates
      });
    }

    if (request.method === "POST") {
      const body = await request.json();
      const { action, alert_email, phone_number, title, due_date, alert_type } = body;

      if (action === "preferences") {
        await env.DB.prepare(
          "UPDATE organiser_users SET alert_email = ?, phone_number = ? WHERE id = ?"
        ).bind(alert_email || "", phone_number || "", uid).run();

        return json({ ok: true });
      }

      if (action === "create") {
        if (!title || !due_date || !alert_type) {
          return err("Missing parameters for creating reminder", 400);
        }
        
        const remId = crypto.randomUUID();
        await env.DB.prepare(
          "INSERT INTO organiser_reminders (id, user_id, title, due_date, alert_type) VALUES (?, ?, ?, ?, ?)"
        ).bind(remId, uid, title, due_date, alert_type).run();

        // If Resend API key is configured, send email notification
        if (env.RESEND_API_KEY && alert_type === "email" && alert_email) {
          try {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                from: "notifications@whitecollaracademy.com",
                to: alert_email,
                subject: `Reminder: ${title}`,
                html: `<p>This is an automated reminder that <strong>${title}</strong> is due on ${due_date}.</p>`
              })
            });
            console.log("Email notification sent via Resend API.");
          } catch (mailErr) {
            console.error("Failed to dispatch email via Resend:", mailErr);
          }
        }

        return json({ ok: true }, 201);
      }

      return err("Invalid action", 400);
    }

    return err("Method not allowed", 405);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("reminders error", e);
    return err("Server error", 500);
  }
}
