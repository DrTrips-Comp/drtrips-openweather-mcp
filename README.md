# DrTrips Weather MCP Server

TypeScript-based MCP (Model Context Protocol) server providing weather data through the OpenWeather API.

## Features

- 🌤️ **OpenWeather API Integration** - Access comprehensive weather data
- 📍 **Location-based Weather** - Get weather by coordinates (latitude/longitude)
- 📅 **Historical & Current Data** - Query weather for specific dates
- 🌡️ **Multiple Units** - Support for metric, imperial, and Kelvin units
- 🔧 **MCP Protocol** - Compatible with Claude Desktop and other MCP clients

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

### Configure with Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

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


## License

MIT
