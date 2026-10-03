import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, displayName } from "@/hooks/useAuth";
import { FieldError, authField, authLabel, authPrimary } from "@/components/AuthShell";
import { nameError } from "@/lib/auth-validation";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — JoshBooks" },
      {
        name: "description",
        content: "View your JoshBooks account details, update your name, or sign out.",
      },
      { property: "og:title", content: "Your Profile — JoshBooks" },
      { property: "og:description", content: "Your JoshBooks account details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();

  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) setName(displayName(user, profile));
  }, [user, profile]);

  if (loading) {
    return (
      <SiteLayout>
        <main className="mx-auto max-w-[420px] px-5 pb-16 pt-10 md:max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-full bg-parchment/10" />
            <div className="h-32 w-full rounded-2xl bg-parchment/5" />
          </div>
        </main>
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout>
        <main className="mx-auto max-w-[420px] px-5 pb-16 pt-10 md:max-w-2xl">
          <section className="rounded-2xl border border-parchment/10 bg-glass/25 p-6 backdrop-blur-md">
            <h1 className="font-serif text-3xl font-semibold text-parchment">
              Sign in to view your profile.
            </h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="rounded-full bg-oxblood px-6 py-3.5 font-sans text-sm font-semibold text-parchment transition-colors hover:bg-oxblood/90"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full border border-parchment/25 px-6 py-3.5 font-sans text-sm font-medium text-parchment/85 transition-colors hover:border-sand/50"
              >
                Create Account
              </Link>
            </div>
          </section>
        </main>
      </SiteLayout>
    );
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setFormError(null);

    const invalid = nameError(name);
    setFieldError(invalid);
    if (invalid) return;

    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim() })
      .eq("id", user.id);
    if (!error) await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    setBusy(false);

    if (error) {
      setFormError("We couldn't save your name just now. Please try again.");
      return;
    }
    await refreshProfile();
    setStatus("Your name has been updated.");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/", replace: true });
  };

  const joined = user.created_at;

  return (
    <SiteLayout>
      <main className="mx-auto max-w-[420px] px-5 pb-16 md:max-w-2xl">
        <section className="animate-rise pb-6 pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/40">
            (a) your account
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight tracking-tight text-parchment">
            {displayName(user, profile)}
          </h1>
          <p className="mt-2 font-sans text-sm text-parchment/60">{user.email}</p>
        </section>

        <section className="animate-rise rounded-2xl border border-parchment/10 bg-glass/25 p-6 backdrop-blur-md">
          <h2 className="font-serif text-xl font-semibold text-parchment">Account information</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["Name", displayName(user, profile)],
                ["Email", user.email ?? "—"],
                ["Member since", joined ? new Date(joined).toLocaleDateString() : "—"],
                ["Sign-in method", user.app_metadata?.provider ?? "email"],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="border-b border-parchment/10 pb-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-parchment/40">
                  {label}
                </dt>
                <dd className="mt-1 break-words font-sans text-sm text-parchment/80">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 font-sans text-xs leading-relaxed text-parchment/45">
            Your email address and password can only be changed through a secure email
            confirmation flow — use{" "}
            <Link to="/forgot-password" className="text-sand hover:underline">
              password reset
            </Link>{" "}
            to set a new password.
          </p>
        </section>

        <AvatarSection userId={user.id} path={profile?.avatar_url ?? null} onSaved={refreshProfile} />

        <section className="animate-rise mt-6 rounded-2xl border border-parchment/10 bg-glass/25 p-6 backdrop-blur-md">
          <h2 className="font-serif text-xl font-semibold text-parchment">Update your name</h2>
          <form onSubmit={save} noValidate className="mt-4 space-y-4">
            <div>
              <label className={authLabel} htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={`${authField} mt-1.5`}
              />
              <FieldError>{fieldError}</FieldError>
            </div>
            {formError ? (
              <div className="rounded-xl border border-alert/40 bg-alert/10 p-3 font-sans text-xs text-alert">
                {formError}
              </div>
            ) : null}
            {status ? (
              <div className="rounded-xl border border-sand/40 bg-sand/10 p-3 font-sans text-xs text-sand">
                {status}
              </div>
            ) : null}
            <button type="submit" disabled={busy} className={authPrimary}>
              {busy ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </section>

        <section className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/library"
            className="rounded-full border border-parchment/20 px-5 py-3 font-sans text-sm font-medium text-parchment/80 transition-colors hover:border-sand/50"
          >
            My Library
          </Link>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="rounded-full bg-oxblood px-5 py-3 font-sans text-sm font-semibold text-parchment transition-colors hover:bg-oxblood/90"
          >
            Logout
          </button>
        </section>
      </main>
    </SiteLayout>
  );
}

const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

function AvatarSection({
  userId,
  path,
  onSaved,
}: {
  userId: string;
  path: string | null;
  onSaved: () => Promise<void>;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    if (!path) {
      setUrl(null);
      return;
    }
    void supabase.storage
      .from("avatars")
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (active) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [path]);

  const upload = async (file: File) => {
    setMessage(null);
    if (!AVATAR_TYPES.includes(file.type)) {
      setMessage({ ok: false, text: "Please choose a JPG, PNG or WebP image." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ ok: false, text: "Please choose an image under 2 MB." });
      return;
    }
    setBusy(true);
    const ext = file.type.split("/")[1];
    const objectPath = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(objectPath, file, { upsert: true, contentType: file.type });
    const { error } = uploadError
      ? { error: uploadError }
      : await supabase.from("profiles").update({ avatar_url: objectPath }).eq("id", userId);
    setBusy(false);
    if (error) {
      setMessage({ ok: false, text: "We couldn't update your picture. Please try again." });
      return;
    }
    if (path) void supabase.storage.from("avatars").remove([path]);
    await onSaved();
    setMessage({ ok: true, text: "Your profile picture has been updated." });
  };

  return (
    <section className="animate-rise mt-6 rounded-2xl border border-parchment/10 bg-glass/25 p-6 backdrop-blur-md">
      <h2 className="font-serif text-xl font-semibold text-parchment">Profile picture</h2>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-parchment/20 bg-parchment/5 font-serif text-2xl text-parchment/50">
          {url ? <img src={url} alt="Your profile picture" className="size-full object-cover" /> : "?"}
        </div>
        <label className="cursor-pointer rounded-full border border-parchment/25 px-5 py-3 font-sans text-sm font-medium text-parchment/85 transition-colors hover:border-sand/50">
          {busy ? "Uploading…" : path ? "Change picture" : "Upload picture"}
          <input
            type="file"
            accept={AVATAR_TYPES.join(",")}
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void upload(file);
            }}
          />
        </label>
      </div>
      {message ? (
        <p className={`mt-3 font-sans text-xs ${message.ok ? "text-sand" : "text-alert"}`}>{message.text}</p>
      ) : null}
    </section>
  );
}
