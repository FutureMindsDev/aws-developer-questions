"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Question } from "@/lib/types";
import { parseTextWithCode } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  // index: number
}

export function QuestionCard({ question }: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = React.useState(false);

  // Convert answer string to array of indices (e.g., "A, C" -> [0, 2])
  const correctAnswerIndices = React.useMemo(() => {
    if (!question.answer) return [];
    if (question.answerType === "string") return [];
    return question.answer
      .split(",")
      .map((a) => a.trim().toUpperCase().charCodeAt(0) - 65) // Convert A->0, B->1, etc.
      .filter((idx) => idx >= 0 && idx < (question.options?.length || 0));
  }, [question.answer, question.options, question.answerType]);

  // Check if option is a base64 image
  const isImageOption = (option: string) => {
    const value = typeof option === "string" ? option.trim() : "";
    return value.startsWith("data:image/");
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold leading-relaxed">
          {question.number || "Number"}. {parseTextWithCode(question.question)}
        </CardTitle>
        {(question.questionImages?.length || 0) > 0 && (
          <div className="mt-3 space-y-2">
            {(question.questionImages || []).map((img, idx) => (
              <img
                key={`${idx}-${img.substring(0, 20)}`}
                src={img.trim()}
                alt={`Question photo ${idx + 1}`}
                className="w-full max-h-80 object-contain rounded border bg-muted"
                onError={(e) => {
                  console.error(
                    "Question image failed to load:",
                    img.substring(0, 50) + "...",
                  );
                  e.currentTarget.style.display = "none";
                }}
              />
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {question.answerType === "string" ? (
            <div className="rounded-md px-4 py-2 text-sm font-mono bg-muted">
              <strong>Answer:</strong> {parseTextWithCode(question.answer)}
            </div>
          ) : (
            question.options?.map((option, idx) => (
              <div
                key={`${idx}-${option.substring(0, 20)}`}
                className={`rounded-md p-2 text-sm font-mono transition-colors ${
                  showAnswer && correctAnswerIndices.includes(idx)
                    ? "bg-primary/10 border border-primary text-primary"
                    : "bg-muted"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {isImageOption(option) ? (
                    <img
                      src={option.trim()}
                      alt={`Option ${String.fromCharCode(65 + idx)}`}
                      className="h-24 w-auto max-w-full object-cover rounded border"
                      onError={(e) => {
                        console.error(
                          "Image failed to load in card:",
                          option.substring(0, 50) + "...",
                        );
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="flex-1">{option}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {question.answerType !== "string" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnswer(!showAnswer)}
            className="justify-between"
          >
            <span>{showAnswer ? "Hide" : "Show"} Answer</span>
          </Button>
        )}

        {showAnswer && question.explanation && (
          <div className="space-y-2 rounded-md border border-border bg-accent p-4 animate-in fade-in">
            <div className="font-semibold text-sm">Explanation:</div>
            <div className="text-sm leading-relaxed">
              {parseTextWithCode(question.explanation)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
