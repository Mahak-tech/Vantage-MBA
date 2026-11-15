import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  GraduationCap,
  FolderOpen,
  FileText,
  Layers,
  Flame,
  Timer
} from 'lucide-react';
import { AchievementBadge, AchievementsData } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadAchievements();
    }
  }, [isOpen]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const res = await api.getAchievements();
      setData(res);
      if (res.totalUnlocked > 0) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.5 },
          colors: ['#F6C6D3', '#CDB8F5', '#BFE5D4']
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      case 'FolderOpen': return <FolderOpen className="w-5 h-5" />;
      case 'FileText': return <FileText className="w-5 h-5" />;
      case 'Layers': return <Layers className="w-5 h-5" />;
      case 'Award': return <Award className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      case 'Timer': return <Timer className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-4xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-sakura-pink/30 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-sakura-border bg-gradient-to-r from-sakura-sub to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sakura-pink to-sakura-lavender flex items-center justify-center text-sakura-text shadow-sakura-sm">
              <Award className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-sakura-text">Academic Achievements & Badges</h2>
                <span className="text-[10px] font-bold bg-sakura-mint/40 text-emerald-800 px-2 py-0.5 rounded-full">
                  {data?.totalUnlocked || 0} / {data?.totalBadges || 8} Earned
                </span>
              </div>
              <p className="text-xs text-sakura-muted">
                Milestones earned through real coursework, flashcard mastery, and study consistency.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-sakura-muted hover:text-sakura-text p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data?.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-3xl border transition-all ${
                  badge.unlocked
                    ? 'border-sakura-lavender/50 bg-gradient-to-br from-white to-sakura-sub/40 shadow-sakura-sm'
                    : 'border-slate-200 bg-slate-50/60 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    badge.unlocked
                      ? `bg-gradient-to-tr ${badge.color} text-white shadow-sm`
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {badge.unlocked ? getIcon(badge.icon) : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-sakura-text truncate">{badge.title}</h4>
                      {badge.unlocked && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-sakura-muted mt-0.5 leading-snug">{badge.subtitle}</p>

                    <div className="mt-2.5 space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-sakura-muted">
                        <span>Progress</span>
                        <span>{badge.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${badge.unlocked ? 'bg-gradient-to-r from-sakura-pink to-sakura-lavender' : 'bg-slate-300'}`}
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] font-bold text-sakura-lavender-dark">
                      Reward: {badge.reward}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sakura-border bg-sakura-sub/50 flex items-center justify-between text-xs">
          <span className="text-sakura-muted">Keep studying to unlock the remaining prestigious academic laurels!</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-sakura-lavender to-sakura-pink text-sakura-text font-bold rounded-2xl shadow-sakura-sm"
          >
            Got It! 🌸
          </button>
        </div>
      </div>
    </div>
  );
};
