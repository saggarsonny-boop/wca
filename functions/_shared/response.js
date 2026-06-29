export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extra }
  });
}

export function err(message, status = 400) {
  return json({ error: message }, status);
}
