import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut as fbSignOut,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type AuthValue = {
  user: User | null;
  /** True while the session is still being determined — never render private data yet. */
  loading: boolean;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (userId: string, currentUser?: User | null) => {
    try {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          id: userId,
          full_name: (data["fullName"] as string) ?? null,
          email: (data["email"] as string) ?? null,
          avatar_url: (data["avatarUrl"] as string) ?? null,
        });
      } else if (currentUser) {
        // Create user profile in Firestore if not already present
        const initialProfile = {
          userId,
          fullName: currentUser.displayName || currentUser.email?.split("@")[0] || "Reader",
          email: currentUser.email || "",
          avatarUrl: currentUser.photoURL || null,
          createdAt: new Date().toISOString(),
        };
        await setDoc(ref, initialProfile, { merge: true });
        setProfile({
          id: userId,
          full_name: initialProfile.fullName,
          email: initialProfile.email,
          avatar_url: initialProfile.avatarUrl,
        });
      }
    } catch (err) {
      console.warn("Could not load user profile:", err);
      if (currentUser) {
        setProfile({
          id: userId,
          full_name: currentUser.displayName || currentUser.email?.split("@")[0] || "Reader",
          email: currentUser.email || "",
          avatar_url: currentUser.photoURL || null,
        });
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        void loadProfile(firebaseUser.uid, firebaseUser);
      } else {
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.uid, user);
  }, [user, loadProfile]);

  const signOut = useCallback(async () => {
    await fbSignOut(auth);
    setUser(null);
    setProfile(null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, loading, profile, refreshProfile, signOut, signInWithGoogle }),
    [user, loading, profile, refreshProfile, signOut, signInWithGoogle],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

/** Display name preference: profile name → auth display name → email local part. */
export function displayName(user: User | null, profile: Profile | null) {
  return profile?.full_name || user?.displayName || user?.email?.split("@")[0] || "Reader";
}
