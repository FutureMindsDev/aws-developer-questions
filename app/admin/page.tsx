"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/auth-provider";
import type { Question, PaginatedResponse, ExamType } from "@/lib/types";
import { LogOut, X, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { QuestionForm } from "@/components/ui/question-form";
import type { QuestionFormData } from "@/components/ui/question-form";
import { ExamTypeSelector } from "@/components/exam-type-selector";
import { AdminQuestionList } from "@/components/admin/admin-question-list";
import { PendingApprovalsList } from "@/components/admin/pending-approvals-list";

export default function AdminPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/onboarding");
    }
  }, [isLoading, isAdmin, router]);

  const fetchQuestions = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/questions?limit=50&scope=all");
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      setQuestions(data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isLoading && isAdmin) {
      fetchQuestions();
    }
  }, [isLoading, isAdmin, fetchQuestions]);

  if (isLoading || !isAdmin) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to questions
          </button>
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
                <p className="mt-2 text-sm text-gray-700">{q.answer}</p>
              </div>
            ))}
            {questions.length === 0 && !loading ? (
              <p className="text-gray-500">No questions found.</p>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
