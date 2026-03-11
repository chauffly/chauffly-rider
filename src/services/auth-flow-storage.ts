import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_FLOW_KEY = 'chauffly:auth:flow';

export type AuthFlowMode = 'register' | 'reset_password';

export interface AuthFlowState {
  mode: AuthFlowMode;
  phoneNumber: string;
}

export const authFlowStorage = {
  async get(): Promise<AuthFlowState | null> {
    try {
      const raw = await AsyncStorage.getItem(AUTH_FLOW_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as AuthFlowState;
      if (!parsed?.mode || !parsed?.phoneNumber) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  },

  async set(state: AuthFlowState): Promise<void> {
    await AsyncStorage.setItem(AUTH_FLOW_KEY, JSON.stringify(state));
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_FLOW_KEY);
  }
};
