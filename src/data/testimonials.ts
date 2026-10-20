export interface FounderTestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  companyUrl: string;
  avatar: string;
  initials: string;
  category: 'SaaS' | 'AI' | 'DevTools' | 'Mobile';
  tierPurchased: 'Growth' | 'Scale' | 'Starter';
  verified: boolean;
  drBefore: number;
  drAfter: number;
  trafficGrowth: string;
  revenueOrUsers: string;
  quote: string;
  highlightMetric: string;
  daysToResult: string;
  indexedBacklinksCount: number;
}

export const FOUNDER_TESTIMONIALS: FounderTestimonial[] = [
  {
    id: '1',
    name: 'Alex Rivera',
    role: 'Founder & CEO',
    company: 'SupaMetrics',
    companyUrl: 'https://supametrics.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    initials: 'AR',
    category: 'SaaS',
    tierPurchased: 'Growth',
    verified: true,
    drBefore: 12,
    drAfter: 38,
    trafficGrowth: '+4,200/mo',
    revenueOrUsers: '18 paying customers',
    highlightMetric: 'DR +26 in 21 days',
    daysToResult: '21 days',
    indexedBacklinksCount: 84,
    quote:
      'We spent 3 weeks getting nowhere trying to do submissions ourselves after work. Launchdir took care of 90 directories in under 3 days. Ahrefs picked up the links within a fortnight, our DR shot from 12 to 38, and we closed 18 paying users directly from AlternativeTo and SaaSHub referral traffic!'
  },
  {
    id: '2',
    name: 'Elena Rostova',
    role: 'Solo Founder',
    company: 'PromptGenius AI',
    companyUrl: 'https://promptgenius.ai',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    initials: 'ER',
    category: 'AI',
    tierPurchased: 'Scale',
    verified: true,
    drBefore: 7,
    drAfter: 44,
    trafficGrowth: '+9,850/mo',
    revenueOrUsers: '$3,400 MRR boost',
    highlightMetric: 'DR +37 & #1 on Google',
    daysToResult: '30 days',
    indexedBacklinksCount: 152,
    quote:
      'As a solo AI builder, form-filling 150 directories is the quickest way to burn out. Launchdir delivered a crystal-clear Google Sheet with live URLs and screenshots for every listing. Getting featured on Toolify, Futurepedia, and Uneed gave us the search authority needed to rank #1 for our primary prompt engineering keywords.'
  },
  {
    id: '3',
    name: 'Marcus Chen',
    role: 'Co-founder & CTO',
    company: 'DevPulse API',
    companyUrl: 'https://devpulse.tech',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    initials: 'MC',
    category: 'DevTools',
    tierPurchased: 'Growth',
    verified: true,
    drBefore: 19,
    drAfter: 48,
    trafficGrowth: '+6,100/mo',
    revenueOrUsers: '420 GitHub Stars',
    highlightMetric: 'DR 19 → 48',
    daysToResult: '28 days',
    indexedBacklinksCount: 89,
    quote:
      'The indexing velocity was surreal. Within 10 days of receiving our delivery sheet, over 80% of the do-follow backlinks showed up in Google Search Console. It completely de-risked our cold outreach because prospective engineering teams now see high third-party trust whenever they Google our brand.'
  },
  {
    id: '4',
    name: 'Sarah Jenkins',
    role: 'Founder',
    company: 'FormFlow',
    companyUrl: 'https://formflow.dev',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    initials: 'SJ',
    category: 'SaaS',
    tierPurchased: 'Growth',
    verified: true,
    drBefore: 15,
    drAfter: 41,
    trafficGrowth: '+3,400/mo',
    revenueOrUsers: '34 signups/week',
    highlightMetric: 'DR 15 → 41 in 18 days',
    daysToResult: '18 days',
    indexedBacklinksCount: 81,
    quote:
      'At $99, this is literally the highest ROI marketing expense we have ever paid for. An SEO agency quoted us $2,500 for backlink building with no timeline guarantees. Launchdir got our SaaS into Indie Hackers, BetaList, and 85+ other high-DR sites with zero friction.'
  },
  {
    id: '5',
    name: 'Liam Vance',
    role: 'Indie Hacker',
    company: 'HabitMate iOS',
    companyUrl: 'https://habitmate.app',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    initials: 'LV',
    category: 'Mobile',
    tierPurchased: 'Starter',
    verified: true,
    drBefore: 4,
    drAfter: 28,
    trafficGrowth: '+1,800 App Store hits',
    revenueOrUsers: '850+ Downloads',
    highlightMetric: 'DR +24 initial kickstart',
    daysToResult: '14 days',
    indexedBacklinksCount: 38,
    quote:
      'Mobile apps desperately need web domain backlinks to rank in Google app search carousels. The Starter plan gave HabitMate the initial backlink foundation it needed. We started seeing organic web installs within two weeks.'
  },
  {
    id: '6',
    name: 'Darius K.',
    role: 'Creator & Engineer',
    company: 'AgentOps AI',
    companyUrl: 'https://agentops.cloud',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    initials: 'DK',
    category: 'AI',
    tierPurchased: 'Scale',
    verified: true,
    drBefore: 11,
    drAfter: 52,
    trafficGrowth: '+14,200/mo',
    revenueOrUsers: '$7,200 MRR reached',
    highlightMetric: 'DR 11 → 52 in 35 days',
    daysToResult: '35 days',
    indexedBacklinksCount: 158,
    quote:
      'The multi-variant copywriting in the Scale package is genius. Every directory received custom descriptions tailored to their audience, eliminating any duplicate content penalty fears. Our domain now ranks for over 180 commercial search terms.'
  }
];

export const SOCIAL_PROOF_METRICS = {
  startupsLaunched: '1,420+',
  totalBacklinksBuilt: '128,000+',
  averageDrJump: '+24 DR',
  averageHoursSaved: '45+ hrs',
  customerRating: '4.95 / 5.0'
};
