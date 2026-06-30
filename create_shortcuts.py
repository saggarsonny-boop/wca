import os

desktop_dir = r"C:\Users\Sonny Saggar\Desktop"
os.makedirs(desktop_dir, exist_ok=True)

shortcuts = {
    "WCA & BCD Cloudflare Web Traffic.url": "https://dash.cloudflare.com/31a6ab4af182c6db3d73cbce12807f23/whitecollaracademy.com/analytics/web-analytics",
    "WCA & BCD Stripe Sales & Subscriptions.url": "https://dashboard.stripe.com/",
    "WCA & BCD Resend Email Analytics.url": "https://resend.com/emails"
}

for name, url in shortcuts.items():
    path = os.path.join(desktop_dir, name)
    try:
        with open(path, "w") as f:
            f.write("[InternetShortcut]\n")
            f.write(f"URL={url}\n")
        print(f"Successfully created: {name}")
    except Exception as e:
        print(f"Failed to create shortcut {name}: {e}")
