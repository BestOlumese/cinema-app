// Files are added here grouped by domain and re-exported, one export per table,
// per DATABASE.md. Auth tables below are Better Auth's own generated schema
// (regenerate via `npx @better-auth/cli generate` after changing src/lib/auth.ts,
// never hand-edit) — the audit_log extension from DATABASE.md §1 lands with
// Phase 1 Task 6.
export * from "./auth";
export * from "./branch";
