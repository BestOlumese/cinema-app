export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} CineSuite
      </div>
    </footer>
  );
}
