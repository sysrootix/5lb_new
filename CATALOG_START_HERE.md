# 🚀 НАЧНИТЕ ЗДЕСЬ - Система каталогов

## ⚡ Быстрый старт (3 шага)

### Шаг 1: Установите сертификат

```bash
# Если у вас есть файл сертификата, скопируйте его:
cp terehin_n.cloud.mda-medusa.ru.p12 /root/5lb/backend/src/certs/
chmod 600 /root/5lb/backend/src/certs/terehin_n.cloud.mda-medusa.ru.p12
```

### Шаг 2: Добавьте в .env

Откройте `/root/5lb/backend/.env` и добавьте:

```env
BALANCE_API_URL=https://cloud.mda-medusa.ru/fransh-trade/hs/Api/BalanceData
BALANCE_API_USERNAME=ТерехинНА
BALANCE_API_PASSWORD=123455123
CERT_PATH=src/certs/terehin_n.cloud.mda-medusa.ru.p12
CERT_PASSWORD=000000000
```

### Шаг 3: Добавьте тестовый магазин

```bash
# Выполните SQL в вашей базе данных:
psql -d lb_db -f /root/5lb/catalog_test_data.sql
```

## ✅ Готово! Запускайте

```bash
# Backend
cd /root/5lb/backend && npm run dev

# Frontend (в другом терминале)
cd /root/5lb/frontend && npm run dev
```

Откройте `http://localhost:5173` и нажмите на вкладку "Каталог"!

---

## 📚 Документация

- **Быстрый старт:** [CATALOG_QUICK_START.md](./CATALOG_QUICK_START.md)
- **Полная документация:** [CATALOG_SYSTEM_DOCUMENTATION.md](./CATALOG_SYSTEM_DOCUMENTATION.md)
- **Развертывание:** [CATALOG_DEPLOYMENT.md](./CATALOG_DEPLOYMENT.md)
- **Отчет:** [CATALOG_IMPLEMENTATION_SUMMARY.md](./CATALOG_IMPLEMENTATION_SUMMARY.md)

---

## 🎯 Что реализовано

✅ Интеграция с 1С Balance API  
✅ 7 API endpoints  
✅ 2 страницы UI (магазины + каталог)  
✅ Автообновление каждые 30 минут  
✅ Кэширование 60 минут  
✅ Поиск товаров  
✅ Адаптивный дизайн  
✅ TypeScript везде  
✅ Полная документация  

---

**Система готова к работе! 🎉**

