import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { WeatherInputSchema } from './models/weather-models.js';
import { WeatherAPI } from './services/weather-api.js';

/**
 * Create MCP server for weather data
 */
export function createMcpServer(): Server {
  const server = new Server(
    {
      name: 'drtrips-weather-mcp',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  const weatherAPI = new WeatherAPI();
  let totalRequests = 0;

  // Register tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'get_weather',
        description: 'Get weather data for a specific location and date using OpenWeather API. Returns temperature, humidity, pressure, wind, precipitation, and cloud cover information.',
        inputSchema: zodToJsonSchema(WeatherInputSchema) as any
      }
    ]
  }));

  // Register tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'get_weather') {
      try {
        // Increment request counter
        totalRequests++;

        // Validate input
        const validated = WeatherInputSchema.parse(args);

        // Call weather API
        const result = await weatherAPI.getWeather(
          validated.latitude,
          validated.longitude,
          validated.date,
          validated.units
        );

        // Check for API errors
        if (result.status === 'ERROR') {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Weather API Error: ${result.error_message}`
              }
            ],
            isError: true
          } as any;
        }

        // Format successful response
        let weatherText = `🌤️ WEATHER DATA\\n`;
        weatherText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n`;
        weatherText += `📍 Location: ${result.location?.latitude}, ${result.location?.longitude}\\n`;
        weatherText += `📅 Date: ${result.date}\\n`;
        weatherText += `🕐 Timezone: ${result.location?.timezone}\\n`;
        weatherText += `📏 Units: ${result.units}\\n\\n`;

        if (result.temperature) {
          weatherText += `🌡️ TEMPERATURE:\\n`;
          weatherText += `   Min: ${result.temperature.min.value}${result.temperature.min.unit}\\n`;
          weatherText += `   Max: ${result.temperature.max.value}${result.temperature.max.unit}\\n`;
          weatherText += `   Morning: ${result.temperature.morning.value}${result.temperature.morning.unit}\\n`;
          weatherText += `   Afternoon: ${result.temperature.afternoon.value}${result.temperature.afternoon.unit}\\n`;
          weatherText += `   Evening: ${result.temperature.evening.value}${result.temperature.evening.unit}\\n`;
          weatherText += `   Night: ${result.temperature.night.value}${result.temperature.night.unit}\\n\\n`;
        }

        if (result.humidity) {
          weatherText += `💧 HUMIDITY:\\n`;
          weatherText += `   Afternoon: ${result.humidity.afternoon}${result.humidity.unit}\\n\\n`;
        }

        if (result.pressure) {
          weatherText += `🔽 PRESSURE:\\n`;
          weatherText += `   Afternoon: ${result.pressure.afternoon} ${result.pressure.unit}\\n\\n`;
        }

        if (result.cloud_cover) {
          weatherText += `☁️ CLOUD COVER:\\n`;
          weatherText += `   Afternoon: ${result.cloud_cover.afternoon}${result.cloud_cover.unit}\\n\\n`;
        }

        if (result.precipitation) {
          weatherText += `🌧️ PRECIPITATION:\\n`;
          weatherText += `   Total: ${result.precipitation.total} ${result.precipitation.unit}\\n\\n`;
        }

        if (result.wind) {
          weatherText += `💨 WIND:\\n`;
          weatherText += `   Max Speed: ${result.wind.max.speed} ${result.wind.max.speed_unit}\\n`;
          weatherText += `   Direction: ${result.wind.max.direction} ${result.wind.max.direction_unit}\\n`;
        }

        // Return with metadata
        return {
          content: [
            {
              type: 'text',
              text: weatherText
            }
          ],
          metadata: {
            location: result.location,
            date: result.date,
            units: result.units,
            total_requests: totalRequests
          }
        } as any;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error: ${errorMessage}`
            }
          ],
          isError: true
        } as any;
      }
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  return server;
}
