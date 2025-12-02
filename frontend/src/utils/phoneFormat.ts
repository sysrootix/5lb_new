export const sanitizePhoneInput = (value: string) => {
  let digits = value.replace(/\D/g, '');

  if (digits.length === 0) {
    return '';
  }

  if (digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  } else if (digits.startsWith('9')) {
    digits = `7${digits}`;
  } else if (!digits.startsWith('7')) {
    digits = `7${digits}`;
  }

  if (digits.length > 11) {
    digits = digits.slice(0, 11);
  }

  return digits;
};

export const formatPhoneDisplay = (value: string) => {
  if (!value || value.length === 0) return '';

  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length === 1) return '+7 (';
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
};
