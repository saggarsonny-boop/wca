import { json, err } from "../../_shared/response.js";

// Verifies Stripe webhook signature (HMAC-SHA256)
async function verifyStripeSignature(payload, sigHeader, secret) {
  const parts = sigHeader.split(",");
  const ts = parts.find(p => p.startsWith("t="))?.slice(2);
  const v1 = parts.find(p => p.startsWith("v1="))?.slice(3);
  if (!ts || !v1) return false;

  const signed = `${ts}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
  const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  return expected === v1;
}

export async function onRequestPost({ request, env }) {
  try {
    const payload = await request.text();
    const sig = request.headers.get("Stripe-Signature");
    if (!sig) return err("Missing signature", 400);

    const valid = await verifyStripeSignature(payload, sig, env.STRIPE_WEBHOOK_SECRET);
    if (!valid) return err("Invalid signature", 400);

    const event = JSON.parse(payload);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const customerId = session.customer;
      const mode = session.mode;

      if (!userId) return json({ received: true });

      if (mode === "subscription") {
        await env.DB.prepare(
          "UPDATE organiser_users SET subscription_status = 'active', stripe_customer_id = ?, updated_at = datetime('now') WHERE id = ?"
        ).bind(customerId, userId).run();
      } else if (mode === "payment") {
        await env.DB.prepare(
          "UPDATE organiser_users SET subscription_status = 'lifetime', stripe_customer_id = ?, updated_at = datetime('now') WHERE id = ?"
        ).bind(customerId, userId).run();
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      const customerId = sub.customer;
      await env.DB.prepare(
        "UPDATE organiser_users SET subscription_status = 'cancelled', updated_at = datetime('now') WHERE stripe_customer_id = ?"
      ).bind(customerId).run();
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object;
      const customerId = sub.customer;
      const status = sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "cancelled";
      await env.DB.prepare(
        "UPDATE organiser_users SET subscription_status = ?, updated_at = datetime('now') WHERE stripe_customer_id = ?"
      ).bind(status, customerId).run();
    }

    return json({ received: true });
  } catch (e) {
    console.error("webhook error", e);
    return err("Server error", 500);
  }
}
