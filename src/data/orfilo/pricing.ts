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
    name: 'Starter',
    price: '$0',
    period: 'forever free',
    description: 'Perfect for individual tinkerers and prompt experimenters.',
    features: [
      'Up to 100 captured deliverables',
      'Chrome extension 1-click capture',
      'Basic keyword search & filtering',
      'Web dashboard file management',
      'Community Discord access',
    ],
    ctaLabel: 'Start for Free',
    isPopular: false,
  },
  {
    id: 'pro',
    name: 'Pro Lifetime',
    badge: 'Most Popular',
    price: '$49',
    period: 'one-time payment',
    description: 'For active AI builders, engineers, and creators who need a clean vault.',
    features: [
      'Unlimited deliverables & storage',
      'Gemini 2.5 Flash semantic auto-naming',
      'Unlimited nested project subfolders',
      'Full prompt and context preservation',
      'PostgreSQL Supabase Vault with RLS',
      'Chrome extension companion v2',
      'Instant copy, preview & download',
      'Lifetime access & all future updates',
    ],
    ctaLabel: 'Claim Lifetime Deal',
    isPopular: true,
  },
  {
    id: 'team',
    name: 'Team Workspace',
    badge: 'Scale',
    price: '$149',
    period: 'one-time per team',
    description: 'For startup teams and agencies sharing deliverables across models.',
    features: [
      'Everything in Pro Lifetime',
      'Shared team workspaces & folders',
      'Multi-seat collaboration (up to 10 members)',
      'Custom LLM classification rules',
      'Webhook sync to GitHub & S3 buckets',
      'Activity audit trails & file versioning',
      'Dedicated launch & priority SLA',
    ],
    ctaLabel: 'Get Team Workspace',
    isPopular: false,
  },
];

export const ORFILO_GUARANTEE_POINTS = [
  {
    title: 'Zero Subscription Lock-In',
    desc: 'Pay once, keep forever. No monthly surprise renewals or billing creeping.',
  },
  {
    title: 'PostgreSQL Row-Level Security',
    desc: 'Your code, prompts, and images are protected by enterprise PostgreSQL RLS encryption.',
  },
  {
    title: '14-Day Money-Back Guarantee',
    desc: 'If Orfilo doesn’t save you hours of messy download hunting, get an immediate full refund.',
  },
];
