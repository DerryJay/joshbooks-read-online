import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, FieldError, authField, authLabel, authPrimary } from "@/components/AuthShell";
import { emailError, friendlyAuthError } from "@/lib/auth-validation";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Your Password — JoshBooks" },
      {
        name: "description",
        content: "Request a password reset link for your JoshBooks reading account.",
      },
      { property: "og:title", content: "Reset Your Password — JoshBooks" },
      {
        property: "og:description",
        content: "Request a password reset link for your JoshBooks account.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const invalid = emailError(email);
    setFieldError(invalid);
    if (invalid) return;

    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      setFormError(friendlyAuthError(error.message));
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthShell
        eyebrow="(a) check your inbox"
        title="Reset link sent"
        intro={`If an account exists for ${email.trim()}, a password reset link is on its way.`}
      >
        <Link
          to="/login"
          className="inline-flex w-full items-center justify-center rounded-full bg-oxblood px-6 py-3.5 font-sans text-sm font-semibold text-parchment transition-colors hover:bg-oxblood/90"
        >
          Back to Sign In
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="(a) forgotten password"
      title="Reset your password"
      intro="Enter your email address and we'll send you a link to choose a new password."
      footer={
        <Link to="/login" className="font-sans text-sm text-parchment/60 hover:text-parchment">
          ← Back to Sign In
        </Link>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label className={authLabel} htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`${authField} mt-1.5`}
            placeholder="you@example.com"
          />
          <FieldError>{fieldError}</FieldError>
        </div>

        {formError ? (
          <div className="rounded-xl border border-alert/40 bg-alert/10 p-3 font-sans text-xs text-alert">
            {formError}
          </div>
        ) : null}

        <button type="submit" disabled={busy} className={authPrimary}>
          {busy ? "Sending…" : "Send Reset Link"}
        </button>
      </form>
    </AuthShell>
  );
}
