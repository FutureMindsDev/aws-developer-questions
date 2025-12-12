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
    return question.answer
      .split(",")
      .map((a) => a.trim().toUpperCase().charCodeAt(0) - 65) // Convert A->0, B->1, etc.
      .filter((idx) => idx >= 0 && idx < question.options.length);
  }, [question.answer, question.options]);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold leading-relaxed">
          {question.number || "Number"}. {parseTextWithCode(question.question)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {question.options.map((option, idx) => (
            <div
              key={idx}
              className={`rounded-md px-4 py-2 text-sm font-mono transition-colors ${
                showAnswer && correctAnswerIndices.includes(idx)
                  ? "bg-primary/10 border border-primary text-primary"
                  : "bg-muted"
              }`}
            >
              {parseTextWithCode(option)}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnswer(!showAnswer)}
          className="justify-between"
        >
          <span>{showAnswer ? "Hide" : "Show"} Answer</span>
        </Button>

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
