"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ExamType } from "@/lib/types"; // Assuming this file exists and defines ExamType

interface ExamTypeSelectorProps {
  examTypes: ExamType[];
  selectedExamType: string;
  onExamTypeChange: (examTypeSlug: string) => void;
}

export function ExamTypeSelector({
  examTypes,
  selectedExamType,
  onExamTypeChange,
}: ExamTypeSelectorProps) {
  return (
    <nav className="flex items-center space-x-2">
      {examTypes.map((type) => (
        <button
          key={type.id} // Assuming ExamType has an 'id'
          type="button"
          onClick={() => onExamTypeChange(type.slug)} // Assuming ExamType has a 'slug'
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors cursor-pointer",
            "h-8 px-3 py-2", // Matches plan's padding and a common small button height
            "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "disabled:pointer-events-none disabled:opacity-50",
            selectedExamType === type.slug
              ? "text-primary bg-accent" // Active state
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50", // Inactive state with hover
          )}
        >
          {type.name} {/* Assuming ExamType has a 'name' */}
        </button>
      ))}
    </nav>
  );
}