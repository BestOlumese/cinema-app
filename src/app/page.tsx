import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-16 sm:px-6">
      <main className="w-full max-w-md space-y-6">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl font-semibold text-foreground">
            CineSuite
          </h1>
          <p className="text-sm text-muted-foreground">
            Nigeria Cinema Management SaaS — foundation online.
          </p>
        </div>

        <div className="space-y-4 rounded-md border border-card-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Booking ref.</span>
            <span className="font-mono text-sm font-medium text-foreground">
              CS-000128
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              Confirmed
            </span>
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button className="flex-1">Continue</Button>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
