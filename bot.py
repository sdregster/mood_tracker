from aiogram import Bot, Dispatcher, F
from aiogram.types import Message
import aiohttp
import asyncio
import os
import sys

BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    print("Ошибка: BOT_TOKEN не указан в переменных окружения")
    sys.exit(1)
    
UPLOAD_URL = os.getenv("UPLOAD_URL", "http://localhost:10000/upload")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(F.document)
async def handle_csv(message: Message):
    file = await bot.download(message.document)
    async with aiohttp.ClientSession() as session:
        form = aiohttp.FormData()
        form.add_field("file", file, filename="mood.csv", content_type="text/csv")
        async with session.post(UPLOAD_URL, data=form) as resp:
            await message.reply(f"Загружено: {resp.status}")


async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
