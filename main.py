import logging
import os
import shutil

from aiogram import Bot, Dispatcher, Router, types
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import Update
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Конфигурация
PORT = int(os.getenv("PORT", 10000))
BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBHOOK_URL = os.getenv("WEBHOOK_URL")

CSV_PATH = "data/mood.csv"
app = FastAPI()

# Статика
app.mount("/static", StaticFiles(directory="static"), name="static")

# Telegram Bot
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(storage=MemoryStorage())
router = Router()
dp.include_router(router)

# FastAPI endpoints


@app.get("/")
def serve_index():
    return FileResponse("static/index.html")


@app.get("/mood.csv")
def get_csv():
    if not os.path.exists(CSV_PATH):
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


# Установка Webhook
@app.get("/set-webhook")
async def set_webhook():
    if not WEBHOOK_URL:
        raise HTTPException(status_code=400, detail="WEBHOOK_URL не задан")
    result = await bot.set_webhook(f"{WEBHOOK_URL}/webhook")
    return {"result": result}


# Получение Telegram-обновлений
@app.post("/webhook")
async def telegram_webhook(request: Request):
    try:
        data = await request.json()
        update = Update.model_validate(data)
        await dp.feed_update(bot, update)
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Ошибка в webhook: {e}")
        raise HTTPException(status_code=500, detail="Ошибка при обработке webhook")


# Обработчик документов
@router.message(lambda m: m.document is not None)
async def handle_csv_file(message: types.Message):
    file = await bot.get_file(message.document.file_id)
    file_path = file.file_path
    file_data = await bot.download_file(file_path)

    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
    with open(CSV_PATH, "wb") as f:
        f.write(file_data.read())

    await message.reply("Файл успешно загружен и сохранён")


# Запуск приложения
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=PORT)
