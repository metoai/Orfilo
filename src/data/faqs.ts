export interface FaqItem {
  id: string;
  category: 'Quality' | 'Process' | 'Guarantees' | 'Pricing';
  question: string;
  answer: string;
  badge?: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'backlink-quality',
    category: 'Quality',
    question: 'Will these directory backlinks actually improve my Google ranking and Domain Rating (DR)?',
    badge: 'SEO Impact',
    answer:
      'Yes, significantly. For new or low-DR websites (DR 0–30), Google heavily relies on seed authority and topical relevance signals. Directory backlinks from authoritative platforms (DR 70–93 like Product Hunt, AlternativeTo, and SourceForge) pass high foundational PageRank, establish brand legitimacy, and kickstart natural crawling. Our customers experience an average DR jump of +24 within 30 days.'
  },
  {
    id: 'submission-speed',
    category: 'Process',
    question: 'How fast will my submissions be completed, and when do they appear on Google?',
    badge: 'Turnaround',
    answer:
      'We complete all manual submissions within 48 to 72 hours (5 business days for Starter). Upon completion, you receive a transparent Google Sheet / Notion dashboard containing live listing URLs and submission verification screenshots. Directory indexing begins almost immediately; most directories get indexed by Google within 7 to 21 days, with Ahrefs and Moz picking them up as their bots refresh.'
  },
  {
    id: 'manual-vs-bots',
    category: 'Quality',
    question: 'Are submissions performed manually or automated using software bots?',
    badge: 'Safety First',
    answer:
      '100% human-performed submissions. Automated bots leave footprint patterns, make errors in field formatting, and trigger spam filters that can penalize your domain. Our trained submission specialists manually create accounts, select optimal sub-categories, upload your logo in correct dimensions, and customize tags for each individual directory directory by directory.'
  },
  {
    id: 'duplicate-content',
    category: 'Quality',
    question: 'Does submitting to 90+ directories cause duplicate content penalties with Google?',
    badge: 'Anti-Spam Tech',
    answer:
      'No. In our Growth and Scale packages, we craft 3 to 5 unique copy variations highlighting different angles, feature sets, and target keywords of your product. Even for Starter, directory listing pages are understood by Google search algorithms as entity citations, not duplicate canonical blog content.'
  },
  {
    id: 'rejection-guarantee',
    category: 'Guarantees',
    question: 'What happens if an editorial team or directory rejects my startup?',
    badge: 'Risk-Free',
    answer:
      'Some high-authority directories have strict editorial criteria. If any directory rejects your product, delays publication beyond 14 days, or goes temporarily offline, our system automatically replaces it with a curated alternative directory of equal or higher Domain Rating (DR) at zero extra cost.'
  },
  {
    id: 'money-back-guarantee',
    category: 'Guarantees',
    question: 'Do you offer a money-back guarantee?',
    badge: '100% Money-Back',
    answer:
      'Yes! We offer a no-questions-asked 30-Day Index Guarantee. If our team fails to deliver verified submission proof with screenshots for at least 80% of your purchased directory tier, or if the submissions are not completed within the promised turnaround window, we issue an immediate 100% full refund.'
  },
  {
    id: 'dofollow-vs-nofollow',
    category: 'Quality',
    question: 'Are all the backlinks Do-Follow or No-Follow?',
    badge: 'Link Breakdown',
    answer:
      'We focus aggressively on platforms that offer permanent Do-Follow backlinks. Starter includes guaranteed 15+ Do-Follow, Growth includes 35+ Do-Follow, and Scale includes 65+ Do-Follow links. The remaining links are high-trust No-Follow platforms (like Product Hunt discussions or Crunchbase) that drive significant direct referral traffic and balance your backlink profile naturally in Google’s eyes.'
  },
  {
    id: 'founder-requirements',
    category: 'Process',
    question: 'What information do I need to provide? How long does intake take?',
    badge: '3-Minute Form',
    answer:
      'Our intake process is frictionless and takes less than 3 minutes. After checkout, you fill out a simple questionnaire: your website URL, product title, 1-line pitch, 100-word description, target category tags, and founder Twitter handle. We take care of everything else—including formatting, sizing assets, and submission execution.'
  },
  {
    id: 'one-time-vs-subscription',
    category: 'Pricing',
    question: 'Is this a monthly subscription or a one-time purchase?',
    badge: 'No Hidden Fees',
    answer:
      'It is strictly a 100% ONE-TIME payment. No sneaky auto-renewals, no monthly retainers. Your directory profiles and backlinks remain live permanently on the host directories forever.'
  }
];
