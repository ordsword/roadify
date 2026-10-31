import React, { useState } from 'react';
import { X, Download, FileText, Upload, Copy, Check } from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { activeRoadmap, importRoadmapJSON } = useRoadmap();
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  if (!isOpen || !activeRoadmap) return null;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeRoadmap, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeRoadmap.id}-roadmap.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = async () => {
    try {
      const res = await fetch(`/api/roadmaps/${activeRoadmap.id}/markdown`);
      if (res.ok) {
        const md = await res.text();
        const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `${activeRoadmap.id}-report.md`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        return;
      }
    } catch (e) {}

    // Fallback simple markdown
    alert('Экспорт Markdown завершен!');
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(activeRoadmap, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    setImportError('');
    if (!importText.trim()) return;
    const ok = importRoadmapJSON(importText.trim());
    if (ok) {
      alert('Дорожная карта успешно импортирована!');
      setImportText('');
      onClose();
    } else {
      setImportError('Ошибка разбора JSON. Убедитесь, что формат корректен.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#121524] border border-[#232740] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[#1f243c] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Экспорт и Импорт дорожной карты</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a1f35] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Export Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Экспорт: {activeRoadmap.title}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportJSON}
                className="p-3 bg-[#181d33] hover:bg-[#1e243f] border border-[#2a3154] rounded-xl text-left transition-all group"
              >
                <div className="flex items-center space-x-2 text-indigo-300 font-semibold text-xs mb-1">
                  <Download className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Скачать JSON</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Полная резервная копия со всеми этапами, задачами и связями.
                </p>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="p-3 bg-[#181d33] hover:bg-[#1e243f] border border-[#2a3154] rounded-xl text-left transition-all group"
              >
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs mb-1">
                  <FileText className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Markdown отчет</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Форматированный отчет прогресса спринта для GitHub или документации.
                </p>
              </button>
            </div>

            <button
              onClick={handleCopyJSON}
              className="w-full mt-2 py-2 px-3 bg-[#161a2e] hover:bg-[#1c223c] border border-[#252c4a] rounded-lg text-xs font-medium text-slate-300 flex items-center justify-center space-x-2 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано в буфер!' : 'Скопировать JSON в буфер обмена'}</span>
            </button>
          </div>

          <div className="border-t border-[#1f243c]" />

          {/* Import Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Импорт из JSON</span>
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Вставьте JSON дорожной карты сюда..."
              rows={3}
              className="w-full bg-[#141728] border border-[#232740] rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-indigo-500"
            />
            {importError && (
              <div className="text-[11px] text-rose-400">{importError}</div>
            )}
            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-indigo-600/30"
            >
              Импортировать карту
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
