"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

{
  isAuthenticated: boolean;
  isAdmin: boolean;
  password: string | null;
  isAuthLoading: boolean;
  login: (password: string, redirectTo?: string) => boolean;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [password, setPassword] = React.useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const auth = sessionStorage.getItem("auth");
    if (!auth) {
      setIsAuthLoading(false);
      return;
    }

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
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const login = (inputPassword: string, redirectTo?: string) => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "123456";

    if (inputPassword === adminPassword) {
      setIsAuthenticated(true);
      setIsAdmin(true);
      setPassword(inputPassword);
      sessionStorage.setItem(
        "auth",
        JSON.stringify({ isAdmin: true, password: inputPassword }),
      );
      router.push(redirectTo || "/admin");
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
      value={{
        isAuthenticated,
        isAdmin,
        password,
        isAuthLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
