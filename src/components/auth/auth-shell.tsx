export function AuthShell({
  tagline,
  children,
}: {
  tagline: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-1">
      <div className="hidden w-full max-w-md flex-col justify-center gap-3 border-r border-border bg-muted px-12 md:flex">
        <h1 className="text-2xl font-semibold text-foreground">CineSuite</h1>
        <div className="h-0.5 w-10 bg-accent" />
        <p className="text-sm text-muted-foreground">{tagline}</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
