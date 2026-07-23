import { Link } from "wouter";
import { Button } from "@/components/common/Button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="glyph text-6xl text-primary">✷</span>
      <h1 className="mt-6 font-serif text-5xl font-semibold">404</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        This point does not exist on the blueprint. The creation cycle has only nine.
      </p>
      <Link to="/" className="mt-8">
        <Button>Return to origin</Button>
      </Link>
    </div>
  );
}
