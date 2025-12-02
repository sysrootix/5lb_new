#!/bin/bash
set -euo pipefail

echo "--- Обновляем репозиторий"
git fetch origin

echo "--- Применяем изменения"
git pull --ff-only origin main
