import type { AuthTokens } from './types';

const DEFAULT_TOKEN_STORAGE_KEY = 'chauffly:auth:tokens';
const SECURE_STORE_KEY_FALLBACK = 'chauffly.auth.tokens';

export interface TokenStorage {
  getTokens(): Promise<AuthTokens | null>;
  setTokens(tokens: AuthTokens): Promise<void>;
  clearTokens(): Promise<void>;
}

export interface AsyncKeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface SecureStoreLike {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

const toSecureStoreKey = (key: string): string => {
  const sanitized = key.trim().replace(/[^A-Za-z0-9._-]/g, '_');
  return sanitized.length > 0 ? sanitized : SECURE_STORE_KEY_FALLBACK;
};

const safeParseTokens = (raw: string | null): AuthTokens | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthTokens;

    if (!parsed.accessToken || !parsed.refreshToken) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export class MemoryTokenStorage implements TokenStorage {
  private value: AuthTokens | null = null;

  public async getTokens(): Promise<AuthTokens | null> {
    return this.value;
  }

  public async setTokens(tokens: AuthTokens): Promise<void> {
    this.value = tokens;
  }

  public async clearTokens(): Promise<void> {
    this.value = null;
  }
}

export const createAsyncStorageTokenStorage = (
  storage: AsyncKeyValueStorage,
  key: string = DEFAULT_TOKEN_STORAGE_KEY
): TokenStorage => {
  return {
    async getTokens(): Promise<AuthTokens | null> {
      return safeParseTokens(await storage.getItem(key));
    },

    async setTokens(tokens: AuthTokens): Promise<void> {
      await storage.setItem(key, JSON.stringify(tokens));
    },

    async clearTokens(): Promise<void> {
      await storage.removeItem(key);
    }
  };
};

export const createSecureStoreTokenStorage = (
  secureStore: SecureStoreLike,
  key: string = DEFAULT_TOKEN_STORAGE_KEY
): TokenStorage => {
  const secureStoreKey = toSecureStoreKey(key);

  return {
    async getTokens(): Promise<AuthTokens | null> {
      return safeParseTokens(await secureStore.getItemAsync(secureStoreKey));
    },

    async setTokens(tokens: AuthTokens): Promise<void> {
      await secureStore.setItemAsync(secureStoreKey, JSON.stringify(tokens));
    },

    async clearTokens(): Promise<void> {
      await secureStore.deleteItemAsync(secureStoreKey);
    }
  };
};
