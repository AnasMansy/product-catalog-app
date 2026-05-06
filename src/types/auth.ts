export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";
export type AuthProvider = "dummyjson" | "demo";

export interface LoginCredentials {
  username: string;
  password: string;
  expiresInMins?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  image?: string;
}

export interface AuthResponse extends User {
  accessToken: string;
  refreshToken?: string;
}

export interface StoredAuthSession {
  token: string;
  user: User;
  provider: AuthProvider;
}

export interface DemoUserRecord {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: number;
}

export interface DemoRegistrationData {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  status: RequestStatus;
  error: string | null;
  isHydrated: boolean;
}
