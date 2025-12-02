import axios from 'axios';
import type { AxiosError } from 'axios';
import { env } from './env';
import { logger } from './logger';

const smscApi = axios.create({
  baseURL: env.smscBaseUrl.replace(/\/$/, ''),
  timeout: 5000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

export const sendSms = async (to: string, body: string) => {
  if (!env.smscLogin || !env.smscPassword) {
    logger.warn(`SMSC credentials missing; skip sending to ${to}: ${body}`);
    return;
  }

  try {
    const params = new URLSearchParams({
      login: env.smscLogin,
      psw: env.smscPassword,
      phones: to,
      mes: body,
      fmt: '3'
    });

    if (env.smscSender) {
      params.append('sender', env.smscSender);
    }

    const response = await smscApi.post('/sys/send.php', params);
    const data = response.data;

    if (data && typeof data === 'object') {
      const { error: smscError, error_code: smscErrorCode } = data as {
        error?: unknown;
        error_code?: unknown;
      };

      if (typeof smscError !== 'undefined') {
        const errorText = String(smscError);
        const errorCode = typeof smscErrorCode !== 'undefined' ? ` ${String(smscErrorCode)}` : '';
        const errMessage = `SMSC error${errorCode}: ${errorText}`;
        throw new Error(errMessage);
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const err = error as AxiosError;
      logger.error(
        `SMSC request failed for ${to}: ${err.response?.status} ${err.response?.statusText} ${
          err.response?.data ? JSON.stringify(err.response.data) : err.message
        }`
      );
    } else {
      logger.error(`SMSC request failed for ${to}: ${(error as Error).message}`);
    }
    throw error;
  }
};
