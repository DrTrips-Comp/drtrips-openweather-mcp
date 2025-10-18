import { z } from 'zod';

/**
 * Response format enum for output options
 */
export enum ResponseFormat {
  MARKDOWN = 'markdown',
  JSON = 'json'
}

/**
 * Input schema for weather data requests
 * Enhanced with detailed descriptions and strict validation
 */
export const WeatherInputSchema = z.object({
  latitude: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .describe('Latitude coordinate between -90 and 90 (e.g., 40.7128 for New York City)'),
  longitude: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .describe('Longitude coordinate between -180 and 180 (e.g., -74.0060 for New York City)'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .describe('Date in YYYY-MM-DD format (e.g., "2024-01-15")'),
  units: z.enum(['metric', 'imperial', 'kelvin'])
    .default('metric')
    .describe('Temperature units: "metric" (Celsius), "imperial" (Fahrenheit), or "kelvin"'),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe('Output format: "markdown" for human-readable text or "json" for structured data')
}).strict();

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
