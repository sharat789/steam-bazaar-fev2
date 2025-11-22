export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  error?: {
    message: string;
    code?: string;
  };
}
