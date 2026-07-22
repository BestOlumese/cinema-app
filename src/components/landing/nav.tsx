import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <span className="text-lg font-semibold text-foreground">
          CineSuite
        </span>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/signin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={buttonVariants({ size: "sm", className: "h-9" })}
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
