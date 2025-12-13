"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import type { Question, PaginatedResponse } from "@/lib/types";
import { parseTextWithCode } from "@/lib/utils";

interface PendingApprovalsListProps {
  pendingData: PaginatedResponse<Question>;
  pendingPage: number;
  onPendingPageChange: (page: number) => void;
  onApprove: (id: string) => void;
  onDisapprove: (id: string) => void;
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

export function PendingApprovalsList({
  pendingData,
  pendingPage,
  onPendingPageChange,
  onApprove,
  onDisapprove,
}: PendingApprovalsListProps) {
  return (
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
                      : `${(pendingPage - 1) * 10 + index + 1}.`}{" "}
                    {parseTextWithCode(question.question)}
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
                  <Button size="sm" onClick={() => onApprove(question.id)}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDisapprove(question.id)}
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
            onPageChange={onPendingPageChange}
          />
        </div>
      )}
    </section>
  );
}
