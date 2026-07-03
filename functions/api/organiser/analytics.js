import { requireActiveSubscription } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    // Analytics is readable by authenticated admins/users
    const user = await requireActiveSubscription(request, env);
    const uid = user.uid;

    if (request.method === "GET") {
      if (user.role !== "admin") {
        return err("Unauthorized", 401);
      }
      // Return counts aggregated by event_type and url
      const { results: totals } = await env.DB.prepare(
        "SELECT event_type, COUNT(*) as count FROM organiser_analytics GROUP BY event_type ORDER BY count DESC"
      ).all();

      const { results: pages } = await env.DB.prepare(
        "SELECT url, COUNT(*) as count FROM organiser_analytics WHERE event_type = 'pageview' GROUP BY url ORDER BY count DESC LIMIT 10"
      ).all();

      return json({ totals, pages });
    }

    if (request.method === "POST") {
      const { event_type, url } = await request.json();
      if (!event_type || !url) {
        return err("Missing event_type or url", 400);
      }

      const ua = request.headers.get("User-Agent") || "";
      await env.DB.prepare(
        "INSERT INTO organiser_analytics (event_type, url, user_agent) VALUES (?, ?, ?)"
      ).bind(event_type, url, ua).run();

      return json({ ok: true }, 201);
    }

    return err("Method not allowed", 405);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("analytics error", e);
    return err("Server error", 500);
  }
}
