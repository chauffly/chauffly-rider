const parseNumeric = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    if (!cleaned) {
      return null;
    }

    const parsed = Number.parseFloat(cleaned);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

export type AmountUnit = 'auto' | 'naira' | 'kobo';

export const normalizeAmount = (value: unknown, unit: AmountUnit = 'auto'): number => {
  const parsed = parseNumeric(value);
  if (parsed === null) {
    return 0;
  }

  if (unit === 'naira') {
    return parsed;
  }

  if (unit === 'kobo') {
    return parsed / 100;
  }

  if (Math.abs(parsed) >= 100_000) {
    return parsed / 100;
  }

  return parsed;
};

export const formatNairaAmount = (
  value: unknown,
  options?: { unit?: AmountUnit; minimumFractionDigits?: number; maximumFractionDigits?: number }
): string => {
  const amount = normalizeAmount(value, options?.unit ?? 'auto');
  const minimumFractionDigits = options?.minimumFractionDigits ?? 0;
  const maximumFractionDigits = options?.maximumFractionDigits ?? 0;
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits, maximumFractionDigits })}`;
};
