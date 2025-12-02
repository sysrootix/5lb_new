# Правила для Claude Code - Проект 5LB

## 🎯 О проекте

**5LB** — это современное мобильное приложение для магазина спортивного питания с интеграцией Telegram, авторизацией через SMS/Telegram и системой лояльности на основе бонусов.

**Целевые платформы:**
- iOS (React Native + Expo)
- Android (React Native + Expo)
- Telegram WebApp (React веб-версия)
- Progressive Web App (React веб-версия)

**Разработка:** Все платформы разрабатываются одновременно с максимальным переиспользованием кода и компонентов.

---

## 🤖 MCP Сервер Context7

**КРИТИЧЕСКИ ВАЖНО:** Всегда используй команду `use context7` в промптах, чтобы AI получал актуальную документацию.

### Что такое Context7?

**Context7 MCP Server** — это специальный MCP (Model Context Protocol) сервер, который в реальном времени предоставляет AI-помощникам (Claude Code, Cursor, VS Code с AI) самую свежую документацию и примеры кода.

#### Ключевые преимущества:

1. **Актуальность кода** — AI генерирует код, соответствующий последним версиям API, библиотек и фреймворков
2. **Меньше ошибок** — снижается вероятность получить неработающий или устаревший код
3. **Экономия времени** — не нужно тратить время на перепроверку и поиск актуальной документации
4. **Улучшение обучения** — вы и AI учитесь на правильных, современных примерах

### Как это работает?

Когда вы в промпте используете команду `use context7`, происходит следующее:

1. AI-помощник обращается к серверу Context7
2. Context7 быстро находит и передает AI самую свежую информацию (документацию, примеры) по вашему запросу
3. AI, "вооруженный" актуальными знаниями, генерирует код или ответ

### Как использовать Context7 в этом проекте?

#### В промптах к AI:

```
use context7

Создай компонент ProductCard с использованием последней версии React и Framer Motion
```

#### Для конкретных технологий:

```
use context7

Покажи, как правильно использовать React Query v5 для кэширования данных товаров
```

### Установка Context7 (если еще не установлен)

#### Для VS Code / Cursor:

Добавь в настройки редактора:

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

#### Для Docker:

```bash
docker run -p 3000:3000 context7/mcp-server
```

#### Проверка работы:

В промпте к AI напиши:
```
use context7

Проверь, работает ли Context7 и какие версии документации доступны
```

### Важные замечания:

- ✅ **Всегда используй** `use context7` при работе с новыми библиотеками или API
- ✅ **Используй для React 18+, Framer Motion, Tailwind CSS** — чтобы получить актуальные примеры
- ✅ **Используй для Telegram WebApp API** — API быстро меняется, Context7 даст актуальную информацию
- ⚠️ **Требуется интернет-соединение** — Context7 подгружает документацию из сети
- ⚠️ **Работает с Node.js/Bun/Deno** — убедись, что установлена одна из этих сред

---

## 🎨 Дизайн 2025: Современный, Живой, Плавный

### Общие принципы дизайна

**5LB — это не просто магазин, это опыт.** Каждое взаимодействие должно быть плавным, приятным и запоминающимся.

#### 1. **Микро-взаимодействия везде**
- Кнопки реагируют на нажатие с **ripple эффектом** (Material Design)
- Иконки **оживают** при наведении (масштабирование, вращение, bounce)
- Карточки товаров **приподнимаются** при hover (elevation shadow)
- Чекбоксы и переключатели **анимированы** (spring animation)

#### 2. **Плавные переходы**
- **Page transitions**: fade + slide для смены экранов
- **Shared element transitions**: товар из списка → детальная страница (morph animation)
- **Layout animations**: автоматическая анимация при изменении layout
- **Stagger animations**: элементы появляются поочередно с задержкой (0.05s между элементами)

#### 3. **Параллакс и глубина**
- **Parallax scrolling** для hero-секций и баннеров
- **Многослойность**: background движется медленнее foreground (0.5x скорость)
- **Depth shadows**: динамические тени в зависимости от позиции элемента
- **Glassmorphism**: полупрозрачные блоки с backdrop-blur для карточек

#### 4. **Responsive анимации**
- **Pull-to-refresh**: кастомная анимация загрузки (Lottie spinner + bounce)
- **Swipe gestures**: удаление из корзины свайпом влево, добавление в избранное свайпом вправо
- **Drag & drop**: перетаскивание товаров, изменение порядка
- **Scroll-triggered animations**: элементы появляются при прокрутке (intersection observer)

