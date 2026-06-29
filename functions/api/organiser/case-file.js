import { requireAuth } from "../../_shared/auth.js";
import { encrypt, decrypt } from "../../_shared/crypto.js";
import { json, err } from "../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    const user = await requireAuth(request, env);
    const uid = user.uid;

    if (request.method === "GET") {
      const row = await env.DB.prepare(
        "SELECT data_enc FROM organiser_case_files WHERE user_id = ?"
      ).bind(uid).first();
      if (!row) return json({ data: null });
      const plain = await decrypt(row.data_enc, env.ENCRYPTION_KEY);
      return json({ data: JSON.parse(plain) });
    }

    if (request.method === "PUT") {
      const body = await request.json();
      const enc = await encrypt(JSON.stringify(body), env.ENCRYPTION_KEY);
      await env.DB.prepare(
        `INSERT INTO organiser_case_files (user_id, data_enc, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(user_id) DO UPDATE SET data_enc = excluded.data_enc, updated_at = excluded.updated_at`
      ).bind(uid, enc).run();
      return json({ ok: true });
    }

    return err("Method not allowed", 405);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("case-file error", e);
    return err("Server error", 500);
  }
}
