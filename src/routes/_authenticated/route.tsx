import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { auth } from "@/integrations/firebase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // If not signed in to Firebase Auth, redirect to login
    if (!auth.currentUser) {
      throw redirect({ to: "/login" });
    }
    return { user: auth.currentUser };
  },
  component: () => <Outlet />,
});
