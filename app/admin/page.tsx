"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { Pagination } from "@/components/pagination";
import { useAuth } from "@/components/auth-provider";
import type { Question, PaginatedResponse } from "@/lib/types";
import { Plus, Pencil, Trash2, Home, LogOut, X, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { parseTextWithCode } from "@/lib/utils";

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
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [showCodeHelper, setShowCodeHelper] = React.useState(false);
  const [formData, setFormData] = React.useState({
    question: "",
    options: ["", "", "", ""],
    answer: "",
    explanation: "",
    number: "",
  });
  const [errors, setErrors] = React.useState({
    question: "",
    options: ["", "", "", ""],
    answer: "",
    number: "",
  });
  const { isAdmin, logout, password } = useAuth();
  const router = useRouter();

  const fetchQuestions = React.useCallback(async (page: number) => {
    try {
      const response = await fetch(`/api/questions?page=${page}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setPaginatedData(data);
      }
    } catch (error) {
      console.error("[v0] Error fetching questions:", error);
      toast({ title: "Failed to fetch questions", variant: "destructive" });
    }
  }, []);

  React.useEffect(() => {
    if (!isAdmin) {
      router.push("/login");
      return;
    }
    fetchQuestions(currentPage);
  }, [isAdmin, router, currentPage, fetchQuestions]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors = {
      question: "",
      options: ["", "", "", ""],
      answer: "",
      number: "",
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
        options: ["", "", "", ""],
        answer: "",
        explanation: "",
        number: "",
      });
      setErrors({
        question: "",
        options: ["", "", "", ""],
        answer: "",
        number: "",
      });
      fetchQuestions(currentPage);
    } catch (error) {
      console.error("[v0] Error submitting question:", error);
      toast({ title: "Failed to save question", variant: "destructive" });
    }
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setFormData({
      question: question.question,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation || "",
      number: question.number?.toString() || "",
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

  const handleCancel = () => {
    setEditingId(null);
    setShowCodeHelper(false);
    setFormData({
      question: "",
      options: ["", "", "", ""],
      answer: "",
      explanation: "",
      number: "",
    });
    setErrors({
      question: "",
      options: ["", "", "", ""],
      answer: "",
      number: "",
    });
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
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
                💡 <strong>Code formatting:</strong> Use <code className="bg-background px-1 py-0.5 rounded text-xs">&lt;code&gt;your-code-here&lt;/code&gt;</code> tags to format code snippets in questions and explanations.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="number">
                  Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="number"
                  type="number"
                  placeholder="Question number (for sorting)"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  className={`font-mono text-sm ${
                    errors.number ? "border-destructive" : ""
                  }`}
                />
                {errors.number && (
                  <p className="text-sm text-destructive">{errors.number}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="question">
                  Question <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="question"
                  placeholder="Enter the question..."
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  className={`min-h-[100px] font-mono text-sm ${
                    errors.question ? "border-destructive" : ""
                  }`}
                  required
                />
                {errors.question && (
                  <p className="text-sm text-destructive">{errors.question}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                {formData.options.map((option, idx) => (
                  <div key={idx} className="space-y-1">
                    <Textarea
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[idx] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      className={`font-mono text-sm min-h-[60px] ${
                        errors.options[idx] ? "border-destructive" : ""
                      }`}
                    />
                    {errors.options[idx] && (
                      <p className="text-sm text-destructive">
                        {errors.options[idx]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">
                  Answer <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="answer"
                  placeholder="e.g., A, B, C, D or A, C"
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  className={`font-mono text-sm ${
                    errors.answer ? "border-destructive" : ""
                  }`}
                  required
                />
                {errors.answer && (
                  <p className="text-sm text-destructive">{errors.answer}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  placeholder="Explain the answer..."
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  className="min-h-[100px] text-sm font-mono"
                />
              </div>

              <Button type="submit" className="w-full">
                {editingId ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Update Question
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            All Questions ({paginatedData.total})
          </h2>
          {paginatedData.data.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No questions yet. Add your first question above.
              </CardContent>
            </Card>
          ) : (
            paginatedData.data.map((question, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base font-semibold leading-relaxed flex items-start justify-between">
                    <span>
                      {question.number && question.number > 0
                        ? `${question.number}.`
                        : `${(currentPage - 1) * 10 + index + 1}.`}{" "}
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
                  {question.options?.map((option, idx) => (
                    <div
                      key={idx}
                      className="rounded-md bg-muted px-4 py-2 text-sm font-mono"
                    >
                      {parseTextWithCode(option)}
                    </div>
                  ))}
                  <div className="pt-2 text-sm">
                    <span className="font-semibold">Answer: </span>
                    <span className="font-mono text-primary">
                      {question.answer}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
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
      </main>
    </div>
  );
}
