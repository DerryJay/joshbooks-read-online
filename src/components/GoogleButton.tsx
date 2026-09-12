import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { lovable } from "@/integrations/lovable/index";

/** Google sign-in. Returns readers to the app, then on to their library. */
export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in didn't complete. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/library" });
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => void start()}
        disabled={busy}
        className="w-full rounded-full border border-parchment/25 px-6 py-3.5 font-sans text-sm font-medium text-parchment/90 transition-colors hover:border-sand/50 disabled:opacity-50"
      >
        {busy ? "Opening Google…" : label}
      </button>
      {error ? <p className="mt-2 font-sans text-xs text-alert">{error}</p> : null}
    </div>
  );
}
