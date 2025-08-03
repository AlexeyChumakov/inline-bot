const { Markup } = require("telegraf");
const contentParser = require("../data/contentParser");

class MenuHandlers {
  // Универсальный метод для отправки/редактирования сообщений
  static async sendOrEditMessage(ctx, text, keyboard) {
    try {
      // Проверяем, есть ли сообщение для редактирования
      if (ctx.callbackQuery && ctx.callbackQuery.message) {
        const message = ctx.callbackQuery.message;
        
        // Если сообщение содержит только текст, можем редактировать
        if (message.text && !message.photo && !message.video && !message.document) {
          await ctx.editMessageText(text, keyboard);
          return;
        }
        
        // Если сообщение содержит медиафайлы, удаляем старое и отправляем новое
        try {
          await ctx.deleteMessage();
        } catch (deleteError) {
          console.log("Не удалось удалить сообщение:", deleteError.message);
        }
      }
      
      // Отправляем новое сообщение
      await ctx.reply(text, keyboard);
    } catch (error) {
      console.error("Ошибка в sendOrEditMessage:", error);
      // Fallback: просто отправляем новое сообщение
      try {
        await ctx.reply(text, keyboard);
      } catch (fallbackError) {
        console.error("Критическая ошибка отправки сообщения:", fallbackError);
      }
    }
  }

  static async handleMainMenu(ctx) {
    const mainMenuContent = contentParser.get("main_menu");
    const buttons = mainMenuContent.buttons.map((btn) =>
      [Markup.button.callback(btn.text, btn.callback)]
    );
    const keyboard = Markup.inlineKeyboard(buttons);
    await MenuHandlers.sendOrEditMessage(ctx, mainMenuContent.text, keyboard);
  }

  static async handleMarketplacesMenu(ctx) {
    const marketplacesContent = contentParser.get("marketplaces");
    const buttons = marketplacesContent.list.map((mp) =>
      [Markup.button.callback(mp.button_text, `marketplace_${mp.id}`)]
    );
    buttons.push([Markup.button.callback("🔙 Назад", "back_to_main")]);
    const keyboard = Markup.inlineKeyboard(buttons);
    await MenuHandlers.sendOrEditMessage(ctx, marketplacesContent.intro_text, keyboard);
  }

  static async handleTransportMenu(ctx) {
    const transportContent = contentParser.get("transport_companies");
    const buttons = transportContent.list.map((tc) =>
      [Markup.button.callback(tc.button_text, `transport_${tc.id}`)]
    );
    buttons.push([Markup.button.callback("🔙 Назад", "back_to_main")]);
    const keyboard = Markup.inlineKeyboard(buttons);
    await MenuHandlers.sendOrEditMessage(ctx, transportContent.intro_text, keyboard);
  }

  static async handleTrackingMenu(ctx) {
    const trackingContent = contentParser.get("tracking");
    
    let buttons = [];
    if (trackingContent.buttons) {
      buttons = trackingContent.buttons.map(btn => 
        [Markup.button.url(btn.text, btn.url)]
      );
    }
    buttons.push([Markup.button.callback("🔙 Назад", "back_to_main")]);
    
    const keyboard = Markup.inlineKeyboard(buttons);
    await MenuHandlers.sendOrEditMessage(ctx, trackingContent.text, keyboard);
  }

  static async handleShippingMenu(ctx) {
    const shippingContent = contentParser.get("shipping");
    
    let buttons = [];
    if (shippingContent.buttons) {
      buttons = shippingContent.buttons.map(btn => {
        if (btn.url) {
          return [Markup.button.url(btn.text, btn.url)];
        } else {
          return [Markup.button.callback(btn.text, btn.callback)];
        }
      });
    }
    buttons.push([Markup.button.callback("🔙 Назад", "back_to_main")]);
    
    const keyboard = Markup.inlineKeyboard(buttons);
    await MenuHandlers.sendOrEditMessage(ctx, shippingContent.text, keyboard);
  }

