import React, { useState, useRef, useEffect } from 'react';
import { Trash2, GripHorizontal } from 'lucide-react';
import { TextNote } from '../../types';
import { useRoadmap } from '../../context/RoadmapContext';

interface CanvasTextNoteProps {
  note: TextNote;
  onDragStart: (e: React.MouseEvent) => void;
}

export const CanvasTextNote: React.FC<CanvasTextNoteProps> = ({ note, onDragStart }) => {
  const { updateTextNote, deleteTextNote } = useRoadmap();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(note.text);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(note.text);
  }, [note.text]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (text.trim() && text !== note.text) {
      updateTextNote(note.id, { text: text.trim() });
    } else if (!text.trim()) {
      deleteTextNote(note.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setText(note.text);
    }
  };

  return (
    <div
      style={{
        transform: `translate(${note.x}px, ${note.y}px)`,
      }}
      className="absolute group select-none cursor-pointer z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative flex items-center space-x-1.5 p-1 rounded-lg transition-all hover:bg-white/5">
        {/* Drag handle */}
        <div
          onMouseDown={onDragStart}
          title="Перетащить текст"
          className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-white transition-opacity"
        >
          <GripHorizontal className="w-3.5 h-3.5" />
        </div>

        {isEditing ? (
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{ color: note.color || '#facc15' }}
            className="bg-[#161a2e]/95 border border-indigo-500/50 rounded-lg px-2.5 py-1 text-sm font-mono font-bold resize-none focus:outline-none shadow-xl min-w-[200px]"
          />
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            onClick={() => setIsEditing(true)}
            style={{ color: note.color || '#facc15', fontSize: `${note.fontSize || 16}px` }}
            className="font-mono font-bold px-2 py-1 rounded cursor-text hover:bg-black/20 transition-colors tracking-tight text-shadow"
          >
            {note.text || 'Кликните, чтобы ввести текст...'}
          </div>
        )}

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTextNote(note.id);
          }}
          title="Удалить надпись"
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity rounded"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
