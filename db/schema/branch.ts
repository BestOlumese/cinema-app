import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organization } from "./auth";

// A physical cinema location under an organization. An "independent"
// organization has exactly one branch; a "chain" starts with one (its head
// office) and adds more later (Phase 10). Not yet RLS-backed — that's
// Phase 1 Task 5, applied to every tenant-scoped table accumulated so far.
export const branch = pgTable("branch", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const branchRelations = relations(branch, ({ one }) => ({
  organization: one(organization, {
    fields: [branch.organizationId],
    references: [organization.id],
  }),
}));
