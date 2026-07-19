# DATABASE.md — Schema Source of Truth

> This is the single source of truth for the data model. Types are derived from this schema (via Drizzle), never hand-duplicated elsewhere, per `concerns/code-quality.md`. Tables marked **[PS]** must be included in PowerSync Sync Rules per `concerns/offline-sync.md`. Tables marked **[RLS]** require Row-Level Security per `concerns/security.md` — which, in this schema, is every table with an `organizationId` or `branchId` column.

## 0. Conventions

- Primary keys: `uuid` with `defaultRandom()`.
- Every table has `createdAt` (`timestamp`, default now). Mutable tables also get `updatedAt`.
- Tenant-scoped tables carry `organizationId` and, where relevant, `branchId` — both required, both RLS-enforced.
- Prefer soft state (`status` enum column) over hard deletes where audit history matters (bookings, films, staff).
- Schema files live under `/db/schema/*.ts`, grouped by domain matching the sections below, re-exported from a single `/db/schema/index.ts`.
- **`neon_auth` schema is not ours.** This Neon project has Neon's own "Neon Auth" platform feature enabled (own schema, own `jwks`/`project_config` tables) — discovered during Phase 0's PowerSync setup, never intentionally enabled, and not used by this app (we use Better Auth in the `public` schema instead, per `ARCHITECTURE.md` §2.2). Left in place but deliberately untouched and excluded from PowerSync's publication. Don't build anything against it.

---

## 1. Auth & Tenancy (Phase 1)

Better Auth's Organization plugin generates `user`, `session`, `account`, `organization`, `member`, and `invitation` automatically — do not hand-redefine these. Extend `organization` with the fields below.

```ts
// Extension fields on Better Auth's organization table
organization: {
  // ...Better Auth core fields (id, name, slug, etc.)
  tenancyType: pgEnum('tenancy_type', ['independent', 'chain']),
}

// branch — a physical cinema location under an organization.
// An "independent" organization has exactly one branch. A "chain" has multiple.
export const branch = pgTable('branch', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organization.id),
  name: text('name').notNull(),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
});
// [RLS]

// audit_log — required since Better Auth doesn't generate one (concerns/security.md)
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  branchId: uuid('branch_id'),
  actorUserId: uuid('actor_user_id').notNull(),
  action: text('action').notNull(),           // e.g. 'refund.create', 'role.change'
  resourceType: text('resource_type').notNull(),
  resourceId: uuid('resource_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});
// [RLS]
```

**Role/permission definitions** (Cashier, Concessions Staff, Box Office, Manager, Site Admin, Platform Super-Admin) live in code as a Better Auth access-control statement, not as DB rows — see `ARCHITECTURE.md` §2.2.

---

## 2. Film & Session Management (Phase 2)

```ts
export const film = pgTable('film', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  title: text('title').notNull(),
  synopsis: text('synopsis'),
  posterUrl: text('poster_url'),          // UploadThing
  trailerUrl: text('trailer_url'),
  runtimeMinutes: integer('runtime_minutes'),
  genre: text('genre'),
  cast: jsonb('cast'),
  nfvcbRating: text('nfvcb_rating'),
  nfvcbCertificateRef: uuid('nfvcb_certificate_ref').references(() => nfvcbSubmission.id),
  status: pgEnum('film_status', ['draft', 'published', 'archived']),
  createdAt: timestamp('created_at').defaultNow(),
});
// [RLS]

export const screen = pgTable('screen', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull().references(() => branch.id),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
// [RLS] [PS]

export const seat = pgTable('seat', {
  id: uuid('id').primaryKey().defaultRandom(),
  screenId: uuid('screen_id').notNull().references(() => screen.id),
  rowLabel: text('row_label').notNull(),
  seatNumber: integer('seat_number').notNull(),
  section: text('section'),
  seatType: pgEnum('seat_type', ['standard', 'vip', 'accessible', 'couple']),
  xPosition: integer('x_position'),        // for seat map rendering
  yPosition: integer('y_position'),
});
// [RLS] [PS]

export const showtime = pgTable('showtime', {
  id: uuid('id').primaryKey().defaultRandom(),
  filmId: uuid('film_id').notNull().references(() => film.id),
  screenId: uuid('screen_id').notNull().references(() => screen.id),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: pgEnum('showtime_status', ['scheduled', 'cancelled', 'completed']),
  createdAt: timestamp('created_at').defaultNow(),
});
// [RLS] [PS] — must be current/near-term showtimes for box office offline reads

export const showtimeTemplate = pgTable('showtime_template', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull(),
  filmId: uuid('film_id').notNull(),
  screenId: uuid('screen_id').notNull(),
  dayOfWeek: integer('day_of_week').notNull(),   // 0-6
  startTimeOfDay: text('start_time_of_day').notNull(), // "14:30"
  active: boolean('active').default(true),
});
// [RLS]
```

