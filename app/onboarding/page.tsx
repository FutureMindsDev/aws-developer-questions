"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { QuestionCard } from "@/components/question-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PaginatedResponse, Question } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchSampleQuestions() {
      try {
        const response = await fetch(
          "/api/questions?scope=public&limit=3&sort=latest"
        );
        if (!response.ok) {
          throw new Error("Failed to load sample questions.");
        }
        const data: PaginatedResponse<Question> = await response.json();
        if (!cancelled) {
          setQuestions(data.questions);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load sample questions.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchSampleQuestions();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to AWS Developer Q&A</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Browse sample questions below to get a feel for the question bank.
          </p>
          <p className="text-muted-foreground">
            Sign in to access the full question bank.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => router.push("/login")}>Get Started</Button>
            {isAuthenticated && (
              <Button variant="ghost" onClick={() => router.push("/")}>
                Go to the question bank
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Sample Questions</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading sample questions...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question._id}
                question={question}
                defaultShowAnswer
              />
            ))}
            {questions.length === 0 && (
              <p className="text-muted-foreground">
                No sample questions available yet.
              </p>
            )}
          </div>
        )}
      </section>

      <p className="text-center text-sm text-muted-foreground">
        By continuing, you agree to use this site for AWS exam preparation only.
      </p>
    </div>
  );
}