import { create } from "zustand";
import type { User } from "@/types/auth";

const KEY = "proxy_admin_user";

function load(): User | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

interface AuthState {
  user: User | null;
  setUser: (u: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: load(),
  setUser: (u) => {
    localStorage.setItem(KEY, JSON.stringify(u));
    set({ user: u });
  },
  logout: () => {
    localStorage.removeItem(KEY);
    set({ user: null });
  },
}));