"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const auth = useAuth() as unknown as {
    user?: unknown;
    isAuthenticated?: boolean;
    loading?: boolean;
  };
  const router = useRouter();

  const hasUser = Boolean(auth.user) || auth.isAuthenticated === true;
  const isLoading = auth.loading ?? false;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (requireAuth && !hasUser) {
      router.replace("/onboarding");
    } else if (!requireAuth && hasUser) {
      router.replace("/");
    }
  }, [hasUser, isLoading, requireAuth, router]);

  if (isLoading) {
    return null;
  }

  if ((requireAuth && !hasUser) || (!requireAuth && hasUser)) {
    return null;
  }

  return <>{children}</>;
}