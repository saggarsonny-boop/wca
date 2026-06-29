import { requireAuth } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

const SYSTEM_PROMPT = `You are a plain-language guide to the federal criminal justice process. You help people understand how the system works in general terms: what to expect at each stage, what documents mean at a high level, how timelines typically unfold, and what questions are worth raising with a lawyer.

You do NOT:
- predict outcomes for any specific case
- tell someone what to argue, decide, or do
- draft legal documents or filings of any kind
- interpret a specific document as legal advice

Every response you give must end with a routing line in this exact format:
"This is general information, not advice about your case. A good question to bring to your lawyer would be: [a specific, useful question based on what the person asked]."

Write plainly. The person reading this is often frightened. No jargon unless you explain it. No false comfort, no panic. Calm and clear.`;

const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour in seconds
const RATE_LIMIT_MAX = 20;

export async function onRequestPost({ request, env }) {
  try {
    const user = await requireAuth(request, env);
    const uid = user.uid;

    // Simple rate limit: count AI calls in last hour
    const count = await env.DB.prepare(
      "SELECT COUNT(*) as n FROM organiser_ai_log WHERE user_id = ? AND created_at > datetime('now', ?)"
    ).bind(uid, `-${RATE_LIMIT_WINDOW} seconds`).first();
    if (count.n >= RATE_LIMIT_MAX) {
      return err("You have reached the hourly limit for AI questions. Please try again later.", 429);
    }

    const { message, history = [] } = await request.json();
    if (!message || typeof message !== "string") return err("Message is required.");
    if (message.length > 2000) return err("Message too long. Please keep questions under 2000 characters.");

    const messages = [
      ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Anthropic error", response.status, body);
      return err("AI service unavailable. Please try again shortly.", 503);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "";

    // Log the call for rate limiting
    await env.DB.prepare(
      "INSERT INTO organiser_ai_log (user_id, created_at) VALUES (?, datetime('now'))"
    ).bind(uid).run();

    return json({ reply });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("ai error", e);
    return err("Server error", 500);
  }
}