  static async handleShippingFAQ(ctx) {
    const [_, __, index] = ctx.callbackQuery.data.split("_");
    const shippingContent = contentParser.get("shipping");
    const faqItem = shippingContent.faq[parseInt(index)];
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("🔙 Назад", "menu_shipping")]
    ]);
    await MenuHandlers.sendOrEditMessage(ctx, faqItem.answer, keyboard);
  }

  static async handleFAQMenu(ctx) {
    const faqContent = contentParser.get("faq");
    const buttons = faqContent.questions.map((question, index) =>
      [Markup.button.callback(question.question, `faq_question_${index}`)]
    );
    buttons.push([Markup.button.callback("🔙 Назад", "back_to_main")]);
    const keyboard = Markup.inlineKeyboard(buttons);
    await MenuHandlers.sendOrEditMessage(ctx, faqContent.intro_text, keyboard);
  }

  static async handleFAQQuestion(ctx, questionIndex) {
    const faqContent = contentParser.get("faq");
    const questionItem = faqContent.questions[questionIndex];
    
    let keyboard;
    if (questionItem.buttons) {
      // Если у вопроса есть кнопки, добавляем их
      const questionButtons = questionItem.buttons.map(btn => 
        [Markup.button.url(btn.text, btn.url)]
      );
      questionButtons.push([Markup.button.callback("🔙 Назад", "menu_faq")]);
      keyboard = Markup.inlineKeyboard(questionButtons);
    } else {
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback("🔙 Назад", "menu_faq")]
      ]);
    }
    
    await MenuHandlers.sendOrEditMessage(ctx, questionItem.answer, keyboard);
  }

  static async handleOperatorMenu(ctx) {
    const operatorContent = contentParser.get("operator_contact");
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("🧑‍💬 Начать чат с оператором", "start_operator_chat")],
      [Markup.button.callback("🔙 Назад", "back_to_main")]
    ]);
    await MenuHandlers.sendOrEditMessage(ctx, operatorContent.text, keyboard);
  }

  static async handleMarketplaceSubmenu(ctx, marketplaceId) {
    const marketplace = contentParser.get("marketplaces.list").find(mp => mp.id === marketplaceId);
    if (!marketplace) return;

    const buttons = [
      [Markup.button.callback("📦 Уже оформил", `marketplace_${marketplaceId}_ordered`)],
      [Markup.button.callback("🤔 Планирую оформить", `marketplace_${marketplaceId}_planning`)],
      [Markup.button.callback("🔙 Назад", "menu_marketplaces")]
    ];
    const keyboard = Markup.inlineKeyboard(buttons);
    await MenuHandlers.sendOrEditMessage(ctx, marketplace.intro_text, keyboard);
  }

  static async handleMarketplaceOrdered(ctx, marketplaceId) {
    const marketplace = contentParser.get("marketplaces.list").find(mp => mp.id === marketplaceId);
    if (!marketplace || !marketplace.ordered) return;

    const buttons = [
      [Markup.button.url("🔗 Оформить заявку через сайт", marketplace.url)],
      [Markup.button.url("🤖 Оформить заявку через Telegram-бота", "https://t.me/ftekrf_bot")]
    ];

    if (marketplace.ordered.sdek_button) {
      buttons.push([Markup.button.callback("Заказ через СДЭК?", "transport_sdek_planning")]);
    }

    buttons.push([Markup.button.callback("🔙 Назад", `marketplace_${marketplaceId}`)]);
    const keyboard = Markup.inlineKeyboard(buttons);
    await MenuHandlers.sendOrEditMessage(ctx, marketplace.ordered.text, keyboard);
  }

  static async handleMarketplacePlanning(ctx, marketplaceId) {
    const marketplace = contentParser.get("marketplaces.list").find(mp => mp.id === marketplaceId);
    if (!marketplace || !marketplace.planning) return;

    const buttons = [
      [Markup.button.url("🔗 Оформить заявку через сайт", marketplace.url)],
      [Markup.button.url("🤖 Оформить заявку через Telegram-бота", "https://t.me/ftekrf_bot")]
    ];

    if (marketplace.planning.sdek_button) {
      buttons.push([Markup.button.callback("Заказ через СДЭК?", "transport_sdek_planning")]);
    }

    buttons.push([Markup.button.callback("🔙 Назад", `marketplace_${marketplaceId}`)]);
    const keyboard = Markup.inlineKeyboard(buttons);
    await MenuHandlers.sendOrEditMessage(ctx, marketplace.planning.text, keyboard);
  }

  static async handleTransportSubmenu(ctx, transportId) {
    const transport = contentParser.get("transport_companies.list").find(tc => tc.id === transportId);
    if (!transport) return;

    const buttons = [
      [Markup.button.callback("📦 Уже оформил", `transport_${transportId}_ordered`)],
      [Markup.button.callback("🤔 Планирую оформить", `transport_${transportId}_planning`)],
      [Markup.button.callback("🔙 Назад", "menu_transport")]
    ];
    const keyboard = Markup.inlineKeyboard(buttons);
    await MenuHandlers.sendOrEditMessage(ctx, transport.intro_text, keyboard);
  }

  static async handleTransportOrdered(ctx, transportId) {
    const transport = contentParser.get("transport_companies.list").find(tc => tc.id === transportId);
    if (!transport || !transport.ordered) return;

    const buttons = [
      [Markup.button.url("🔗 Оформить заявку через сайт", transport.url)],
      [Markup.button.url("🤖 Оформить заявку через Telegram-бота", "https://t.me/ftekrf_bot")]
    ];
    buttons.push([Markup.button.callback("🔙 Назад", `transport_${transportId}`)]);
    const keyboard = Markup.inlineKeyboard(buttons);
    await MenuHandlers.sendOrEditMessage(ctx, transport.ordered.text, keyboard);
  }

  static async handleTransportPlanning(ctx, transportId) {
    const transport = contentParser.get("transport_companies.list").find(tc => tc.id === transportId);
    if (!transport || !transport.planning) return;

    const buttons = [
      [Markup.button.url("🔗 Оформить заявку через сайт", transport.url)],
      [Markup.button.url("🤖 Оформить заявку через Telegram-бота", "https://t.me/ftekrf_bot")]
    ];
    buttons.push([Markup.button.callback("🔙 Назад", `transport_${transportId}`)]);
    const keyboard = Markup.inlineKeyboard(buttons);
    await MenuHandlers.sendOrEditMessage(ctx, transport.planning.text, keyboard);
  }

  static async handleBack(ctx) {
    const callbackData = ctx.callbackQuery.data;
    if (callbackData === "back_to_main") {
      await MenuHandlers.handleMainMenu(ctx);
    } else if (callbackData.startsWith("back_to_marketplace_")) {
      const marketplaceId = callbackData.replace("back_to_marketplace_", "");
      await MenuHandlers.handleMarketplaceSubmenu(ctx, marketplaceId);
    } else if (callbackData.startsWith("back_to_transport_")) {
      const transportId = callbackData.replace("back_to_transport_", "");
      await MenuHandlers.handleTransportSubmenu(ctx, transportId);
    } else if (callbackData === "back_to_menu_marketplaces") {
      await MenuHandlers.handleMarketplacesMenu(ctx);
    } else if (callbackData === "back_to_menu_transport") {
      await MenuHandlers.handleTransportMenu(ctx);
    } else if (callbackData === "back_to_menu_shipping") {
      await MenuHandlers.handleShippingMenu(ctx);
    } else if (callbackData === "back_to_menu_faq") {
      await MenuHandlers.handleFAQMenu(ctx);
    }
  }

  // Новые методы для shipping
  static async handleShippingRules(ctx) {
    const shippingContent = contentParser.get("shipping.rules");
    const buttons = shippingContent.faq.map((faqItem, index) =>
      [Markup.button.callback(faqItem.question, `shipping_rules_faq_${index}`)]
    );
    buttons.push([Markup.button.callback("🔙 Назад", "menu_shipping")]);
    const keyboard = Markup.inlineKeyboard(buttons);
    await MenuHandlers.sendOrEditMessage(ctx, shippingContent.text, keyboard);
  }

  static async handleShippingTracking(ctx) {
    const shippingContent = contentParser.get("shipping.tracking");
    const buttons = shippingContent.faq.map((faqItem, index) =>
      [Markup.button.callback(faqItem.question, `shipping_tracking_faq_${index}`)]
    );
    buttons.push([Markup.button.callback("🔙 Назад", "menu_shipping")]);
    const keyboard = Markup.inlineKeyboard(buttons);
    await MenuHandlers.sendOrEditMessage(ctx, shippingContent.text, keyboard);
  }

  static async handleShippingContacts(ctx) {
    const shippingContent = contentParser.get("shipping.contacts");
    const buttons = shippingContent.faq.map((faqItem, index) =>
      [Markup.button.callback(faqItem.question, `shipping_contacts_faq_${index}`)]
    );
    buttons.push([Markup.button.callback("🔙 Назад", "menu_shipping")]);
    const keyboard = Markup.inlineKeyboard(buttons);
    await MenuHandlers.sendOrEditMessage(ctx, shippingContent.text, keyboard);
  }
}

module.exports = MenuHandlers;

