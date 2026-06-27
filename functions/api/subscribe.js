/**
 * Cloudflare Pages Function: POST /api/subscribe
 *
 * Stores subscriber email addresses in Cloudflare D1 (SQLite).
 * The D1 database is bound to this function via wrangler.toml (see below).
 *
 * ── SETUP STEPS (one-time, before going live) ──────────────────────────
 *
 * 1. Create the D1 database:
 *      npx wrangler d1 create newphysician-subscribers
 *    Copy the database_id from the output into wrangler.toml.
 *
 * 2. Create the table:
 *      npx wrangler d1 execute newphysician-subscribers --remote \
 *        --command "CREATE TABLE IF NOT EXISTS subscribers (
 *          id INTEGER PRIMARY KEY AUTOINCREMENT,
 *          email TEXT UNIQUE NOT NULL,
 *          created_at TEXT DEFAULT (datetime('now'))
 *        );"
 *
 * 3. Deploy to Cloudflare Pages (the D1 binding is picked up automatically
 *    from wrangler.toml when you deploy via the Cloudflare dashboard or CLI).
 *
 * ── TO EXPORT YOUR LIST ────────────────────────────────────────────────
 *
 *    npx wrangler d1 execute newphysician-subscribers --remote \
 *      --command "SELECT email, created_at FROM subscribers ORDER BY created_at DESC;" \
 *      --json > subscribers.json
 *
 *    Or as CSV (pipe through any JSON-to-CSV tool, or query in the
 *    Cloudflare dashboard: Workers & Pages → D1 → your database → Console).
 *
 * ── TO ADD A THIRD-PARTY EMAIL PROVIDER LATER ─────────────────────────
 *
 *    After inserting into D1, call your provider's API. Examples are
 *    commented out below. Set the API key as an environment variable in
 *    the Cloudflare Pages dashboard (Settings → Environment variables).
 *    Never put keys in this file.
 *
 * ── ENVIRONMENT VARIABLES ──────────────────────────────────────────────
 *
 *    Required now:        none (D1 binding handles storage)
 *    Optional (provider): EMAIL_PROVIDER_API_KEY
 *                         EMAIL_LIST_ID
 *
 * ───────────────────────────────────────────────────────────────────────
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch (_) {
    return json({ error: "Invalid request." }, 400);
  }

  const email = (body.email || "").trim().toLowerCase();

  // Basic email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Please enter a valid email address." }, 400);
  }

  // ── D1 insert ──────────────────────────────────────────────────────
  // env.DB is the D1 binding declared in wrangler.toml.
  if (!env.DB) {
    // This happens if the D1 binding is not configured yet.
    console.error("D1 binding 'DB' is not configured.");
    return json({ error: "Signup is not available yet. Please try again later." }, 503);
  }

  try {
    await env.DB
      .prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)")
      .bind(email)
      .run();
  } catch (err) {
    console.error("D1 insert error:", err);
    return json({ error: "Could not save your email. Please try again." }, 500);
  }

  // ── Optional: forward to a third-party email provider ──────────────
  //
  // ConvertKit / Kit example:
  //   if (env.EMAIL_PROVIDER_API_KEY && env.EMAIL_LIST_ID) {
  //     await fetch(`https://api.convertkit.com/v3/forms/${env.EMAIL_LIST_ID}/subscribe`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         api_key: env.EMAIL_PROVIDER_API_KEY,
  //         email,
  //       }),
  //     });
  //   }
  //
  // Mailchimp example:
  //   if (env.EMAIL_PROVIDER_API_KEY && env.EMAIL_LIST_ID) {
  //     const dc = env.EMAIL_PROVIDER_API_KEY.split("-").pop(); // e.g. "us21"
  //     await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${env.EMAIL_LIST_ID}/members`, {
  //       method: "POST",
  //       headers: {
  //         "Authorization": `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ email_address: email, status: "subscribed" }),
  //     });
  //   }
  //
  // Beehiiv example:
  //   if (env.EMAIL_PROVIDER_API_KEY && env.EMAIL_LIST_ID) {
  //     await fetch(`https://api.beehiiv.com/v2/publications/${env.EMAIL_LIST_ID}/subscriptions`, {
  //       method: "POST",
  //       headers: {
  //         "Authorization": `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ email }),
  //     });
  //   }
  // ───────────────────────────────────────────────────────────────────

  return json({ ok: true }, 200);
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      // Prevent the response from being cached
      "Cache-Control": "no-store",
    },
  });
}
