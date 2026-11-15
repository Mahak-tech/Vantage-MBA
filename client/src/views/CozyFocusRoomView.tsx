import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Coffee,
  Heart,
  Music,
  Flame
} from 'lucide-react';
import { Subject, FocusSession } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { MomoMascot } from '../components/MomoMascot';

interface CozyFocusRoomViewProps {
  subjects: Subject[];
  selectedSubjectId: string | null;
  onSessionComplete?: () => void;
}

type TimerMode = 'focus' | 'short_break' | 'long_break';
type AmbientSoundType = 'none' | 'rain' | 'campfire' | 'chimes' | 'cafe';

export const CozyFocusRoomView: React.FC<CozyFocusRoomViewProps> = ({
  subjects,
  selectedSubjectId,
  onSessionComplete
}) => {
  // Timer State
  const [timerMode, setTimerMode] = useState<TimerMode>('focus');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  // Goal & Subject
  const [targetGoal, setTargetGoal] = useState('');
  const [activeSubjectId, setActiveSubjectId] = useState<string>(selectedSubjectId || '');

  // Soundscape State
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [soundVolume, setSoundVolume] = useState(0.5);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // History & Celebrations
  const [history, setHistory] = useState<FocusSession[]>([]);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getFocusSessions();
      setHistory(data);
      setCompletedSessionsCount(data.length);
    } catch (err) {
      console.error('Failed to load focus sessions:', err);
    }
  };

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeftSeconds]);

  // Handle Mode Change
  const switchMode = (mode: TimerMode) => {
    setIsRunning(false);
    setTimerMode(mode);
    let mins = 25;
    if (mode === 'short_break') mins = 5;
    if (mode === 'long_break') mins = 15;
    setDurationMinutes(mins);
    setTimeLeftSeconds(mins * 60);
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    stopAmbientSound();

    // Play subtle synthesized chime
    playChime();

    // Confetti celebration
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#F6C6D3', '#CDB8F5', '#BFE5D4', '#F9E8AD']
    });

    if (timerMode === 'focus') {
      const activeSub = subjects.find(s => s.id === activeSubjectId);
      try {
        const session = await api.saveFocusSession({
          subjectId: activeSubjectId || null,
          subjectName: activeSub?.name || 'General Focus',
          durationMinutes,
          goal: targetGoal.trim() || 'Deep Academic Study',
          ambientSound
        });
        setHistory(prev => [session, ...prev]);
        setCompletedSessionsCount(prev => prev + 1);
        if (onSessionComplete) onSessionComplete();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeftSeconds(durationMinutes * 60);
  };

  // Web Audio Procedural Sound Synthesizer (No external mp3 needed!)
  const playAmbientSound = (type: AmbientSoundType) => {
    stopAmbientSound();
    if (type === 'none') {
      setAmbientSound('none');
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate soft pink/brown filtered noise for rain / café
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain') {
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        } else if (type === 'campfire') {
          output[i] = (lastOut + 0.05 * white) / 1.05;
          lastOut = output[i];
          if (Math.random() < 0.005) output[i] += (Math.random() - 0.5) * 2; // subtle crackle
        } else {
          output[i] = white * 0.2;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = type === 'rain' ? 800 : 400;

      const gain = ctx.createGain();
      gain.gain.value = soundVolume * 0.15;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
      setAmbientSound(type);
    } catch (e) {
      console.warn('Web Audio Ambient playback not supported:', e);
    }
  };

  const stopAmbientSound = () => {
    if (noiseNodeRef.current) {
      try { (noiseNodeRef.current as any).stop(); } catch (e) {}
      noiseNodeRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    setAmbientSound('none');
  };

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3); // E5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch (e) {}
  };

  const formatDisplayTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = Math.min(100, Math.round(((durationMinutes * 60 - timeLeftSeconds) / (durationMinutes * 60)) * 100));

  return (
    <div className={`p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in ${isZenMode ? 'fixed inset-0 z-50 bg-[#FFF8F3] overflow-y-auto' : ''}`}>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-4xl border border-sakura-pink/30 shadow-sakura">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sakura-pink to-sakura-lavender flex items-center justify-center text-sakura-text font-black text-xl shadow-sakura-sm">
            ☕
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-sakura-text">Cozy Focus Room</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sakura-lavender-dark bg-sakura-lavender/20 px-2 py-0.5 rounded-full border border-sakura-lavender/30">
                Sakura Café Mode
              </span>
            </div>
            <p className="text-xs text-sakura-muted mt-0.5">
              Distraction-free Pomodoro study space with relaxing ambient soundscapes & floating sakura petals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="px-3.5 py-2 bg-sakura-sub hover:bg-sakura-pink/20 text-sakura-text rounded-2xl text-xs font-semibold border border-sakura-border transition flex items-center gap-1.5"
            title="Toggle Zen Immersion Mode"
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isZenMode ? 'Exit Zen' : 'Zen Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Focus Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cozy Window & Pomodoro Clock (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-4xl border border-sakura-border p-8 flex flex-col items-center justify-between shadow-sakura relative overflow-hidden min-h-[520px]">
          {/* Subtle Sakura Window Illustration in background */}
          <div className="absolute top-4 right-6 opacity-30 pointer-events-none select-none text-6xl animate-gentle-float">
            🌸
          </div>
          <div className="absolute top-16 right-20 opacity-20 pointer-events-none select-none text-4xl animate-sakura-fall">
            🌸
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-sakura-sub rounded-2xl border border-sakura-border z-10">
            <button
              onClick={() => switchMode('focus')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                timerMode === 'focus' ? 'bg-sakura-lavender text-sakura-text shadow-sakura-sm' : 'text-sakura-muted hover:text-sakura-text'
              }`}
            >
              Focus (25m)
            </button>
            <button
              onClick={() => switchMode('short_break')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                timerMode === 'short_break' ? 'bg-sakura-mint text-emerald-900 shadow-sakura-sm' : 'text-sakura-muted hover:text-sakura-text'
              }`}
            >
              Short Break (5m)
            </button>
            <button
              onClick={() => switchMode('long_break')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                timerMode === 'long_break' ? 'bg-sakura-yellow text-amber-900 shadow-sakura-sm' : 'text-sakura-muted hover:text-sakura-text'
              }`}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Giant Cozy Countdown Clock */}
          <div className="my-auto py-8 text-center space-y-4 z-10">
            <div className="relative inline-flex items-center justify-center">
              {/* Circular Ring Progress */}
              <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="120"
                  stroke="#F3E9F1"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="120"
                  stroke={timerMode === 'focus' ? '#CDB8F5' : timerMode === 'short_break' ? '#BFE5D4' : '#F9E8AD'}
                  strokeWidth="10"
                  strokeDasharray="753.98"
                  strokeDashoffset={753.98 - (753.98 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Digits in Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl sm:text-6xl font-black text-sakura-text tracking-tighter drop-shadow-xs font-mono">
                  {formatDisplayTime(timeLeftSeconds)}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-sakura-muted mt-2">
                  {timerMode.replace('_', ' ')} • {progressPercent}% done
                </span>
              </div>
            </div>

            {/* Target Goal Display */}
            {targetGoal && (
              <div className="inline-block px-4 py-1.5 rounded-full bg-sakura-sub border border-sakura-border text-xs font-semibold text-sakura-text">
                Target: {targetGoal}
              </div>
            )}
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-4 z-10 pt-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-2xl text-xs font-bold shadow-sakura transition-all transform hover:scale-105 flex items-center gap-2 ${
                isRunning
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  : 'bg-gradient-to-r from-sakura-lavender to-sakura-pink hover:opacity-90 text-sakura-text'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'Pause Timer' : 'Start Focus Session'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-sakura-sub hover:bg-slate-100 text-sakura-muted hover:text-sakura-text border border-sakura-border transition"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Audio & Goals & History (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Momo's Encouragement Card */}
          <div className="bg-white rounded-3xl border border-sakura-border p-6 shadow-sakura-sm space-y-4">
            <MomoMascot
              mood={isRunning ? 'studying' : 'cheering'}
              customMessage={
                isRunning
                  ? "Shh... deep in the study zone! You're making tremendous progress ~ 📖"
                  : "Pick your target topic, turn on relaxing café sounds, and let's dive in!"
              }
              size="md"
            />
          </div>

          {/* Goal & Subject Picker */}
          <div className="bg-white rounded-3xl border border-sakura-border p-6 shadow-sakura-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sakura-muted flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sakura-lavender-dark" />
              <span>Current Focus Target</span>
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-sakura-text mb-1">Subject</label>
              <select
                value={activeSubjectId}
                onChange={(e) => setActiveSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-sakura-sub border border-sakura-border rounded-xl text-xs focus:outline-none font-medium text-sakura-text"
              >
                <option value="">General Study / Case Prep</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-sakura-text mb-1">Study Objective</label>
              <input
                type="text"
                placeholder="e.g. Master DCF Formula & WACC slides"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="w-full px-3 py-2 bg-sakura-sub border border-sakura-border rounded-xl text-xs focus:outline-none text-sakura-text"
              />
            </div>
          </div>

          {/* Ambient Soundscapes Player */}
          <div className="bg-white rounded-3xl border border-sakura-border p-6 shadow-sakura-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sakura-muted flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-sakura-pink-dark" />
                <span>Ambient Soundscapes</span>
              </h3>
              {ambientSound !== 'none' && (
                <span className="text-[10px] font-bold text-emerald-700 bg-sakura-mint/40 px-2 py-0.5 rounded-full">
                  Playing
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'rain', label: '🌧️ Café Rain' },
                { id: 'campfire', label: '🪵 Warm Hearth' },
                { id: 'cafe', label: '☕ White Noise' },
                { id: 'none', label: '🔇 Mute Audio' },
              ].map(snd => (
                <button
                  key={snd.id}
                  onClick={() => playAmbientSound(snd.id as AmbientSoundType)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                    ambientSound === snd.id
                      ? 'border-sakura-lavender-dark bg-sakura-lavender/30 text-sakura-text shadow-xs'
                      : 'border-sakura-border hover:bg-sakura-sub text-sakura-muted'
                  }`}
                >
                  {snd.label}
                </button>
              ))}
            </div>
          </div>

          {/* Session History Mini Card */}
          <div className="bg-white rounded-3xl border border-sakura-border p-6 shadow-sakura-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sakura-muted">
                Completed Sessions
              </h3>
              <span className="text-xs font-bold text-sakura-text">{completedSessionsCount} finished</span>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-sakura-muted italic text-center py-4">
                No sessions completed yet. Start your first 25-minute Pomodoro!
              </p>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 3).map((s) => (
                  <div key={s.id} className="p-2.5 bg-sakura-sub rounded-xl border border-sakura-border text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sakura-text line-clamp-1">{s.goal}</p>
                      <p className="text-[10px] text-sakura-muted">{s.subjectName} • {s.durationMinutes}m</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
