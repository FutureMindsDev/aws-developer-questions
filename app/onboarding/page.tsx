"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { QuestionCard } from "@/components/question-card";
import { useAuth } from "@/components/auth-provider";
import { ArrowRight, BookOpen, Sparkles, Target } from "lucide-react";
import type { Question, PaginatedResponse } from "@/lib/types";

export default function OnboardingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [latestQuestions, setLatestQuestions] = React.useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = React.useState(true);

  // Redirect authenticated users back to the question browser.
  React.useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) router.replace("/");
  }, [isLoading, isAuthenticated, router]);

  React.useEffect(() => {
    document.title = "Onboarding | AWS Developer Q&A";
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/questions?page=1&limit=3&scope=public");
        if (res.ok) {
          const data: PaginatedResponse<Question> = await res.json();
          setLatestQuestions(data.data.slice(0, 3));
        }
      } catch (error) {
        console.error("[v0] Error fetching latest questions:", error);
      } finally {
        setQuestionsLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <main className="container mx-auto max-w-4xl px-4 py-16">
        <div className="space-y-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Welcome
          </span>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to AWS Developer Q&amp;A
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Your trusted companion for AWS Developer Certification practice —
            explore the latest questions, sharpen your skills, and get
            certified.
          </p>

          <Card className="mx-auto mt-6 max-w-2xl text-left">
            <CardHeader>
              <CardTitle className="text-lg">
                What you&apos;ll find here
              </CardTitle>
              <CardDescription>
                Everything you need to prepare for your AWS Developer
                Certification exam.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Hundreds of practice questions covering the latest AWS
                  Developer Associate exam topics.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Target className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Detailed explanations for every answer to help you understand
                  the &quot;why&quot; behind each question.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  New questions added regularly — there&apos;s always something
                  fresh to practice.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button size="lg" onClick={() => router.push("/login")}>
            Sign In to Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <section id="latest-questions" className="mt-16">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold">Latest Questions</h2>
            <CardDescription>
              A preview of the most recent practice questions.
            </CardDescription>
          </div>
          {questionsLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading latest questions...
            </div>
          ) : latestQuestions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No questions available yet.
            </div>
          ) : (
            <div className="space-y-4">
              {latestQuestions.map((question, index) => (
                <QuestionCard
                  key={question._id ?? question.id ?? index}
                  question={question}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
