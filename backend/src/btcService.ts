import axios from 'axios';
import { query } from './db';

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';

export async function fetchAndSavePrice() {
  try {
    const response = await axios.get(COINGECKO_API);
    const price = response.data.bitcoin.usd;
    const timestamp = new Date();

    await query(
      'INSERT INTO prices (price, timestamp) VALUES ($1, $2) ON CONFLICT (timestamp) DO NOTHING;',
      [price, timestamp]
    );

    console.log(`Saved price $${price} at ${timestamp.toISOString()}`);
  } catch (error) {
    console.error('Error fetching or saving price:', error);
  }
}
