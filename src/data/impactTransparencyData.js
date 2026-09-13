/**
 * Impact Transparency Data
 * 
 * Mock data for Donor Impact Transparency features
 * - Campaign Progress Data: Real-time funding goals and progress
 * - Donor Testimonials: Stories from supporters
 * - Conservation Wins: Recent achievements funded by donations
 */

export const campaignProgressData = [
  {
    campaignName: 'Save Our Tigers',
    amountRaised: 750000,
    targetAmount: 1000000,
    icon: '🐅',
    description:
      'Protecting tiger habitats and preventing poaching in India\'s national reserves.',
  },
  {
    campaignName: 'Protect Snow Leopards',
    amountRaised: 450000,
    targetAmount: 750000,
    icon: '❄️',
    description:
      'Preserving high-altitude ecosystems and supporting snow leopard conservation programs.',
  },
  {
    campaignName: 'Support the Sniffer Dog Programme',
    amountRaised: 620000,
    targetAmount: 800000,
    icon: '🐕',
    description:
      'Training and deploying detection dogs for wildlife trafficking prevention.',
  },
  {
    campaignName: 'Fight Climate Change',
    amountRaised: 1200000,
    targetAmount: 1500000,
    icon: '🌍',
    description:
      'Supporting renewable energy projects and carbon offset initiatives.',
  },
  {
    campaignName: 'Restore Forest Ecosystems',
    amountRaised: 850000,
    targetAmount: 1000000,
    icon: '🌲',
    description:
      'Reforestation projects and habitat restoration across India.',
  },
  {
    campaignName: 'Ocean Conservation',
    amountRaised: 320000,
    targetAmount: 600000,
    icon: '🌊',
    description:
      'Protecting marine ecosystems and reducing ocean pollution.',
  },
];

export const donorTestimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai, India',
    story:
      'I started donating monthly after visiting the Sundarbans and seeing the tiger reserves firsthand. Knowing my contribution directly protects these magnificent creatures makes me feel connected to conservation on a personal level.',
    cause: 'Save Our Tigers',
    donationAmount: 500,
    avatar: null, // Will show initials 'PS'
  },
  {
    name: 'Rajesh Patel',
    location: 'Bangalore, India',
    story:
      'As a wildlife photographer, I\'ve witnessed the impact of climate change on snow leopards. Supporting Wild Haven\'s conservation efforts is my way of giving back to the species that inspire my work.',
    cause: 'Protect Snow Leopards',
    donationAmount: 2000,
    avatar: null, // Will show initials 'RP'
  },
  {
    name: 'Anaya Verma',
    location: 'Delhi, India',
    story:
      'The sniffer dog programme is ingenious! I never realized technology and trained animals could work together so effectively. I\'m proud to support such innovative conservation solutions.',
    cause: 'Support the Sniffer Dog Programme',
    donationAmount: 1500,
    avatar: null, // Will show initials 'AV'
  },
  {
    name: 'Vikram Singh',
    location: 'Hyderabad, India',
    story:
      'Climate change affects everyone. When I learned about Wild Haven\'s renewable energy initiatives, I knew I had to contribute. Our children deserve a healthier planet.',
    cause: 'Fight Climate Change',
    donationAmount: 5000,
    avatar: null, // Will show initials 'VS'
  },
  {
    name: 'Neha Gupta',
    location: 'Pune, India',
    story:
      'The forest restoration project planted over 10,000 trees last year with support from donors like me. It\'s amazing to see something tangible come from your donation. I\'m committed to growing this impact.',
    cause: 'Restore Forest Ecosystems',
    donationAmount: 1000,
    avatar: null, // Will show initials 'NG'
  },
  {
    name: 'Arjun Desai',
    location: 'Goa, India',
    story:
      'Living near the coast, I see ocean pollution firsthand. Supporting marine conservation through Wild Haven gives me hope that we can reverse the damage and protect our seas for future generations.',
    cause: 'Ocean Conservation',
    donationAmount: 750,
    avatar: null, // Will show initials 'AD'
  },
];

export const conservationWins = [
  {
    title: '10,000 Trees Planted in Western Ghats',
    description:
      'In partnership with local communities, we successfully planted 10,000 native trees across 50 hectares in the Western Ghats, creating critical wildlife corridors.',
    category: 'Habitat',
    date: '2026-08-15',
    icon: '🌱',
    image: null, // Add image URL when available
    metric: '50 hectares restored',
    fundedBy: '₹2,50,000 from donors',
  },
  {
    title: '47 Tigers Protected This Quarter',
    description:
      'Enhanced anti-poaching patrols and community awareness programs resulted in zero tiger poaching incidents in our monitored reserves this quarter.',
    category: 'Wildlife',
    date: '2026-08-20',
    icon: '🐅',
    image: null,
    metric: '47 tigers monitored',
    fundedBy: 'Community-funded patrols',
  },
  {
    title: 'Sniffer Dogs Detected 2 Tons of Illegal Wildlife Products',
    description:
      'Our trained detection dogs identified and prevented illegal wildlife trafficking at major ports and borders, recovering 2 tons of confiscated wildlife products.',
    category: 'Anti-Poaching',
    date: '2026-07-28',
    icon: '🐕',
    image: null,
    metric: '2 tons intercepted',
    fundedBy: '₹1,50,000 training and deployment',
  },
  {
    title: 'Solar Power Installation at 15 Village Centers',
    description:
      'Installed solar power systems in 15 villages near protected areas, reducing dependence on forest resources and supporting climate action.',
    category: 'Climate Action',
    date: '2026-08-10',
    icon: '☀️',
    image: null,
    metric: '15 villages electrified',
    fundedBy: '₹5,00,000 from renewable energy fund',
  },
  {
    title: '500 Students Trained in Wildlife Conservation',
    description:
      'Conducted environmental education programs in 25 schools, training 500 students about biodiversity, ecosystem protection, and career opportunities in conservation.',
    category: 'Education',
    date: '2026-08-05',
    icon: '📚',
    image: null,
    metric: '500 students engaged',
    fundedBy: 'Education initiative fund',
  },
  {
    title: 'Ocean Cleanup: 8 Tons of Plastic Removed',
    description:
      'Community-led coastal cleanup operations removed 8 tons of plastic and marine debris, protecting sea turtles and marine mammals.',
    category: 'Climate Action',
    date: '2026-07-30',
    icon: '🌊',
    image: null,
    metric: '8 tons of ocean plastic',
    fundedBy: '₹1,80,000 cleanup operation',
  },
  {
    title: 'Snow Leopard Population Monitoring Success',
    description:
      'Camera trap surveys in the Himalayas documented a 12% increase in snow leopard sightings, indicating successful habitat protection measures.',
    category: 'Research',
    date: '2026-08-12',
    icon: '❄️',
    image: null,
    metric: '12% population increase',
    fundedBy: 'Conservation research fund',
  },
  {
    title: '3,000 Beneficiaries from Community Programs',
    description:
      'Alternative livelihood programs trained 3,000 community members in sustainable agriculture and eco-tourism, reducing pressure on wildlife habitats.',
    category: 'Community',
    date: '2026-08-22',
    icon: '👥',
    image: null,
    metric: '3,000 community members',
    fundedBy: 'Community development fund',
  },
];

export default {
  campaignProgressData,
  donorTestimonials,
  conservationWins,
};
