import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type PointerEvent } from "react";
import logoAsset from "@/assets/wild-haven-logo.png.asset.json";
import heroImage from "@/assets/hero-wildlife.jpg";
import forestImage from "@/assets/impact-forest.jpg";
import elephantImage from "@/assets/impact-elephant.jpg";
import leopardImage from "@/assets/impact-leopard.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { wildlifeGalleryData } from "@/data/wildlifeGalleryData";
import { wildlifeQuizData } from "@/data/wildlifeQuizData";

export const Route = createFileRoute("/")({
  component: DonatePage,
});

const AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000];
const formatINR = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const MATCH_LIMIT = 5000;
const SUPPORTERS_THIS_MONTH = 2500;
const CONSERVATION_AREAS = [
  { id: "habitat", name: "Habitat restoration", detail: "Forests, wetlands, and wildlife corridors" },
  { id: "species", name: "Species protection", detail: "Patrols and protection for endangered animals" },
  { id: "communities", name: "Community programs", detail: "Livelihoods that help people and wildlife coexist" },
] as const;

const IMPACT_CAMPAIGNS = [
  { name: "Forest protection", raised: 750000, goal: 1000000, detail: "Funds forest patrols, habitat monitoring, and safer wildlife corridors." },
  { name: "Elephant rescue", raised: 425000, goal: 600000, detail: "Supports emergency veterinary care and safe journeys home." },
  { name: "Snow leopard guardians", raised: 1690000, goal: 2500000, detail: "Keeps high-altitude patrol teams equipped across the Himalayas." },
];

