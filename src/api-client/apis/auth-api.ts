import type { HttpClient } from '../http';
import type {
  AuthSession,
  ForgotPasswordInput,
  LoginInput,
  RefreshInput,
  RegisterInput,
  ResendOtpInput,
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
  resendOtp(input: ResendOtpInput): Promise<{ message: string }>;
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

    resendOtp(input) {
      return http.post<{ message: string }>('/auth/resend-otp', input);
    },

    resetPassword(input) {
      return http.post<{ message: string }>('/auth/reset-password', input);
    },

    logout() {
      return http.post<{ message: string }>('/auth/logout');
    }
  };
};
