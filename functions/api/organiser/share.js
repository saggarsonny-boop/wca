import { requireActiveSubscription } from "../../_shared/auth.js";
import { decrypt } from "../../_shared/crypto.js";
import { json, err } from "../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    const url = new URL(request.url);

    // GET route: access via share token OR retrieve logged-in user's token
    if (request.method === "GET") {
      const token = url.searchParams.get("token");
      if (!token) {
        try {
          const authedUser = await requireActiveSubscription(request, env);
          const dbUser = await env.DB.prepare(
            "SELECT share_token FROM organiser_users WHERE id = ?"
          ).bind(authedUser.uid).first();
          return json({ share_token: dbUser?.share_token || null });
        } catch (_) {
          return err("Token is required", 400);
        }
      }

      // 1. Fetch user by share_token
      const user = await env.DB.prepare(
        "SELECT id, email, subscription_status, trial_ends_at FROM organiser_users WHERE share_token = ?"
      ).bind(token).first();
      if (!user) return err("Invalid or expired share link", 404);

      // 2. Validate subscription/trial expiry status
      if (user.subscription_status === "trial") {
        const trialEnds = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
        if (trialEnds && trialEnds < new Date()) {
          return err("This workspace subscription has expired", 402);
        }
      } else if (user.subscription_status !== "active" && user.subscription_status !== "lifetime") {
        return err("This workspace subscription is inactive", 402);
      }

      // 3. Fetch case file (encrypted)
      const caseRow = await env.DB.prepare(
        "SELECT data_enc FROM organiser_case_files WHERE user_id = ?"
      ).bind(user.id).first();
      let caseData = null;
      if (caseRow) {
        const plain = await decrypt(caseRow.data_enc, env.ENCRYPTION_KEY);
        caseData = JSON.parse(plain);
      }

      // 4. Fetch dates list
      const dates = await env.DB.prepare(
        "SELECT label, date_val, note FROM organiser_dates WHERE user_id = ? ORDER BY date_val ASC"
      ).bind(user.id).all();

      return json({
        email: user.email,
        case_file: caseData,
        dates: dates.results || []
      });
    }

    // Authenticated routes below this point
    const user = await requireActiveSubscription(request, env);
    const uid = user.uid;

    // POST /api/organiser/share: Generate share token
    if (request.method === "POST") {
      const arr = new Uint8Array(24);
      crypto.getRandomValues(arr);
      const token = Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");

      await env.DB.prepare(
        "UPDATE organiser_users SET share_token = ? WHERE id = ?"
      ).bind(token, uid).run();

      return json({ share_token: token });
    }

    // DELETE /api/organiser/share: Revoke share token
    if (request.method === "DELETE") {
      await env.DB.prepare(
        "UPDATE organiser_users SET share_token = NULL WHERE id = ?"
      ).bind(uid).run();

      return json({ ok: true });
    }

    return err("Method not allowed", 405);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("share-endpoint error", e);
    return err("Server error", 500);
  }
}