**Conflict detection** (no two showtimes overlapping on the same screen) is application logic enforced at write time, backed by a DB constraint check where practical.

---

## 3. Ticketing & Booking (Phase 3, 9)

```ts
export const ticketType = pgTable('ticket_type', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  name: text('name').notNull(),   // Standard / VIP / 3D / Recliner
});
// [RLS]

export const showtimePricing = pgTable('showtime_pricing', {
  id: uuid('id').primaryKey().defaultRandom(),
  showtimeId: uuid('showtime_id').notNull().references(() => showtime.id),
  ticketTypeId: uuid('ticket_type_id').notNull().references(() => ticketType.id),
  price: integer('price').notNull(),   // kobo, not naira, to avoid float issues
});
// [RLS] [PS]

export const booking = pgTable('booking', {
  id: uuid('id').primaryKey().defaultRandom(),
  showtimeId: uuid('showtime_id').notNull().references(() => showtime.id),
  customerId: uuid('customer_id').references(() => customer.id),  // nullable = guest
  bookingType: pgEnum('booking_type', ['standard', 'group', 'private_screening']),
  status: pgEnum('booking_status', ['pending', 'confirmed', 'cancelled']),
  totalAmount: integer('total_amount').notNull(),
  paymentId: uuid('payment_id'),
  createdAt: timestamp('created_at').defaultNow(),
});
// [RLS] [PS]

export const bookingSeat = pgTable('booking_seat', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').notNull().references(() => booking.id),
  seatId: uuid('seat_id').notNull().references(() => seat.id),
  ticketTypeId: uuid('ticket_type_id').notNull(),
  price: integer('price').notNull(),
});
// [RLS] [PS]

export const seatLock = pgTable('seat_lock', {
  id: uuid('id').primaryKey().defaultRandom(),
  showtimeId: uuid('showtime_id').notNull(),
  seatId: uuid('seat_id').notNull(),
  sessionId: text('session_id').notNull(),
  lockedAt: timestamp('locked_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
});
// Primary lock coordination happens via Pusher/Ably presence in real time;
// this table is the durable/recoverable record, not the hot path.

export const privateScreeningRequest = pgTable('private_screening_request', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull(),
  requestedByCustomerId: uuid('requested_by_customer_id'),
  screenId: uuid('screen_id').notNull(),
  requestedDate: timestamp('requested_date').notNull(),
  status: pgEnum('request_status', ['requested', 'quoted', 'approved', 'rejected']),
  quoteAmount: integer('quote_amount'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});
// [RLS]
```

---

## 4. POS / Offline (Phase 4)

```ts
export const till = pgTable('till', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull(),
  identifier: text('identifier').notNull(),
  status: pgEnum('till_status', ['active', 'closed']),
});
// [RLS] [PS]

export const tillSession = pgTable('till_session', {
  id: uuid('id').primaryKey().defaultRandom(),
  tillId: uuid('till_id').notNull().references(() => till.id),
  staffUserId: uuid('staff_user_id').notNull(),
  openedAt: timestamp('opened_at').defaultNow(),
  closedAt: timestamp('closed_at'),
  expectedCash: integer('expected_cash'),
  countedCash: integer('counted_cash'),
  discrepancy: integer('discrepancy'),
});
// [RLS] [PS]

export const sale = pgTable('sale', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull(),
  tillId: uuid('till_id').notNull(),
  staffUserId: uuid('staff_user_id').notNull(),
  bookingId: uuid('booking_id'),                     // nullable, ticket sales only
  saleType: pgEnum('sale_type', ['ticket', 'concessions', 'combo']),
  totalAmount: integer('total_amount').notNull(),
  paymentMethod: text('payment_method').notNull(),
  offlineTransactionId: text('offline_transaction_id').unique(), // client-generated, for dedup on sync
  syncedAt: timestamp('synced_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
// [RLS] [PS] — this table IS the offline-critical path; offlineTransactionId
// is what prevents a double-synced sale after a queued retry.

export const saleLineItem = pgTable('sale_line_item', {
  id: uuid('id').primaryKey().defaultRandom(),
  saleId: uuid('sale_id').notNull().references(() => sale.id),
  itemType: pgEnum('line_item_type', ['ticket', 'concession_item']),
  itemId: uuid('item_id').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
});
// [RLS] [PS]
```

---

## 5. Payments (Phase 5)

