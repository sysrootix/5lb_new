import { Request, Response, NextFunction } from 'express';
import * as profileService from '../services/profileService';

const attachPhoneChangeMeta = <T extends object>(userId: string, profile: T) => {
  const pending = profileService.getPhoneChangeStatus(userId);
  return {
    ...profile,
    pendingPhoneChange: pending?.pendingPhone ?? null,
    phoneChangeExpiresAt: pending?.expiresAt ?? null
  };
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const profile = await profileService.getProfile(userId);
    res.json(attachPhoneChangeMeta(userId, profile));
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const profile = await profileService.updateProfile(userId, req.body);
    res.json(attachPhoneChangeMeta(userId, profile));
  } catch (error) {
    next(error);
  }
};

export const requestPhoneChange = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { newPhone } = req.body as { newPhone?: string };
    if (!newPhone) {
      return res.status(400).json({ message: 'Новый номер телефона обязателен' });
    }

    await profileService.requestPhoneChange(userId, newPhone);
    res.json(attachPhoneChangeMeta(userId, { success: true }));
  } catch (error) {
    next(error);
  }
};

export const confirmPhoneChange = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { code } = req.body as { code?: string };
    if (!code) {
      return res.status(400).json({ message: 'Код подтверждения обязателен' });
    }

    const profile = await profileService.confirmPhoneChange(userId, code);
    res.json(attachPhoneChangeMeta(userId, profile));
  } catch (error) {
    next(error);
  }
};

export const linkTelegram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const { initData } = req.body as { initData?: string };
    if (!initData) {
      return res.status(400).json({ message: 'Данные Telegram отсутствуют' });
    }

    const profile = await profileService.linkTelegramAccount(userId, initData);
    res.json(attachPhoneChangeMeta(userId, profile));
  } catch (error) {
    next(error);
  }
};

export const unlinkTelegram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const profile = await profileService.unlinkTelegramAccount(userId);
    res.json(attachPhoneChangeMeta(userId, profile));
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    // Генерируем URL для аватарки (относительно сервера)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const profile = await profileService.updateAvatar(userId, avatarUrl);
    res.json(attachPhoneChangeMeta(userId, profile));
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user;
    const result = await profileService.deleteAccount(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
