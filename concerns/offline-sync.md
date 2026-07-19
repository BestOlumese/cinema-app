# concerns/offline-sync.md — Applies to any POS/box office feature

## 1. Scope

Every table that box office/concessions staff need to read or write **while offline** must be included in PowerSync's Sync Rules. If a new feature touches offline-critical data, updating Sync Rules is part of the task — not a follow-up.

## 2. Write Path

- Client-side writes go to the local SQLite database first, then queue in PowerSync's persistent upload queue.
- The `uploadData()` function must handle **partial failures** gracefully — if one queued transaction fails validation, it must not block the rest of the queue from syncing.
- Every offline-originated transaction is tagged with the till/staff ID and a client-generated timestamp, so reconciliation can reconstruct the true order of events later.

## 3. Conflict Resolution

- Default strategy: **last-write-wins**, applied server-side when the queued write reaches Postgres.
- Any conflict that could mean lost revenue or a real-world problem (e.g., the same seat sold twice offline across two tills, inventory oversold) must be **flagged into a reconciliation report** for a manager to review — not silently resolved and forgotten.

## 4. Testing Requirement

- **Any offline-critical feature is not "done" until it has been manually tested with the network disabled** — not just "should work because PowerSync handles it." Confirm: local read/write works, queue persists across an app restart while still offline, and sync resolves correctly on reconnect.

## 5. Checklist

- [ ] New offline-relevant table added to PowerSync Sync Rules
- [ ] Partial upload-queue failures don't block the rest of the queue
- [ ] Conflict scenarios that risk real-world inconsistency are flagged for manager review, not auto-resolved silently
- [ ] Feature manually tested with network disabled, including restart-while-offline
