"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import type { ExamType } from "@/lib/types";

interface ExamTypeSelectorProps {
  examTypes: ExamType[];
  selectedExamType: string;
  onExamTypeChange: (examType: string) => void;
}

export function ExamTypeSelector({
  examTypes,
  selectedExamType,
  onExamTypeChange,
}: ExamTypeSelectorProps) {
  const selectedExam = examTypes.find((exam) => exam.name === selectedExamType);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-[160px] justify-start text-left bg-background border-input hover:bg-accent focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <Menu className="h-4 w-4 mr-2" />
          {selectedExam?.displayName || "Select Exam Type"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[160px]">
        {examTypes.map((examType) => (
          <DropdownMenuItem
            key={examType.id}
            onClick={() => onExamTypeChange(examType.name)}
            className={selectedExamType === examType.name ? "bg-accent" : ""}
          >
            {examType.displayName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
