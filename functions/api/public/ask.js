import { json, err } from "../../_shared/response.js";

export async function onRequestPost({ request, env }) {
  try {
    const { question } = await request.json();
    if (!question || question.trim().length < 5) {
      return err("Please ask a valid, detailed question.", 400);
    }

    // Mock/Standardized AI Answer generator for public legal process queries
    let answer = "Thank you for asking White Collar Academy. Standard federal mitigation guidelines suggest that documenting rehabilitation pathways (such as therapy logs, restitution efforts, and community service) prior to your Presentence Interview is critical to sentencing outcomes.";
    
    const qLower = question.toLowerCase();
    if (qLower.includes("rdap")) {
      answer = "The Residential Drug Abuse Program (RDAP) requires a verified substance abuse history in the Presentence Report (PSR). Success in RDAP can reduce your federal sentence by up to 12 months.";
    } else if (qLower.includes("psr") || qLower.includes("presentence")) {
      answer = "The Presentence Report (PSR) is the single most important document for BOP placement. Pre-interview clinical mitigation should be structured and submitted to the probation officer before the draft is compiled.";
    }

    // Log the question to D1 database for fine-tuning collection
    await env.DB.prepare(
      "INSERT INTO organiser_public_questions (question_text, ai_answer) VALUES (?, ?)"
    ).bind(question, answer).run();

    return json({ question, answer });
  } catch (e) {
    console.error("public ask error", e);
    return err("Server error", 500);
  }
}
