# concerns/code-quality.md — Applies to EVERY task, EVERY phase

## 1. TypeScript

- Strict mode, always on. No `any` — use `unknown` and narrow, or define a proper type.
- Types for database entities are derived from the Drizzle schema (`DATABASE.md`) — never hand-duplicated.

## 2. Next.js Conventions

- **Server Components by default.** Client Components (`"use client"`) only where genuinely needed: interactivity, hooks, browser-only APIs, or components using Zustand/TanStack Query client-side.
- Use Cache Components (`use cache`) deliberately per `ARCHITECTURE.md` guidance — dynamic data (showtimes, seat availability) is never cached; static/marketing content can be.
- Use `proxy.ts` (not `middleware.ts`, which is deprecated in Next.js 16) for tenant resolution.

## 3. State Management

- **TanStack Query** for all server data — no manual `useEffect` + `fetch` patterns.
- **Zustand** only for genuinely client-only, ephemeral state (POS cart in progress, seat selection UI state before submission). Never used to cache or duplicate server data that TanStack Query already owns.
- **TanStack Table** for admin data grids — don't hand-roll table sorting/filtering/pagination.

## 4. Testing

- **Vitest** for unit/integration tests — required for any business logic with real consequences if wrong: pricing calculations, loyalty point math, tax/fee calculations, refund logic.
- **Playwright** for end-to-end tests on critical flows: ticket booking (seat selection → payment → confirmation), POS sale (including offline mode), staff login/permission enforcement.
- A task is not "done" if it introduces new business logic without a corresponding test.

## 5. Naming & Structure

- Follow the folder structure defined in `ARCHITECTURE.md` — don't introduce new top-level patterns without updating that document first.
- Descriptive names over clever names. A future session (or a different agent) must be able to understand intent without re-deriving it.

## 6. Checklist

- [ ] No `any` types introduced
- [ ] Server Component used unless a specific client-side need justifies `"use client"`
- [ ] New business logic has a Vitest test
- [ ] Critical flow changes have Playwright coverage
- [ ] No duplicated server-state caching between TanStack Query and Zustand
