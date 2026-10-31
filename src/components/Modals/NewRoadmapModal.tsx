import React, { useState } from 'react';
import { X, Plus, Map } from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';

interface NewRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewRoadmapModal: React.FC<NewRoadmapModalProps> = ({ isOpen, onClose }) => {
  const { createRoadmap } = useRoadmap();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createRoadmap(title.trim(), description.trim());
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#121524] border border-[#232740] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[#1f243c] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Map className="w-4 h-4 text-indigo-400" />
            <span>Новая дорожная карта</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a1f35] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Название проекта / карты</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Cyberpunk Pet Simulator"
              className="w-full bg-[#161a2e] border border-[#232740] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Описание / Цель спринта</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание проекта и ключевых вех..."
              className="w-full bg-[#161a2e] border border-[#232740] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1a1f33] hover:bg-[#232945] text-slate-300 text-xs font-medium rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/30 transition-all"
            >
              Создать карту
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
