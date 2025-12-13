"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Pagination } from "@/components/pagination";
import { useAuth } from "@/components/auth-provider";
import type { Question, PaginatedResponse } from "@/lib/types";
import { Pencil, Trash2, LogOut, X, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { parseTextWithCode } from "@/lib/utils";
import { QuestionForm } from "@/components/ui/question-form";

function getCorrectAnswerIndices(
  answer: string | undefined,
  optionsLength: number,
) {
  if (!answer) return [] as number[];
  return answer
    .split(",")
    .map((a) => a.trim().toUpperCase().charCodeAt(0) - 65)
    .filter((idx) => idx >= 0 && idx < optionsLength);
}

export default function AdminPage() {
  const [paginatedData, setPaginatedData] = React.useState<
    PaginatedResponse<Question>
  >({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pendingData, setPendingData] = React.useState<
    PaginatedResponse<Question>
  >({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [pendingPage, setPendingPage] = React.useState(1);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [showCodeHelper, setShowCodeHelper] = React.useState(false);
  const [formData, setFormData] = React.useState({
    question: "",
    options: ["", "", "", "", ""],
    answer: "",
    explanation: "",
    number: "",
    linkUrl: "",
  });
  const [errors, setErrors] = React.useState({
    question: "",
    options: ["", "", "", "", ""],
    answer: "",
    number: "",
    linkUrl: "",
  });
  const [activeTab, setActiveTab] = React.useState<
    "dashboard" | "create" | "approvals"
  >("dashboard");
  const { isAdmin, logout, password, login } = useAuth();
  const [loginPassword, setLoginPassword] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchQuestions = React.useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          scope: "public",
          ...(searchQuery && { search: searchQuery }),
        });
        const response = await fetch(`/api/questions?${params}`);
        if (response.ok) {
          const data = await response.json();
          setPaginatedData(data);
        }
      } catch (error) {
        console.error("[v0] Error fetching questions:", error);
        toast({ title: "Failed to fetch questions", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery],
  );

  const fetchPendingQuestions = React.useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/questions?page=${page}&limit=10&scope=pending`,
      );
      if (response.ok) {
        const data = await response.json();
        setPendingData(data);
      }
    } catch (error) {
      console.error("[v0] Error fetching pending questions:", error);
      toast({
        title: "Failed to fetch pending questions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isAdmin) {
      return;
    }
    fetchQuestions(currentPage);
  }, [isAdmin, currentPage, fetchQuestions]);

  React.useEffect(() => {
    if (!isAdmin || activeTab !== "approvals") {
      return;
    }
    fetchPendingQuestions(pendingPage);
  }, [isAdmin, activeTab, pendingPage, fetchPendingQuestions]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePendingPageChange = (page: number) => {
    setPendingPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors = {
      question: "",
      options: ["", "", "", "", ""],
      answer: "",
      number: "",
      linkUrl: "",
    };

    let hasErrors = false;

    // Validate question
    if (!formData.question.trim()) {
      newErrors.question = "Question is required";
      hasErrors = true;
    }

    // Validate answer
    if (!formData.answer.trim()) {
      newErrors.answer = "Answer is required";
      hasErrors = true;
    }

    // Validate number (should be a valid number or empty)
    if (
      formData.number !== "" &&
      (isNaN(Number(formData.number)) || Number(formData.number) < 0)
    ) {
      newErrors.number = "Number must be a positive number or empty";
      hasErrors = true;
    }

    setErrors(newErrors);

    if (hasErrors) {
      toast({ title: "Please fix the errors below", variant: "destructive" });
      return;
    }

    try {
      if (editingId) {
        const response = await fetch(`/api/questions/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            options: formData.options.filter((option) => option.trim() !== ""),
            number:
              formData.number === "" ? undefined : Number(formData.number),
            adminPassword: password,
          }),
        });

        if (!response.ok) throw new Error("Failed to update question");
        toast({ title: "Question updated successfully" });
        setEditingId(null);
      } else {
        const response = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            options: formData.options.filter((option) => option.trim() !== ""),
            number:
              formData.number === "" ? undefined : Number(formData.number),
            adminPassword: password,
          }),
        });

        if (!response.ok) throw new Error("Failed to add question");
        toast({ title: "Question added successfully" });
      }

      setFormData({
        question: "",
        options: ["", "", "", "", ""],
        answer: "",
        explanation: "",
        number: "",
        linkUrl: "",
      });
      setErrors({
        question: "",
        options: ["", "", "", "", ""],
        answer: "",
        number: "",
        linkUrl: "",
      });
      fetchQuestions(currentPage);
    } catch (error) {
      console.error("[v0] Error submitting question:", error);
      toast({ title: "Failed to save question", variant: "destructive" });
    }
  };

  const handleEdit = (question: Question) => {
    setActiveTab("create");
    setEditingId(question.id);
    setFormData({
      question: question.question,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation || "",
      number: question.number?.toString() || "",
      linkUrl: question.linkUrl || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        const response = await fetch(`/api/questions/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminPassword: password }),
        });

        if (!response.ok) throw new Error("Failed to delete question");
        toast({ title: "Question deleted successfully" });
        fetchQuestions(currentPage);
      } catch (error) {
        console.error("[v0] Error deleting question:", error);
        toast({ title: "Failed to delete question", variant: "destructive" });
      }
    }
  };

  const handleApprovePending = async (id: string) => {
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved: true,
          adminPassword: password,
        }),
      });

      if (!response.ok) throw new Error("Failed to approve question");
      toast({ title: "Question approved" });
      fetchPendingQuestions(pendingPage);
      fetchQuestions(currentPage);
    } catch (error) {
      console.error("[v0] Error approving question:", error);
      toast({ title: "Failed to approve question", variant: "destructive" });
    }
  };

  const handleDisapprovePending = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to disapprove this question? It will be deleted.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: password }),
      });

      if (!response.ok) throw new Error("Failed to disapprove question");
      toast({ title: "Question disapproved and deleted" });
      fetchPendingQuestions(pendingPage);
    } catch (error) {
      console.error("[v0] Error disapproving question:", error);
      toast({
        title: "Failed to disapprove question",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowCodeHelper(false);
    setFormData({
      question: "",
      options: ["", "", "", "", ""],
      answer: "",
      explanation: "",
      number: "",
      linkUrl: "",
    });
    setErrors({
      question: "",
      options: ["", "", "", "", ""],
      answer: "",
      number: "",
      linkUrl: "",
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Admin Access</CardTitle>
            <p className="text-center text-muted-foreground">
              Enter the admin password to manage the question bank.
            </p>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                login(loginPassword);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter admin password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  maxLength={6}
                  className="font-mono"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between border-b pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 border-b-2 pb-1 text-center text-sm font-medium transition-colors ${
              activeTab === "dashboard"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            DASHBOARD
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`flex-1 border-b-2 pb-1 text-center text-sm font-medium transition-colors ${
              activeTab === "create"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            CREATE NEW QUESTION
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("approvals")}
            className={`flex-1 border-b-2 pb-1 text-center text-sm font-medium transition-colors ${
              activeTab === "approvals"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            POSTS APPROVAL
          </button>
        </div>

        {activeTab === "dashboard" && (
          <>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">
                  All Questions ({paginatedData.total})
                </h2>
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 border rounded-md bg-background text-foreground text-sm"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 absolute left-3 top-3 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              {paginatedData.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={paginatedData.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}

              {isLoading ? (
                <p>hehe</p>
              ) : paginatedData.data.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No questions yet. Add your first question from the CREATE
                    NEW QUESTION tab.
                  </CardContent>
                </Card>
              ) : (
                paginatedData.data.map((question, index) => {
                  const correctAnswerIndices = getCorrectAnswerIndices(
                    question.answer,
                    question.options?.length ?? 0,
                  );

                  return (
                    <Card key={question.id ?? index}>
                      <CardHeader>
                        <CardTitle className="text-base font-semibold leading-relaxed flex items-start justify-between">
                          <span>
                            {question.number && question.number > 0
                              ? `${question.number}.`
                              : `${(currentPage - 1) * 10 + index + 1}.`}
                            {parseTextWithCode(question.question)}
                          </span>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(question)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(question.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {question.options?.map((option, idx) => {
                          const isCorrect = correctAnswerIndices.includes(idx);
                          return (
                            <div
                              key={idx}
                              className={`rounded-md px-4 py-2 text-sm font-mono transition-colors ${
                                isCorrect
                                  ? "bg-primary/10 border border-primary text-primary"
                                  : "bg-muted"
                              }`}
                            >
                              {parseTextWithCode(option)}
                            </div>
                          );
                        })}
                        <div className="pt-2 text-sm">
                          <span className="font-semibold">Answer: </span>
                          <span className="font-mono text-primary">
                            {question.answer}
                          </span>
                        </div>
                        {question.explanation && (
                          <div className="pt-2 text-sm">
                            <span className="font-semibold">Explanation: </span>
                            <span className="font-mono">
                              {parseTextWithCode(question.explanation)}
                            </span>
                          </div>
                        )}
                        {question.linkUrl && (
                          <p className="pt-2 text-sm">
                            <span className="font-semibold">Source: </span>
                            <a
                              href={question.linkUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary underline break-all"
                            >
                              {question.linkUrl}
                            </a>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {paginatedData.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={paginatedData.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}

        {activeTab === "create" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{editingId ? "Edit Question" : "Add New Question"}</span>
                {editingId && (
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </CardTitle>
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Code formatting:</strong> Use{" "}
                  <code className="bg-background px-1 py-0.5 rounded text-xs">
                    &lt;code&gt;your-code-here&lt;/code&gt;
                  </code>{" "}
                  tags to format code snippets in questions and explanations.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <QuestionForm
                formData={formData}
                errors={errors}
                onSubmit={handleSubmit}
                onChange={setFormData}
                submitLabel={editingId ? "Update Question" : "Add Question"}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "approvals" && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">
              Posts Approval ({pendingData.total})
            </h2>
            {pendingData.data.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No pending questions for approval.
                </CardContent>
              </Card>
            ) : (
              pendingData.data.map((question, index) => {
                const correctAnswerIndices = getCorrectAnswerIndices(
                  question.answer,
                  question.options?.length ?? 0,
                );

                return (
                  <Card key={question.id ?? index}>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold leading-relaxed">
                        <span>
                          {question.number && question.number > 0
                            ? `${question.number}.`
                            : `${(pendingPage - 1) * 10 + index + 1}.`}
                          " "{parseTextWithCode(question.question)}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        {question.options?.map((option, idx) => {
                          const isCorrect = correctAnswerIndices.includes(idx);
                          return (
                            <div
                              key={idx}
                              className={`rounded-md px-4 py-2 text-sm font-mono transition-colors ${
                                isCorrect
                                  ? "bg-primary/10 border border-primary text-primary"
                                  : "bg-muted"
                              }`}
                            >
                              {parseTextWithCode(option)}
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 text-sm">
                        <span className="font-semibold">Answer: </span>
                        <span className="font-mono text-primary">
                          {question.answer}
                        </span>
                      </div>

                      {question.explanation && (
                        <div className="pt-2 text-sm">
                          <span className="font-semibold">Explanation: </span>
                          <span className="font-mono">
                            {parseTextWithCode(question.explanation)}
                          </span>
                        </div>
                      )}

                      {question.linkUrl && (
                        <p className="pt-2 text-sm">
                          <span className="font-semibold">Source: </span>
                          <a
                            href={question.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline break-all"
                          >
                            {question.linkUrl}
                          </a>
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprovePending(question.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDisapprovePending(question.id)}
                        >
                          Disapprove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}

            {pendingData.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pendingPage}
                  totalPages={pendingData.totalPages}
                  onPageChange={handlePendingPageChange}
                />
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
