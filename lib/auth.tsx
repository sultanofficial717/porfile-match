"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { account, databases, DATABASE_ID, COLLECTIONS, ID, Query } from "@/lib/appwrite";
import type { Models } from "appwrite";
import type { Profile, UserRole } from "@/lib/types";

// ─── Auth State ───────────────────────────────────────────────────────────────

interface AuthState {
  user: Models.User<Models.Preferences> | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<Profile | null>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
        Query.equal("userId", userId),
        Query.limit(1),
      ]);
      return (res.documents[0] as unknown as Profile) ?? null;
    } catch {
      return null;
    }
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const user = await account.get();
      const profile = await fetchProfile(user.$id);
      setState({ user, profile, loading: false, error: null });
    } catch {
      setState({ user: null, profile: null, loading: false, error: null });
    }
  }, [fetchProfile]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      const profile = await fetchProfile(user.$id);

      if (!profile) {
        throw new Error("No profile found. Contact administrator.");
      }

      setState({ user, profile, loading: false, error: null });
      return profile;
    } catch (err: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err.message || "Login failed",
      }));
      throw err;
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // Create Appwrite auth account
      await account.create(ID.unique(), email, password, name);
      // Log in
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();

      // Create profile document
      const profile = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        ID.unique(),
        {
          userId: user.$id,
          role,
          name,
          email,
        },
        // Permissions: owner can read/update, anyone can read
        [
          `read("user:${user.$id}")`,
          `update("user:${user.$id}")`,
          `delete("user:${user.$id}")`,
          `read("any")`,
        ]
      ) as unknown as Profile;

      setState({ user, profile, loading: false, error: null });
    } catch (err: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err.message || "Registration failed",
      }));
      throw err;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
    } catch {
      // Session may already be expired
    }
    setState({ user: null, profile: null, loading: false, error: null });
  };

  const refreshProfile = async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.$id);
      setState((s) => ({ ...s, profile }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
