import express from 'express';
import { query } from './db';
import cors from 'cors';
import 'dotenv/config';
import { pool } from './db';
import { fetchAndSavePrice } from './btcService';

const app = express();
const port = 3001;

const corsOptions = {
  origin: 'http://localhost:3000',  // Фронтенд должен быть доступен на порту 3000
  methods: 'GET,POST,PUT,DELETE',  // Разрешенные методы
  allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));
app.use(express.json());

pool.query('SELECT NOW()')
  .then(res => console.log('✅ Подключение к PostgreSQL установлено:', res.rows[0]))
  .catch(err => console.error('❌ Ошибка подключения к PostgreSQL:', err));

// API для получения цен за период
app.get('/api/prices', async (req, res) => {
  const { start, end } = req.query;

  // Проверяем, что start и end - строки
  if (typeof start !== 'string' || typeof end !== 'string') {
    return res.status(400).json({ error: 'Start and end query params must be strings' });
  }

  // console.log(`Received start: ${start}, end: ${end}`);

  // Преобразуем строки в объекты Date и проверяем их на валидность
  const startUTC = new Date(start);
  const endUTC = new Date(end);

  // Проверяем, что это валидные даты
  if (isNaN(startUTC.getTime()) || isNaN(endUTC.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  try {
    const result = await query(
      'SELECT * FROM prices WHERE timestamp BETWEEN $1 AND $2 ORDER BY timestamp ASC',
      [startUTC.toISOString(), endUTC.toISOString()]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});
app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
  fetchAndSavePrice(); // старт сразу
});
