---
name: animation-systems-stripe-linear
description: Product-grade motion principles modeled after Stripe, Linear, Apple, and Vercel. Focuses on restraint, purposeful choreography, physical easing, GPU acceleration, and reduced motion.
source_repo: https://github.com/MengTo/Skills/blob/main/agent-skills/web-design/animation-systems/SKILL.md
license: MIT
---

# Product-Grade Motion Systems (Stripe × Linear × Apple)

Motion in production apps is an engineering constraint, not entertainment. If an animation does not explain hierarchy, confirm user action, or provide spatial continuity, delete it.

## The Four Golden Rules
1. **Restraint Over Volume**: One memorable hero transition; everything else is subtle, fast supporting motion.
2. **Strict Physical Curves**: Never use standard CSS `ease-in` for interactive UI; it creates artificial lag. Use fast ease-out curves (`cubic-bezier(0.23, 1, 0.32, 1)`).
3. **GPU-Accelerated Properties Only**: Animate ONLY `transform` and `opacity`. Never animate layout triggers: `width`, `height`, `top`, `left`, `margin`, or `padding`.
4. **Mandatory Reduced Motion**: Respect `prefers-reduced-motion` at the root stylesheet or via hooks.

## Motion Token Palette
- **Micro-interactions (Button click, toggle)**: 120ms–180ms | `cubic-bezier(0.2, 0, 0, 1)`
- **UI State Changes (Dropdown, popover, badge expand)**: 180ms–240ms | `cubic-bezier(0.16, 1, 0.3, 1)`
- **Overlay Entrances (Sheet, Modal, Drawer)**: 240ms–350ms | `cubic-bezier(0.32, 0.72, 0, 1)`
- **Section Reveals on Scroll**: 400ms–600ms | Stagger delay: 40ms–60ms per child item

## Practical Motion Primitives
```tsx
// Fade + Rise (Default Entrance)
const entranceVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] } },
};

// Subtle Card Hover: Lift + Border Accent
export const cardHoverClasses = "transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-lg";
```
