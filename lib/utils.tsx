import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseTextWithCode(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const codeRegex = /<code>(.*?)<\/code>/g
  let lastIndex = 0
  let match

  while ((match = codeRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    // Add code block
    parts.push(
      <code key={match.index} className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
        {match[1]}
      </code>,
    )
    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}
