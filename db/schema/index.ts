// Files are added here grouped by domain and re-exported, one export per table,
// per DATABASE.md. Auth tables below are Better Auth's own generated schema
// (regenerate via `npx @better-auth/cli generate` after changing src/lib/auth.ts,
// never hand-edit) — the branch/audit_log extensions from DATABASE.md §1 land in
// Phase 1.
export * from "./auth";
