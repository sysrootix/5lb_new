import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../config/logger';

const normalizePhone = (input: string): string | null => {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('7')) {
    return digits;
  }
  return null;
};

const buildSMSCUrl = (path: string) => {
  const base = config.smsc.baseUrl.replace(/\/$/, '');
  return `${base}${path}`;
};

const SMSC_SEND_URL = buildSMSCUrl('/sys/send.php');
const SMSC_STATUS_URL = buildSMSCUrl('/sys/status.php');

interface SMSCResponse {
  id?: string;
  cnt?: number;
  code?: string;
  error?: string;
  error_code?: number;
  status?: string;
}

const ensureCredentials = () => {
  if (!config.smsc.login || !config.smsc.password) {
    throw new Error('SMSC credentials not configured');
  }
};

const formatCallMessage = (code: string) => {
  return code.split('').join(' ');
};

/**
 * Генерирует 4-значный код для авторизации
 */
export const generateVerificationCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Отправляет звонок с 4-значным кодом через SMSC.ru
 */
export const sendVerificationCall = async (
  phone: string,
  code: string
): Promise<{ success: boolean; callId?: string; error?: string; errorCode?: number }> => {
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    return {
      success: false,
      error: 'Неверный формат номера телефона. Ожидается 7XXXXXXXXXX'
    };
  }

  try {
    ensureCredentials();
  } catch (error) {
    logger.error(`[SMSC] ${error instanceof Error ? error.message : String(error)}`);
    return { success: false, error: 'Сервис временно недоступен' };
  }

  const payload = new URLSearchParams({
    login: config.smsc.login!,
    psw: config.smsc.password!,
    phones: normalizedPhone,
    mes: formatCallMessage(code),
    call: '1',
    fmt: '3',
    lang: 'ru'
  });

  try {
    logger.info(`[SMSC] Sending voice call to ${normalizedPhone}`);
    const { data } = await axios.post<SMSCResponse>(SMSC_SEND_URL, payload.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });

    if (data.error || data.error_code) {
      const message = data.error ?? 'Ошибка отправки звонка';
      logger.error(`[SMSC] Voice call error (${data.error_code}): ${message}`);
      return {
        success: false,
        error: message,
        errorCode: data.error_code
      };
    }

    if (data.id) {
      logger.info(`[SMSC] Voice call scheduled. ID: ${data.id}`);
      return { success: true, callId: data.id };
    }

    logger.error('[SMSC] Voice call returned unexpected payload', { data });
    return { success: false, error: 'Неизвестная ошибка сервиса' };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return { success: false, error: 'Превышено время ожидания запроса' };
      }
      const statusMessage = error.response
        ? `${error.response.status} ${error.response.statusText}`
        : error.message;
      logger.error(`[SMSC] Voice call request failed: ${statusMessage}`);
      return { success: false, error: 'Ошибка при отправке звонка' };
    }

    logger.error(`[SMSC] Unexpected voice call exception: ${(error as Error).message}`);
    return { success: false, error: 'Не удалось отправить звонок' };
  }
};

/**
 * Отправляет SMS с кодом (запасной вариант)
 */
export const sendVerificationSMS = async (
  phone: string,
  code: string,
  options: { skipSender?: boolean } = {}
): Promise<{ success: boolean; smsId?: string; error?: string; errorCode?: number }> => {
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    return { success: false, error: 'Неверный формат номера телефона' };
  }

  try {
    ensureCredentials();
  } catch (error) {
    logger.error(`[SMSC] ${error instanceof Error ? error.message : String(error)}`);
    return { success: false, error: 'Сервис временно недоступен' };
  }

  const attemptSend = async (includeSender: boolean) => {
    const body = new URLSearchParams({
      login: config.smsc.login!,
      psw: config.smsc.password!,
      phones: normalizedPhone,
      mes: `Ваш код подтверждения 5LB: ${code}`,
      fmt: '3'
    });

    if (includeSender && config.smsc.sender) {
      body.append('sender', config.smsc.sender);
    }

    const { data } = await axios.post<SMSCResponse>(SMSC_SEND_URL, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });

    return data;
  };

  try {
    logger.info(`[SMSC] Sending SMS to ${normalizedPhone}`);
    let data = await attemptSend(!options.skipSender);

    if (data.error_code === 6 && !options.skipSender && config.smsc.sender) {
      logger.warn(
        `[SMSC] Sender "${config.smsc.sender}" rejected with error 6. Retrying without sender`
      );
      data = await attemptSend(false);
    }

    if (data.error || data.error_code) {
      const message = data.error ?? 'Ошибка отправки SMS';
      logger.error(`[SMSC] SMS error (${data.error_code}): ${message}`);
      return {
        success: false,
        error: message,
        errorCode: data.error_code
      };
    }

    if (data.id) {
      logger.info(`[SMSC] SMS sent. ID: ${data.id}`);
      return { success: true, smsId: data.id };
    }

    logger.error('[SMSC] SMS response missing ID', { data });
    return { success: false, error: 'Неизвестная ошибка' };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusMessage = error.response
        ? `${error.response.status} ${error.response.statusText}`
        : error.message;
      logger.error(`[SMSC] SMS request failed: ${statusMessage}`);
    } else {
      logger.error(`[SMSC] SMS exception: ${(error as Error).message}`);
    }
    return { success: false, error: 'Не удалось отправить SMS' };
  }
};

/**
 * Проверяет статус звонка по ID
 */
export const checkCallStatus = async (
  phone: string,
  callId: string
): Promise<{ status?: string; error?: string }> => {
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    return { error: 'Неверный номер телефона' };
  }

  try {
    ensureCredentials();
  } catch (error) {
    logger.error(`[SMSC] ${error instanceof Error ? error.message : String(error)}`);
    return { error: 'Сервис недоступен' };
  }

  try {
    const params = new URLSearchParams({
      login: config.smsc.login!,
      psw: config.smsc.password!,
      phone: normalizedPhone,
      id: callId,
      fmt: '3'
    });

    const { data } = await axios.post<SMSCResponse>(SMSC_STATUS_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 5000
    });

    if (data.error || data.error_code) {
      const message = data.error ?? 'Ошибка получения статуса';
      logger.error(`[SMSC] Status error (${data.error_code}): ${message}`);
      return { error: message };
    }

    return { status: data.status };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusMessage = error.response
        ? `${error.response.status} ${error.response.statusText}`
        : error.message;
      logger.error(`[SMSC] Status request failed: ${statusMessage}`);
    } else {
      logger.error(`[SMSC] Status exception: ${(error as Error).message}`);
    }
    return { error: 'Не удалось проверить статус' };
  }
};
