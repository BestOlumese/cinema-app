import { Check } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const PLANS = [
  {
    name: "Independent",
    description: "For a single-screen or single-site cinema.",
    features: [
      "Booking, box office & POS",
      "Concessions inventory",
      "CRM & loyalty",
      "Reporting & analytics",
    ],
  },
  {
    name: "Chain / Head office",
    description: "For cinemas managing multiple branches.",
    features: [
      "Everything in Independent",
      "Head-office dashboard",
      "Circuit-wide reporting",
      "Centralized pricing & film templates",
    ],
  },
];

export function LandingPricing() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            Simple, flat pricing
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            One flat monthly subscription per cinema — no per-ticket
            commission. The same platform whether you run one screen or a
            multi-branch chain.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-md border border-card-border bg-card p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold text-foreground">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.description}
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <Check className="size-4 shrink-0 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={buttonVariants({
                  className: "mt-6 h-10 w-full",
                })}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
