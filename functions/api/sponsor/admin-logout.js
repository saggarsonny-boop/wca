import { clearAdminCookie } from "../../_shared/sponsor-admin-auth.js";
import { json } from "../../_shared/response.js";

export async function onRequestPost({ request }) {
  return json({ ok: true }, 200, { "Set-Cookie": clearAdminCookie(request) });
}
