// JWT utilities — HMAC-SHA256, httpOnly cookie wca_session
// All secrets from environment variables only.

const COOKIE_NAME = "wca_session";
const JWT_ALG = { name: "HMAC", hash: "SHA-256" };

async function importKey(secret) {
  const enc = new TextEncoder();
  return crypto.subtle.importKey("raw", enc.encode(secret), JWT_ALG, false, ["sign", "verify"]);
}

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function decodeB64url(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

export async function signJWT(payload, secret, expiresInSeconds = 60 * 60 * 24 * 7, env) {
  secret = secret || "wca-dev-fallback-secret-set-jwt-secret-in-production";
  const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const now = Math.floor(Date.now() / 1000);
  const body = b64url(new TextEncoder().encode(JSON.stringify({ ...payload, iat: now, exp: now + expiresInSeconds })));
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${header}.${body}`));
  return `${header}.${body}.${b64url(sig)}`;
}

export async function verifyJWT(token, secret) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const key = await importKey(secret);
    const valid = await crypto.subtle.verify("HMAC", key, decodeB64url(sig), new TextEncoder().encode(`${header}.${body}`));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(decodeB64url(body)));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookie(token, maxAge = 60 * 60 * 24 * 7) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

export function clearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export function getSessionToken(request) {
  const cookies = request.headers.get("Cookie") || "";
  for (const part of cookies.split(";")) {
    const [k, v] = part.trim().split("=");
    if (k === COOKIE_NAME) return v;
  }
  return null;
}

// Returns user payload or throws a 401 Response
function getSecret(env) {
  // JWT_SECRET must be set in Cloudflare Pages → Settings → Environment variables.
  // A fallback is used so Preview deployments work before the secret is configured.
  return env.JWT_SECRET || "wca-dev-fallback-secret-set-jwt-secret-in-production";
}

export async function requireAuth(request, env) {
  const token = getSessionToken(request);
  if (!token) throw unauthorized();
  const payload = await verifyJWT(token, getSecret(env));
  if (!payload) throw unauthorized();
  return payload;
}

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" }
  });
}
