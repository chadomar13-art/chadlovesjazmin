import React from 'react';
import { Volume2, VolumeX, Sparkles, Heart } from 'lucide-react';
import { Stage } from '../types';

interface NavigationBarProps {
  currentStage: Stage;
  onSelectStage: (stage: Stage) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  unlockedStages: Record<Stage, boolean>;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentStage,
  onSelectStage,
  isMuted,
  onToggleMute,
  unlockedStages,
}) => {
  const isLightPage = currentStage === 'hero' || currentStage === 'quiz';

  const navItems: { stage: Stage; label: string; short: string }[] = [
    { stage: 'hero', label: 'Intro', short: 'Intro' },
    { stage: 'quiz', label: 'Love Quiz', short: 'Quiz' },
    { stage: 'animation1', label: 'Garden Note', short: 'Garden' },
    { stage: 'animation2', label: 'Final Secret', short: 'Secret' },
  ];

  // Do NOT reveal "Happy Anniversary" until the quiz is completed
  const brandTitle = unlockedStages.animation1 ? 'Happy Anniversary' : 'Celebrating Our Love';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-3 sm:gap-6 px-3.5 sm:px-6 py-2.5 sm:py-3.5 transition-colors duration-300 backdrop-blur-md border-b ${
        isLightPage
          ? 'bg-white/85 border-purple-100 text-zinc-800'
          : 'bg-black/70 border-white/10 text-white'
      }`}
    >
      {/* Zone 1: Single element brand wordmark */}
      <button
        onClick={() => onSelectStage('hero')}
        className={`flex items-center gap-1.5 sm:gap-2 transition-colors text-left group cursor-pointer shrink-0 ${
          isLightPage ? 'text-purple-700 hover:text-purple-900' : 'text-purple-300 hover:text-purple-100'
        }`}
      >
        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-purple-600 text-purple-600 group-hover:scale-110 transition-transform shrink-0" />
        <span className="font-['Playfair_Display'] font-bold text-sm sm:text-base md:text-lg tracking-tight whitespace-nowrap">
          {brandTitle}
        </span>
      </button>

      {/* Zone 2: Navigation links on desktop, compact progress indicators on mobile */}
      <nav className="hidden md:flex items-center gap-5 text-xs lg:text-sm font-medium">
        {navItems.map((item, idx) => {
          const isCurrent = currentStage === item.stage;
          const isUnlocked = unlockedStages[item.stage];

          return (
            <button
              key={item.stage}
              onClick={() => isUnlocked && onSelectStage(item.stage)}
              disabled={!isUnlocked}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                isCurrent
                  ? isLightPage
                    ? 'text-purple-700 font-semibold border-b-2 border-purple-600'
                    : 'text-purple-300 font-semibold border-b-2 border-purple-400'
                  : isUnlocked
                  ? isLightPage
                    ? 'text-zinc-600 hover:text-zinc-900'
                    : 'text-zinc-400 hover:text-white'
                  : 'text-zinc-400/40 cursor-not-allowed opacity-40'
              }`}
            >
              <span className="text-zinc-400 mr-1">{idx + 1}.</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Mobile stage switcher pill */}
      <div className="flex md:hidden items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-[10px] font-mono">
        {navItems.map((item, idx) => {
          const isCurrent = currentStage === item.stage;
          const isUnlocked = unlockedStages[item.stage];
          return (
            <button
              key={item.stage}
              onClick={() => isUnlocked && onSelectStage(item.stage)}
              disabled={!isUnlocked}
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                isCurrent
                  ? 'bg-purple-600 text-white font-bold scale-105'
                  : isUnlocked
                  ? 'text-purple-800 dark:text-purple-200 hover:bg-purple-200/50'
                  : 'text-zinc-400 opacity-30 cursor-not-allowed'
              }`}
              title={`${idx + 1}. ${item.label}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Zone 3: Audio & primary status action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleMute}
          className={`p-1.5 sm:p-2 rounded-full border transition-colors cursor-pointer ${
            isLightPage
              ? 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
              : 'border-white/15 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
          title={isMuted ? 'Turn Sound On' : 'Mute Sound'}
          aria-label={isMuted ? 'Turn Sound On' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />}
        </button>

        {currentStage === 'hero' && (
          <button
            onClick={() => onSelectStage('quiz')}
            className="flex items-center gap-1 px-3 py-1.5 sm:px-3.5 text-[11px] sm:text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-full transition-all shadow-sm shadow-purple-600/30 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">Quiz</span>
            <span className="xs:hidden">Go</span>
          </button>
        )}
      </div>
    </header>
  );
};
