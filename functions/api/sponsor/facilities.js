import { requireSponsorAdmin } from "../../_shared/sponsor-admin-auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get("all") === "1";

    if (includeInactive) {
      // Full list including inactive rows — admin only.
      await requireSponsorAdmin(request, env);
      const { results } = await env.DB.prepare(
        "SELECT id, name, type, address, city, state, zip, security_level, is_active FROM facilities ORDER BY state, name"
      ).all();
      return json({ facilities: results });
    }

    const { results } = await env.DB.prepare(
      "SELECT id, name, type, city, state, region FROM facilities WHERE is_active = 1 ORDER BY state, name"
    ).all();
    return json({ facilities: results });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("facilities error:", e.message, "\n", e.stack);
    return err("Server error", 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    await requireSponsorAdmin(request, env);

    const { name, type, address, city, state, zip, security_level } = await request.json();
    if (!name || !type || !state) return err("Name, type, and state are required.");

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    await env.DB.prepare(
      `INSERT OR IGNORE INTO facilities (id, name, type, address, city, state, zip, security_level, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
    ).bind(id, name, type, address || "", city || "", state, zip || "", security_level || type).run();

    return json({ ok: true, id }, 201);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("facilities create error:", e.message, "\n", e.stack);
    return err("Server error", 500);
  }
}
