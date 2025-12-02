# Инструкция по настройке OAuth провайдеров

Этот документ содержит пошаговые инструкции по получению всех необходимых ключей, ID и секретов для настройки OAuth аутентификации через Google, Яндекс и Apple.

## Содержание

1. [Google OAuth](#google-oauth)
2. [Яндекс OAuth](#яндекс-oauth)
3. [Apple Sign In](#apple-sign-in)

---

## Google OAuth

### Шаг 1: Создание проекта в Google Cloud Console

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Войдите в свой Google аккаунт
3. Нажмите на выпадающий список проектов в верхней части страницы
4. Нажмите **"Новый проект"** (или **"New Project"**)
5. Введите название проекта (например, "5LB Auth")
6. Нажмите **"Создать"** (или **"Create"**)

### Шаг 2: Включение Google+ API

1. В меню слева выберите **"APIs & Services"** → **"Library"**
2. В поиске введите **"Google+ API"** или **"Google Identity"**
3. Найдите **"Google Identity API"** или **"Google+ API"**
4. Нажмите **"Enable"** (Включить)

### Шаг 3: Создание OAuth 2.0 Credentials

1. Перейдите в **"APIs & Services"** → **"Credentials"**
2. Нажмите **"+ CREATE CREDENTIALS"** в верхней части страницы
3. Выберите **"OAuth client ID"**
4. Если это первый раз, вам нужно настроить **OAuth consent screen**:
   - Выберите **"External"** (для тестирования) или **"Internal"** (если у вас Google Workspace)
   - Заполните обязательные поля:
     - **App name**: "5LB" (или ваше название)
     - **User support email**: ваш email
     - **Developer contact information**: ваш email
   - Нажмите **"Save and Continue"**
   - На шаге **"Scopes"** нажмите **"Save and Continue"**
   - На шаге **"Test users"** (если выбрали External) добавьте тестовые email
   - Нажмите **"Save and Continue"**
   - Нажмите **"Back to Dashboard"**

5. Теперь создайте OAuth Client ID:
   - **Application type**: выберите **"Web application"**
   - **Name**: "5LB Web Client" (или любое другое название)
   - **Authorized JavaScript origins**: добавьте ваш домен (например, `https://app.5lb.pro`)
   - **Authorized redirect URIs**: добавьте ваш callback URL (например, `https://app.5lb.pro/api/auth/google/callback`)
   - Нажмите **"Create"**

6. После создания вы увидите модальное окно с вашими учетными данными:
   - **Client ID** - это ваш `GOOGLE_CLIENT_ID`
   - **Client secret** - это ваш `GOOGLE_CLIENT_SECRET`

### Шаг 4: Добавление в .env файл

Добавьте следующие переменные в ваш `.env` файл:

```env
GOOGLE_CLIENT_ID=ваш_client_id_здесь
GOOGLE_CLIENT_SECRET=ваш_client_secret_здесь
```

---

## Яндекс OAuth

### Шаг 1: Регистрация приложения в Яндекс ID

1. Перейдите на [Яндекс ID](https://oauth.yandex.ru/)
2. Войдите в свой Яндекс аккаунт
3. Нажмите **"Зарегистрировать новое приложение"** или перейдите по прямой ссылке: [https://oauth.yandex.ru/](https://oauth.yandex.ru/)
4. Заполните форму регистрации:
   - **Название приложения**: "5LB" (или ваше название)
   - **Платформы**: выберите **"Веб-сервисы"**
   - **Callback URI #1**: добавьте ваш callback URL (например, `https://app.5lb.pro/api/auth/yandex/callback`)
   
   ⚠️ **Важно**: Убедитесь, что Callback URI точно совпадает с тем, что используется в коде. Проверьте:
   - Протокол (http vs https)
   - Домен (должен быть полным доменным именем)
   - Путь (должен точно совпадать, включая все слэши)
   - Можете добавить дополнительные Callback URI для тестирования (например, `http://localhost:3000/api/auth/yandex/callback`)
   - В разделе **"Доступ к данным пользователя"** выберите необходимые права:
     - ✅ **Доступ к email адресу**
     - ✅ **Доступ к имени, фамилии и отчеству**
     - ✅ **Доступ к аватару**

5. Прочитайте и примите условия использования
6. Нажмите **"Зарегистрировать"**

### Шаг 2: Получение Client ID и Client Secret

1. После регистрации вы попадете на страницу вашего приложения
2. На этой странице вы увидите:
   - **ID приложения** - это ваш `YANDEX_CLIENT_ID`
   - **Пароль приложения** - это ваш `YANDEX_CLIENT_SECRET`

   ⚠️ **Важно**: Пароль приложения показывается только один раз при создании. Если вы его не сохранили, вам нужно будет создать новый пароль или пересоздать приложение.

### Шаг 3: Добавление в .env файл

Добавьте следующие переменные в ваш `.env` файл:

```env
YANDEX_CLIENT_ID=ваш_client_id_здесь
YANDEX_CLIENT_SECRET=ваш_client_secret_здесь
```

---

## Apple Sign In

Настройка Apple Sign In является наиболее сложной, так как требует сертификаты и специальные ключи.

### Шаг 1: Регистрация в Apple Developer Program

1. Перейдите на [Apple Developer](https://developer.apple.com/)
2. Войдите в свой Apple ID
3. Если у вас еще нет Apple Developer Program, вам нужно будет подписаться ($99/год)
4. После входа перейдите в [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/)

### Шаг 2: Создание App ID

1. В разделе **"Identifiers"** нажмите **"+"** для создания нового идентификатора
2. Выберите **"App IDs"** и нажмите **"Continue"**
3. Выберите **"App"** и нажмите **"Continue"**
4. Заполните форму:
   - **Description**: "5LB App" (или ваше описание)
   - **Bundle ID**: выберите существующий или создайте новый (например, `pro.5lb.app`)
5. В разделе **"Capabilities"** включите **"Sign In with Apple"**
6. Нажмите **"Continue"** и затем **"Register"**

### Шаг 3: Создание Service ID для веб-авторизации

1. В разделе **"Identifiers"** нажмите **"+"** снова
2. Выберите **"Services IDs"** и нажмите **"Continue"**
3. Заполните форму:
   - **Description**: "5LB Web Service"
   - **Identifier**: `pro.5lb.web` (должен быть уникальным)
4. Нажмите **"Continue"** и затем **"Register"**
5. Откройте созданный Service ID и нажмите **"Edit"**
6. Включите **"Sign In with Apple"** и нажмите **"Configure"**
7. В настройках добавьте:
   - **Primary App ID**: выберите App ID, созданный на шаге 2
   - **Website URLs**:
     - **Domains and Subdomains**: `5lb.pro` (или ваш домен)
     - **Return URLs**: `https://app.5lb.pro/api/auth/apple/callback` (ваш callback URL)
8. Нажмите **"Save"**, затем **"Continue"**, затем **"Save"**

### Шаг 4: Создание Key для Sign In with Apple

1. В разделе **"Keys"** нажмите **"+"** для создания нового ключа
2. Заполните форму:
   - **Key Name**: "5LB Sign In Key" (или любое название)
   - Включите **"Sign In with Apple"**
3. Нажмите **"Continue"** и затем **"Register"**
4. ⚠️ **КРИТИЧЕСКИ ВАЖНО**: Скачайте ключ (.p8 файл) - он будет доступен только один раз!
5. После скачивания вы увидите **Key ID** - это ваш `APPLE_KEY_ID`

### Шаг 5: Получение Team ID

1. В правом верхнем углу страницы Apple Developer найдите **Team ID**
2. Это ваш `APPLE_TEAM_ID`

### Шаг 6: Получение Client ID

**Client ID** для веб-приложения - это **Service ID**, который вы создали на шаге 3 (например, `pro.5lb.web`)

Это ваш `APPLE_CLIENT_ID`

### Шаг 7: Подготовка Private Key

1. Откройте скачанный .p8 файл в текстовом редакторе
2. Скопируйте его содержимое (включая строки `-----BEGIN PRIVATE KEY-----` и `-----END PRIVATE KEY-----`)
3. Это ваш `APPLE_PRIVATE_KEY`

⚠️ **Важно**: 
- При добавлении в .env файл, вам нужно заменить все переносы строк на `\n`
- Или сохраните ключ в отдельный файл и укажите путь к нему

### Шаг 8: Добавление в .env файл

Добавьте следующие переменные в ваш `.env` файл:

```env
APPLE_CLIENT_ID=pro.5lb.web
APPLE_TEAM_ID=ваш_team_id_здесь
APPLE_KEY_ID=ваш_key_id_здесь
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nваш_ключ_здесь\n-----END PRIVATE KEY-----"
```

**Альтернативный вариант** (если у вас проблемы с многострочными значениями):

Сохраните .p8 файл в безопасное место (например, `src/certs/apple_key.p8`) и используйте его в коде напрямую.

---

## Проверка настроек

После добавления всех переменных в `.env` файл, убедитесь что:

1. ✅ Все переменные добавлены без пробелов вокруг `=`
2. ✅ Значения не содержат лишних кавычек (если не указано иначе)
3. ✅ Callback URLs совпадают с теми, что указаны в ваших приложениях
4. ✅ Для Apple: Private Key правильно отформатирован с `\n` вместо переносов строк

## Тестирование

После настройки всех провайдеров, вы можете протестировать OAuth:

1. **Google**: Перейдите на `/api/auth/google`
2. **Яндекс**: Перейдите на `/api/auth/yandex`
3. **Apple**: Перейдите на `/api/auth/apple`

Все эндпоинты должны перенаправлять на соответствующие страницы авторизации провайдеров.

---

## Полезные ссылки

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Яндекс OAuth Documentation](https://yandex.ru/dev/id/doc/ru/)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Apple Sign In REST API](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api)

---

## Безопасность

⚠️ **Важные рекомендации по безопасности:**

1. Никогда не коммитьте `.env` файл в Git
2. Храните секретные ключи в безопасном месте
3. Используйте разные ключи для development и production
4. Регулярно обновляйте ключи и сертификаты
5. Для Apple: убедитесь, что .p8 файл хранится в безопасном месте
6. Используйте переменные окружения на production сервере, а не файлы

---

## Troubleshooting

### Google: "redirect_uri_mismatch"
- Убедитесь, что Callback URL в Google Console точно совпадает с URL в вашем приложении
- Проверьте протокол (http vs https)
- Проверьте наличие или отсутствие trailing slash

### Яндекс: "invalid_client"
- Проверьте правильность Client ID и Client Secret
- Убедитесь, что Callback URI зарегистрирован в приложении

### Apple: "invalid_client"
- Проверьте правильность Client ID (Service ID)
- Убедитесь, что Team ID и Key ID правильные
- Проверьте формат Private Key (должен быть с `\n`)
- Убедитесь, что ключ не истек (ключи Apple могут иметь срок действия)

---

**Последнее обновление**: Ноябрь 2024

