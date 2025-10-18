# DrTrips OpenWeather MCP Server

A Model Context Protocol (MCP) server that provides comprehensive weather data through the OpenWeather API. Built with TypeScript and the official MCP SDK.

[![MCP](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Features

- 🌤️ **Comprehensive Weather Data** - Temperature, humidity, pressure, wind, precipitation, and cloud cover
- 📍 **Location-Based Queries** - Support for any geographic coordinates (latitude/longitude)
- 📅 **Historical & Current Data** - Query weather for specific dates
- 🌡️ **Multiple Units** - Metric (Celsius), Imperial (Fahrenheit), and Kelvin
- 📊 **Flexible Output** - JSON for programmatic use, Markdown for human readability
- 🔧 **MCP Standard Compliant** - Full compatibility with Claude Desktop and other MCP clients
- ✅ **Type-Safe** - Built with TypeScript and Zod validation
- 🚀 **Production Ready** - Comprehensive error handling and input validation

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- OpenWeather API key ([Get one free](https://openweathermap.org/api))

### Install via npm

```bash
npm install -g drtrips-openweather-mcp-server
```

### Install from source

```bash
git clone https://github.com/drtrips/drtrips-openweather-mcp.git
cd drtrips-openweather-mcp
npm install
npm run build
```

## Configuration

### 1. Get OpenWeather API Key

Sign up at [OpenWeather](https://openweathermap.org/api) to get a free API key.

### 2. Configure Claude Desktop

Add the server to your Claude Desktop configuration file:

**Location of config file:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Configuration:**

```json
{
  "mcpServers": {
    "drtrips-openweather": {
      "command": "npx",
      "args": ["drtrips-openweather-mcp-server"],
      "env": {
        "WEATHER_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**For local development:**

```json
{
  "mcpServers": {
    "drtrips-openweather": {
      "command": "node",
      "args": ["/absolute/path/to/drtrips-openweather-mcp/dist/index.js"],
      "env": {
        "WEATHER_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

After updating the configuration, restart Claude Desktop to load the MCP server.

## Available Tools

### `openweather_get_weather`

Retrieves comprehensive weather data for a specific location and date.

**Tool Metadata:**
- **Type**: Read-only operation
- **Idempotent**: Yes (same inputs produce same outputs)
- **External API**: Yes (calls OpenWeather API)
- **Destructive**: No

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `latitude` | number | Yes | - | Latitude coordinate between -90 and 90 (e.g., 40.7128 for NYC) |
| `longitude` | number | Yes | - | Longitude coordinate between -180 and 180 (e.g., -74.0060 for NYC) |
| `date` | string | Yes | - | Date in YYYY-MM-DD format (e.g., "2024-01-15") |
| `units` | string | No | "metric" | Temperature units: "metric" (Celsius), "imperial" (Fahrenheit), or "kelvin" |
| `response_format` | string | No | "markdown" | Output format: "markdown" (human-readable) or "json" (structured data) |

#### Return Value

**Markdown Format (default):**

Returns human-readable formatted text with the following sections:
- Location (latitude, longitude, timezone)
- Date
- Units
- Temperature (min, max, morning, afternoon, evening, night)
- Humidity (afternoon percentage)
- Pressure (afternoon in hPa)
- Cloud Cover (afternoon percentage)
- Precipitation (total in mm)
- Wind (max speed and direction)

**JSON Format:**

Returns structured data object:

```typescript
{
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  date: string;
  units: string;
  temperature: {
    min: { value: number; unit: string };
    max: { value: number; unit: string };
    morning: { value: number; unit: string };
    afternoon: { value: number; unit: string };
    evening: { value: number; unit: string };
    night: { value: number; unit: string };
  };
  humidity: {
    afternoon: number;
    unit: string;  // Always "%"
  };
  pressure: {
    afternoon: number;
    unit: string;  // Always "hPa"
  };
  cloud_cover: {
    afternoon: number;
    unit: string;  // Always "%"
  };
  precipitation: {
    total: number;
    unit: string;  // Always "mm"
  };
  wind: {
    max: {
      speed: number;
      direction: number;
      speed_unit: string;  // "m/s" for metric, "mph" for imperial
      direction_unit: string;  // Always "degrees"
    };
  };
}
```

#### Example Usage

**Example 1: Get current weather in New York (Markdown)**

```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "date": "2024-01-15",
  "units": "metric"
}
```

**Output:**
```markdown
# Weather Data

**Location**: 40.7128, -74.006
**Date**: 2024-01-15
**Timezone**: -05:00
**Units**: metric

## Temperature
- Min: 2.5°C
- Max: 8.3°C
- Morning: 3.2°C
- Afternoon: 7.8°C
- Evening: 6.1°C
- Night: 4.2°C

## Humidity
- Afternoon: 68%

## Pressure
- Afternoon: 1013 hPa

## Cloud Cover
- Afternoon: 45%

## Precipitation
- Total: 2.3 mm

## Wind
- Max Speed: 5.2 m/s
- Direction: 270 degrees
```

**Example 2: Get weather data in JSON for programmatic processing**

```json
{
  "latitude": 51.5074,
  "longitude": -0.1278,
  "date": "2024-03-20",
  "units": "imperial",
  "response_format": "json"
}
```

**Output:**
```json
{
  "location": {
    "latitude": 51.5074,
    "longitude": -0.1278,
    "timezone": "+00:00"
  },
  "date": "2024-03-20",
  "units": "imperial",
  "temperature": {
    "min": { "value": 45.2, "unit": "°F" },
    "max": { "value": 58.6, "unit": "°F" },
    "morning": { "value": 47.3, "unit": "°F" },
    "afternoon": { "value": 56.8, "unit": "°F" },
    "evening": { "value": 52.1, "unit": "°F" },
    "night": { "value": 48.9, "unit": "°F" }
  },
  "humidity": {
    "afternoon": 72,
    "unit": "%"
  },
  "pressure": {
    "afternoon": 1018,
    "unit": "hPa"
  },
  "cloud_cover": {
    "afternoon": 65,
    "unit": "%"
  },
  "precipitation": {
    "total": 1.2,
    "unit": "mm"
  },
  "wind": {
    "max": {
      "speed": 12.5,
      "direction": 180,
      "speed_unit": "mph",
      "direction_unit": "degrees"
    }
  }
}
```

**Example 3: Compare temperatures across different locations**

First, query Tokyo:
```json
{
  "latitude": 35.6762,
  "longitude": 139.6503,
  "date": "2024-02-10",
  "units": "metric",
  "response_format": "json"
}
```

Then, query Paris:
```json
{
  "latitude": 48.8566,
  "longitude": 2.3522,
  "date": "2024-02-10",
  "units": "metric",
  "response_format": "json"
}
```

Use the JSON responses to compare afternoon temperatures, humidity levels, or any other metrics.

#### Error Handling

The tool returns clear, actionable error messages:

| Error | Description | Solution |
|-------|-------------|----------|
| `Weather API key not configured` | WEATHER_API_KEY environment variable is not set | Set the API key in your MCP configuration |
| `Latitude must be between -90 and 90` | Invalid latitude coordinate | Provide latitude between -90 (South Pole) and 90 (North Pole) |
| `Longitude must be between -180 and 180` | Invalid longitude coordinate | Provide longitude between -180 and 180 |
| `Date must be in YYYY-MM-DD format` | Malformed date string | Use format: YYYY-MM-DD (e.g., "2024-01-15") |
| API-specific errors | Network or service failures | Check API key validity and network connection |

## Development

### Project Structure

```
drtrips-openweather-mcp/
├── src/
│   ├── index.ts              # Entry point with stdio transport
│   ├── server.ts             # MCP server and tool registration
│   ├── models/
│   │   └── weather-models.ts # Zod schemas and TypeScript types
│   ├── services/
│   │   └── weather-api.ts    # OpenWeather API client
│   └── config/
│       └── settings.ts       # Environment configuration
├── dist/                     # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

### Building from Source

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Watch mode for development
npm run watch

# Start the server
npm start
```

### Running Tests

```bash
# Run basic tool registration test
node test-tool.js
```

## API Reference

This server uses the [OpenWeather One Call API 3.0](https://openweathermap.org/api/one-call-3) Day Summary endpoint.

**Endpoint:** `https://api.openweathermap.org/data/3.0/onecall/day_summary`

**Rate Limits:**
- Free tier: 1,000 calls/day
- Response time: < 1 second

## Troubleshooting

### Server not appearing in Claude Desktop

1. Check the configuration file path
2. Verify JSON syntax is valid
3. Ensure the API key is set in the `env` section
4. Restart Claude Desktop after config changes

### "Weather API key not configured" error

Make sure `WEATHER_API_KEY` is set in your MCP server configuration:

```json
"env": {
  "WEATHER_API_KEY": "your_actual_key_here"
}
```

### Build errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- Weather data provided by [OpenWeather](https://openweathermap.org/)
- TypeScript validation with [Zod](https://github.com/colinhacks/zod)

## Support

- Documentation: [Model Context Protocol](https://modelcontextprotocol.io)
- Issues: [GitHub Issues](https://github.com/drtrips/drtrips-openweather-mcp/issues)
- OpenWeather API Docs: [OpenWeather Documentation](https://openweathermap.org/api)

## Changelog

### v1.0.1 (2025-10-18)
- Enhanced README with comprehensive documentation
- Added detailed tool output examples with metadata
- Improved error handling descriptions
- Added professional MCP standards compliance

### v1.0.0 (2024-10-12)
- Initial release
- Basic weather data retrieval
- Support for metric, imperial, and kelvin units
