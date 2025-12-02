/**
 * Временное хранилище кодов подтверждения
 * В production следует использовать Redis
 */

interface VerificationCode {
  code: string;
  phone: string;
  expiresAt: number;
  attempts: number;
}

class VerificationStore {
  private codes: Map<string, VerificationCode> = new Map();
  private readonly MAX_ATTEMPTS = 3;
  private readonly CODE_TTL = 5 * 60 * 1000; // 5 минут

  /**
   * Сохраняет код подтверждения для телефона
   */
  set(phone: string, code: string): void {
    const cleanPhone = phone.replace(/\D/g, '');
    this.codes.set(cleanPhone, {
      code,
      phone: cleanPhone,
      expiresAt: Date.now() + this.CODE_TTL,
      attempts: 0,
    });
  }

  /**
   * Проверяет код подтверждения
   */
  verify(phone: string, code: string): { valid: boolean; error?: string } {
    const cleanPhone = phone.replace(/\D/g, '');
    const stored = this.codes.get(cleanPhone);

    if (!stored) {
      return { valid: false, error: 'Код не найден или истек' };
    }

    // Проверка истечения срока
    if (Date.now() > stored.expiresAt) {
      this.codes.delete(cleanPhone);
      return { valid: false, error: 'Код истек. Запросите новый' };
    }

    // Проверка количества попыток
    if (stored.attempts >= this.MAX_ATTEMPTS) {
      this.codes.delete(cleanPhone);
      return { valid: false, error: 'Превышено количество попыток. Запросите новый код' };
    }

    // Увеличиваем счетчик попыток
    stored.attempts++;

    // Проверка кода
    if (stored.code !== code) {
      return { valid: false, error: 'Неверный код' };
    }

    // Код правильный - удаляем из хранилища
    this.codes.delete(cleanPhone);
    return { valid: true };
  }

  /**
   * Проверяет, можно ли отправить новый код
   * (защита от спама)
   */
  canSendNew(phone: string): { canSend: boolean; error?: string; remainingTime?: number } {
    const cleanPhone = phone.replace(/\D/g, '');
    const stored = this.codes.get(cleanPhone);

    if (!stored) {
      return { canSend: true };
    }

    const now = Date.now();
    const timeSinceCreation = now - (stored.expiresAt - this.CODE_TTL);
    const minTimeBetweenSends = 60 * 1000; // 1 минута

    if (timeSinceCreation < minTimeBetweenSends) {
      const remainingTime = Math.ceil((minTimeBetweenSends - timeSinceCreation) / 1000);
      return {
        canSend: false,
        error: `Повторная отправка возможна через ${remainingTime} сек`,
        remainingTime,
      };
    }

    return { canSend: true };
  }

  /**
   * Удаляет код для телефона
   */
  delete(phone: string): void {
    const cleanPhone = phone.replace(/\D/g, '');
    this.codes.delete(cleanPhone);
  }

  /**
   * Очищает истекшие коды (для периодической очистки)
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [phone, data] of this.codes.entries()) {
      if (now > data.expiresAt) {
        this.codes.delete(phone);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Singleton instance
export const verificationStore = new VerificationStore();

// Периодическая очистка истекших кодов
setInterval(() => {
  const cleaned = verificationStore.cleanup();
  if (cleaned > 0) {
    console.log(`[VerificationStore] Cleaned ${cleaned} expired codes`);
  }
}, 60 * 1000); // Каждую минуту
