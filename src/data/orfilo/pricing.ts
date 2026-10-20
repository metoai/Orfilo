export interface OrfiloPricingTier {
  id: string;
  name: string;
  badge?: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaLabel: string;
  isPopular?: boolean;
}

export const ORFILO_PRICING_TIERS: OrfiloPricingTier[] = [
  {
    id: 'free',
    name: 'Free Beta',
    price: '$0',
    period: 'forever free in beta',
    description: 'Perfect for individual builders testing out automated AI asset capture.',
    features: [
      'Up to 100 captured AI deliverables',
      'Companion Chrome extension',
      'Web vault dashboard & search',
      'Direct copy, download & preview',
      'Community Discord & builder feedback',
    ],
    ctaLabel: 'Get Started Free',
    isPopular: false,
  },
  {
    id: 'pro',
    name: 'Early Adopter Lifetime',
    badge: 'Limited Launch Deal',
    price: '$29',
    period: 'one-time payment',
    description: 'Special one-time rate for early supporters. Lock in unlimited vault capacity forever.',
    features: [
      'Unlimited captured deliverables',
      'Gemini 2.5 Flash semantic auto-naming',
      'Unlimited nested project subfolders',
      'Full prompt history & metadata preservation',
      'PostgreSQL Supabase vault with strict RLS',
      'Chrome extension companion v2',
      'All future updates & pro features included',
      'Zero monthly subscriptions — pay once, keep forever',
    ],
    ctaLabel: 'Claim Early Adopter Deal ($29)',
    isPopular: true,
  },
  {
    id: 'team',
    name: 'Team Workspace',
    badge: 'Multi-Seat',
    price: '$99',
    period: 'one-time per team',
    description: 'For small startup teams and agencies sharing deliverables across models.',
    features: [
      'Everything in Early Adopter Lifetime',
      'Shared team workspaces & folders',
      'Multi-seat collaboration (up to 5 team seats)',
      'Cross-model AI deliverable sharing',
      'Custom LLM classification rules',
      'Priority early-adopter founder support',
    ],
    ctaLabel: 'Get Team Workspace ($99)',
    isPopular: false,
  },
];

export const ORFILO_GUARANTEE_POINTS = [
  {
    title: 'Zero Subscription Fatigue',
    desc: 'Pay once, keep forever. No sneaky monthly auto-renewals or creeping seat fees.',
  },
  {
    title: 'PostgreSQL Row-Level Security',
    desc: 'Your code, prompts, and assets are encrypted and isolated at the database level with Supabase RLS.',
  },
  {
    title: '14-Day Money-Back Guarantee',
    desc: 'If Orfilo doesn’t save you hours of messy download hunting, get an immediate, hassle-free 100% refund.',
  },
];
