# Mood Tracker - Монрепо

Современное приложение для отслеживания настроения с красивым интерфейсом и Telegram-ботом.

## 🏗️ Структура проекта

```
mood_tracker/
├── backend/          # FastAPI + Telegram-бот
│   ├── main.py       # Основное приложение
│   ├── requirements.txt
│   ├── Dockerfile
│   └── data/         # CSV данные
└── frontend/         # React-приложение
    ├── package.json
    ├── src/
    └── vite.config.ts
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```powershell
# Backend (Python)
cd backend
pip install -r requirements.txt

# Frontend (Node.js)
cd frontend
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в папке `backend/`:

```env
BOT_TOKEN=your_telegram_bot_token
WEBHOOK_URL=https://your-domain.com
PORT=10000
```

### 3. Сборка и запуск

#### Вариант A: Раздельный запуск (для разработки)

```powershell
# Terminal 1: Backend
cd backend
python main.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

Фронтенд будет доступен на `http://localhost:8080`, бэкенд на `http://localhost:8000`.

#### Вариант B: Единый запуск (для продакшена)

```powershell
# Сборка фронтенда
.\build-frontend.ps1

# Запуск backend (он отдаст собранный фронтенд)
cd backend
python main.py
```

Приложение будет доступно на `http://localhost:8000`.

## 📱 Telegram-бот

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите токен и добавьте в `.env`
3. Настройте webhook: `GET http://localhost:8000/set-webhook`
4. Отправляйте CSV файлы боту для автоматической загрузки

## 🔧 API Endpoints

- `GET /api/mood.csv` - Получить CSV данные
- `POST /api/upload` - Загрузить CSV файл
- `GET /mood.csv` - Legacy endpoint
- `POST /upload` - Legacy endpoint

## 🛠️ Разработка

### Backend

```powershell
cd backend
python main.py
```

### Frontend

```powershell
cd frontend
npm run dev
```

### Сборка фронтенда

```powershell
# Автоматическая сборка и копирование
.\build-frontend.ps1

# Или вручную
cd frontend
npm run build
cd ..
Copy-Item "frontend/dist/*" "backend/static/" -Recurse -Force
```

## 📊 Формат данных

CSV файл должен содержать следующие колонки:

```csv
full_date,date,weekday,time,mood,activities,note_title,note
2024-01-01T10:00:00,2024-01-01,понедельник,10:00,3,Работа,Хороший день,Продуктивный день
```

## 🐳 Docker

### Разработка (раздельные контейнеры)

```powershell
# Запуск backend и frontend в отдельных контейнерах
docker-compose up backend frontend

# Или только backend
docker-compose up backend

# Или только frontend
docker-compose up frontend
```

Backend будет доступен на `http://localhost:8000`, frontend на `http://localhost:8080`.

### Продакшен (единый контейнер)

```powershell
# Сборка и запуск единого контейнера
docker-compose up app

# Или в фоновом режиме
docker-compose up -d app
```

Приложение будет доступно на `http://localhost:8000`.

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
BOT_TOKEN=your_telegram_bot_token
WEBHOOK_URL=https://your-domain.com
```

## 📝 Возможности

- 📈 Красивые графики настроения
- 📱 Telegram-бот для загрузки данных
- 🎨 Современный UI с Tailwind CSS
- 📊 Статистика и фильтрация
- 🔄 Автоматическая синхронизация
- 📁 Загрузка/скачивание CSV файлов

## 🛠️ Технологии

### Backend
- FastAPI
- aiogram (Telegram Bot)
- Python 3.8+

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts

## 📄 Лицензия

MIT 