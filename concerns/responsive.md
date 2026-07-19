# concerns/responsive.md — Applies to EVERY screen, EVERY phase

> This app is used across a wider range of contexts than a typical web app. Treat every one of these as a real, tested target — not an afterthought.

## 1. The Contexts This App Must Support

| Context | Typical width | Notes |
|---|---|---|
| Customer mobile web (PWA) | 320px – 480px | Primary booking experience for most moviegoers |
| Customer desktop/tablet web | 768px – 1440px | Secondary booking context |
| Box office / concessions POS | 768px – 1024px | Often tablets in **portrait** orientation — do not assume landscape |
| Manager / admin dashboard | 1280px+ | Desktop-first, but must not break at 1024px (laptop users) |
| Digital signage displays | 1920px+ (up to 4K) | Viewed from a distance — text and key info must be legible at several meters, not just "not clipped" |

## 2. Hard Rules

1. **No horizontal scroll, ever** — except an intentional, clearly-affordanced carousel (e.g., film posters row).
2. **Mobile-first Tailwind usage.** Write the base (unprefixed) styles for the smallest target, then layer `sm:` `md:` `lg:` `xl:` up. Never write desktop-first and hack mobile in with overrides.
3. **Touch targets minimum 44×44px** on any screen used at a box office/POS tablet or customer mobile context. This is not optional for buttons a cashier taps repeatedly under time pressure.
4. **Digital signage screens** are a distinct layout mode, not a scaled-up version of the admin dashboard. Font sizes, spacing, and information density must be designed for glanceability from a distance — this typically means significantly larger base font sizes and fewer simultaneous elements than a desktop screen.
5. **Portrait tablet is a first-class layout**, not a squeezed desktop layout. Box office POS screens must be explicitly designed and tested in portrait 768–1024px, not just assumed to "reflow okay."
6. **Test at defined breakpoints, not just "resize the browser and eyeball it."** Minimum required test widths per new screen: 375px, 768px, 1024px, 1440px, and 1920px where the screen is signage-relevant.

## 3. Per-Task Checklist (check before marking any UI task done)

- [ ] No horizontal scroll at any tested breakpoint
- [ ] Touch targets ≥44px where the screen is used on tablet/mobile
- [ ] Text remains legible (no truncation that hides critical info like price or seat number) at the smallest supported width
- [ ] If this screen is used on box office tablets: tested in portrait orientation specifically
- [ ] If this screen is signage-relevant: tested at 1920px with a "glance test" — can the key info be read from several feet away
- [ ] A Playwright test exists asserting layout integrity at minimum 375px and 1024px

## 4. Common Failure Modes to Avoid

- Admin tables that become unusable on a manager's laptop at 1280px because they were only tested at 1920px
- POS buttons sized for mouse precision instead of finger taps
- Seat maps that don't scale/pan sensibly on a 375px phone screen
- Signage layouts that are just the customer booking page zoomed in, rather than purpose-built for distance viewing
