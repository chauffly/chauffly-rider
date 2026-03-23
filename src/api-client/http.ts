import axios from 'axios';
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import type { TokenStorage } from './storage';
import type { ApiEnvelope, ApiErrorEnvelope, AuthTokens } from './types';

interface ChaufflyRequestConfig extends InternalAxiosRequestConfig {
  __networkRetryCount?: number;
  __retriedAfterRefresh?: boolean;
  __skipAuth?: boolean;
  __isRefreshRequest?: boolean;
}

export interface HttpClientOptions {
  baseURL: string;
  apiPrefix?: string;
  timeoutMs?: number;
  tokenStorage: TokenStorage;
  refreshPath?: string;
  maxNetworkRetries?: number;
  retryBaseDelayMs?: number;
  enableLogging?: boolean;
  getRequestId?: () => string | undefined;
  onAuthFailure?: (reason: string, error?: unknown) => void | Promise<void>;
  onTokensUpdated?: (tokens: AuthTokens) => void | Promise<void>;
}

export class ApiClientError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly requestId?: string;

  constructor(message: string, args?: { status?: number; code?: string; details?: unknown; requestId?: string }) {
    super(message);
    this.name = 'ApiClientError';
    this.status = args?.status;
    this.code = args?.code;
    this.details = args?.details;
    this.requestId = args?.requestId;
  }
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const buildApiBaseUrl = (baseURL: string, apiPrefix: string): string => {
  const normalizedBase = baseURL.replace(/\/+$/, '');
  const normalizedPrefix = apiPrefix.startsWith('/') ? apiPrefix : `/${apiPrefix}`;

  if (normalizedBase.endsWith(normalizedPrefix)) {
    return normalizedBase;
  }

  return `${normalizedBase}${normalizedPrefix}`;
};

const sanitizeForLog = (value: unknown): unknown => {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return sanitizeForLog(parsed);
    } catch {
      return value;
    }
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const hiddenKeys = new Set([
    'password',
    'new_password',
    'confirm_password',
    'refresh_token',
    'access_token',
    'token',
    'otp',
    'authorization'
  ]);

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeForLog(entry));
  }

  const output: Record<string, unknown> = {};

  for (const [key, raw] of Object.entries(value)) {
    if (hiddenKeys.has(key.toLowerCase())) {
      output[key] = '[redacted]';
      continue;
    }

    output[key] = sanitizeForLog(raw);
  }

  return output;
};

const parseEnvelopeError = (payload: ApiErrorEnvelope): ApiClientError => {
  return new ApiClientError(payload.error.message, {
    status: payload.error.statusCode,
    code: payload.error.code,
    details: payload.error.details,
    requestId: payload.requestId
  });
};

const toApiClientError = (error: unknown): ApiClientError => {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (!axios.isAxiosError(error)) {
    return new ApiClientError(error instanceof Error ? error.message : 'Unexpected API client error');
  }

  const payload = error.response?.data as ApiErrorEnvelope | undefined;

  if (payload && payload.success === false && payload.error?.message) {
    return parseEnvelopeError(payload);
  }

  return new ApiClientError(error.message, {
    status: error.response?.status,
    requestId:
      typeof error.response?.headers?.['x-request-id'] === 'string'
        ? (error.response.headers['x-request-id'] as string)
        : undefined
  });
};

const unwrapEnvelope = <T>(response: AxiosResponse<T | ApiEnvelope<T>>): T => {
  const payload = response.data as T | ApiEnvelope<T>;

  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    const envelope = payload as ApiEnvelope<T>;

    if (!envelope.success) {
      throw new ApiClientError('Request failed.');
    }

    return envelope.data;
  }

  return payload as T;
};

const shouldRetryNetworkError = (
  error: AxiosError,
  config: ChaufflyRequestConfig,
  maxRetries: number
): boolean => {
  if (error.response) {
    return false;
  }

  const attempts = config.__networkRetryCount ?? 0;

  if (attempts >= maxRetries) {
    return false;
  }

  return true;
};

