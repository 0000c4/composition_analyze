import axios from "axios";

// OpenAI API Key
const apiKey = 'sk-Ds17kkZqR4mpICZyk0O0kEOfvKOAJXYn';

export default async (image = '', text = '') => {
  console.log(text)
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  const payloadImage = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Ты чат-бот, которому пользователи присылают фото с составом продукта или текст состава продукта. Твоя задача найти вредные ингредиенты в составе и предоставить информацию о них пользователю. Нужно предоставить информацию только о вредных ингредиентах, о безопасных ничего писать не нужно. В ответе не должно быть исходного состава и повторяющихся ингредиентов. Если в составе только безопасные ингредиенты, напиши пользователю поздравление.`
          },
          {
            type: 'image_url',
            image_url: {
              url: image
            }
          }
        ]
      }
    ],
    max_tokens: 1000
  };

  const payloadText = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Ты чат-бот, которому пользователи присылают фото с составом продукта или текст состава продукта. Твоя задача найти вредные ингредиенты в составе и предоставить информацию о них пользователю. Нужно предоставить информацию только о вредных ингредиентах, о безопасных ничего писать не нужно. В ответе не должно быть исходного состава и повторяющихся ингредиентов. Если в составе только безопасные ингредиенты, напиши пользователю поздравление. ${text}`
          }
        ]
      }
    ],
    max_tokens: 1000
  };
  try {
    const { data } = await axios.post('https://api.proxyapi.ru/openai/v1/chat/completions', text == '' ? payloadImage : payloadText, { headers }) //если текст отсутствует, значит пользователь прислал фото
    return data.choices[0].message
  } catch (error) {
    console.log(error)
  }


}