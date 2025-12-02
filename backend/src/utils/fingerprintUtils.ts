import { createHash } from 'crypto';

/**
 * Хеширует fingerprint для безопасного хранения
 */
export const hashFingerprint = (fingerprint: string): string => {
  return createHash('sha256').update(fingerprint).digest('hex');
};

/**
 * Проверяет валидность fingerprint
 */
export const isValidFingerprint = (fingerprint: string): boolean => {
  // Fingerprint должен быть непустой строкой и иметь разумную длину
  return typeof fingerprint === 'string' && fingerprint.length >= 10 && fingerprint.length <= 500;
};





















