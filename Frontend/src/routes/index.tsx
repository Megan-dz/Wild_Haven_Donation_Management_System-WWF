import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import logoAsset from "@/assets/wild-haven-logo.png.asset.json";
import heroImage from "@/assets/hero-wildlife.jpg";
import forestImage from "@/assets/impact-forest.jpg";
import elephantImage from "@/assets/impact-elephant.jpg";
import leopardImage from "@/assets/impact-leopard.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const Route = createFileRoute("/")({
  component: DonatePage,
});

const AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000];
const formatINR = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const IMPACT_CAMPAIGNS = [
  { name: "Forest protection", raised: 750000, goal: 1000000, detail: "Funds forest patrols, habitat monitoring, and safer wildlife corridors." },
  { name: "Elephant rescue", raised: 425000, goal: 600000, detail: "Supports emergency veterinary care and safe journeys home." },
  { name: "Snow leopard guardians", raised: 1690000, goal: 2500000, detail: "Keeps high-altitude patrol teams equipped across the Himalayas." },
];

const DONOR_STORIES = [
  { name: "Priya Sharma", location: "Mumbai", quote: "After visiting the Sundarbans, I wanted my monthly gift to keep protecting the place that changed how I see conservation." },
  { name: "Rajesh Patel", location: "Bengaluru", quote: "I support the snow leopard team because their work turns a distant crisis into something I can help sustain every month." },
  { name: "Anaya Verma", location: "Delhi", quote: "Wild Haven shows where the money goes. Seeing the work behind each campaign makes giving feel personal and accountable." },
];

const CONSERVATION_WINS = [
  { title: "10,000 native trees planted", detail: "A restored corridor now connects two forest patches in the Western Ghats.", image: forestImage, metric: "50 hectares restored", date: "August 2026" },
  { title: "47 tigers monitored safely", detail: "Community patrols recorded a full quarter without a poaching incident in a monitored reserve.", image: leopardImage, metric: "12 patrol teams equipped", date: "August 2026" },
  { title: "Elephant rescue completed", detail: "Veterinary teams relocated an injured elephant to a protected recovery habitat.", image: elephantImage, metric: "1 safe return home", date: "July 2026" },
];

