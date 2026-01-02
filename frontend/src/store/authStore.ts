import { create } from "zustand";

interface AuthState {
  token: string | null;
  userId: string | null;
  username: string | null;
  setAuth: (data: { token: string; userId: string; username: string }) => void;
  clearAuth: () => void;
}

// Load from localStorage on init
const loadAuth = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    return { token, userId, username };
  }
  return { token: null, userId: null, username: null };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...loadAuth(),
  setAuth: ({ token, userId, username }) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", username);
    }
    set({ token, userId, username });
  },
  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
    }
    set({ token: null, userId: null, username: null });
  },
}));

