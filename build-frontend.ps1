# Скрипт для сборки фронтенда и копирования в backend
# Запускать из корня проекта

Write-Host "🔨 Сборка фронтенда..." -ForegroundColor Green

# Переходим в папку frontend
Set-Location frontend

# Устанавливаем зависимости если нужно
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Установка зависимостей..." -ForegroundColor Yellow
    npm install
}

# Собираем проект
Write-Host "🏗️ Сборка React-приложения..." -ForegroundColor Yellow
npm run build

# Проверяем, что сборка прошла успешно
if (-not (Test-Path "dist")) {
    Write-Host "❌ Ошибка: папка dist не создана!" -ForegroundColor Red
    exit 1
}

# Возвращаемся в корень
Set-Location ..

# Очищаем старую статику в backend
Write-Host "🧹 Очистка старой статики..." -ForegroundColor Yellow
if (Test-Path "backend/static") {
    Remove-Item "backend/static" -Recurse -Force
}

# Копируем собранный фронтенд в backend/static
Write-Host "📁 Копирование собранного фронтенда в backend/static..." -ForegroundColor Yellow
Copy-Item "frontend/dist/*" "backend/static/" -Recurse -Force

Write-Host "✅ Фронтенд успешно собран и скопирован в backend/static!" -ForegroundColor Green
Write-Host "🚀 Теперь можно запускать backend: cd backend && python main.py" -ForegroundColor Cyan 