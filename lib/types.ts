export interface Question {
  id: string
  question: string
  options: string[]
  answer: string
  explanation?: string
  category?: string
}

export interface AuthState {
  isAuthenticated: boolean
  isAdmin: boolean
}
