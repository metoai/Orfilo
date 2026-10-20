export interface PricingTier {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice: number;
  directoriesCount: number;
  popular?: boolean;
  badge?: string;
  turnaround: string;
  guaranteedDoFollow: number;
  features: { text: string; highlight?: boolean; included: boolean }[];
  ctaText: string;
  ctaSubtext: string;
  targetAudience: string;
  colorScheme: {
    badgeBg: string;
    border: string;
    button: string;
    glow: string;
  };
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Ideal for early MVPs & side-projects seeking quick initial authority and indexing.',
    price: 49,
    originalPrice: 120,
    directoriesCount: 40,
    popular: false,
    turnaround: '5 business days',
    guaranteedDoFollow: 15,
    features: [
      { text: 'Manual submission to 40 curated directories', highlight: true, included: true },
      { text: 'Target directories with DR 50 to 75+', included: true },
      { text: 'Guaranteed 15+ do-follow backlink approvals', included: true },
      { text: 'Basic title & description optimization', included: true },
      { text: 'Full Google Sheet report with live URLs & screenshots', included: true },
      { text: 'Standard email delivery update', included: true },
      { text: 'Product Hunt, Uneed, Toolify submission', included: false },
      { text: 'AI-assisted anti-duplicate copy variations', included: false },
      { text: 'Re-submission & rejection replacement warranty', included: false },
      { text: 'VIP fast-indexing pinging service', included: false }
    ],
    ctaText: 'Get Starter Package',
    ctaSubtext: 'One-time payment • Lifetime backlinks',
    targetAudience: 'Side projects, solo builders, early MVPs',
    colorScheme: {
      badgeBg: 'bg-zinc-800 text-zinc-300',
      border: 'border-zinc-800 hover:border-zinc-700',
      button: 'bg-zinc-800 hover:bg-zinc-700 text-white',
      glow: ''
    }
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'The sweet spot for funded startups and serious SaaS founders ready to scale DR fast.',
    price: 99,
    originalPrice: 249,
    directoriesCount: 90,
    popular: true,
    badge: 'MOST POPULAR — SAVES 45+ HOURS',
    turnaround: '72 hours expedited',
    guaranteedDoFollow: 35,
    features: [
      { text: 'Manual submission to 90 high-authority directories', highlight: true, included: true },
      { text: 'Top tier platforms with DR 60 to 91+', highlight: true, included: true },
      { text: 'Guaranteed 35+ do-follow backlink approvals', highlight: true, included: true },
      { text: 'Product Hunt, Uneed, BetaList & Toolify included', highlight: true, included: true },
      { text: '3 bespoke copy variations (prevents duplicate penalties)', included: true },
      { text: 'Live Notion & Google Sheet tracker with screenshots', included: true },
      { text: 'Fast-track indexing ping to search engines', included: true },
      { text: 'Re-submission guarantee for any rejected directory', included: true },
      { text: 'Priority founder support (response < 4 hrs)', included: true },
      { text: 'Dedicated launch strategist review', included: false }
    ],
    ctaText: 'Claim Growth Package',
    ctaSubtext: '⚡ Only 4 queue spots remaining today',
    targetAudience: 'Post-launch SaaS, AI apps, micro-startups',
    colorScheme: {
      badgeBg: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20',
      border: 'border-indigo-500/80 shadow-2xl shadow-indigo-500/10',
      button: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-lg shadow-indigo-500/25',
      glow: 'relative before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-b before:from-indigo-500 before:to-purple-500 before:opacity-30 before:-z-10'
    }
  },
  {
    id: 'scale',
    name: 'Scale',
    tagline: 'Maximum domain power. Comprehensive directory blast for maximum organic search dominance.',
    price: 199,
    originalPrice: 499,
    directoriesCount: 160,
    popular: false,
    badge: 'MAXIMUM SEO IMPACT',
    turnaround: '48 hours VIP expedited',
    guaranteedDoFollow: 65,
    features: [
      { text: 'Manual submission to 160+ premium directories', highlight: true, included: true },
      { text: 'Elite DR 65 to 94+ (SourceForge, TechRadar, Devpost)', highlight: true, included: true },
      { text: 'Guaranteed 65+ do-follow backlink approvals', highlight: true, included: true },
      { text: '5 human-written niche-tailored copy variations', included: true },
      { text: 'Full community showcase submissions (IndieHackers, Show HN)', highlight: true, included: true },
      { text: 'VIP Indexing API instant crawler acceleration', included: true },
      { text: '100% replacement warranty + 30-day index guarantee', included: true },
      { text: 'Dedicated launch strategist & 1-on-1 SEO audit', included: true },
      { text: 'Live Notion workspace & automated client reporting', included: true },
      { text: 'Ahrefs / Semrush rank tracking report (60 days)', included: true }
    ],
    ctaText: 'Dominate Search with Scale',
    ctaSubtext: 'Includes 1-on-1 launch review call',
    targetAudience: 'Scaling SaaS, agencies, high-ticket digital products',
    colorScheme: {
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      border: 'border-zinc-800 hover:border-emerald-500/40',
      button: 'bg-emerald-500 hover:bg-emerald-600 text-black font-semibold',
      glow: ''
    }
  }
];

export const GUARANTEE_POINTS = [
  {
    icon: 'ShieldCheck',
    title: '100% Human Submissions',
    description: 'Zero spam bots or scraper scripts. Every listing is meticulously submitted manually to protect your brand from Google algorithmic penalties.'
  },
  {
    icon: 'Clock',
    title: '48-72 Hour Delivery',
    description: 'We move fast. Receive your live submission tracking sheet with proof screenshot URLs in your inbox within 72 hours max.'
  },
  {
    icon: 'RefreshCw',
    title: 'Replacement Warranty',
    description: 'If a directory rejects your product or goes offline, we automatically replace it with an equal or higher DR alternative for free.'
  },
  {
    icon: 'DollarSign',
    title: '30-Day Index Guarantee',
    description: 'If at least 80% of submitted directory pages fail to index within 30 days, get an immediate, hassle-free 100% refund.'
  }
];
