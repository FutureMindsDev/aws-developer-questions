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

export function ExamTypeSelector() {
  const { examType, setExamType } = useExamType();
  const selectedExamType = examTypes.find((type) => type.value === examType);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-[160px] justify-start text-left hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 transition-colors"
        >
          <Menu className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">
            {selectedExamType?.label ?? "Select exam type"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[160px]">
        {examTypes.map((type) => (
          <DropdownMenuItem
            key={type.value}
            onSelect={() => setExamType(type.value)}
            className={
              type.value === examType
                ? "bg-accent text-accent-foreground"
                : ""
            }
          >
            {type.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
