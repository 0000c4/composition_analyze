import TelegramBot from 'node-telegram-bot-api';
import gpt from './gpt.js';

// Замените 'YOUR_TELEGRAM_BOT_TOKEN' на токен вашего бота
const token = '6925994505:AAFoY85wy6LYSWyeBcif4erGrW1b1C1n0oY';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Хранение состояния пользователей
const userStates = {};
const previousMessages = {}; // Хранение предыдущих сообщений для возврата

// Функция для отправки стартового сообщения
const sendStartMessage = (chatId) => {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "📸 Проверить состав продукта", callback_data: "check_composition" }
        ],
        [
          { text: "💡 Получить советы по питанию", callback_data: "get_nutrition_tips" }
        ]
      ]
    }
  };

  const caption = `Здравствуй!

🍋  Ежедневно мы приобретаем продукты питания, но редко задумываемся о том, что именно содержится в составе. К большому сожалению, современные производители часто используют пищевые добавки, которые могут оказать негативное влияние на организм. И этих добавок так много, что ни один человек не запомнит их все, а изучение каждой из них в составе может занять много времени. Но мы с командой придумали решение!

📱Используй нашу разработку! 
Если хочешь узнать состав, нажми на соответствующую кнопку, отправь чёткую фотографию состава продукта (либо напиши текстом), и программа моментально переведёт фото в текст и даст тебе расшифровку по каждому компоненту, который может негативно повлиять на твой организм. Нет более быстрого способа проверить продукцию в магазине.

💡Также можешь получить советы по питанию и выбрать одно из направлений, в котором хочешь стать лучше. А наша программа даст тебе чёткие шаги по достижению цели`;

  // Отправляем изображение с подписью
  bot.sendPhoto(chatId, './image.png', { caption: caption, reply_markup: options.reply_markup })
    .catch(err => {
      console.error('Ошибка при отправке изображения:', err);
    });
};

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  sendStartMessage(msg.chat.id);
});

// Обработчик нажатий на кнопки
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  // Устанавливаем состояние пользователя
  userStates[chatId] = data;

  if (data === 'check_composition') {
    const message = 'Сфотографируй или напиши состав продукта, и я предоставлю информацию об ингредиентах, вызывающих сомнение.';
    previousMessages[chatId] = message; // Сохраняем предыдущее сообщение
    bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [[{ text: "Назад ↩️", callback_data: "back_to_previous" }]]
      }
    });
  } else if (data === 'get_nutrition_tips') {
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Хочу меньше уставать и не болеть", callback_data: "less_tired" }],
          [{ text: "Хочу держать свое тело в хорошей форме", callback_data: "stay_fit" }],
          [{ text: "Хочу быть более продуктивным", callback_data: "be_more_productive" }],
          [{ text: "Задам вопрос сам", callback_data: "ask_question" }],
          [{ text: "Назад ↩️", callback_data: "back_to_start" }]
        ]
      }
    };

    const message = `Здесь ты можешь получить советы по питанию 🍏 или выбрать одно из направлений, в котором хочешь стать лучше 🌟. Просто нажми на одну из кнопок ниже:`;
    previousMessages[chatId] = message; // Сохраняем предыдущее сообщение
    bot.sendMessage(chatId, message, options);
  } else if (data === 'back_to_previous') {
    const previousMessage = previousMessages[chatId];
    if (previousMessage) {
      bot.sendMessage(chatId, previousMessage, {
        reply_markup: {
          inline_keyboard: [[{ text: "Назад ↩️", callback_data: "back_to_start" }]]
        }
      });
    }
  } else if (data === 'back_to_start') {
    sendStartMessage(chatId);
  } else if (data === 'less_tired') {
    const response = await gpt('', 'Хочу меньше уставать и не болеть');
    bot.sendMessage(chatId, response.content, {
      reply_markup: {
        inline_keyboard: [[{ text: "Назад ↩️", callback_data: "back_to_previous" }]]
      }
    });
  } else if (data === 'stay_fit') {
    const response = await gpt('', 'Хочу держать свое тело в хорошей форме');
    bot.sendMessage(chatId, response.content, {
      reply_markup: {
        inline_keyboard: [[{ text: "Назад ↩️", callback_data: "back_to_previous" }]]
      }
    });
  } else if (data === 'be_more_productive') {
    const response = await gpt('', 'Хочу быть более продуктивным');
    bot.sendMessage(chatId, response.content, {
      reply_markup: {
        inline_keyboard: [[{ text: "Назад ↩️", callback_data: "back_to_previous" }]]
      }
    });
  } else if (data === 'ask_question') {
    bot.sendMessage(chatId, 'Пожалуйста, напиши свой вопрос, и я постараюсь на него ответить.', {
      reply_markup: {
        inline_keyboard: [[{ text: "Назад ↩️", callback_data: "back_to_start" }]]
      }
    });
  }
});

// Обработчик сообщений
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  // Проверяем, есть ли состояние пользователя
  if (userStates[chatId]) {
    const state = userStates[chatId];

    if (state === 'check_composition') {
      if (msg.text) {
        const response = await gpt('', msg.text);
        bot.sendMessage(chatId, response.content, {
          reply_markup: {
            inline_keyboard: [[{ text: "Назад ↩️", callback_data: "back_to_previous" }]]
          }
        });
      } else if (msg.photo) {
        const photo = msg.photo[msg.photo.length - 1];
        const fileId = photo.file_id;

        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

        const response = await gpt(fileUrl);
        bot.sendMessage(chatId, response.content, {
          reply_markup: {
            inline_keyboard: [[{ text: "Назад ↩️", callback_data: "back_to_previous" }]]
          }
        });
      }
    } else if (state === 'get_nutrition_tips') {
      const response = await gpt('', msg.text);
      bot.sendMessage(chatId, response.content, {
        reply_markup: {
          inline_keyboard: [[{ text: "Назад ↩️", callback_data: "back_to_start" }]]
        }
      });
    }
  }
});

console.log('Бот запущен...');