import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseTextWithCode(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const codeRegex = /<code>(.*?)<\/code>/gs // Added 's' flag for multiline support
  let lastIndex = 0
  let match
  let keyCounter = 0

  // Reset regex lastIndex to ensure it starts from beginning
  codeRegex.lastIndex = 0

  while ((match = codeRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index)
      if (textBefore) {
        parts.push(<span key={`text-${keyCounter++}`}>{textBefore}</span>)
      }
    }
    // Add code block
    parts.push(
      <code key={`code-${keyCounter++}`} className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
        {match[1]}
      </code>,
    )
    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex)
    if (remainingText) {
      parts.push(<span key={`text-${keyCounter++}`}>{remainingText}</span>)
    }
  }

  return parts.length > 0 ? parts : [text]
}
