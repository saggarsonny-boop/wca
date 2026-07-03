import { requireActiveSubscription } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    const user = await requireActiveSubscription(request, env);
    const uid = user.uid;

    if (request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT id, sender_name, message_text, role, created_at FROM organiser_support_circle_messages WHERE user_id = ? ORDER BY created_at ASC"
      ).bind(uid).all();
      return json({ messages: results });
    }

    if (request.method === "POST") {
      const body = await request.json();
      const { sender_name, message_text, role } = body;
      
      if (!message_text || !sender_name || !role) {
        return err("Missing fields", 400);
      }

      await env.DB.prepare(
        "INSERT INTO organiser_support_circle_messages (user_id, sender_name, message_text, role) VALUES (?, ?, ?, ?)"
      ).bind(uid, sender_name, message_text, role).run();
      
      return json({ ok: true });
    }

    return err("Method not allowed", 405);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("support-circle error", e);
    return err("Server error", 500);
  }
}
