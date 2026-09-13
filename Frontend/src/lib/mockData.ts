export type DonationFrequency = "one-time" | "monthly" | "quarterly" | "annual";
export type DonationStatus = "completed" | "pending" | "failed" | "refunded";
export type ProjectStatus = "active" | "planned" | "completed" | "paused";

export interface DonorProfile {
  id: string;
  name: string;
  email: string;
  role: "donor" | "field-officer" | "admin" | "partner";
  location: string;
  joinedAt: string;
  preferredCurrency: "INR" | "USD" | "EUR";
  donationHistory: string[];
  activityIds: string[];
  avatarUrl?: string;
}

export interface ConservationProject {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  category:
    | "Species Protection"
    | "Habitat Restoration"
    | "Anti-Poaching"
    | "Community Programs"
    | "Climate & Water"
    | "Rescue & Rehabilitation";
  status: ProjectStatus;
  region: string;
  state: string;
  landscape: string;
  priority: "critical" | "high" | "medium" | "low";
  summary: string;
  longDescription: string;
  startDate: string;
  endDate?: string;
  targetAmount: number;
  raisedAmount: number;
  currency: "INR";
  progress: number;
  impactMetrics: {
    metric: string;
    unit: string;
    value: number;
    trend: "up" | "down" | "steady";
  }[];
  partners: Array<{
    name: string;
    type: "NGO" | "Government" | "Academic" | "Community" | "Corporate";
    role: string;
  }>;
  fieldTeams: Array<{
    lead: string;
    teamSize: number;
    focus: string;
    trainingLevel: "Basic" | "Advanced" | "Specialist";
  }>;
  locations: Array<{
    name: string;
    coordinate: { lat: number; lng: number };
    terrain: string;
    populationDensity: "low" | "medium" | "high";
  }>;
  risks: string[];
  milestones: Array<{
    date: string;
    title: string;
    description: string;
    complete: boolean;
  }>;
  gallery: string[];
  conservationFocus: string[];
}

export interface DonationRecord {
  id: string;
  donorId: string;
  projectId: string;
  amount: number;
  currency: "INR";
  frequency: DonationFrequency;
  status: DonationStatus;
  createdAt: string;
  completedAt?: string;
  paymentMethod: "Card" | "UPI" | "Net Banking" | "Bank Transfer" | "Wallet";
  cardLast4?: string;
  campaignCode: string;
  notes?: string;
  taxReceiptId?: string;
  transactionId: string;
}

export interface TransactionLog {
  id: string;
  donationId: string;
  type: "payment" | "refund" | "tax_receipt" | "email" | "sms" | "webhook" | "reconcile";
  direction: "inbound" | "outbound" | "system";
  status: "success" | "pending" | "failed" | "retry";
  createdAt: string;
  actor: string;
  payload: Record<string, unknown>;
}

