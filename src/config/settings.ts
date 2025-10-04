import dotenv from 'dotenv';

dotenv.config();

export const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
export const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall/day_summary';
export const TIMEOUT = 30000; // 30 seconds

if (!WEATHER_API_KEY) {
  console.error('Warning: WEATHER_API_KEY not set in environment variables');
}
