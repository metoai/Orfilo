---
name: shadcn-ui-system
description: Authoritative standards for shadcn/ui and Tailwind CSS component architecture. Enforces semantic color tokens, Radix UI composition, accessibility primitives, and strict separation between layout and style.
source_repo: https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md?plain=1
license: MIT
---

# shadcn/ui & Radix UI Component Standards

This skill establishes strict rules for generating and modifying UI components using shadcn/ui, Radix primitives, and Tailwind CSS.

## Core Principles
1. **Never Reinvent Primitives**: Always leverage existing headless components from `@radix-ui` via shadcn rather than building ad-hoc `div` wrappers.
2. **Semantic Color Tokens**: Never use raw Tailwind palette colors (e.g., `bg-blue-600`, `text-slate-900`). Always use semantic tokens: `bg-primary`, `text-primary-foreground`, `bg-muted`, `text-muted-foreground`, `border-border`.
3. **Layout vs Styling Boundary**: `className` passed to components should dictate outer layout (`w-full`, `flex`, `gap-4`, `col-span-2`), never mutate internal component design invariants.

## Critical Implementation Rules

### Form Composition
- Forms must compose `FieldGroup`, `Field`, `FieldLabel`, and controls. Never use loose `div` tags with `space-y-*` or `grid`.
- Validation states must bind `data-invalid` to the `Field` container and `aria-invalid` to the input control.
- Multiple options (2–5 items) must use `ToggleGroup` instead of custom button loops with local active state.

```tsx
// ✅ Correct Form Pattern
<FieldGroup>
  <Field data-invalid={Boolean(errors.email)}>
    <FieldLabel htmlFor="email">Work Email</FieldLabel>
    <Input id="email" type="email" aria-invalid={Boolean(errors.email)} />
    {errors.email && <FieldDescription className="text-destructive">{errors.email.message}</FieldDescription>}
  </Field>
</FieldGroup>
```

### Spacing & Sizing
- **No `space-x-*` or `space-y-*`**: Always use flexbox or grid with `gap-*` (e.g., `flex flex-col gap-4`).
- **Use `size-*` for Equal Dimensions**: Write `size-9` instead of `w-9 h-9`.
- **Text Truncation**: Use the `truncate` utility instead of longhand `overflow-hidden text-ellipsis whitespace-nowrap`.

### Dialogs, Overlays & Accessibility
- Every `Dialog`, `Sheet`, and `Drawer` MUST contain a `DialogTitle` (or `SheetTitle`/`DrawerTitle`). If visually redundant, apply `className="sr-only"`.
- Use `asChild` on triggers (e.g., `<DialogTrigger asChild><Button>Open</Button></DialogTrigger>`) to prevent invalid nested buttons.
- Overlays manage their own `z-index` and focus trapping via Radix primitives; never hardcode arbitrary `z-[9999]` overrides.
