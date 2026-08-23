"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LatestQuestion {
  _id: string;
  question?: string;
  text?: string;
  title?: string;
  answer?: string;
  examType?: string;
  category?: string;
  createdAt?: string;
}

function formatDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export function LatestQuestions() {
  const [questions, setQuestions] = useState<LatestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLatestQuestions() {
      try {
        const response = await fetch("/api/questions/latest", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load the latest questions.");
        }

        if (active) {
          setQuestions(Array.isArray(data.questions) ? data.questions : []);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadLatestQuestions();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((item) => (
          <Card key={item}>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No questions have been published yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => {
        const title = question.question ?? question.text ?? question.title ?? "Untitled question";
        const examType = question.examType ?? question.category;
        const formattedDate = formatDate(question.createdAt);

        return (
          <Card key={question._id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <CardTitle className="text-lg leading-snug">{title}</CardTitle>
              {examType ? <Badge variant="secondary">{examType}</Badge> : null}
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {question.answer ?? "No answer available."}
              </p>
              {formattedDate ? (
                <p className="text-xs text-muted-foreground">{formattedDate}</p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}