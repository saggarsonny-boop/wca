import { requireAuth } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function onRequest({ request, env }) {
  try {
    const user = await requireAuth(request, env);
    const uid = user.uid;
    const url = new URL(request.url);

    if (request.method === "GET" && !url.searchParams.get("key")) {
      const { results } = await env.DB.prepare(
        "SELECT id, filename, size_bytes, r2_key, uploaded_at FROM organiser_documents WHERE user_id = ? ORDER BY uploaded_at DESC"
      ).bind(uid).all();
      return json({ documents: results });
    }

    // Download: return a short-lived presigned-like redirect
    if (request.method === "GET" && url.searchParams.get("key")) {
      const key = url.searchParams.get("key");
      const row = await env.DB.prepare(
        "SELECT r2_key FROM organiser_documents WHERE r2_key = ? AND user_id = ?"
      ).bind(key, uid).first();
      if (!row) return err("Not found", 404);
      const obj = await env.DOCUMENTS.get(row.r2_key);
      if (!obj) return err("File not found in storage", 404);
      return new Response(obj.body, {
        headers: {
          "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${key.split("/").pop()}"`
        }
      });
    }

    if (request.method === "POST") {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file) return err("No file provided.");
      if (file.size > MAX_FILE_SIZE) return err("File too large. Maximum 20 MB.");

      const ext = file.name.split(".").pop().toLowerCase();
      const r2Key = `${uid}/${crypto.randomUUID()}.${ext}`;
      await env.DOCUMENTS.put(r2Key, file.stream(), {
        httpMetadata: { contentType: file.type || "application/octet-stream" }
      });

      await env.DB.prepare(
        "INSERT INTO organiser_documents (user_id, filename, size_bytes, r2_key, uploaded_at) VALUES (?, ?, ?, ?, datetime('now'))"
      ).bind(uid, file.name, file.size, r2Key).run();

      return json({ ok: true, filename: file.name }, 201);
    }

    if (request.method === "DELETE") {
      const key = url.searchParams.get("key");
      if (!key) return err("Missing key.");
      const row = await env.DB.prepare(
        "SELECT r2_key FROM organiser_documents WHERE r2_key = ? AND user_id = ?"
      ).bind(key, uid).first();
      if (!row) return err("Not found", 404);
      await env.DOCUMENTS.delete(row.r2_key);
      await env.DB.prepare("DELETE FROM organiser_documents WHERE r2_key = ? AND user_id = ?").bind(key, uid).run();
      return json({ ok: true });
    }

    return err("Method not allowed", 405);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("documents error", e);
    return err("Server error", 500);
  }
}
