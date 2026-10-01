# Praksia — Инструкция по развёртыванию

## Что нужно от вас (5 шагов)

---

## Шаг 1. Настройка Google OAuth (бесплатно)

1. Перейдите на https://console.cloud.google.com/
2. Создайте новый проект (кнопка вверху)
3. Слева: **APIs & Services → Credentials**
4. **+ Create Credentials → OAuth 2.0 Client ID**
5. Тип приложения: **Web application**
6. В **Authorized redirect URIs** добавьте:
   ```
   https://ВАШ_ДОМЕН/api/auth/callback/google
   ```
7. Сохраните — скопируйте **Client ID** и **Client Secret**

---

## Шаг 2. Настройка email (Gmail SMTP, бесплатно)

1. Войдите в Google-аккаунт, который будет отправлять письма
2. Перейдите: https://myaccount.google.com/security
3. Включите **2-Step Verification** (если не включена)
4. Зайдите в: https://myaccount.google.com/apppasswords
5. Выберите **Mail → Other → "Praksia"** → нажмите **Generate**
6. Скопируйте 16-значный **App Password** (пароль приложения)

---

## Шаг 3. Создание файла .env на сервере

Подключитесь к серверу по SSH и выполните:

```bash
# Клонируйте репозиторий
git clone https://github.com/ВАШ_ЛОГИН/praksia.git
cd praksia

# Создайте файл с переменными
cp .env.example .env
nano .env
```

Заполните `.env` следующими значениями:

```env
# PostgreSQL
POSTGRES_DB=praksia
POSTGRES_USER=praksia_user
POSTGRES_PASSWORD=сгенерируйте_сложный_пароль_здесь

# Database URL (не меняйте)
DATABASE_URL=postgresql://praksia_user:сгенерируйте_сложный_пароль_здесь@postgres:5432/praksia

# NextAuth
NEXTAUTH_SECRET=вставьте_результат_команды_openssl_rand_-base64_32
NEXTAUTH_URL=https://ВАШ_ДОМЕН.RU

# Google OAuth (из Шага 1)
GOOGLE_CLIENT_ID=1234567890-abcde.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxx

# Email (Gmail из Шага 2)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ваша_почта@gmail.com
SMTP_PASSWORD=aaaa_bbbb_cccc_dddd
SMTP_FROM=Praksia <ваша_почта@gmail.com>

# Первый администратор
ADMIN_EMAIL=ваша_почта@gmail.com
```

**Сгенерировать NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## Шаг 4. Настройка SSL-сертификата

### Вариант А: Certbot (бесплатно, Let's Encrypt)
```bash
# Установите certbot
apt install certbot -y

# Получите сертификат
certbot certonly --standalone -d ВАШ_ДОМЕН.RU

# Скопируйте сертификаты
mkdir -p nginx/ssl
cp /etc/letsencrypt/live/ВАШ_ДОМЕН.RU/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/ВАШ_ДОМЕН.RU/privkey.pem nginx/ssl/
chmod 600 nginx/ssl/*.pem
```

### Вариант Б: Только HTTP (для теста, без SSL)
Замените в `nginx/nginx.conf` секцию HTTPS на простую HTTP:
```nginx
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
И удалите секцию с listen 443 и редиректом.

---

## Шаг 5. Запуск!

```bash
# Убедитесь что Docker установлен
docker --version
docker compose --version

# Запуск (первый раз — скачает образы ~5 мин)
docker compose up -d

# Проверьте что всё запустилось
docker compose ps

# Логи приложения
docker compose logs app -f

# Миграция и заполнение БД (выполняется автоматически через migrate сервис)
# Если нужно вручную:
docker compose run --rm migrate
```

Сайт будет доступен по адресу: `https://ВАШ_ДОМЕН.RU`

---

## Проверка работы

```bash
# Проверьте health endpoint
curl https://ВАШ_ДОМЕН.RU/api/health

# Должен ответить:
# {"status":"ok","db":"connected"}
```

---

## Обновление сайта

```bash
git pull origin main
docker compose build app
docker compose up -d app
```

---

## Обновление SSL-сертификата (автоматически через cron)

```bash
# Добавьте в crontab (обновление каждые 3 месяца)
crontab -e

# Добавьте строку:
0 0 1 */3 * certbot renew --quiet && cp /etc/letsencrypt/live/ВАШ_ДОМЕН.RU/fullchain.pem /путь/к/praksia/nginx/ssl/ && cp /etc/letsencrypt/live/ВАШ_ДОМЕН.RU/privkey.pem /путь/к/praksia/nginx/ssl/ && docker compose -f /путь/к/praksia/docker-compose.yml restart nginx
```

---

## Частые проблемы

**Ошибка "Database connection failed"**
```bash
docker compose logs postgres
# Проверьте POSTGRES_PASSWORD в .env
```

**Ошибка Google OAuth "redirect_uri_mismatch"**
- В Google Console проверьте, что URI совпадает: `https://ВАШ_ДОМЕН.RU/api/auth/callback/google`
- Точное совпадение, включая https и путь

**Email не отправляется**
- Проверьте, что App Password правильный (16 символов без пробелов)
- Убедитесь, что 2FA включена в Google-аккаунте

**Nginx 502 Bad Gateway**
```bash
docker compose logs app
# Приложение ещё запускается, подождите 30 секунд
```

---

## Структура проекта

```
praksia/
├── src/
│   ├── app/             # Next.js страницы и API
│   │   ├── (auth)/      # Страницы входа/регистрации
│   │   ├── dashboard/   # Личный кабинет
│   │   ├── editor/      # Редактор документов
│   │   ├── admin/       # Панель администратора
│   │   └── api/         # API endpoints
│   ├── components/      # React компоненты
│   ├── lib/             # Утилиты (auth, db, email, export)
│   └── types/           # TypeScript типы
├── prisma/
│   ├── schema.prisma    # Схема БД
│   └── seed.ts          # Начальные данные (шаблоны)
├── nginx/
│   └── nginx.conf       # Конфиг nginx
├── docker-compose.yml   # Запуск сервисов
├── Dockerfile           # Сборка приложения
└── .env.example         # Шаблон переменных окружения
```

---

## Технологии

| Компонент | Технология |
|-----------|-----------|
| Frontend + Backend | Next.js 14 (App Router) |
| База данных | PostgreSQL 16 |
| ORM | Prisma |
| Авторизация | NextAuth.js (Google OAuth + Email/Password) |
| Email | Nodemailer (Gmail SMTP) |
| Экспорт PDF | html2canvas + jsPDF (клиентская сторона) |
| Экспорт DOCX | docx.js (клиентская сторона) |
| Хранение документов | IndexedDB браузера (бесплатно) |
| Стилизация | Tailwind CSS |
| Веб-сервер | Nginx |
| Контейнеры | Docker Compose |

---

## Вопросы?

Если что-то не работает — проверьте логи:
```bash
docker compose logs -f
```
