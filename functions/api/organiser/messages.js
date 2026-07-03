import { requireActiveSubscription } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    const user = await requireActiveSubscription(request, env);
    const uid = user.uid;

    if (request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT id, sender_id, recipient_id, workspace_id, message, timestamp FROM organiser_messages WHERE workspace_id = ? ORDER BY timestamp ASC"
      ).bind(String(uid)).all();
      return json({ messages: results });
    }

    if (request.method === "POST") {
      const body = await request.json();
      const { recipient_id, message } = body;
      
      if (!message) {
        return err("Message text is required", 400);
      }

      const msgId = crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO organiser_messages (id, sender_id, recipient_id, workspace_id, message) VALUES (?, ?, ?, ?, ?)"
      ).bind(msgId, String(uid), recipient_id || "all", String(uid), message).run();
      
      return json({ ok: true });
    }

    return err("Method not allowed", 405);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("messages error", e);
    return err("Server error", 500);
  }
}
