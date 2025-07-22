FROM python:3.11-slim

WORKDIR /app

# Устанавливаем wget для healthcheck
RUN apt-get update && apt-get install -y wget

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Создаем необходимые директории
RUN mkdir -p /app/data

COPY . .

# Указываем предварительную команду для создания файла с заголовками Daylio
RUN echo "full_date,date,weekday,time,mood,activities,note_title,note" > /app/data/mood.csv

# Запускаем единый сервис
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
