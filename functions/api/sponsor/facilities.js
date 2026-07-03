import { json, err } from "../../_shared/response.js";

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, name, type, city, state, region FROM facilities WHERE is_active = 1 ORDER BY state, name"
    ).all();
    return json({ facilities: results });
  } catch (e) {
    console.error("facilities error", e);
    return err("Server error", 500);
  }
}
