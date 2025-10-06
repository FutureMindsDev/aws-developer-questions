export interface Question {
  id: string
  question: string
  options: string[]
  answer: string
  explanation?: string
  category?: string
  createdAt?: Date
}

export interface AuthState {
  isAuthenticated: boolean
  isAdmin: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
