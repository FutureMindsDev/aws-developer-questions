"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/question-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Question, PaginatedResponse } from "@/lib/types";

export default function OnboardingPage() {
  const [sampleQuestions, setSampleQuestions] = React.useState<Question[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  // Redirect already-authenticated users back to the home page
  React.useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, router]);

  React.useEffect(() => {
    let cancelled = false;

    const fetchSampleQuestions = async () => {
      try {
        const response = await fetch("/api/questions?scope=public&limit=3");
        if (response.ok) {
          const data = (await response.json()) as PaginatedResponse<Question>;
          if (!cancelled) {
            setSampleQuestions(data.data);
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching sample questions:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSampleQuestions();

    return () => {
      cancelled = true;
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-12">
          <section className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              {getGreeting()}
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Welcome to AWS Developer Q&A
            </h1>
            <p className="text-muted-foreground">
              Practice the latest AWS Developer questions and answers.
            </p>
            <div className="pt-2">
              <Button size="lg" onClick={() => router.push("/login")}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-center">
              Latest Questions
            </h2>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading sample questions...
              </div>
            ) : sampleQuestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No questions available yet.
              </div>
            ) : (
              sampleQuestions.map((question, index) => (
                <QuestionCard
                  key={question._id ?? question.id ?? index}
                  question={question}
                  showAnswerInitially
                />
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
