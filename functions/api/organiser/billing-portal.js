import { requireAuth } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequestGet({ request, env }) {
  try {
    const user = await requireAuth(request, env);
    
    // Get user stripe_customer_id
    const profile = await env.DB.prepare(
      "SELECT stripe_customer_id FROM organiser_users WHERE id = ?"
    ).bind(user.uid).first();

    if (!profile || !profile.stripe_customer_id) {
      // Fallback: Redirect to general Stripe billing login portal if no ID mapped
      // Sonny's Stripe Account custom portal configuration can serve as fallback
      return Response.redirect("https://billing.stripe.com/p/login/5kgaEZ7Qzd3rcw2", 302);
    }

    const stripeSecret = env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return err("Stripe credentials not configured", 500);
    }

    const returnUrl = `${new URL(request.url).origin}/organiser/billing.html`;

    // Create Stripe Customer Portal Session
    const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        customer: profile.stripe_customer_id,
        return_url: returnUrl
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        return Response.redirect(data.url, 302);
      }
    }

    // Default fallback redirect
    return Response.redirect("https://billing.stripe.com/p/login/5kgaEZ7Qzd3rcw2", 302);
  } catch (e) {
    if (e instanceof Response) return e;
    return err(e.message, 500);
  }
}
