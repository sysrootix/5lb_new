#!/usr/bin/env bash
# deploy.sh - обратная совместимость
# Теперь вызывает единый скрипт deploy-all.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "⚠️  Используется старый скрипт deploy.sh"
echo "💡 Рекомендуется использовать: ./deploy-all.sh app"
echo ""

exec "$SCRIPT_DIR/deploy-all.sh" app
