export type UserRole =
  | 'rider'
  | 'driver'
  | 'corporate_admin'
  | 'admin'
  | 'super_admin'
  | 'operations_manager'
  | 'finance_admin'
  | 'safety_officer'
  | 'support_agent';

export type BookingStatus =
  | 'pending'
  | 'searching'
  | 'driver_assigned'
  | 'driver_heading'
  | 'driver_arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_drivers';

export type BookingTab = 'past' | 'upcoming' | 'ongoing' | 'cancelled';

export type Coordinates = {
  lat: number;
  lng: number;
};

export interface ApiEnvelope<T> {
  success: boolean;
  requestId?: string;
  data: T;
}

export interface ApiErrorEnvelope {
  success: false;
  requestId?: string;
  error: {
    code?: string;
    message: string;
    statusCode?: number;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds?: number;
  refreshExpiresInSeconds?: number;
  csrfToken?: string;
}

export interface AuthUser {
  id: string;
  phoneNumber: string;
  email: string | null;
  role: UserRole;
  status: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

export interface AuthSession {
  tokens: AuthTokens;
  user: AuthUser;
}

export interface RegisterInput {
  phone_number: string;
  password: string;
  role: Extract<UserRole, 'rider' | 'driver' | 'corporate_admin'>;
}

export interface LoginInput {
  phone_number: string;
  password: string;
}

export interface RefreshInput {
  refresh_token: string;
}

export interface VerifyOtpInput {
  phone_number: string;
  otp: string;
}

export interface ForgotPasswordInput {
  phone_number: string;
}

export interface ResetPasswordInput {
  phone_number: string;
  otp: string;
  new_password: string;
}

export interface BookingEstimateInput {
  pickup: Coordinates;
  stops: Coordinates[];
  ride_option_id: string;
}

export interface BookingCreateInput {
  pickup: {
    name: string;
    address: string;
    coordinates: Coordinates;
  };
  stops: Array<{
    name?: string;
    address: string;
    coordinates: Coordinates;
  }>;
  ride_option_id: string;
  booking_type: 'instant' | 'scheduled';
  scheduled_at?: string;
  payment_method_id?: string;
}

export interface DriverLocationUpdateInput {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
}

export interface NearbyDriversInput {
  latitude: number;
  longitude: number;
  radius_km: number;
  tier?: string;
}

export interface ChatSendMessageInput {
  text: string;
}

export interface WalletTopUpInput {
  amount: number;
  payment_method_id?: string;
}

export interface RequestMeta {
  requestId?: string;
  status?: number;
}
