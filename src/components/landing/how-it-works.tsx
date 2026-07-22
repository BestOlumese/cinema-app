const STEPS = [
  {
    number: "1",
    title: "Sign up",
    description: "Create your account with just an email and password — no sales call.",
  },
  {
    number: "2",
    title: "Set up your cinema",
    description:
      "Choose independent or chain, add your cinema's name, and you're structurally ready.",
  },
  {
    number: "3",
    title: "Start selling",
    description:
      "Configure films, showtimes, and pricing, then take bookings online and at the box office.",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          How it works
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Self-serve from the first click — no sales call, no manual approval.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {STEPS.map(({ number, title, description }) => (
          <div key={number} className="text-center sm:text-left">
            <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground sm:mx-0">
              {number}
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              {title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
