import React, { useState } from 'react';
import { X, Bot, Copy, Check, Terminal, Globe, Cpu, Wrench, Sparkles } from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';

interface MCPGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MCPGuideModal: React.FC<MCPGuideModalProps> = ({ isOpen, onClose }) => {
  const { wsConnected } = useRoadmap();
  const [activeTab, setActiveTab] = useState<'claude' | 'cursor' | 'antigravity' | 'sse' | 'tools'>('claude');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        roadify: {
          command: "node",
          args: ["C:/Users/Alex/Documents/antigravity/nifty-noether/server/mcp-server.ts"]
        }
      }
    },
    null,
    2
  );

  const cursorConfig = JSON.stringify(
    {
      mcpServers: {
        roadify: {
          command: "node",
          args: ["C:/Users/Alex/Documents/antigravity/nifty-noether/server/mcp-server.ts"]
        }
      }
    },
    null,
    2
  );

  const antigravityConfig = `
# В config/mcp_servers/roadify.json или настройках Antigravity:
{
  "command": "node",
  "args": ["C:/Users/Alex/Documents/antigravity/nifty-noether/server/mcp-server.ts"]
}
`.trim();

  const mcpToolsList = [
    { name: 'list_roadmaps', desc: 'Получить список всех дорожных карт со статистикой и процентом выполнения' },
    { name: 'get_roadmap', desc: 'Получить полную карту со всеми этапами, задачами, связями и координатами' },
    { name: 'create_roadmap', desc: 'Создать новую дорожную карту / спринт' },
    { name: 'add_stage', desc: 'Создать новый этап на холсте (заголовок, тег, описание, дедлайн, приоритет)' },
    { name: 'update_stage', desc: 'Обновить этап (статус, дедлайн, позицию на холсте, заголовок)' },
    { name: 'delete_stage', desc: 'Удалить этап и все связанные стрелки' },
    { name: 'add_task_group', desc: 'Создать группу задач внутри этапа' },
    { name: 'add_subtask', desc: 'Добавить подзадачу/чеклист в этап' },
    { name: 'toggle_subtask', desc: 'Отметить задачу выполненной или невыполненной' },
    { name: 'create_connection', desc: 'Протянуть стрелку зависимости между двумя этапами с подписью' },
    { name: 'auto_layout', desc: 'Автоматически красиво расставить этапы по колонкам' },
    { name: 'generate_sprint_plan', desc: 'Сгенерировать полный спринт с задачами и связями по цели пользователя' },
    { name: 'export_markdown_report', desc: 'Сгенерировать аудит-отчет дорожной карты в Markdown для GitHub' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="bg-[#121524] border border-[#232740] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1f243c] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Подключение ИИ через Model Context Protocol (MCP)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  {wsConnected ? '● Online' : '○ Standby'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Любой внешний ИИ агент (Claude, Cursor, Antigravity) может управлять Roadify в реальном времени!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a1f35] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1f243c] bg-[#0e111d] px-3 pt-2 space-x-2">
          {[
            { id: 'claude', label: 'Claude Desktop' },
            { id: 'cursor', label: 'Cursor IDE' },
            { id: 'antigravity', label: 'Antigravity / Gemini' },
            { id: 'sse', label: 'HTTP / SSE' },
            { id: 'tools', label: 'Список 18 инструментов' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 px-2.5 text-xs font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'claude' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Добавьте Roadify в ваш файл конфигурации Claude Desktop (
                <code className="bg-[#181d33] px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[11px]">
                  claude_desktop_config.json
                </code>
                ):
              </p>
              <div className="relative">
                <pre className="p-3 bg-[#0a0c14] border border-[#232740] rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto">
                  {claudeConfig}
                </pre>
                <button
                  onClick={() => copyToClipboard(claudeConfig, 'claude')}
                  className="absolute top-2 right-2 p-1.5 bg-[#1a1f35] hover:bg-[#232a47] text-slate-300 rounded-lg text-xs flex items-center space-x-1 border border-[#2d365a] transition-all"
                >
                  {copiedKey === 'claude' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'claude' ? 'Скопировано!' : 'Копировать'}</span>
                </button>
              </div>
              <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-indigo-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Что сможет делать Claude:</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Claude сможет создавать новые спринты, планировать задачи, вычеркивать сделанные подзадачи, соединять этапы стрелками и выстраивать идеальные дорожные карты прямо по вашей команде в чате!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'cursor' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                В Cursor откройте <span className="font-semibold text-white">Settings &gt; Features &gt; MCP</span> и добавьте сервер:
              </p>
              <div className="relative">
                <pre className="p-3 bg-[#0a0c14] border border-[#232740] rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto">
                  {cursorConfig}
                </pre>
                <button
                  onClick={() => copyToClipboard(cursorConfig, 'cursor')}
                  className="absolute top-2 right-2 p-1.5 bg-[#1a1f35] hover:bg-[#232a47] text-slate-300 rounded-lg text-xs flex items-center space-x-1 border border-[#2d365a] transition-all"
                >
                  {copiedKey === 'cursor' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'cursor' ? 'Скопировано!' : 'Копировать'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'antigravity' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Конфигурация для Antigravity Agent &amp; Gemini CLI:
              </p>
              <div className="relative">
                <pre className="p-3 bg-[#0a0c14] border border-[#232740] rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto">
                  {antigravityConfig}
                </pre>
                <button
                  onClick={() => copyToClipboard(antigravityConfig, 'antigravity')}
                  className="absolute top-2 right-2 p-1.5 bg-[#1a1f35] hover:bg-[#232a47] text-slate-300 rounded-lg text-xs flex items-center space-x-1 border border-[#2d365a] transition-all"
                >
                  {copiedKey === 'antigravity' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'antigravity' ? 'Скопировано!' : 'Копировать'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sse' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Для веб-агентов и облачных LLM сервер предоставляет стандартный транспорт Server-Sent Events (SSE):
              </p>
              <div className="p-3 bg-[#0a0c14] border border-[#232740] rounded-xl text-xs font-mono space-y-2 text-slate-300">
                <div>
                  <span className="text-indigo-400 font-bold">SSE Endpoint:</span>{' '}
                  <span className="text-emerald-400">http://localhost:3001/sse</span>
                </div>
                <div>
                  <span className="text-indigo-400 font-bold">Messages Endpoint:</span>{' '}
                  <span className="text-emerald-400">http://localhost:3001/messages</span>
                </div>
                <div>
                  <span className="text-indigo-400 font-bold">WebSocket Sync:</span>{' '}
                  <span className="text-cyan-400">ws://localhost:3001/ws</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Доступные инструменты Model Context Protocol:
              </div>
              <div className="space-y-1.5">
                {mcpToolsList.map((t) => (
                  <div
                    key={t.name}
                    className="p-2 bg-[#161a2e] border border-[#232740] rounded-lg text-xs flex flex-col space-y-0.5"
                  >
                    <span className="font-mono font-bold text-indigo-400">{t.name}</span>
                    <span className="text-slate-400 text-[11px]">{t.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
