---
name: composable-components-radix
description: Patterns for enterprise-grade component API design, element polymorphism (asChild pattern), controlled vs uncontrolled state contracts, and headless accessibility.
source_repo: https://github.com/vercel/components.build/blob/main/skills/building-components/SKILL.md
license: MIT
---

# Composable Component Architecture & Polymorphism

Guidelines for authoring robust, reusable React components with clean composition boundaries, predictable state, and standard accessibility compliance.

## Architectural Taxonomy
- **Primitives**: Unstyled, accessible building blocks managing state, DOM events, and ARIA attributes (Radix UI / React Aria).
- **Components**: Themed, branded building blocks applying design tokens to primitives (`Button`, `Badge`, `Input`).
- **Blocks**: Domain-specific UI combinations (`Navbar`, `BillingCard`, `UserTable`).

## The `asChild` Polymorphism Pattern
- Avoid bloated `as="a" | "button" | "div"` props. Use the Radix `Slot` primitive with `asChild`.
- The `Slot` merges props and event handlers down to the immediate child element without adding wrapper DOM nodes.

```tsx
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva('inline-flex items-center justify-center font-medium transition-colors', {
  variants: {
    variant: { default: 'bg-primary text-primary-foreground', outline: 'border border-input bg-background' },
    size: { default: 'h-9 px-4 py-2', sm: 'h-8 px-3 text-xs' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
```

## Controlled vs Uncontrolled State
- Components handling user input must support both controlled (`value` + `onValueChange`) and uncontrolled modes (`defaultValue`).
- Avoid internal state mirrors that desynchronize from incoming props. Use `useControllableState` hooks.
