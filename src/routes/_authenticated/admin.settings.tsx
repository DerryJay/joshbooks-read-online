import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth, displayName } from "@/hooks/useAuth";
import { PageHeader, Panel, btnGhost } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: Settings,
});

function Settings() {
  const { user, profile } = useAuth();
  return (
    <>
      <PageHeader eyebrow="Administration" title="Settings" />
      <div className="grid gap-5 md:grid-cols-2">
        <Panel title="Your admin account">
          <p className="text-sm">{displayName(user, profile)}</p>
          <p className="text-xs text-parchment/55">{user?.email}</p>
          <Link to="/profile" className={`${btnGhost} mt-4`}>Edit profile</Link>
        </Panel>
        <Panel title="Upload rules">
          <ul className="space-y-1 text-sm text-parchment/75">
            <li>Covers: JPG, PNG or WebP, up to 5 MB</li>
            <li>Books: PDF only, up to 100 MB</li>
            <li>Replaced files are deleted automatically</li>
          </ul>
        </Panel>
        <Panel title="Security" className="md:col-span-2">
          <p className="text-sm text-parchment/75">
            Admin access is checked by the database on every request. Admin roles can only be granted from the backend —
            no one can promote themselves from the app. Passwords and sign-in secrets are never visible here.
          </p>
        </Panel>
      </div>
    </>
  );
}
