import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { env } from '@/config/env';

// Identifies this app to the server version policy (GET /api/v1/app-version).
const APP_KEY = 'rider';

export interface VersionGateResult {
  updateRequired: boolean;
  storeUrl: string | null;
  minimumVersion: string | null;
  latestVersion: string | null;
}

const parseVersion = (value: string): number[] =>
  value
    .split('.')
    .map((part) => Number.parseInt(part, 10))
    .map((part) => (Number.isFinite(part) ? part : 0));

/** Negative if a < b, 0 if equal, positive if a > b. */
const compareVersions = (a: string, b: string): number => {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  const len = Math.max(pa.length, pb.length);

  for (let i = 0; i < len; i += 1) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
};

/** The native binary version this build was shipped with. */
export const getInstalledVersion = (): string => Constants.expoConfig?.version ?? '0.0.0';

export const fetchVersionGate = async (signal?: AbortSignal): Promise<VersionGateResult> => {
  const url = `${env.apiBaseUrl}${env.apiPrefix}/app-version?app=${APP_KEY}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`app-version request failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: {
      minimumVersion?: string;
      latestVersion?: string;
      ios?: { storeUrl?: string };
      android?: { storeUrl?: string };
    };
  };

  const data = payload.data ?? {};
  const minimumVersion = data.minimumVersion ?? '0.0.0';
  const storeUrl =
    (Platform.OS === 'ios' ? data.ios?.storeUrl : data.android?.storeUrl) ?? null;

  return {
    updateRequired: compareVersions(getInstalledVersion(), minimumVersion) < 0,
    storeUrl,
    minimumVersion,
    latestVersion: data.latestVersion ?? null
  };
};