#### 5. **Skeleton screens**
- **НЕ используй обычные спиннеры** — только skeleton screens
- **Shimmer эффект**: анимированный градиент для loading состояний
- **Content-aware skeletons**: форма skeleton повторяет форму контента

---

## 🔤 Типографика в стиле Apple

### Шрифт SF Pro — Стандарт Apple

**5LB использует современную типографику в стиле Apple.** Мы применяем системные шрифты, которые обеспечивают оптимальную читаемость и нативное ощущение на всех устройствах.

#### Основной шрифт: Inter + Apple System Fonts

```css
font-family:
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  'Roboto',
  'Helvetica Neue',
  Arial,
  sans-serif;
```

**Inter** — это современная open-source альтернатива SF Pro, разработанная специально для экранов. Он обеспечивает:
- Отличную читаемость на всех размерах
- Гуманистичный, дружелюбный вид
- Поддержку переменных начертаний (Variable Fonts)
- Идеальный кернинг и spacing

#### Подключение шрифта

**Google Fonts (рекомендуется):**
```html
<!-- В index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

**Или через CSS:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
```

#### Иерархия шрифтов

```typescript
// Font weights
const fontWeights = {
  light: 300,      // Для длинных текстов, описаний
  regular: 400,    // Основной текст
  medium: 500,     // Подзаголовки, labels
  semibold: 600,   // Важные элементы, кнопки
  bold: 700,       // Заголовки
  extrabold: 800,  // Hero titles
  black: 900,      // Акцентные заголовки
};

// Font sizes (mobile-first)
const fontSizes = {
  // Основной текст
  xs: '12px',      // Captions, hints
  sm: '14px',      // Small text, labels
  base: '16px',    // Body text
  lg: '18px',      // Large body text

  // Заголовки
  xl: '20px',      // h4
  '2xl': '24px',   // h3
  '3xl': '28px',   // h2
  '4xl': '32px',   // h1
  '5xl': '40px',   // Hero title
  '6xl': '48px',   // Display title
};

// Line heights
const lineHeights = {
  tight: 1.2,      // Для заголовков
  snug: 1.375,     // Для подзаголовков
  normal: 1.5,     // Для основного текста
  relaxed: 1.625,  // Для длинных текстов
  loose: 2,        // Для особых случаев
};
```

#### Примеры использования

**Tailwind классы:**
```typescript
// Hero title
<h1 className="text-5xl font-black leading-tight tracking-tight">
  ПОПОЛНИЛИ АССОРТИМЕНТ
</h1>

// Section heading
<h2 className="text-2xl font-bold leading-snug">
  Главное из каталога
</h2>

// Body text
<p className="text-base font-normal leading-normal text-5lb-gray-700">
  Новинки и проверенные позиции уже доступны к покупке
</p>

// Button text
<button className="text-sm font-semibold">
  Смотреть
</button>

// Caption
<span className="text-xs font-medium text-5lb-gray-500">
  Доступно к покупке
</span>
```

#### Letter Spacing (Tracking)

```css
/* Для заголовков - более плотный tracking */
.tracking-tighter { letter-spacing: -0.05em; }
.tracking-tight { letter-spacing: -0.025em; }

/* Для основного текста - стандартный */
.tracking-normal { letter-spacing: 0em; }

/* Для мелких текстов - более свободный */
.tracking-wide { letter-spacing: 0.025em; }
```

#### Responsive Typography

**Адаптивные размеры для разных экранов:**
```typescript
// Mobile first подход
<h1 className="text-3xl md:text-4xl lg:text-5xl font-black">
  Hero Title
</h1>

<p className="text-sm md:text-base lg:text-lg">
  Body text
</p>
```

#### Правила типографики

1. **✅ ВСЕГДА используй Inter** как основной шрифт
2. **✅ Используй font-weights осмысленно** — не смешивай слишком много начертаний на одном экране
3. **✅ Соблюдай иерархию** — заголовки должны быть четко отличимы от текста
4. **✅ Используй tight line-height для заголовков**, normal для текста
5. **✅ Применяй negative letter-spacing** для больших заголовков (-0.025em)
6. **✅ Максимальная ширина текста** — 65-75 символов для удобного чтения
7. **❌ НЕ используй более 3 размеров шрифта** на одном экране
8. **❌ НЕ делай текст слишком светлым** — минимальная контрастность 4.5:1

#### Доступность (a11y)

