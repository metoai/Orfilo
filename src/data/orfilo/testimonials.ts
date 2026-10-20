export interface OrfiloTestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarUrl: string;
  quote: string;
  deliverablesSaved: number;
  highlightMetric: string;
}

export const ORFILO_TESTIMONIALS: OrfiloTestimonial[] = [
  {
    id: 'test-1',
    name: 'Selamawit T.',
    role: 'Creative Technologist',
    company: 'Addis Design Studio',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    quote: 'Generating 3D models and character assets in Midjourney and Gemini used to mean a folder with 500 unsearchable hashes. Orfilo names them properly and keeps them sorted into subfolders automatically.',
    deliverablesSaved: 1420,
    highlightMetric: '1,420+ Renders Organized',
  },
  {
    id: 'test-2',
    name: 'Alex Rivers',
    role: 'Staff AI Engineer',
    company: 'HyperScale Labs',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    quote: 'I code with Claude 3.7 and Cursor all day. The Chrome extension lets me save hooks and schemas right from the chat without opening Finder. My downloads folder has finally been clean for two months straight.',
    deliverablesSaved: 890,
    highlightMetric: '14 hrs Saved/Week',
  },
  {
    id: 'test-3',
    name: 'Marcus Vance',
    role: 'Indie Founder & Builder',
    company: 'ShipFastAI',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    quote: 'The semantic auto-naming is pure magic. I ran a quick prompt to generate an SVG icon set, and Orfilo immediately recognized each icon and created individual clean filenames with project routing.',
    deliverablesSaved: 2150,
    highlightMetric: '100% Zero Lost Files',
  },
];

export const ORFILO_SOCIAL_PROOF_METRICS = [
  { label: 'AI Deliverables Organized', value: '18,400+' },
  { label: 'Hours of Search Saved', value: '4,200+' },
  { label: 'Supported AI Models', value: '25+' },
  { label: 'Customer Satisfaction', value: '99.4%' },
];
