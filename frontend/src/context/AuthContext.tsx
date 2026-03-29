import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  configureApi,
  fetchMe,
  loginRequest,
  type UserProfile,
} from "@/lib/api";
import { ACCESS_TOKEN_KEY } from "@/lib/auth-storage";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem(ACCESS_TOKEN_KEY),
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(
    () => !!localStorage.getItem(ACCESS_TOKEN_KEY),
  );

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    configureApi({
      onUnauthorized: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        setAccessToken(null);
        setUser(null);
      },
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    const t = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetchMe();
      setUser(res.data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    void refreshProfile();
  }, [accessToken, refreshProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginRequest(email, password);
    const token = res.data.access;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    setAccessToken(token);
    setUser(res.data.user);
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      login,
      logout,
      refreshProfile,
    }),
    [user, accessToken, loading, login, logout, refreshProfile],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