```typescript
// Минимальные размеры для удобства чтения
const minSizes = {
  bodyText: '16px',      // Основной текст не меньше 16px
  smallText: '14px',     // Мелкий текст не меньше 14px
  touchTarget: '44px',   // Минимальный размер кнопки/ссылки
};

// Контрастность цветов
const contrast = {
  normal: 4.5,     // Минимальная контрастность для текста
  large: 3,        // Для крупного текста (18px+ или 14px+ bold)
};
```

---

## 🌈 Цветовая палитра 2025

### Базовые цвета

```typescript
// tailwind.config.js
const colors = {
  // Основные цвета бренда 5LB
  '5lb': {
    orange: {
      50:  '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#FF7F32', // Основной оранжевый
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
    },
    red: {
      50:  '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#E94B3C', // Акцентный красный
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
    gray: {
      50:  '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    white: '#FFFFFF',
    black: '#000000',
  },

  // Семантические цвета
  primary: '#FF7F32',   // 5lb-orange-500
  secondary: '#E94B3C', // 5lb-red-500
  accent: '#FB923C',    // 5lb-orange-400

  // UI состояния
  success: '#10B981',   // Зеленый
  warning: '#F59E0B',   // Янтарный
  error: '#EF4444',     // Красный
  info: '#3B82F6',      // Синий

  // Фоны и поверхности
  background: {
    DEFAULT: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },

  // Текст
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
};
```

### Градиенты

```typescript
// Gradient presets
const gradients = {
  // Hero градиенты
  'hero-brand': 'linear-gradient(135deg, #FF7F32 0%, #E94B3C 100%)',
  'hero-shine': 'linear-gradient(135deg, #FFB84D 0%, #FF7F32 50%, #E94B3C 100%)',

  // Карточки
  'card-premium': 'linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 100%)',
  'card-glass': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',

  // Кнопки
  'button-primary': 'linear-gradient(135deg, #FF7F32 0%, #FB923C 100%)',
  'button-hover': 'linear-gradient(135deg, #FB923C 0%, #FDBA74 100%)',

  // Overlay
  'overlay-dark': 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
  'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
};
```

### Темная тема

```typescript
// Dark theme overrides
const darkTheme = {
  background: {
    DEFAULT: '#111827',
    secondary: '#1F2937',
    tertiary: '#374151',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#E5E7EB',
    tertiary: '#9CA3AF',
  },
};
```

---

## ✨ Анимации: Framer Motion + Lottie + CSS

### 1. Framer Motion (основная библиотека)

**Установка:**
```bash
npm install framer-motion --workspace frontend
npm install framer-motion --workspace mobile
```

**Основные паттерны:**

#### Page Transitions
```typescript
// frontend/src/components/PageTransition.tsx
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export const PageTransition = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="enter"
    exit="exit"
  >
    {children}
  </motion.div>
);
```

#### Product Card Animations
```typescript
// frontend/src/components/ProductCard.tsx
import { motion } from 'framer-motion';

const cardVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.03,
    y: -8,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
  tap: { scale: 0.98 },
};

export const ProductCard = ({ product }) => (
  <motion.div
    variants={cardVariants}
    initial="rest"
    whileHover="hover"
    whileTap="tap"
    className="bg-white rounded-2xl shadow-lg overflow-hidden"
  >
    {/* Product content */}
  </motion.div>
);
```

#### Stagger Children
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {products.map(product => (
    <motion.div key={product.id} variants={itemVariants}>
      <ProductCard product={product} />
    </motion.div>
  ))}
</motion.div>
```

#### Shared Element Transitions
```typescript
// List view
<motion.img layoutId={`product-${id}`} src={image} />

// Detail view
<motion.img layoutId={`product-${id}`} src={image} />
```

### 2. Lottie Animations

**Установка:**
```bash
npm install lottie-react --workspace frontend
npm install lottie-react-native --workspace mobile
```

**Использование:**
```typescript
import Lottie from 'lottie-react';
import loadingAnimation from '@/assets/lottie/loading.json';

<Lottie
  animationData={loadingAnimation}
  loop
  style={{ width: 100, height: 100 }}
/>
```

**Когда использовать Lottie:**
- Загрузочные экраны (loading spinners)
- Успешные действия (checkmark animation, success confetti)
- Пустые состояния (empty cart, no results found)
- Onboarding иллюстрации
- Сложные кастомные анимации (логотип, иконки)

### 3. CSS/Tailwind Animations

**Легкие transitions для всех интерактивных элементов:**
```typescript
// Стандартные классы для всех кнопок
className="transition-all duration-300 ease-out hover:shadow-xl active:scale-95"

