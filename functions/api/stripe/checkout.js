import { requireAuth } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequestPost({ request, env }) {
  try {
    const user = await requireAuth(request, env);
    const { plan } = await request.json(); // "monthly" or "lifetime"

    const priceId = plan === "lifetime"
      ? env.STRIPE_PRICE_ID_LIFETIME
      : env.STRIPE_PRICE_ID_MONTHLY;

    if (!priceId) return err("Plan not available.", 400);

    const origin = new URL(request.url).origin;

    const params = new URLSearchParams({
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      mode: plan === "lifetime" ? "payment" : "subscription",
      success_url: `${origin}/organiser/`,
      cancel_url: `${origin}/organiser/subscribe.html`,
      "metadata[user_id]": String(user.uid),
      "customer_email": user.email,
    });

    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    if (!resp.ok) {
      const body = await resp.text();
      console.error("Stripe checkout error", resp.status, body);
      return err("Could not create checkout session.", 503);
    }

    const session = await resp.json();
    return json({ url: session.url });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("checkout error", e);
    return err("Server error", 500);
  }
}
