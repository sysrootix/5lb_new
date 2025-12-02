import { logger } from '../config/logger';
import { sendVerificationCall, sendVerificationSMS } from './smscService';

export const deliverLoginCode = async (phone: string, code: string) => {
  const callAttempt = await sendVerificationCall(phone, code);

  if (callAttempt.success) {
    return;
  }

  logger.error(
    `Failed to initiate voice call for ${phone}: ${callAttempt.error ?? 'unknown error'}`
  );

  const smsAttempt = await sendVerificationSMS(phone, code, {
    skipSender: callAttempt.errorCode === 6
  });

  if (smsAttempt.success) {
    return;
  }

  const errorMessage = smsAttempt.error ?? callAttempt.error ?? 'Не удалось доставить код';
  logger.error(`Failed to send SMS to ${phone}: ${errorMessage}`);
  throw new Error(errorMessage);
};