// Для карточек
className="transition-all duration-200 hover:shadow-2xl hover:-translate-y-2"

// Для модальных окон
className="transition-opacity duration-300 ease-in-out"
```

**Кастомные Tailwind animations:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
};
```

### 4. Micro-interactions

#### Ripple Effect
```typescript
// frontend/src/components/RippleButton.tsx
import { motion } from 'framer-motion';
import { useState } from 'react';

export const RippleButton = ({ children, onClick, ...props }) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipples(prev => [...prev, { x, y, id: Date.now() }]);
    setTimeout(() => setRipples(prev => prev.slice(1)), 600);

    onClick?.(e);
  };

  return (
    <motion.button
      className="relative overflow-hidden"
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/50 rounded-full pointer-events-none"
          initial={{ width: 0, height: 0, left: ripple.x, top: ripple.y }}
          animate={{ width: 300, height: 300, left: ripple.x - 150, top: ripple.y - 150, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      ))}
    </motion.button>
  );
};
```

#### Pull to Refresh
```typescript
// mobile/src/components/PullToRefresh.tsx
import { motion, useMotionValue, useTransform } from 'framer-motion';

export const PullToRefresh = ({ onRefresh, children }) => {
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 100], [0, 1]);
  const rotate = useTransform(y, [0, 100], [0, 360]);

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 100 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.y > 100) onRefresh();
      }}
      style={{ y }}
    >
      <motion.div
        style={{ opacity, rotate }}
        className="text-center py-4"
      >
        <RefreshIcon className="mx-auto" />
      </motion.div>
      {children}
    </motion.div>
  );
};
```

---

## 📱 Мобильные платформы: iOS, Android, Telegram

### React Native Best Practices

#### 1. Используй платформо-специфичный код
```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.3 },
      android: { elevation: 5 },
    }),
  },
});
```

#### 2. Оптимизируй списки с FlashList
```typescript
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={products}
  renderItem={({ item }) => <ProductCard product={item} />}
  estimatedItemSize={200}
  keyExtractor={item => item.id}
/>
```

#### 3. Используй React Native Reanimated для 60fps анимаций
```typescript
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

<Animated.View style={animatedStyle}>
  {/* Content */}
</Animated.View>
```

### Telegram WebApp Integration

#### 1. Используй Telegram Theme Variables
```typescript
// frontend/src/hooks/useTelegramTheme.ts
import { useTelegramApp } from '@/hooks/useTelegramApp';

export const useTelegramTheme = () => {
  const { webApp } = useTelegramApp();

  return {
    bgColor: webApp?.themeParams?.bg_color || '#FFFFFF',
    textColor: webApp?.themeParams?.text_color || '#000000',
    buttonColor: webApp?.themeParams?.button_color || '#FF7F32',
    buttonTextColor: webApp?.themeParams?.button_text_color || '#FFFFFF',
  };
};
```

#### 2. Адаптируй UI под Telegram
```typescript
// Скрывай нативный header в Telegram WebApp
useEffect(() => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.enableClosingConfirmation();
  }
}, []);
```

#### 3. Используй Telegram MainButton
```typescript
useEffect(() => {
  const mainButton = window.Telegram?.WebApp?.MainButton;

  if (mainButton) {
    mainButton.setText('Оформить заказ');
    mainButton.show();
    mainButton.onClick(handleCheckout);

    return () => {
      mainButton.hide();
      mainButton.offClick(handleCheckout);
    };
  }
}, []);
```

---

## 🏗️ Архитектура и структура кода

### Монорепозиторий

```
5lb/
├── frontend/          # React Web + Telegram WebApp
├── mobile/            # React Native (iOS + Android)
├── backend/           # Express API
├── shared/            # Общий код для всех платформ
│   ├── types/         # TypeScript типы
│   ├── utils/         # Утилиты
│   ├── constants/     # Константы
│   └── components/    # Универсальные компоненты
└── config/            # Конфигурация
```

### Shared Components

**Создавай универсальные компоненты, работающие на всех платформах:**

```typescript
// shared/components/Button/Button.tsx
import { Platform } from 'react-native';

export const Button = ({ children, onPress, ...props }) => {
  // Platform-specific implementation
  return Platform.OS === 'web' ? (
    <button onClick={onPress} {...props}>{children}</button>
  ) : (
    <TouchableOpacity onPress={onPress} {...props}>{children}</TouchableOpacity>
  );
};
```

### TypeScript Типы

**Строгая типизация ВЕЗДЕ:**

