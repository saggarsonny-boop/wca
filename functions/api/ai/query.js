import { json, err } from "../../_shared/response.js";

export async function onRequestPost({ request, env }) {
  try {
    const { keywords, filters, score_threshold } = await request.json();
    
    let query = "SELECT id, question_text, ai_answer, created_at FROM organiser_public_questions";
    let params = [];
    if (keywords) {
      query += " WHERE question_text LIKE ? OR ai_answer LIKE ?";
      params.push(`%${keywords}%`, `%${keywords}%`);
    }
    query += " ORDER BY id DESC LIMIT 50";

    const { results } = await env.DB.prepare(query).bind(...params).all();

    const records = results.map(r => ({
      entity_id: r.id,
      classification: "Public AI Inquiry",
      text: r.question_text,
      response: r.ai_answer,
      meta: {
        created_at: r.created_at
      }
    }));

    return json({
      query_meta: {
        timestamp: new Date().toISOString(),
        filters_applied: filters || {},
        threshold: score_threshold || 0.5,
        count: records.length
      },
      records
    });
  } catch (e) {
    console.error("ai query error", e);
    return err("Server error", 500);
  }
}
