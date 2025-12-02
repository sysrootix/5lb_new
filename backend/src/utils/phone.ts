export const normalizePhoneNumber = (phone?: string | null) => {
  if (!phone) {
    return null;
  }

  let digits = phone.replace(/\D/g, '');
  if (digits.length === 0) {
    return null;
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

  if (digits.length < 11) {
    return null;
  }

  return digits;
};
