import { useEffect, useRef, useState, Component, type ReactNode } from "react";
import { Router as WouterRouter, Switch, Route, useLocation } from "wouter";
import { ClerkProvider, SignIn, SignUp, Show, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Toaster } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Reading from "@/pages/Reading";
import Blueprint from "@/pages/Blueprint";
import Compare from "@/pages/Compare";
import MyCharts from "@/pages/MyCharts";
import NotFound from "@/pages/NotFound";
import BlueprintPage from "@/pages/BlueprintPage";
import ArchetypePage from "@/pages/ArchetypePage";
import WealthPage from "@/pages/WealthPage";
import AdminPage from "@/pages/AdminPage";
import DevUnlock from "@/pages/DevUnlock";
import DailyForgePage from "@/pages/DailyForgePage";

// Error boundary that catches Clerk JS load failures (common in dev previews
// where Clerk's CDN script can't be fetched through the Replit proxy).
// When Clerk fails the app renders normally — auth buttons simply don't appear.
interface ClerkErrorBoundaryState { failed: boolean }
class ClerkErrorBoundary extends Component<{ children: ReactNode }, ClerkErrorBoundaryState> {
  state: ClerkErrorBoundaryState = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err: unknown) {
    console.warn("[Astral Forge] Clerk failed to load — running without auth.", err);
  }
  render() {
    if (this.state.failed) {
      // Render the shell without ClerkProvider so the rest of the app works.
      // The WouterRouter is provided by the outer App — don't nest another one.
      return (
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/reading" component={Reading} />
              <Route path="/reports/blueprint" component={BlueprintPage} />
              <Route path="/reports/archetype" component={ArchetypePage} />
              <Route path="/reports/wealth" component={WealthPage} />
              <Route path="/compare" component={Compare} />
              <Route path="/daily-forge" component={DailyForgePage} />
              <Route path="/dev-unlock" component={DevUnlock} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
        </div>
      );
    }
    return this.props.children;
  }
}

// REQUIRED — copy verbatim
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// Only use the proxy URL if it looks like a real URL.
// An invalid/placeholder value causes Clerk to fail to load its JS entirely.
// Always route Clerk through our own server's /api/__clerk proxy.
// Vite's dev proxy forwards /api → localhost:8080 (API server).
// In production the API server handles /api directly.
// Using window.location.origin makes this work in every environment without
// any manually-configured environment variable.
const clerkProxyUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/__clerk`
    : (import.meta.env.VITE_CLERK_PROXY_URL || undefined);

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#C9913D",
    colorForeground: "#EDE8DC",
    colorMutedForeground: "#8892A4",
    colorDanger: "#E05252",
    colorBackground: "#0C1120",
    colorInput: "#141B2E",
    colorInputForeground: "#EDE8DC",
    colorNeutral: "#2A3352",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "w-[440px] max-w-full overflow-hidden rounded-2xl",
    card: "!shadow-none !border-0 !rounded-none",
    footer: "!shadow-none !border-0 !rounded-none",
    headerTitle: { color: "#EDE8DC", fontFamily: "'Fraunces', serif", fontSize: "1.5rem" },
    headerSubtitle: { color: "#8892A4" },
    socialButtonsBlockButtonText: { color: "#EDE8DC" },
    formFieldLabel: { color: "#8892A4" },
    footerActionLink: { color: "#C9913D" },
    footerActionText: { color: "#8892A4" },
    dividerText: { color: "#8892A4" },
    identityPreviewEditButton: { color: "#C9913D" },
    formFieldSuccessText: { color: "#5AC88A" },
    alertText: { color: "#EDE8DC" },
    logoBox: "flex justify-center py-2",
    logoImage: "w-12 h-12",
    socialButtonsBlockButton: "border border-[#2A3352] bg-[#141B2E] hover:bg-[#1A2440]",
    formButtonPrimary: "bg-[#C9913D] hover:bg-[#B8812D] text-[#0A0D18] font-semibold",
    formFieldInput: "bg-[#141B2E] border-[#2A3352] text-[#EDE8DC] placeholder:text-[#8892A4]",
    footerAction: "bg-[#0C1120]",
    dividerLine: "bg-[#2A3352]",
    alert: "bg-[#1A0E0E] border-[#E05252]",
    otpCodeFieldInput: "bg-[#141B2E] border-[#2A3352] text-[#EDE8DC]",
    formFieldRow: "gap-2",
    main: "bg-[#0C1120]",
  },
};

/**
 * Derive Clerk's hosted accounts URL from the publishable key.
 * pk_test_<base64($frontendApi)> → https://<frontendApi>
 */
function clerkHostedBase(pubKey: string): string | null {
  try {
    // Clerk keys use URL-safe base64 (- and _); atob() needs standard base64
    const b64 = pubKey
      .replace(/^pk_(test|live)_/, "")
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const decoded = atob(padded)
      .replace(/\$+$/, "")           // strip trailing $ sentinel
      .replace(/[^\x20-\x7E]/g, ""); // strip non-printable control chars (e.g. \u0016)
    if (!decoded.includes(".")) return null;
    return `https://${decoded}`;
  } catch {
    return null;
  }
}

