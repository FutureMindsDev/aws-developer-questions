"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import type { Question } from "@/lib/types";

type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [paginatedData, setPaginatedData] = React.useState<PaginatedResponse<Question> | null>(null);
  const [loadingQuestions, setLoadingQuestions] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  React.useEffect(() => {
    if (isLoading || isAuthenticated) return;

    let active = true;

    fetch("/api/questions?limit=3&scope=public&sort=latest")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch questions");
        return res.json() as Promise<PaginatedResponse<Question>>;
      })
      .then((data) => {
        if (active) {
          setPaginatedData(data);
          setError("");
        }
      })
      .catch(() => {
        if (active) {
          setPaginatedData(null);
          setError("Failed to load latest questions.");
        }
      })
      .finally(() => {
        if (active) setLoadingQuestions(false);
      });

    return () => {
      active = false;
    };
  }, [isLoading, isAuthenticated]);

  if (isLoading || isAuthenticated) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-3xl">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Welcome to AWS Developer Q&A
        </h1>
        <p className="mt-2 text-center text-gray-600">
          Sign in to browse all questions.
        </p>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800">Latest Questions</h2>
          {error ? (
            <p className="mt-4 text-red-600">{error}</p>
          ) : loadingQuestions ? (
            <p className="mt-4 text-gray-500">Loading latest questions...</p>
          ) : (
            <div className="mt-4 space-y-4">
              {paginatedData && paginatedData.data.length === 0 ? (
                <p className="text-gray-500">No questions yet.</p>
              ) : (
                paginatedData?.data.map((q) => (
                  <div key={q._id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="font-medium">Q{q.number}</span>
                      <span>{q.examType}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">{q.question}</h3>
                    <div className="mt-3 rounded-lg bg-gray-50 p-3">
                      <p className="text-sm font-semibold text-gray-700">Answer</p>
                      <p className="mt-1 text-gray-800">{q.answer}</p>
                      {q.explanation ? (
                        <p className="mt-2 text-sm text-gray-600">{q.explanation}</p>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Button onClick={() => router.push("/login")}>Sign In</Button>
        </div>
      </div>
    </main>
  );
}