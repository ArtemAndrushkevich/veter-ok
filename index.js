// index.js

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Получение токена из переменных окружения
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('Ошибка: TELEGRAM_BOT_TOKEN не задан в файле .env');
  process.exit(1);
}

// Создание экземпляра бота с использованием polling
const bot = new TelegramBot(token, { polling: true });

// Получение списка разрешённых пользователей и целевых чатов из переменных окружения
const allowedUserIds = process.env.ALLOWED_USER_IDS
  ? process.env.ALLOWED_USER_IDS.split(',').map(id => id.trim())
  : [];

const targetChatIds = process.env.TARGET_CHAT_IDS
  ? process.env.TARGET_CHAT_IDS.split(',').map(id => id.trim())
  : [];

// Логирование запуска бота
console.log('Бот запущен и готов к работе.');

// Обработка входящих сообщений
bot.on('message', async (msg) => {
  try {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;
    const userId = msg.from.id;
    const text = msg.text;

    // Игнорировать сообщения, не из личных чатов
    if (chatType !== 'private') {
      return;
    }

    // Проверка, является ли пользователь разрешённым
    if (!allowedUserIds.includes(userId.toString())) {
      console.log(`Неавторизованный доступ: Пользователь ID ${userId} попытался отправить сообщение.`);
      await bot.sendMessage(chatId, 'У вас нет прав для использования этого бота.');
      return;
    }

    // Проверка наличия текстового сообщения
    if (!text) {
      await bot.sendMessage(chatId, 'Пожалуйста, отправьте текстовое сообщение для рассылки.');
      return;
    }

    console.log(`Получено сообщение от пользователя ID ${userId}: ${text}`);

    // Отправка сообщения во все целевые чаты
    for (const targetChatId of targetChatIds) {
      try {
        await bot.sendMessage(
          targetChatId,
          `${text}`
        );
        console.log(`Сообщение успешно отправлено в чат ID ${targetChatId}`);
      } catch (error) {
        console.error(`Не удалось отправить сообщение в чат ID ${targetChatId}:`, error.response?.body || error.message);
      }
    }

    // Подтверждение отправки пользователю
    await bot.sendMessage(chatId, 'Ваше сообщение было успешно разослано.');

  } catch (error) {
    console.error('Ошибка при обработке сообщения:', error);
  }
});

// Обработка команд /start и /help
bot.onText(/\/start|\/help/, async (msg) => {
  const chatId = msg.chat.id;
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
    console.error('Ошибка при отправке сообщения /help:', error);
  }
});

// Обработка ошибок polling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error.code, error.message);
});

// Обработка неожиданных ошибок
process.on('uncaughtException', (error) => {
  console.error('Необработанная ошибка:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Необработанное отклонение промиса:', promise, 'причина:', reason);
});
