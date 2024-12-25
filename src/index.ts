import * as dotenv from 'dotenv';
import TelegramBot, { Message } from 'node-telegram-bot-api';

// Загрузка переменных окружения
dotenv.config();

// Получение токена
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('Ошибка: TELEGRAM_BOT_TOKEN не задан в файле .env');
  process.exit(1);
}

// Создание экземпляра бота
const bot = new TelegramBot(token, { polling: true });

// Типы данных для ID пользователей и чатов
const allowedUserIds: string[] = process.env.ALLOWED_USER_IDS
  ? process.env.ALLOWED_USER_IDS.split(',').map((id) => id.trim())
  : [];

const targetChatIds: string[] = process.env.TARGET_CHAT_IDS
  ? process.env.TARGET_CHAT_IDS.split(',').map((id) => id.trim())
  : [];

// Логирование запуска
console.log('Бот запущен и готов к работе.');

// Обработка входящих сообщений
bot.on('message', async (msg: Message) => {
  try {
    const chatId = msg.chat.id.toString();
    const chatType = msg.chat.type;
    const userId = msg.from?.id.toString() || '';
    const text = msg.text;

    // Игнорировать сообщения не из личных чатов
    if (chatType !== 'private') return;

    // Проверка разрешений
    if (!allowedUserIds.includes(userId)) {
      console.log(`Неавторизованный доступ: Пользователь ID ${userId}`);
      await bot.sendMessage(chatId, 'У вас нет прав для использования этого бота.');
      return;
    }

    // Проверка наличия текста
    if (!text) {
      await bot.sendMessage(chatId, 'Пожалуйста, отправьте текстовое сообщение для рассылки.');
      return;
    }

    console.log(`Получено сообщение от пользователя ID ${userId}: ${text}`);

    // Рассылка по целевым чатам
    for (const targetChatId of targetChatIds) {
      try {
        await bot.sendMessage(targetChatId, text);
        console.log(`Сообщение успешно отправлено в чат ID ${targetChatId}`);
      } catch (error) {
        console.error(`Ошибка отправки в чат ID ${targetChatId}:`, error);
      }
    }

    // Уведомление пользователя
    await bot.sendMessage(chatId, 'Ваше сообщение было успешно разослано.');
  } catch (error) {
    console.error('Ошибка при обработке сообщения:', error);
  }
});

// Команда /start и /help
bot.onText(/\/start|\/help/, async (msg: Message) => {
  const chatId = msg.chat.id.toString();
  const helpMessage = `
Привет! Я бот для рассылки сообщений в другие чаты.

**Команды:**
/start или /help - Показать это сообщение.

**Как использовать:**
Просто отправьте мне текстовое сообщение, и я разошлю его в указанные чаты.
`;
  try {
    await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Ошибка отправки /help:', error);
  }
});

// Обработка ошибок polling
bot.on('polling_error', (error: Error) => {
  console.error('Polling error:', error.message);
});

// Обработка неожиданных ошибок
process.on('uncaughtException', (error: Error) => {
  console.error('Необработанная ошибка:', error);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Необработанное отклонение промиса:', promise, 'Причина:', reason);
});