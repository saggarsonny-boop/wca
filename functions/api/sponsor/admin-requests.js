import { requireSponsorAdmin } from "../../_shared/sponsor-admin-auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequestGet({ request, env }) {
  try {
    await requireSponsorAdmin(request, env);

    const { results } = await env.DB.prepare(
      "SELECT * FROM facility_requests WHERE status = 'pending' ORDER BY created_at ASC"
    ).all();

    return json({ requests: results });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("admin-requests GET error", e);
    return err("Server error", 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    await requireSponsorAdmin(request, env);

    const { request_id, action } = await request.json();
    if (!request_id || !["approve", "deny", "duplicate"].includes(action)) {
      return err("Invalid request.");
    }

    if (action === "approve") {
      const req = await env.DB.prepare(
        "SELECT * FROM facility_requests WHERE id = ?"
      ).bind(request_id).first();
      if (!req) return err("Request not found.", 404);

      const facilityId = req.facility_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

      await env.DB.prepare(
        `INSERT OR IGNORE INTO facilities (id, name, type, address, city, state, zip, security_level, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
      ).bind(
        facilityId, req.facility_name, req.security_level || "unknown",
        req.address || "", req.city || "", req.state || "", req.zip || "", req.security_level || "unknown"
      ).run();

      await env.DB.prepare(
        "UPDATE facility_requests SET status = 'approved', verified_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
      ).bind(request_id).run();

      return json({ ok: true, message: "Facility approved and added.", facility_id: facilityId });
    }

    const status = action === "deny" ? "denied" : "duplicate";
    await env.DB.prepare(
      "UPDATE facility_requests SET status = ?, verified_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
    ).bind(status, request_id).run();

    return json({ ok: true, message: action === "deny" ? "Request denied." : "Marked as duplicate." });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("admin-requests POST error", e);
    return err("Server error", 500);
  }
}
