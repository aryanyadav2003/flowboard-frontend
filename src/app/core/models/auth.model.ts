export interface RegisterRequest {
  fullName: string;
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  userId: number;
  fullName: string;
  email: string;
  username: string;
  role: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[];
}