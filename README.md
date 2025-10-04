# DrTrips Weather MCP Server

TypeScript-based MCP (Model Context Protocol) server providing weather data through the OpenWeather API.

## Features

- 🌤️ **OpenWeather API Integration** - Access comprehensive weather data
- 📍 **Location-based Weather** - Get weather by coordinates (latitude/longitude)
- 📅 **Historical & Current Data** - Query weather for specific dates
- 🌡️ **Multiple Units** - Support for metric, imperial, and Kelvin units
- 🔧 **MCP Protocol** - Compatible with Claude Desktop and other MCP clients

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your OpenWeather API key to `.env`:
```
WEATHER_API_KEY=your_api_key_here
```

Get your API key from: https://openweathermap.org/api

## Usage

### Run Locally

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Run with NPX

```bash
# Install and build
npm install
npm run build

# Link globally (one-time setup)
npm link

# Run with npx
npx drtrips-weather-mcp
```

### Configure with Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "drtrips-weather": {
      "command": "node",
      "args": ["path/to/weather_mcp/dist/index.js"],
      "env": {
        "WEATHER_API_KEY": "your_api_key"
      }
    }
  }
}
```

Or with npx (after running `npm link`):

```json
{
  "mcpServers": {
    "drtrips-weather": {
      "command": "npx",
      "args": ["drtrips-weather-mcp"],
      "env": {
        "WEATHER_API_KEY": "your_api_key"
      }
    }
  }
}
```

## Available Tools

### `get_weather`

Get weather data for a specific location and date.

**Parameters:**
- `latitude` (number): Latitude coordinate (-90 to 90)
- `longitude` (number): Longitude coordinate (-180 to 180)
- `date` (string): Date in YYYY-MM-DD format
- `units` (string): Temperature units - "metric", "imperial", or "kelvin" (default: "metric")

**Example:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "date": "2024-01-15",
  "units": "metric"
}
```

**Returns:**
- Temperature (min/max/morning/afternoon/evening/night)
- Humidity
- Pressure
- Cloud cover
- Precipitation
- Wind speed and direction

## Development

```bash
# Watch mode (auto-rebuild on changes)
npm run watch

# Development with tsx
npm run dev
```

## Project Structure

```
weather_mcp/
├── src/
│   ├── config/
│   │   └── settings.ts          # Environment configuration
│   ├── models/
│   │   └── weather-models.ts    # Zod schemas and types
│   ├── services/
│   │   └── weather-api.ts       # OpenWeather API client
│   ├── server.ts                # MCP server setup
│   └── index.ts                 # Entry point (stdio transport)
├── dist/                        # Compiled JavaScript
├── package.json
├── tsconfig.json
└── .env.example
```

## Migration from Python

This project was migrated from a Python-based MCP server to TypeScript. Key changes:

- **Pydantic → Zod**: Input validation using Zod schemas
- **aiohttp → axios**: HTTP client for API requests
- **Python MCP SDK → TypeScript MCP SDK**: Using `@modelcontextprotocol/sdk`
- **stdio transport**: Compatible with Claude Desktop

See `docs/MIGRATION_GUIDE_PYTHON_TO_TYPESCRIPT.md` for detailed migration guide.

## License

MIT
