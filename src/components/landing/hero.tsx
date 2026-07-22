import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Run your cinema, not spreadsheets
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
        Booking, box office, concessions, CRM, and back-office management —
        one platform built for cinemas in Nigeria, from single screens to
        multi-branch chains.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/signup"
          className={buttonVariants({ size: "lg", className: "h-11 px-6" })}
        >
          Get started
        </Link>
        <Link
          href="/signin"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "h-11 px-6",
          })}
        >
          Sign in
        </Link>
      </div>
    </section>
  );
}
