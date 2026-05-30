export const normalizeNigerianPhoneNumber = (input: string): string | null => {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/[\s()-]+/g, '');

  if (!normalized) {
    return null;
  }

  const digitsOnly = normalized.startsWith('+') ? normalized.slice(1) : normalized;

  if (!/^\d+$/.test(digitsOnly)) {
    return null;
  }

  return normalized;
};

export const isValidNigerianPhoneInput = (input: string): boolean => {
  return normalizeNigerianPhoneNumber(input) !== null;
};
