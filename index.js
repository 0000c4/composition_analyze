import TelegramBot from 'node-telegram-bot-api';
import gpt from './gpt.js';

// Замените 'YOUR_TELEGRAM_BOT_TOKEN' на токен вашего бота
const token = '1132532677:AAFfiv5zVD1MIsXXsHAAzlJSgl5nR9PvMwQ';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Проверить состав продукта", callback_data: "check_composition" },
          { text: "Получить советы по питанию", callback_data: "get_nutrition_tips" }
        ]
      ]
    }
  };

  bot.sendMessage(msg.chat.id, `Здравствуй!

🍋  Ежедневно мы приобретаем продукты питания, но редко задумываемся о том, что именно содержится в составе. К большому сожалению, современные производители часто используют пищевые добавки, которые могут оказать негативное влияние на организм. И этих добавок так много, что ни один человек не запомнит их все, а изучение каждой из них в составе может занять много времени. Но мы с командой придумали решение!

📱Используй нашу разработку! 
Если хочешь узнать состав, нажми на соответствующую кнопку, отправь чёткую фотографию состава продукта (либо напиши текстом), и программа моментально переведёт фото в текст и даст тебе расшифровку по каждому компоненту, который может негативно повлиять на твой организм. Нет более быстрого способа проверить продукцию в магазине.

💡Также можешь получить советы по питанию и выбрать одно из направлений, в котором хочешь стать лучше. А наша программа даст тебе чёткие шаги по достижению цели`, options);
});

// Обработчик нажатий на кнопки
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data === 'check_composition') {
    bot.sendMessage(chatId, 'Сфотографируй или напиши состав продукта, и я предоставлю информацию об ингредиентах, вызывающих сомнение.');
    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;

      if (msg.text !== '/start') {

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
  } else if (data === 'get_nutrition_tips') {
    bot.sendMessage(chatId, `Здесь ты можешь получить советы по питанию 🍏 или выбрать одно из направлений, в котором хочешь стать лучше 🌟. Просто напиши, что тебе нужно. Например: 
1) Хочу меньше уставать и не болеть
2) Хочу держать свое тело в хорошей форме
3) Хочу быть более продуктивным`);
    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;

      if (msg.text !== '/start') {
        // Выводим текстовое сообщение пользователя в консоль
        const response = await gpt('', msg.text)
        console.log(response)
        bot.sendMessage(chatId, response.content);
      }
    });
  }
});


console.log('Бот запущен...');