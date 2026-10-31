import React, { useState } from 'react';
import { X, Settings, RotateCcw, Info, Heart, User, Trash2 } from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';
import { useAuth } from '../../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { loadSampleTemplate } = useRoadmap();
  const { currentUser, updateProfile, openAuthModal } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(name, email);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClearAll = () => {
    if (confirm('Очистить все сохраненные дорожные карты? Это действие необратимо.')) {
      localStorage.removeItem('roadify_roadmaps');
      localStorage.removeItem('roadify_active_id');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#121524] border border-[#232740] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[#1f243c] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>Настройки профиля и Roadify</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a1f35] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-slate-300">
          {/* User Profile Form */}
          <form onSubmit={handleSaveProfile} className="p-3.5 bg-[#161a2e] border border-[#232740] rounded-xl space-y-3">
            <div className="font-semibold text-white flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Профиль разработчика</span>
              </div>
              <button
                type="button"
                onClick={openAuthModal}
                className="text-[11px] text-indigo-400 hover:underline font-normal"
              >
                Сменить аккаунт
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Имя разработчика</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111322] border border-[#2b3356] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111322] border border-[#2b3356] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
              >
                {isSaved ? 'Сохранено!' : 'Сохранить профиль'}
              </button>
            </div>
          </form>

          {/* Data Controls */}
          <div className="space-y-2 pt-1">
            <label className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
              Управление проектами
            </label>

            <button
              onClick={() => {
                loadSampleTemplate();
                onClose();
              }}
              className="w-full py-2 px-3 bg-[#181d33] hover:bg-[#1e243f] border border-[#282f4e] text-indigo-300 rounded-lg flex items-center justify-center space-x-2 transition-colors font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Загрузить эталонный демо-шаблон</span>
            </button>

            <button
              onClick={handleClearAll}
              className="w-full py-2 px-3 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/20 text-rose-300 rounded-lg flex items-center justify-center space-x-2 transition-colors font-medium cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Очистить все локальные проекты</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#1f243c] flex items-center justify-between text-[11px] text-slate-500">
            <span>Roadify v1.0.0</span>
            <span className="flex items-center space-x-1">
              <span>Разработчик:</span>
              <span className="text-slate-300 font-semibold">{currentUser?.name || 'Пользователь'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