```ts
export const payment = pgTable('payment', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  bookingId: uuid('booking_id'),
  saleId: uuid('sale_id'),
  provider: pgEnum('payment_provider', ['paystack', 'cash', 'gift_card']),
  providerReference: text('provider_reference'),
  channel: pgEnum('payment_channel', ['card', 'bank_transfer', 'ussd', 'mobile_money', 'cash']),
  amount: integer('amount').notNull(),
  status: pgEnum('payment_status', ['pending', 'success', 'failed', 'refunded']),
  createdAt: timestamp('created_at').defaultNow(),
});
// [RLS]

export const webhookEvent = pgTable('webhook_event', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider: text('provider').notNull(),
  eventId: text('event_id').notNull().unique(),  // idempotency key
  payload: jsonb('payload'),
  processedAt: timestamp('processed_at').defaultNow(),
});
```

---

## 6. Concessions Inventory (Phase 6)

```ts
export const concessionItem = pgTable('concession_item', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  category: text('category'),
  isCombo: boolean('is_combo').default(false),
});
// [RLS] [PS]

export const comboComponent = pgTable('combo_component', {
  id: uuid('id').primaryKey().defaultRandom(),
  comboItemId: uuid('combo_item_id').notNull().references(() => concessionItem.id),
  componentItemId: uuid('component_item_id').notNull().references(() => concessionItem.id),
  quantityConsumed: integer('quantity_consumed').notNull(),
});
// [RLS] [PS]

export const stockLevel = pgTable('stock_level', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull(),
  itemId: uuid('item_id').notNull().references(() => concessionItem.id),
  quantityOnHand: integer('quantity_on_hand').notNull().default(0),
  lowStockThreshold: integer('low_stock_threshold'),
});
// [RLS] [PS]

export const supplier = pgTable('supplier', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  name: text('name').notNull(),
  contactInfo: jsonb('contact_info'),
});
// [RLS]

export const purchaseOrder = pgTable('purchase_order', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull(),
  supplierId: uuid('supplier_id').notNull().references(() => supplier.id),
  status: pgEnum('po_status', ['ordered', 'received']),
  createdAt: timestamp('created_at').defaultNow(),
  receivedAt: timestamp('received_at'),
});
// [RLS]

export const purchaseOrderLine = pgTable('purchase_order_line', {
  id: uuid('id').primaryKey().defaultRandom(),
  purchaseOrderId: uuid('purchase_order_id').notNull().references(() => purchaseOrder.id),
  itemId: uuid('item_id').notNull(),
  quantityOrdered: integer('quantity_ordered').notNull(),
  quantityReceived: integer('quantity_received').default(0),
  unitCost: integer('unit_cost'),
});
// [RLS]

export const stockAdjustment = pgTable('stock_adjustment', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull(),
  itemId: uuid('item_id').notNull(),
  quantityDelta: integer('quantity_delta').notNull(),  // negative for waste/shrinkage
  reason: text('reason').notNull(),
  adjustedByUserId: uuid('adjusted_by_user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
// [RLS]
```

---

## 7. CRM & Loyalty (Phase 7)

```ts
export const customer = pgTable('customer', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  userId: uuid('user_id'),               // Better Auth user, nullable for guest bookings
  tierId: uuid('tier_id').references(() => loyaltyTier.id),
  pointsBalance: integer('points_balance').default(0),  // denormalized cache; points_ledger is source of truth
  createdAt: timestamp('created_at').defaultNow(),
});
// [RLS]

export const loyaltyTier = pgTable('loyalty_tier', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  name: text('name').notNull(),          // Bronze / Silver / Gold
  minPointsThreshold: integer('min_points_threshold').notNull(),
  discountPercentage: integer('discount_percentage'),
  perks: jsonb('perks'),
});
// [RLS]

export const pointsLedger = pgTable('points_ledger', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customer.id),
  delta: integer('delta').notNull(),      // positive = earn, negative = redeem
  reason: pgEnum('points_reason', ['earn_purchase', 'redeem', 'adjustment']),
  referenceType: text('reference_type'),
  referenceId: uuid('reference_id'),
  createdAt: timestamp('created_at').defaultNow(),
});
// [RLS] — this ledger is the audit trail; pointsBalance is derived from it

export const giftCard = pgTable('gift_card', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  code: text('code').notNull().unique(),
  initialBalance: integer('initial_balance').notNull(),
  currentBalance: integer('current_balance').notNull(),
  issuedToCustomerId: uuid('issued_to_customer_id'),
  status: pgEnum('gift_card_status', ['active', 'depleted', 'expired']),
  createdAt: timestamp('created_at').defaultNow(),
});
// [RLS] [PS] — must be readable offline at the till for redemption

export const giftCardTransaction = pgTable('gift_card_transaction', {
  id: uuid('id').primaryKey().defaultRandom(),
  giftCardId: uuid('gift_card_id').notNull().references(() => giftCard.id),
  amount: integer('amount').notNull(),
  transactionType: pgEnum('gc_transaction_type', ['purchase', 'redeem', 'refund']),
  referenceId: uuid('reference_id'),
  createdAt: timestamp('created_at').defaultNow(),
});
// [RLS] [PS]
```

