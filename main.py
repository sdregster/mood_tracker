from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import shutil
import os
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Получаем порт из переменной окружения или используем значение по умолчанию
PORT = int(os.getenv("PORT", 10000))

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

# Путь к CSV файлу в директории data
CSV_PATH = "data/mood.csv"


@app.get("/")
def serve_index():
    return FileResponse("static/index.html")


@app.get("/mood.csv")
def get_csv():
    # Проверка существования файла
    if not os.path.exists(CSV_PATH):
        # Создаем пустой файл со структурой Daylio
        try:
            os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
            with open(CSV_PATH, "w") as f:
                f.write("full_date,date,weekday,time,mood,activities,note_title,note\n")
            logger.info(f"Создан новый файл {CSV_PATH}")
        except Exception as e:
            logger.error(f"Ошибка при создании файла: {e}")
            raise HTTPException(status_code=500, detail=f"Не удалось создать файл: {e}")
    return FileResponse(CSV_PATH, media_type="text/csv")


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
        with open(CSV_PATH, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"Файл успешно загружен в {CSV_PATH}")
        return {"status": "uploaded"}
    except Exception as e:
        logger.error(f"Ошибка при загрузке файла: {e}")
        raise HTTPException(status_code=500, detail=str(e))
