import { requireAuth } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    const user = await requireAuth(request, env);
    const uid = user.uid;

    if (request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT id, label, date_val, note FROM organiser_dates WHERE user_id = ? ORDER BY date_val ASC"
      ).bind(uid).all();
      return json({ dates: results });
    }

    if (request.method === "POST") {
      const { label, date_val, note } = await request.json();
      if (!label || !date_val) return err("Label and date are required.");
      const r = await env.DB.prepare(
        "INSERT INTO organiser_dates (user_id, label, date_val, note, created_at) VALUES (?, ?, ?, ?, datetime('now')) RETURNING id"
      ).bind(uid, label, date_val, note || "").first();
      return json({ id: r.id }, 201);
    }

    if (request.method === "DELETE") {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");
      if (!id) return err("Missing id.");
      await env.DB.prepare("DELETE FROM organiser_dates WHERE id = ? AND user_id = ?").bind(id, uid).run();
      return json({ ok: true });
    }

    return err("Method not allowed", 405);
  } catch (e) {
    if (e instanceof Response) return e;
    return err("Server error", 500);
  }
}
