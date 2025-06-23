import 'dotenv/config'; // Загружаем переменные окружения
import axios from 'axios';
import { Pool } from 'pg';
const API_KEY = 'CG-XfAHEdpANL4LihbKpPo2Cgze'; 

async function run() {
  // Создаем подключение к базе данных
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'btc_prices',
    password: '122224428',
    port: 5432
  });

  console.log('⏳ Запрос исторических данных у CoinGecko...');
  try {
    // Запрос к API для получения данных
    const res = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart', {
      params: {
        vs_currency: 'usd',
        days: '365',
      },
    });

    // Логируем результат запроса, чтобы увидеть данные
    console.log('API response received:', res.data);

    // Получаем данные о ценах
    const prices: [number, number][] = res.data.prices;
    console.log(`✅ Получено точек: ${prices.length}`);

    let inserted = 0;
    
    // Проходим по каждой точке и вставляем в базу
    for (const [ts, price] of prices) {
      const timestamp = new Date(ts).toISOString();
      
      // Логируем, что отправляем в запрос
      console.log(`Вставка данных: timestamp = ${timestamp}, price = ${price}`);
      
      const r = await pool.query(
        `INSERT INTO prices (timestamp, price)
         VALUES ($1, $2)
         ON CONFLICT (timestamp) DO NOTHING`,
        [timestamp, price]
      );

      if (r.rowCount) {
        inserted++;
        console.log(`✅ Запись добавлена для timestamp: ${timestamp}`);
      } else {
        console.log(`⚠️ Запись не добавлена для timestamp: ${timestamp}`);
      }
    }

    console.log(`✅ Добавлено новых записей: ${inserted}`);
  } catch (error) {
    console.error('Ошибка при запросе к API или вставке данных:', error);
  } finally {
    await pool.end();
  }
}

run().catch(console.error);
