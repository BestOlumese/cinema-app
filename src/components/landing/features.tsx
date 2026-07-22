import { BarChart3, Building2, Popcorn, Store, Ticket, Users } from "lucide-react";

const FEATURES = [
  {
    icon: Ticket,
    title: "Booking & Ticketing",
    description:
      "Tiered pricing, interactive seat selection, group and private-screening bookings.",
  },
  {
    icon: Store,
    title: "Box Office & POS",
    description:
      "Offline-first till software that keeps working through power and network outages.",
  },
  {
    icon: Popcorn,
    title: "Concessions",
    description:
      "Stock tracking, combo deals, and supplier records for every site.",
  },
  {
    icon: Users,
    title: "CRM & Loyalty",
    description:
      "Customer profiles, points-based loyalty tiers, and gift cards.",
  },
  {
    icon: BarChart3,
    title: "Back-Office & Reporting",
    description:
      "Revenue, attendance, and occupancy reporting across every branch.",
  },
  {
    icon: Building2,
    title: "Multi-Site & Chain Management",
    description:
      "Circuit-wide reporting and centralized pricing/film templates branches can inherit or override.",
  },
];

export function LandingFeatures() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-md border border-card-border bg-card p-6 shadow-sm"
          >
            <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-accent">
              <Icon className="size-4 text-accent-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
