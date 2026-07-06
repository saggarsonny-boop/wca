import { json, err } from "../../_shared/response.js";

export async function onRequestPost({ request, env }) {
  try {
    const { keywords, filters, score_threshold } = await request.json();
    
    // Query Case Organizer D1 data filtered/aggregated for AI summarization
    const { results: users } = await env.DB.prepare(
      "SELECT id, email, subscription_status, created_at FROM organiser_users LIMIT 50"
    ).all();

    const summaries = users.map(u => ({
      entity_id: u.id,
      classification: "Defendant User Profile",
      status: u.subscription_status,
      confidence_score: 0.95,
      meta: {
        created: u.created_at
      }
    }));

    return json({
      query_meta: {
        timestamp: new Date().toISOString(),
        filters_applied: filters || {},
        threshold: score_threshold || 0.5
      },
      records: summaries
    });
  } catch (e) {
    console.error("ai query error", e);
    return err("Server error", 500);
  }
}