```typescript
// shared/types/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: Category;
  variants: ProductVariant[];
  inStock: boolean;
  featured: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: VariantOption[];
  price: number;
}

export interface VariantOption {
  id: string;
  name: string;
  value: string;
}
```

---

## 🔧 Технологический стек

### Frontend (Web + Telegram WebApp)
- **React** 18.2 + **TypeScript** 5.3
- **Vite** 5.0 — сборка и dev server
- **Tailwind CSS** 3.4 — стилизация
- **Framer Motion** 10.16 — анимации
- **Lottie React** — JSON-анимации
- **Zustand** 4.4 + **context7** — состояние
- **React Query** 5.15 — кэширование API
- **React Router** 6.21 — маршрутизация
- **Lucide React** — иконки
- **React Hot Toast** 2.4 — уведомления
- **Axios** 1.6 — HTTP клиент

### Mobile (iOS + Android)
- **React Native** 0.73
- **Expo** 50.0
- **TypeScript** 5.3
- **React Navigation** 6.1 — навигация
- **React Native Reanimated** 3.6 — анимации 60fps
- **Lottie React Native** — JSON-анимации
- **React Native Paper** 5.11 — UI компоненты
- **Zustand** 4.4 + **context7** — состояние
- **React Query** 5.15 — кэширование
- **Axios** 1.6 — HTTP клиент
- **@shopify/flash-list** — оптимизированные списки

### Backend
- **Node.js** 20+ + **Express** 4.18 + **TypeScript** 5.3
- **PostgreSQL** 16 + **Prisma** 5.7
- **JWT** — авторизация
- **node-telegram-bot-api** — Telegram интеграция
- **Winston** — логирование
- **Helmet** + **CORS** — безопасность

---

## 📋 Правила разработки

### 1. Стиль кода

**ESLint + Prettier:**
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}
```

**Импорты:**
```typescript
// 1. React и библиотеки
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 2. Внутренние импорты
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

// 3. Типы
import type { Product } from '@/types/product';

// 4. Стили и ассеты
import styles from './Product.module.css';
```

**Именование:**
```typescript
// Components: PascalCase
const ProductCard = () => {};

// Hooks: camelCase with 'use' prefix
const useProductData = () => {};

// Utils: camelCase
const formatPrice = () => {};

// Constants: SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://app.5lb.pro/api';

// Types: PascalCase
type ProductType = {};
```

### 2. Компоненты

**Структура компонента:**
```typescript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  // 1. State
  const [quantity, setQuantity] = useState(1);

  // 2. Hooks
  const { user } = useAuth();

  // 3. Effects
  useEffect(() => {
    // ...
  }, []);

  // 4. Handlers
  const handleAddToCart = () => {
    onAddToCart(product.id);
  };

  // 5. Render helpers
  const renderPrice = () => {
    return <span>{product.price} ₽</span>;
  };

  // 6. Return
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white rounded-2xl shadow-lg p-4"
    >
      {/* JSX */}
    </motion.div>
  );
};
```

### 3. Git коммиты

**Формат:**
```bash
git commit -m "type(scope): описание"

# Типы:
feat: новая функциональность
fix: исправление бага
refactor: рефакторинг кода
style: изменения стилей/форматирования
docs: документация
test: тесты
chore: технические изменения (deps, config)
perf: оптимизация производительности
```

**Примеры:**
```bash
git commit -m "feat(cart): добавлена анимация при добавлении товара в корзину"
git commit -m "fix(auth): исправлена ошибка при входе через Telegram"
git commit -m "refactor(product-card): извлечены стили в отдельный модуль"
git commit -m "perf(catalog): оптимизирован рендеринг списка товаров с FlashList"
```

### 4. TypeScript

**Строгие правила:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

**Избегай `any`:**
```typescript
// ❌ Плохо
const data: any = await fetchData();

// ✅ Хорошо
const data: Product[] = await fetchData<Product[]>();
```

**Используй утилитарные типы:**
```typescript
type PartialProduct = Partial<Product>;
type ReadonlyProduct = Readonly<Product>;
type ProductWithoutId = Omit<Product, 'id'>;
type ProductPreview = Pick<Product, 'id' | 'name' | 'price' | 'image'>;
```

### 5. Performance

**Оптимизация React:**
```typescript
// useMemo для дорогих вычислений
const filteredProducts = useMemo(() =>
  products.filter(p => p.category === selectedCategory),
  [products, selectedCategory]
);

