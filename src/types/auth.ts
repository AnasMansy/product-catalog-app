export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

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

export interface AuthState {
  token: string | null;
  user: User | null;
  status: RequestStatus;
  error: string | null;
  isHydrated: boolean;
}
