// Shared by playwright.config.ts and any spec that hits Better Auth's API
// directly via page.request — those calls need an explicit Origin header
// since Better Auth's originCheck middleware rejects requests without one,
// and page.request (unlike a real in-page fetch) doesn't send one automatically.
export const BASE_URL = "http://localhost:3912";
