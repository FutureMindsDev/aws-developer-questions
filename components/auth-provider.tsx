"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

type AuthContextType = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  password: string | null;
  login: (password: string) => boolean;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [password, setPassword] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const auth = sessionStorage.getItem("auth");
    if (!auth) return;

    try {
      const { isAdmin, password } = JSON.parse(auth);
      if (isAdmin && password) {
        setIsAuthenticated(true);
        setIsAdmin(true);
        setPassword(password);
      } else {
        sessionStorage.removeItem("auth");
      }
    } catch {
      sessionStorage.removeItem("auth");
    }
  }, []);

  const login = (inputPassword: string) => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "123456";

    if (inputPassword === adminPassword) {
      setIsAuthenticated(true);
      setIsAdmin(true);
      setPassword(inputPassword);
      sessionStorage.setItem(
        "auth",
        JSON.stringify({ isAdmin: true, password: inputPassword }),
      );
      router.push("/admin");
      return true;
    }

    toast({
      title: "Invalid admin password",
      variant: "destructive",
    });
    setIsAuthenticated(false);
    setIsAdmin(false);
    setPassword(null);
    sessionStorage.removeItem("auth");
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setPassword(null);
    sessionStorage.removeItem("auth");
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAdmin, password, login, logout }}
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