export interface UserActivity {
  id: string;
  userId: string;
  type:
    | "login"
    | "donation"
    | "program_view"
    | "impact_view"
    | "newsletter"
    | "campaign_open"
    | "receipt_download"
    | "project_update";
  title: string;
  description: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface MockDataBundle {
  donors: DonorProfile[];
  projects: ConservationProject[];
  donations: DonationRecord[];
  transactions: TransactionLog[];
  activity: UserActivity[];
}

export const donors: DonorProfile[] = [
  {
    id: "donor-001",
    name: "Aarav Menon",
    email: "aarav.menon@example.com",
    role: "donor",
    location: "Bengaluru, Karnataka",
    joinedAt: "2021-05-16T08:30:00.000Z",
    preferredCurrency: "INR",
    donationHistory: ["donation-001", "donation-002"],
    activityIds: ["activity-001", "activity-002"],
  },
  {
    id: "donor-002",
    name: "Meera Iyer",
    email: "meera.iyer@example.com",
    role: "donor",
    location: "Chennai, Tamil Nadu",
    joinedAt: "2020-03-04T10:15:00.000Z",
    preferredCurrency: "INR",
    donationHistory: ["donation-003"],
    activityIds: ["activity-003"],
  },
  {
    id: "donor-003",
    name: "Kabir Sharma",
    email: "kabir.sharma@example.com",
    role: "donor",
    location: "Jaipur, Rajasthan",
    joinedAt: "2022-08-21T12:00:00.000Z",
    preferredCurrency: "INR",
    donationHistory: ["donation-004", "donation-005"],
    activityIds: ["activity-004"],
  },
  {
    id: "donor-004",
    name: "Nandita Roy",
    email: "nandita.roy@example.com",
    role: "donor",
    location: "Kolkata, West Bengal",
    joinedAt: "2019-11-10T09:45:00.000Z",
    preferredCurrency: "INR",
    donationHistory: ["donation-006"],
    activityIds: ["activity-005"],
  },
  {
    id: "donor-005",
    name: "Rohan Kulkarni",
    email: "rohan.kulkarni@example.com",
    role: "donor",
    location: "Pune, Maharashtra",
    joinedAt: "2023-01-12T14:10:00.000Z",
    preferredCurrency: "INR",
    donationHistory: ["donation-007"],
    activityIds: ["activity-006"],
  },
  {
    id: "donor-006",
    name: "Divya Nair",
    email: "divya.nair@example.com",
    role: "donor",
    location: "Kochi, Kerala",
    joinedAt: "2020-09-30T16:20:00.000Z",
    preferredCurrency: "INR",
    donationHistory: ["donation-008", "donation-009"],
    activityIds: ["activity-007"],
  },
  {
    id: "donor-007",
    name: "Sana Ali",
    email: "sana.ali@example.com",
    role: "donor",
    location: "Hyderabad, Telangana",
    joinedAt: "2021-12-12T11:00:00.000Z",
    preferredCurrency: "INR",
    donationHistory: ["donation-010"],
    activityIds: ["activity-008"],
  },
  {
    id: "donor-008",
    name: "Ishita Sen",
    email: "ishita.sen@example.com",
    role: "donor",
    location: "Guwahati, Assam",
    joinedAt: "2024-02-09T15:30:00.000Z",
    preferredCurrency: "INR",
    donationHistory: ["donation-011", "donation-012"],
    activityIds: ["activity-009"],
  },
  {
    id: "donor-009",
    name: "Vikram Joshi",
    email: "vikram.joshi@example.com",
    role: "field-officer",
    location: "Almora, Uttarakhand",
    joinedAt: "2018-04-17T08:00:00.000Z",
    preferredCurrency: "INR",
    donationHistory: ["donation-013"],
    activityIds: ["activity-010"],
  },
  {
    id: "donor-010",
    name: "Leena Das",
    email: "leena.das@example.com",
    role: "partner",
    location: "Mysuru, Karnataka",
    joinedAt: "2022-06-26T13:40:00.000Z",
    preferredCurrency: "INR",
    donationHistory: ["donation-014"],
    activityIds: ["activity-011"],
  },
];

export const projects: ConservationProject[] = [
  {
    id: "project-001",
    slug: "species-protection",
    title: "Species Protection",
    shortTitle: "Species Protection",
    category: "Species Protection",
    status: "active",
    region: "Central India",
    state: "Madhya Pradesh",
    landscape: "Tiger corridors and forest fringe",
    priority: "critical",
    summary: "Protect flagship species by supporting ranger patrols, camera-trap monitoring, and veterinary response.",
    longDescription: "Wild Haven’s Species Protection program protects tigers, elephants, leopards and lesser-known species across high-risk forest landscapes. Teams combine evidence-led patrols, restoration and emergency rescue operations to reduce conflict and poaching pressure.",
    startDate: "2023-01-15T00:00:00.000Z",
    targetAmount: 1450000,
    raisedAmount: 860000,
    currency: "INR",
    progress: 59,
    impactMetrics: [
      { metric: "Patrol coverage", unit: "km", value: 640, trend: "up" },
      { metric: "Camera traps", unit: "units", value: 42, trend: "up" },
      { metric: "Active reserves", unit: "areas", value: 4, trend: "steady" },
    ],
    partners: [
      { name: "State Forest Department", type: "Government", role: "Protected area coordination" },
      { name: "Indian Veterinary Research Unit", type: "Academic", role: "Wildlife health" },
    ],
    fieldTeams: [
      { lead: "R. Sharma", teamSize: 16, focus: "Tiger monitoring", trainingLevel: "Advanced" },
      { lead: "A. Reddy", teamSize: 10, focus: "Rescue response", trainingLevel: "Specialist" },
    ],
    locations: [
      { name: "Bandhavgarh Corridor", coordinate: { lat: 23.62, lng: 80.85 }, terrain: "Dry deciduous forest", populationDensity: "low" },
      { name: "Panna Tiger Reserve Edge", coordinate: { lat: 24.68, lng: 80.15 }, terrain: "Forest livestock interface", populationDensity: "medium" },
    ],
    risks: ["Snare activity", "Human-wildlife conflict", "Forest fire pressure"],
    milestones: [
      { date: "2025-02-01T00:00:00.000Z", title: "Patrol season planning", description: "Finalize monsoon and dry season routing.", complete: true },
      { date: "2025-07-31T00:00:00.000Z", title: "Camera-trap review", description: "Assess species movement data.", complete: false },
    ],
    gallery: ["/assets/tiger-01.jpg", "/assets/tiger-02.jpg"],
    conservationFocus: ["tigers", "leopards", "elephants", "forest integrity"],
  },
  {
    id: "project-002",
    slug: "habitat-restoration",
    title: "Habitat Restoration",
    shortTitle: "Habitat Restore",
    category: "Habitat Restoration",
    status: "active",
    region: "Western Ghats",
    state: "Karnataka",
    landscape: "Rainforest corridors and watershed",
    priority: "high",
    summary: "Restore native forest cover, revive water flows and reconnect wildlife movement pathways.",
    longDescription: "Habitat Restoration builds ecological resilience by reforesting degraded corridors, protecting watersheds and improving the health of forest ecosystems that wildlife depends on.",
    startDate: "2022-06-01T00:00:00.000Z",
    targetAmount: 1900000,
    raisedAmount: 1418000,
    currency: "INR",
    progress: 75,
    impactMetrics: [
      { metric: "Native trees planted", unit: "saplings", value: 180000, trend: "up" },
      { metric: "Wetlands revived", unit: "sites", value: 7, trend: "up" },
      { metric: "Corridor acres", unit: "acres", value: 18000, trend: "up" },
    ],
    partners: [
      { name: "Women’s Nursery Network", type: "Community", role: "Seedling production" },
      { name: "Bengaluru Ecology Forum", type: "NGO", role: "Monitoring and restoration" },
    ],
    fieldTeams: [
      { lead: "S. Basu", teamSize: 14, focus: "Nursery management", trainingLevel: "Advanced" },
      { lead: "M. Iland", teamSize: 8, focus: "Landscape mapping", trainingLevel: "Basic" },
    ],
    locations: [
      { name: "Agumbe Ghats", coordinate: { lat: 13.62, lng: 75.1 }, terrain: "Rainforest slope", populationDensity: "low" },
      { name: "Sakleshpur Corridor", coordinate: { lat: 12.95, lng: 75.82 }, terrain: "Hilly forest belt", populationDensity: "medium" },
    ],
    risks: ["Monsoon flood impact", "Land encroachment", "Invasive species"],
    milestones: [
      { date: "2024-11-12T00:00:00.000Z", title: "Nursery expansion", description: "Increase sapling production capacity.", complete: true },
      { date: "2025-06-12T00:00:00.000Z", title: "Wetland restoration", description: "Restore water pathways.", complete: false },
    ],
    gallery: ["/assets/forest-01.jpg", "/assets/forest-02.jpg"],
    conservationFocus: ["forests", "watersheds", "native species", "corridors"],
  },
  {
    id: "project-003",
    slug: "anti-poaching",
    title: "Anti-Poaching",
    shortTitle: "Anti-Poaching",
    category: "Anti-Poaching",
    status: "active",
    region: "Eastern Forest Complex",
    state: "Assam",
    landscape: "Tiger reserve and grassland mosaic",
    priority: "critical",
    summary: "Equip forest guards with intelligence tools, patrol gear and response capacity to stop poaching networks.",
    longDescription: "The anti-poaching program strengthens field intelligence, provides guard welfare and logistics, and helps communities report wildlife crime early. The program also supports legal case preparation and crime pattern mapping.",
    startDate: "2021-10-02T00:00:00.000Z",
    targetAmount: 1100000,
    raisedAmount: 745000,
    currency: "INR",
    progress: 68,
    impactMetrics: [
      { metric: "Guards trained", unit: "people", value: 76, trend: "up" },
      { metric: "Snares removed", unit: "units", value: 320, trend: "up" },
      { metric: "Crime alerts", unit: "reports", value: 180, trend: "up" },
    ],
    partners: [
      { name: "Assam Forest Department", type: "Government", role: "Field implementation" },
      { name: "Wildlife Crime Unit", type: "NGO", role: "Intelligence and legal response" },
    ],
    fieldTeams: [
      { lead: "S. Phukan", teamSize: 11, focus: "Snare patrols", trainingLevel: "Advanced" },
      { lead: "D. Boro", teamSize: 7, focus: "Community intelligence", trainingLevel: "Basic" },
    ],
    locations: [
      { name: "Kaziranga Fringe", coordinate: { lat: 26.58, lng: 93.17 }, terrain: "Alluvial grassland", populationDensity: "medium" },
      { name: "Bhalukpong Reserve", coordinate: { lat: 27.08, lng: 92.75 }, terrain: "Forest ridge", populationDensity: "low" },
    ],
    risks: ["Illegal wildlife trade", "Seasonal flood movement", "Insufficient guard logistics"],
    milestones: [
      { date: "2024-05-10T00:00:00.000Z", title: "Patrol equipment drive", description: "Distribute night-vision and field kits.", complete: true },
      { date: "2025-03-14T00:00:00.000Z", title: "Crime intelligence review", description: "Coordinate prevention mapping.", complete: false },
    ],
    gallery: ["/assets/poaching-01.jpg"],
    conservationFocus: ["anti-poaching", "forest guards", "species safety"],
  },
  {
    id: "project-004",
    slug: "community-programs",
    title: "Community Programs",
    shortTitle: "Community Programs",
    category: "Community Programs",
    status: "active",
    region: "Eastern Himalayas",
    state: "Arunachal Pradesh",
    landscape: "Forest-fringe and community landscape",
    priority: "high",
    summary: "Support communities living beside wildlife through livelihoods, education, health services and conflict prevention.",
    longDescription: "Community Programs support forest-fringe communities with livelihood alternatives, conflict mitigation and inclusive conservation education. The goal is to make conservation a shared economic and cultural incentive.",
    startDate: "2021-06-15T00:00:00.000Z",
    targetAmount: 1200000,
    raisedAmount: 780000,
    currency: "INR",
    progress: 65,
    impactMetrics: [
      { metric: "Villages engaged", unit: "villages", value: 34, trend: "up" },
      { metric: "Livelihood grants", unit: "families", value: 310, trend: "up" },
      { metric: "School support", unit: "students", value: 820, trend: "up" },
    ],
    partners: [
      { name: "Highland Eco Youth Forum", type: "Community", role: "Education" },
      { name: "Community Health Network", type: "NGO", role: "Mobile health" },
    ],
    fieldTeams: [
      { lead: "P. Talukdar", teamSize: 9, focus: "Livelihood design", trainingLevel: "Advanced" },
      { lead: "G. Lama", teamSize: 8, focus: "Community education", trainingLevel: "Basic" },
    ],
    locations: [
      { name: "Tawang Community Belt", coordinate: { lat: 27.58, lng: 91.86 }, terrain: "Hill forest}, region", populationDensity: "low" },
      { name: "Namdapha Fringe", coordinate: { lat: 27.48, lng: 96.5 }, terrain: "Rainforest fringe", populationDensity: "medium" },
    ],
    risks: ["Livelihood transition", "Conflict incidents", "Funding continuity"],
    milestones: [
      { date: "2024-01-20T00:00:00.000Z", title: "Livelihood micro-grants", description: "Launch village enterprise grants.", complete: true },
      { date: "2025-09-20T00:00:00.000Z", title: "Local education plan", description: "Expand school conservation curriculum.", complete: false },
    ],
    gallery: ["/assets/community-01.jpg"],
    conservationFocus: ["people", "coexistence", "livelihoods", "education"],
  },
  {
    id: "project-005",
    slug: "elephant-rescue",
    title: "Elephant Rescue",
    shortTitle: "Elephant Rescue",
    category: "Rescue & Rehabilitation",
    status: "active",
    region: "Southern Corridors",
    state: "Karnataka",
    landscape: "Elephant corridor and tea estate interface",
    priority: "critical",
    summary: "Coordinate elephant rescue and relocation, veterinary care and conflict mitigation along rail and roadway corridors.",
    longDescription: "Elephant Rescue supports emergency response units that monitor movement, rescue injured elephants and reduce human-elephant conflict near transport routes and plantations.",
    startDate: "2023-04-01T00:00:00.000Z",
    targetAmount: 1000000,
    raisedAmount: 620000,
    currency: "INR",
    progress: 62,
    impactMetrics: [
      { metric: "Rescues", unit: "cases", value: 18, trend: "up" },
      { metric: "Corridors monitored", unit: "routes", value: 11, trend: "up" },
      { metric: "Response hours", unit: "hrs", value: 262, trend: "up" },
    ],
    partners: [
      { name: "Forest Veterinary Network", type: "Academic", role: "Veterinary support" },
      { name: "Railway Conflict Taskforce", type: "Government", role: "Corridor safety" },
    ],
    fieldTeams: [
      { lead: "J. Natarajan", teamSize: 13, focus: "Elephant rescue", trainingLevel: "Specialist" },
      { lead: "K. Gowda", teamSize: 6, focus: "Corridor monitoring", trainingLevel: "Advanced" },
    ],
    locations: [
      { name: "Bandipur Corridor", coordinate: { lat: 11.68, lng: 76.52 }, terrain: "Forest-plantation divide", populationDensity: "medium" },
      { name: "Mysuru Sugar Belt", coordinate: { lat: 12.3, lng: 76.65 }, terrain: "Agricultural fringe", populationDensity: "high" },
    ],
    risks: ["Railway strikes", "Crop conflict", "Seasonal migration routes"],
    milestones: [
      { date: "2024-09-05T00:00:00.000Z", title: "Emergency response drill", description: "Coordinate veterinary rescue teams.", complete: true },
      { date: "2025-02-12T00:00:00.000Z", title: "Road sensor pilot", description: "Install early-warning corridor markers.", complete: false },
    ],
    gallery: ["/assets/elephant-01.jpg"],
    conservationFocus: ["elephants", "corridors", "rescue", "safety"],
  },
  {
    id: "project-006",
    slug: "climate-water",
    title: "Climate & Water",
    shortTitle: "Climate Water",
    category: "Climate & Water",
    status: "active",
    region: "Western Ghats & Eastern Plains",
    state: "Maharashtra",
    landscape: "Wetland, river and forest watershed",
    priority: "medium",
    summary: "Improve ecosystem water security through wetland revival, natural recharge zones and river buffer restoration.",
    longDescription: "Climate & Water invests in landscape resilience by restoring natural water cycles across forest and agricultural systems. It supports wetland health, hydrology and climate adaptation.",
    startDate: "2022-02-22T00:00:00.000Z",
    targetAmount: 1350000,
    raisedAmount: 725000,
    currency: "INR",
    progress: 54,
    impactMetrics: [
      { metric: "Water sources revived", unit: "sources", value: 26, trend: "up" },
      { metric: "Wetlands monitored", unit: "sites", value: 14, trend: "up" },
      { metric: "Families impacted", unit: "families", value: 420, trend: "up" },
    ],
    partners: [
      { name: "River Health Alliance", type: "NGO", role: "Landscape hydrology" },
      { name: "Agrarian Water Council", type: "Community", role: "Local water stewardship" },
    ],
    fieldTeams: [
      { lead: "N. Chavan", teamSize: 9, focus: "Wetland mapping", trainingLevel: "Advanced" },
      { lead: "R. Kulkarni", teamSize: 7, focus: "Water recharge planning", trainingLevel: "Basic" },
    ],
    locations: [
      { name: "Sahyadri Water Grid", coordinate: { lat: 18.5, lng: 73.8 }, terrain: "Hill catchment", populationDensity: "low" },
      { name: "Godavari Basin", coordinate: { lat: 20.4, lng: 75.2 }, terrain: "River agriculture zone", populationDensity: "medium" },
    ],
    risks: ["Drought", "Encroachment", "Water extraction"],
    milestones: [
      { date: "2024-03-18T00:00:00.000Z", title: "Source rejuvenation", description: "Inspect community water sources.", complete: true },
      { date: "2025-10-01T00:00:00.000Z", title: "Hydrology baseline", description: "Publish water quality and flow data.", complete: false },
    ],
    gallery: ["/assets/water-01.jpg"],
    conservationFocus: ["water", "wetlands", "climate", "forest catchments"],
  },
];

export const donations: DonationRecord[] = Array.from({ length: 50 }, (_, index) => {
  const donorPool = ["donor-001", "donor-002", "donor-003", "donor-004", "donor-005", "donor-006", "donor-007", "donor-008", "donor-009", "donor-010"];
  const projectPool = ["project-001", "project-002", "project-003", "project-004", "project-005", "project-006"];
  const frequencyPool: DonationFrequency[] = ["one-time", "monthly", "quarterly", "annual"];
  const paymentPool: DonationRecord["paymentMethod"][] = ["Card", "UPI", "Net Banking", "Bank Transfer", "Wallet"];
  const statuses: DonationStatus[] = ["completed", "pending", "failed", "refunded"];
  const amountBase = [500, 750, 1000, 1500, 2500, 5000, 10000, 15000, 25000, 50000];
  const donorId = donorPool[index % donorPool.length];
  const projectId = projectPool[index % projectPool.length];
  const amount = amountBase[(index * 3) % amountBase.length];
  const frequency = frequencyPool[index % frequencyPool.length];
  const paymentMethod = paymentPool[index % paymentPool.length];
  const status = index % 11 === 0 ? "pending" : statuses[index % statuses.length];
  return {
    id: `donation-${String(index + 1).padStart(3, "0")}`,
    donorId,
    projectId,
    amount: amount + (index % 4) * 250,
    currency: "INR",
    frequency,
    status,
    createdAt: new Date(2024, 0, 8 + index % 40, 8 + (index % 12), 15 + (index % 30), 0).toISOString(),
    completedAt: status === "completed" ? new Date(2024, 0, 8 + index % 40, 9 + (index % 5), 16 + (index % 25), 0).toISOString() : undefined,
    paymentMethod,
    cardLast4: paymentMethod === "Card" ? String(4100 + (index % 8) * 1000).slice(-4) : undefined,
    campaignCode: `WH-${String(2024 + (index % 5))}-${String(100 + index % 900)}`,
    notes: index % 3 === 0 ? "Monthly donor campaign support" : undefined,
    taxReceiptId: status === "completed" ? `TAX-${String(1000 + index).padStart(5, "0")}` : undefined,
    transactionId: `TXN-${String(900000 + index).padStart(8, "0")}`,
  };
});

export const transactions: TransactionLog[] = donations.map((donation, index) => ({
  id: `txn-log-${String(index + 1).padStart(3, "0")}`,
  donationId: donation.id,
  type: donation.status === "refunded" ? "refund" : "payment",
  direction: "inbound",
  status: donation.status === "failed" ? "failed" : "success",
  createdAt: donation.createdAt,
  actor: donation.paymentMethod,
  payload: {
    amount: donation.amount,
    currency: donation.currency,
    projectId: donation.projectId,
    donorId: donation.donorId,
    failedReason: donation.status === "failed" ? "Bank verification issue" : undefined,
  },
}));

export const activity: UserActivity[] = Array.from({ length: 80 }, (_, index) => {
  const activityTypes: UserActivity["type"][] = [
    "login",
    "donation",
    "program_view",
    "impact_view",
    "newsletter",
    "campaign_open",
    "receipt_download",
    "project_update",
  ];
  const donor = donors[index % donors.length];
  const project = projects[index % projects.length];
  const type = activityTypes[index % activityTypes.length];

  const baseMap: Record<UserActivity["type"], string> = {
    login: "Logged in",
    donation: "Made a donation",
    program_view: "Viewed program",
    impact_view: "Viewed impact report",
    newsletter: "Opened newsletter",
    campaign_open: "Opened campaign",
    receipt_download: "Downloaded receipt",
    project_update: "Received project update",
  };

  return {
    id: `activity-${String(index + 1).padStart(3, "0")}`,
    userId: donor.id,
    type,
    title: baseMap[type],
    description: `${donor.name} ${type === "donation" ? `donated ₹${(index + 1) * 1250}` : `engaged with ${project.title}`}.`,
    createdAt: new Date(2024, 0, 8 + (index % 60), 6 + (index % 16), (index * 11) % 60, 0).toISOString(),
    metadata: {
      projectId: project.id,
      projectTitle: project.title,
      campaignCode: `WH-${String(100 + index % 200)}`,
      location: donor.location,
    },
  };
});

export const mockData: MockDataBundle = {
  donors,
  projects,
  donations,
  transactions,
  activity,
};

export default mockData;
