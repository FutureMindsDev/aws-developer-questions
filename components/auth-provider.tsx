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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;

    const isLogin = pathname === "/login" || pathname.startsWith("/login/");
    const isOnboarding = pathname === "/onboarding" || pathname.startsWith("/onboarding/");
    const isPublic = isLogin || isOnboarding;

    if (!user && !isPublic) {
      const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/onboarding${next}`);
      return;
    }

    if (user && (isLogin || isOnboarding)) {
      router.replace("/");
    }
  }, [user, loading, pathname, router]);

  const login = (emailOrUser: any, password?: string): boolean => {
    let email = "";
    let name = "";

    if (typeof emailOrUser === "string") {
      email = emailOrUser.trim();
      name = email.split("@")[0] || "User";
    } else if (emailOrUser && typeof emailOrUser === "object") {
      email = emailOrUser.email?.trim?.() ?? "";
      name = emailOrUser.name ?? (email ? email.split("@")[0] : "User");
    }

    if (!email) return false;

    const nextUser =
      emailOrUser && typeof emailOrUser === "object"
        ? { ...emailOrUser, email, name }
        : { email, name };

    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);

    const searchParams = new URLSearchParams(window.location.search);
    const next = searchParams.get("next");
    router.push(next || "/");

    return true;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/onboarding");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading } as any}>
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
