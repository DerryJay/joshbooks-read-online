import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

  // A recovery link arrives with a session in the URL hash; wait for it.
  useEffect(() => {
    const hash = window.location.hash;
    const recovery = hash.includes("type=recovery");

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setValidLink(true);
        setReady(true);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      setValidLink(Boolean(data.session) || recovery);
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
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
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setFormError(friendlyAuthError(error.message));
      return;
    }
    setDone(true);
    window.setTimeout(() => navigate({ to: "/library" }), 1200);
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
