"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { QuestionCard } from "@/components/question-card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { LogOut, Search, Shield } from "lucide-react"
import type { Question } from "@/lib/types"

export default function HomePage() {
  const [questions, setQuestions] = React.useState<Question[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch("/api/questions")
        if (response.ok) {
          const data = await response.json()
          setQuestions(data)
        }
      } catch (error) {
        console.error("[v0] Error fetching questions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  const filteredQuestions = questions.filter((q) => q.question.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">AWS Developer Q&A</h1>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            <ThemeToggle />
            {isAuthenticated ? (
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">{filteredQuestions.length} questions</div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No questions found. {isAdmin && "Go to admin panel to add questions."}
            </div>
          ) : (
            filteredQuestions.map((question, index) => (
              <QuestionCard key={question.id} question={question} index={index} />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
