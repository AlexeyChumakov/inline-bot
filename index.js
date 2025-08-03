require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const MenuHandlers = require("./handlers/menuHandlers");
const OperatorHandlers = require("./handlers/operatorHandlers");
const contentParser = require("./data/contentParser");
const fs = require("fs");
const path = require("path");

// Проверяем наличие токена
if (!process.env.BOT_TOKEN) {
  console.error("❌ BOT_TOKEN не найден в .env файле");
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);
const operatorHandlers = new OperatorHandlers(bot);

// Проверяем наличие логотипа
const logoPath = path.join(__dirname, 'assets', 'FTEKRFлого.png');
const hasLogo = fs.existsSync(logoPath);

if (!hasLogo) {
  console.log("⚠️  Логотип не найден в ./assets/FTEKRFлого.png");
  console.log("   Бот будет работать без логотипа");
}

// Команда /start
bot.start(async (ctx) => {
  try {
    const mainMenuContent = contentParser.get("main_menu");
    const buttons = mainMenuContent.buttons.map((btn) =>
      [Markup.button.callback(btn.text, btn.callback)]
    );
    const keyboard = Markup.inlineKeyboard(buttons);

    if (hasLogo) {
      // Отправляем с логотипом, если файл существует
      await ctx.replyWithPhoto(
        { source: logoPath },
        { caption: mainMenuContent.text, ...keyboard }
      );
    } else {
      // Отправляем только текст, если логотипа нет
      await ctx.reply(mainMenuContent.text, keyboard);
    }
  } catch (error) {
    console.error("❌ Ошибка в команде /start:", error);
    await ctx.reply("Добро пожаловать в FTEK! Произошла ошибка при загрузке меню, но бот работает.");
  }
});

// Обработчики главного меню
bot.action("menu_marketplaces", MenuHandlers.handleMarketplacesMenu);
bot.action("menu_transport", MenuHandlers.handleTransportMenu);
bot.action("menu_tracking", MenuHandlers.handleTrackingMenu);
bot.action("menu_shipping", MenuHandlers.handleShippingMenu);
bot.action("menu_faq", MenuHandlers.handleFAQMenu);
bot.action("menu_operator", MenuHandlers.handleOperatorMenu);
bot.action("back_to_main", MenuHandlers.handleMainMenu);

// Обработчики маркетплейсов
try {
  contentParser.get("marketplaces.list").forEach((mp) => {
    bot.action(`marketplace_${mp.id}`, (ctx) =>
      MenuHandlers.handleMarketplaceSubmenu(ctx, mp.id)
    );
    bot.action(`marketplace_${mp.id}_ordered`, (ctx) =>
      MenuHandlers.handleMarketplaceOrdered(ctx, mp.id)
    );
    bot.action(`marketplace_${mp.id}_planning`, (ctx) =>
      MenuHandlers.handleMarketplacePlanning(ctx, mp.id)
    );
  });
} catch (error) {
  console.error("❌ Ошибка при настройке обработчиков маркетплейсов:", error);
}

// Обработчики транспортных компаний
try {
  contentParser.get("transport_companies.list").forEach((tc) => {
    bot.action(`transport_${tc.id}`, (ctx) =>
      MenuHandlers.handleTransportSubmenu(ctx, tc.id)
    );
    bot.action(`transport_${tc.id}_ordered`, (ctx) =>
      MenuHandlers.handleTransportOrdered(ctx, tc.id)
    );
    bot.action(`transport_${tc.id}_planning`, (ctx) =>
      MenuHandlers.handleTransportPlanning(ctx, tc.id)
    );
  });
} catch (error) {
  console.error("❌ Ошибка при настройке обработчиков транспортных компаний:", error);
}

// Обработчики FAQ категорий
try {
  const faqData = contentParser.get("faq");
  if (faqData && faqData.questions) {
    // Обработчики FAQ вопросов (прямо без категорий)
    faqData.questions.forEach((question, index) => {
      bot.action(`faq_question_${index}`, (ctx) =>
        MenuHandlers.handleFAQQuestion(ctx, index)
      );
    });
  }
} catch (error) {
  console.error("❌ Ошибка при настройке обработчиков FAQ:", error);
}

// Обработчики перевозки посылок
// Обработчики shipping FAQ
bot.action(/shipping_faq_\d+/, async (ctx) => {
  try {
    await MenuHandlers.handleShippingFAQ(ctx);
  } catch (error) {
    console.error("❌ Ошибка в shipping FAQ:", error);
    await ctx.reply("Произошла ошибка. Попробуйте позже.");
  }
});

// Обработчики новых кнопок shipping
bot.action("shipping_rules", MenuHandlers.handleShippingRules);
bot.action("shipping_tracking", MenuHandlers.handleShippingTracking);
bot.action("shipping_contacts", MenuHandlers.handleShippingContacts);

