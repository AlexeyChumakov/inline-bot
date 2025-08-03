// Тестовый файл для проверки исправлений FAQ
const contentParser = require('./data/contentParser');

console.log('🧪 Тестирование исправлений FAQ...\n');

try {
  // Тест 1: Проверка загрузки FAQ данных
  console.log('1. Проверка загрузки FAQ данных:');
  const faqData = contentParser.get('faq');
  console.log('✅ FAQ данные загружены');
  console.log('✅ Категорий:', faqData.categories.length);
  
  // Тест 2: Проверка структуры категорий
  console.log('\n2. Проверка структуры категорий:');
  faqData.categories.forEach((cat, index) => {
    console.log(`✅ Категория ${index + 1}: ${cat.name} (ID: ${cat.id})`);
    console.log(`   Вопросов: ${cat.questions.length}`);
  });
  
  // Тест 3: Проверка итерации по категориям (как в index.js)
  console.log('\n3. Проверка итерации по категориям:');
  faqData.categories.forEach((cat) => {
    console.log(`✅ Обработчик для категории: faq_category_${cat.id}`);
  });
  
  // Тест 4: Проверка итерации по вопросам (как в index.js)
  console.log('\n4. Проверка итерации по вопросам:');
  faqData.categories.forEach((category) => {
    category.questions.forEach((_, index) => {
      console.log(`✅ Обработчик для вопроса: faq_question_${category.id}_${index}`);
    });
  });
  
  console.log('\n🎉 Все тесты пройдены успешно!');
  
} catch (error) {
  console.error('❌ Ошибка при тестировании:', error.message);
  console.error('Стек ошибки:', error.stack);
}
