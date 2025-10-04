#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './server.js';
import { WEATHER_API_KEY } from './config/settings.js';

/**
 * Main entry point for stdio-based MCP server
 * Can be run via npx or directly with node
 */
async function runServer() {
  try {
    // Create the MCP server
    const server = createMcpServer();

    // Create stdio transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await server.connect(transport);

    console.error('DrTrips Weather MCP Server running on stdio');
    console.error('Weather API Key configured:', WEATHER_API_KEY ? 'Yes' : 'No');
  } catch (error) {
    console.error('Fatal error running server:', error);
    process.exit(1);
  }
}

// Start the server
runServer().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
