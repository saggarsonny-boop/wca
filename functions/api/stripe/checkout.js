import { requireAuth } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequestPost({ request, env }) {
  try {
    const user = await requireAuth(request, env);
    const { plan } = await request.json(); // "monthly" or "lifetime"

    const host = new URL(request.url).hostname;
    const isBCD = host.includes("bluecollardiner");

    let priceId = "";
    if (isBCD) {
      if (plan === "lifetime") {
        priceId = "yearly80usd";
      } else {
        priceId = "monthly8usd";
      }
    } else {
      if (plan === "lifetime") {
        priceId = env.STRIPE_PRICE_ID_LIFETIME;
      } else if (plan === "attorney") {
        priceId = env.STRIPE_PRICE_ID_ATTORNEY || "price_1TnrW3PIZtoQZOG13qoIxrSt";
      } else if (plan === "consulting") {
        priceId = env.STRIPE_PRICE_ID_CONSULTING || "price_1Tum6SPIZtoQZOG1I2dhwrdi";
      } else {
        priceId = env.STRIPE_PRICE_ID_MONTHLY;
      }
    }

    const country = request.headers.get("CF-IPCountry") || "US";
    if (!isBCD) {
      let priceKey = `STRIPE_PRICE_ID_${plan.toUpperCase()}`;
      const regionalPriceKey = `${priceKey}_${country.toUpperCase()}`;
      priceId = env[regionalPriceKey] || priceId;
    }

    if (!priceId) return err("Plan not available.", 400);

    const origin = new URL(request.url).origin;
    const originHost = new URL(request.url).hostname;

    const params = new URLSearchParams({
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      mode: isBCD ? "subscription" : (plan === "lifetime" ? "payment" : "subscription"),
      success_url: plan === "consulting" ? `${origin}/organiser/intake.html` : `${origin}/organiser/`,
      cancel_url: `${origin}/organiser/subscribe.html`,
      "metadata[user_id]": String(user.uid),
      "metadata[origin_domain]": originHost,
      "metadata[plan]": plan,
      "metadata[country]": country,
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
