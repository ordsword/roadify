import React, { useState } from 'react';
import { X, Plus, Tag, Calendar, Flag } from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';
import { PriorityLevel, StageStatus } from '../../types';

interface NewStageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewStageModal: React.FC<NewStageModalProps> = ({ isOpen, onClose }) => {
  const { addStage } = useRoadmap();
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('ЭТАП');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('до 30 окт.');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [status, setStatus] = useState<StageStatus>('planned');
  const [initialTask, setInitialTask] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addStage({
      title: title.trim(),
      tag: tag.trim().toUpperCase() || 'ЭТАП',
      description: description.trim(),
      deadline: deadline.trim() || 'Без срока',
      priority,
      status,
      taskGroups: [
        {
          id: `grp-${Date.now()}`,
          title: 'Задачи этапа',
          collapsed: false,
          tasks: initialTask.trim()
            ? [{ id: `task-${Date.now()}`, title: initialTask.trim(), completed: false, priority: 'normal' }]
            : [],
        },
      ],
    });

    setTitle('');
    setDescription('');
    setInitialTask('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#121524] border border-[#232740] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[#1f243c] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Новый этап на холсте</span>
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
            <label className="text-xs font-semibold text-slate-300">Название этапа</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: M2 Экономика и магазин"
              className="w-full bg-[#161a2e] border border-[#232740] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <Tag className="w-3 h-3 text-slate-500" />
                <span>Тег / Категория</span>
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="ВЕХА M2"
                className="w-full bg-[#161a2e] border border-[#232740] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>Дедлайн</span>
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="до 25 окт."
                className="w-full bg-[#161a2e] border border-[#232740] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <Flag className="w-3 h-3 text-slate-500" />
                <span>Приоритет</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-[#161a2e] border border-[#232740] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="critical">Критический</option>
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Статус</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StageStatus)}
                className="w-full bg-[#161a2e] border border-[#232740] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="planned">Запланировано</option>
                <option value="in_progress">В работе</option>
                <option value="done">Готово</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Описание / ТЗ этапа</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание целей и технических требований..."
              className="w-full bg-[#161a2e] border border-[#232740] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Первая подзадача (опционально)</label>
            <input
              type="text"
              value={initialTask}
              onChange={(e) => setInitialTask(e.target.value)}
              placeholder="Например: Настроить ProfileStore схему..."
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
              Создать этап
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
