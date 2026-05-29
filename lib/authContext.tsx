"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

export type UserType = "retailer" | "landlord";

export interface AuthUser {
  id:          string;
  email:       string;
  name:        string;
  type:        UserType;
  avatarColor: string;
  initials:    string;
}

interface AuthContextValue {
  user:    AuthUser | null;
  loading: boolean;
  login:   (email: string, password: string) => Promise<{ ok: boolean; error?: string; userType?: UserType; userId?: string }>;
  logout:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login:  async () => ({ ok: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(supabaseUserId: string, email: string): Promise<AuthUser | null> {
    try {
      const res = await fetch(`/api/auth/me?userId=${supabaseUserId}`);
      if (!res.ok) return null;
      const profile = await res.json() as {
        id: string; email: string; name: string; role: string; avatar_color: string; initials: string;
      };
      return {
        id:          profile.id,
        email:       profile.email,
        name:        profile.name,
        type:        profile.role as UserType,
        avatarColor: profile.avatar_color,
        initials:    profile.initials,
      };
    } catch {
      return null;
    }
  }

  useEffect(() => {
    // Hydrate from existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      // Authorize the Realtime socket with the user's JWT so postgres_changes
      // subscriptions pass RLS (policies use auth.uid()). Without this the socket
      // is anon → RLS blocks every event → live updates only appear after a manual
      // refetch (page refresh / navigation).
      supabase.realtime.setAuth(session?.access_token ?? null);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email ?? "");
        setUser(profile);
        if (profile) localStorage.setItem("ptg_user_id", profile.id);
      }
      setLoading(false);
    });

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Keep the Realtime socket's token in sync on login / logout / refresh.
      supabase.realtime.setAuth(session?.access_token ?? null);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email ?? "");
        setUser(profile);
        if (profile) localStorage.setItem("ptg_user_id", profile.id);
      } else {
        setUser(null);
        localStorage.removeItem("ptg_user_id");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string): Promise<{ ok: boolean; error?: string; userType?: UserType; userId?: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      return { ok: false, error: error?.message ?? "Invalid email or password." };
    }
    const profile = await fetchProfile(data.user.id, data.user.email ?? "");
    if (!profile) return { ok: false, error: "User profile not found. Please run the seed SQL." };
    setUser(profile);
    localStorage.setItem("ptg_user_id", profile.id);
    return { ok: true, userType: profile.type, userId: profile.id };
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("ptg_user_id");
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
