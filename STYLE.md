# STYLE.md — Design System

> This is the single source of truth for every visual decision in the app. If it's not written here, don't invent it — ask.

## 1. Philosophy

Clean, minimalist, **light mode only — no dark mode, ever, under any circumstance.** One confident accent color against white and neutral grays. Soft, barely-there shadows. Moderate rounding. No visual clutter, no gradients-for-the-sake-of-it, no drop shadows that scream for attention.

## 2. Color Tokens

```css
:root {
  /* Base */
  --background: #FFFFFF;
  --foreground: #1A1A1A;

  /* Accent — Deep Cinema Red */
  --accent: #A6192E;
  --accent-hover: #8A1424;
  --accent-foreground: #FFFFFF;
  --accent-tint: #FBEAEC;      /* light red for badges, subtle highlights */

  /* Neutrals */
  --muted: #F5F5F5;
  --muted-foreground: #6B6B6B;
  --border: #E5E5E5;
  --card: #FFFFFF;
  --card-border: #ECECEC;

  /* Semantic */
  --success: #1E7E34;
  --success-tint: #E8F5E9;
  --warning: #B45309;
  --warning-tint: #FEF3E2;
  --destructive: #C0392B;
  --destructive-tint: #FBEAEC;
}
```

**Rule:** the accent color (`--accent`) is used deliberately — primary buttons, active states, key highlights (e.g., a selected seat, an active tab). It is not used for large background fills or decorative purposes. Most of the UI is white/neutral; red is the exception that draws the eye where it matters.

## 3. Typography

- **UI text:** Geist Sans — clean, geometric, pairs natively with the Next.js/Vercel stack.
- **Numeric/data display:** Geist Mono — used specifically for ticket codes, prices, seat numbers, order IDs, and anywhere numeric alignment matters (POS totals, reports). This is a deliberate choice for a ticketing/POS product where numbers need to be scannable at a glance.

```css
--font-sans: 'Geist Sans', system-ui, sans-serif;
--font-mono: 'Geist Mono', ui-monospace, monospace;
```

Type scale (Tailwind default scale is fine — do not invent a custom scale):
- Headings: `text-2xl` / `text-xl` / `text-lg`, font-weight 600
- Body: `text-base` / `text-sm`, font-weight 400
- Numeric/data (prices, codes): use `font-mono`, font-weight 500

## 4. Radius

Moderately rounded — **8–12px** range.

```css
--radius-sm: 8px;   /* buttons, inputs, small badges */
--radius-md: 10px;  /* cards, dropdowns */
--radius-lg: 12px;  /* modals, large containers */
```

No sharp corners (0px), no pill-shaped elements except where semantically appropriate (small status badges only).

## 5. Shadows

Barely-there. Depth should be implied, never shouted.

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 1px 3px rgba(0, 0, 0, 0.04), 0 2px 6px rgba(0, 0, 0, 0.03);
--shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.05);
```

Use `--shadow-sm` for cards at rest, `--shadow-md` on hover/interactive elements, `--shadow-lg` sparingly for modals/overlays only.

## 6. Component Approach

- **shadcn/ui** as the base component layer, restyled with the tokens above.
- No custom component library beyond what shadcn/ui + Tailwind utilities provide, unless a phase file explicitly calls for something bespoke (e.g., the seat map, which is a custom SVG/canvas component).
- Every component must work with these tokens only — no one-off hex values, no arbitrary Tailwind values (`bg-[#123456]`) outside this file.

## 7. Responsive Requirements

See `concerns/responsive.md` for the full checklist. Summary: this app is used across radically different contexts — customer phones, box office tablets (often portrait), manager desktop dashboards, and digital signage TVs — and must look intentional, not just "not broken," on all of them.

## 8. What NOT to Do

- No dark mode toggle, no `dark:` Tailwind variants anywhere in the codebase.
- No gradients as decoration (a subtle gradient for a genuine functional purpose — e.g., a chart fill — is fine; gradients on buttons/cards for "visual interest" are not).
- No shadow so heavy it looks like Material Design circa 2018.
- No accent color usage beyond what's defined in Section 2 — don't introduce a second "brand color."
- No custom fonts beyond Geist Sans/Geist Mono.
