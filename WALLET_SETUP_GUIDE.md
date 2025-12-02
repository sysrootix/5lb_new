# 🎫 Руководство по настройке Apple Wallet и Google Wallet

## 📱 Apple Wallet - Полная настройка

### Шаг 1: Получить сертификаты Apple

1. Перейти на [Apple Developer](https://developer.apple.com/account/resources/certificates/list)
2. Создать **Pass Type ID**:
   - Identifiers → Register a New Identifier → Pass Type IDs
   - Описание: `5LB Loyalty Card`
   - Идентификатор: `pass.com.5lb.loyalty`

3. Создать **Pass Type ID Certificate**:
   - Certificates → Create a New Certificate
   - Тип: Pass Type ID Certificate
   - Выбрать созданный Pass Type ID
   - Создать CSR (Certificate Signing Request) на Mac через Keychain Access
   - Загрузить CSR и скачать сертификат

4. Скачать **WWDR Certificate**:
   - [Apple WWDR Certificate](https://www.apple.com/certificateauthority/)
   - Скачать G4 версию

5. Экспортировать сертификаты:
   ```bash
   # На Mac через Keychain Access экспортировать:
   # - Pass Type ID Certificate → passcert.pem
   # - Приватный ключ → passkey.pem (с паролем)
   ```

### Шаг 2: Установить зависимости

```bash
cd /root/5lb/backend
npm install passkit-generator
```

### Шаг 3: Добавить сертификаты на сервер

```bash
mkdir -p /root/5lb/backend/certificates/apple-wallet
# Загрузить файлы:
# - passcert.pem (сертификат)
# - passkey.pem (приватный ключ)
# - wwdr.pem (WWDR сертификат)
```

### Шаг 4: Добавить переменные окружения

В `/root/5lb/backend/.env`:
```env
# Apple Wallet
APPLE_PASS_TYPE_ID=pass.com.5lb.loyalty
APPLE_TEAM_ID=YOUR_TEAM_ID  # Найти на developer.apple.com
APPLE_CERT_PATH=/root/5lb/backend/certificates/apple-wallet/passcert.pem
APPLE_KEY_PATH=/root/5lb/backend/certificates/apple-wallet/passkey.pem
APPLE_KEY_PASSWORD=your_key_password
APPLE_WWDR_PATH=/root/5lb/backend/certificates/apple-wallet/wwdr.pem
```

### Шаг 5: Реализация генерации .pkpass

Код уже подготовлен в `backend/src/controllers/walletController.ts`, нужно раскомментировать:

```typescript
import { PKPass } from 'passkit-generator';

export const generateAppleWalletPass = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const userId = (req as any).user?.userId;

    // Получаем данные карты
    const card = await prisma.userBonusCard.findFirst({
      where: { id: cardId, userId: userId },
      include: { card: true }
    });

    // Создаем pass
    const pass = new PKPass({
      'pass.json': {
        formatVersion: 1,
        passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID,
        serialNumber: card.id,
        teamIdentifier: process.env.APPLE_TEAM_ID,
        organizationName: '5LB',
        description: card.card.name,
        foregroundColor: 'rgb(255, 255, 255)',
        backgroundColor: 'rgb(255, 107, 0)',
        barcode: {
          message: card.id,
          format: 'PKBarcodeFormatQR',
          messageEncoding: 'iso-8859-1'
        },
        storeCard: {
          headerFields: [{
            key: 'balance',
            label: 'Баланс',
            value: `${card.balance} ₽`
          }],
          primaryFields: [{
            key: 'name',
            value: card.card.name
          }]
        }
      }
    }, {
      signerCert: process.env.APPLE_CERT_PATH,
      signerKey: process.env.APPLE_KEY_PATH,
      signerKeyPassphrase: process.env.APPLE_KEY_PASSWORD,
      wwdr: process.env.APPLE_WWDR_PATH
    });

    // Генерируем .pkpass
    const buffer = pass.getAsBuffer();

    res.set({
      'Content-Type': 'application/vnd.apple.pkpass',
      'Content-Disposition': `attachment; filename="${card.card.name}.pkpass"`
    });

    res.send(buffer);
  } catch (error) {
    console.error('Error generating Apple Wallet pass:', error);
    res.status(500).json({ error: 'Failed to generate pass' });
  }
};
```

---

## 🤖 Google Wallet - Полная настройка

### Шаг 1: Настроить Google Cloud

1. Перейти на [Google Cloud Console](https://console.cloud.google.com/)
2. Создать новый проект или выбрать существующий
3. Включить **Google Wallet API**:
   - APIs & Services → Library
   - Искать "Google Wallet API"
   - Enable

4. Создать **Service Account**:
   - IAM & Admin → Service Accounts
   - Create Service Account
   - Роль: Project → Editor
   - Скачать JSON ключ

5. Получить **Issuer ID**:
   - [Google Pay & Wallet Console](https://pay.google.com/business/console)
   - Business Profile → Copy Issuer ID

### Шаг 2: Установить зависимости

```bash
cd /root/5lb/backend
npm install googleapis
```

### Шаг 3: Добавить Service Account на сервер

```bash
mkdir -p /root/5lb/backend/certificates/google-wallet
# Загрузить service-account-key.json
```

### Шаг 4: Добавить переменные окружения

В `/root/5lb/backend/.env`:
```env
# Google Wallet
GOOGLE_WALLET_ISSUER_ID=your_issuer_id
GOOGLE_SERVICE_ACCOUNT_PATH=/root/5lb/backend/certificates/google-wallet/service-account-key.json
```

### Шаг 5: Реализация генерации Google Wallet

```typescript
import { google } from 'googleapis';

export const generateGoogleWalletPass = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const userId = (req as any).user?.userId;

    const card = await prisma.userBonusCard.findFirst({
      where: { id: cardId, userId: userId },
      include: { card: true }
    });

    // Загружаем Service Account
    const credentials = require(process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
    const httpClient = google.auth.fromJSON(credentials);
    httpClient.scopes = ['https://www.googleapis.com/auth/wallet_object.issuer'];

    // Создаем Loyalty Object
    const loyaltyObject = {
      id: `${process.env.GOOGLE_WALLET_ISSUER_ID}.${card.id}`,
      classId: `${process.env.GOOGLE_WALLET_ISSUER_ID}.loyalty_class`,
      state: 'ACTIVE',
      barcode: {
        type: 'QR_CODE',
        value: card.id
      },
      accountId: userId,
      accountName: card.card.name,
      loyaltyPoints: {
        label: 'Баланс',
        balance: { int: card.balance }
      }
    };

    // Создаем JWT
    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      origins: ['https://app.5lb.pro'],
      typ: 'savetowallet',
      payload: {
        loyaltyObjects: [loyaltyObject]
      }
    };

    const token = await httpClient.sign(JSON.stringify(claims));
    const walletUrl = `https://pay.google.com/gp/v/save/${token}`;

    res.json({ walletUrl });
  } catch (error) {
    console.error('Error generating Google Wallet pass:', error);
    res.status(500).json({ error: 'Failed to generate pass' });
  }
};
```

---

## 🔄 Обновление баланса карт в Wallet

### Apple Wallet - Push Notifications

Когда баланс меняется в БД, нужно отправить push-уведомление:

```typescript
// backend/src/services/walletUpdateService.ts
import fetch from 'node-fetch';

export const updateAppleWalletCard = async (cardId: string, newBalance: number) => {
  try {
    // 1. Найти все устройства, которые добавили эту карту
    const devices = await prisma.walletDevice.findMany({
      where: { cardId: cardId, platform: 'apple' }
    });

    // 2. Отправить push-уведомление каждому устройству
    for (const device of devices) {
      await fetch(`https://api.push.apple.com/3/device/${device.pushToken}`, {
        method: 'POST',
        headers: {
          'apns-topic': process.env.APPLE_PASS_TYPE_ID,
          'authorization': `bearer ${generateAppleJWT()}`
        },
        body: JSON.stringify({})
      });
    }

    console.log(`Updated ${devices.length} Apple Wallet cards`);
  } catch (error) {
    console.error('Failed to update Apple Wallet:', error);
  }
};
```

**Также нужно реализовать webhook endpoints:**

```typescript
// GET /api/wallet/apple/v1/devices/:deviceId/registrations/:passTypeId/:serialNumber
// POST /api/wallet/apple/v1/devices/:deviceId/registrations/:passTypeId/:serialNumber
// DELETE /api/wallet/apple/v1/devices/:deviceId/registrations/:passTypeId/:serialNumber
// GET /api/wallet/apple/v1/passes/:passTypeId/:serialNumber
// POST /api/wallet/apple/v1/log
```

Когда устройство регистрирует карту, Apple вызывает эти endpoints.

### Google Wallet - PATCH запросы

```typescript
export const updateGoogleWalletCard = async (cardId: string, newBalance: number) => {
  try {
    const credentials = require(process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
    const httpClient = google.auth.fromJSON(credentials);

    const walletobjects = google.walletobjects({
      version: 'v1',
      auth: httpClient
    });

    const objectId = `${process.env.GOOGLE_WALLET_ISSUER_ID}.${cardId}`;

    await walletobjects.loyaltyobject.patch({
      resourceId: objectId,
      requestBody: {
        loyaltyPoints: {
          label: 'Баланс',
          balance: { int: newBalance }
        }
      }
    });

    console.log(`Updated Google Wallet card: ${objectId}`);
  } catch (error) {
    console.error('Failed to update Google Wallet:', error);
  }
};
```

### Интеграция в изменение баланса

Добавить в код, где изменяется баланс:

```typescript
// Когда баланс меняется
await prisma.userBonusCard.update({
  where: { id: cardId },
  data: { balance: newBalance }
});

// Обновить в wallet
await updateAppleWalletCard(cardId, newBalance);
await updateGoogleWalletCard(cardId, newBalance);
```

---

## 📊 Миграция БД для отслеживания устройств

Нужна таблица для хранения устройств:

```prisma
model WalletDevice {
  id          String   @id @default(cuid())
  cardId      String
  card        UserBonusCard @relation(fields: [cardId], references: [id], onDelete: Cascade)

  platform    String   // 'apple' или 'google'
  deviceId    String   // ID устройства
  pushToken   String?  // Для Apple push notifications

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([cardId, deviceId, platform])
}
```

---

## 🚀 Краткий чеклист

- [ ] Получить Apple Developer аккаунт ($99/год)
- [ ] Создать Pass Type ID Certificate
- [ ] Настроить Google Cloud + Service Account
- [ ] Установить `passkit-generator` и `googleapis`
- [ ] Загрузить сертификаты на сервер
- [ ] Добавить переменные окружения
- [ ] Реализовать генерацию passes
- [ ] Добавить webhook endpoints для Apple Wallet
- [ ] Реализовать обновление баланса
- [ ] Создать миграцию БД для WalletDevice
- [ ] Протестировать на реальных устройствах

**Стоимость:**
- Apple Developer: $99/год
- Google Cloud: бесплатно (в пределах лимитов)

**Время реализации:** 2-3 дня разработки + тестирование
