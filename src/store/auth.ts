"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  xp: number;
  level: number;
  rankCode: string;
};

type State = {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  patchUser: (patch: Partial<AuthUser>) => void;
  logout: () => void;
};

export const useAuth = create<State>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => {
        if (typeof window !== "undefined") localStorage.setItem("bq_token", token);
        set({ token, user });
      },
      patchUser: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      logout: () => {
        if (typeof window !== "undefined") localStorage.removeItem("bq_token");
        set({ token: null, user: null });
      },
    }),
    { name: "bq_auth" }
  )
);
