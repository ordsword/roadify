import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { store, subscribeToStore } from './store.js';
import { createMCPServer } from './mcp-server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Broadcast store changes to all active WebSocket clients
subscribeToStore((event, data) => {
  const payload = JSON.stringify({ event, data });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
});

// WebSocket Connection handling
wss.on('connection', (ws) => {
  // Send initial ping/ack
  ws.send(JSON.stringify({ event: 'connected', time: new Date().toISOString() }));

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (e) {
      // Ignore invalid JSON
    }
  });
});

// --- REST API ENDPOINTS ---

// Roadmaps
app.get('/api/roadmaps', (req, res) => {
  res.json(store.getAllRoadmaps());
});

app.post('/api/roadmaps/import', (req, res) => {
  try {
    const result = store.importRoadmaps(req.body);
    res.json({ success: true, roadmaps: result });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to import JSON' });
  }
});

app.post('/api/roadmaps/clear', (req, res) => {
  store.clearAll();
  res.json({ success: true });
});

app.post('/api/roadmaps/template', (req, res) => {
  store.loadTemplate();
  res.json({ success: true, roadmaps: store.getAllRoadmaps() });
});

app.get('/api/roadmaps/:id', (req, res) => {
  const rm = store.getRoadmapById(req.params.id);
  if (!rm) return res.status(404).json({ error: 'Roadmap not found' });
  res.json(rm);
});

app.post('/api/roadmaps', (req, res) => {
  const { title, description, author } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const rm = store.createRoadmap(title, description, author);
  res.status(201).json(rm);
});

app.patch('/api/roadmaps/:id', (req, res) => {
  const rm = store.updateRoadmap(req.params.id, req.body);
  if (!rm) return res.status(404).json({ error: 'Roadmap not found' });
  res.json(rm);
});

app.delete('/api/roadmaps/:id', (req, res) => {
  const success = store.deleteRoadmap(req.params.id);
  if (!success) return res.status(404).json({ error: 'Roadmap not found' });
  res.json({ success: true });
});

// Stages
app.post('/api/roadmaps/:id/stages', (req, res) => {
  const stage = store.addStage(req.params.id, req.body);
  if (!stage) return res.status(404).json({ error: 'Roadmap not found' });
  res.status(201).json(stage);
});

app.patch('/api/stages/:id', (req, res) => {
  const stage = store.updateStage(req.params.id, req.body);
  if (!stage) return res.status(404).json({ error: 'Stage not found' });
  res.json(stage);
});

app.delete('/api/stages/:id', (req, res) => {
  const success = store.deleteStage(req.params.id);
  if (!success) return res.status(404).json({ error: 'Stage not found' });
  res.json({ success: true });
});

// Task Groups
app.post('/api/stages/:id/groups', (req, res) => {
  const { title } = req.body;
  const group = store.addTaskGroup(req.params.id, title || 'Новая группа');
  if (!group) return res.status(404).json({ error: 'Stage not found' });
  res.status(201).json(group);
});

// Subtasks
app.post('/api/stages/:id/tasks', (req, res) => {
  const { groupId, ...taskData } = req.body;
  const task = store.addSubtask(req.params.id, groupId || null, taskData);
  if (!task) return res.status(404).json({ error: 'Stage not found' });
  res.status(201).json(task);
});

app.post('/api/stages/:id/tasks/:taskId/toggle', (req, res) => {
  const success = store.toggleSubtask(req.params.id, req.params.taskId);
  if (!success) return res.status(404).json({ error: 'Task or stage not found' });
  res.json({ success: true });
});

app.patch('/api/stages/:id/tasks/:taskId', (req, res) => {
  const task = store.updateSubtask(req.params.id, req.params.taskId, req.body);
  if (!task) return res.status(404).json({ error: 'Task or stage not found' });
  res.json(task);
});

app.delete('/api/stages/:id/tasks/:taskId', (req, res) => {
  const success = store.deleteSubtask(req.params.id, req.params.taskId);
  if (!success) return res.status(404).json({ error: 'Task or stage not found' });
  res.json({ success: true });
});

// Connections
app.post('/api/roadmaps/:id/connections', (req, res) => {
  const conn = store.addConnection(req.params.id, req.body);
  if (!conn) return res.status(400).json({ error: 'Failed to create connection' });
  res.status(201).json(conn);
});

app.delete('/api/roadmaps/:id/connections/:connId', (req, res) => {
  const success = store.deleteConnection(req.params.id, req.params.connId);
  if (!success) return res.status(404).json({ error: 'Connection not found' });
  res.json({ success: true });
});

// Auto-layout
app.post('/api/roadmaps/:id/layout', (req, res) => {
  const dir = req.body.direction === 'vertical' ? 'vertical' : 'horizontal';
  const success = store.autoLayout(req.params.id, dir);
  if (!success) return res.status(404).json({ error: 'Roadmap not found' });
  res.json({ success: true });
});

// Export Markdown
app.get('/api/roadmaps/:id/markdown', (req, res) => {
  const md = store.exportMarkdown(req.params.id);
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.send(md);
});

// MCP Status & Configuration helper
app.get('/api/mcp-status', (req, res) => {
  res.json({
    status: 'active',
    version: '1.0.0',
    capabilities: ['stdio', 'sse', 'websocket'],
    toolsCount: 18,
    clientsConnected: wss.clients.size,
    configExample: {
      mcpServers: {
        roadify: {
          command: 'node',
          args: [path.resolve(__dirname, 'mcp-server.ts')]
        }
      }
    }
  });
});

// --- MCP SSE TRANSPORT SETUP ---
let sseTransport: SSEServerTransport | null = null;
const mcpServer = createMCPServer();

app.get('/sse', async (req, res) => {
  sseTransport = new SSEServerTransport('/messages', res);
  await mcpServer.connect(sseTransport);
});

app.post('/messages', async (req, res) => {
  if (sseTransport) {
    await sseTransport.handlePostMessage(req, res);
  } else {
    res.status(400).json({ error: 'SSE connection not initialized' });
  }
});

// Serve frontend build if exists
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('Roadify API Server Running. Run "npm run dev" for frontend.');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Roadify Core Server & MCP Backend running!`);
  console.log(`📍 Web / API:  http://localhost:${PORT}`);
  console.log(`🔌 WebSocket:  ws://localhost:${PORT}/ws`);
  console.log(`🤖 MCP SSE:    http://localhost:${PORT}/sse`);
  console.log(`⚡ MCP Stdio:  node server/mcp-server.ts`);
  console.log(`======================================================\n`);
});
