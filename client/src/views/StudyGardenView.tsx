import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Droplet,
  Flower2,
  TreePine,
  RotateCcw,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Heart,
  TrendingUp
} from 'lucide-react';
import { GardenData, GardenPlot, Subject } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { MomoMascot } from '../components/MomoMascot';

interface StudyGardenViewProps {
  subjects: Subject[];
  onNavigate: (tab: string, subjectId?: string) => void;
}

export const StudyGardenView: React.FC<StudyGardenViewProps> = ({
  subjects,
  onNavigate
}) => {
  const [garden, setGarden] = useState<GardenData | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<GardenPlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [watering, setWatering] = useState(false);
  const [waterMsg, setWaterMsg] = useState('');

  useEffect(() => {
    loadGarden();
  }, []);

  const loadGarden = async () => {
    try {
      setLoading(true);
      const data = await api.getGarden();
      setGarden(data);
      if (data.plots?.length > 0 && !selectedPlot) {
        setSelectedPlot(data.plots[0]);
      }
    } catch (err) {
      console.error('Failed to load garden:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWater = async (plotId: string) => {
    try {
      setWatering(true);
      setWaterMsg('');
      const updated = await api.waterGardenPlot(plotId);
      setGarden(updated);
      const updatedPlot = updated.plots.find((p: GardenPlot) => p.id === plotId);
      setSelectedPlot(updatedPlot || null);
      setWaterMsg('✨ Nourished! +15 Growth Points added to your garden!');

      // Gentle blossom confetti if reached 100%
      if (updatedPlot && updatedPlot.progress >= 100) {
        confetti({
          particleCount: 50,
          spread: 60,
          colors: ['#F6C6D3', '#CDB8F5', '#BFE5D4', '#F9E8AD']
        });
      }

      setTimeout(() => setWaterMsg(''), 3500);
    } catch (err: any) {
      alert(err.message || 'Cannot water right now.');
    } finally {
      setWatering(false);
    }
  };

  const getStageEmoji = (stage: string, type: string) => {
    switch (stage) {
      case 'seedling': return '🌱';
      case 'sprout': return '🌿';
      case 'bud': return '🌷';
      case 'blooming':
        return type === 'flower' ? '🌸' : '🌼';
      case 'tree':
        return '🌳';
      case 'locked':
        return '🔒';
      default: return '🌱';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'blooming': return 'bg-sakura-pink/20 border-sakura-pink text-sakura-text';
      case 'tree': return 'bg-sakura-mint/20 border-sakura-mint text-emerald-800';
      case 'bud': return 'bg-sakura-lavender/20 border-sakura-lavender text-purple-800';
      case 'sprout': return 'bg-sakura-mint/15 border-sakura-mint/60 text-teal-800';
      case 'locked': return 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
      default: return 'bg-amber-50 border-amber-200 text-amber-800';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Garden Pavilion Banner */}
      <div className="relative overflow-hidden rounded-4xl bg-gradient-to-r from-[#F6C6D3]/40 via-[#F8F0FA] to-[#CDB8F5]/40 p-8 border border-sakura-pink/30 shadow-sakura">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs text-sakura-text text-xs font-bold shadow-sakura-sm border border-sakura-pink/30">
              <Flower2 className="w-3.5 h-3.5 text-sakura-pink-dark animate-spin-slow" />
              <span>Sakura Study Sanctuary</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-sakura-text tracking-tight">
              My Academic Study Garden 🌸
            </h1>
            <p className="text-sakura-muted text-xs sm:text-sm leading-relaxed">
              Every Pomodoro study session, uploaded slide deck, generated note, and completed quiz nourishes your academic garden. Watch your knowledge blossom!
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-sakura-lavender/40 shadow-sakura-sm shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sakura-muted block">Level</span>
              <span className="text-2xl font-black text-sakura-text">{garden?.level || 1}</span>
            </div>
            <div className="w-px h-8 bg-sakura-border" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sakura-muted block">Growth Points</span>
              <span className="text-2xl font-black text-sakura-lavender-dark">{garden?.growthPoints || 0}</span>
            </div>
            <div className="w-px h-8 bg-sakura-border" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sakura-muted block">Water Drops</span>
              <span className="text-2xl font-black text-cyan-600 flex items-center justify-center gap-1">
                <Droplet className="w-4 h-4 fill-cyan-400 text-cyan-500" />
                <span>{garden?.waterDrops || 0}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Momo greeting in the garden */}
        <div className="mt-6 pt-4 border-t border-sakura-pink/20 flex items-center justify-between flex-wrap gap-4">
          <MomoMascot
            mood="happy"
            customMessage="Look at your garden growing, scholar! Every study sprint adds radiant petals ~"
            size="sm"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('focus')}
              className="px-4 py-2 bg-white hover:bg-sakura-bg text-sakura-text text-xs font-semibold rounded-2xl border border-sakura-pink/40 shadow-sakura-sm transition hover:scale-102 flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-sakura-lavender-dark" />
              <span>Enter Focus Room (+20 Pts)</span>
            </button>
            <button
              onClick={() => onNavigate('practice')}
              className="px-4 py-2 bg-gradient-to-r from-sakura-lavender to-sakura-pink hover:opacity-90 text-sakura-text text-xs font-bold rounded-2xl shadow-sakura transition hover:scale-102 flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>Take Quiz (+1 Drop)</span>
            </button>
          </div>
        </div>
      </div>

      {waterMsg && (
        <div className="p-3.5 bg-sakura-mint/30 text-emerald-900 text-xs font-bold rounded-2xl border border-sakura-mint flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{waterMsg}</span>
        </div>
      )}

      {/* Main Grid: Interactive Garden Plots + Plant Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Garden Plots Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-sakura-border p-6 sm:p-8 space-y-6 shadow-sakura-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-sakura-text">Active Garden Plots</h2>
              <p className="text-xs text-sakura-muted">Click any plot to inspect growth stages and water with earned drops</p>
            </div>
            <span className="text-xs font-semibold text-sakura-lavender-dark bg-sakura-lavender/20 px-3 py-1 rounded-full border border-sakura-lavender/40">
              {garden?.plots?.filter(p => p.progress >= 100).length || 0} / {garden?.plots?.length || 6} Blooming
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {garden?.plots?.map((plot) => {
              const isSelected = selectedPlot?.id === plot.id;
              const emoji = getStageEmoji(plot.stage, plot.type);
              const isLocked = plot.stage === 'locked';

              return (
                <button
                  key={plot.id}
                  onClick={() => setSelectedPlot(plot)}
                  className={`p-5 rounded-3xl border text-center transition-all duration-300 relative flex flex-col items-center justify-between ${
                    isSelected
                      ? 'border-sakura-lavender-dark ring-3 ring-sakura-lavender/30 bg-sakura-sub shadow-sakura scale-102'
                      : 'border-sakura-border/80 hover:border-sakura-pink hover:bg-sakura-bg/40'
                  }`}
                >
                  <div className="w-full flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-sakura-muted mb-2">
                    <span>{plot.plantName}</span>
                    <span className={`px-2 py-0.5 rounded-full capitalize text-[9px] ${getStageColor(plot.stage)}`}>
                      {plot.stage}
                    </span>
                  </div>

                  {/* Plant Stage Emoji / Illustration */}
                  <div className="my-3 text-4xl sm:text-5xl transform transition-transform group-hover:scale-110 drop-shadow-sm">
                    {emoji}
                  </div>

                  <div className="w-full space-y-1.5 mt-2">
                    <div className="flex justify-between text-[10px] font-semibold text-sakura-text">
                      <span>Growth</span>
                      <span>{plot.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          plot.progress >= 100 ? 'bg-gradient-to-r from-sakura-pink to-sakura-lavender' : 'bg-sakura-mint-dark'
                        }`}
                        style={{ width: `${plot.progress}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Plant Detail Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-sakura-border p-6 flex flex-col justify-between shadow-sakura-sm space-y-6">
          {selectedPlot ? (
            <div className="space-y-5">
              <div className="text-center p-6 bg-gradient-to-b from-sakura-sub to-white rounded-3xl border border-sakura-pink/20">
                <div className="text-6xl mb-2 drop-shadow-md">
                  {getStageEmoji(selectedPlot.stage, selectedPlot.type)}
                </div>
                <h3 className="text-lg font-bold text-sakura-text">{selectedPlot.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize mt-1 ${getStageColor(selectedPlot.stage)}`}>
                  Stage: {selectedPlot.stage} ({selectedPlot.progress}%)
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-sakura-bg/60 rounded-2xl border border-sakura-border">
                  <span className="font-bold text-sakura-text block mb-1">Growth Requirement:</span>
                  <p className="text-sakura-muted">{selectedPlot.requirement}</p>
                </div>

                <div className="p-3.5 bg-sakura-bg/60 rounded-2xl border border-sakura-border">
                  <span className="font-bold text-sakura-text block mb-1">Nourishment Status:</span>
                  <p className="text-sakura-muted">
                    {selectedPlot.progress >= 100
                      ? '🌸 Full Bloom reached! This plant produces daily bonus inspiration.'
                      : 'Requires additional study sessions or water drops to blossom.'}
                  </p>
                </div>
              </div>

              {selectedPlot.stage !== 'locked' && (
                <button
                  onClick={() => handleWater(selectedPlot.id)}
                  disabled={watering || (garden?.waterDrops || 0) <= 0 || selectedPlot.progress >= 100}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-cyan-200 transition disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Droplet className="w-4 h-4 fill-white" />
                  <span>
                    {selectedPlot.progress >= 100
                      ? 'Already Flourishing ✨'
                      : (garden?.waterDrops || 0) <= 0
                      ? 'Need More Water Drops'
                      : 'Water Plant (+25% Growth)'}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-sakura-muted text-xs italic">
              Select a garden plot to view plant information.
            </div>
          )}

          {/* Quick Earn Tip */}
          <div className="p-4 bg-sakura-sub rounded-2xl border border-sakura-border text-[11px] text-sakura-muted space-y-1">
            <span className="font-bold text-sakura-text block uppercase text-[10px] tracking-wider">How to earn water drops:</span>
            <p>• Complete a 25-minute Pomodoro in Focus Room (+1 drop)</p>
            <p>• Score 80%+ on any subject mock exam (+1 drop)</p>
            <p>• Maintain your daily study streak (+1 drop daily)</p>
          </div>
        </div>
      </div>

      {/* Garden Growth History Log */}
      <div className="bg-white rounded-3xl border border-sakura-border p-6 sm:p-8 space-y-4 shadow-sakura-sm">
        <h3 className="font-bold text-sakura-text text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sakura-pink-dark" />
          <span>Garden Growth Chronicle</span>
        </h3>

        {(!garden?.history || garden.history.length === 0) ? (
          <p className="text-xs text-sakura-muted italic">No garden actions recorded yet.</p>
        ) : (
          <div className="divide-y divide-sakura-border">
            {garden.history.slice(0, 6).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-sakura-mint/30 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                    🌿
                  </span>
                  <span className="font-medium text-slate-800">{item.action}</span>
                </div>
                <div className="flex items-center gap-3 text-sakura-muted text-[11px]">
                  <span className="font-bold text-sakura-lavender-dark">+{item.points} pts</span>
                  <span>•</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
