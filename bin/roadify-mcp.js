#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer } from '../server/mcp-server.js';

const server = createMCPServer();
const transport = new StdioServerTransport();

server.connect(transport).catch((err) => {
  console.error('Failed to run Roadify MCP server:', err);
  process.exit(1);
});