---

## 8. Marketing & Communications (Phase 8)

```ts
export const promoCode = pgTable('promo_code', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  code: text('code').notNull().unique(),
  discountType: pgEnum('discount_type', ['percentage', 'fixed']),
  discountValue: integer('discount_value').notNull(),
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').default(0),
  expiresAt: timestamp('expires_at'),
  active: boolean('active').default(true),
});
// [RLS] [PS] — must validate at the till offline

export const campaign = pgTable('campaign', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  name: text('name').notNull(),
  segmentCriteria: jsonb('segment_criteria'),
  channel: pgEnum('campaign_channel', ['email', 'sms', 'whatsapp']),
  content: text('content'),
  status: pgEnum('campaign_status', ['draft', 'scheduled', 'sent']),
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
});
// [RLS]

export const notificationLog = pgTable('notification_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id'),
  channel: text('channel').notNull(),
  template: text('template'),
  status: pgEnum('notification_status', ['sent', 'failed']),
  providerReference: text('provider_reference'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## 9. Multi-Site / Chain (Phase 10)

```ts
// Branch already defined in §1. Templates live at the organization level;
// overrides are tracked explicitly so the UI can show "inherited" vs "overridden".
export const templateOverride = pgTable('template_override', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull(),
  templateType: text('template_type').notNull(),   // 'pricing' | 'film_catalog'
  templateRefId: uuid('template_ref_id').notNull(),
  overrideValue: jsonb('override_value').notNull(),
});
// [RLS]
```

---

## 10. Digital Signage (Phase 11)

```ts
export const signageScreen = pgTable('signage_screen', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull(),
  name: text('name').notNull(),
  locationDescription: text('location_description'),
});
// [RLS]

export const signageContent = pgTable('signage_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  signageScreenId: uuid('signage_screen_id').notNull().references(() => signageScreen.id),
  contentType: pgEnum('signage_content_type', ['showtime_feed', 'promotion']),
  referenceId: uuid('reference_id'),
  displayOrder: integer('display_order'),
  active: boolean('active').default(true),
});
// [RLS]
```

---

## 11. Reporting & AI (Phase 12)

```ts
export const aiInsight = pgTable('ai_insight', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  insightType: text('insight_type').notNull(),
  content: text('content').notNull(),
  generatedAt: timestamp('generated_at').defaultNow(),
});
// [RLS]

export const demandForecast = pgTable('demand_forecast', {
  id: uuid('id').primaryKey().defaultRandom(),
  showtimeId: uuid('showtime_id').notNull(),
  predictedAttendance: integer('predicted_attendance'),
  confidence: integer('confidence'),   // 0-100
  generatedAt: timestamp('generated_at').defaultNow(),
});

export const pricingSuggestion = pgTable('pricing_suggestion', {
  id: uuid('id').primaryKey().defaultRandom(),
  showtimeId: uuid('showtime_id').notNull(),
  ticketTypeId: uuid('ticket_type_id').notNull(),
  suggestedPrice: integer('suggested_price').notNull(),
  status: pgEnum('suggestion_status', ['pending', 'approved', 'rejected']),
  generatedAt: timestamp('generated_at').defaultNow(),
  reviewedByUserId: uuid('reviewed_by_user_id'),
});
// Approval required per Phase 12 — never auto-applied to showtimePricing.
```

---

## 12. Distributor & Regulatory (Phase 13)

```ts
export const nfvcbSubmission = pgTable('nfvcb_submission', {
  id: uuid('id').primaryKey().defaultRandom(),
  filmId: uuid('film_id').notNull(),
  status: pgEnum('nfvcb_status', ['submitted', 'under_review', 'classified']),
  certificateUrl: text('certificate_url'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  classifiedAt: timestamp('classified_at'),
});
// [RLS]

export const distributorReport = pgTable('distributor_report', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  format: text('format'),
  generatedAt: timestamp('generated_at').defaultNow(),
  fileUrl: text('file_url'),
});
// [RLS]
```

---

## 13. Open Schema Decisions

These are reasonable defaults, not locked-in — revisit if a phase reveals a better structure:

- **Money stored as integer (kobo/cents)**, never float, to avoid rounding errors in pricing/refunds/loyalty math.
- **`customer` is scoped per-organization**, not global — the same person booking at two different (unrelated) cinemas gets two separate customer records. This matches the strict tenant-isolation rule; a cross-tenant unified customer identity was not requested and would complicate RLS.
- **Seat locks** are primarily coordinated in real time via Pusher/Ably presence channels; the `seat_lock` table is the durable fallback/audit record, not the primary coordination mechanism.
