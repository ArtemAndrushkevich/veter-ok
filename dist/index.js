"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
// Загрузка переменных окружения
dotenv.config();
// Получение токена
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.error('Ошибка: TELEGRAM_BOT_TOKEN не задан в файле .env');
    process.exit(1);
}
// Создание экземпляра бота
const bot = new node_telegram_bot_api_1.default(token, { polling: true });
// Типы данных для ID пользователей и чатов
const allowedUserIds = process.env.ALLOWED_USER_IDS
    ? process.env.ALLOWED_USER_IDS.split(',').map((id) => id.trim())
    : [];
const targetChatIds = process.env.TARGET_CHAT_IDS
    ? process.env.TARGET_CHAT_IDS.split(',').map((id) => id.trim())
    : [];
// Логирование запуска
console.log('Бот запущен и готов к работе.');
// Обработка входящих сообщений
bot.on('message', (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const chatId = msg.chat.id.toString();
        const chatType = msg.chat.type;
        const userId = ((_a = msg.from) === null || _a === void 0 ? void 0 : _a.id.toString()) || '';
        const text = msg.text;
        // Игнорировать сообщения не из личных чатов
        if (chatType !== 'private')
            return;
        // Проверка разрешений
        if (!allowedUserIds.includes(userId)) {
            console.log(`Неавторизованный доступ: Пользователь ID ${userId}`);
            yield bot.sendMessage(chatId, 'У вас нет прав для использования этого бота.');
            return;
        }
        // Проверка наличия текста
        if (!text) {
            yield bot.sendMessage(chatId, 'Пожалуйста, отправьте текстовое сообщение для рассылки.');
            return;
        }
        console.log(`Получено сообщение от пользователя ID ${userId}: ${text}`);
        // Рассылка по целевым чатам
        for (const targetChatId of targetChatIds) {
            try {
                yield bot.sendMessage(targetChatId, text);
                console.log(`Сообщение успешно отправлено в чат ID ${targetChatId}`);
            }
            catch (error) {
                console.error(`Ошибка отправки в чат ID ${targetChatId}:`, error);
            }
        }
        // Уведомление пользователя
        yield bot.sendMessage(chatId, 'Ваше сообщение было успешно разослано.');
    }
    catch (error) {
        console.error('Ошибка при обработке сообщения:', error);
    }
}));
// Команда /start и /help
bot.onText(/\/start|\/help/, (msg) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = msg.chat.id.toString();
    const helpMessage = `
Привет! Я бот для рассылки сообщений в другие чаты.

**Команды:**
/start или /help - Показать это сообщение.

**Как использовать:**
Просто отправьте мне текстовое сообщение, и я разошлю его в указанные чаты.
`;
    try {
        yield bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    }
    catch (error) {
        console.error('Ошибка отправки /help:', error);
    }
}));
// Обработка ошибок polling
bot.on('polling_error', (error) => {
    console.error('Polling error:', error.message);
});
// Обработка неожиданных ошибок
process.on('uncaughtException', (error) => {
    console.error('Необработанная ошибка:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Необработанное отклонение промиса:', promise, 'Причина:', reason);
});
