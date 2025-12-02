import { createHash, createHmac } from 'crypto';
import { env } from '../config/env';
import { logger } from '../config/logger';

export interface TelegramAuthUser {
  id: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  phoneNumber?: string;
  languageCode?: string;
  allowsWriteToPm?: boolean;
}

export interface TelegramAuthData {
  user: TelegramAuthUser;
  authDate: Date;
  hash: string;
  fields: Record<string, string>;
  initData: string;
}

const TELEGRAM_LOGIN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const buildDataCheckString = (params: URLSearchParams) => {
  const dataPairs: string[] = [];
  params.forEach((value, key) => {
    if (key === 'hash') {
      return;
    }
    dataPairs.push(`${key}=${value}`);
  });
  dataPairs.sort();
  return dataPairs.join('\n');
};

const computeLoginHash = (dataCheckString: string, botToken: string) => {
  const secretKey = createHash('sha256').update(botToken).digest();
  return createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
};

const computeWebAppHash = (dataCheckString: string, botToken: string) => {
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  return createHmac('sha256', secret).update(dataCheckString).digest('hex');
};

const parseBooleanFlag = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no'].includes(normalized)) {
    return false;
  }
  return undefined;
};

const parseTelegramUser = (fields: Record<string, string>): TelegramAuthUser => {
  if (fields.user) {
    try {
      const parsed = JSON.parse(fields.user) as Record<string, unknown>;
      const id = Number(parsed.id);
      if (!Number.isFinite(id)) {
        throw new Error('Invalid Telegram user id');
      }
      return {
        id,
        firstName: typeof parsed.first_name === 'string' ? parsed.first_name : undefined,
        lastName: typeof parsed.last_name === 'string' ? parsed.last_name : undefined,
        username: typeof parsed.username === 'string' ? parsed.username : undefined,
        photoUrl: typeof parsed.photo_url === 'string' ? parsed.photo_url : undefined,
        phoneNumber: typeof parsed.phone_number === 'string' ? parsed.phone_number : undefined,
        languageCode:
          typeof parsed.language_code === 'string' ? parsed.language_code : undefined,
        allowsWriteToPm:
          typeof parsed.allows_write_to_pm === 'boolean'
            ? parsed.allows_write_to_pm
            : undefined
      };
    } catch (error) {
      throw new Error('Failed to parse Telegram user payload');
    }
  }

  const id = fields.id ? Number(fields.id) : NaN;
  if (!Number.isFinite(id)) {
    throw new Error('Missing Telegram user id');
  }

  return {
    id,
    firstName: fields.first_name,
    lastName: fields.last_name,
    username: fields.username,
    photoUrl: fields.photo_url,
    phoneNumber: fields.phone_number,
    languageCode: fields.language_code,
    allowsWriteToPm: parseBooleanFlag(fields.allows_write_to_pm)
  };
};

export const validateTelegramAuth = async (initData: string): Promise<TelegramAuthData> => {
  if (!env.telegramBotToken) {
    logger.warn('Telegram auth attempted but bot token missing');
    throw new Error('Telegram auth disabled');
  }

  if (!initData || initData.trim().length === 0) {
    throw new Error('Empty Telegram auth payload');
  }

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');

  if (!hash) {
    logger.warn('Telegram auth payload without hash');
    throw new Error('Invalid Telegram payload');
  }

  const fields: Record<string, string> = {};
  params.forEach((value, key) => {
    fields[key] = value;
  });

  const dataCheckString = buildDataCheckString(params);
  const botToken = env.telegramBotToken;

  const validHashes = new Set<string>();
  try {
    validHashes.add(computeLoginHash(dataCheckString, botToken));
  } catch (error) {
    logger.error('Failed to compute Telegram login hash', error as Error);
  }

  try {
    validHashes.add(computeWebAppHash(dataCheckString, botToken));
  } catch (error) {
    logger.error('Failed to compute Telegram WebApp hash', error as Error);
  }

  if (!validHashes.has(hash)) {
    logger.warn('Telegram auth signature mismatch');
    throw new Error('Invalid Telegram signature');
  }

  const authDateRaw = fields.auth_date;
  if (!authDateRaw) {
    throw new Error('Telegram auth date missing');
  }

  const authDateSeconds = Number(authDateRaw);
  if (!Number.isFinite(authDateSeconds)) {
    throw new Error('Invalid Telegram auth date');
  }

  const authDate = new Date(authDateSeconds * 1000);
  if (Date.now() - authDate.getTime() > TELEGRAM_LOGIN_TTL_MS) {
    throw new Error('Telegram auth data is too old');
  }

  const user = parseTelegramUser(fields);

  logger.info('Telegram auth payload verified', {
    telegramId: user.id,
    username: user.username,
    authDate: authDate.toISOString()
  });

  return {
    user,
    authDate,
    hash,
    fields,
    initData
  };
};
