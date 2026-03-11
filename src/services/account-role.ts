import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCOUNT_ROLE_KEY = 'account_role';

type AccountRole = 'rider' | 'corporate';

const normalizeRole = (role: string): AccountRole =>
  role === 'corporate' ? 'corporate' : 'rider';

export const accountRoleService = {
  async getRole(): Promise<AccountRole> {
    const stored = await AsyncStorage.getItem(ACCOUNT_ROLE_KEY);
    if (stored) {
      return normalizeRole(stored);
    }
    return 'rider';
  },

  async setRole(role: AccountRole): Promise<void> {
    await AsyncStorage.setItem(ACCOUNT_ROLE_KEY, role);
  },
};

export type { AccountRole };
