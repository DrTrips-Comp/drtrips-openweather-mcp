import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WeatherInputSchema, WeatherInput, ResponseFormat } from './models/weather-models.js';
import { WeatherAPI } from './services/weather-api.js';
import type { WeatherResponse } from './models/weather-models.js';

/**
 * Format weather data as Markdown for human-readable output
 */
function formatWeatherMarkdown(result: WeatherResponse): string {
  let weatherText = `# Weather Data\n\n`;
  weatherText += `**Location**: ${result.location?.latitude}, ${result.location?.longitude}\n`;
  weatherText += `**Date**: ${result.date}\n`;
  weatherText += `**Timezone**: ${result.location?.timezone}\n`;
  weatherText += `**Units**: ${result.units}\n\n`;

  if (result.temperature) {
    weatherText += `## Temperature\n`;
    weatherText += `- Min: ${result.temperature.min.value}${result.temperature.min.unit}\n`;
    weatherText += `- Max: ${result.temperature.max.value}${result.temperature.max.unit}\n`;
    weatherText += `- Morning: ${result.temperature.morning.value}${result.temperature.morning.unit}\n`;
    weatherText += `- Afternoon: ${result.temperature.afternoon.value}${result.temperature.afternoon.unit}\n`;
    weatherText += `- Evening: ${result.temperature.evening.value}${result.temperature.evening.unit}\n`;
    weatherText += `- Night: ${result.temperature.night.value}${result.temperature.night.unit}\n\n`;
  }

  if (result.humidity) {
    weatherText += `## Humidity\n`;
    weatherText += `- Afternoon: ${result.humidity.afternoon}${result.humidity.unit}\n\n`;
  }

  if (result.pressure) {
    weatherText += `## Pressure\n`;
    weatherText += `- Afternoon: ${result.pressure.afternoon} ${result.pressure.unit}\n\n`;
  }

  if (result.cloud_cover) {
    weatherText += `## Cloud Cover\n`;
    weatherText += `- Afternoon: ${result.cloud_cover.afternoon}${result.cloud_cover.unit}\n\n`;
  }

  if (result.precipitation) {
    weatherText += `## Precipitation\n`;
    weatherText += `- Total: ${result.precipitation.total} ${result.precipitation.unit}\n\n`;
  }

  if (result.wind) {
    weatherText += `## Wind\n`;
    weatherText += `- Max Speed: ${result.wind.max.speed} ${result.wind.max.speed_unit}\n`;
    weatherText += `- Direction: ${result.wind.max.direction} ${result.wind.max.direction_unit}\n`;
  }

  return weatherText;
}

/**
 * Format weather data as JSON for structured output
 */
function formatWeatherJSON(result: WeatherResponse): string {
  const jsonData = {
    location: result.location,
    date: result.date,
    units: result.units,
    temperature: result.temperature,
    humidity: result.humidity,
    pressure: result.pressure,
    cloud_cover: result.cloud_cover,
    precipitation: result.precipitation,
    wind: result.wind
  };

  return JSON.stringify(jsonData, null, 2);
}

/**
 * Create MCP server for weather data
 */
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'drtrips-openweather-mcp',
    version: '1.0.0'
  });

  const weatherAPI = new WeatherAPI();

  // Register the weather tool using modern pattern
  server.registerTool(
    'openweather_get_weather',
    {
      title: 'Get OpenWeather Data',
      description:
    `Get historical or current weather data for a specific location using OpenWeather API.

This tool retrieves comprehensive weather information including temperature, humidity, pressure,
wind, precipitation, and cloud cover for any geographic coordinates on a specified date.

Args:
  - latitude (number): Latitude coordinate between -90 and 90 (e.g., 40.7128 for New York City)
  - longitude (number): Longitude coordinate between -180 and 180 (e.g., -74.0060 for New York City)
  - date (string): Date in YYYY-MM-DD format (e.g., "2024-01-15")
  - units (string): Temperature units - "metric" (Celsius), "imperial" (Fahrenheit), or "kelvin" (default: "metric")
  - response_format (string): Output format - "markdown" for human-readable or "json" for structured data (default: "markdown")

Returns:
  For JSON format: Structured object with complete weather data including:
  {
    "location": { "latitude": number, "longitude": number, "timezone": string },
    "date": string,
    "units": string,
    "temperature": {
      "min": { "value": number, "unit": string },
      "max": { "value": number, "unit": string },
      "morning": { "value": number, "unit": string },
      "afternoon": { "value": number, "unit": string },
      "evening": { "value": number, "unit": string },
      "night": { "value": number, "unit": string }
    },
    "humidity": { "afternoon": number, "unit": "%" },
    "pressure": { "afternoon": number, "unit": "hPa" },
    "cloud_cover": { "afternoon": number, "unit": "%" },
    "precipitation": { "total": number, "unit": "mm" },
    "wind": {
      "max": { "speed": number, "direction": number, "speed_unit": string, "direction_unit": "degrees" }
    }
  }

  For Markdown format: Human-readable formatted text with headers and sections.

Examples:
  - Use when: "What was the weather in Paris on January 1st, 2024?"
    → params: {latitude: 48.8566, longitude: 2.3522, date: "2024-01-01"}
  - Use when: "Get temperature data for Tokyo today in Fahrenheit"
    → params: {latitude: 35.6762, longitude: 139.6503, date: "2025-10-18", units: "imperial"}
  - Use when: "Show me weather data in JSON for analysis"
    → params: {..., response_format: "json"}
  - Don't use when: Need real-time forecasts or multi-day predictions (this provides single-day historical/current data only)

Error Handling:
  - Returns "Weather API key not configured" if WEATHER_API_KEY environment variable is not set
  - Returns "Latitude must be between -90 and 90" for invalid latitude coordinates
  - Returns "Longitude must be between -180 and 180" for invalid longitude coordinates
  - Returns "Date must be in YYYY-MM-DD format" for malformed date strings
  - Returns specific API error messages for network or service failures`,
      inputSchema: WeatherInputSchema.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: WeatherInput) => {
      try {
        // Call weather API
        const result = await weatherAPI.getWeather(
          params.latitude,
          params.longitude,
          params.date,
          params.units
        );

        // Check for API errors
        if (result.status === 'ERROR') {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.error_message}`
              }
            ],
            isError: true
          };
        }

        // Format response based on requested format
        let responseText: string;
        if (params.response_format === ResponseFormat.JSON) {
          responseText = formatWeatherJSON(result);
        } else {
          responseText = formatWeatherMarkdown(result);
        }

        return {
          content: [
            {
              type: 'text',
              text: responseText
            }
          ]
        };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`
            }
          ],
          isError: true
        };
      }
    }
  );

  return server;
}
