import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

/** Google sign-in with Firebase. Returns readers to the app, then on to their library. */
export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate({ to: "/library" });
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("unauthorized-domain")) {
        setError("Domain not authorized in Firebase Console. Add your Netlify domain under Authentication → Settings → Authorized domains.");
      } else if (msg.includes("popup-closed-by-user")) {
        setError("Sign-in popup was closed before completion.");
      } else {
        setError("Google sign-in didn't complete. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => void start()}
        disabled={busy}
        className="w-full rounded-full border border-parchment/25 px-6 py-3.5 font-sans text-sm font-medium text-parchment/90 transition-colors hover:border-sand/50 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
          />
        </svg>
        <span>{busy ? "Opening Google…" : label}</span>
      </button>
      {error ? <p className="mt-2 font-sans text-xs text-alert">{error}</p> : null}
    </div>
  );
}