function DonatePage() {
  const navigate = useNavigate();
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [amount, setAmount] = useState<number>(2500);
  const [custom, setCustom] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmed, setConfirmed] = useState<null | { amount: number; frequency: "one-time" | "monthly" }>(null);

  const finalAmount = custom ? Number(custom) : amount;
  const canDonate = Number.isFinite(finalAmount) && finalAmount >= 100;

  const handleDonate = () => {
    if (!canDonate) return;
    navigate({ to: "/payment", search: { amount: finalAmount, frequency } });
  };


  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border/60">
        <div className="container-page flex items-center justify-between py-3">
          <a href="#" className="flex items-center gap-3">
            <img src={logoAsset.url} alt="Wild Haven" className="h-12 w-12 rounded-full ring-1 ring-primary/20" />
            <div className="leading-tight">
              <div className="font-display text-lg text-primary">Wild Haven</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Wildlife Conservation</div>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#mission" className="hover:text-primary transition">Our Mission</a>
            <a href="#impact" className="hover:text-primary transition">Impact</a>
            <a href="#faq" className="hover:text-primary transition">FAQ</a>
          </nav>
          <div className="hidden md:block">
            <a href="#donate">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5">Donate</Button>
            </a>
          </div>
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex flex-col items-center justify-center gap-1.5 rounded-full border border-border p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="block h-0.5 w-5 bg-foreground" />
            <span className="block h-0.5 w-5 bg-foreground" />
            <span className="block h-0.5 w-5 bg-foreground" />
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/60 bg-background">
            <nav className="container-page flex flex-col gap-4 py-4 text-sm">
              <a href="#mission" className="hover:text-primary transition" onClick={() => setMobileMenuOpen(false)}>Our Mission</a>
              <a href="#impact" className="hover:text-primary transition" onClick={() => setMobileMenuOpen(false)}>Impact</a>
              <a href="#faq" className="hover:text-primary transition" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <a href="#donate" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">Donate</Button>
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Bengal tiger in golden forest" width={1600} height={1000} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        <div className="container-page relative grid lg:grid-cols-[minmax(540px,1.05fr)_minmax(420px,0.95fr)] gap-10 lg:gap-14 py-20 lg:py-28">
          <div className="max-w-xl self-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/70 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Every gift matters
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-foreground">
              Give a home to India's <em className="text-primary not-italic">wild</em>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              Poaching, habitat loss, and climate change threaten our forests, tigers,
              elephants and countless species. Your donation to Wild Haven funds patrols,
              rescues, and restoration — right where it's needed most.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#donate">
                <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base">
                  Donate Now
                </Button>
              </a>
              <a href="#mission">
                <Button size="lg" variant="outline" className="rounded-full border-primary/30 text-foreground hover:bg-primary/5 px-8 h-12 text-base">
                  Learn More
                </Button>
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                { n: "1.2M+", l: "Acres protected" },
                { n: "48", l: "Rescue missions" },
                { n: "12k", l: "Supporters" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-3xl text-primary">{s.n}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Donation card */}
          <div id="donate" className="lg:justify-self-end w-full max-w-[470px]">
            <div className="wildhaven-page-card overflow-hidden rounded-[2rem] border-primary/20 shadow-2xl shadow-primary/10">
              <div className="bg-primary text-primary-foreground px-6 py-5">
                <div className="text-xs uppercase tracking-[0.25em] opacity-80">Wild Haven Fund</div>
                <div className="font-display text-2xl mt-1">Make a Donation</div>
              </div>
              <div className="p-6 space-y-6">
                <RadioGroup
                  value={frequency}
                  onValueChange={(v) => setFrequency(v as "one-time" | "monthly")}
                  className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-full"
                >
                  {(["one-time", "monthly"] as const).map((f) => (
                    <Label
                      key={f}
                      htmlFor={f}
                      className={`flex items-center justify-center rounded-full py-2 text-sm cursor-pointer transition capitalize ${
                        frequency === f ? "bg-background text-primary shadow-sm font-medium" : "text-muted-foreground"
                      }`}
                    >
                      <RadioGroupItem value={f} id={f} className="sr-only" />
                      {f === "one-time" ? "One-time" : "Monthly"}
                    </Label>
                  ))}
                </RadioGroup>

                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Choose amount (₹)</div>
                  <div className="grid grid-cols-3 gap-2">
                    {AMOUNTS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => { setAmount(a); setCustom(""); }}
                        className={`rounded-lg border py-3 text-sm font-medium transition ${
                          !custom && amount === a
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        ₹{a.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom" className="text-xs uppercase tracking-wider text-muted-foreground">Or enter amount</Label>
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      id="custom"
                      type="number"
                      min="100"
                      placeholder="Custom amount"
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                      className="pl-7 h-11"
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-muted/70 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your gift</span>
                    <span className="font-semibold text-foreground">
                      ₹{Number.isFinite(finalAmount) ? finalAmount.toLocaleString("en-IN") : 0}
                      {frequency === "monthly" && <span className="text-muted-foreground text-xs">/mo</span>}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Eligible for 50% tax exemption under Section 80G of the Income Tax Act.
                  </div>
                </div>

                {confirmed ? (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center space-y-2">
                    <div className="font-display text-xl text-primary">Thank you! 🐾</div>
                    <p className="text-sm text-muted-foreground">
                      Your {confirmed.frequency === "monthly" ? "monthly" : "one-time"} gift of{" "}
                      <span className="font-semibold text-foreground">₹{confirmed.amount.toLocaleString("en-IN")}</span>{" "}
                      has been received. A receipt will be emailed to you.
                    </p>
                    <button
                      type="button"
                      onClick={() => setConfirmed(null)}
                      className="text-xs text-primary hover:underline"
                    >
                      Make another donation
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={handleDonate}
                    disabled={!canDonate}
                    className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-base disabled:opacity-50"
                  >
                    Continue to Donate →
                  </Button>
                )}
                <p className="text-[11px] text-center text-muted-foreground">
                  Secure payments · Cards, UPI & Net Banking accepted
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="py-24">
        <div className="container-page">
          <div className="ornament-divider mb-6"><span className="text-xs uppercase tracking-[0.3em]">Our Mission</span></div>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl md:text-5xl leading-tight">
                A living haven for the wild things worth saving.
              </h2>
              <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
                Wild Haven works across India's most fragile ecosystems — from the mangroves
                of the Sundarbans to the Himalayan foothills — protecting endangered species
                and empowering the communities who share their land.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We fund frontline forest guards, restore degraded habitats, and build
                long-term coexistence between people and wildlife. 92 paise of every rupee
                you give goes directly to conservation work on the ground.
              </p>
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {[
                  { t: "Species Protection", d: "Tigers, elephants, snow leopards & more.", slug: "species-protection" },
                  { t: "Habitat Restoration", d: "Reviving forests, rivers and wetlands.", slug: "habitat-restoration" },
                  { t: "Anti-Poaching", d: "Training and equipping forest patrols.", slug: "anti-poaching" },
                  { t: "Community Programs", d: "Livelihoods that reward coexistence.", slug: "community-programs" },
                ].map((f) => (
                  <Link
                    key={f.t}
                    to="/programs/$slug"
                    params={{ slug: f.slug }}
                    className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition block"
                  >
                    <div className="font-display text-lg text-primary flex items-center justify-between">
                      {f.t}
                      <span className="opacity-0 group-hover:opacity-100 transition text-base">→</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{f.d}</div>
                  </Link>
                ))}
              </div>

            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
                <img src={forestImage} alt="Lush forest canopy" width={1000} height={1200} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden md:block rounded-xl bg-primary text-primary-foreground p-5 shadow-xl max-w-[220px]">
                <div className="font-display text-3xl">92%</div>
                <div className="text-xs opacity-90 mt-1">of your donation goes to programs, not overhead.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact grid */}
      <section id="impact" className="py-24 bg-secondary/40">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto">
            <div className="ornament-divider mb-6"><span className="text-xs uppercase tracking-[0.3em]">Where Your Gift Goes</span></div>
            <h2 className="font-display text-4xl md:text-5xl">Real impact, real animals, real places.</h2>
            <p className="mt-4 text-muted-foreground">See how your contribution translates into protection on the ground.</p>
          </div>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[
              { slug: "snow-leopard", amt: "₹1,000", title: "Guard a Snow Leopard", desc: "Funds one week of high-altitude patrols in the Himalayas." },
              { slug: "elephant-rescue", amt: "₹5,000", title: "Rescue an Elephant", desc: "Provides emergency veterinary care and safe relocation." },
              { slug: "restore-acre", amt: "₹25,000", title: "Restore One Acre", desc: "Reforests native trees and revives a degraded corridor." },
            ].map((c, i) => (
              <Link
                key={c.title}
                to="/impact/$slug"
                params={{ slug: c.slug }}
                className="group rounded-2xl bg-card border border-border p-8 shadow-sm hover:shadow-xl hover:border-primary/30 transition block"
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">0{i + 1}</span>
                  <div className="text-primary font-display text-3xl">{c.amt}</div>
                </div>
                <h3 className="font-display text-xl mt-4">{c.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{c.desc}</p>
                <span className="mt-5 inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 gap-1 transition-all">
                  See progress & give →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Donation transparency */}
      <section className="py-24">
        <div className="container-page">
          <div className="max-w-2xl">
            <div className="ornament-divider mb-6"><span className="text-xs uppercase tracking-[0.3em]">Your gift in motion</span></div>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">See what supporters are moving forward.</h2>
            <p className="mt-4 text-muted-foreground">Campaign totals are updated as gifts are confirmed, so you can follow each conservation goal from first rupee to field result.</p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {IMPACT_CAMPAIGNS.map((campaign) => {
              const percentage = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100));
              return (
                <article key={campaign.name} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-2xl text-primary">{campaign.name}</h3>
                    <span className="font-display text-2xl text-primary">{percentage}%</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{campaign.detail}</p>
                  <div className="mt-6" role="progressbar" aria-label={`${campaign.name} funding progress`} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-3 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">{formatINR(campaign.raised)} raised</span>
                    <span className="text-muted-foreground">of {formatINR(campaign.goal)}</span>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-muted-foreground">Last updated September 13, 2026 · Figures reflect confirmed gifts.</p>
        </div>
      </section>

      {/* Donor stories */}
      <section className="border-y border-border/60 bg-secondary/30 py-24">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto">
            <div className="ornament-divider mb-6"><span className="text-xs uppercase tracking-[0.3em]">From the community</span></div>
            <h2 className="font-display text-4xl md:text-5xl">Why people choose to give.</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {DONOR_STORIES.map((story) => (
              <figure key={story.name} className="rounded-2xl border border-border bg-card p-7 shadow-sm">
                <blockquote className="font-display text-xl leading-relaxed text-primary">“{story.quote}”</blockquote>
                <figcaption className="mt-7 border-t border-border pt-4 text-sm">
                  <span className="block font-semibold text-primary">{story.name}</span>
                  <span className="text-muted-foreground">{story.location} · Wild Haven supporter</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Conservation wins */}
      <section className="py-24">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="ornament-divider mb-6"><span className="text-xs uppercase tracking-[0.3em]">Recent field notes</span></div>
              <h2 className="font-display text-4xl md:text-5xl">Good news made possible together.</h2>
              <p className="mt-4 text-muted-foreground">Every result below began with supporters choosing to fund practical conservation work.</p>
            </div>
            <a href="#donate" className="text-sm font-semibold text-primary hover:underline">Fund the next win →</a>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {CONSERVATION_WINS.map((win) => (
              <article key={win.title} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <img src={win.image} alt="" width={1000} height={700} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{win.date}</p>
                  <h3 className="mt-3 font-display text-2xl text-primary">{win.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{win.detail}</p>
                  <p className="mt-5 border-t border-border pt-4 text-sm font-semibold text-primary">{win.metric}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground px-8 py-16 md:p-20 text-center">
            <div className="absolute inset-0 opacity-10">
              <img src={heroImage} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="relative max-w-2xl mx-auto">
              <img src={logoAsset.url} alt="" className="h-16 w-16 rounded-full mx-auto ring-1 ring-primary-foreground/30 bg-cream" />
              <h2 className="font-display text-4xl md:text-5xl mt-6">Be the reason a tiger wakes up tomorrow.</h2>
              <p className="mt-5 opacity-90">Join thousands of donors keeping India wild.</p>
              <a href="#donate">
                <Button size="lg" className="mt-8 rounded-full bg-cream text-primary hover:bg-cream/90 px-10 h-12 text-base font-semibold">
                  Donate to Wild Haven
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="container-page max-w-3xl">
          <div className="ornament-divider mb-6"><span className="text-xs uppercase tracking-[0.3em]">FAQ</span></div>
          <h2 className="font-display text-4xl text-center">Questions donors ask</h2>
          <div className="mt-12 divide-y divide-border">
            {[
              { q: "Is my donation tax-deductible?", a: "Yes. Wild Haven is registered under Section 80G of the Income Tax Act, making donations eligible for 50% tax exemption in India." },
              { q: "How is my money used?", a: "92% of every rupee goes directly to conservation programs — patrols, rescues, restoration and community projects. The rest covers essential operations." },
              { q: "Can I cancel my monthly donation?", a: "Absolutely. You can pause, change or cancel your recurring gift at any time from your donor dashboard." },
              { q: "Do you accept international donations?", a: "Yes, we accept donations in multiple currencies. Please contact our team for foreign contribution compliance details." },
            ].map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="font-display text-lg">{f.q}</span>
                  <span className="text-primary text-2xl transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-secondary/30">
        <div className="container-page py-14 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <img src={logoAsset.url} alt="Wild Haven" className="h-12 w-12 rounded-full" />
              <div>
                <div className="font-display text-lg text-primary">Wild Haven</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Wildlife Conservation</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              A registered non-profit dedicated to protecting India's wildlife, forests, and the communities who live alongside them.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold mb-3">Explore</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#mission" className="hover:text-primary">Our Mission</a></li>
              <li><a href="#impact" className="hover:text-primary">Impact</a></li>
              <li><a href="#faq" className="hover:text-primary">FAQ</a></li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold mb-3">Contact</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="mailto:hello@wildhaven.org" className="hover:text-primary">hello@wildhaven.org</a></li>
              <li><a href="tel:+919876543210" className="hover:text-primary">+91 98765 43210</a></li>
              <li>New Delhi, India</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/60">
          <div className="container-page py-5 text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
            <div>© {new Date().getFullYear()} Wild Haven Foundation. All rights reserved.</div>
            <div>Registered 80G · 12A · CSR-1</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