export interface HttpClient {
  readonly axios: AxiosInstance;
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

export const createHttpClient = (options: HttpClientOptions): HttpClient => {
  const apiPrefix = options.apiPrefix ?? '/api/v1';
  const refreshPath = options.refreshPath ?? '/auth/refresh';
  const maxNetworkRetries = options.maxNetworkRetries ?? 3;
  const retryBaseDelayMs = options.retryBaseDelayMs ?? 300;
  const enableLogging = options.enableLogging ?? false;

  const apiBaseURL = buildApiBaseUrl(options.baseURL, apiPrefix);

  const axiosClient = axios.create({
    baseURL: apiBaseURL,
    timeout: options.timeoutMs ?? 15000
  });

  const refreshClient = axios.create({
    baseURL: apiBaseURL,
    timeout: options.timeoutMs ?? 15000
  });

  let refreshPromise: Promise<string | null> | null = null;

  const logDebug = (message: string, metadata: Record<string, unknown>): void => {
    if (!enableLogging) {
      return;
    }

    // eslint-disable-next-line no-console
    console.log(`[chauffly-api] ${message}`, sanitizeForLog(metadata));
  };

  const runTokenRefresh = async (): Promise<string | null> => {
    const currentTokens = await options.tokenStorage.getTokens();

    if (!currentTokens?.refreshToken) {
      return null;
    }

    try {
      const response = await refreshClient.post<ApiEnvelope<{ tokens: AuthTokens }>>(
        refreshPath,
        { refresh_token: currentTokens.refreshToken },
        {
          headers: {
            'x-request-id': options.getRequestId?.()
          }
        }
      );

      const raw = unwrapEnvelope<{ tokens: AuthTokens }>(response);
      const nextTokens = raw.tokens;

      if (!nextTokens?.accessToken || !nextTokens?.refreshToken) {
        throw new Error('Refresh response did not include a valid token pair.');
      }

      const mergedTokens: AuthTokens = {
        ...currentTokens,
        ...nextTokens,
        csrfToken: nextTokens.csrfToken ?? currentTokens.csrfToken
      };

      await options.tokenStorage.setTokens(mergedTokens);
      await options.onTokensUpdated?.(mergedTokens);

      return mergedTokens.accessToken;
    } catch (error) {
      await options.tokenStorage.clearTokens();
      await options.onAuthFailure?.('refresh_failed', error);
      throw toApiClientError(error);
    }
  };

  axiosClient.interceptors.request.use(
    async (incomingConfig: InternalAxiosRequestConfig) => {
      const config = incomingConfig as ChaufflyRequestConfig;
      const tokens = await options.tokenStorage.getTokens();

      config.headers = config.headers ?? {};

      if (!config.__skipAuth && tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }

      if ((config.method ?? 'get').toLowerCase() !== 'get' && tokens?.csrfToken) {
        config.headers['x-csrf-token'] = tokens.csrfToken;
      }

      const requestId = options.getRequestId?.();
      if (requestId && !config.headers['x-request-id']) {
        config.headers['x-request-id'] = requestId;
      }

      logDebug('request', {
        method: config.method,
        url: config.url,
        params: config.params,
        data: config.data
      });

      return config;
    },
    (error: unknown) => Promise.reject(toApiClientError(error))
  );

  axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
      logDebug('response', {
        method: response.config.method,
        url: response.config.url,
        status: response.status,
        data: response.data
      });

      return response;
    },
    async (error: AxiosError) => {
      const originalConfig = (error.config ?? {}) as ChaufflyRequestConfig;

      if (shouldRetryNetworkError(error, originalConfig, maxNetworkRetries)) {
        const nextAttempt = (originalConfig.__networkRetryCount ?? 0) + 1;
        originalConfig.__networkRetryCount = nextAttempt;

        const jitter = Math.floor(Math.random() * 100);
        const backoff = retryBaseDelayMs * 2 ** (nextAttempt - 1) + jitter;

        logDebug('retry_network_error', {
          url: originalConfig.url,
          attempt: nextAttempt,
          backoffMs: backoff,
          message: error.message
        });

        await sleep(backoff);
        return axiosClient.request(originalConfig);
      }

      if (
        error.response?.status === 401 &&
        !originalConfig.__isRefreshRequest &&
        !originalConfig.__retriedAfterRefresh
      ) {
        const tokens = await options.tokenStorage.getTokens();

        if (!tokens?.refreshToken) {
          await options.tokenStorage.clearTokens();
          await options.onAuthFailure?.('missing_refresh_token', error);
          throw toApiClientError(error);
        }

        if (!refreshPromise) {
          refreshPromise = runTokenRefresh().finally(() => {
            refreshPromise = null;
          });
        }

        const nextAccessToken = await refreshPromise;

        if (!nextAccessToken) {
          throw toApiClientError(error);
        }

        originalConfig.__retriedAfterRefresh = true;
        originalConfig.headers = originalConfig.headers ?? {};
        originalConfig.headers.Authorization = `Bearer ${nextAccessToken}`;

        return axiosClient.request(originalConfig);
      }

      throw toApiClientError(error);
    }
  );

  const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosClient.get<T | ApiEnvelope<T>>(url, config);
    return unwrapEnvelope<T>(response as AxiosResponse<T | ApiEnvelope<T>>);
  };

  const post = async <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosClient.post<T | ApiEnvelope<T>>(url, body, config);
    return unwrapEnvelope<T>(response as AxiosResponse<T | ApiEnvelope<T>>);
  };

  const put = async <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosClient.put<T | ApiEnvelope<T>>(url, body, config);
    return unwrapEnvelope<T>(response as AxiosResponse<T | ApiEnvelope<T>>);
  };

  const patch = async <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosClient.patch<T | ApiEnvelope<T>>(url, body, config);
    return unwrapEnvelope<T>(response as AxiosResponse<T | ApiEnvelope<T>>);
  };

  const remove = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosClient.delete<T | ApiEnvelope<T>>(url, config);
    return unwrapEnvelope<T>(response as AxiosResponse<T | ApiEnvelope<T>>);
  };

  return {
    axios: axiosClient,
    get,
    post,
    put,
    patch,
    delete: remove
  };
};
