#!/bin/sh
# Praksia — smart database migration script
# Handles: fresh DBs, DBs set up with "prisma db push", DBs with migration history

echo "================================================================"
echo "  Praksia — подготовка базы данных"
echo "================================================================"

echo ""
echo "[1/3] Генерация Prisma-клиента..."
npx prisma generate || { echo "ОШИБКА: prisma generate завершился с ошибкой"; exit 1; }

echo ""
echo "[2/3] Применение миграций..."

# Try standard deploy first (works for fresh DBs and DBs already using migrate deploy)
if npx prisma migrate deploy 2>/tmp/prisma_err.txt; then
  echo "  ✓ Миграции применены успешно"
else
  # Check if failure is because tables already exist (DB was set up with db push)
  if grep -qi "already exist\|already been created\|relation.*exist\|table.*exist\|duplicate" /tmp/prisma_err.txt 2>/dev/null; then
    echo "  БД уже существует (режим db push). Регистрируем базовую миграцию..."

    # Mark the initial migration as applied without running it
    npx prisma migrate resolve --applied "20261002103000_init" 2>/dev/null || true

    # Now only new additive migrations will run
    if npx prisma migrate deploy 2>/tmp/prisma_err2.txt; then
      echo "  ✓ Новые миграции применены"
    else
      echo "  ОШИБКА при применении новых миграций:"
      cat /tmp/prisma_err2.txt 2>/dev/null
      exit 1
    fi
  else
    echo "  ОШИБКА при применении миграций:"
    cat /tmp/prisma_err.txt 2>/dev/null
    exit 1
  fi
fi

echo ""
echo "[3/3] Инициализация начальных данных (категории, шаблоны, администратор)..."
npx tsx prisma/seed.ts

echo ""
echo "================================================================"
echo "  ✓ База данных готова к работе"
echo "================================================================"
