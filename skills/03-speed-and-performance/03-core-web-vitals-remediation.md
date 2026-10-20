---
name: core-web-vitals-remediation
description: Diagnostic and remediation playbooks for Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS).
source_repo: https://github.com/rampstackco/claude-skills/blob/main/skills/performance-optimization/SKILL.md
license: MIT
---

# Core Web Vitals Diagnostic & Remediation

Standard target thresholds and debugging playbooks for Google Core Web Vitals.

## Metric Targets & Root Causes

### 1. Largest Contentful Paint (LCP) | Target: < 2.5s
- **Primary Causes**: Slow Time to First Byte (TTFB > 800ms), client-rendered hero element, large uncompressed hero image, webfont swap delay.
- **Remediation**:
  - Preload LCP hero image: `<Image priority ... />`.
  - Ensure LCP markup is rendered via Server Components (RSC), not fetched client-side inside `useEffect`.
  - Self-host fonts using `next/font` with `display: swap`.

### 2. Interaction to Next Paint (INP) | Target: < 200ms
- **Primary Causes**: Long JavaScript tasks (> 50ms) blocking the main thread during user input, heavy React re-renders, expensive layout recalculations.
- **Remediation**:
  - Break long synchronous loops with `scheduler.yield()` or microtask scheduling.
  - Debounce high-frequency inputs (search typing, window resize).
  - Use CSS transitions instead of JavaScript state animations during user click actions.

### 3. Cumulative Layout Shift (CLS) | Target: < 0.1
- **Primary Causes**: Images/videos without dimensions, late-injected banners/ads above the fold, dynamic webfont FOIT/FOUT.
- **Remediation**:
  - Reserve aspect-ratio containers (`aspect-video`, `h-[400px]`) before content arrives.
  - Avoid injecting announcement banners dynamically above existing navigation.
