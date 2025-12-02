#!/bin/bash
set -euo pipefail

# Переходим в корень проекта (на уровень выше scripts/)
cd "$(dirname "$0")/.."

echo "--- Текущая директория: $(pwd)"
echo "--- Статус git:"
git status --short

echo ""
echo "--- Добавляем все изменения (включая новые файлы)"
git add -A

echo ""
echo "--- Статус после добавления:"
git status --short

echo ""
echo "--- Создаём коммит"
msg=${1:-"feat: update"}
git commit -m "$msg"

echo ""
echo "--- Пушим в origin main"
git push origin main

echo ""
echo "✅ Готово! Изменения отправлены в репозиторий."
