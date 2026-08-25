import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { RouteGuard } from "@/components/route-guard";

export const metadata: Metadata = {
  title: "Q&A Community",
  description: "Ask questions, share answers, and learn together.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <RouteGuard>{children}</RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}