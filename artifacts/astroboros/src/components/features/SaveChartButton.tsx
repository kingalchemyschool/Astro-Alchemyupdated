import { useState } from "react";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import { Bookmark, BookmarkCheck, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveChart } from "@/lib/savedCharts";
import { Button } from "@/components/common/Button";

interface Props {
  /** Display name used as the saved chart label */
  name: string;
  /** Raw birth input to persist */
  birthInput: Record<string, unknown>;
}

export default function SaveChartButton({ name, birthInput }: Props) {
  const { isSignedIn, isLoaded } = useUser();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // While Clerk is initialising, render nothing so there's no layout shift
  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <Link to="/sign-in">
        <Button variant="outline" size="sm" className="gap-1.5">
          <LogIn className="h-3.5 w-3.5" />
          Sign in to save
        </Button>
      </Link>
    );
  }

  if (saved) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-1.5 text-primary border-primary/30">
        <BookmarkCheck className="h-3.5 w-3.5" />
        Saved
      </Button>
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveChart(name || "My Blueprint", birthInput);
      setSaved(true);
      toast.success("Chart saved to your profile");
    } catch {
      toast.error("Could not save chart — please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
      {saving
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <Bookmark className="h-3.5 w-3.5" />}
      {saving ? "Saving…" : "Save chart"}
    </Button>
  );
}
