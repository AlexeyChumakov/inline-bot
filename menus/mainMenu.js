const { Markup } = require('telegraf');

const mainMenuText = `👋 Добро пожаловать в официальный бот поддержки FTEK!

Мы доставляем заказы из маркетплейсов и транспортных компаний в ЛНР:
📍 Луганск, Краснодон, Старобельск

🔹 Узнать, как оформить доставку с маркетплейсов:
Ozon, Wildberries, AliExpress, Yandex Market, DNS, AVITO и прочих

🔹 Узнать, как оформить доставку с транспортных компаний:
СДЭК, КИТ, ПЭК, Деловые Линии, DPD, 5post, Boxberry

🔹 Узнать, как отследить свою посылку

🔹 Связаться с оператором, если не нашли ответ

👇 Выберите нужный раздел:`;

const mainMenuKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📦 Доставка с маркетплейсов', 'menu_marketplaces')],
    [Markup.button.callback('🚚 Доставка с транспортных компаний', 'menu_transport')],
    [Markup.button.callback('🔄 Перевозка посылок между РФ и ЛНР', 'menu_shipping')],
    [Markup.button.callback('📍 Как отследить посылку', 'menu_tracking')],
    [Markup.button.callback('❓ Часто задаваемые вопросы', 'menu_faq')],
    [Markup.button.callback('🧑‍💬 Связаться с оператором', 'menu_operator')]
]);

module.exports = {
    mainMenuText,
    mainMenuKeyboard
};

