import { HttpClient } from '../http';
import {
  AuthSession,
  ForgotPasswordInput,
  LoginInput,
  RefreshInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyOtpInput
} from '../types';

export interface RegisterResult {
  userId: string;
  message: string;
}

export interface AuthApi {
  register(input: RegisterInput): Promise<RegisterResult>;
  verifyOtp(input: VerifyOtpInput): Promise<AuthSession>;
  login(input: LoginInput): Promise<AuthSession>;
  refresh(input: RefreshInput): Promise<AuthSession>;
  forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }>;
  resetPassword(input: ResetPasswordInput): Promise<{ message: string }>;
  logout(): Promise<{ message: string }>;
}

export const createAuthApi = (http: HttpClient): AuthApi => {
  return {
    register(input) {
      return http.post<RegisterResult>('/auth/register', input);
    },

    verifyOtp(input) {
      return http.post<AuthSession>('/auth/verify-otp', input);
    },

    login(input) {
      return http.post<AuthSession>('/auth/login', input);
    },

    refresh(input) {
      return http.post<AuthSession>('/auth/refresh', input);
    },

    forgotPassword(input) {
      return http.post<{ message: string }>('/auth/forgot-password', input);
    },

    resetPassword(input) {
      return http.post<{ message: string }>('/auth/reset-password', input);
    },

    logout() {
      return http.post<{ message: string }>('/auth/logout');
    }
  };
};
