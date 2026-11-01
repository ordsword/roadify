const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function main() {
  const mcpServerBundle = path.resolve(__dirname, 'dist-server', 'mcp.cjs');
  console.log('MCP Server Bundle:', mcpServerBundle);

  // 1. Update C:\Users\Alex\.gemini\config\mcp_config.json
  const globalMcpConfigPath = 'C:\\Users\\Alex\\.gemini\\config\\mcp_config.json';
  if (fs.existsSync(globalMcpConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(globalMcpConfigPath, 'utf8'));
      if (!config.mcpServers) config.mcpServers = {};
      config.mcpServers.roadify = {
        command: 'node',
        args: [mcpServerBundle]
      };
      fs.writeFileSync(globalMcpConfigPath, JSON.stringify(config, null, 2), 'utf8');
      console.log('Updated', globalMcpConfigPath);
    } catch (e) {
      console.error('Error updating global mcp_config.json:', e);
    }
  }

  // 2. Create C:\Users\Alex\.gemini\config\mcp_servers\roadify.json
  const configDir = 'C:\\Users\\Alex\\.gemini\\config\\mcp_servers';
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  const roadifyMcpFile = path.join(configDir, 'roadify.json');
  fs.writeFileSync(roadifyMcpFile, JSON.stringify({
    command: 'node',
    args: [mcpServerBundle]
  }, null, 2), 'utf8');
  console.log('Created', roadifyMcpFile);

  // 3. Query MCP Server via Stdio for list of tools
  const mcpProcess = spawn('node', [mcpServerBundle], {
    stdio: ['pipe', 'pipe', 'inherit']
  });

  const sendRequest = (req) => {
    return new Promise((resolve, reject) => {
      let buffer = '';
      const onData = (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line.trim());
            if (parsed.id === req.id) {
              mcpProcess.stdout.off('data', onData);
              return resolve(parsed);
            }
          } catch {}
        }
      };
      mcpProcess.stdout.on('data', onData);
      mcpProcess.stdin.write(JSON.stringify(req) + '\n');
    });
  };

  // Initialize
  await sendRequest({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'antigravity-setup', version: '1.0' }
    }
  });

  // Get tools
  const listToolsRes = await sendRequest({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  });

  const tools = listToolsRes.result?.tools || [];
  console.log(`Discovered ${tools.length} MCP tools from Roadify:`);

  // 4. Generate tool schema files in C:\Users\Alex\.gemini\antigravity\mcp\roadify
  const antigravityMcpDir = 'C:\\Users\\Alex\\.gemini\\antigravity\\mcp\\roadify';
  if (!fs.existsSync(antigravityMcpDir)) {
    fs.mkdirSync(antigravityMcpDir, { recursive: true });
  }

  for (const tool of tools) {
    const toolSchemaPath = path.join(antigravityMcpDir, `${tool.name}.json`);
    fs.writeFileSync(toolSchemaPath, JSON.stringify({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema || { type: 'object', properties: {} }
    }, null, 2), 'utf8');
  }

  // Write instructions.md
  fs.writeFileSync(path.join(antigravityMcpDir, 'instructions.md'), `# Roadify MCP Server Best Practices

Roadify is a visual roadmap, infinite canvas sprint planner, and milestone tracking system.
Use Roadify MCP tools to inspect, manage, and automate development roadmaps.

## Available Actions:
- \`list_roadmaps\`: List all roadmaps with statistics
- \`get_roadmap\`: Inspect full structure of a roadmap
- \`create_roadmap\`: Create a new sprint roadmap
- \`add_stage\`: Add a milestone stage with coordinates and deadline
- \`add_task_group\`: Group subtasks under a stage
- \`add_subtask\`: Add checklist items with priority
- \`toggle_subtask\`: Mark tasks complete
- \`create_connection\`: Connect stages with dependency arrows
- \`auto_layout\`: Align stages automatically
- \`generate_sprint_plan\`: Generate a complete sprint from a specification
- \`export_markdown_report\`: Export Markdown report
`, 'utf8');

  console.log(`Generated ${tools.length} schemas in ${antigravityMcpDir}`);

  // 5. TEST: Perform real actions via MCP!
  console.log('\n--- TESTING MCP TOOLS ---');
  
  // Test 1: List roadmaps
  const listRes = await sendRequest({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'list_roadmaps',
      arguments: {}
    }
  });
  console.log('Test 1 (list_roadmaps):', JSON.stringify(listRes.result?.content?.[0]?.text || listRes.result));

  // Test 2: Generate Sprint Plan for an AI Agent
  const sprintRes = await sendRequest({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'generate_sprint_plan',
      arguments: {
        title: 'Запуск ИИ-Агента Roadify',
        stages: [
          {
            title: 'M1 Интеграция MCP и проверка сокетов',
            tag: 'ВЕХА M1',
            description: 'Подключение Antigravity и других ИИ-агентов через Model Context Protocol.',
            deadline: 'до 5 нояб.',
            priority: 'critical',
            taskGroups: [
              {
                title: 'Инфраструктура MCP',
                tasks: [
                  { title: 'Регистрация Stdio транспорта в mcp_config.json', priority: 'critical' },
                  { title: 'Тестирование вызова tools/list и tools/call', priority: 'high' }
                ]
              }
            ]
          },
          {
            title: 'M2 Автономное создание задач ИИ',
            tag: 'ВЕХА M2',
            description: 'ИИ самостоятельно планирует спринт и натягивает стрелочки зависимостей.',
            deadline: 'до 10 нояб.',
            priority: 'high',
            taskGroups: [
              {
                title: 'Автоматизация',
                tasks: [
                  { title: 'Генерация кривых Безье между вехами', priority: 'normal' },
                  { title: 'Выгрузка Markdown отчета по спринту', priority: 'normal' }
                ]
              }
            ]
          }
        ]
      }
    }
  });
  console.log('Test 2 (generate_sprint_plan):', JSON.stringify(sprintRes.result?.content?.[0]?.text || sprintRes.result));

  // Test 3: Export Markdown Report
  const reportRes = await sendRequest({
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'export_markdown_report',
      arguments: {}
    }
  });
  console.log('\nTest 3 (export_markdown_report):\n', reportRes.result?.content?.[0]?.text);

  mcpProcess.kill();
  console.log('MCP Test completed successfully!');
}

main().catch(console.error);