// Обработчики для shipping FAQ кнопок
bot.action(/shipping_rules_faq_\d+/, async (ctx) => {
  try {
    const index = ctx.callbackQuery.data.split("_")[3];
    const shippingContent = contentParser.get("shipping.rules");
    const faqItem = shippingContent.faq[parseInt(index)];
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("🔙 Назад", "shipping_rules")]
    ]);
    await MenuHandlers.sendOrEditMessage(ctx, faqItem.answer, keyboard);
  } catch (error) {
    console.error("❌ Ошибка в shipping rules FAQ:", error);
  }
});

bot.action(/shipping_tracking_faq_\d+/, async (ctx) => {
  try {
    const index = ctx.callbackQuery.data.split("_")[3];
    const shippingContent = contentParser.get("shipping.tracking");
    const faqItem = shippingContent.faq[parseInt(index)];
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("🔙 Назад", "shipping_tracking")]
    ]);
    await MenuHandlers.sendOrEditMessage(ctx, faqItem.answer, keyboard);
  } catch (error) {
    console.error("❌ Ошибка в shipping tracking FAQ:", error);
  }
});

bot.action(/shipping_contacts_faq_\d+/, async (ctx) => {
  try {
    const index = ctx.callbackQuery.data.split("_")[3];
    const shippingContent = contentParser.get("shipping.contacts");
    const faqItem = shippingContent.faq[parseInt(index)];
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("🔙 Назад", "shipping_contacts")]
    ]);
    await MenuHandlers.sendOrEditMessage(ctx, faqItem.answer, keyboard);
  } catch (error) {
    console.error("❌ Ошибка в shipping contacts FAQ:", error);
  }
});

// Обработчики кнопок "Назад"
bot.action(/back_to_.*/, MenuHandlers.handleBack);

// Обработчики связи с оператором
bot.action("start_operator_chat", operatorHandlers.startOperatorChat.bind(operatorHandlers));
bot.action("end_operator_chat", operatorHandlers.endOperatorChat.bind(operatorHandlers));

// Обработчик всех сообщений (включая медиафайлы)
bot.on("message", async (ctx) => {
  try {
    // Сначала проверяем, не ответ ли это от оператора
    const isOperatorReply = await operatorHandlers.handleOperatorReply(ctx);
    if (isOperatorReply) return;

    // Затем проверяем, не сообщение ли это пользователя в режиме чата с оператором
    const isUserMessage = await operatorHandlers.handleUserMessage(ctx);
    if (isUserMessage) return;

    // Если не в режиме оператора, показываем главное меню
    const mainMenuContent = contentParser.get("main_menu");
    const buttons = mainMenuContent.buttons.map((btn) =>
      [Markup.button.callback(btn.text, btn.callback)]
    );
    const keyboard = Markup.inlineKeyboard(buttons);
    await ctx.reply("Используйте кнопки меню для навигации:", keyboard);
  } catch (error) {
    console.error("❌ Ошибка в обработчике сообщений:", error);
    await ctx.reply("Произошла ошибка. Попробуйте позже.");
  }
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error("❌ Ошибка в боте:", err);
  if (ctx) {
    try {
      ctx.reply("Произошла ошибка. Попробуйте позже.");
    } catch (replyError) {
      console.error("❌ Не удалось отправить сообщение об ошибке:", replyError);
    }
  }
});

// Запуск бота
bot.launch()
  .then(() => {
    console.log("🤖 FTEK Telegram Bot запущен!");
    console.log("📋 Доступные команды:");
    console.log("   /start - Запуск бота");
    console.log("💡 Убедитесь, что в .env файле указаны:");
    console.log("   BOT_TOKEN - токен вашего бота");
    console.log("   OPERATOR_ID - ID оператора для пересылки сообщений");
    
    if (hasLogo) {
      console.log("🖼️  Логотип найден и будет отображаться");
    } else {
      console.log("⚠️  Логотип не найден, бот работает без логотипа");
      console.log("   Для добавления логотипа поместите файл FTEKRFлого.png в папку assets/");
    }
  })
  .catch((error) => {
    console.error("❌ Ошибка запуска бота:", error);
    
    if (error.response && error.response.error_code === 404) {
      console.error("\n🔍 Диагностика ошибки 404:");
      console.error("1. Проверьте токен в .env файле");
      console.error("2. Убедитесь, что бот не удален в @BotFather");
      console.error("3. Проверьте доступность api.telegram.org");
      console.error("4. Попробуйте создать нового бота в @BotFather");
    }
  });

// Graceful stop
process.once("SIGINT", () => {
  console.log("\n🛑 Остановка бота...");
  bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
  console.log("\n🛑 Остановка бота...");
  bot.stop("SIGTERM");
});

