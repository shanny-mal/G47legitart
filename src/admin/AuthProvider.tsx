import React, { createContext, useContext, useEffect, useState } from "react";
import client, { setAuthToken } from "../api/client";

type UserShape = { id?: number; username?: string; email?: string; [k: string]: any; };
type AuthContextShape = {
  user: UserShape | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "auth_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserShape | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_KEY);
    if (token) {
      setAuthToken(token);
      try {
        const raw = localStorage.getItem(USER_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  async function login(identifier: string, password: string) {
    try {
      // Send both keys to be compatible with either backend expectations
      const payload = {
        email: identifier,
        username: identifier,
        password,
      };

      const res = await client.post("/auth/token/", payload);
      const data = res.data;

      if (!data?.access) {
        throw new Error("Authentication failed: no access token provided");
      }

      localStorage.setItem(ACCESS_KEY, data.access);
      if (data.refresh) localStorage.setItem(REFRESH_KEY, data.refresh);
      setAuthToken(data.access);

      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      // clear partial state
      setAuthToken(null);
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
      // extract useful message
      const serverMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        // DRF detailed dict errors
        (err?.response?.data ? JSON.stringify(err.response.data) : undefined) ||
        err?.message ||
        "Login failed";
      throw new Error(serverMessage);
    }
  }

  function logout() {
    setAuthToken(null);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  const contextValue: AuthContextShape = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(user || localStorage.getItem(ACCESS_KEY)),
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextShape {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
