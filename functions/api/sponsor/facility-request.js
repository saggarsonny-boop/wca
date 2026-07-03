import { json, err } from "../../_shared/response.js";

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { facility_name, address, city, state, zip, security_level, requestor_name, requestor_email, notes } = body;

    if (!facility_name || !requestor_email) {
      return err("Facility name and your email are required.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestor_email)) {
      return err("Please enter a valid email address.");
    }

    const existingRequest = await env.DB.prepare(
      "SELECT id FROM facility_requests WHERE LOWER(facility_name) = LOWER(?) AND status = 'pending'"
    ).bind(facility_name).first();
    if (existingRequest) {
      return err("This facility has already been requested and is pending review.");
    }

    const existingFacility = await env.DB.prepare(
      "SELECT id FROM facilities WHERE LOWER(name) = LOWER(?)"
    ).bind(facility_name).first();
    if (existingFacility) {
      return err("This facility is already in our system.");
    }

    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO facility_requests
         (id, facility_name, address, city, state, zip, security_level, requestor_name, requestor_email, notes, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`
    ).bind(
      id, facility_name, address || "", city || "", state || "", zip || "",
      security_level || "unknown", requestor_name || "", requestor_email, notes || ""
    ).run();

    return json({ ok: true, message: "Facility request submitted for review.", request_id: id }, 201);
  } catch (e) {
    console.error("facility-request error", e);
    return err("Server error", 500);
  }
}
