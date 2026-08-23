"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { LatestQuestions } from "@/components/onboarding/latest-questions";
import { Button } from "@/components/ui/button";

export default function OnboardingView() {
  const router = useRouter();
  const auth = useAuth();
  const user = auth.user;
  const loading = (auth as { loading?: boolean }).loading;

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-12">
      <section className="w-full text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to the AWS Q&A App!
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Explore real-world AWS questions and answers, prepare for certifications,
          and keep your knowledge sharp with the latest community questions.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/login">Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#latest">View sample questions</Link>
          </Button>
        </div>
      </section>

      <section id="latest" className="mt-16 w-full scroll-mt-24">
        <h2 className="text-2xl font-semibold">Latest questions</h2>
        <p className="mt-2 text-muted-foreground">
          Here are the three most recent questions from the community.
        </p>
        <div className="mt-6">
          <LatestQuestions />
        </div>
      </section>
    </main>
  );
}