import logging
import os
import shutil

from aiogram import Bot, Dispatcher, Router, types
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import Update
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Конфигурация
PORT = int(os.getenv("PORT", 10000))
BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBHOOK_URL = os.getenv("WEBHOOK_URL")

if not BOT_TOKEN:
    raise ValueError("Не задана переменная окружения BOT_TOKEN")

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
    csv_path_abs = os.path.abspath(CSV_PATH)
    logger.info(f"Запрос на получение файла: {csv_path_abs}")

    if not os.path.exists(CSV_PATH):
        logger.warning(f"Файл {csv_path_abs} не найден. Создаю новый.")
        try:
            os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
            content = "full_date,date,weekday,time,mood,activities,note_title,note\n".encode(
                "utf-8"
            )
            with open(CSV_PATH, "wb") as f:
                f.write(content)
            logger.info(f"Создан новый файл {csv_path_abs}")
            return Response(content=content, media_type="text/csv")
        except Exception as e:
            logger.error(f"Ошибка при создании файла: {e}", exc_info=True)
            raise HTTPException(
                status_code=500, detail=f"Не удалось создать файл: {e}"
            )
    else:
        try:
            with open(CSV_PATH, "rb") as f:
                content = f.read()
            logger.info(
                f"Отправка содержимого файла {csv_path_abs}. Длина: {len(content)} байт."
            )
            return Response(content=content, media_type="text/csv")
        except Exception as e:
            logger.error(f"Ошибка при чтении файла {csv_path_abs}: {e}", exc_info=True)
            raise HTTPException(
                status_code=500, detail=f"Не удалось прочитать файл: {e}"
            )


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
    try:
        file = await bot.get_file(message.document.file_id)
        file_path = file.file_path
        logger.info(
            f"Получен файл: {message.document.file_name}, file_id: {message.document.file_id}"
        )
        logger.info(f"Путь для сохранения: {os.path.abspath(CSV_PATH)}")

        file_data = await bot.download_file(file_path)
        content = file_data.read()
        content_length = len(content)

        logger.info(f"Размер скачанного файла: {content_length} байт.")

        if content_length == 0:
            logger.warning("Скачанный файл пуст. Запись в файл отменена.")
            await message.reply(
                "Ошибка: Полученный от Telegram файл оказался пустым. Запись отменена."
            )
            return

        os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
        with open(CSV_PATH, "wb") as f:
            f.write(content)

        logger.info(f"Файл {message.document.file_name} успешно записан в {CSV_PATH}")
        await message.reply("Файл успешно загружен и сохранён.")

    except Exception as e:
        logger.error(
            f"Ошибка при обработке файла от пользователя {message.from_user.id}: {e}",
            exc_info=True,
        )
        await message.reply(
            f"Произошла ошибка при сохранении файла на сервере. Обратитесь к администратору.\nОшибка: {e}"
        )


# Запуск приложения
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=PORT)
