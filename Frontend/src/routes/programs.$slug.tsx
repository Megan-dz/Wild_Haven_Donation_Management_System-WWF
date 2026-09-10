import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import logoAsset from "@/assets/wild-haven-logo.png.asset.json";
import { Button } from "@/components/ui/button";

type Program = {
  slug: string;
  title: string;
  tagline: string;
  intro: string;
  stats: { n: string; l: string }[];
  sections: { h: string; p: string }[];
  cta: string;
};

const PROGRAMS: Record<string, Program> = {
  "species-protection": {
    slug: "species-protection",
    title: "Species Protection",
    tagline: "Tigers, elephants, snow leopards & more.",
    intro:
      "India is home to 70% of the world's tigers, the largest wild Asian elephant population, and elusive snow leopards in the Himalayas. Wild Haven works to keep these species — and dozens of lesser-known ones — thriving in the wild.",
    stats: [
      { n: "3,682", l: "Tigers protected" },
      { n: "27,000", l: "Elephants monitored" },
      { n: "718", l: "Snow leopards tracked" },
    ],
    sections: [
      { h: "Frontline monitoring", p: "Camera traps, radio collars and field biologists give us a real-time picture of population health across 42 protected areas." },
      { h: "Rescue & rehabilitation", p: "We operate three species-specific rescue centres for tigers, elephants and pangolins — India's most trafficked mammal." },
      { h: "Genetic corridors", p: "We fund the science that keeps small populations connected, preventing inbreeding in fragmented reserves." },
    ],
    cta: "Fund species protection",
  },
  "habitat-restoration": {
    slug: "habitat-restoration",
    title: "Habitat Restoration",
    tagline: "Reviving forests, rivers and wetlands.",
    intro:
      "A tiger without a forest is a tiger without a future. We restore degraded landscapes — from Sundarbans mangroves to Western Ghats rainforests — so that wildlife has the space and food it needs to recover.",
    stats: [
      { n: "1.2M", l: "Acres under restoration" },
      { n: "4.8M", l: "Native trees planted" },
      { n: "31", l: "Wetlands revived" },
    ],
    sections: [
      { h: "Native reforestation", p: "We plant only indigenous species grown in community nurseries — no eucalyptus or acacia monocultures." },
      { h: "River & wetland revival", p: "Removing invasive species and reviving natural water flows brings back fish, birds and the predators that depend on them." },
      { h: "Corridor connectivity", p: "We secure narrow strips of land that link two forests, letting elephants and tigers move safely without entering villages." },
    ],
    cta: "Restore an acre",
  },
  "anti-poaching": {
    slug: "anti-poaching",
    title: "Anti-Poaching",
    tagline: "Training and equipping forest patrols.",
    intro:
      "Every rhino horn, tiger bone and pangolin scale on the black market began with a poacher in a forest. Our anti-poaching program trains, equips and supports the forest guards who stand between wildlife and organised crime.",
    stats: [
      { n: "1,240", l: "Guards trained" },
      { n: "312", l: "Snares removed / mo" },
      { n: "89%", l: "Drop in poaching" },
    ],
    sections: [
      { h: "Guard training", p: "SMART patrol methods, first aid, legal evidence handling and self-defence — taught in partnership with state forest departments." },
      { h: "Field equipment", p: "Boots, GPS units, night-vision, camping gear and insurance for guards who patrol some of the toughest terrain on earth." },
      { h: "Intelligence networks", p: "We fund informant networks and forensic labs that trace wildlife crime back to its kingpins, not just its foot soldiers." },
    ],
    cta: "Support a forest guard",
  },
  "community-programs": {
    slug: "community-programs",
    title: "Community Programs",
    tagline: "Livelihoods that reward coexistence.",
    intro:
      "Conservation only works when the people who live beside wild animals want them to survive. We help forest-fringe communities earn a better living from healthy ecosystems than they ever could from degraded ones.",
    stats: [
      { n: "184", l: "Villages partnered" },
      { n: "12,400", l: "Livelihoods created" },
      { n: "₹6.2Cr", l: "Community income" },
    ],
    sections: [
      { h: "Alternative livelihoods", p: "Bee-keeping, handloom weaving, eco-tourism guiding and organic farming — designed with each community, not for them." },
      { h: "Conflict mitigation", p: "Early-warning SMS networks, solar fencing and rapid-response teams reduce crop loss and retaliatory killing." },
      { h: "Education & health", p: "Scholarships for children of forest guards, mobile clinics and clean-cookstove programs that reduce firewood pressure." },
    ],
    cta: "Empower a community",
  },
};

export const Route = createFileRoute("/programs/$slug")({
  loader: ({ params }) => {
    const program = PROGRAMS[params.slug];
    if (!program) throw notFound();
    return { program };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Program not found — Wild Haven" }, { name: "robots", content: "noindex" }] };
    }
    const { program } = loaderData;
    return {
      meta: [
        { title: `${program.title} — Wild Haven` },
        { name: "description", content: program.tagline },
        { property: "og:title", content: `${program.title} — Wild Haven` },
        { property: "og:description", content: program.tagline },
      ],
    };
  },
  component: ProgramPage,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-4xl">Program not found</h1>
      <Link to="/" className="mt-6 inline-block text-primary hover:underline">← Back home</Link>
    </div>
  ),
});

function ProgramPage() {
  const { program } = Route.useLoaderData();

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
          <Link to="/">
            <Button variant="outline" className="rounded-full border-primary/30">← Back home</Button>
          </Link>
        </div>
      </header>

      <section className="py-20 border-b border-border/60">
        <div className="container-page max-w-3xl">
          <div className="ornament-divider mb-6"><span className="text-xs uppercase tracking-[0.3em]">Our Mission</span></div>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05]">{program.title}</h1>
          <p className="mt-4 text-lg text-primary">{program.tagline}</p>
          <p className="mt-8 text-muted-foreground text-lg leading-relaxed">{program.intro}</p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            {program.stats.map((s: { n: string; l: string }) => (
              <div key={s.l} className="rounded-xl border border-border bg-card p-5">
                <div className="font-display text-3xl text-primary">{s.n}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page max-w-3xl space-y-10">
          {program.sections.map((s: { h: string; p: string }) => (
            <div key={s.h}>
              <h2 className="font-display text-2xl text-primary">{s.h}</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">{s.p}</p>
            </div>
          ))}

          <div className="pt-8">
            <Link to="/" hash="donate">
              <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base">
                {program.cta} →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border/60 bg-secondary/40">
        <div className="container-page">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center mb-6">Explore other programs</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(PROGRAMS).filter((p) => p.slug !== program.slug).map((p) => (
              <Link
                key={p.slug}
                to="/programs/$slug"
                params={{ slug: p.slug }}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition"
              >
                <div className="font-display text-lg text-primary">{p.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{p.tagline}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
