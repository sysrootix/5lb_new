/**
 * Тестовый скрипт для проверки подключения к Balance API (fransh-trade)
 * 
 * Использование:
 * 1. Скопируйте сертификат в routes/certs/terehin_n.cloud.mda-medusa.ru.p12
 * 2. Установите зависимости: npm install axios node-forge
 * 3. Запустите: node test_fransh_connection.js
 */

import axios from 'axios';
import https from 'https';
import fs from 'fs';
import path from 'path';
import forge from 'node-forge';
import { fileURLToPath } from 'url';

// Получаем __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================
// КОНФИГУРАЦИЯ ДЛЯ ФРАНШИЗЫ
// =====================================================

const FRANSH_API_CONFIG = {
  username: 'ТерехинНА',
  password: '123455123',
  apiUrl: 'https://cloud.mda-medusa.ru/fransh-trade/hs/Api/BalanceData',
  credentials: Buffer.from('ТерехинНА:123455123').toString('base64')
};

// Путь к сертификату (относительно этого файла)
const CERT_PATH = path.join(__dirname, 'terehin_n.cloud.mda-medusa.ru.p12');
const CERT_PASSWORD = '000000000';

// Код магазина для тестирования (замените на код вашего магазина)
const TEST_SHOP_ID = '13';

// =====================================================
// ФУНКЦИИ
// =====================================================

/**
 * Инициализация HTTPS агента с клиентским сертификатом
 */
function initializeHttpsAgent() {
  try {
    console.log('📜 Чтение сертификата:', CERT_PATH);
    
    if (!fs.existsSync(CERT_PATH)) {
      throw new Error(`Сертификат не найден: ${CERT_PATH}`);
    }

    const certBuffer = fs.readFileSync(CERT_PATH);
    const p12Der = forge.util.createBuffer(certBuffer.toString('binary'));
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, CERT_PASSWORD);

    // Извлекаем сертификат и приватный ключ
    let privateKey, certificate;
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

    if (certBags[forge.pki.oids.certBag] && certBags[forge.pki.oids.certBag].length) {
      certificate = forge.pki.certificateToPem(certBags[forge.pki.oids.certBag][0].cert);
      console.log('✅ Сертификат успешно извлечен');
    } else {
      throw new Error('Не удалось извлечь сертификат из .p12 файла');
    }

    if (keyBags[forge.pki.oids.pkcs8ShroudedKeyBag] && keyBags[forge.pki.oids.pkcs8ShroudedKeyBag].length) {
      privateKey = forge.pki.privateKeyToPem(keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key);
      console.log('✅ Приватный ключ успешно извлечен');
    } else {
      throw new Error('Не удалось извлечь приватный ключ из .p12 файла');
    }

    // Создаем HTTPS агент
    const httpsAgent = new https.Agent({
      rejectUnauthorized: true,
      cert: certificate,
      key: privateKey
    });

    console.log('✅ HTTPS агент успешно инициализирован\n');
    return httpsAgent;

  } catch (error) {
    console.error('❌ Ошибка при инициализации HTTPS агента:', error.message);
    return null;
  }
}

/**
 * Отправка запроса к Balance API
 */
