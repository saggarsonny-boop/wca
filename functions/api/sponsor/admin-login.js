import { signJWT } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

const COOKIE_NAME = "wca_admin_session";

export async function onRequestPost({ request, env }) {
  try {
    if (!env.SPONSOR_ADMIN_PASSWORD) {
      return err("Admin panel is not configured.", 503);
    }

    const { password } = await request.json();
    if (!password || password !== env.SPONSOR_ADMIN_PASSWORD) {
      return err("Incorrect password.", 401);
    }

    const jwtSecret = env.JWT_SECRET || "wca-dev-fallback-secret-set-jwt-secret-in-production";
    const token = await signJWT({ role: "sponsor_admin" }, jwtSecret, 60 * 60 * 8); // 8 hour session

    const isLocal = request.url.includes("localhost") || request.url.includes("127.0.0.1");
    const secureFlag = isLocal ? "" : "; Secure";

    return json({ ok: true }, 200, {
      "Set-Cookie": `${COOKIE_NAME}=${token}; HttpOnly${secureFlag}; SameSite=Strict; Path=/; Max-Age=${60 * 60 * 8}`
    });
  } catch (e) {
    console.error("admin-login error", e);
    return err("Server error", 500);
  }
}
