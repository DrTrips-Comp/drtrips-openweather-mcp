import { z } from 'zod';

/**
 * Input schema for weather data requests
 * Mirrors the Python WeatherInput Pydantic model
 */
export const WeatherInputSchema = z.object({
  latitude: z.number().min(-90).max(90).describe('Latitude coordinate'),
  longitude: z.number().min(-180).max(180).describe('Longitude coordinate'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Date in YYYY-MM-DD format'),
  units: z.enum(['metric', 'imperial', 'kelvin']).default('metric').describe('Temperature units')
});

export type WeatherInput = z.infer<typeof WeatherInputSchema>;

/**
 * Temperature data structure
 */
export interface TemperatureData {
  min: { value: number; unit: string };
  max: { value: number; unit: string };
  morning: { value: number; unit: string };
  afternoon: { value: number; unit: string };
  evening: { value: number; unit: string };
  night: { value: number; unit: string };
}

/**
 * Weather API response structure
 */
export interface WeatherResponse {
  status: 'OK' | 'ERROR';
  error_message?: string;
  location?: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  date?: string;
  units?: string;
  temperature?: TemperatureData;
  humidity?: {
    afternoon: number;
    unit: string;
  };
  pressure?: {
    afternoon: number;
    unit: string;
  };
  cloud_cover?: {
    afternoon: number;
    unit: string;
  };
  precipitation?: {
    total: number;
    unit: string;
  };
  wind?: {
    max: {
      speed: number;
      direction: number;
      speed_unit: string;
      direction_unit: string;
    };
  };
}
