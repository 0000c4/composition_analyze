import TelegramBot from 'node-telegram-bot-api';
import gpt from './gpt.js';

// Замените 'YOUR_TELEGRAM_BOT_TOKEN' на токен вашего бота
const token = '1132532677:AAFfiv5zVD1MIsXXsHAAzlJSgl5nR9PvMwQ';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Привет! Сфотографируй или напиши состав продукта, и я предоставлю информацию об ингредиентах, вызывающих сомнение.');
});

// Обработчик всех текстовых сообщений
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (msg.text) {
    // Выводим текстовое сообщение пользователя в консоль
    const response = await gpt('', msg.text)
    console.log(response)
    bot.sendMessage(chatId, response.content);
  } else if (msg.photo) {
    // Получаем наибольшее по размеру изображение
    console.log(msg.photo)
    const photo = msg.photo[msg.photo.length - 1];
    const fileId = photo.file_id;

    // Получаем ссылку на файл
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

    console.log(fileUrl)

    const response = await gpt(fileUrl)
    console.log(response)
    // Отправляем чату гпт

    // Выводим ответ от гпт
    bot.sendMessage(chatId, response.content);
  }
});

console.log('Бот запущен...');