// useCallback для функций-пропсов
const handleAddToCart = useCallback((productId: string) => {
  addToCart(productId);
}, [addToCart]);

// React.memo для компонентов
export const ProductCard = React.memo(({ product }) => {
  // ...
});
```

**Code splitting:**
```typescript
// Lazy loading для страниц
const CatalogPage = lazy(() => import('@/pages/Catalog'));
const ProfilePage = lazy(() => import('@/pages/Profile'));

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/catalog" element={<CatalogPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Routes>
</Suspense>
```

### 6. Доступность (a11y)

**ARIA атрибуты:**
```typescript
<button
  aria-label="Добавить в корзину"
  aria-pressed={isInCart}
  role="button"
>
  <PlusIcon />
</button>
```

**Клавиатурная навигация:**
```typescript
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  {/* Content */}
</div>
```

---

## 🚀 Workflow

### Development

```bash
# Установка зависимостей
npm install

# Frontend dev server
npm --workspace frontend run dev

# Backend dev server
npm --workspace backend run dev

# Mobile dev
npm --workspace mobile run start
npm --workspace mobile run ios     # iOS simulator
npm --workspace mobile run android # Android emulator
```

### Build

```bash
# Build all
npm run build

# Build specific workspace
npm run build:frontend
npm run build:backend
```

### Проверка кода

```bash
# TypeScript check
npm run build

# Linting
npm run lint

# Format
npm run format
```

---

## ⚠️ Важные правила

### ❌ НЕ ДЕЛАЙ

1. **НЕ хардкодь цвета** — используй только переменные Tailwind (`5lb-orange-500`, `5lb-red-500`)
2. **НЕ используй `any` в TypeScript** — всегда типизируй
3. **НЕ создавай дублирующий код** — используй shared компоненты
4. **НЕ делай прямые запросы к API** — только через context7 или React Query
5. **НЕ забывай про анимации** — каждое взаимодействие должно быть плавным
6. **НЕ игнорируй мобильные платформы** — всегда тестируй на iOS, Android, Telegram
7. **НЕ выполняй миграции БД напрямую** — создавай .md файлы с инструкциями
8. **НЕ используй обычные спиннеры** — только skeleton screens с shimmer эффектом
9. **НЕ забывай про темную тему** — проверяй в Telegram с темной темой

### ✅ ВСЕГДА ДЕЛАЙ

1. **✅ Используй context7** для управления состоянием
2. **✅ Добавляй анимации** — Framer Motion для сложных, CSS для простых
3. **✅ Типизируй всё** — TypeScript strict mode
4. **✅ Оптимизируй производительность** — useMemo, useCallback, React.memo
5. **✅ Делай коммиты часто** — после каждой фичи или фикса
6. **✅ Тестируй на всех платформах** — веб, iOS, Android, Telegram WebApp
7. **✅ Используй Lottie для лоадеров** — не обычные спиннеры
8. **✅ Добавляй skeleton screens** — для всех асинхронных данных
9. **✅ Проверяй доступность** — ARIA, keyboard navigation
10. **✅ Следуй дизайн-системе** — единые отступы, закругления, тени

---

## 🎯 Чеклист для каждой новой фичи

- [ ] Интегрирована с **context7**
- [ ] Добавлены **анимации** (Framer Motion или CSS)
- [ ] **Skeleton screens** для loading состояний
- [ ] **TypeScript типы** для всех данных
- [ ] **Адаптирована** для iOS, Android, Telegram WebApp
- [ ] **Темная тема** поддерживается
- [ ] **Доступность** (ARIA, keyboard navigation)
- [ ] **Оптимизирована** (useMemo, useCallback если нужно)
- [ ] **Протестирована** на всех платформах
- [ ] **Git коммит** с правильным форматом
- [ ] **Документация** обновлена (если нужно)

---

## 📚 Дополнительные ресурсы

- **Framer Motion Docs:** https://www.framer.com/motion/
- **Lottie Files:** https://lottiefiles.com/
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **React Native Reanimated:** https://docs.swmansion.com/react-native-reanimated/
- **Telegram WebApp API:** https://core.telegram.org/bots/webapps
- **Prisma Docs:** https://www.prisma.io/docs

---

**Помни:** 5LB — это не просто магазин спортивного питания, это современное, живое, анимированное приложение, которое радует пользователей каждым взаимодействием. Каждая кнопка, каждый переход, каждая загрузка должны быть плавными и приятными. Создавай опыт, а не просто интерфейс.

**Версия:** 1.0.0
**Дата:** 2025-10-27
