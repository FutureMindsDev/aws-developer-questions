import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseTextWithCode(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const codeRegex = /<code>(.*?)<\/code>/gs
  let lastIndex = 0
  let match
  let keyCounter = 0

  codeRegex.lastIndex = 0

  while ((match = codeRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index)
      if (textBefore) {
        parts.push(<span key={`text-${keyCounter++}`}>{textBefore}</span>)
      }
    }

    const codeContent = match[1]
    const codeLines = codeContent.split("\n")

    parts.push(
      <code
        key={`code-${keyCounter++}`}
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm whitespace-pre-wrap block my-1"
      >
        {codeLines.map((line, idx) => (
          <span key={idx}>
            {line}
            {idx < codeLines.length - 1 && "\n"}
          </span>
        ))}
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
