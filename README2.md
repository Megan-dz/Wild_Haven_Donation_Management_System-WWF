![Wild Haven Logo](images/Wild_Haven_Logo.png)

# Wild Haven Website – Demo Walkthrough

## What it is
A donation website for a wildlife conservation NGO (demo brand "Wild Haven"), built using Lovable AI. It lets visitors learn about conservation work and donate money.

## Components & Features (in order of use)

**1. Navbar (Our Mission / Impact / FAQ)**
Clicking any of these doesn't open a new page — it **scrolls straight down** to that section on the same page (anchor navigation). No reloading, instant jump.

**2. Homepage Hero Section**
Big heading with wildlife photo background, a short mission line, and two buttons ("Donate Now" / "Learn More"). Below it are impact stats (1.2M+ acres protected, 48 rescue missions, 12k supporters) to build trust right away.

**3. Donation Widget (on homepage)**
Lets the user pick a preset amount (₹500–₹25,000) or type a custom one, and toggle between One-Time and Monthly. The "Your gift" summary **updates instantly** as the amount changes.

**4. Our Mission Section**
Explains what Wild Haven does and where (Sundarbans, Himalayas), plus fund transparency info (92 paise of every ₹1 goes directly to fieldwork).

**5. Impact Section**
Shows specific causes to donate to:
- Guard a Snow Leopard – ₹1,000
- Rescue an Elephant – ₹5,000
- Restore One Acre – ₹25,000

Clicking **"See progress & give →"** on any of these **opens a dedicated page for that cause**, showing a description, key stats, and a live progress bar (% funded, amount raised, amount still needed). This same thing happens for "Habitat Restoration" too — it opens its own page with its own stats (acres restored, trees planted, wetlands revived).

**6. FAQ Section**
Lists common questions (tax-deductibility, fund usage, cancelling monthly donations, international donations). Clicking a question **expands it** to reveal the answer, keeping the page clean until needed.

**7. Continue to Donate → Payment Page**
Clicking this carries the chosen amount over automatically (e.g., ₹2,500 shows up pre-filled) and opens the payment page with two options:
- **Card** – enter name, card number, expiry, CVV
- **UPI/QR** – switching to this tab **generates a QR code instantly**, along with a transaction ID and UPI handle, so the user can scan and pay with their phone

A note confirms it's a demo checkout — no real payment is processed.

## Summary of Interactive Features
- Scroll-to-section navigation
- Live-updating donation amount/summary
- One-Time vs Monthly toggle
- Clickable cause cards → open detailed sub-pages with progress tracking
- Expandable FAQ accordion
- Dual payment methods, with QR code generated on demand
- Real-time progress tracking (% funded, amount raised/needed) per cause
- Two payment options: card form and auto-generated UPI QR code
- Consistent branding (colors, fonts, images) across every page

## 5. Observations
- The interactivity (QR generation on payment, dedicated pages per cause) shows the site is functionally wired, not just a static design — Lovable generated real component logic and routing, not just visuals.
- The design choices (serif fonts, deep red/cream palette, wildlife imagery) are consistent and purposeful, giving it a premium NGO feel similar to real conservation orgs.
- Since it's a preview/demo build, actual payment processing and backend donation tracking (e.g., real-time updates to "raised" amounts) would need to be integrated separately for production use.
