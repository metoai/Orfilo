export interface OrfiloFaqItem {
  question: string;
  answer: string;
}

export const ORFILO_FAQS: OrfiloFaqItem[] = [
  {
    question: 'How does the Orfilo Chrome Extension capture deliverables?',
    answer:
      'The companion extension embeds a lightweight, non-intrusive "Save to Orfilo" action button alongside code blocks, images, and document chips in ChatGPT, Claude, Gemini, Cursor, and v0. Clicking it transmits the generated asset directly to your private Orfilo vault without needing to manually download or rename files.',
  },
  {
    question: 'How does the Gemini Flash semantic naming work?',
    answer:
      'Instead of saving arbitrary filenames like "image_92384_final.png", Orfilo inspects the prompt context and file contents using Gemini 2.5 Flash. It identifies the exact entity, language, and purpose, generating standardized kebab-case names like "habesha-hero-character-3d.png" or "use-session-auth.ts" in under 200ms.',
  },
  {
    question: 'Does Orfilo support nested project subfolders?',
    answer:
      'Yes! Every project supports unlimited nested subfolders (e.g. "Habesha Model / Marketing / 3D Renders"). You can drag-and-drop artifacts, rename subfolder paths, and configure automatic routing rules based on file extension or source model.',
  },
  {
    question: 'Is my data secure and isolated?',
    answer:
      'Strictly secure. Orfilo is built on Supabase PostgreSQL with Row-Level Security (RLS) enforced at the database level. Every query is authenticated via your personal JWT or cryptographically hashed extension token (SHA-256). No other user or model training pipeline can ever access your files.',
  },
  {
    question: 'Can I use Orfilo without the Chrome Extension?',
    answer:
      'Absolutely. The web dashboard provides full drag-and-drop file upload, code snippet paste, project management, and search. The Chrome extension simply streamlines capturing directly from active AI chat tabs.',
  },
  {
    question: 'What happens if the local server or extension goes offline?',
    answer:
      'The extension includes graceful offline caching. If disconnected from the server, it queues capture actions in local browser storage and synchronizes them automatically once your session or server reconnects.',
  },
];
