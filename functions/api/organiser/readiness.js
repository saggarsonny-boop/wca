import { requireActiveSubscription } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    const user = await requireActiveSubscription(request, env);
    const uid = user.uid;

    // Fetch counts from different tables to build a real readiness score
    const db = env.DB;
    
    const datesRes = await db.prepare("SELECT COUNT(*) as count FROM organiser_dates WHERE user_id = ?").bind(uid).first();
    const docRes = await db.prepare("SELECT COUNT(*) as count FROM organiser_documents WHERE user_id = ?").bind(uid).first();
    const caseRes = await db.prepare("SELECT COUNT(*) as count FROM organiser_case_files WHERE user_id = ?").bind(uid).first();
    
    // Each completed block adds up to 10%
    let score = 10; // Base 10% for register
    if (datesRes && datesRes.count > 0) score += 30;
    if (docRes && docRes.count > 0) score += 30;
    if (caseRes && caseRes.count > 0) score += 30;
    
    if (score > 100) score = 100;
    
    return json({ readiness_score: score });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("readiness error", e);
    return err("Server error", 500);
  }
}
