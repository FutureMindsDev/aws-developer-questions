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
  const [paginatedData, setPaginatedData] = React.useState<
    PaginatedResponse<Question>
  >({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [examTypes, setExamTypes] = React.useState<ExamType[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedExamType, setSelectedExamType] =
    React.useState<string>("aws-developer");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [examTypesLoading, setExamTypesLoading] = React.useState(true);
  const [showSubmitForm, setShowSubmitForm] = React.useState(false);
  const [submitFormData, setSubmitFormData] = React.useState({
    question: "",
    options: ["", "", "", "", ""],
    answer: "",
    explanation: "",
    number: "",
    linkUrl: "",
  });
  const [submitErrors, setSubmitErrors] = React.useState({
    question: "",
    options: ["", "", "", "", ""],
    answer: "",
    number: "",
    linkUrl: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const { isAdmin, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchQuestions = React.useCallback(
    async (page: number, search: string, examType?: string | null) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          scope: "public",
          ...(search && { search }),
          ...(examType && { examType }),
        });
        const response = await fetch(`/api/questions?${params}`);
        if (response.ok) {
          const data = await response.json();
          setPaginatedData(data);
        }
      } catch (error) {
        console.error("[v0] Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchExamTypes = React.useCallback(async () => {
    setExamTypesLoading(true);
    try {
      const response = await fetch("/api/exam-types");
      if (response.ok) {
        const data = await response.json();
        setExamTypes(data);
      }
    } catch (error) {
      console.error("[v0] Error fetching exam types:", error);
    } finally {
      setExamTypesLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchExamTypes();
  }, [fetchExamTypes]);

  React.useEffect(() => {
    // Initialize from URL parameters or localStorage
    const urlExamType = searchParams.get("examType");
    const storedExamType =
      typeof window !== "undefined"
        ? localStorage.getItem("selectedExamType")
        : null;

    // Use stored exam type first, then URL, then default
    const finalExamType = storedExamType || urlExamType || "aws-developer";
    setSelectedExamType(finalExamType);

    // Update localStorage if different from stored
    if (storedExamType !== finalExamType && typeof window !== "undefined") {
      localStorage.setItem("selectedExamType", finalExamType);
    }
  }, [searchParams, fetchExamTypes]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to page 1 when searching or changing exam type
      fetchQuestions(1, searchQuery, selectedExamType);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedExamType, fetchQuestions]);

  React.useEffect(() => {
    if (currentPage !== 1 || (searchQuery === "" && !selectedExamType)) {
      fetchQuestions(currentPage, searchQuery, selectedExamType);
    }
  }, [currentPage, searchQuery, selectedExamType, fetchQuestions]);

  const handleExamTypeChange = (examType: string) => {
    setSelectedExamType(examType);
    setCurrentPage(1);

    // Update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedExamType", examType);
    }

    // Update URL without full page reload
    const url = new URL(window.location.href);
    url.searchParams.set("examType", examType);
    window.history.pushState({}, "", url.toString());
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePublicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      question: "",
      options: ["", "", "", "", ""],
      answer: "",
      number: "",
      linkUrl: "",
    };

    let hasErrors = false;

    if (!submitFormData.question.trim()) {
      newErrors.question = "Question is required";
      hasErrors = true;
    }

    if (!submitFormData.answer.trim()) {
      newErrors.answer = "Answer is required";
      hasErrors = true;
    }

    if (!submitFormData.linkUrl.trim()) {
      newErrors.linkUrl = "Source link is required";
      hasErrors = true;
    }

    if (
      submitFormData.number !== "" &&
      (isNaN(Number(submitFormData.number)) ||
        Number(submitFormData.number) < 0)
    ) {
      newErrors.number = "Number must be a positive number or empty";
      hasErrors = true;
    }

    setSubmitErrors(newErrors);

    if (hasErrors) {
      toast({ title: "Please fix the errors below", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/questions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...submitFormData,
          options: submitFormData.options.filter(
            (option) => option.trim() !== "",
          ),
          number:
            submitFormData.number === ""
              ? undefined
              : Number(submitFormData.number),
        }),
      });

      if (!response.ok) throw new Error("Failed to submit question");

      toast({
        title: "Question submitted",
        description:
          "Your question has been submitted and will be visible after admin approval.",
      });

      setShowSubmitForm(false);
      setSubmitFormData({
        question: "",
        options: ["", "", "", "", ""],
        answer: "",
        explanation: "",
        number: "",
        linkUrl: "",
      });
      setSubmitErrors({
        question: "",
        options: ["", "", "", "", ""],
        answer: "",
        number: "",
        linkUrl: "",
      });
    } catch (error) {
      console.error("[v0] Error submitting public question:", error);
      toast({ title: "Failed to submit question", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {!examTypesLoading && examTypes.length > 0 && (
              <ExamTypeSelector
                examTypes={examTypes}
                selectedExamType={selectedExamType}
                onExamTypeChange={handleExamTypeChange}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setShowSubmitForm(true)}
            >
              Add a new question
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {loading
              ? "Loading..."
              : `${paginatedData.total} question${
                  paginatedData.total !== 1 ? "s" : ""
                } found${selectedExamType ? ` for ${examTypes.find((e) => e.name === selectedExamType)?.displayName || selectedExamType}` : ""}`}
          </div>
          {!loading && paginatedData.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={paginatedData.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading questions...
            </div>
          ) : paginatedData.data.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No questions found.{" "}
              {isAdmin && "Go to admin panel to add questions."}
            </div>
          ) : (
            paginatedData.data.map((question, index) => (
              <QuestionCard
                key={question._id ?? question.id ?? index}
                question={question}
              />
            ))
          )}
        </div>

        {!loading && paginatedData.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={paginatedData.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>

      <PublicSubmitModal
        show={showSubmitForm}
        submitting={submitting}
        submitFormData={submitFormData}
        submitErrors={submitErrors}
        onClose={() => setShowSubmitForm(false)}
        onChange={setSubmitFormData}
        onSubmit={handlePublicSubmit}
      />
    </div>
  );
}
