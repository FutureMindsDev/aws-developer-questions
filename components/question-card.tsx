"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Question } from "@/lib/types";
import { parseTextWithCode } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  // index: number
}

export function QuestionCard({ question }: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = React.useState(false);

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
              className="rounded-md bg-muted px-4 py-2 text-sm font-mono"
            >
              {parseTextWithCode(option)}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnswer(!showAnswer)}
          className="w-full justify-between"
        >
          <span>{showAnswer ? "Hide" : "Show"} Answer</span>
          {showAnswer ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        <div
          className={`space-y-2 rounded-md border border-border bg-accent p-4 transition-all duration-300 ease-out ${
            showAnswer
              ? "animate-in slide-in-from-top-2 opacity-100 max-h-96"
              : "animate-out fade-out-0 slide-out-to-top-2 opacity-0 max-h-0 overflow-hidden"
          }`}
          style={{
            animationFillMode: showAnswer ? "forwards" : "backwards",
          }}
        >
          <div className="font-semibold text-sm">Answer:</div>
          <div className="font-mono text-sm text-primary">
            {question.answer}
          </div>
          {question.explanation && (
            <>
              <div className="font-semibold text-sm mt-3">Explanation:</div>
              <div className="text-sm leading-relaxed">
                {parseTextWithCode(question.explanation)}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
