#!/bin/bash
# Скрипт обновления портов для нового сервера (60000-60010)
# Запускать на НОВОМ сервере после migration-restore.sh

set -e

echo "🔧 Обновление портов на новом сервере (60000-60010)..."
echo ""

# Проверка что мы в правильной директории
if [ ! -d "/root/5lb" ]; then
  echo "❌ Директория /root/5lb не найдена!"
  exit 1
fi

cd /root/5lb

# Функция для безопасной замены в файле
update_port() {
  local file=$1
  local old_port=$2
  local new_port=$3

  if [ -f "$file" ]; then
    echo "  → Обновление $file: $old_port → $new_port"
    sed -i "s/PORT=$old_port/PORT=$new_port/g" "$file"
    sed -i "s/:$old_port/:$new_port/g" "$file"
    sed -i "s/localhost:$old_port/localhost:$new_port/g" "$file"
  else
    echo "  ⚠️  Файл $file не найден, пропускаем"
  fi
}

# 1. Обновление Backend (.env)
echo "1️⃣  Обновление Backend порта: 4000 → 60000"
update_port "backend/.env" "4000" "60000"

# 2. Обновление CRM Backend (.env)
echo "2️⃣  Обновление CRM Backend порта: 5000 → 60001"
update_port "crm/crm_backend/.env" "5000" "60001"

# 3. Обновление Frontend (.env) если есть API_URL
echo "3️⃣  Обновление Frontend конфигурации"
if [ -f "frontend/.env" ]; then
  echo "  → Обновление frontend/.env"
  # Обновляем localhost:4000 на localhost:60000 в VITE_API_URL и других переменных
  sed -i "s|localhost:4000|localhost:60000|g" "frontend/.env"
  sed -i "s|:4000/api|:60000/api|g" "frontend/.env"
fi

# 4. Копирование нового ecosystem.config.js
echo "4️⃣  Обновление ecosystem.config.js"
if [ -f "ecosystem.config.new-server.js" ]; then
  # Сохраняем резервную копию старого
  cp ecosystem.config.js ecosystem.config.old-server.js.backup

  # Копируем новую конфигурацию
  cp ecosystem.config.new-server.js ecosystem.config.js
  echo "  ✅ ecosystem.config.js обновлен"
  echo "  📁 Старая конфигурация сохранена в ecosystem.config.old-server.js.backup"
else
  echo "  ⚠️  ecosystem.config.new-server.js не найден"
  echo "  Обновляем существующий ecosystem.config.js вручную..."

  # Обновляем порты в существующем файле
  sed -i "s/PORT: 4000/PORT: 60000/g" ecosystem.config.js
  sed -i "s/PORT: 5000/PORT: 60001/g" ecosystem.config.js
fi

# 5. Создание примера конфигурации Nginx
echo "5️⃣  Создание примера конфигурации Nginx"
cat > /root/5lb/nginx-new-ports.conf.example <<'EOF'
# Пример конфигурации Nginx для новых портов
# Скопируйте в /etc/nginx/sites-available/5lb.conf

upstream backend {
    server localhost:60000;
}

upstream crm_backend {
    server localhost:60001;
}

server {
    listen 80;
    listen [::]:80;
    server_name app.5lb.pro;

    # Frontend статика
    location / {
        root /root/5lb/frontend/dist;
        try_files $uri $uri/ /index.html;

        # Кэширование статики
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # CRM Backend
    location /crm-api {
        proxy_pass http://crm_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Если у вас уже есть SSL
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name app.5lb.pro;
#
#     ssl_certificate /etc/letsencrypt/live/app.5lb.pro/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/app.5lb.pro/privkey.pem;
#
#     # ... остальная конфигурация как выше ...
# }
EOF

echo "  ✅ Пример конфигурации создан: nginx-new-ports.conf.example"

# 6. Показываем сводку изменений
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Обновление портов завершено!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Новые порты:"
echo "  • Backend:     60000 (было 4000)"
echo "  • CRM Backend: 60001 (было 5000)"
echo ""
echo "📝 Обновленные файлы:"
echo "  • backend/.env"
echo "  • crm/crm_backend/.env"
echo "  • frontend/.env"
echo "  • ecosystem.config.js"
echo ""
echo "🔍 Проверка обновленных портов:"
echo ""

# Показываем обновленные порты
if [ -f "backend/.env" ]; then
  echo "Backend PORT:"
  grep "^PORT=" backend/.env
fi

if [ -f "crm/crm_backend/.env" ]; then
  echo "CRM Backend PORT:"
  grep "^PORT=" crm/crm_backend/.env
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Следующие шаги:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Обновите конфигурацию Nginx:"
echo "   sudo nano /etc/nginx/sites-available/5lb.conf"
echo "   # Используйте nginx-new-ports.conf.example как шаблон"
echo "   # Замените proxy_pass на localhost:60000 и localhost:60001"
echo ""
echo "2️⃣  Проверьте конфигурацию Nginx:"
echo "   sudo nginx -t"
echo ""
echo "3️⃣  Перезапустите Nginx:"
echo "   sudo systemctl reload nginx"
echo ""
echo "4️⃣  Перезапустите приложения через PM2:"
echo "   pm2 delete all"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo ""
echo "5️⃣  Проверьте что все работает:"
echo "   pm2 list"
echo "   curl http://localhost:60000/api/health"
echo "   curl http://localhost:60001/health  # если есть health endpoint"
echo ""
echo "6️⃣  Запустите проверку:"
echo "   ./migration-verify.sh"
echo ""
echo "💡 Совет: Если нужно вернуться к старым портам:"
echo "   cp ecosystem.config.old-server.js.backup ecosystem.config.js"
echo ""
