import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, FieldError, authField, authLabel, authPrimary } from "@/components/AuthShell";
import { GoogleButton } from "@/components/GoogleButton";
import { emailError, friendlyAuthError } from "@/lib/auth-validation";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — JoshBooks" },
      {
        name: "description",
        content:
          "Sign in to JoshBooks to reach your personal library: favourites, bookmarks and saved reading progress.",
      },
      { property: "og:title", content: "Sign In — JoshBooks" },
      {
        property: "og:description",
        content: "Sign in to reach your favourites, bookmarks and reading progress.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/library", replace: true });
  }, [loading, user, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = {
      email: emailError(email),
      password: password ? null : "Please enter your password.",
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);

    if (error) {
      setFormError(friendlyAuthError(error.message));
      return;
    }
    navigate({ to: "/library" });
  };

  return (
    <AuthShell
      eyebrow="(a) welcome back"
      title="Sign in"
      intro="Your favourites, bookmarks and reading progress are waiting."
      footer={
        <p className="font-sans text-sm text-parchment/60">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-semibold text-sand hover:underline">
            Sign Up
          </Link>
        </p>
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
          <FieldError>{errors.email}</FieldError>
        </div>

        <div>
          <label className={authLabel} htmlFor="password">
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${authField} pr-20`}
              placeholder="••••••••"
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

        {formError ? (
          <div className="rounded-xl border border-alert/40 bg-alert/10 p-3 font-sans text-xs text-alert">
            {formError}
          </div>
        ) : null}

        <button type="submit" disabled={busy} className={authPrimary}>
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/35">
        <span className="h-px flex-1 bg-parchment/10" />
        or
        <span className="h-px flex-1 bg-parchment/10" />
      </div>

      <GoogleButton />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 font-sans text-xs">
        <Link to="/forgot-password" className="text-parchment/60 hover:text-parchment">
          Forgot Password?
        </Link>
        <Link to="/books" className="text-parchment/45 hover:text-parchment">
          Browse without an account
        </Link>
      </div>
    </AuthShell>
  );
}
