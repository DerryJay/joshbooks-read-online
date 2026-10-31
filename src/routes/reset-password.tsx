import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell, FieldError, authField, authLabel, authPrimary } from "@/components/AuthShell";
import { friendlyAuthError, passwordError } from "@/lib/auth-validation";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a New Password — JoshBooks" },
      {
        name: "description",
        content: "Set a new password for your JoshBooks reading account.",
      },
      { property: "og:title", content: "Choose a New Password — JoshBooks" },
      {
        property: "og:description",
        content: "Set a new password for your JoshBooks account.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [validLink, setValidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ password?: string | null; confirm?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // Check for oobCode in query or signed-in state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get("oobCode");
    if (oobCode) {
      setValidLink(true);
      setReady(true);
      return;
    }
    let active = true;
    void import("firebase/auth").then(({ onAuthStateChanged }) => {
      void import("@/integrations/firebase/client").then(({ auth }) => {
        if (!active) return;
        const unsub = onAuthStateChanged(auth, (usr) => {
          if (!active) return;
          setValidLink(Boolean(usr));
          setReady(true);
        });
        return () => unsub();
      });
    });
    return () => {
      active = false;
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = {
      password: passwordError(password),
      confirm: password !== confirm ? "Both passwords must match." : null,
    };
    setErrors(nextErrors);
    if (nextErrors.password || nextErrors.confirm) return;

    setBusy(true);
    try {
      const { confirmPasswordReset, updatePassword } = await import("firebase/auth");
      const { auth } = await import("@/integrations/firebase/client");
      const params = new URLSearchParams(window.location.search);
      const oobCode = params.get("oobCode");
      if (oobCode) {
        await confirmPasswordReset(auth, oobCode, password);
      } else if (auth.currentUser) {
        await updatePassword(auth.currentUser, password);
      }
      setDone(true);
      window.setTimeout(() => navigate({ to: "/library" }), 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password update failed";
      setFormError(friendlyAuthError(msg));
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <AuthShell eyebrow="(a) one moment" title="Checking your link" intro="Please wait…">
        <div className="h-1.5 w-full animate-pulse rounded-full bg-parchment/15" />
      </AuthShell>
    );
  }

  if (!validLink) {
    return (
      <AuthShell
        eyebrow="(a) link expired"
        title="This reset link isn't valid"
        intro="Password reset links can only be used once and expire after a while. Request a new one."
      >
        <Link
          to="/forgot-password"
          className="inline-flex w-full items-center justify-center rounded-full bg-oxblood px-6 py-3.5 font-sans text-sm font-semibold text-parchment transition-colors hover:bg-oxblood/90"
        >
          Request a New Link
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell
        eyebrow="(a) all set"
        title="Password updated"
        intro="Your new password is saved. Taking you to your library…"
      >
        <Link
          to="/library"
          className="inline-flex w-full items-center justify-center rounded-full bg-oxblood px-6 py-3.5 font-sans text-sm font-semibold text-parchment transition-colors hover:bg-oxblood/90"
        >
          Go to My Library
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="(a) new password"
      title="Choose a new password"
      intro="Pick something you haven't used elsewhere."
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label className={authLabel} htmlFor="password">
            New password
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${authField} pr-20`}
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShow((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/60 hover:text-parchment"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
          <FieldError>{errors.password}</FieldError>
        </div>

        <div>
          <label className={authLabel} htmlFor="confirm">
            Confirm new password
          </label>
          <input
            id="confirm"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className={`${authField} mt-1.5`}
            placeholder="Repeat your password"
          />
          <FieldError>{errors.confirm}</FieldError>
        </div>

        {formError ? (
          <div className="rounded-xl border border-alert/40 bg-alert/10 p-3 font-sans text-xs text-alert">
            {formError}
          </div>
        ) : null}

        <button type="submit" disabled={busy} className={authPrimary}>
          {busy ? "Saving…" : "Update Password"}
        </button>
      </form>
    </AuthShell>
  );
}
