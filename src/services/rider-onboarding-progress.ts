import AsyncStorage from '@react-native-async-storage/async-storage';

const RIDER_ONBOARDING_PROGRESS_KEY = 'chauffly:rider:onboarding:progress';

export type RiderOnboardingRoute =
  | '/(auth)/profile-setup/role-selection'
  | '/(auth)/profile-setup/personal-info'
  | '/(auth)/profile-setup/preferences'
  | '/(auth)/profile-setup/corporate-organization'
  | '/(auth)/profile-setup/corporate-admin-info'
  | '/(auth)/profile-setup/corporate-document-upload'
  | '/(auth)/profile-setup/corporate-kyc-verification';

export const RIDER_ONBOARDING_START_ROUTE: RiderOnboardingRoute =
  '/(auth)/profile-setup/role-selection';

type RiderOnboardingProgressState = {
  userId: string;
  route: RiderOnboardingRoute;
  completed: boolean;
  updatedAt: string;
};

const riderRoutes = new Set<RiderOnboardingRoute>([
  '/(auth)/profile-setup/role-selection',
  '/(auth)/profile-setup/personal-info',
  '/(auth)/profile-setup/preferences',
  '/(auth)/profile-setup/corporate-organization',
  '/(auth)/profile-setup/corporate-admin-info',
  '/(auth)/profile-setup/corporate-document-upload',
  '/(auth)/profile-setup/corporate-kyc-verification'
]);

const isRiderRoute = (route: unknown): route is RiderOnboardingRoute => {
  return typeof route === 'string' && riderRoutes.has(route as RiderOnboardingRoute);
};

const serialize = async (state: RiderOnboardingProgressState): Promise<void> => {
  await AsyncStorage.setItem(RIDER_ONBOARDING_PROGRESS_KEY, JSON.stringify(state));
};

const parse = (value: string | null): RiderOnboardingProgressState | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<RiderOnboardingProgressState>;
    if (
      typeof parsed.userId !== 'string' ||
      typeof parsed.completed !== 'boolean' ||
      !isRiderRoute(parsed.route)
    ) {
      return null;
    }

    return {
      userId: parsed.userId,
      completed: parsed.completed,
      route: parsed.route,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString()
    };
  } catch {
    return null;
  }
};

export const riderOnboardingProgressStorage = {
  async get(): Promise<RiderOnboardingProgressState | null> {
    const raw = await AsyncStorage.getItem(RIDER_ONBOARDING_PROGRESS_KEY);
    return parse(raw);
  },

  async start(
    userId: string,
    route: RiderOnboardingRoute = RIDER_ONBOARDING_START_ROUTE
  ): Promise<void> {
    await serialize({
      userId,
      route,
      completed: false,
      updatedAt: new Date().toISOString()
    });
  },

  async setCurrentRoute(route: RiderOnboardingRoute): Promise<void> {
    const current = await this.get();
    if (!current || current.completed) {
      return;
    }

    await serialize({
      ...current,
      route,
      completed: false,
      updatedAt: new Date().toISOString()
    });
  },

  async markComplete(userId?: string): Promise<void> {
    const current = await this.get();
    const resolvedUserId = userId ?? current?.userId;

    if (!resolvedUserId) {
      return;
    }

    await serialize({
      userId: resolvedUserId,
      route: RIDER_ONBOARDING_START_ROUTE,
      completed: true,
      updatedAt: new Date().toISOString()
    });
  },

  async getPendingRoute(): Promise<RiderOnboardingRoute | null> {
    const current = await this.get();
    if (!current || current.completed) {
      return null;
    }

    return current.route;
  },

  async resolvePostAuthRoute(user: { id: string; status?: string | null }): Promise<RiderOnboardingRoute | '/(tabs)'> {
    const current = await this.get();
    if (current && current.userId === user.id && !current.completed) {
      return current.route;
    }

    if (user.status && user.status !== 'active') {
      await this.start(user.id, RIDER_ONBOARDING_START_ROUTE);
      return RIDER_ONBOARDING_START_ROUTE;
    }

    await this.markComplete(user.id);
    return '/(tabs)';
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(RIDER_ONBOARDING_PROGRESS_KEY);
  }
};

