import React, { useState } from 'react';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { AppConfig } from '../types';
import heroFallback from '../assets/images/anniversary_hero_romance_1792189028927.jpg';

interface HeroSectionProps {
  config: AppConfig;
  onStartQuiz: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  config,
  onStartQuiz,
}) => {
  const [imgError, setImgError] = useState(false);
  const heroUrl = 'https://res.cloudinary.com/ux2cshad/image/upload/f_auto,q_auto/WhatsApp_Image_2026-10-16_at_5.20.58_PM';
  const displayImage = !imgError ? heroUrl : heroFallback;

  return (
    <section className="relative min-h-[100dvh] bg-white text-zinc-900 flex flex-col justify-center items-center px-4 sm:px-6 pt-18 sm:pt-24 pb-12 sm:pb-16 overflow-hidden">
      {/* Soft romantic purple ambient glow */}
      <div className="absolute top-1/4 right-1/4 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-purple-200/50 blur-[100px] sm:blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[280px] sm:w-[450px] h-[280px] sm:h-[450px] bg-indigo-100/60 blur-[90px] sm:blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-14 items-center z-10">
        {/* Right/Top Column on mobile: Hero Image Frame */}
        <div className="lg:col-span-6 relative flex justify-center items-center order-1 lg:order-2">
          <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-[4/3] max-h-[260px] sm:max-h-[380px] lg:max-h-none rounded-2xl overflow-hidden border border-purple-200 shadow-xl shadow-purple-900/10 group bg-purple-50">
            {/* User photo */}
            <img
              src={displayImage}
              alt="Celebrating Our Love"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Scrim overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

            {/* Romantic badge on image */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-4 rounded-xl bg-white/90 backdrop-blur-md border border-purple-200/70 shadow-md flex items-center justify-between pointer-events-none">
              <div>
                <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-purple-700 font-semibold">Special Memory</p>
                <p className="text-xs sm:text-sm font-['Playfair_Display'] font-bold text-zinc-900">Celebrating Our Love · October 17</p>
              </div>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-600">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-purple-600 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Left/Bottom Column on mobile: Romantic Content */}
        <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-6 text-left order-2 lg:order-1">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-purple-700">
            <Heart className="w-3.5 h-3.5 fill-purple-600 text-purple-600 animate-pulse" />
            <span>Celebrating Our Love</span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span>October 17</span>
          </div>

          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.15] text-balance">
            Celebrating Our Love
          </h1>

          <p className="text-base sm:text-lg font-medium text-purple-900/80 tracking-wide font-['Playfair_Display'] italic">
            October 17
          </p>

          <p className="text-sm sm:text-base text-zinc-600 font-light leading-relaxed">
            Every moment with you is my greatest gift. Before you unlock what I&apos;ve prepared,
            there is a sweet two-question quiz waiting to test our favorite memories.
          </p>

          {/* Action CTA with Purple Theme */}
          <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onStartQuiz}
              className="group relative inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-medium rounded-full shadow-lg shadow-purple-600/30 hover:shadow-purple-600/45 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-200 group-hover:rotate-12 transition-transform" />
              <span className="text-sm sm:text-base tracking-wide font-medium">Begin The Two-Question Quiz</span>
              <ArrowRight className="w-4 h-4 text-purple-200 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Love markers */}
          <div className="pt-4 sm:pt-6 grid grid-cols-3 gap-2 sm:gap-4 border-t border-zinc-200 text-center sm:text-left">
            <div>
              <div className="text-lg sm:text-2xl font-bold font-['Playfair_Display'] text-purple-700 tabular-nums">
                ∞
              </div>
              <div className="text-[11px] sm:text-xs text-zinc-500">Unconditional Love</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold font-['Playfair_Display'] text-purple-700 tabular-nums">
                Oct 17
              </div>
              <div className="text-[11px] sm:text-xs text-zinc-500">Our Special Date</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold font-['Playfair_Display'] text-purple-700 tabular-nums">
                2
              </div>
              <div className="text-[11px] sm:text-xs text-zinc-500">Hearts, One Future</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
