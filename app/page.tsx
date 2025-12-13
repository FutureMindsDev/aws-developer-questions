"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/question-card";
import { Pagination } from "@/components/pagination";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/auth-provider";
import { LogOut, Search, Shield, X, CheckIcon } from "lucide-react";
import type { Question, PaginatedResponse } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
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

  const fetchQuestions = React.useCallback(
    async (page: number, search: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          scope: "public",
          ...(search && { search }),
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

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to page 1 when searching
      fetchQuestions(1, searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchQuestions]);

  React.useEffect(() => {
    if (currentPage !== 1 || searchQuery === "") {
      fetchQuestions(currentPage, searchQuery);
    }
  }, [currentPage, searchQuery, fetchQuestions]);

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
            <h1 className="text-lg font-semibold">AWS Developer Q&A</h1>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin")}
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Button>
            )}
            <ThemeToggle />
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
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
                } found`}
          </div>
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
              <QuestionCard key={index} question={question} />
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

      {showSubmitForm && (
        <div
          className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center px-4"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "gray transparent",
            scrollbarGutter: "stable",
          }}
          onClick={() => setShowSubmitForm(false)}
        >
          <div
            className="w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="flex flex-col h-[90dvh]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Submit a new question</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This question will be reviewed by an admin before it appears
                    on the site.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSubmitForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="mb-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  Submissions are subject to admin approval. Only approved
                  questions will be visible on the public site.
                </div>
                <form onSubmit={handlePublicSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="public-number">Number</Label>
                    <Input
                      id="public-number"
                      type="number"
                      placeholder="Question number (for sorting)"
                      value={submitFormData.number}
                      onChange={(e) =>
                        setSubmitFormData({
                          ...submitFormData,
                          number: e.target.value,
                        })
                      }
                      className={`font-mono text-sm ${
                        submitErrors.number ? "border-destructive" : ""
                      }`}
                    />
                    {submitErrors.number && (
                      <p className="text-sm text-destructive">
                        {submitErrors.number}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="public-question">
                      Question <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="public-question"
                      placeholder="Enter the question..."
                      value={submitFormData.question}
                      onChange={(e) =>
                        setSubmitFormData({
                          ...submitFormData,
                          question: e.target.value,
                        })
                      }
                      className={`min-h-[100px] font-mono text-sm ${
                        submitErrors.question ? "border-destructive" : ""
                      }`}
                      required
                    />
                    {submitErrors.question && (
                      <p className="text-sm text-destructive">
                        {submitErrors.question}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="public-linkUrl">
                      Source link <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="public-linkUrl"
                      type="url"
                      placeholder="https://example.com/where-you-found-this-question"
                      value={submitFormData.linkUrl}
                      onChange={(e) =>
                        setSubmitFormData({
                          ...submitFormData,
                          linkUrl: e.target.value,
                        })
                      }
                      className={
                        submitErrors.linkUrl ? "border-destructive" : ""
                      }
                      required
                    />
                    {submitErrors.linkUrl && (
                      <p className="text-sm text-destructive">
                        {submitErrors.linkUrl}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Options</Label>
                    {submitFormData.options.map((option, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-start space-x-2">
                          <Textarea
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...submitFormData.options];
                              newOptions[idx] = e.target.value;
                              setSubmitFormData({
                                ...submitFormData,
                                options: newOptions,
                              });
                            }}
                            className={`font-mono text-sm min-h-[60px] flex-1 ${
                              submitErrors.options[idx]
                                ? "border-destructive"
                                : ""
                            }`}
                          />
                          <Button
                            variant={
                              submitFormData.answer?.includes(
                                String.fromCharCode(65 + idx),
                              )
                                ? "default"
                                : "outline"
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              const answerArray = submitFormData.answer
                                ? submitFormData.answer
                                    .split(",")
                                    .map((a) => a.trim())
                                : [];
                              const optionLetter = String.fromCharCode(
                                65 + idx,
                              );

                              if (answerArray.includes(optionLetter)) {
                                const newAnswer = answerArray
                                  .filter((a) => a !== optionLetter)
                                  .join(", ");
                                setSubmitFormData({
                                  ...submitFormData,
                                  answer: newAnswer,
                                });
                              } else {
                                const newAnswer = [
                                  ...answerArray,
                                  optionLetter,
                                ].join(", ");
                                setSubmitFormData({
                                  ...submitFormData,
                                  answer: newAnswer,
                                });
                              }
                            }}
                            className={`h-10 w-10 rounded-md border flex items-center justify-center ${
                              submitFormData.answer?.includes(
                                String.fromCharCode(65 + idx),
                              )
                                ? "text-primary-foreground"
                                : "border-input"
                            }`}
                          >
                            {submitFormData.answer?.includes(
                              String.fromCharCode(65 + idx),
                            ) && <CheckIcon className="h-5 w-5" />}
                          </Button>
                        </div>
                        {submitErrors.options[idx] && (
                          <p className="text-sm text-destructive">
                            {submitErrors.options[idx]}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="text-sm text-muted-foreground mt-2">
                      Click the checkmark next to each option to select it as an
                      answer
                    </div>
                    {submitErrors.answer && (
                      <p className="text-sm text-destructive">
                        {submitErrors.answer}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="public-explanation">
                      Explanation (Optional)
                    </Label>
                    <Textarea
                      id="public-explanation"
                      placeholder="Explain the answer..."
                      value={submitFormData.explanation}
                      onChange={(e) =>
                        setSubmitFormData({
                          ...submitFormData,
                          explanation: e.target.value,
                        })
                      }
                      className="min-h-[100px] text-sm font-mono"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit for approval"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
