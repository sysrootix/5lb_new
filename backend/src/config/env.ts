import 'dotenv/config';
import appConfig from '../../../config/app-config.json';

const defaultDomain =
  typeof appConfig.domain === 'string' ? appConfig.domain : 'https://app.5lb.pro';
const defaultApiUrl =
  typeof appConfig.apiBaseUrl === 'string' ? appConfig.apiBaseUrl : `${defaultDomain}/api`;
const defaultCorsOrigins =
  Array.isArray(appConfig.allowedOrigins) && appConfig.allowedOrigins.length > 0
    ? (appConfig.allowedOrigins as string[])
    : [defaultDomain];

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (value === undefined || value.length === 0) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: getEnv('NODE_ENV', 'development'),
  port: parseInt(getEnv('PORT', '4000'), 10),
  databaseUrl: getEnv('DATABASE_URL', 'postgresql://user:password@localhost:5432/5lb'),
  jwtSecret: getEnv('JWT_SECRET', 'super-secret-key'),
  appDomain: getEnv('APP_DOMAIN', defaultDomain),
  apiPublicUrl: getEnv('API_PUBLIC_URL', defaultApiUrl),
  corsAllowedOrigins: getEnv('CORS_ALLOWED_ORIGINS', defaultCorsOrigins.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),
  telegramBotToken: getEnv('TELEGRAM_BOT_TOKEN', ''),
  telegramBotUsername: getEnv('TELEGRAM_BOT_USERNAME', 'pro_5lb_bot'),
  smscBaseUrl: getEnv('SMSC_BASE_URL', 'https://smsc.ru'),
  smscLogin: getEnv('SMSC_LOGIN', ''),
  smscPassword: getEnv('SMSC_PASSWORD', ''),
  smscSender: getEnv('SMSC_SENDER', '5LB'),
  // Balance API Configuration (fransh-trade)
  balanceApiUrl: getEnv('BALANCE_API_URL', 'https://cloud.mda-medusa.ru/fransh-trade/hs/Api/BalanceData'),
  balanceApiUsername: getEnv('BALANCE_API_USERNAME', 'ТерехинНА'),
  balanceApiPassword: getEnv('BALANCE_API_PASSWORD', '123455123'),
  certPath: getEnv('CERT_PATH', 'src/certs/terehin_n.cloud.mda-medusa.ru.p12'),
  certPassword: getEnv('CERT_PASSWORD', '000000000'),
  // OAuth Configuration
  googleClientId: getEnv('GOOGLE_CLIENT_ID', ''),
  googleClientSecret: getEnv('GOOGLE_CLIENT_SECRET', ''),
  yandexClientId: getEnv('YANDEX_CLIENT_ID', ''),
  yandexClientSecret: getEnv('YANDEX_CLIENT_SECRET', ''),
  appleClientId: getEnv('APPLE_CLIENT_ID', ''),
  appleTeamId: getEnv('APPLE_TEAM_ID', ''),
  appleKeyId: getEnv('APPLE_KEY_ID', ''),
  applePrivateKey: getEnv('APPLE_PRIVATE_KEY', '')
};

export const config = {
  env: env.nodeEnv,
  port: env.port,
  jwtSecret: env.jwtSecret,
  smsc: {
    baseUrl: env.smscBaseUrl,
    login: env.smscLogin,
    password: env.smscPassword,
    sender: env.smscSender,
  },
  telegram: {
    botToken: env.telegramBotToken,
  },
  balanceApi: {
    url: env.balanceApiUrl,
    username: env.balanceApiUsername,
    password: env.balanceApiPassword,
    credentials: Buffer.from(`${env.balanceApiUsername}:${env.balanceApiPassword}`).toString('base64'),
    certPath: env.certPath,
    certPassword: env.certPassword,
  },
};
