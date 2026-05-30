export const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

export const asArray = <T = Record<string, unknown>>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

export const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

export const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

export const asBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === 'boolean' ? value : fallback;

export const toNaira = (amount: number): string => `₦${Math.round(amount).toLocaleString()}`;

export const fullName = (user: Record<string, unknown>): string => {
  const firstName = asString(user.first_name ?? user.firstName).trim();
  const lastName = asString(user.last_name ?? user.lastName).trim();
  const normalizedFirst = firstName.replace(/\s+/g, ' ');
  const normalizedLast = lastName.replace(/\s+/g, ' ');

  if (normalizedFirst && normalizedLast) {
    const firstLower = normalizedFirst.toLowerCase();
    const lastLower = normalizedLast.toLowerCase();

    if (firstLower === lastLower || firstLower.endsWith(` ${lastLower}`)) {
      return normalizedFirst;
    }

    return `${normalizedFirst} ${normalizedLast}`.trim();
  }

  return normalizedFirst || normalizedLast || asString(user.full_name, 'Rider');
};

export const parseDateTimeString = (dateString: string): Date | null => {
  if (!dateString) {
    return null;
  }

  // Example: "2026-03-30 17:26:33.297944+01"
  // Needs to be converted to ISO-like format: "2026-03-30T17:26:33.297944+01:00"

  let isoString = dateString.replace(' ', 'T');

  // Check if timezone offset has a colon. If not, add :00
  const timezoneOffsetMatch = isoString.match(/([+-]\d{2})$/);
  if (timezoneOffsetMatch) {
    isoString = isoString.replace(timezoneOffsetMatch[1], `${timezoneOffsetMatch[1]}:00`);
  }

  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return null;
  }
  return date;
};
