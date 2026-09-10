import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import logoAsset from "@/assets/wild-haven-logo.png.asset.json";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/impact/$slug")({
  component: ImpactDetail,
  notFoundComponent: ImpactNotFound,
});

type Impact = {
  slug: string;
  amt: string;
  amount: number;
  title: string;
  desc: string;
  intro: string;
  goal: number;
  raised: number;
  highlights: { label: string; value: string }[];
  story: string[];
};

const IMPACTS: Record<string, Impact> = {
  "snow-leopard": {
    slug: "snow-leopard",
    amt: "₹1,000",
    amount: 1000,
    title: "Guard a Snow Leopard",
    desc: "Funds one week of high-altitude patrols in the Himalayas.",
    intro:
      "Snow leopards prowl the roof of the world — Ladakh, Spiti, and the high Himalayas. With fewer than 500 left in India, every patrol matters.",
    goal: 2500000,
    raised: 1685000,
    highlights: [
      { label: "Individuals remaining in India", value: "~500" },
      { label: "Range protected", value: "12,400 km²" },
      { label: "Guards funded this year", value: "38" },
    ],
    story: [
      "Your gift equips a two-person patrol team with thermal gear, GPS trackers, and camera traps for seven days across sub-zero passes above 4,000 m.",
      "Patrols document movement corridors, dismantle snares, and work with herding communities on livestock insurance so retaliation killings drop.",
      "Every rupee is tied to a route ID and reported back to donors quarterly.",
    ],
  },
  "elephant-rescue": {
    slug: "elephant-rescue",
    amt: "₹5,000",
    amount: 5000,
    title: "Rescue an Elephant",
    desc: "Provides emergency veterinary care and safe relocation.",
    intro:
      "India is home to 60% of the world's Asian elephants. Habitat loss and railway lines push them into deadly conflict with humans every week.",
    goal: 4000000,
    raised: 2280000,
    highlights: [
      { label: "Asian elephants in India", value: "~27,000" },
      { label: "Rescues last year", value: "48" },
      { label: "Corridors safeguarded", value: "14" },
    ],
    story: [
      "Your donation covers a veterinary rescue team on call 24/7 across Assam, Karnataka, and Kerala — the three states with the highest human-elephant conflict.",
      "Funds cover tranquilisers, transport trucks, and post-rescue rehabilitation at partner sanctuaries.",
      "We also work with railway authorities to install early-warning sensors on tracks that cut through elephant corridors.",
    ],
  },
  "restore-acre": {
    slug: "restore-acre",
    amt: "₹25,000",
    amount: 25000,
    title: "Restore One Acre",
    desc: "Reforests native trees and revives a degraded corridor.",
    intro:
      "A single restored acre can shelter over 200 species and reconnect fragmented forests. Restoration is our most permanent form of protection.",
    goal: 10000000,
    raised: 4120000,
    highlights: [
      { label: "Acres restored to date", value: "4,120" },
      { label: "Native saplings planted", value: "1.2M" },
      { label: "Community nurseries", value: "26" },
    ],
    story: [
      "Your gift plants ~400 native saplings — sal, teak, mahua, and rosewood — grown by local women's collectives in village nurseries.",
      "Each acre is geo-tagged, monitored for three years, and protected by community forest committees.",
      "Restored land also revives springs and streams, benefiting downstream farms and wildlife alike.",
    ],
  },
};

function formatINR(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function ImpactDetail() {
  const { slug } = Route.useParams();
  const impact = IMPACTS[slug];
  if (!impact) throw notFound();

  const pct = Math.min(100, Math.round((impact.raised / impact.goal) * 100));
  const remaining = Math.max(0, impact.goal - impact.raised);

  // Semi-circle gauge geometry
  const R = 140;
  const CX = 160;
  const CY = 160;
  const circumference = Math.PI * R; // half
  const dash = (pct / 100) * circumference;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border/60">
        <div className="container-page flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoAsset.url} alt="Wild Haven" className="h-12 w-12 rounded-full ring-1 ring-primary/20" />
            <div className="leading-tight">
              <div className="font-display text-lg text-primary">Wild Haven</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Wildlife Conservation</div>
            </div>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Back home</Link>
        </div>
      </header>

      <section className="py-16">
        <div className="container-page grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <div className="ornament-divider mb-6"><span className="text-xs uppercase tracking-[0.3em]">Where Your Gift Goes</span></div>
            <div className="text-primary font-display text-4xl">{impact.amt}</div>
            <h1 className="font-display text-5xl md:text-6xl mt-2 leading-tight">{impact.title}</h1>
            <p className="mt-6 text-lg text-muted-foreground">{impact.intro}</p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {impact.highlights.map((h) => (
                <div key={h.label} className="rounded-xl border border-border bg-card p-4">
                  <div className="font-display text-xl text-primary">{h.value}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{h.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-10 space-y-4 text-muted-foreground leading-relaxed">
              {impact.story.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <Link
              to="/payment"
              search={{ amount: impact.amount, frequency: "one-time" as const }}
              className="inline-block mt-8"
            >
              <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base">
                Give {impact.amt} now →
              </Button>
            </Link>
          </div>

          {/* Gauge */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-primary/20 bg-card p-8 shadow-xl shadow-primary/5">
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground text-center">Campaign Progress</div>

              <div className="relative mx-auto mt-4" style={{ width: 320, maxWidth: "100%" }}>
                <svg viewBox="0 0 320 180" className="w-full h-auto">
                  <path
                    d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="22"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="22"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circumference}`}
                    style={{ transition: "stroke-dasharray 800ms ease" }}
                  />
                </svg>
                <div className="absolute inset-x-0 bottom-4 text-center">
                  <div className="font-display text-5xl text-primary leading-none">{pct}%</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">funded</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-primary/5 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Raised</div>
                  <div className="font-display text-2xl text-primary mt-1">{formatINR(impact.raised)}</div>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Goal</div>
                  <div className="font-display text-2xl mt-1">{formatINR(impact.goal)}</div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-dashed border-primary/30 p-4 text-center">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Still needed</div>
                <div className="font-display text-xl mt-1">{formatINR(remaining)}</div>
              </div>

              <p className="mt-4 text-[11px] text-center text-muted-foreground">
                Progress updated weekly · 92% goes to programs
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {Object.values(IMPACTS)
                .filter((i) => i.slug !== impact.slug)
                .map((i) => (
                  <Link
                    key={i.slug}
                    to="/impact/$slug"
                    params={{ slug: i.slug }}
                    className="rounded-xl border border-border p-3 hover:border-primary/40 transition text-left"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{i.amt}</div>
                    <div className="text-sm font-medium mt-1 leading-tight">{i.title}</div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ImpactNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-3xl">Impact not found</h1>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">← Back home</Link>
      </div>
    </div>
  );
}
