import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Key,
  Database,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Moon,
  Sun
} from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  user: UserProfile | null;
  onRefreshUser: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onRefreshUser,
  darkMode = false,
  onToggleDarkMode
}) => {
  // Profile State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(45);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // AI & Backend Config State
  const [geminiKey, setGeminiKey] = useState('');
  const [testingKey, setTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<{ valid?: boolean; message?: string } | null>(null);

  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMsg, setConfigMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setUniversity(user.university || '');
      setSpecialization(user.specialization || '');
      setDailyGoalMinutes(user.dailyGoalMinutes || 45);
    }
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const s = await api.getSettings();
      setGeminiKey(s.geminiApiKey || localStorage.getItem('gemini_api_key') || '');
      setSupabaseUrl(s.supabaseUrl || '');
      setSupabaseKey(s.supabaseAnonKey || '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await api.updateUser({
        name,
        email,
        university,
        specialization,
        dailyGoalMinutes
      });
      onRefreshUser();
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTestGeminiKey = async () => {
    if (!geminiKey.trim()) {
      setKeyStatus({ valid: false, message: 'Please enter a Gemini API Key to test.' });
      return;
    }
    try {
      setTestingKey(true);
      setKeyStatus(null);
      const res = await api.testGeminiKey(geminiKey.trim());
      if (res.valid) {
        setKeyStatus({ valid: true, message: 'Authentication successful! Gemini 1.5 Flash is active.' });
        localStorage.setItem('gemini_api_key', geminiKey.trim());
        await api.updateSettings({ geminiApiKey: geminiKey.trim() });
      } else {
        setKeyStatus({ valid: false, message: res.error || 'Authentication failed.' });
      }
    } catch (err: any) {
      setKeyStatus({ valid: false, message: err.message || 'Connection failed.' });
    } finally {
      setTestingKey(false);
    }
  };

  const handleSaveBackendConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      localStorage.setItem('gemini_api_key', geminiKey.trim());
      await api.updateSettings({
        geminiApiKey: geminiKey.trim(),
        supabaseUrl: supabaseUrl.trim(),
        supabaseAnonKey: supabaseKey.trim()
      });
      setConfigMsg('Configuration saved successfully!');
      setTimeout(() => setConfigMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const [subjects, userProf, tasks, notes, flashcards, quizzes] = await Promise.all([
        api.getSubjects(),
        api.getUser(),
        api.getCalendarTasks(),
        api.getNotes(),
        api.getFlashcards(),
        api.getQuizAttempts()
      ]);

      const backup = {
        exportedAt: new Date().toISOString(),
        profile: userProf,
        subjects,
        notes,
        flashcards,
        quizzes,
        tasks
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Vantage_MBA_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } catch (err) {
      alert('Failed to export backup.');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Platform Settings</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your student profile, study targets, AI engine keys, and academic data exports.
        </p>
      </div>

      {/* 1. Appearance / Dark Mode */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Appearance & Theme</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Toggle between clean light mode and high-contrast dark mode for late-night study sessions.
          </p>
        </div>

        <button
          onClick={onToggleDarkMode}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-200 dark:border-slate-700"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* 2. Student Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-100 dark:border-indigo-900/50">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Student Profile & Habit Goals</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Personalize your academic companion persona</p>
            </div>
          </div>

          {profileMsg && (
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> {profileMsg}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Academic Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Business School / University
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                MBA Specialization / Focus
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. MBA - Tech Product & Strategic Management"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Daily Study Target (Minutes)
            </label>
            <input
              type="number"
              min={15}
              max={240}
              value={dailyGoalMinutes}
              onChange={(e) => setDailyGoalMinutes(parseInt(e.target.value, 10))}
              className="w-48 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. AI Engine Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-100 dark:border-amber-900/50">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Google Gemini AI Engine</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI synthesis for lecture notes, practice MCQs, and tutor explanations</p>
            </div>
          </div>

          {configMsg && (
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> {configMsg}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveBackendConfig} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Get Free Gemini API Key →
              </a>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                disabled={testingKey || !geminiKey.trim()}
                onClick={handleTestGeminiKey}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
              >
                {testingKey ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>

          {keyStatus && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              keyStatus.valid
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
            }`}>
              {keyStatus.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
              <span>{keyStatus.message}</span>
            </div>
          )}

          {/* Built-in Heuristic Notice */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
            <span className="font-semibold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Hybrid Architecture:</span>
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Even without an external API key, Vantage MBA's <strong>Local Academic Synthesis & RAG Engine</strong> parses your uploaded PPTX, PDF, and DOCX files to generate real, structured notes, flashcards, and business simulations offline.
            </p>
          </div>

          {/* Supabase PostgreSQL Configuration */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Supabase Cloud Sync (Optional)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supabase Anon Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOi..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingConfig}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              {savingConfig ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      {/* 4. Data Backup Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Academic Data Backup</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Export all your subjects, notes, flashcards, and calendar tasks as a JSON archive.
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition shrink-0"
        >
          <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Export JSON Archive</span>
        </button>
      </div>
    </div>
  );
};
