import { requireSponsorAdmin } from "../../_shared/sponsor-admin-auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    await requireSponsorAdmin(request, env);

    if (request.method === "GET") {
      const { results: sponsorships } = await env.DB.prepare(
        `SELECT s.id, s.sponsor_name, s.sponsor_email, s.sponsor_phone, s.amount_cents,
                s.book_count, s.status, s.message, s.is_anonymous, s.created_at, s.fulfilled_at,
                s.tracking_number, s.amazon_order_id, s.fulfillment_notes, s.shipped_at, s.estimated_delivery_date,
                f.name AS facility_name, f.address AS facility_address, f.city AS facility_city,
                f.state AS facility_state, f.zip AS facility_zip
         FROM sponsorships s
         LEFT JOIN facilities f ON f.id = s.facility_id
         ORDER BY s.created_at DESC`
      ).all();

      const stats = await env.DB.prepare(
        `SELECT
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
           SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid,
           SUM(CASE WHEN status = 'fulfilled' THEN 1 ELSE 0 END) AS fulfilled,
           SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) AS shipped,
           SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered
         FROM sponsorships`
      ).first();

      return json({ sponsorships, stats });
    }

    if (request.method === "PUT") {
      const { id, action, notes, tracking_number } = await request.json();
      if (!id || !["fulfill", "ship"].includes(action)) return err("Invalid request.");

      if (action === "fulfill") {
        await env.DB.prepare(
          `UPDATE sponsorships 
           SET status = 'fulfilled', 
               fulfilled_at = COALESCE(fulfilled_at, datetime('now')), 
               fulfillment_notes = ?, 
               updated_at = datetime('now') 
           WHERE id = ?`
        ).bind(notes || null, id).run();
      } else if (action === "ship") {
        if (!tracking_number) return err("Tracking number is required.");
        await env.DB.prepare(
          `UPDATE sponsorships 
           SET status = 'shipped', 
               shipped_at = COALESCE(shipped_at, datetime('now')), 
               tracking_number = ?, 
               updated_at = datetime('now') 
           WHERE id = ?`
        ).bind(tracking_number, id).run();
      }

      return json({ ok: true });
    }

    return err("Method not allowed", 405);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("sponsor admin error", e);
    return err("Server error", 500);
  }
}