/**
 * Sign-in page.
 *
 * Clerk's dev instance only allows localhost as a valid host — the Replit
 * preview domain is always rejected with "host_invalid". So in the dev
 * preview the embedded <SignIn> component never initialises.
 *
 * Strategy:
 * 1. Listen for the unhandledrejection event Clerk fires on JS-load failure,
 *    and mark as failed immediately (no 3-second wait).
 * 2. If Clerk does load (production / localhost), render the embedded form.
 * 3. If it fails, show a clear notice and the "Publish the app" path.
 */
function SignInPage() {
  const { isLoaded } = useUser();
  const [clerkFailed, setClerkFailed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (isLoaded) return;

    const onReject = (e: PromiseRejectionEvent) => {
      const msg = String(e.reason?.message ?? e.reason ?? "");
      if (
        msg.includes("Failed to load Clerk JS") ||
        (e.reason as { code?: string })?.code === "failed_to_load_clerk_js"
      ) {
        setClerkFailed(true);
        e.preventDefault(); // suppress unhandled-rejection console noise
      }
    };
    window.addEventListener("unhandledrejection", onReject);

    const t = setTimeout(() => setTimedOut(true), 6000);
    return () => {
      window.removeEventListener("unhandledrejection", onReject);
      clearTimeout(t);
    };
  }, [isLoaded]);

  // Clerk loaded successfully — render the embedded component
  if (isLoaded) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          fallbackRedirectUrl={basePath || "/"}
          appearance={clerkAppearance}
        />
      </div>
    );
  }

  // Clerk failed or timed out — show a helpful notice
  if (clerkFailed || timedOut) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-background px-4 py-12 text-center">
        <div className="max-w-md space-y-5">
          <h2 className="font-serif text-2xl font-semibold">Sign In unavailable in preview</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Clerk's authentication only works on{" "}
            <strong className="text-foreground">published apps</strong>. The
            Replit dev preview is not an allowed host for this Clerk instance, so
            the sign-in form cannot load here.
          </p>
          <div className="rounded-xl border border-primary/30 bg-primary/[0.05] px-5 py-4 text-left space-y-2">
            <p className="text-sm font-semibold text-foreground">To test sign-in:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Publish this app (button in the top bar)</li>
              <li>Open your published URL</li>
              <li>Sign in — it will work there</li>
            </ol>
          </div>
          <p className="text-xs text-muted-foreground/60">
            All reports, reading, and chart data work normally in this preview
            — only the authentication form is restricted to published apps.
          </p>
        </div>
      </div>
    );
  }

  // Still waiting for Clerk to report success or failure
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <p className="animate-pulse text-sm text-muted-foreground">Loading sign-in…</p>
    </div>
  );
}

function SignUpPage() {
  const { isLoaded } = useUser();
  const [clerkFailed, setClerkFailed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (isLoaded) return;
    const onReject = (e: PromiseRejectionEvent) => {
      const msg = String(e.reason?.message ?? e.reason ?? "");
      if (
        msg.includes("Failed to load Clerk JS") ||
        (e.reason as { code?: string })?.code === "failed_to_load_clerk_js"
      ) {
        setClerkFailed(true);
        e.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", onReject);
    const t = setTimeout(() => setTimedOut(true), 6000);
    return () => {
      window.removeEventListener("unhandledrejection", onReject);
      clearTimeout(t);
    };
  }, [isLoaded]);

  if (isLoaded) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
          fallbackRedirectUrl={basePath || "/"}
          appearance={clerkAppearance}
        />
      </div>
    );
  }

  if (clerkFailed || timedOut) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-background px-4 py-12 text-center">
        <div className="max-w-md space-y-5">
          <h2 className="font-serif text-2xl font-semibold">Sign Up unavailable in preview</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Clerk's authentication only works on{" "}
            <strong className="text-foreground">published apps</strong>. Publish
            the app then create your account on the live URL.
          </p>
          <div className="rounded-xl border border-primary/30 bg-primary/[0.05] px-5 py-4 text-left space-y-2">
            <p className="text-sm font-semibold text-foreground">To create an account:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Publish this app (button in the top bar)</li>
              <li>Open your published URL</li>
              <li>Create your account — it will work there</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <p className="animate-pulse text-sm text-muted-foreground">Loading sign-up…</p>
    </div>
  );
}

function AppRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      appearance={clerkAppearance}
      experimental={{ persistClient: false }}
      localization={{
        signIn: { start: { title: "Welcome back", subtitle: "Sign in to access your blueprints" } },
        signUp: { start: { title: "Create your account", subtitle: "Begin your alchemical journey" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "hsl(224 40% 8%)",
            border: "1px solid hsl(222 26% 18%)",
            color: "hsl(40 30% 90%)",
          },
        }}
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/reading" component={Reading} />
            <Route path="/reports/blueprint" component={BlueprintPage} />
            <Route path="/reports/archetype" component={ArchetypePage} />
            <Route path="/reports/wealth" component={WealthPage} />
            <Route path="/blueprint/:id" component={Blueprint} />
            <Route path="/compare" component={Compare} />
            <Route path="/my-charts" component={MyCharts} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/admin/*?" component={AdminPage} />
            <Route path="/daily-forge" component={DailyForgePage} />
            <Route path="/dev-unlock" component={DevUnlock} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </div>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkErrorBoundary>
        <AppRoutes />
      </ClerkErrorBoundary>
    </WouterRouter>
  );
}