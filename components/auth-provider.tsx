"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export type AuthContextType = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (password: string, redirectTo?: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    try {
      const auth = sessionStorage.getItem("auth");
      if (!auth) {
        setIsAuthenticated(false);
        setIsAdmin(false);
      } else {
        const parsed = JSON.parse(auth);
        setIsAuthenticated(parsed?.isAuthenticated === true);
        setIsAdmin(parsed?.isAdmin === true);
      }
    } catch {
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = React.useCallback(
    async (password: string, redirectTo?: string) => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        const isAdminUser = data.isAdmin === true;
        setIsAuthenticated(true);
        setIsAdmin(isAdminUser);
        sessionStorage.setItem(
          "auth",
          JSON.stringify({ isAuthenticated: true, isAdmin: isAdminUser })
        );
        router.push(redirectTo || "/");
        return true;
      } catch {
        return false;
      }
    },
    [router]
  );

  const logout = React.useCallback(() => {
    sessionStorage.removeItem("auth");
    setIsAuthenticated(false);
    setIsAdmin(false);
    router.push("/onboarding");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAdmin, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
