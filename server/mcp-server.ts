import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { store } from './store.js';

export function createMCPServer() {
  const server = new Server(
    {
      name: 'roadify-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'list_roadmaps',
          description: 'List all available roadmaps and sprint boards with basic statistics (stage count, task count, completion percentage).',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_roadmap',
          description: 'Get full details of a specific roadmap, including all stages, nested task groups, subtasks, dependencies, and layout coordinates.',
          inputSchema: {
            type: 'object',
            properties: {
              roadmapId: {
                type: 'string',
                description: 'The unique ID of the roadmap (e.g. "egg-incubator").',
              },
            },
            required: ['roadmapId'],
          },
        },
        {
          name: 'create_roadmap',
          description: 'Create a new empty roadmap / sprint board on the canvas.',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Name of the roadmap' },
              description: { type: 'string', description: 'Description or sprint target' },
              author: { type: 'string', description: 'Author name (defaults to "AI Assistant")' },
            },
            required: ['title'],
          },
        },
        {
          name: 'update_roadmap',
          description: 'Update metadata of an existing roadmap.',
          inputSchema: {
            type: 'object',
            properties: {
              roadmapId: { type: 'string', description: 'The ID of the roadmap' },
              title: { type: 'string', description: 'New title' },
              description: { type: 'string', description: 'New description' },
              author: { type: 'string', description: 'New author' },
            },
            required: ['roadmapId'],
          },
        },
        {
          name: 'delete_roadmap',
          description: 'Delete a roadmap and all its stages.',
          inputSchema: {
            type: 'object',
            properties: {
              roadmapId: { type: 'string', description: 'The ID of the roadmap to delete' },
            },
            required: ['roadmapId'],
          },
        },
        {
          name: 'add_stage',
          description: 'Add a new milestone / stage card to the canvas within a roadmap.',
          inputSchema: {
            type: 'object',
            properties: {
              roadmapId: { type: 'string', description: 'Target roadmap ID' },
              title: { type: 'string', description: 'Stage title (e.g. "M1 Greybox: основной цикл")' },
              tag: { type: 'string', description: 'Category tag (e.g. "ВЕХА M1", "ВЛАДЕЛЕЦ", "АРТ")' },
              description: { type: 'string', description: 'Detailed stage instructions or scope' },
              status: {
                type: 'string',
                enum: ['done', 'in_progress', 'planned', 'paused'],
                description: 'Current status of the stage',
              },
              deadline: { type: 'string', description: 'Target deadline or date (e.g. "до 25 окт.")' },
              priority: {
                type: 'string',
                enum: ['critical', 'high', 'medium', 'low'],
                description: 'Priority level',
              },
              x: { type: 'number', description: 'Canvas X position (optional, defaults to auto)' },
              y: { type: 'number', description: 'Canvas Y position (optional, defaults to auto)' },
            },
            required: ['roadmapId', 'title'],
          },
        },
        {
          name: 'update_stage',
          description: 'Update an existing stage card (title, tag, description, status, priority, deadline, position).',
          inputSchema: {
            type: 'object',
            properties: {
              stageId: { type: 'string', description: 'The ID of the stage' },
              title: { type: 'string' },
              tag: { type: 'string' },
              description: { type: 'string' },
              status: { type: 'string', enum: ['done', 'in_progress', 'planned', 'paused'] },
              deadline: { type: 'string' },
              priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
              x: { type: 'number' },
              y: { type: 'number' },
              collapsed: { type: 'boolean' },
            },
            required: ['stageId'],
          },
        },
        {
          name: 'delete_stage',
          description: 'Delete a stage card from the canvas and disconnect its links.',
          inputSchema: {
            type: 'object',
            properties: {
              stageId: { type: 'string', description: 'The ID of the stage to remove' },
            },
            required: ['stageId'],
          },
        },
        {
          name: 'add_task_group',
          description: 'Add a collapsible task group / checklist category inside a stage card.',
          inputSchema: {
            type: 'object',
            properties: {
              stageId: { type: 'string', description: 'The ID of the stage' },
              title: { type: 'string', description: 'Group header (e.g. "Каркас кода", "Тестирование")' },
            },
            required: ['stageId', 'title'],
          },
        },
        {
          name: 'add_subtask',
          description: 'Add a new checklist task / subtask into a stage (optionally inside a specific group).',
          inputSchema: {
            type: 'object',
            properties: {
              stageId: { type: 'string', description: 'Target stage ID' },
              groupId: { type: 'string', description: 'Optional group ID inside the stage' },
              title: { type: 'string', description: 'Subtask description or checklist item' },
              completed: { type: 'boolean', description: 'Whether it is completed' },
              priority: { type: 'string', enum: ['critical', 'high', 'normal'], description: 'Task priority' },
              badge: { type: 'string', description: 'Optional badge text' },
            },
            required: ['stageId', 'title'],
          },
        },
        {
          name: 'toggle_subtask',
          description: 'Toggle completion state of a subtask (check / uncheck). Automatically updates stage progress.',
          inputSchema: {
            type: 'object',
            properties: {
              stageId: { type: 'string', description: 'The stage containing the task' },
              taskId: { type: 'string', description: 'The subtask ID to toggle' },
            },
            required: ['stageId', 'taskId'],
          },
        },
        {
          name: 'update_subtask',
          description: 'Update an existing subtask (title, priority, completed state).',
          inputSchema: {
            type: 'object',
            properties: {
              stageId: { type: 'string', description: 'The stage containing the task' },
              taskId: { type: 'string', description: 'The task ID' },
              title: { type: 'string' },
              completed: { type: 'boolean' },
              priority: { type: 'string', enum: ['critical', 'high', 'normal'] },
            },
            required: ['stageId', 'taskId'],
          },
        },
        {
          name: 'delete_subtask',
          description: 'Remove a subtask from a stage.',
          inputSchema: {
            type: 'object',
            properties: {
              stageId: { type: 'string', description: 'The stage containing the task' },
              taskId: { type: 'string', description: 'The task ID to delete' },
            },
            required: ['stageId', 'taskId'],
          },
        },
        {
          name: 'create_connection',
          description: 'Connect two stages with a dependency link / arrow on the canvas.',
          inputSchema: {
            type: 'object',
            properties: {
              roadmapId: { type: 'string', description: 'The roadmap ID' },
              fromStageId: { type: 'string', description: 'Source stage ID' },
              toStageId: { type: 'string', description: 'Target stage ID' },
              label: { type: 'string', description: 'Optional label badge (e.g. "параллельно", "после M0")' },
              color: { type: 'string', description: 'Line hex color (e.g. "#6366f1")' },
            },
            required: ['roadmapId', 'fromStageId', 'toStageId'],
          },
        },
        {
          name: 'delete_connection',
          description: 'Delete a dependency connection between two stages.',
          inputSchema: {
            type: 'object',
            properties: {
              roadmapId: { type: 'string', description: 'The roadmap ID' },
              connectionId: { type: 'string', description: 'The connection link ID' },
            },
            required: ['roadmapId', 'connectionId'],
          },
        },
        {
          name: 'auto_layout',
          description: 'Automatically rearrange stages on the canvas into a clean structured layout.',
          inputSchema: {
            type: 'object',
            properties: {
              roadmapId: { type: 'string', description: 'The roadmap ID' },
              direction: { type: 'string', enum: ['horizontal', 'vertical'], description: 'Layout direction' },
            },
            required: ['roadmapId'],
          },
        },
        {
          name: 'generate_sprint_plan',
          description: 'Generate or expand a complete sprint plan with multiple stages, nested task groups, subtasks, deadlines, and dependencies.',
          inputSchema: {
            type: 'object',
            properties: {
              roadmapId: { type: 'string', description: 'Target roadmap ID (or new will be created if omitted)' },
              title: { type: 'string', description: 'Sprint or project title' },
              stages: {
                type: 'array',
                description: 'List of stages to create',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    tag: { type: 'string' },
                    description: { type: 'string' },
                    deadline: { type: 'string' },
                    priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                    taskGroups: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title: { type: 'string' },
                          tasks: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                title: { type: 'string' },
                                priority: { type: 'string', enum: ['critical', 'high', 'normal'] },
                              },
                              required: ['title'],
                            },
                          },
                        },
                        required: ['title', 'tasks'],
                      },
                    },
                  },
                  required: ['title'],
                },
              },
            },
            required: ['stages'],
          },
        },
        {
          name: 'export_markdown_report',
          description: 'Export the complete roadmap status and progress audit as a GitHub-flavored Markdown document.',
          inputSchema: {
            type: 'object',
            properties: {
              roadmapId: { type: 'string', description: 'The roadmap ID' },
            },
            required: ['roadmapId'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      switch (name) {
        case 'list_roadmaps': {
          const roadmaps = store.getAllRoadmaps();
          const summary = roadmaps.map((r) => {
            const totalTasks = r.stages.reduce(
              (acc, s) => acc + s.taskGroups.reduce((a, g) => a + g.tasks.length, 0),
              0
            );
            const doneTasks = r.stages.reduce(
              (acc, s) => acc + s.taskGroups.reduce((a, g) => a + g.tasks.filter((t) => t.completed).length, 0),
              0
            );
            return {
              id: r.id,
              title: r.title,
              description: r.description,
              author: r.author,
              stagesCount: r.stages.length,
              tasksCount: totalTasks,
              completedCount: doneTasks,
              progressPercent: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
            };
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(summary, null, 2),
              },
            ],
          };
        }

        case 'get_roadmap': {
          const rm = store.getRoadmapById(String(args.roadmapId));
          if (!rm) {
            throw new Error(`Roadmap not found with ID: ${args.roadmapId}`);
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(rm, null, 2),
              },
            ],
          };
        }

        case 'create_roadmap': {
          const rm = store.createRoadmap(
            String(args.title),
            args.description ? String(args.description) : '',
            args.author ? String(args.author) : 'AI Assistant'
          );
          return {
            content: [
              {
                type: 'text',
                text: `Successfully created roadmap "${rm.title}" with ID: ${rm.id}`,
              },
            ],
          };
        }

        case 'update_roadmap': {
          const rm = store.updateRoadmap(String(args.roadmapId), {
            title: args.title ? String(args.title) : undefined,
            description: args.description !== undefined ? String(args.description) : undefined,
            author: args.author ? String(args.author) : undefined,
          });
          if (!rm) throw new Error(`Roadmap not found: ${args.roadmapId}`);
          return {
            content: [
              {
                type: 'text',
                text: `Successfully updated roadmap "${rm.title}"`,
              },
            ],
          };
        }

        case 'delete_roadmap': {
          const success = store.deleteRoadmap(String(args.roadmapId));
          if (!success) throw new Error(`Roadmap not found: ${args.roadmapId}`);
          return {
            content: [
              {
                type: 'text',
                text: `Roadmap ${args.roadmapId} successfully deleted.`,
              },
            ],
          };
        }

        case 'add_stage': {
          const stage = store.addStage(String(args.roadmapId), {
            title: String(args.title),
            tag: args.tag ? String(args.tag) : 'ЭТАП',
            description: args.description ? String(args.description) : '',
            status: (args.status as any) || 'planned',
            deadline: args.deadline ? String(args.deadline) : 'Без срока',
            priority: (args.priority as any) || 'medium',
            x: typeof args.x === 'number' ? args.x : undefined,
            y: typeof args.y === 'number' ? args.y : undefined,
          });
          if (!stage) throw new Error(`Failed to add stage to roadmap: ${args.roadmapId}`);
          return {
            content: [
              {
                type: 'text',
                text: `Successfully added stage "${stage.title}" with ID: ${stage.id}`,
              },
            ],
          };
        }

        case 'update_stage': {
          const stage = store.updateStage(String(args.stageId), args as any);
          if (!stage) throw new Error(`Stage not found: ${args.stageId}`);
          return {
            content: [
              {
                type: 'text',
                text: `Successfully updated stage "${stage.title}"`,
              },
            ],
          };
        }

        case 'delete_stage': {
          const success = store.deleteStage(String(args.stageId));
          if (!success) throw new Error(`Stage not found: ${args.stageId}`);
          return {
            content: [
              {
                type: 'text',
                text: `Stage ${args.stageId} successfully deleted.`,
              },
            ],
          };
        }

        case 'add_task_group': {
          const grp = store.addTaskGroup(String(args.stageId), String(args.title));
          if (!grp) throw new Error(`Stage not found: ${args.stageId}`);
          return {
            content: [
              {
                type: 'text',
                text: `Added task group "${grp.title}" with ID: ${grp.id}`,
              },
            ],
          };
        }

        case 'add_subtask': {
          const task = store.addSubtask(
            String(args.stageId),
            args.groupId ? String(args.groupId) : null,
            {
              title: String(args.title),
              completed: Boolean(args.completed),
              priority: (args.priority as any) || 'normal',
              badge: args.badge ? String(args.badge) : undefined,
            }
          );
          if (!task) throw new Error(`Failed to add task to stage: ${args.stageId}`);
          return {
            content: [
              {
                type: 'text',
                text: `Added subtask "${task.title}" with ID: ${task.id}`,
              },
            ],
          };
        }

        case 'toggle_subtask': {
          const success = store.toggleSubtask(String(args.stageId), String(args.taskId));
          if (!success) throw new Error(`Task ${args.taskId} not found in stage ${args.stageId}`);
          return {
            content: [
              {
                type: 'text',
                text: `Subtask ${args.taskId} toggled successfully.`,
              },
            ],
          };
        }

        case 'update_subtask': {
          const task = store.updateSubtask(String(args.stageId), String(args.taskId), args as any);
          if (!task) throw new Error(`Task ${args.taskId} not found in stage ${args.stageId}`);
          return {
            content: [
              {
                type: 'text',
                text: `Updated subtask "${task.title}"`,
              },
            ],
          };
        }

        case 'delete_subtask': {
          const success = store.deleteSubtask(String(args.stageId), String(args.taskId));
          if (!success) throw new Error(`Task ${args.taskId} not found in stage ${args.stageId}`);
          return {
            content: [
              {
                type: 'text',
                text: `Deleted subtask ${args.taskId}`,
              },
            ],
          };
        }

        case 'create_connection': {
          const conn = store.addConnection(String(args.roadmapId), {
            fromStageId: String(args.fromStageId),
            toStageId: String(args.toStageId),
            label: args.label ? String(args.label) : undefined,
            color: args.color ? String(args.color) : undefined,
          });
          if (!conn) throw new Error(`Failed to create connection between ${args.fromStageId} and ${args.toStageId}`);
          return {
            content: [
              {
                type: 'text',
                text: `Created connection ${conn.id}: ${conn.fromStageId} ➔ ${conn.toStageId}`,
              },
            ],
          };
        }

        case 'delete_connection': {
          const success = store.deleteConnection(String(args.roadmapId), String(args.connectionId));
          if (!success) throw new Error(`Connection not found: ${args.connectionId}`);
          return {
            content: [
              {
                type: 'text',
                text: `Connection ${args.connectionId} deleted.`,
              },
            ],
          };
        }

        case 'auto_layout': {
          const dir = args.direction === 'vertical' ? 'vertical' : 'horizontal';
          const success = store.autoLayout(String(args.roadmapId), dir);
          if (!success) throw new Error(`Roadmap not found: ${args.roadmapId}`);
          return {
            content: [
              {
                type: 'text',
                text: `Auto-layout applied (${dir}) for roadmap ${args.roadmapId}.`,
              },
            ],
          };
        }

        case 'generate_sprint_plan': {
          let rmId: string = args.roadmapId ? String(args.roadmapId) : '';
          let rm = rmId ? store.getRoadmapById(rmId) : null;

          if (!rm) {
            const title = args.title ? String(args.title) : 'Сгенерированный спринт';
            rm = store.createRoadmap(title, 'План сгенерирован AI-ассистентом');
            rmId = rm.id;
          }

          const targetRoadmapId: string = rmId;
          const rawStages = Array.isArray(args.stages) ? args.stages : [];
          const createdStages: string[] = [];

          let startX = 80;
          let startY = 80;

          for (let i = 0; i < rawStages.length; i++) {
            const s = rawStages[i];
            const groups = Array.isArray(s.taskGroups)
              ? s.taskGroups.map((g: any, gIdx: number) => ({
                  id: `grp-${Date.now()}-${gIdx}`,
                  title: g.title || 'Задачи',
                  tasks: (g.tasks || []).map((t: any, tIdx: number) => ({
                    id: `task-${Date.now()}-${gIdx}-${tIdx}`,
                    title: t.title,
                    completed: false,
                    priority: t.priority || 'normal',
                  })),
                }))
              : [];

            const stage = store.addStage(targetRoadmapId, {
              title: s.title,
              tag: s.tag || `ШАГ ${i + 1}`,
              description: s.description || '',
              deadline: s.deadline || '',
              priority: s.priority || 'medium',
              status: 'planned',
              x: startX + (i % 3) * 580,
              y: startY + Math.floor(i / 3) * 520,
              taskGroups: groups,
            });

            if (stage) {
              createdStages.push(stage.id);
              if (i > 0) {
                store.addConnection(targetRoadmapId, {
                  fromStageId: createdStages[i - 1],
                  toStageId: stage.id,
                  label: 'зависимость',
                });
              }
            }
          }

          return {
            content: [
              {
                type: 'text',
                text: `Successfully created sprint plan in roadmap "${rm.title}" with ${createdStages.length} stages and dependencies!`,
              },
            ],
          };
        }

        case 'export_markdown_report': {
          const md = store.exportMarkdown(String(args.roadmapId));
          return {
            content: [
              {
                type: 'text',
                text: md,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (err: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error executing ${name}: ${err?.message || String(err)}`,
          },
        ],
      };
    }
  });

  return server;
}

// If run directly via CLI (stdio transport)
if (process.argv[1] && process.argv[1].endsWith('mcp-server.ts') || process.argv[1]?.endsWith('roadify-mcp.js')) {
  const server = createMCPServer();
  const transport = new StdioServerTransport();
  server.connect(transport).catch((err) => {
    console.error('Fatal MCP Server error:', err);
    process.exit(1);
  });
}
