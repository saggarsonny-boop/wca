// AES-GCM encryption for case file data at rest.
// Key from ENCRYPTION_KEY env var (base64-encoded 32-byte key).

async function importAESKey(base64Key) {
  const raw = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function encrypt(plaintext, base64Key) {
  const key = await importAESKey(base64Key);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc);
  // Store iv + ciphertext as base64, separated by a dot
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
  return `${ivB64}.${ctB64}`;
}

export async function decrypt(stored, base64Key) {
  const [ivB64, ctB64] = stored.split(".");
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const ct = Uint8Array.from(atob(ctB64), c => c.charCodeAt(0));
  const key = await importAESKey(base64Key);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(plaintext);
}

// PBKDF2 password hashing
export async function hashPassword(password, saltB64) {
  const salt = saltB64
    ? Uint8Array.from(atob(saltB64), c => c.charCodeAt(0))
    : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" },
    keyMaterial, 256
  );
  return {
    hash: btoa(String.fromCharCode(...new Uint8Array(bits))),
    salt: btoa(String.fromCharCode(...salt))
  };
}

export async function verifyPassword(password, storedHash, storedSalt) {
  const { hash } = await hashPassword(password, storedSalt);
  return hash === storedHash;
}
