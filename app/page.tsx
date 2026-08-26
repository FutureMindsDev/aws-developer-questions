"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuestionCard } from "@/components/question-card";
import { Pagination } from "@/components/pagination";
import { ThemeToggle } from "@/components/theme-toggle";
import { ExamTypeSelector } from "@/components/exam-type-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";
import { LogOut, Search, Shield } from "lucide-react";
import type { Question, PaginatedResponse, ExamType } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { PublicSubmitModal } from "@/components/home/public-submit-modal";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [examType, setExamType] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/onboarding");
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchQuestions = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "10");
      params.set("scope", "public");
      if (search) params.set("search", search);
      if (examType) params.set("examType", examType);
      const res = await fetch(`/api/questions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      setQuestions(data.data ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  }, [page, search, examType]);

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchQuestions();
    }
  }, [isLoading, isAuthenticated, fetchQuestions]);

  if (isLoading || !isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">AWS Developer Q&A</h1>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search questions..."
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <select
            value={examType}
            onChange={(event) => setExamType(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">All exam types</option>
            <option value="AWS Certified Developer - Associate">Developer Associate</option>
            <option value="AWS Certified Solutions Architect - Associate">Solutions Architect</option>
          </select>
        </div>

        {error ? <p className="mt-4 text-red-600">{error}</p> : null}
        {loading ? (
          <p className="mt-6 text-gray-500">Loading questions...</p>
        ) : (
          <div className="mt-6 space-y-4">
            {questions.map((q) => (
              <div key={q._id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Q{q.number}</span>
                  <span>{q.examType}</span>
                </div>
                <h2 className="mt-1 text-lg font-medium text-gray-900">{q.question}</h2>
                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold">Answer:</span> {q.answer}
                </p>
              </div>
            ))}
            {questions.length === 0 && !loading ? (
              <p className="text-gray-500">No questions found.</p>
            ) : null}
          </div>
        )}

        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
