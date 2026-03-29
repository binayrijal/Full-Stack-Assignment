import { createContext } from "react";
import type { UserProfile } from "@/lib/api";

export type AuthState = {
  user: UserProfile | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);
