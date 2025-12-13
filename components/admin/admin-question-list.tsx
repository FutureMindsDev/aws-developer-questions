"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import type { Question, PaginatedResponse } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";
import { parseTextWithCode } from "@/lib/utils";

interface AdminQuestionListProps {
  paginatedData: PaginatedResponse<Question>;
  currentPage: number;
  searchQuery: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

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

export function AdminQuestionList({
  paginatedData,
  currentPage,
  searchQuery,
  isLoading,
  onSearchChange,
  onPageChange,
  onEdit,
  onDelete,
}: AdminQuestionListProps) {
  return (
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
              onChange={(e) => onSearchChange(e.target.value)}
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

        {!isLoading && paginatedData.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={paginatedData.totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading questions...
          </div>
        ) : paginatedData.data.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No questions yet. Add your first question from the CREATE NEW
              QUESTION tab.
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
                        onClick={() => onEdit(question)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(question.id)}
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

      {!isLoading && paginatedData.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={paginatedData.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
