const { Markup } = require('telegraf');

const transportMenuText = `🚚 ДОСТАВКА С ТРАНСПОРТНЫХ КОМПАНИЙ

Мы поможем доставить ваш груз из популярных транспортных компаний в ЛНР:
📍 Луганск, Краснодон, Старобельск

📋 Доступны следующие ТК:
• 🧭 СДЭК
• 🏢 КИТ
• 🏤 ПЭК
• 🚛 Деловые Линии
• 📦 Boxberry
• 🧾 DPD
• 🗳 5post
• 📮 Почта России

👇 Выберите компанию, с которой оформлен или планируется заказ:`;

const transportMenuKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🧭 СДЭК', 'transport_cdek')],
    [Markup.button.callback('🏢 КИТ / 🏤 ПЭК / 🚛 Деловые Линии', 'transport_kit_pek_dl')],
    [Markup.button.callback('📦 Boxberry / 🧾 DPD / 🗳 5post / 📮 Почта России', 'transport_other')],
    [Markup.button.callback('🔙 Назад в главное меню', 'back_to_main')]
]);

// Подменю для каждой транспортной компании
const createTransportSubmenu = (callbackPrefix) => {
    return Markup.inlineKeyboard([
        [Markup.button.callback('📦 Уже оформил — хочу оформить доставку', `${callbackPrefix}_ordered`)],
        [Markup.button.callback('🤔 Думаю оформить — как это работает', `${callbackPrefix}_planning`)],
        [Markup.button.callback('🔙 Назад', 'menu_transport')]
    ]);
};

module.exports = {
    transportMenuText,
    transportMenuKeyboard,
    createTransportSubmenu
};