const IMPACT_SNAPSHOT = [
  { value: "92%", label: "of each rupee reaches conservation programs", detail: "From frontline patrols to habitat restoration." },
  { value: "2,500", label: "supporters donated this month", detail: "A growing community protecting wild places together." },
  { value: "50 ha", label: "of habitat restored this year", detail: "Native trees reconnecting wildlife corridors." },
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

const HABITAT_REGIONS = [
  {
    id: "western-ghats",
    name: "Western Ghats",
    x: "12%",
    y: "66%",
    climate: "Rain-fed forest belt",
    animals: ["Indian Elephant", "Malabar Giant Squirrel", "Hornbill"],
    habitat: "Dense forest corridors and river basins",
    status: "Habitat mosaic restored",
    impact: "+42% connected forest cover",
    detail: "Restoration teams are reconnecting forest corridors and reducing pressure on wild elephant routes.",
  },
  {
    id: "sundarbans",
    name: "Sundarbans Delta",
    x: "76%",
    y: "80%",
    climate: "Mangrove estuary",
    animals: ["Royal Bengal Tiger", "Saltwater Crocodile", "Fishing Cat"],
    habitat: "Tidal mangrove channels and marshlands",
    status: "Protection patrol active",
    impact: "+18% monitored estuary zone",
    detail: "Mangrove teams protect floodplain routes where tigers, crocodiles, and local communities depend on the same landscape.",
  },
  {
    id: "himalayas",
    name: "Himalayan Highlands",
    x: "61%",
    y: "20%",
    climate: "Alpine grassland",
    animals: ["Snow Leopard", "Blue Sheep", "Himalayan Tahr"],
    habitat: "High-altitude pasture and mountain ridge systems",
    status: "Pasture watch network",
    impact: "+31% field coverage",
    detail: "High-country guardians monitor fragile grazing routes and protect snow leopard territories.",
  },
  {
    id: "grassland",
    name: "Grassland Plains",
    x: "39%",
    y: "56%",
    climate: "Dry woodland and grassland",
    animals: ["Indian Bison", "Indian Wolf", "Grassland Bird Species"],
    habitat: "Open grassland and dry forest edge",
    status: "Fire prevention monitoring",
    impact: "+26% habitat recovery",
    detail: "Community wardens and restoration teams are restoring balance across grassland and scrub habitat.",
  },
];

const CONSERVATION_COMPARISONS = [
  {
    id: "forest-corridor",
    title: "Forest Corridor Recovery",
    location: "Western Ghats",
    beforeImage: heroImage,
    afterImage: forestImage,
    beforeLabel: "Before",
    afterLabel: "After",
    beforeCaption: "Fragmented forest edge",
    afterCaption: "Native trees reconnect the habitat",
    impact: "+42% habitat restored",
    metric: "50 hectares restored",
    detail: "Forest teams planted native species and repaired wildlife movement routes for elephants and big cats.",
  },
  {
    id: "elephant-safe-passages",
    title: "Elephant Passage Program",
    location: "Karnataka Forest Belt",
    beforeImage: elephantImage,
    afterImage: forestImage,
    beforeLabel: "Before",
    afterLabel: "After",
    beforeCaption: "High-risk crossing zone",
    afterCaption: "Protected movement corridor",
    impact: "+27% safer crossings",
    metric: "18 conflict-free corridors",
    detail: "Rescue teams, local rangers, and habitat monitoring reduced daily migration risk for elephants.",
  },
  {
    id: "snow-leopard-protection",
    title: "Snow Leopard Habitat Watch",
    location: "Himalayan Highlands",
    beforeImage: leopardImage,
    afterImage: heroImage,
    beforeLabel: "Before",
    afterLabel: "After",
    beforeCaption: "Unmonitored grazing routes",
    afterCaption: "Community-led protection zone",
    impact: "+31% field coverage",
    metric: "24 patrol routes active",
    detail: "Guardian partnerships help protect snow leopard territory with ranger support, local alerts, and community stewardship.",
  },
];

const CONSERVATION_TIMELINE = [
  {
    id: "1960s-forest-laws",
    year: "1960",
    title: "Wildlife Protection Era Begins",
    description: "India formalized laws and protected-area thinking that gave wildlife a stronger legal footing.",
    detail: "Early conservation planning created the foundation for protected forests and wildlife corridors.",
    image: forestImage,
    category: "Policy",
  },
  {
    id: "1970s-national-parks",
    year: "1972",
    title: "Project Tiger Launch",
    description: "A national commitment to tiger protection expanded ranger programs and habitat monitoring.",
    detail: "Tiger reserves became a major public model for national conservation planning.",
    image: leopardImage,
    category: "Species",
  },
  {
    id: "1980s-rescue",
    year: "1985",
    title: "Rescue Networks Expand",
    description: "Veterinary teams, field units, and local rescue pathways grew to handle injured wildlife more effectively.",
    detail: "Rapid response and rehabilitation systems improved for elephants, depredation events, and injured species.",
    image: elephantImage,
    category: "Rescue",
  },
  {
    id: "2000s-community",
    year: "2008",
    title: "Community Corridor Restoration",
    description: "Field teams started linking forest patches through community-led habitat recovery and planting programs.",
    detail: "The work connected conservation goals with local livelihoods and landscape management.",
    image: forestImage,
    category: "Habitat",
  },
  {
    id: "today-technology",
    year: "Today",
    title: "Data, Patrol, and Habitat Watch",
    description: "Modern conservation combines ranger reporting, forest science, and community stewardship for resilience.",
    detail: "Protection and restoration efforts now track habitat health, species movement, and local field outcomes.",
    image: heroImage,
    category: "Monitoring",
  },
];

const HOW_YOU_CAN_HELP = [
  {
    id: "donate",
    icon: "✦",
    title: "Donate",
    theme: "Direct field support",
    summary: "Fund patrols, habitat restoration, rescue kits, and community conservation programs.",
    detail: "A monthly or one-time contribution helps Wild Haven respond quickly to field needs across forests, grasslands, and river systems.",
    impact: "Supports urgent field action",
    steps: ["Choose a campaign", "Fund a protected area", "Track impact updates"],
    cta: "Make a gift",
  },
  {
    id: "volunteer",
    icon: "♞",
    title: "Volunteer",
    theme: "Field and community action",
    summary: "Join habitat restoration days, education events, and outreach efforts in your community.",
    detail: "Volunteer teams help with event planning, field drives, public awareness, and conservation education sessions.",
    impact: "Builds local conservation capacity",
    steps: ["Join a field day", "Help with events", "Attend a training"],
    cta: "Become a volunteer",
  },
  {
    id: "awareness",
    icon: "☄",
    title: "Spread Awareness",
    theme: "Public learning",
    summary: "Share stories, educate your network, and help people understand local conservation challenges.",
    detail: "Wildlife protection grows when communities understand the species, habitats, and people connected to conservation work.",
    impact: "Expands public understanding",
    steps: ["Share a field story", "Host a talk", "Join a campaign"],
    cta: "Start a conversation",
  },
  {
    id: "reduce-impact",
    icon: "♻",
    title: "Reduce Environmental Impact",
    theme: "Lower your footprint",
    summary: "Reduce waste, conserve water, avoid damaging products, and make gentler daily choices.",
    detail: "Lower-impact habits protect forest systems and reduce pressure on habitats across the landscape.",
    impact: "Lowers pressure on habitats",
    steps: ["Reduce single-use plastics", "Choose low-waste options", "Save water and energy"],
    cta: "Lower your footprint",
  },
  {
    id: "wildlife-friendly",
    icon: "✎",
    title: "Support Wildlife-Friendly Practices",
    theme: "Responsible everyday choices",
    summary: "Choose products and spaces that protect local biodiversity and support responsible land stewardship.",
    detail: "From responsible tourism to habitat-friendly products and community-led stewardship, your choices can help wildlife thrive.",
    impact: "Protects shared landscapes",
    steps: ["Choose ethical products", "Avoid wildlife trade", "Protect local habitats"],
    cta: "Make a wildlife-friendly choice",
  },
];

function highlightMatch(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return text;

  const parts = text.split(new RegExp(`(${escapeRegExp(trimmed)})`, "ig"));
  return parts.map((part, index) =>
    part.toLowerCase() === trimmed.toLowerCase() ? <mark key={`${part}-${index}`}>{part}</mark> : <span key={`${part}-${index}`}>{part}</span>,
  );
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function DonatePage() {
  const navigate = useNavigate();
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [amount, setAmount] = useState<number>(2500);
  const [custom, setCustom] = useState("");
  const [conservationArea, setConservationArea] = useState<(typeof CONSERVATION_AREAS)[number]["id"]>("habitat");
  const [lifetimeTotal] = useState(48500);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmed, setConfirmed] = useState<null | { amount: number; frequency: "one-time" | "monthly" }>(null);
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleryCategory, setGalleryCategory] = useState("All");
  const [gallerySort, setGallerySort] = useState("name");
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<(typeof wildlifeGalleryData)[number] | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedHabitat, setSelectedHabitat] = useState<string>("western-ghats");
  const [selectedTimeline, setSelectedTimeline] = useState<string>(CONSERVATION_TIMELINE[0].id);
  const [expandedHelpCard, setExpandedHelpCard] = useState<string>("donate");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [comparisonPositions, setComparisonPositions] = useState<Record<string, number>>({
    "forest-corridor": 54,
    "elephant-safe-passages": 44,
    "snow-leopard-protection": 61,
  });

  const selectedHabitatRegion = HABITAT_REGIONS.find((region) => region.id === selectedHabitat) ?? HABITAT_REGIONS[0];
  const selectedTimelineEntry = CONSERVATION_TIMELINE.find((entry) => entry.id === selectedTimeline) ?? CONSERVATION_TIMELINE[0];

  const searchIndex = useMemo(() => {
    const recordSection = (section: string, title: string, body: string, url: string, type = "content") => ({ section, title, body, url, type });

    const fromImpact = IMPACT_CAMPAIGNS.map((item) => recordSection("Impact", item.name, `${item.detail} ${item.name} campaign raised ${formatINR(item.raised)} of ${formatINR(item.goal)}.`, "#impact", "campaign"));
    const fromStories = DONOR_STORIES.map((item) => recordSection("Donor Stories", `${item.name} • ${item.location}`, item.quote, "#stories", "story"));
    const fromWins = CONSERVATION_WINS.map((item) => recordSection("Impact", item.title, `${item.detail} ${item.metric} ${item.date}.`, "#impact", "win"));
    const fromHabitat = HABITAT_REGIONS.map((item) => recordSection("Habitat Map", item.name, `${item.detail} ${item.impact}`.trim(), "#habitat-map", "habitat"));
    const fromTimeline = CONSERVATION_TIMELINE.map((item) => recordSection("Timeline", item.title, `${item.description} ${item.detail}`, "#timeline", "timeline"));
    const fromHelp = HOW_YOU_CAN_HELP.map((item) => recordSection("How You Can Help", item.title, `${item.summary} ${item.detail}`, "#help", "action"));
    const fromGallery = wildlifeGalleryData.map((item) => recordSection("Gallery", item.name, `${item.description} ${item.habitat} ${item.status} ${item.category}.`, "#gallery", "gallery"));
    const fromQuiz = wildlifeQuizData.map((item) => recordSection("Quiz", item.question, `${item.category} ${item.difficulty} ${item.explanation}`, "#quiz", "quiz"));

    return [
      recordSection("Mission", "Our Mission", "A living haven for the wild things worth saving. We protect forests, wildlife corridors, species and communities.", "#mission", "section"),
      recordSection("Impact", "Where Your Gift Goes", "See how donations fund forest patrols, elephant rescue and restoration work on the ground.", "#impact", "section"),
      recordSection("Donor Stories", "Donor Stories", "Community stories from supporters across India sharing why conservation gives them hope.", "#stories", "section"),
      recordSection("Gallery", "Wildlife Gallery", "A gallery of tiger, forest and elephant conservation stories captured by field photographers.", "#gallery", "section"),
      recordSection("Quiz", "Wildlife Conservation Quiz", "A short quiz that teaches how conservation, corridors and habitats connect.", "#quiz", "section"),
      recordSection("Timeline", "Conservation Timeline", "The history of wildlife protection, habitat restoration, rescue programs and community-led action.", "#timeline", "section"),
      recordSection("How You Can Help", "How You Can Help", "Ways to help through donations, volunteering, awareness, impact reduction and wildlife-friendly choices.", "#help", "section"),
      ...fromImpact,
      ...fromStories,
      ...fromWins,
      ...fromHabitat,
      ...fromTimeline,
      ...fromHelp,
      ...fromGallery,
      ...fromQuiz,
    ];
  }, []);

  const searchSuggestions = useMemo(() => {
    const suggestions = ["donate", "impact", "forest", "tiger", "elephant", "volunteer", "gallery", "habitat", "timeline", "wildlife"];
    const query = globalSearchQuery.trim().toLowerCase();
    if (!query) return suggestions.slice(0, 7);

    return suggestions.filter((word) => word.includes(query)).slice(0, 7);
  }, [globalSearchQuery]);

  const visibleSearchResults = useMemo(() => {
    const query = globalSearchQuery.trim().toLowerCase();
    if (!query) return [];

    return searchIndex.filter((result) => {
      const haystack = `${result.section} ${result.title} ${result.body} ${result.type} ${result.url}`.toLowerCase();
      return haystack.includes(query);
    }).slice(0, 8);
  }, [globalSearchQuery, searchIndex]);

  const clearSearch = () => setGlobalSearchQuery("");

  const galleryCategories = useMemo(() => {
    return ["All", ...Array.from(new Set(wildlifeGalleryData.map((item) => item.category)))];
  }, []);

  const visibleGalleryData = useMemo(() => {
    const search = gallerySearch.trim().toLowerCase();
    const filtered = wildlifeGalleryData.filter((item) => {
      const matchesCategory = galleryCategory === "All" || item.category === galleryCategory;
      const haystack = `${item.name} ${item.description} ${item.habitat} ${item.status} ${item.category}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      return matchesCategory && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (gallerySort === "name-desc") return b.name.localeCompare(a.name);
      if (gallerySort === "status") return a.status.localeCompare(b.status) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
  }, [galleryCategory, gallerySearch, gallerySort]);

  const galleryImageMap: Record<string, string> = {
    "hero-wildlife.jpg": heroImage,
    "impact-forest.jpg": forestImage,
    "impact-elephant.jpg": elephantImage,
    "impact-leopard.jpg": leopardImage,
  };

  useEffect(() => {
    const timelineItems = Array.from(document.querySelectorAll<HTMLElement>(".wildhaven-timeline-item"));
    if (!timelineItems.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    }, { threshold: 0.2 });

    timelineItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const updateComparisonPosition = (id: string, event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const percent = Math.min(Math.max(((event.clientX - rect.left) / rect.width) * 100, 0), 100);
    setComparisonPositions((current) => ({ ...current, [id]: percent }));
  };

  const currentQuestion = wildlifeQuizData[questionIndex];
  const quizProgress = ((questionIndex + (showQuizResult ? 1 : 0)) / wildlifeQuizData.length) * 100;

  const handleQuizSelect = (answer: string) => {
    if (quizAnswered) return;
    setSelectedAnswer(answer);
    setQuizAnswered(true);
    if (answer === currentQuestion.correctAnswer) {
      setQuizScore((score) => score + 1);
    }
  };

  const handleQuizNext = () => {
    if (questionIndex < wildlifeQuizData.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setSelectedAnswer(null);
      setQuizAnswered(false);
      return;
    }
    setShowQuizResult(true);
  };

  const restartQuiz = () => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setShowQuizResult(false);
    setQuizAnswered(false);
  };

  const finalAmount = custom ? Number(custom) : amount;
  const canDonate = Number.isFinite(finalAmount) && finalAmount >= 100;
  const matchedAmount = canDonate ? Math.min(finalAmount, MATCH_LIMIT) : 0;
  const totalImpact = finalAmount + matchedAmount;
  const selectedArea = CONSERVATION_AREAS.find((area) => area.id === conservationArea) ?? CONSERVATION_AREAS[0];

  const handleDonate = () => {
    if (!canDonate) return;
    navigate({ to: "/payment", search: { amount: finalAmount, frequency, conservationArea, matchedAmount } });
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
            <a href="#impact-snapshot" className="hover:text-primary transition">Your Impact</a>
            <a href="#faq" className="hover:text-primary transition">FAQ</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <div className="wildhaven-global-search-wrap">
              <span className="wildhaven-global-search-icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                size={26}
                value={globalSearchQuery}
                aria-label="Search Wild Haven content"
                placeholder="Search Wild Haven"
                className="wildhaven-global-search-input"
                onFocus={() => {}}
                onChange={(event) => setGlobalSearchQuery(event.target.value)}
              />
              {globalSearchQuery && (
                <button type="button" className="wildhaven-global-search-clear" aria-label="Clear search" onClick={clearSearch}>×</button>
              )}
            </div>
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
          <div className="mobile-drawer-overlay md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <aside className="mobile-drawer md:hidden">
              <div className="flex items-center justify-between">
                <div className="font-display text-xl text-primary">Wild Haven</div>
                <button className="mobile-drawer-close" type="button" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}>×</button>
              </div>
              <nav className="flex flex-col gap-3 mt-6 text-sm">
                <a className="mobile-drawer-link" href="#mission" onClick={() => setMobileMenuOpen(false)}>Our Mission</a>
                <a className="mobile-drawer-link" href="#impact-snapshot" onClick={() => setMobileMenuOpen(false)}>Your Impact</a>
                <a className="mobile-drawer-link" href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                <a className="mobile-drawer-link" href="#donate" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">Donate</Button>
                </a>
              </nav>
            </aside>
          </div>
        )}
      </header>

      {/* Global Search Panel */}
      <section className="wildhaven-global-search-section">
        <div className="container-page">
          <div className="wildhaven-global-search-panel">
            <div className="wildhaven-global-search-top">
              <div>
                <span className="wildhaven-global-search-kicker">Explore Wild Haven</span>
                <h2 className="wildhaven-global-search-title">Find conservation stories, programs and impact.</h2>
              </div>
              <button type="button" className="wildhaven-global-search-clear-panel" onClick={clearSearch}>Clear search</button>
            </div>

            <div className="wildhaven-global-search-input-bar">
              <span className="wildhaven-global-search-input-icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                className="wildhaven-global-search-text-input"
                placeholder="Search mission, habitat, gallery, volunteer, elephant, tiger..."
                value={globalSearchQuery}
                onChange={(event) => setGlobalSearchQuery(event.target.value)}
              />
              {globalSearchQuery && (
                <button type="button" className="wildhaven-global-search-chip-button" onClick={clearSearch}>Clear</button>
              )}
            </div>

            <div className="wildhaven-search-suggestions">
              {searchSuggestions.map((suggestion) => (
                <button type="button" key={suggestion} className="wildhaven-search-suggestion" onClick={() => setGlobalSearchQuery(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>

            {globalSearchQuery.trim() ? (
              visibleSearchResults.length > 0 ? (
                <div className="wildhaven-search-results-grid">
                  {visibleSearchResults.map((result, idx) => (
                    <a key={`${result.title}-${idx}`} className="wildhaven-search-result" href={result.url}>
                      <span className="wildhaven-search-result-type">{result.type}</span>
                      <span className="wildhaven-search-result-section">{result.section}</span>
                      <span className="wildhaven-search-result-title">{highlightMatch(result.title, globalSearchQuery)}</span>
                      <span className="wildhaven-search-result-body">{highlightMatch(result.body, globalSearchQuery)}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="wildhaven-search-empty">
                  <span className="wildhaven-search-empty-icon">✧</span>
                  <div>
                    <div className="wildhaven-search-empty-title">No matching content found</div>
                    <div className="wildhaven-search-empty-copy">Try searching for habitat, forest, tiger, volunteer, or impact.</div>
                  </div>
                </div>
              )
            ) : (
              <div className="wildhaven-search-results-grid">
                {searchIndex.slice(0, 6).map((result, idx) => (
                  <a key={`${result.title}-${idx}`} className="wildhaven-search-result" href={result.url}>
                    <span className="wildhaven-search-result-type">{result.type}</span>
                    <span className="wildhaven-search-result-section">{result.section}</span>
                    <span className="wildhaven-search-result-title">{result.title}</span>
                    <span className="wildhaven-search-result-body">{result.body}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

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
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 max-w-md">
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

                <div>
                  <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Choose where your gift helps</div>
                  <div className="space-y-2">
                    {CONSERVATION_AREAS.map((area) => (
                      <label key={area.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${conservationArea === area.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                        <input
                          type="radio"
                          name="conservation-area"
                          value={area.id}
                          checked={conservationArea === area.id}
                          onChange={() => setConservationArea(area.id)}
                          className="mt-1 accent-primary"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-foreground">{area.name}</span>
                          <span className="block text-xs text-muted-foreground">{area.detail}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-accent/40 bg-accent/10 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-primary">Matching challenge</div>
                      <p className="mt-1 text-sm text-muted-foreground">A field partner matches every gift up to {formatINR(MATCH_LIMIT)} this month.</p>
                    </div>
                    <span className="whitespace-nowrap font-display text-xl text-primary">+{formatINR(matchedAmount)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-accent/20 pt-3 text-sm">
                    <span className="text-muted-foreground">Total field impact</span>
                    <span className="font-semibold text-primary">{formatINR(totalImpact)}</span>
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
                  <div className="mt-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{SUPPORTERS_THIS_MONTH.toLocaleString("en-IN")} supporters</span> donated this month.
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Your giving journey</div>
                      <p className="mt-1 text-sm text-muted-foreground">Lifetime contributions tracked for this supporter account.</p>
                    </div>
                    <span className="font-display text-xl text-primary">{formatINR(lifetimeTotal)}</span>
                  </div>
                  {frequency === "monthly" && (
                    <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                      With this monthly gift, your projected total after one year is <span className="font-semibold text-foreground">{formatINR(lifetimeTotal + finalAmount * 12)}</span>.
                    </p>
                  )}
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

      {/* Impact snapshot */}
      <section id="impact-snapshot" className="border-y border-border/60 bg-secondary/35 py-12">
        <div className="container-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <div className="text-xs uppercase tracking-[0.25em] text-primary">Your impact at a glance</div>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">A clear path from your gift to the field.</h2>
            </div>
            <a href="#impact" className="text-sm font-semibold text-primary hover:underline">Explore campaign progress →</a>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {IMPACT_SNAPSHOT.map((stat) => (
              <article key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="font-display text-3xl text-primary">{stat.value}</div>
                <h3 className="mt-2 text-sm font-semibold text-foreground">{stat.label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.detail}</p>
              </article>
            ))}
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

      {/* Before-and-after conservation sliders */}
      <section id="transformations" className="py-24 bg-secondary/30">
        <div className="container-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="ornament-divider mb-6"><span className="text-xs uppercase tracking-[0.3em]">Conservation transformation</span></div>
              <h2 className="font-display text-4xl md:text-5xl leading-tight">From pressure to protection.</h2>
              <p className="mt-4 text-muted-foreground">These field comparisons show how donor-funded restoration, ranger support, and habitat care create visible changes over time.</p>
            </div>
            <a href="#donate" className="text-sm font-semibold text-primary hover:underline">Support a corridor →</a>
          </div>

          <div className="wildhaven-comparison-grid mt-10">
            {CONSERVATION_COMPARISONS.map((item) => {
              const position = comparisonPositions[item.id];
              return (
                <article className="wildhaven-comparison-card" key={item.id}>
                  <div className="wildhaven-comparison-frame" onPointerDown={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      const percent = Math.min(Math.max(((event.clientX - rect.left) / rect.width) * 100, 0), 100);
                      setComparisonPositions((current) => ({ ...current, [item.id]: percent }));
                    }}>
                    <div className="wildhaven-comparison-image-layer wildhaven-comparison-before">
                      <img src={item.beforeImage} alt="" className="wildhaven-comparison-image" />
                      <span className="wildhaven-comparison-label before">{item.beforeLabel}</span>
                      <span className="wildhaven-comparison-caption before">{item.beforeCaption}</span>
                    </div>
                    <div className="wildhaven-comparison-image-layer wildhaven-comparison-after" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
                      <img src={item.afterImage} alt="" className="wildhaven-comparison-image" />
                      <span className="wildhaven-comparison-label after">{item.afterLabel}</span>
                      <span className="wildhaven-comparison-caption after">{item.afterCaption}</span>
                    </div>
                    <div className="wildhaven-comparison-divider" style={{ left: `${position}%` }}>
                      <span className="wildhaven-comparison-divider-line" />
                      <span className="wildhaven-comparison-handle">↔</span>
                    </div>
                    <div className="wildhaven-comparison-tint" style={{ left: `${position}%` }} />
                  </div>

                  <div className="wildhaven-comparison-content">
                    <div className="wildhaven-comparison-top">
                      <span className="wildhaven-comparison-location">{item.location}</span>
                      <span className="wildhaven-comparison-impact">{item.impact}</span>
                    </div>
                    <h3 className="font-display text-2xl text-primary mt-4">{item.title}</h3>
                    <p className="wildhaven-comparison-detail">{item.detail}</p>
                    <div className="wildhaven-comparison-metric">
                      <span className="wildhaven-comparison-metric-label">Field progress</span>
                      <span className="wildhaven-comparison-metric-value">{item.metric}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Before-and-after conservation sliders */}
      <section id="transformations" className="py-24 bg-secondary/30">
        <div className="container-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="ornament-divider mb-6"><span className="text-xs uppercase tracking-[0.3em]">Conservation transformation</span></div>
              <h2 className="font-display text-4xl md:text-5xl leading-tight">From pressure to protection.</h2>
              <p className="mt-4 text-muted-foreground">These field comparisons show how donor-funded restoration, ranger support, and habitat care create visible changes over time.</p>
            </div>
            <a href="#donate" className="text-sm font-semibold text-primary hover:underline">Support a corridor →</a>
          </div>

          <div className="wildhaven-comparison-grid mt-10">
            {CONSERVATION_COMPARISONS.map((item) => {
              const position = comparisonPositions[item.id];
              return (
                <article className="wildhaven-comparison-card" key={item.id}>
                  <div className="wildhaven-comparison-frame" onPointerDown={(event) => updateComparisonPosition(item.id, event)}>
                    <div className="wildhaven-comparison-image-layer wildhaven-comparison-before">
                      <img src={item.beforeImage} alt="" className="wildhaven-comparison-image" />
                      <span className="wildhaven-comparison-label before">{item.beforeLabel}</span>
                      <span className="wildhaven-comparison-caption before">{item.beforeCaption}</span>
                    </div>
                    <div className="wildhaven-comparison-image-layer wildhaven-comparison-after" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
                      <img src={item.afterImage} alt="" className="wildhaven-comparison-image" />
                      <span className="wildhaven-comparison-label after">{item.afterLabel}</span>
                      <span className="wildhaven-comparison-caption after">{item.afterCaption}</span>
                    </div>
                    <div className="wildhaven-comparison-divider" style={{ left: `${position}%` }}>
                      <span className="wildhaven-comparison-divider-line" />
                      <span className="wildhaven-comparison-handle">↔</span>
                    </div>
                    <div className="wildhaven-comparison-tint" style={{ left: `${position}%` }} />
                  </div>

                  <div className="wildhaven-comparison-content">
                    <div className="wildhaven-comparison-top">
                      <span className="wildhaven-comparison-location">{item.location}</span>
                      <span className="wildhaven-comparison-impact">{item.impact}</span>
                    </div>
                    <h3 className="font-display text-2xl text-primary mt-4">{item.title}</h3>
                    <p className="wildhaven-comparison-detail">{item.detail}</p>
                    <div className="wildhaven-comparison-metric">
                      <span className="wildhaven-comparison-metric-label">Field progress</span>
                      <span className="wildhaven-comparison-metric-value">{item.metric}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Wildlife Habitat Map */}
      <section id="habitat-map" className="py-24">
        <div className="container-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="ornament-divider mb-6"><span className="text-xs uppercase tracking-[0.3em]">Habitat map</span></div>
              <h2 className="font-display text-4xl md:text-5xl leading-tight">Across every living landscape.</h2>
              <p className="mt-4 text-muted-foreground">Wild Haven supports species and ecosystems across India’s most threatened habitats.</p>
            </div>
            <div className="text-sm font-semibold text-primary uppercase tracking-[0.12em]">Field regions 04</div>
          </div>

          <div className="wildhaven-habitat-map-wrapper">
            <div className="wildhaven-habitat-map-panel">
              <div className="wildhaven-habitat-map">
                <div className="wildhaven-map-river river-one" />
                <div className="wildhaven-map-river river-two" />
                <div className="wildhaven-map-scrub scrub-one" />
                <div className="wildhaven-map-scrub scrub-two" />

                {HABITAT_REGIONS.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    className={`wildhaven-map-region ${region.id === selectedHabitat ? "active" : ""}`}
                    style={{ left: region.x, top: region.y }}
                    aria-label={`Show ${region.name}`}
                    aria-pressed={region.id === selectedHabitat}
                    onClick={() => setSelectedHabitat(region.id)}
                  >
                    <span className="wildhaven-map-region-pin">
                      <span className="wildhaven-map-region-dot" />
                    </span>
                    <span className="wildhaven-map-region-label">{region.name}</span>
                  </button>
                ))}

                <div className="wildhaven-map-gridline grid-one" />
                <div className="wildhaven-map-gridline grid-two" />
                <div className="wildhaven-map-gridline grid-three" />
              </div>
            </div>

            <aside className="wildhaven-habitat-info-card">
              <div className="wildhaven-habitat-info-top">
                <span className="wildhaven-habitat-kicker">{selectedHabitatRegion.climate}</span>
                <span className="wildhaven-habitat-status">{selectedHabitatRegion.status}</span>
              </div>
              <div className="wildhaven-habitat-name-wrap">
                <h3 className="font-display text-3xl text-primary">{selectedHabitatRegion.name}</h3>
                <span className="wildhaven-habitat-impact">{selectedHabitatRegion.impact}</span>
              </div>
              <p className="wildhaven-habitat-detail">{selectedHabitatRegion.detail}</p>
              <div className="wildhaven-habitat-meta-row">
                <span className="wildhaven-habitat-meta-label">Habitat</span>
                <span className="wildhaven-habitat-meta-value">{selectedHabitatRegion.habitat}</span>
              </div>
              <div className="wildhaven-habitat-animals">
                <span className="wildhaven-habitat-meta-label">Species watched</span>
                <div className="wildhaven-habitat-animal-list">
                  {selectedHabitatRegion.animals.map((animal) => (
                    <span className="wildhaven-habitat-animal-tag" key={animal}>{animal}</span>
                  ))}
                </div>
              </div>
              <div className="wildhaven-habitat-actions">
                <button type="button" className="wildhaven-map-cta">
                  Support this habitat
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Conservation Timeline */}
      <section id="timeline" className="py-24 bg-secondary/30">
        <div className="container-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="ornament-divider mb-6"><span className="text-xs uppercase tracking-[0.3em]">Conservation timeline</span></div>
              <h2 className="font-display text-4xl md:text-5xl leading-tight">A history of protecting wild futures.</h2>
              <p className="mt-4 text-muted-foreground">From forest laws to modern habitat monitoring, every milestone reflects a collective effort to keep wildlife connected to the landscapes they need.</p>
            </div>
            <div className="wildhaven-timeline-kicker">
              <span>{CONSERVATION_TIMELINE.length} milestones</span>
            </div>
          </div>

          <div className="wildhaven-timeline-shell">
            <div className="wildhaven-timeline-grid">
              {CONSERVATION_TIMELINE.map((entry, index) => (
                <article
                  key={entry.id}
                  className={`wildhaven-timeline-item ${selectedTimeline === entry.id ? "active" : ""}`}
                  onMouseEnter={() => setSelectedTimeline(entry.id)}
                  onFocus={() => setSelectedTimeline(entry.id)}
                  tabIndex={0}
                >
                  <span className="wildhaven-timeline-year">{entry.year}</span>
                  <span className="wildhaven-timeline-marker"><span /></span>
                  <div className="wildhaven-timeline-card">
                    <div className="wildhaven-timeline-card-image">
                      <img src={entry.image} alt="" className="wildhaven-timeline-card-img" />
                      <span className="wildhaven-timeline-category">{entry.category}</span>
                    </div>
                    <div className="wildhaven-timeline-card-content">
                      <span className="wildhaven-timeline-index">{String(index + 1).padStart(2, "0")}</span>
                      <h3 className="font-display text-2xl text-primary">{entry.title}</h3>
                      <p className="wildhaven-timeline-description">{entry.description}</p>
                      <p className="wildhaven-timeline-detail">{entry.detail}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="wildhaven-timeline-focus">
              <div className="wildhaven-timeline-focus-image">
                <img src={selectedTimelineEntry.image} alt="" className="wildhaven-timeline-focus-img" />
              </div>
              <div className="wildhaven-timeline-focus-copy">
                <span className="wildhaven-timeline-focus-year">{selectedTimelineEntry.year}</span>
                <h3 className="font-display text-3xl text-primary">{selectedTimelineEntry.title}</h3>
                <p>{selectedTimelineEntry.detail}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How You Can Help */}
      <section id="help" className="py-24">
        <div className="container-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="ornament-divider mb-6"><span className="text-xs uppercase tracking-[0.3em]">How you can help</span></div>
              <h2 className="font-display text-4xl md:text-5xl leading-tight">Every action can protect a wild place.</h2>
              <p className="mt-4 text-muted-foreground">Conservation grows when families, communities, educators, and supporters create healthier relationships with the natural world.</p>
            </div>
            <a href="#donate" className="text-sm font-semibold text-primary hover:underline">Choose a way to give →</a>
          </div>

          <div className="wildhaven-help-grid mt-10">
            {HOW_YOU_CAN_HELP.map((item) => {
              const isExpanded = expandedHelpCard === item.id;
              return (
                <article key={item.id} className={`wildhaven-help-card ${isExpanded ? "active" : ""}`}> 
                  <button type="button" className="wildhaven-help-card-top" onClick={() => setExpandedHelpCard(isExpanded ? "" : item.id)} aria-expanded={isExpanded}>
                    <span className="wildhaven-help-icon" aria-hidden="true">{item.icon}</span>
                    <span className="wildhaven-help-copy">
                      <span className="wildhaven-help-theme">{item.theme}</span>
                      <span className="wildhaven-help-title">{item.title}</span>
                    </span>
                    <span className="wildhaven-help-toggle">
                      <span className="wildhaven-help-toggle-icon">{isExpanded ? "−" : "+"}</span>
                    </span>
                  </button>

                  <div className={`wildhaven-help-body ${isExpanded ? "open" : ""}`}> 
                    <p className="wildhaven-help-summary">{item.summary}</p>
                    <div className="wildhaven-help-detail">
                      <p>{item.detail}</p>
                      <div className="wildhaven-help-impact">
                        <span className="wildhaven-help-impact-label">Impact</span>
                        <span className="wildhaven-help-impact-text">{item.impact}</span>
                      </div>
                      <div className="wildhaven-help-steps">
                        {item.steps.map((step) => (
                          <span className="wildhaven-help-step" key={step}>{step}</span>
                        ))}
                      </div>
                      <button type="button" className="wildhaven-help-cta">
                        {item.cta}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Wildlife Gallery */}
      <section id="gallery" className="py-24 bg-secondary/30">
        <div className="container-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="ornament-divider mb-6"><span className="text-xs uppercase tracking-[0.3em]">Wildlife Gallery</span></div>
              <h2 className="font-display text-4xl md:text-5xl leading-tight">Stories from the field.</h2>
              <p className="mt-4 text-muted-foreground">Meet the forests, species, and guardians that conservation work protects every day.</p>
            </div>
            <div className="wildhaven-gallery-toolbar">
              <div className="wildhaven-gallery-search-wrap">
                <input
                  className="wildhaven-gallery-search"
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                  placeholder="Search species, habitat..."
                  aria-label="Search wildlife gallery"
                />
              </div>
              <select className="wildhaven-gallery-sort" value={gallerySort} onChange={(e) => setGallerySort(e.target.value)} aria-label="Sort wildlife gallery">
                <option value="name">Sort: A–Z</option>
                <option value="name-desc">Sort: Z–A</option>
                <option value="status">Sort: Status</option>
              </select>
            </div>
          </div>

          <div className="wildhaven-gallery-category-strip">
            {galleryCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={`wildhaven-gallery-filter ${galleryCategory === category ? "active" : ""}`}
                onClick={() => setGalleryCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {visibleGalleryData.length > 0 ? (
            <div className="wildhaven-gallery-grid mt-8">
              {visibleGalleryData.map((item) => (
                <article className="wildhaven-gallery-card" key={item.id}>
                  <button type="button" className="wildhaven-gallery-image-wrap" onClick={() => setSelectedGalleryItem(item)} aria-label={`Open ${item.name} image`}>
                    <img src={galleryImageMap[item.image]} alt={item.name} className="wildhaven-gallery-image" />
                    <span className="wildhaven-gallery-image-shade">
                      <span className="wildhaven-gallery-image-icon">+</span>
                    </span>
                  </button>
                  <div className="wildhaven-gallery-content">
                    <div className="wildhaven-gallery-topline">
                      <span className="wildhaven-gallery-category">{item.category}</span>
                      <span className="wildhaven-gallery-status">{item.status}</span>
                    </div>
                    <div className="wildhaven-gallery-name">{item.name}</div>
                    <div className="wildhaven-gallery-description">{item.description}</div>
                    <div className="wildhaven-gallery-habitat">
                      <span className="wildhaven-gallery-habitat-label">Habitat</span>
                      <span className="wildhaven-gallery-habitat-value">{item.habitat}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="wildhaven-gallery-empty">
              <p>No wildlife stories found. Try a broader search or filter.</p>
            </div>
          )}
        </div>
      </section>

      {selectedGalleryItem && (
        <div className="wildhaven-gallery-lightbox-backdrop" onClick={() => setSelectedGalleryItem(null)}>
          <div className="wildhaven-gallery-lightbox" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="wildhaven-gallery-lightbox-close" aria-label="Close gallery image" onClick={() => setSelectedGalleryItem(null)}>×</button>
            <div className="wildhaven-gallery-lightbox-image-wrap">
              <img src={galleryImageMap[selectedGalleryItem.image]} alt={selectedGalleryItem.name} className="wildhaven-gallery-lightbox-image" />
            </div>
            <div className="wildhaven-gallery-lightbox-copy">
              <div className="wildhaven-gallery-lightbox-top">
                <span className="wildhaven-gallery-category">{selectedGalleryItem.category}</span>
                <span className="wildhaven-gallery-status">{selectedGalleryItem.status}</span>
              </div>
              <h3 className="font-display text-3xl text-primary mt-3">{selectedGalleryItem.name}</h3>
              <p className="text-muted-foreground mt-3">{selectedGalleryItem.description}</p>
              <div className="wildhaven-gallery-lightbox-meta">
                <span>{selectedGalleryItem.habitat}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wildlife Quiz */}
      <section id="quiz" className="py-24">
        <div className="container-page">
          <div className="wildhaven-quiz-shell">
            <div className="wildhaven-quiz-header">
              <div>
                <div className="ornament-divider mb-4"><span className="text-xs uppercase tracking-[0.3em]">Conservation Quiz</span></div>
                <h2 className="font-display text-4xl md:text-5xl">Wildlife Knowledge Check</h2>
              </div>
              <div className="wildhaven-quiz-badge">
                <span>{wildlifeQuizData.length} questions</span>
              </div>
            </div>

            {!showQuizResult ? (
              <div className="wildhaven-quiz-card">
                <div className="wildhaven-quiz-meta">
                  <span className="wildhaven-quiz-category">{currentQuestion.category}</span>
                  <span className="wildhaven-quiz-difficulty">{currentQuestion.difficulty}</span>
                </div>

                <div className="wildhaven-quiz-progress">
                  <div className="wildhaven-quiz-progress-track">
                    <div className="wildhaven-quiz-progress-bar" style={{ width: `${quizProgress}%` }} />
                  </div>
                  <span className="wildhaven-quiz-progress-text">{questionIndex + 1}/{wildlifeQuizData.length}</span>
                </div>

                <div className="wildhaven-quiz-question">
                  <h3 className="font-display text-3xl md:text-4xl">{currentQuestion.question}</h3>
                </div>

                <div className="wildhaven-quiz-options">
                  {currentQuestion.choices.map((choice) => {
                    const isCorrect = choice === currentQuestion.correctAnswer;
                    const isSelected = choice === selectedAnswer;
                    const optionClass = quizAnswered
                      ? isCorrect
                        ? "wildhaven-quiz-option correct"
                        : isSelected
                          ? "wildhaven-quiz-option incorrect"
                          : "wildhaven-quiz-option"
                      : "wildhaven-quiz-option";

                    return (
                      <button key={choice} type="button" className={optionClass} onClick={() => handleQuizSelect(choice)}>
                        <span className="wildhaven-quiz-option-index">{String.fromCharCode(65 + currentQuestion.choices.indexOf(choice))}</span>
                        <span>{choice}</span>
                      </button>
                    );
                  })}
                </div>

                {quizAnswered && (
                  <div className="wildhaven-quiz-feedback">
                    <div className={selectedAnswer === currentQuestion.correctAnswer ? "wildhaven-quiz-feedback-success" : "wildhaven-quiz-feedback-error"}>
                      {selectedAnswer === currentQuestion.correctAnswer ? "Correct — " : "Not quite — "}
                      {currentQuestion.explanation}
                    </div>
                  </div>
                )}

                <div className="wildhaven-quiz-actions">
                  <Button type="button" variant="outline" className="rounded-full" onClick={restartQuiz}>Restart</Button>
                  <Button type="button" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleQuizNext} disabled={!quizAnswered}>
                    {questionIndex === wildlifeQuizData.length - 1 ? "Finish" : "Next Question"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="wildhaven-quiz-result">
                <div className="wildhaven-quiz-result-inner">
                  <div className="wildhaven-quiz-result-score">
                    <span className="font-display text-6xl text-primary">{Math.round((quizScore / wildlifeQuizData.length) * 100)}%</span>
                    <span className="wildhaven-quiz-result-label">Score</span>
                  </div>
                  <div className="wildhaven-quiz-result-copy">
                    <h3 className="font-display text-4xl">You scored {quizScore}/{wildlifeQuizData.length}</h3>
                    <p className="text-muted-foreground">
                      {quizScore >= 7 ? "Excellent work — your conservation instincts are strong." : quizScore >= 4 ? "Good effort — keep learning about habitat and species protection." : "Every journey starts with curiosity — explore more conservation stories."}
                    </p>
                  </div>
                  <div className="wildhaven-quiz-actions center">
                    <Button type="button" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={restartQuiz}>Restart Quiz</Button>
                  </div>
                </div>
              </div>
            )}
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
