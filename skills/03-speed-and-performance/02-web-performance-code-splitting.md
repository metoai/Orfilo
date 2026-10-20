---
name: web-performance-code-splitting
description: Web performance optimization via bundle splitting, route lazy-loading, service worker caching, and asset compression.
source_repo: https://github.com/secondsky/claude-skills/blob/main/plugins/web-performance-optimization/skills/web-performance-optimization/SKILL.md
license: MIT
---

# Bundle Optimization & Code Splitting

Rules for keeping client JavaScript bundle sizes minimal, eliminating blocking network dependencies, and achieving sub-second initial renders.

## Bundle Budget Guardrails
- **Initial Client JS Budget**: < 150 KB compressed (Brotli/Gzip) for the landing/dashboard page.
- **Route Chunks**: < 75 KB per dynamic route.
- **Heavy Client Libraries**: Never include rich text editors (`TipTap`), chart engines (`Recharts`), or syntax highlighters in the initial bundle. Load them dynamically with `next/dynamic` or `React.lazy`.

```tsx
// ✅ Correct Dynamic Loading
import dynamic from 'next/dynamic';

const AnalyticsChart = dynamic(() => import('@/components/AnalyticsChart'), {
  loading: () => <div className="h-64 w-full animate-pulse bg-muted rounded-lg" />,
  ssr: false, // Charts do not need server rendering if dependent on client window dimensions
});
```

## Image & Asset Optimization Standards
- Always serve modern formats (`AVIF` preferred, `WebP` fallback).
- Explicit `width` and `height` (or CSS `aspect-ratio`) on all media to prevent Cumulative Layout Shift (CLS).
- Preload the LCP hero image with `<link rel="preload" ...>` or Next.js `priority={true}`. Never lazy-load the above-the-fold hero image.
