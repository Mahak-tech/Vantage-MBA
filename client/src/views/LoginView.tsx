import React, { useState } from 'react';
import { GraduationCap, ArrowRight, Sparkles, BookOpen, Layers, HelpCircle, Moon, Sun, CheckCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginViewProps {
  onLogin: (name: string, email: string) => void;
  defaultUser: UserProfile | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  defaultUser,
  darkMode,
  onToggleDarkMode
}) => {
  const [name, setName] = useState(defaultUser?.name || 'Mahak');
  const [email, setEmail] = useState(defaultUser?.email || 'mahak@mba.edu');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickLoginMahak = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onLogin('Mahak', 'mahak@mba.edu');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    onLogin(name.trim(), email.trim() || 'mahak@mba.edu');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-6 sm:p-10 transition-colors font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 dark:shadow-none">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white tracking-tight leading-none text-base">Vantage MBA</h1>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              Strategic Academic Intelligence
            </span>
          </div>
        </div>

        <button
          onClick={onToggleDarkMode}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {/* Main Login Card Container */}
      <div className="max-w-md w-full mx-auto my-12 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-semibold border border-indigo-100 dark:border-indigo-900/50 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Learning Portal</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome to Your MBA Hub
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Sign in to access your course materials, synthesized AI notes, practice questions, and mock exams.
            </p>
          </div>

          {/* Quick 1-Click Login Card for Mahak */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/50 dark:from-indigo-950/40 dark:via-slate-850 dark:to-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Primary Student Profile
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ready
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={defaultUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="Mahak"
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">Mahak</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {defaultUser?.specialization || 'MBA - Tech Product & Strategic Management'}
                </p>
              </div>
            </div>

            <button
              onClick={handleQuickLoginMahak}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <span>Log In as Mahak</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">or sign in with name</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Student Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mahak"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Academic Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mahak@mba.edu"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In to Workspace'}
            </button>
          </form>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">11 Subject Modules</span>
            <span className="text-[10px] text-slate-400">Curriculum hub</span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">AI Notes & RAG</span>
            <span className="text-[10px] text-slate-400">From PPTX & PDFs</span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">Active Recall</span>
            <span className="text-[10px] text-slate-400">Spaced revision</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 dark:text-slate-500">
        Vantage MBA • Personal Academic Companion for Business Scholars
      </div>
    </div>
  );
};
export default LoginView;
