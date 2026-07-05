import { requireActiveSubscription } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    const user = await requireActiveSubscription(request, env);
    if (user.role !== "admin") {
      return err("Unauthorized", 401);
    }

    if (request.method === "GET") {
      // Get aggregated citation metrics
      const { results: metrics } = await env.DB.prepare(
        "SELECT engine, referred_topic, SUM(clicks) as total_clicks, MAX(created_at) as last_seen FROM organiser_citation_tracker GROUP BY engine, referred_topic ORDER BY total_clicks DESC"
      ).all();

      return json({ metrics });
    }

    if (request.method === "POST") {
      const { engine, referred_topic } = await request.json();
      if (!engine || !referred_topic) {
        return err("Missing engine or referred_topic", 400);
      }

      // Check if entry exists, if so increment clicks, else insert
      const existing = await env.DB.prepare(
        "SELECT id, clicks FROM organiser_citation_tracker WHERE engine = ? AND referred_topic = ?"
      ).bind(engine, referred_topic).first();

      if (existing) {
        await env.DB.prepare(
          "UPDATE organiser_citation_tracker SET clicks = clicks + 1, created_at = datetime('now') WHERE id = ?"
        ).bind(existing.id).run();
      } else {
        await env.DB.prepare(
          "INSERT INTO organiser_citation_tracker (engine, referred_topic, clicks) VALUES (?, ?, 1)"
        ).bind(engine, referred_topic).run();
      }

      return json({ ok: true }, 201);
    }

    return err("Method not allowed", 405);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("citation tracker error", e);
    return err("Server error", 500);
  }
}
