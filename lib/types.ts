export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  category?: string;
  number?: number;
  createdAt?: Date;
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
