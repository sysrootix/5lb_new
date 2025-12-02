# Настройка проекта 5LB - Обновление 2025

## 🎉 Что нового?

### ✅ Добавлено:
1. **Context7 MCP Server** - актуальная документация для AI
2. **Оранжево-красная цветовая палитра** (#FF7F32, #E94B3C)
3. **Framer Motion** - для продвинутых анимаций
4. **Lottie** - для JSON-анимаций
5. **React Native Reanimated** - 60fps анимации для mobile
6. **FlashList** - оптимизированные списки для mobile
7. **Анимированные компоненты**: PageTransition, AnimatedProductCard, RippleButton, SkeletonLoader
8. **Современный index.css** с glassmorphism, градиентами, темной темой

---

## 📦 Установка зависимостей

### 1. Установка в корне проекта
```bash
cd /root/5lb
npm install
```

### 2. Установка для Frontend
```bash
npm install --workspace frontend
```

Новые зависимости:
- `framer-motion@^10.16.0` - анимации
- `lottie-react@^2.4.0` - Lottie анимации

### 3. Установка для Mobile
```bash
npm install --workspace mobile
```

Новые зависимости:
- `lottie-react-native@^6.4.0` - Lottie анимации
- `react-native-reanimated@^3.6.0` - 60fps анимации
- `@shopify/flash-list@^1.6.0` - оптимизированные списки

---

## 🚀 Запуск проекта

### Frontend (Web + Telegram WebApp)
```bash
npm --workspace frontend run dev
```
Откроется на: http://localhost:5173

### Backend API
```bash
npm --workspace backend run dev
```
Запустится на: http://localhost:4000

### Mobile (React Native + Expo)
```bash
npm --workspace mobile run start
```

Затем выбери платформу:
- Нажми `i` для iOS simulator
- Нажми `a` для Android emulator
- Отсканируй QR-код в Expo Go для тестирования на реальном устройстве

---

## 🎨 Использование новых компонентов

### PageTransition
```tsx
import { PageTransition } from '@/components/animations';

<PageTransition>
  <YourPageContent />
</PageTransition>
```

### AnimatedProductCard
```tsx
import { AnimatedProductCard } from '@/components/animations';

<AnimatedProductCard onClick={handleClick} delay={0.1}>
  <div>Product content</div>
</AnimatedProductCard>
```

### RippleButton
```tsx
import { RippleButton } from '@/components/animations';

<RippleButton onClick={handleAddToCart} className="btn-primary">
  Добавить в корзину
</RippleButton>
```

### SkeletonLoader
```tsx
import { SkeletonLoader, ProductCardSkeleton } from '@/components/animations';

// Для текста
<SkeletonLoader type="text" count={3} />

// Для карточек товаров
<ProductCardSkeleton count={6} />
```

### StaggeredList
```tsx
import { StaggeredList } from '@/components/animations';

<StaggeredList staggerDelay={0.05}>
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</StaggeredList>
```

---

## 🌈 Использование новой цветовой палитры

### Tailwind классы
```tsx
// Основные цвета
<div className="bg-5lb-orange-500 text-white">Primary Orange</div>
<div className="bg-5lb-red-500 text-white">Accent Red</div>

// Градиенты
<div className="bg-gradient-hero">Hero gradient</div>
<div className="bg-gradient-button">Button gradient</div>

// Тени
<div className="shadow-button">Button shadow</div>
<div className="shadow-card-hover">Card hover shadow</div>

// Утилиты
<div className="glass">Glassmorphism effect</div>
<div className="gradient-text">Gradient text</div>
<div className="shimmer">Shimmer loading</div>
```

### CSS классы компонентов
```tsx
// Кнопки
<button className="btn-primary">Primary Button</button>
<button className="btn-secondary">Secondary Button</button>
<button className="btn-outline">Outline Button</button>

// Карточки
<div className="card">Simple card</div>
<div className="card-hover">Hoverable card</div>

// Input
<input className="input" placeholder="Email" />

// Badges
<span className="badge-primary">New</span>
<span className="badge-success">In Stock</span>
```

---

## 🤖 Context7 MCP Server

### Установка (если не установлен)

Добавь в настройки VS Code / Claude Code (`.vscode/settings.json`):
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "context7-mcp"]
    }
  }
}
```

### Использование в промптах

Всегда добавляй `use context7` для получения актуальной документации:

```
use context7

Создай компонент ProductList с использованием Framer Motion и React Query
```

---

## 📱 Настройка React Native Reanimated

Для iOS (после установки):
```bash
cd mobile
npx pod-install
```

Добавь в `babel.config.js` (если не добавлено):
```js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin'], // Должен быть последним!
};
```

---

## ✅ Проверка установки

### Frontend
```bash
npm --workspace frontend run build
```

### Backend
```bash
npm --workspace backend run build
```

### Линтинг
```bash
npm run lint
```

Все должно пройти без ошибок!

---

## 🎯 Следующие шаги

1. **Прочитай `claude.md`** - полные правила разработки
2. **Изучи примеры компонентов** в `frontend/src/components/animations/`
3. **Запусти dev серверы** и протестируй анимации
4. **Добавь Lottie анимации** с https://lottiefiles.com/
5. **Используй Context7** для получения актуальной документации

---

## 📚 Документация

- **claude.md** - правила для Claude Code и AI-ассистентов
- **rules.md** - общие правила разработки проекта
- **DEPLOYMENT.md** - инструкции по деплою

---

## 🐛 Возможные проблемы

### "Module not found: framer-motion"
```bash
npm install --workspace frontend
```

### "Unable to resolve react-native-reanimated"
```bash
npm install --workspace mobile
cd mobile && npx pod-install
```

### TypeScript ошибки после обновления
```bash
npm run build
```

---

**Версия:** 2025-01-27
**Автор:** Claude Code
