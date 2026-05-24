"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type UserType = "retailer" | "landlord";

export interface AuthUser {
  email: string;
  name: string;
  type: UserType;
  avatarColor: string;
  initials: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const MOCK_ACCOUNTS: Record<string, { password: string; name: string; type: UserType; avatarColor: string }> = {
  "retailer@ptg.test": { password: "retailer123", name: "Siriporn K.", type: "retailer", avatarColor: "#2d5a1b" },
  "landlord@ptg.test": { password: "landlord123", name: "Wanchai P.",  type: "landlord", avatarColor: "#466800" },
};

const STORAGE_KEY = "ptg_auth_user";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => ({ ok: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  function login(email: string, password: string) {
    const account = MOCK_ACCOUNTS[email.trim().toLowerCase()];
    if (!account || account.password !== password) {
      return { ok: false, error: "Invalid email or password." };
    }
    const authUser: AuthUser = {
      email: email.trim().toLowerCase(),
      name: account.name,
      type: account.type,
      avatarColor: account.avatarColor,
      initials: account.name.charAt(0).toUpperCase(),
    };
    setUser(authUser);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser)); } catch {}
    return { ok: true };
  }

  function logout() {
    setUser(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
