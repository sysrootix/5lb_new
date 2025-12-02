import multer from 'multer';
import path from 'path';
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync } from 'fs';

// Создаём папку для загрузок если её нет
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимый формат файла. Разрешены только изображения (JPEG, PNG, WebP, GIF)'));
  }
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

