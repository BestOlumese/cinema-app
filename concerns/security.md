# concerns/security.md — Applies to EVERY task, EVERY phase

## 1. Multi-Tenant Isolation (highest priority)

- **Every query touching tenant data must be scoped to the correct organization.** Application-level `WHERE org_id = ...` filtering alone is fragile — one missed clause leaks data across cinemas.
- **Postgres Row-Level Security (RLS) is required on every tenant-scoped table**, as a second, engine-enforced layer that cannot be forgotten by a future code change.
- A chain account's head office may see data across its own branches — but never across a different, unrelated organization.

## 2. Auth & Permissions

- **Never trust client-side role checks.** Every sensitive action (refund, price override, staff role change) must call `auth.api.hasPermission()` server-side, even if the UI already hides the button from unauthorized roles.
- Better Auth does not generate an audit trail automatically — **build a dedicated audit log table** recording who performed which sensitive action (refunds, void transactions, pricing changes, role changes), when, and from which organization/branch.
- Session validation happens server-side on every request that touches tenant data.

## 3. Payments

- **Verify Paystack webhook signatures** on every incoming webhook — never process a payment confirmation from an unverified source.
- Never log full card details or sensitive payment payloads, even in error logs.
- Cash transactions (offline-safe) must still be attributed to a specific staff account and till for reconciliation.

## 4. Secrets & Config

- No API keys, secrets, or credentials in client-side code, ever — including `NEXT_PUBLIC_` variables, which are never used for anything sensitive.
- All secrets sourced from environment variables per `ENV.md`, never hardcoded.

## 5. Rate Limiting

- Public-facing endpoints (booking, auth, password reset) require rate limiting to prevent abuse — especially the self-serve signup flow, which is a public attack surface.

## 6. Checklist (check before marking any backend task done)

- [ ] Tenant-scoped queries verified against RLS policy, not just application filtering
- [ ] Sensitive actions check permissions server-side, not just hidden in the UI
- [ ] Audit log entry written for any sensitive staff action
- [ ] No secrets present in any client-shipped code or public env vars
- [ ] Public endpoints rate-limited where relevant
