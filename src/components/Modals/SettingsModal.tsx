import React from 'react';
import { X, Settings, RotateCcw, Info, Heart } from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';
import { INITIAL_ROADMAPS } from '../../presets/initialData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { setActiveRoadmapId } = useRoadmap();

  if (!isOpen) return null;

  const handleResetDefaults = () => {
    if (confirm('Сбросить все дорожные карты к исходному состоянию из скриншотов (Egg Incubator, Arivel)?')) {
      localStorage.setItem('roadify_roadmaps', JSON.stringify(INITIAL_ROADMAPS));
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#121524] border border-[#232740] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[#1f243c] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>Настройки Roadify</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a1f35] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-slate-300">
          <div className="p-3 bg-[#161a2e] border border-[#232740] rounded-xl space-y-2">
            <div className="font-semibold text-white flex items-center space-x-2">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>О приложении Roadify</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Roadify — платформа бесконечного холста для визуализации дорожных карт, планирования спринтов и отслеживания зависимостей. Поддерживает протокол MCP для прямого подключения внешних ИИ агентов.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <label className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
              Управление данными
            </label>
            <button
              onClick={handleResetDefaults}
              className="w-full py-2 px-3 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 hover:text-rose-200 rounded-lg flex items-center justify-center space-x-2 transition-colors font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить данные к эталону (Egg Incubator)</span>
            </button>
          </div>

          <div className="pt-4 border-t border-[#1f243c] flex items-center justify-between text-[11px] text-slate-500">
            <span>Roadify v1.0.0</span>
            <span className="flex items-center space-x-1">
              <span>Сделано с</span>
              <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
              <span>для Валера</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
