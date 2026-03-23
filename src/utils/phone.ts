const onlyDigits = (value: string): string => value.replace(/\D/g, '');

export const normalizeNigerianPhoneNumber = (input: string): string | null => {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  const digits = onlyDigits(trimmed);

  if (!digits) {
    return null;
  }

  let localDigits: string;

  if (digits.startsWith('234')) {
    localDigits = digits.slice(3);
  } else if (digits.startsWith('0')) {
    localDigits = digits.slice(1);
  } else {
    localDigits = digits;
  }

  if (!/^\d{10}$/.test(localDigits)) {
    return null;
  }

  return `+234${localDigits}`;
};

export const isValidNigerianPhoneInput = (input: string): boolean => {
  return normalizeNigerianPhoneNumber(input) !== null;
};
