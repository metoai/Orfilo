---
name: nextjs-rsc-streaming-performance
description: Next.js App Router performance optimizations covering React Server Component serialization boundaries, streaming with Suspense, and request deduplication.
source_repo: https://github.com/gohypergiant/agent-skills/blob/main/skills/accelint-nextjs-best-practices/SKILL.md
license: MIT
---

# Next.js App Router RSC & Streaming Performance

Best practices for optimizing React Server Components (RSC) and eliminating server-side waterfalls.

## Critical Patterns
1. **Prevent Sequential Waterfalls**: Never await independent data calls sequentially in server components. Execute concurrently using `Promise.all`:
   ```tsx
   // ✅ Concurrent Fetching
   const [userData, analyticsData] = await Promise.all([
     getUser(userId),
     getAnalytics(userId),
   ]);
   ```
2. **Granular Suspense Boundaries**: Do not block the entire page on slow secondary data. Wrap slow queries in `<Suspense fallback={<Skeleton />}>` to stream the layout instantly.
3. **Minimize RSC Serialization Payload**: Props passed across the Server-to-Client boundary (`"use client"`) are serialized into the HTML payload. Pass only the required fields, never raw database models with 50 unused columns.
4. **Request Deduplication with `React.cache()`**: Wrap per-request database lookups or session queries in `React.cache()` to share results across layout and page without duplicate queries.
