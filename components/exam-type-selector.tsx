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

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ExamTypeSelectorProps {
  onSelect: (type: string) => void;
}

export function ExamTypeSelector({ onSelect }: ExamTypeSelectorProps) {
  const [selected, setSelected] = useState("MCQ");
  const examTypes = ["MCQ", "Theory", "Practical"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
        >
          {selected}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {examTypes.map((type) => (
          <DropdownMenuItem
            key={type}
            onSelect={() => {
              setSelected(type);
              onSelect(type);
            }}
          >
            {type}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
