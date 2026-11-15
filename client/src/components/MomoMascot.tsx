import React, { useState, useEffect } from 'react';
import { Sparkles, EyeOff, Eye, BookOpen, Coffee, Heart } from 'lucide-react';

export type MomoMood = 'happy' | 'cheering' | 'studying' | 'proud' | 'thinking';

interface MomoMascotProps {
  mood?: MomoMood;
  expression?: MomoMood;
  customMessage?: string;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  canHide?: boolean;
  showBubble?: boolean;
  onMomoClick?: () => void;
}

const MOTIVATIONAL_MESSAGES = [
  "Ganbatte! Every page you study brings your MBA vision closer to life! 🌸",
  "Don't forget to take a soothing sip of tea while reading through case studies ~ ☕",
  "Your Study Garden plants grow every time you practice! Keep it blooming 🌿",
  "Active recall with flashcards is the secret weapon of top business scholars! ✨",
  "Small daily steps beat all-nighters every single time. Proud of you! 🎓",
  "Mastering frameworks today creates leadership decisions tomorrow! 💫"
];

export const MomoMascot: React.FC<MomoMascotProps> = ({
  mood,
  expression,
  customMessage,
  message,
  size = 'md',
  canHide = true,
  showBubble = true,
  onMomoClick
}) => {
  const activeMood: MomoMood = expression || mood || 'happy';
  const displayCustomMsg = message || customMessage;
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [bounce, setBounce] = useState(false);
  const [isHidden, setIsHidden] = useState<boolean>(() => {
    return localStorage.getItem('momo_hidden') === 'true';
  });

  const toggleHide = () => {
    const nextState = !isHidden;
    setIsHidden(nextState);
    localStorage.setItem('momo_hidden', String(nextState));
  };

  const handleInteract = () => {
    setBounce(true);
    setCurrentMessageIndex((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length);
    setTimeout(() => setBounce(false), 600);
    if (onMomoClick) onMomoClick();
  };

  const currentMessage = displayCustomMsg || MOTIVATIONAL_MESSAGES[currentMessageIndex];

  // Size dimensions
  const svgSizes = {
    sm: { width: 48, height: 56 },
    md: { width: 72, height: 84 },
    lg: { width: 100, height: 116 },
  };

  const { width, height } = svgSizes[size];

  if (isHidden) {
    return canHide ? (
      <button
        onClick={toggleHide}
        title="Summon Momo"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sakura-pink/20 hover:bg-sakura-pink/30 text-sakura-text text-xs font-semibold border border-sakura-pink/40 transition-all hover:scale-105 shadow-sakura-sm"
      >
        <span className="text-sm">🌸</span>
        <span>Show Momo</span>
      </button>
    ) : null;
  }

  return (
    <div className="relative inline-flex items-end gap-3 select-none">
      {/* Speech Bubble */}
      {showBubble && (
        <div
          onClick={handleInteract}
          className="group relative cursor-pointer max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl rounded-br-xs border border-sakura-pink/40 shadow-sakura text-xs text-sakura-text transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sakura-lavender-dark flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sakura-pink-dark animate-pulse" />
              <span>Momo Companion</span>
            </span>

            {canHide && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleHide();
                }}
                title="Minimize Momo"
                className="text-sakura-muted hover:text-sakura-text p-0.5 rounded opacity-60 hover:opacity-100 transition"
              >
                <EyeOff className="w-3 h-3" />
              </button>
            )}
          </div>

          <p className="font-medium text-slate-800 leading-relaxed text-[11px] sm:text-xs">
            {currentMessage}
          </p>

          <span className="text-[9px] text-sakura-muted block mt-1 italic group-hover:text-sakura-pink-dark transition">
            Click Momo for more encouragement ~ ✨
          </span>

          {/* Tail */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-sakura-pink/40 transform rotate-45" />
        </div>
      )}

      {/* Momo SVG Avatar */}
      <div
        onClick={handleInteract}
        className={`cursor-pointer transition-transform duration-300 transform ${
          bounce ? 'scale-110 -translate-y-2' : 'hover:scale-105'
        }`}
        title="Momo is cheering for you! Click to say hi!"
      >
        <svg
          width={width}
          height={height}
          viewBox="0 0 100 115"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          {/* Chibi Body */}
          <ellipse cx="50" cy="85" rx="28" ry="24" fill="#FFF5EE" stroke="#463951" strokeWidth="2.5" />
          
          {/* Lavender Vest / Uniform */}
          <path
            d="M 32 75 Q 50 92 68 75 L 70 95 Q 50 100 30 95 Z"
            fill="#CDB8F5"
            stroke="#463951"
            strokeWidth="2.5"
          />
          {/* Cute Pink Bowtie */}
          <path
            d="M 44 76 Q 50 78 56 76 L 54 82 Q 50 80 46 82 Z"
            fill="#F6C6D3"
            stroke="#463951"
            strokeWidth="1.5"
          />
          <circle cx="50" cy="78" r="2.5" fill="#E89CB0" />

          {/* Little Paws / Hands */}
          {activeMood === 'studying' ? (
            /* Holding a cute book */
            <g>
              <rect x="36" y="80" width="28" height="18" rx="2" fill="#BFE5D4" stroke="#463951" strokeWidth="2" />
              <line x1="50" y1="80" x2="50" y2="98" stroke="#463951" strokeWidth="1.5" />
              <circle cx="36" cy="88" r="4.5" fill="#FFF5EE" stroke="#463951" strokeWidth="2" />
              <circle cx="64" cy="88" r="4.5" fill="#FFF5EE" stroke="#463951" strokeWidth="2" />
            </g>
          ) : activeMood === 'cheering' ? (
            /* Waving paws */
            <g>
              <circle cx="28" cy="72" r="5" fill="#FFF5EE" stroke="#463951" strokeWidth="2" />
              <circle cx="72" cy="72" r="5" fill="#FFF5EE" stroke="#463951" strokeWidth="2" />
              {/* Sparkle nearby */}
              <path d="M 82 60 L 84 64 L 88 65 L 84 66 L 82 70 L 80 66 L 76 65 L 80 64 Z" fill="#F9E8AD" />
            </g>
          ) : (
            <g>
              <circle cx="34" cy="85" r="4.5" fill="#FFF5EE" stroke="#463951" strokeWidth="2" />
              <circle cx="66" cy="85" r="4.5" fill="#FFF5EE" stroke="#463951" strokeWidth="2" />
            </g>
          )}

          {/* Soft Ears */}
          <path d="M 22 36 Q 16 16 34 26 Z" fill="#F6C6D3" stroke="#463951" strokeWidth="2.5" />
          <path d="M 78 36 Q 84 16 66 26 Z" fill="#F6C6D3" stroke="#463951" strokeWidth="2.5" />

          {/* Chibi Round Head */}
          <circle cx="50" cy="52" r="32" fill="#FFF8F3" stroke="#463951" strokeWidth="2.5" />

          {/* Fluffy Hair Tufts */}
          <path d="M 38 25 Q 50 34 62 25 Q 56 30 50 31 Q 44 30 38 25 Z" fill="#FFF0E6" />

          {/* Expressive Anime Eyes */}
          {activeMood === 'happy' || activeMood === 'cheering' ? (
            /* Happy Blushing Crescent Eyes ( ^ ‿ ^ ) */
            <g>
              <path d="M 36 50 Q 42 43 48 50" stroke="#463951" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 52 50 Q 58 43 64 50" stroke="#463951" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          ) : activeMood === 'proud' ? (
            /* Starry Eyes ( ★ ᴗ ★ ) */
            <g>
              <circle cx="42" cy="50" r="6" fill="#463951" />
              <circle cx="58" cy="50" r="6" fill="#463951" />
              <circle cx="40" cy="48" r="2.5" fill="#FFFFFF" />
              <circle cx="56" cy="48" r="2.5" fill="#FFFFFF" />
              <circle cx="44" cy="52" r="1.5" fill="#F9E8AD" />
              <circle cx="60" cy="52" r="1.5" fill="#F9E8AD" />
            </g>
          ) : activeMood === 'studying' ? (
            /* Focused Eyes with Cute Round Glasses */
            <g>
              <circle cx="42" cy="50" r="5" fill="#463951" />
              <circle cx="58" cy="50" r="5" fill="#463951" />
              <circle cx="40" cy="48" r="1.8" fill="#FFFFFF" />
              <circle cx="56" cy="48" r="1.8" fill="#FFFFFF" />
              {/* Glasses frame */}
              <circle cx="42" cy="50" r="8" stroke="#463951" strokeWidth="1.8" fill="none" />
              <circle cx="58" cy="50" r="8" stroke="#463951" strokeWidth="1.8" fill="none" />
              <line x1="50" y1="50" x2="50" y2="50" stroke="#463951" strokeWidth="2" />
            </g>
          ) : (
            /* Sweet default eyes */
            <g>
              <circle cx="42" cy="50" r="5" fill="#463951" />
              <circle cx="58" cy="50" r="5" fill="#463951" />
              <circle cx="40" cy="48" r="2" fill="#FFFFFF" />
              <circle cx="56" cy="48" r="2" fill="#FFFFFF" />
            </g>
          )}

          {/* Rosy Blushing Cheeks */}
          <ellipse cx="32" cy="56" rx="5.5" ry="3.5" fill="#F6C6D3" opacity="0.85" />
          <ellipse cx="68" cy="56" rx="5.5" ry="3.5" fill="#F6C6D3" opacity="0.85" />

          {/* Tiny Smile */}
          <path d="M 47 57 Q 50 60 53 57" stroke="#463951" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Small Graduation Cap */}
          <g transform="translate(30, 2) rotate(-8, 20, 20)">
            {/* Diamond top */}
            <polygon points="20,5 38,13 20,21 2,13" fill="#463951" stroke="#32273D" strokeWidth="2" />
            {/* Cap base */}
            <path d="M 10 16 Q 20 22 30 16 L 30 22 Q 20 27 10 22 Z" fill="#32273D" />
            {/* Golden Tassel */}
            <circle cx="20" cy="13" r="1.8" fill="#F9E8AD" />
            <path d="M 20 13 Q 32 15 34 25" stroke="#F9E8AD" strokeWidth="1.8" fill="none" />
            <rect x="32" y="24" width="4" height="6" rx="1" fill="#E5CA68" />
          </g>
        </svg>
      </div>
    </div>
  );
};
