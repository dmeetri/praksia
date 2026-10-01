#!/bin/bash
# Praksia — Quick Setup Script
# Run: chmod +x scripts/setup.sh && ./scripts/setup.sh

set -e

echo "🚀 Praksia Setup"
echo "================"

# Check .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Создан .env из .env.example"
  echo "⚠️  ВАЖНО: Заполните .env своими значениями!"
  echo ""
  echo "Минимально необходимые поля:"
  echo "  - POSTGRES_PASSWORD"
  echo "  - DATABASE_URL (обновите пароль)"
  echo "  - NEXTAUTH_SECRET (генерируйте: openssl rand -base64 32)"
  echo "  - NEXTAUTH_URL"
  echo "  - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET"
  echo "  - SMTP_* (email настройки)"
  echo ""
  echo "После заполнения .env запустите снова: ./scripts/setup.sh"
  exit 0
fi

# Check required vars
source .env
MISSING=""
for VAR in POSTGRES_PASSWORD NEXTAUTH_SECRET NEXTAUTH_URL GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET; do
  if [ -z "${!VAR}" ] || [ "${!VAR}" == *"здесь"* ] || [ "${!VAR}" == *"your_"* ]; then
    MISSING="$MISSING $VAR"
  fi
done

if [ -n "$MISSING" ]; then
  echo "❌ Незаполненные переменные в .env:$MISSING"
  echo "Заполните их и запустите снова."
  exit 1
fi

echo "✅ .env проверен"

# Check SSL
if [ ! -f nginx/ssl/fullchain.pem ]; then
  echo ""
  echo "⚠️  SSL сертификаты не найдены в nginx/ssl/"
  echo "Для HTTPS выполните:"
  echo "  certbot certonly --standalone -d ВАШ_ДОМЕН"
  echo "  mkdir -p nginx/ssl"
  echo "  cp /etc/letsencrypt/live/ВАШ_ДОМЕН/fullchain.pem nginx/ssl/"
  echo "  cp /etc/letsencrypt/live/ВАШ_ДОМЕН/privkey.pem nginx/ssl/"
  echo ""
  echo "Или отредактируйте nginx/nginx.conf для работы без SSL (только HTTP)"
fi

# Build and start
echo ""
echo "🔨 Сборка Docker образов..."
docker compose build

echo ""
echo "🚀 Запуск сервисов..."
docker compose up -d

echo ""
echo "⏳ Ожидание запуска PostgreSQL..."
sleep 10

echo ""
echo "📦 Применение миграций и заполнение БД..."
docker compose run --rm migrate || true

echo ""
echo "✅ Готово! Сайт доступен по адресу: $NEXTAUTH_URL"
echo ""
echo "Полезные команды:"
echo "  docker compose ps           # Статус сервисов"
echo "  docker compose logs app -f  # Логи приложения"
echo "  docker compose down         # Остановить"
