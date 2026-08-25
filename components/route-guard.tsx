"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

const PUBLIC_PATHS = ["/onboarding", "/login"];

export function RouteGuard({ children }: { children: ReactNode }) {
  const auth = useAuth() as unknown as {
    user?: unknown;
    isAuthenticated?: boolean;
    loading?: boolean;
  };
  const pathname = usePathname();
  const router = useRouter();

  const hasUser = Boolean(auth.user) || auth.isAuthenticated === true;
  const isLoading = auth.loading ?? false;

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  useEffect(() => {
    if (isLoading || !pathname) {
      return;
    }

    if (!isPublic && !hasUser) {
      router.replace("/onboarding");
    } else if (isPublic && hasUser) {
      router.replace("/");
    }
  }, [hasUser, isLoading, isPublic, pathname, router]);

  if (isLoading) {
    return null;
  }

  if ((!isPublic && !hasUser) || (isPublic && hasUser)) {
    return null;
  }

  return <>{children}</>;
}