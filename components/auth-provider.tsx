"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  password: string;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem("auth");
      if (stored) {
        const parsed = JSON.parse(stored) as {
          isAuthenticated?: boolean;
          isAdmin?: boolean;
          password?: string;
        };
        setIsAuthenticated(Boolean(parsed.isAuthenticated));
        setIsAdmin(Boolean(parsed.isAdmin));
        setPassword(parsed.password ?? "");
      }
    } catch {
      // Ignore malformed session data
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (inputPassword: string) => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "123456";
    if (inputPassword === adminPassword) {
      setIsAuthenticated(true);
      setIsAdmin(true);
      setPassword(inputPassword);
      sessionStorage.setItem(
        "auth",
        JSON.stringify({
          isAuthenticated: true,
          isAdmin: true,
          password: inputPassword,
        })
      );
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setPassword("");
    sessionStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAdmin, isLoading, password, login, logout }}
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
