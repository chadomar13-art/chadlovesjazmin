import React, { useState } from 'react';
import { Heart, CheckCircle2, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { AppConfig, QuizQuestion } from '../types';
import { audioManager } from '../utils/audio';

interface QuizSectionProps {
  config: AppConfig;
  onCompleteQuiz: () => void;
  onBackToHero: () => void;
}

const CUSTOM_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Where was our first date?',
    subtitle: 'Celebrating Our Love · October 17',
    options: [
      { text: 'Skyline Drive', reaction: 'Yes! That breathtaking view on Skyline Drive... I will never forget it! 💜', isCorrect: true },
      { text: 'The Waterfront Walk', reaction: 'A sweet thought, but think higher up overlooking the city! 💫', isCorrect: false },
      { text: 'Sunset Overlook Cafe', reaction: 'Close, but remember that unforgettable drive! 🌄', isCorrect: false },
      { text: 'Downtown Lights', reaction: 'Think back to that magical panoramic drive with me... 🌟', isCorrect: false },
    ],
  },
  {
    id: 2,
    question: 'What two letters represent our future together?',
    subtitle: 'Celebrating Our Love · October 17',
    options: [
      { text: 'CJ', reaction: 'CJ forever and always — Chad & Jazmin! 💜✨', isCorrect: true },
      { text: 'US', reaction: 'Sweet, but think of our two initials united! 💕', isCorrect: false },
      { text: 'JJ', reaction: 'Almost, but think of both our hearts together! 💖', isCorrect: false },
      { text: 'CC', reaction: 'Two letters destined to be side by side forever... 💍', isCorrect: false },
    ],
  },
];

export const QuizSection: React.FC<QuizSectionProps> = ({
  config,
  onCompleteQuiz,
  onBackToHero,
}) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  const currentQ = CUSTOM_QUIZ_QUESTIONS[currentQIndex];
  const totalQuestions = CUSTOM_QUIZ_QUESTIONS.length;
  const isAllAnswered = Object.keys(selectedAnswers).length === totalQuestions;

  const handleSelectOption = (optionIndex: number) => {
    audioManager.playChime(currentQIndex + optionIndex);
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQIndex]: optionIndex,
    }));

    const chosenOption = currentQ.options[optionIndex];
    setActiveReaction(chosenOption.reaction);

    if (currentQIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQIndex((prev) => prev + 1);
        setActiveReaction(null);
      }, 1500);
    } else {
      audioManager.playSuccessChord();
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setActiveReaction(null);
  };

  return (
    <section className="relative min-h-[100dvh] bg-white text-zinc-900 flex flex-col justify-center items-center px-4 sm:px-6 pt-18 sm:pt-24 pb-12 sm:pb-16 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/4 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-purple-100/70 blur-[100px] sm:blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[280px] sm:w-[450px] h-[280px] sm:h-[450px] bg-indigo-100/50 blur-[90px] sm:blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-2xl w-full mx-auto z-10 flex flex-col gap-5 sm:gap-6">
        {/* Header & Step progress */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3 sm:pb-4">
          <div>
            <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-purple-700">
              Celebrating Our Love · October 17
            </span>
            <h2 className="font-['Playfair_Display'] text-xl sm:text-3xl font-bold text-zinc-900 mt-0.5">
              Testing Our Memories
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono tabular-nums">
            <span className="text-purple-700 font-semibold">{currentQIndex + 1}</span>
            <span>/</span>
            <span>{totalQuestions}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200/50">
          <div
            className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${(Object.keys(selectedAnswers).length / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="p-4 sm:p-8 rounded-2xl bg-white/90 border border-purple-200/70 backdrop-blur-md shadow-xl shadow-purple-950/5 flex flex-col gap-4 sm:gap-6">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-purple-600 mb-1">{currentQ.subtitle}</p>
            <h3 className="font-['Playfair_Display'] text-lg sm:text-2xl md:text-3xl font-bold text-zinc-900 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQIndex] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`group relative text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 cursor-pointer min-h-[50px] ${
                    isSelected
                      ? 'bg-purple-50 border-purple-600 shadow-md shadow-purple-600/10'
                      : 'bg-white border-zinc-200 hover:border-purple-400 hover:bg-purple-50/40 active:bg-purple-50'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-zinc-300 text-transparent group-hover:border-purple-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span
                    className={`text-sm sm:text-base leading-snug sm:leading-relaxed ${
                      isSelected ? 'text-purple-950 font-semibold' : 'text-zinc-700 group-hover:text-zinc-900'
                    }`}
                  >
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Reaction Feedback */}
          {activeReaction && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-purple-50 border border-purple-300 text-purple-900 text-xs sm:text-sm animate-fade-in flex items-center gap-2.5">
              <Heart className="w-4 h-4 fill-purple-600 text-purple-600 shrink-0" />
              <span className="font-medium leading-snug">{activeReaction}</span>
            </div>
          )}

          {/* Question Navigation */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 text-xs">
            <button
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="text-zinc-500 hover:text-zinc-800 disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors cursor-pointer py-1"
            >
              &larr; Previous question
            </button>

            {currentQIndex < totalQuestions - 1 && selectedAnswers[currentQIndex] !== undefined && (
              <button
                onClick={() => setCurrentQIndex((prev) => prev + 1)}
                className="text-purple-700 hover:text-purple-900 font-semibold transition-colors cursor-pointer py-1"
              >
                Next question &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Completion Action Banner */}
        {isAllAnswered ? (
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white shadow-xl shadow-purple-600/25 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-purple-200 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>You Remembered Everything! 💜</span>
              </div>
              <h4 className="font-['Playfair_Display'] text-lg sm:text-xl font-bold text-white mt-0.5 sm:mt-1">
                Your Secret Message Is Ready To Reveal
              </h4>
            </div>

            <button
              onClick={onCompleteQuiz}
              className="group inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-white hover:bg-purple-50 text-purple-900 font-semibold rounded-full shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer w-full sm:w-auto"
            >
              <span>Unlock Secret Note</span>
              <ArrowRight className="w-4 h-4 text-purple-700 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
            <button
              onClick={onBackToHero}
              className="hover:text-zinc-800 transition-colors cursor-pointer py-1"
            >
              &larr; Back to intro
            </button>
          </div>
        )}

        {isAllAnswered && (
          <div className="flex justify-center">
            <button
              onClick={handleResetQuiz}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
