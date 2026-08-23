"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Question } from "@/lib/types";
import { parseTextWithCode } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  defaultShowAnswer?: boolean;
}

export function QuestionCard({ question, defaultShowAnswer }: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(defaultShowAnswer ?? false);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">{question.question}</CardTitle>
        {question.examType && (
          <p className="text-sm text-muted-foreground">{question.examType}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {question.options.map((option, index) => (
            <li
              key={index}
              className="rounded-md border p-3 text-sm"
            >
              {option}
            </li>
          ))}
        </ul>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnswer((previous) => !previous)}
        >
          {showAnswer ? "Hide Answer" : "Show Answer"}
        </Button>

        {showAnswer && (
          <div className="space-y-2 rounded-md bg-muted p-4">
            <p>
              <strong>Answer:</strong> {question.answer}
            </p>
            {question.explanation && (
              <p>
                <strong>Explanation:</strong> {question.explanation}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
