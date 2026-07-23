export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <p className="font-mono">
          Astral Forge — a creation blueprint, not a horoscope.
        </p>
        <p>
          Support:{" "}
          <a
            href="mailto:contact@onspace.ai"
            className="text-primary hover:underline"
          >
            contact@onspace.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
