# concerns/error-handling.md — Applies to EVERY task, EVERY phase

## 1. User-Facing Errors

- Never show raw stack traces, database errors, or internal exception messages to cinema staff or customers.
- Every user-facing error has a plain-language message and, where relevant, a clear next step (e.g., "Payment couldn't be confirmed — try again or ask for cash" rather than a Paystack error code).
- Distinguish between recoverable errors (retry, offline queue) and terminal errors (contact support) in both the message and the UI treatment.

## 2. Offline / POS-Specific

- A failed sync must **queue for retry**, never silently drop a transaction. The staff member should see a clear "pending sync" state, not a false success or a silent failure.
- If PowerSync's upload queue hits a permanent validation error (not a transient network issue), surface it to a manager-level role for manual reconciliation — don't fail silently and don't block the till from continuing to operate.

## 3. Payments

- Payment failures always give the customer or cashier a clear next action: retry, switch payment method, or fall back to cash at the box office.
- A payment that succeeds on Paystack's side but fails to confirm in the app must never result in a double-charge on retry — check for existing successful transaction references first.

## 4. Monitoring

- Every server action and API route reports errors to Sentry with enough context (organization ID, route, action) to debug without needing to reproduce locally.
- Don't over-report: expected/handled errors (e.g., "seat already taken" during booking) are not exceptions — log them as events, not errors, unless they indicate a real bug.

## 5. Checklist

- [ ] User-facing message is plain language with a next step, not a raw error
- [ ] Offline/sync failures queue for retry, never silently drop
- [ ] Payment retry logic checks for existing successful transactions before charging again
- [ ] Sentry captures unexpected errors with organization/route context
