"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { QuestionCard } from "@/components/question-card"
import { Pagination } from "@/components/pagination"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { LogOut, Search, Shield } from "lucide-react"
import type { Question, PaginatedResponse } from "@/lib/types"

export default function HomePage() {
  const [paginatedData, setPaginatedData] = React.useState<PaginatedResponse<Question>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const router = useRouter()

  const fetchQuestions = React.useCallback(async (page: number, search: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      })
      const response = await fetch(`/api/questions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPaginatedData(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1) // Reset to page 1 when searching
      fetchQuestions(1, searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, fetchQuestions])

  React.useEffect(() => {
    if (currentPage !== 1 || searchQuery === "") {
      fetchQuestions(currentPage, searchQuery)
    }
  }, [currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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
        <div className="mb-6 space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${paginatedData.total} question${paginatedData.total !== 1 ? "s" : ""} found`}
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading questions...</div>
          ) : paginatedData.data.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No questions found. {isAdmin && "Go to admin panel to add questions."}
            </div>
          ) : (
            paginatedData.data.map((question, index) => (
              <QuestionCard key={question.id} question={question} index={(currentPage - 1) * 10 + index} />
            ))
          )}
        </div>

        {!loading && paginatedData.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={paginatedData.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>
    </div>
  )
}