async function sendBalanceRequest(shopId, type = 'store_data') {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🌐 ОТПРАВКА ЗАПРОСА К BALANCE API');
    console.log('='.repeat(60));
    console.log(`📍 URL: ${FRANSH_API_CONFIG.apiUrl}`);
    console.log(`🏪 Код магазина: ${shopId}`);
    console.log(`📦 Тип запроса: ${type}`);
    console.log('='.repeat(60) + '\n');

    const httpsAgent = initializeHttpsAgent();
    if (!httpsAgent) {
      throw new Error('Не удалось инициализировать HTTPS агент с сертификатом');
    }

    // Подготавливаем данные для отправки
    const requestData = {
      shop_id: shopId,
      type: type
    };

    console.log('📤 Отправляемые данные:', JSON.stringify(requestData, null, 2));

    // Подготавливаем опции запроса
    const options = {
      httpsAgent: httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${FRANSH_API_CONFIG.credentials}`
      },
      timeout: 30000 // 30 секунд
    };

    console.log('\n⏳ Отправка запроса...\n');

    // Отправляем запрос
    const startTime = Date.now();
    const response = await axios.post(FRANSH_API_CONFIG.apiUrl, requestData, options);
    const duration = Date.now() - startTime;

    console.log('\n' + '='.repeat(60));
    console.log('✅ ОТВЕТ ПОЛУЧЕН УСПЕШНО');
    console.log('='.repeat(60));
    console.log(`⏱️ Время выполнения: ${duration}ms`);
    console.log(`📊 HTTP статус: ${response.status} ${response.statusText}`);
    console.log('='.repeat(60) + '\n');

    // Анализ ответа
    if (response.data) {
      console.log('📦 Структура ответа:');
      
      if (response.data.status) {
        console.log(`   Статус: ${response.data.status}`);
      }
      
      if (response.data.message) {
        console.log(`   Сообщение: ${response.data.message}`);
      }

      if (response.data.data) {
        const data = response.data.data;
        console.log(`   Название магазина: ${data.shopname || 'не указано'}`);
        
        if (data.items && Array.isArray(data.items)) {
          console.log(`   Категорий в каталоге: ${data.items.length}`);
          
          // Подсчет товаров
          let totalProducts = 0;
          const countProducts = (items) => {
            for (const item of items) {
              if (item.items && Array.isArray(item.items)) {
                // Проверяем, это подкатегория или товары
                const hasSubcategories = item.items.some(subitem => 
                  subitem.items && Array.isArray(subitem.items)
                );
                
                if (hasSubcategories) {
                  countProducts(item.items);
                } else {
                  totalProducts += item.items.length;
                }
              }
            }
          };
          
          countProducts(data.items);
          console.log(`   Примерное количество товаров: ${totalProducts}`);
        }
      }

      console.log('\n📄 Первые 500 символов ответа:');
      console.log(JSON.stringify(response.data, null, 2).slice(0, 500));
      console.log('...\n');

      return {
        success: true,
        data: response.data,
        duration: duration
      };
    } else {
      console.warn('⚠️ Получен пустой ответ от API');
      return {
        success: false,
        message: 'Получен пустой ответ от API'
      };
    }

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ ОШИБКА ПРИ ОТПРАВКЕ ЗАПРОСА');
    console.error('='.repeat(60));
    console.error(`💥 Сообщение: ${error.message}`);

    if (error.response) {
      console.error(`📥 HTTP статус: ${error.response.status}`);
      console.error(`📥 Данные ответа:`, JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('📡 Запрос был отправлен, но ответ не получен');
      console.error('   Возможные причины:');
      console.error('   - Сервер недоступен');
      console.error('   - Проблемы с сетью');
      console.error('   - Таймаут соединения');
    } else {
      console.error('⚙️ Ошибка при настройке запроса');
    }

    if (error.code) {
      console.error(`🔢 Код ошибки: ${error.code}`);
    }

    console.error('='.repeat(60) + '\n');

    return {
      success: false,
      message: error.message,
      error: error
    };
  }
}

/**
 * Сравнение конфигурации mda-trade и fransh-trade
 */
function showConfigComparison() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 СРАВНЕНИЕ КОНФИГУРАЦИЙ');
  console.log('='.repeat(60));
  
  const mdaUrl = 'https://cloud.mda-medusa.ru/mda-trade/hs/Api/BalanceData';
  const franshUrl = FRANSH_API_CONFIG.apiUrl;
  
  console.log('\n🏢 MDA Trade (основная база):');
  console.log(`   URL: ${mdaUrl}`);
  
  console.log('\n🏪 Fransh Trade (франшиза):');
  console.log(`   URL: ${franshUrl}`);
  
  console.log('\n🔄 Различие:');
  console.log(`   mda-trade → fransh-trade`);
  
  console.log('\n✅ Одинаковые параметры:');
  console.log(`   - Username: ${FRANSH_API_CONFIG.username}`);
  console.log(`   - Password: ${FRANSH_API_CONFIG.password}`);
  console.log(`   - Сертификат: terehin_n.cloud.mda-medusa.ru.p12`);
  console.log(`   - Пароль сертификата: ${CERT_PASSWORD}`);
  
  console.log('='.repeat(60) + '\n');
}

/**
 * Проверка наличия сертификата
 */
function checkCertificate() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 ПРОВЕРКА СЕРТИФИКАТА');
  console.log('='.repeat(60));
  
  console.log(`📂 Путь: ${CERT_PATH}`);
  
  if (fs.existsSync(CERT_PATH)) {
    const stats = fs.statSync(CERT_PATH);
    console.log(`✅ Сертификат найден`);
    console.log(`📊 Размер: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`📅 Изменен: ${stats.mtime.toLocaleString('ru-RU')}`);
  } else {
    console.log(`❌ Сертификат НЕ найден!`);
    console.log(`\nИнструкция:`);
    console.log(`1. Скопируйте файл terehin_n.cloud.mda-medusa.ru.p12`);
    console.log(`2. Поместите его в директорию с этим скриптом`);
  }
  
  console.log('='.repeat(60) + '\n');
}

/**
 * Главная функция тестирования
 */
async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  ТЕСТИРОВАНИЕ ПОДКЛЮЧЕНИЯ К FRANSH-TRADE API              ║');
  console.log('║  Дата: ' + new Date().toLocaleString('ru-RU').padEnd(50) + '║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  // Шаг 1: Проверка сертификата
  checkCertificate();
  
  if (!fs.existsSync(CERT_PATH)) {
    console.error('❌ Прерывание: сертификат не найден\n');
    process.exit(1);
  }
  
  // Шаг 2: Сравнение конфигураций
  showConfigComparison();
  
  // Шаг 3: Тестирование подключения
  console.log('🚀 Начинаем тестирование подключения...\n');
  
  const result = await sendBalanceRequest(TEST_SHOP_ID, 'store_data');
  
  // Итоговый результат
  console.log('\n' + '═'.repeat(60));
  console.log('📊 ИТОГОВЫЙ РЕЗУЛЬТАТ');
  console.log('═'.repeat(60));
  
  if (result.success) {
    console.log('✅ ТЕСТ ПРОЙДЕН УСПЕШНО!');
    console.log(`⏱️ Время выполнения: ${result.duration}ms`);
    console.log('\n🎉 Подключение к fransh-trade API работает корректно!');
    console.log('   Можно переходить к интеграции в основной проект.');
  } else {
    console.log('❌ ТЕСТ НЕ ПРОЙДЕН');
    console.log(`💔 Причина: ${result.message}`);
    console.log('\n🔧 Рекомендации:');
    console.log('   1. Проверьте URL API (должен быть fransh-trade)');
    console.log('   2. Убедитесь что credentials корректные');
    console.log('   3. Проверьте что магазин существует в fransh-trade базе');
    console.log('   4. Проверьте сертификат и пароль');
  }
  
  console.log('═'.repeat(60) + '\n');
}

// Запуск тестирования
main().catch(error => {
  console.error('\n💥 Критическая ошибка:', error);
  process.exit(1);
});

