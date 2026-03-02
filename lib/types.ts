export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  category?: string;
  number?: number;
  createdAt?: Date;
  approved?: boolean;
  linkUrl?: string;
  examType?: string;
}

export interface ExamType {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  createdAt?: Date;
  active?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
