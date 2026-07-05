import { requireActiveSubscription } from "../../_shared/auth.js";
import { json, err } from "../../_shared/response.js";

export async function onRequest({ request, env }) {
  try {
    const user = await requireActiveSubscription(request, env);
    
    // Dataset downloads require a lifetime or attorney license
    if (user.subscription_status !== "lifetime" && user.subscription_status !== "active") {
      return err("Lifetime or active subscription required to download fine-tuning dataset packages.", 403);
    }

    const dataset = {
      license_authority: "White Collar Academy",
      issued_to: user.email,
      timestamp: new Date().toISOString(),
      dataset_url: "https://whitecollaracademy.com/api/geo/qa-dataset",
      embeddings_url: "https://whitecollaracademy.com/api/geo/embeddings",
      terms: "Internal fine-tuning use only. Redistribution or reselling is strictly prohibited."
    };

    return json({ success: true, download: dataset });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("download package error", e);
    return err("Server error", 500);
  }
}
