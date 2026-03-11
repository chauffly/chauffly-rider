export const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

export const asArray = <T = Record<string, unknown>>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

export const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

export const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export const asBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === 'boolean' ? value : fallback;

export const toNaira = (amount: number): string => `₦${Math.round(amount).toLocaleString()}`;

export const fullName = (user: Record<string, unknown>): string => {
  const firstName = asString(user.first_name ?? user.firstName);
  const lastName = asString(user.last_name ?? user.lastName);
  const combined = `${firstName} ${lastName}`.trim();
  return combined || asString(user.full_name, 'Driver');
};
