import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCOUNT_ROLE_KEY = 'account_role';

type AccountRole = 'rider' | 'corporate';

const normalizeRole = (role: string | null | undefined): AccountRole =>
  role === 'corporate' || role === 'corporate_admin' ? 'corporate' : 'rider';

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

  async clearRole(): Promise<void> {
    await AsyncStorage.removeItem(ACCOUNT_ROLE_KEY);
  },

  resolveRole(apiRole?: string | null, storedRole?: string | null): AccountRole {
    if (typeof apiRole === 'string' && apiRole.trim().length > 0) {
      return normalizeRole(apiRole);
    }

    if (typeof storedRole === 'string' && storedRole.trim().length > 0) {
      return normalizeRole(storedRole);
    }

    return 'rider';
  }
};

export type { AccountRole };
