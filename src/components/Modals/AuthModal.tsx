import React, { useState } from 'react';
import { User, Mail, Sparkles, LogIn, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, register, login, closeAuthModal, currentUser } = useAuth();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Пожалуйста, введите ваше имя');
        return;
      }
      register(name, email || `${name.toLowerCase().replace(/\s+/g, '')}@roadify.local`);
    } else {
      if (!email.trim()) {
        setError('Введите email для входа');
        return;
      }
      const ok = login(email);
      if (!ok) {
        setError('Пользователь с таким email не найден. Зарегистрируйтесь!');
        return;
      }
    }
  };

  const handleQuickGuest = () => {
    register('Создатель', 'creator@roadify.local');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#121524] border border-[#2b3356] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header Banner */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-[#191f38] to-[#121524] border-b border-[#232740] text-center relative">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#101322] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Добро пожаловать в Roadify
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Платформа визуальных дорожных карт с бесконечным холстом и поддержкой ИИ (MCP)
          </p>

          {/* Mode Switcher */}
          <div className="flex bg-[#0c0e17] p-1 rounded-xl border border-[#232740] mt-4">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Создать профиль</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Войти</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs rounded-lg text-center">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ваше имя / Никнейм</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Алекс"
                autoFocus
                className="w-full bg-[#161a2e] border border-[#262c49] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ваш Email {mode === 'register' && <span className="text-slate-500 font-normal">(опционально)</span>}</span>
            </label>
            <input
              type="email"
              required={mode === 'login'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@domain.com"
              className="w-full bg-[#161a2e] border border-[#262c49] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="p-3 bg-[#0c0e17] rounded-xl border border-[#1f243c] flex items-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Все ваши дорожные карты и изменения сохраняются локально на этом устройстве.</span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1.5 cursor-pointer active:scale-[0.99]"
          >
            <span>{mode === 'register' ? 'Начать работу' : 'Войти в аккаунт'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleQuickGuest}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              или продолжить быстро в гостевом режиме
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
