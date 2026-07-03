import { json, err } from "../../_shared/response.js";

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, name, description, amount_cents, book_count, features FROM sponsorship_tiers WHERE is_active = 1 ORDER BY amount_cents"
    ).all();
    return json({ tiers: results });
  } catch (e) {
    console.error("tiers error", e);
    return err("Server error", 500);
  }
}
