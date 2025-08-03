const { Markup } = require('telegraf');

const marketplacesMenuText = `📦 ДОСТАВКА С МАРКЕТПЛЕЙСОВ

Мы поможем доставить ваши заказы из популярных онлайн-магазинов в ЛНР:
📍 Луганск, Краснодон, Старобельск

Доступны следующие площадки:
🔹 Ozon
🔹 Wildberries
🔹 AliExpress
🔹 DNS
🔹 Яндекс Маркет
🔹 Avito
🔹 Другие интернет-магазины

👇 Выберите маркетплейс, с которого оформлен или планируется заказ:`;

const marketplacesMenuKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📦 Ozon', 'marketplace_ozon')],
    [Markup.button.callback('🎁 Wildberries', 'marketplace_wildberries')],
    [Markup.button.callback('🛒 AliExpress', 'marketplace_aliexpress')],
    [Markup.button.callback('🔌 DNS', 'marketplace_dns')],
    [Markup.button.callback('🧺 Яндекс Маркет', 'marketplace_yandex')],
    [Markup.button.callback('🔄 Avito', 'marketplace_avito')],
    [Markup.button.callback('🔹 Другие интернет-магазины', 'marketplace_other')],
    [Markup.button.callback('🔙 Назад в главное меню', 'back_to_main')]
]);

// Подменю для каждого маркетплейса
const createMarketplaceSubmenu = (marketplaceName, callbackPrefix) => {
    return Markup.inlineKeyboard([
        [Markup.button.callback('📦 Уже заказал — оформить доставку', `${callbackPrefix}_ordered`)],
        [Markup.button.callback('🤔 Думаю заказать — узнать, как это работает', `${callbackPrefix}_planning`)],
        [Markup.button.callback('🔙 Назад', 'menu_marketplaces')]
    ]);
};

module.exports = {
    marketplacesMenuText,
    marketplacesMenuKeyboard,
    createMarketplaceSubmenu
};

