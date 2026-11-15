import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Layers,
  BarChart3,
  Target,
  Briefcase,
  Cpu,
  Lightbulb,
  Sparkles,
  PieChart
} from 'lucide-react';
import { Subject } from '../types';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subjectData: Partial<Subject>) => Promise<void>;
  initialData?: Subject | null;
}

const COLOR_OPTIONS = [
  { label: 'Indigo / Strategic', value: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-500', badge: 'Indigo' },
  { label: 'Blue / Finance', value: 'from-blue-500 to-blue-600', bg: 'bg-blue-500', badge: 'Blue' },
  { label: 'Emerald / Economics', value: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500', badge: 'Emerald' },
  { label: 'Amber / Operations', value: 'from-amber-500 to-amber-600', bg: 'bg-amber-500', badge: 'Amber' },
  { label: 'Rose / Marketing', value: 'from-rose-500 to-rose-600', bg: 'bg-rose-500', badge: 'Rose' },
  { label: 'Violet / Analytics', value: 'from-violet-500 to-violet-600', bg: 'bg-violet-500', badge: 'Violet' },
];

const ICON_OPTIONS = [
  { id: 'BookOpen', label: 'Book', icon: BookOpen },
  { id: 'BarChart3', label: 'Chart', icon: BarChart3 },
  { id: 'Target', label: 'Target', icon: Target },
  { id: 'Layers', label: 'Stack', icon: Layers },
  { id: 'Briefcase', label: 'Briefcase', icon: Briefcase },
  { id: 'Cpu', label: 'Tech', icon: Cpu },
  { id: 'Lightbulb', label: 'Idea', icon: Lightbulb },
  { id: 'Sparkles', label: 'Sparkle', icon: Sparkles },
];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [creditHours, setCreditHours] = useState(3);
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const [selectedIcon, setSelectedIcon] = useState('BookOpen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCode(initialData.code || '');
      setDescription(initialData.description || '');
      setSemester(initialData.semester || 'Semester 1');
      setCreditHours(initialData.creditHours || 3);
      setColor(initialData.color || COLOR_OPTIONS[0].value);
      setSelectedIcon(initialData.icon || 'BookOpen');
    } else {
      setName('');
      setCode('');
      setDescription('');
      setSemester('Semester 1');
      setCreditHours(3);
      setColor(COLOR_OPTIONS[0].value);
      setSelectedIcon('BookOpen');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Subject name is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave({
        name: name.trim(),
        code: code.trim(),
        description: description.trim(),
        semester,
        creditHours,
        color,
        icon: selectedIcon
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save subject.');
    } finally {
      setLoading(false);
    }
  };

  const SelectedIconComp = ICON_OPTIONS.find(i => i.id === selectedIcon)?.icon || BookOpen;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${color} flex items-center justify-center text-white shadow-xs`}>
              <SelectedIconComp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {initialData ? 'Customize Subject Workspace' : 'Create New Subject Workspace'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize lectures, notes, flashcards, and mock tests
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-xl border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subject Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Microeconomics & Pricing Strategy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Course Code
              </label>
              <input
                type="text"
                placeholder="e.g. ECON-501"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Academic Term
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Elective Term">Elective Term</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description & Learning Goals
            </label>
            <textarea
              rows={2}
              placeholder="Key frameworks, exam syllabus, cases..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 resize-none"
            />
          </div>

          {/* Color Palette Identity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`p-2 rounded-xl border text-left text-[11px] font-semibold transition flex items-center gap-2 ${
                    color === c.value
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${c.bg} shrink-0`} />
                  <span className="truncate">{c.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Icon Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Subject Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedIcon === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setSelectedIcon(opt.id)}
                    className={`p-2.5 rounded-xl border transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                    title={opt.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Update Subject' : 'Create Subject Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
