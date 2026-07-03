import { requireSponsorAdmin } from "../../_shared/sponsor-admin-auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    await requireSponsorAdmin(request, env);

    if (request.method === "GET") {
      const { results: sponsorships } = await env.DB.prepare(
        `SELECT s.id, s.sponsor_name, s.sponsor_email, s.sponsor_phone, s.amount_cents,
                s.book_count, s.status, s.message, s.is_anonymous, s.created_at, s.fulfilled_at,
                f.name AS facility_name
         FROM sponsorships s
         LEFT JOIN facilities f ON f.id = s.facility_id
         ORDER BY s.created_at DESC`
      ).all();

      const stats = await env.DB.prepare(
        `SELECT
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
           SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid,
           SUM(CASE WHEN status = 'fulfilled' THEN 1 ELSE 0 END) AS fulfilled
         FROM sponsorships`
      ).first();

      return json({ sponsorships, stats });
    }

    if (request.method === "PUT") {
      const { id, action } = await request.json();
      if (!id || action !== "fulfill") return err("Invalid request.");

      await env.DB.prepare(
        "UPDATE sponsorships SET status = 'fulfilled', fulfilled_at = datetime('now'), updated_at = datetime('now') WHERE id = ? AND status = 'paid'"
      ).bind(id).run();

      return json({ ok: true });
    }

    return err("Method not allowed", 405);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("sponsor admin error", e);
    return err("Server error", 500);
  }
}
