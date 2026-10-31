import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, FieldError, authField, authLabel, authPrimary } from "@/components/AuthShell";
import { GoogleButton } from "@/components/GoogleButton";
import { emailError, friendlyAuthError, nameError, passwordError } from "@/lib/auth-validation";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — JoshBooks" },
      {
        name: "description",
        content:
          "Create a free JoshBooks account to save favourites, bookmark pages and keep your reading progress across devices.",
      },
      { property: "og:title", content: "Create Account — JoshBooks" },
      {
        property: "og:description",
        content: "Save favourites, bookmark pages and keep your reading progress.",
      },
    ],
  }),
  component: SignUpPage,
});

type Errors = {
  name?: string | null;
  email?: string | null;
  password?: string | null;
  confirm?: string | null;
};

function SignUpPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"session" | "confirm" | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors: Errors = {
      name: nameError(fullName),
      email: emailError(email),
      password: passwordError(password),
      confirm: password !== confirm ? "Both passwords must match." : null,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setBusy(true);
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const { setDoc, doc } = await import("firebase/firestore");
      const { auth, db } = await import("@/integrations/firebase/client");
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: fullName.trim() });
        await setDoc(
          doc(db, "users", cred.user.uid),
          {
            userId: cred.user.uid,
            fullName: fullName.trim(),
            email: email.trim(),
            createdAt: new Date().toISOString(),
          },
          { merge: true },
        );
      }
      setDone("session");
      navigate({ to: "/library" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account";
      setFormError(friendlyAuthError(msg));
    } finally {
      setBusy(false);
    }
  };

  if (done === "confirm") {
    return (
      <AuthShell
        eyebrow="(a) almost there"
        title="Check your email"
        intro={`We sent a confirmation link to ${email.trim()}. Open it to activate your account, then sign in.`}
      >
        <Link
          to="/login"
          className="inline-flex w-full items-center justify-center rounded-full bg-oxblood px-6 py-3.5 font-sans text-sm font-semibold text-parchment transition-colors hover:bg-oxblood/90"
        >
          Go to Sign In
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="(a) join the reading room"
      title="Create your account"
      intro="Keep your favourites, bookmarks and reading progress in one place."
      footer={
        <p className="font-sans text-sm text-parchment/60">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-sand hover:underline">
            Sign In
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label className={authLabel} htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className={`${authField} mt-1.5`}
            placeholder="Ada Lovelace"
          />
          <FieldError>{errors.name}</FieldError>
        </div>

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
          <p className="mt-1.5 font-sans text-[11px] text-parchment/45">
            8+ characters with upper and lower case letters and a number.
          </p>
          <FieldError>{errors.password}</FieldError>
        </div>

        <div>
          <label className={authLabel} htmlFor="confirm">
            Confirm password
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
          {busy ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/35">
        <span className="h-px flex-1 bg-parchment/10" />
        or
        <span className="h-px flex-1 bg-parchment/10" />
      </div>

      <GoogleButton label="Sign up with Google" />
    </AuthShell>
  );
}
