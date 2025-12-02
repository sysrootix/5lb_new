# Используем Node.js 20 Alpine для меньшего размера образа
FROM node:20-alpine AS base

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm ci --only=production && \
    npm cache clean --force

# Генерируем Prisma Client
RUN npx prisma generate

# Копируем исходный код
COPY . .

# Компилируем TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Устанавливаем только production зависимости
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Копируем Prisma schema и генерируем клиент
COPY --from=base /app/prisma ./prisma
RUN npx prisma generate

# Копируем скомпилированный код
COPY --from=base /app/dist ./dist

# Создаём директорию для загрузок
RUN mkdir -p /app/uploads && chmod 755 /app/uploads

# Переменные окружения
ENV NODE_ENV=production
ENV PORT=60000

# Открываем порт
EXPOSE 60000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:60000/api/health || exit 1

# Запускаем приложение
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
