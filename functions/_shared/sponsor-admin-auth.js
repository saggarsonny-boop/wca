import { verifyJWT } from "./auth.js";

const COOKIE_NAME = "wca_admin_session";

function getAdminToken(request) {
  const cookies = request.headers.get("Cookie") || "";
  for (const part of cookies.split(";")) {
    const [k, v] = part.trim().split("=");
    if (k === COOKIE_NAME) return v;
  }
  return null;
}

// Throws a 401 Response if the request doesn't carry a valid sponsor-admin session.
export async function requireSponsorAdmin(request, env) {
  const token = getAdminToken(request);
  if (!token) throw unauthorized();
  const jwtSecret = env.JWT_SECRET || "wca-dev-fallback-secret-set-jwt-secret-in-production";
  const payload = await verifyJWT(token, jwtSecret);
  if (!payload || payload.role !== "sponsor_admin") throw unauthorized();
  return payload;
}

export function clearAdminCookie(request) {
  const isLocal = request && (request.url.includes("localhost") || request.url.includes("127.0.0.1"));
  const secureFlag = isLocal ? "" : "; Secure";
  return `${COOKIE_NAME}=; HttpOnly${secureFlag}; SameSite=Strict; Path=/; Max-Age=0`;
}

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" }
  });
}
