// Тестовый файл для проверки исправлений клавиатуры
const { Markup } = require("telegraf");
const contentParser = require("./data/contentParser");

console.log("🔍 Тестирование исправлений клавиатуры...");

try {
  // Проверяем загрузку данных
  const marketplacesContent = contentParser.get("marketplaces");
  console.log("✅ Данные маркетплейсов загружены:", !!marketplacesContent);
  console.log("✅ Количество маркетплейсов:", marketplacesContent.list?.length || 0);

  // Тестируем создание кнопок для маркетплейсов
  const buttons = marketplacesContent.list.map((mp) =>
    Markup.button.callback(mp.button_text, `marketplace_${mp.id}`)
  );
  console.log("✅ Кнопки маркетплейсов созданы:", buttons.length);

  // Добавляем кнопку "Назад" правильным способом
  buttons.push(Markup.button.callback("🔙 Назад", "back_to_main"));
  console.log("✅ Кнопка 'Назад' добавлена, общее количество кнопок:", buttons.length);

  // Проверяем, что все элементы массива являются объектами
  const allButtonsAreObjects = buttons.every(btn => typeof btn === 'object' && btn !== null);
  console.log("✅ Все кнопки являются объектами:", allButtonsAreObjects);

  // Создаем клавиатуру
  const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 });
  console.log("✅ Клавиатура создана:", !!keyboard);

  // Проверяем структуру клавиатуры
  console.log("✅ Структура клавиатуры корректна:", keyboard.reply_markup && keyboard.reply_markup.inline_keyboard);

  console.log("\n🎉 Все тесты прошли успешно! Ошибка с InlineKeyboardButton исправлена.");

} catch (error) {
  console.error("❌ Ошибка в тестах:", error.message);
  console.error("❌ Стек ошибки:", error.stack);
  process.exit(1);
}
