---
name: technical-seo-geo-audit
description: Technical SEO, metadata architecture, OpenGraph card generation, sitemaps, and Generative Engine Optimization (GEO/AI search readiness).
source_repo: https://github.com/seo-skills/seo-audit-skill/blob/main/skill/SKILL.md
license: MIT
---

# Technical SEO & AI Search Readiness (GEO)

High ranking in modern search engines requires automated metadata generation, structured JSON-LD schemas, and crawlable semantic HTML.

## Next.js Metadata Architecture
- Export dynamic metadata via `generateMetadata()` in App Router pages:
```typescript
import type { Metadata } from 'next';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);
  return {
    title: `${product.name} | Acme SaaS`,
    description: product.summary,
    openGraph: {
      title: product.name,
      description: product.summary,
      images: [{ url: `/api/og?title=${encodeURIComponent(product.name)}`, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `https://acme.com/products/${params.id}`,
    },
  };
}
```

## AI Search / Generative Engine Optimization (GEO)
- Maintain a valid `llms.txt` and `robots.txt` at the root domain so AI crawlers (Perplexity, ChatGPT, Claude) can index your documentation and product value proposition accurately.
- Include structured JSON-LD data (`SoftwareApplication` or `Organization` schema) on marketing landing pages.
