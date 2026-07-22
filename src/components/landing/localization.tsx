import { CircleDollarSign, MessageCircle, ShieldCheck, WifiOff } from "lucide-react";

const POINTS = [
  {
    icon: WifiOff,
    title: "Offline-first box office",
    description:
      "Ticket and concession sales keep working through power and network outages, syncing automatically once you're back online.",
  },
  {
    icon: CircleDollarSign,
    title: "How Nigerians actually pay",
    description:
      "Paystack (card, bank transfer), USSD, mobile money (OPay, PalmPay), and cash — all reconciled in one place.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp, not an afterthought",
    description:
      "Booking confirmations and reminders go out over WhatsApp alongside email and SMS, matching how customers actually communicate.",
  },
  {
    icon: ShieldCheck,
    title: "NFVCB compliance built in",
    description:
      "Film classification workflow and age-gate enforcement are part of the booking flow, not bolted on later.",
  },
];

export function LandingLocalization() {
  return (
    <section className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            Built for cinemas in Nigeria
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Not a global platform with Nigeria bolted on — designed around
            how cinemas here actually operate.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {POINTS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent">
                <Icon className="size-4 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
