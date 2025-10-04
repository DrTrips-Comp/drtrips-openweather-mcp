import axios, { AxiosError } from 'axios';
import type { WeatherResponse, TemperatureData } from '../models/weather-models.js';
import { WEATHER_API_KEY, WEATHER_BASE_URL, TIMEOUT } from '../config/settings.js';

/**
 * Weather API client for OpenWeather API
 * Migrated from Python aiohttp implementation to TypeScript axios
 */
export class WeatherAPI {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor() {
    this.apiKey = WEATHER_API_KEY;
    this.baseUrl = WEATHER_BASE_URL;
    this.timeout = TIMEOUT;
  }

  /**
   * Get weather data for a specific location and date
   */
  async getWeather(
    lat: number,
    lon: number,
    date: string,
    units: string = 'metric'
  ): Promise<WeatherResponse> {
    if (!this.apiKey) {
      return {
        status: 'ERROR',
        error_message: 'Weather API key not configured. Please set WEATHER_API_KEY environment variable.'
      };
    }

    try {
      // Input validation
      if (lat < -90 || lat > 90) {
        return {
          status: 'ERROR',
          error_message: 'Latitude must be between -90 and 90'
        };
      }

      if (lon < -180 || lon > 180) {
        return {
          status: 'ERROR',
          error_message: 'Longitude must be between -180 and 180'
        };
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return {
          status: 'ERROR',
          error_message: 'Date must be in YYYY-MM-DD format'
        };
      }

      // Build parameters
      const params = {
        lat,
        lon,
        date,
        appid: this.apiKey,
        units
      };

      // Make API request
      const response = await axios.get(this.baseUrl, {
        params,
        timeout: this.timeout
      });

      if (response.status !== 200) {
        let errorMessage = `Request failed with status code ${response.status}`;
        if (response.data?.message) {
          errorMessage = response.data.message;
        }
        return {
          status: 'ERROR',
          error_message: errorMessage
        };
      }

      // Format the response
      const formattedData = this.formatWeatherData(response.data, lat, lon, date, units);
      return {
        status: 'OK',
        ...formattedData
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        let errorMessage = `Request failed: ${axiosError.message}`;

        if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
          const data = axiosError.response.data as any;
          if (data.message) {
            errorMessage = data.message;
          }
        }

        return {
          status: 'ERROR',
          error_message: errorMessage
        };
      }

      return {
        status: 'ERROR',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Format weather data response to match Python implementation structure
   */
  private formatWeatherData(
    data: any,
    lat: number,
    lon: number,
    date: string,
    units: string
  ): Omit<WeatherResponse, 'status'> {
    try {
      // Get unit symbols
      const tempUnit = units === 'metric' ? '°C' : units === 'imperial' ? '°F' : 'K';
      const speedUnit = units === 'metric' ? 'm/s' : units === 'imperial' ? 'mph' : 'm/s';

      // Extract temperature data
      const temperatureData = data.temperature || {};

      // Extract other weather data
      const humidity = data.humidity || {};
      const pressure = data.pressure || {};
      const cloudCover = data.cloud_cover || {};
      const precipitation = data.precipitation || {};
      const wind = data.wind || {};

      // Format response
      return {
        location: {
          latitude: lat,
          longitude: lon,
          timezone: data.timezone || '+00:00'
        },
        date,
        units,
        temperature: {
          min: {
            value: temperatureData.min || 0,
            unit: tempUnit
          },
          max: {
            value: temperatureData.max || 0,
            unit: tempUnit
          },
          morning: {
            value: temperatureData.morning || 0,
            unit: tempUnit
          },
          afternoon: {
            value: temperatureData.afternoon || 0,
            unit: tempUnit
          },
          evening: {
            value: temperatureData.evening || 0,
            unit: tempUnit
          },
          night: {
            value: temperatureData.night || 0,
            unit: tempUnit
          }
        },
        humidity: {
          afternoon: humidity.afternoon || 0,
          unit: '%'
        },
        pressure: {
          afternoon: pressure.afternoon || 0,
          unit: 'hPa'
        },
        cloud_cover: {
          afternoon: cloudCover.afternoon || 0,
          unit: '%'
        },
        precipitation: {
          total: precipitation.total || 0,
          unit: 'mm'
        },
        wind: {
          max: {
            speed: wind.max?.speed || 0,
            direction: wind.max?.direction || 0,
            speed_unit: speedUnit,
            direction_unit: 'degrees'
          }
        }
      };
    } catch (error) {
      console.error('Error formatting weather data:', error);
      return {
        location: { latitude: lat, longitude: lon, timezone: '+00:00' },
        date,
        units,
        error_message: `Error formatting weather data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
