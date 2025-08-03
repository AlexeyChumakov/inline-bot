const sessionManager = require("../utils/sessionManager");

class OperatorHandlers {
  constructor(bot) {
    this.bot = bot;
    this.operatorId = process.env.OPERATOR_ID;
  }

  async startOperatorChat(ctx) {
    const userId = ctx.from.id;
    sessionManager.setOperatorMode(userId, true);

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "❌ Завершить чат с оператором",
              callback_data: "end_operator_chat",
            },
          ],
        ],
      },
    };

    await ctx.editMessageText(
      "🧑‍💬 Вы подключены к оператору!\n\nТеперь вы можете написать ваш вопрос, и оператор получит ваше сообщение. Ответ оператора придёт вам автоматически.\n\nДля завершения чата нажмите кнопку ниже.",
      keyboard
    );

    // Уведомляем оператора о новом чате
    if (this.operatorId) {
      try {
        await this.bot.telegram.sendMessage(
          this.operatorId,
          `🔔 Новый чат с пользователем!\n\nID: ${userId}\nИмя: ${ctx.from.first_name || "Не указано"}\nUsername: @${ctx.from.username || "Не указан"}\n\nПользователь ожидает ответа.`
        );
      } catch (error) {
        console.error("Ошибка отправки уведомления оператору:", error);
      }
    }
  }

  async endOperatorChat(ctx) {
    const userId = ctx.from.id;
    sessionManager.setOperatorMode(userId, false);

    await ctx.editMessageText(
      "✅ Чат с оператором завершён.\n\nСпасибо за обращение! Если у вас возникнут ещё вопросы, вы всегда можете связаться с нами снова."
    );

    // Показываем главное меню
    const mainMenuContent = require("../data/bot_content").main_menu;
    const { Markup } = require("telegraf");
    const buttons = mainMenuContent.buttons.map((btn) =>
      Markup.button.callback(btn.text, btn.callback)
    );
    const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 });

    setTimeout(async () => {
      await ctx.reply(mainMenuContent.text, keyboard);
    }, 1000);

    // Уведомляем оператора о завершении чата
    if (this.operatorId) {
      try {
        await this.bot.telegram.sendMessage(
          this.operatorId,
          `📝 Чат с пользователем ${userId} (${ctx.from.first_name || "Без имени"}) завершён.`
        );
      } catch (error) {
        console.error("Ошибка отправки уведомления оператору:", error);
      }
    }
  }

  async handleUserMessage(ctx) {
    const userId = ctx.from.id;

    if (!sessionManager.isOperatorMode(userId)) {
      return false; // Не в режиме оператора
    }

    if (!this.operatorId) {
      await ctx.reply("❌ Оператор временно недоступен. Попробуйте позже.");
      return true;
    }

    try {
      const userInfo = `👤 От: ${ctx.from.first_name || "Без имени"} (ID: ${userId})`;
      const message = ctx.message;

      if (message.text) {
        await this.bot.telegram.sendMessage(
          this.operatorId,
          `${userInfo}\n💬 Сообщение: ${message.text}`
        );
      } else if (message.photo) {
        await this.bot.telegram.sendPhoto(
          this.operatorId,
          message.photo[message.photo.length - 1].file_id,
          { caption: `${userInfo}\n📷 Фото${message.caption ? ": " + message.caption : ""}` }
        );
      } else if (message.document) {
        await this.bot.telegram.sendDocument(
          this.operatorId,
          message.document.file_id,
          { caption: `${userInfo}\n📎 Документ${message.caption ? ": " + message.caption : ""}` }
        );
      } else if (message.video) {
        await this.bot.telegram.sendVideo(
          this.operatorId,
          message.video.file_id,
          { caption: `${userInfo}\n📹 Видео${message.caption ? ": " + message.caption : ""}` }
        );
      } else if (message.audio) {
        await this.bot.telegram.sendAudio(
          this.operatorId,
          message.audio.file_id,
          { caption: `${userInfo}\n🎵 Аудио${message.caption ? ": " + message.caption : ""}` }
        );
      } else if (message.voice) {
        await this.bot.telegram.sendVoice(
          this.operatorId,
          message.voice.file_id,
          { caption: `${userInfo}\n🗣️ Голосовое сообщение` }
        );
      } else if (message.sticker) {
        await this.bot.telegram.sendSticker(
          this.operatorId,
          message.sticker.file_id
        );
        await this.bot.telegram.sendMessage(
          this.operatorId,
          `${userInfo}\n✨ Стикер`
        );
      } else {
        await this.bot.telegram.sendMessage(
          this.operatorId,
          `${userInfo}\n❓ Неподдерживаемый тип сообщения.`
        );
      }

      await ctx.reply("✅ Ваше сообщение отправлено оператору. Ожидайте ответа.");
    } catch (error) {
      console.error("Ошибка пересылки сообщения оператору:", error);
      await ctx.reply("❌ Произошла ошибка при отправке сообщения. Попробуйте позже.");
    }

    return true; // Сообщение обработано
  }

  async handleOperatorReply(ctx) {
    // Проверяем, что сообщение от оператора
    if (ctx.from.id.toString() !== this.operatorId) {
      return false;
    }

    // Ищем ID пользователя в сообщении оператора
    const text = ctx.message.text || ctx.message.caption || "";
    const userIdMatch = text.match(/ID:\s*(\d+)/);

    if (!userIdMatch) {
      await ctx.reply(
        "❌ Не удалось определить получателя. Укажите ID пользователя в формате \"ID: 123456789\""
      );
      return true;
    }

    const targetUserId = userIdMatch[1];
    const operatorMessagePrefix = `🧑‍💬 Ответ оператора:\n\n`;

    try {
      const message = ctx.message;

      if (message.text) {
        await this.bot.telegram.sendMessage(
          targetUserId,
          `${operatorMessagePrefix}${message.text}`
        );
      } else if (message.photo) {
        await this.bot.telegram.sendPhoto(
          targetUserId,
          message.photo[message.photo.length - 1].file_id,
          { caption: `${operatorMessagePrefix}${message.caption || ""}` }
        );
      } else if (message.document) {
        await this.bot.telegram.sendDocument(
          targetUserId,
          message.document.file_id,
          { caption: `${operatorMessagePrefix}${message.caption || ""}` }
        );
      } else if (message.video) {
        await this.bot.telegram.sendVideo(
          targetUserId,
          message.video.file_id,
          { caption: `${operatorMessagePrefix}${message.caption || ""}` }
        );
      } else if (message.audio) {
        await this.bot.telegram.sendAudio(
          targetUserId,
          message.audio.file_id,
          { caption: `${operatorMessagePrefix}${message.caption || ""}` }
        );
      } else if (message.voice) {
        await this.bot.telegram.sendVoice(
          targetUserId,
          message.voice.file_id,
          { caption: `${operatorMessagePrefix}Голосовое сообщение` }
        );
      } else if (message.sticker) {
        await this.bot.telegram.sendSticker(
          targetUserId,
          message.sticker.file_id
        );
        await this.bot.telegram.sendMessage(
          targetUserId,
          `${operatorMessagePrefix}Стикер`
        );
      } else {
        await ctx.reply("❌ Неподдерживаемый тип сообщения для пересылки пользователю.");
        return true;
      }

      await ctx.reply("✅ Ответ отправлен пользователю.");
    } catch (error) {
      console.error("Ошибка отправки ответа пользователю:", error);
      await ctx.reply("❌ Ошибка отправки ответа пользователю.");
    }

    return true;
  }
}

module.exports = OperatorHandlers;


