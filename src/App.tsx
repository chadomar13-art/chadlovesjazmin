/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Stage, AppConfig } from './types';
import { NavigationBar } from './components/NavigationBar';
import { HeroSection } from './components/HeroSection';
import { QuizSection } from './components/QuizSection';
import { AnimationOne } from './components/AnimationOne';
import { AnimationTwo } from './components/AnimationTwo';
import { audioManager } from './utils/audio';

export default function App() {
  const [currentStage, setCurrentStage] = useState<Stage>('hero');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [unlockedStages, setUnlockedStages] = useState<Record<Stage, boolean>>({
    hero: true,
    quiz: true,
    animation1: false,
    animation2: false,
  });

  const [config, setConfig] = useState<AppConfig>({
    partnerName: 'Jazmin',
    senderName: 'Your Love',
    anniversaryDate: 'October 17',
    customMessage: 'Happy Anniversary Jazmin',
    heroImageUrl: 'https://res.cloudinary.com/ux2cshad/image/upload/f_auto,q_auto/WhatsApp_Image_2026-10-16_at_5.20.58_PM',
  });

  const handleToggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  const handleStartQuiz = () => {
    audioManager.playChime(1);
    setCurrentStage('quiz');
    setUnlockedStages((prev) => ({ ...prev, quiz: true }));
  };

  const handleCompleteQuiz = () => {
    audioManager.playSuccessChord();
    setUnlockedStages((prev) => ({ ...prev, animation1: true }));
    setCurrentStage('animation1');
  };

  const handleProceedToAnimationTwo = () => {
    audioManager.playChime(4);
    setUnlockedStages((prev) => ({ ...prev, animation2: true }));
    setCurrentStage('animation2');
  };

  const handleSelectStage = (stage: Stage) => {
    audioManager.playChime(0);
    setCurrentStage(stage);
  };

  const isLightMode = currentStage === 'hero' || currentStage === 'quiz';

  return (
    <main
      className={`relative min-h-screen font-sans overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-900 transition-colors duration-300 ${
        isLightMode ? 'bg-white text-zinc-900' : 'bg-black text-slate-100'
      }`}
    >
      {/* Top Bar adhering to Top Bar Contract */}
      <NavigationBar
        currentStage={currentStage}
        onSelectStage={handleSelectStage}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        unlockedStages={unlockedStages}
      />

      {/* Stage 1: Hero Cover with White Background & Purple Button */}
      {currentStage === 'hero' && (
        <HeroSection
          config={config}
          onStartQuiz={handleStartQuiz}
        />
      )}

      {/* Stage 2: Personalized Couple Anniversary Quiz */}
      {currentStage === 'quiz' && (
        <QuizSection
          config={config}
          onCompleteQuiz={handleCompleteQuiz}
          onBackToHero={() => setCurrentStage('hero')}
        />
      )}

      {/* Stage 3: Animation 1 (Botanical Rose Garden Typewriter Note) */}
      {currentStage === 'animation1' && (
        <AnimationOne
          messageText={config.customMessage}
          onProceedToAnimationTwo={handleProceedToAnimationTwo}
          onBackToQuiz={() => setCurrentStage('quiz')}
        />
      )}

      {/* Stage 4: Animation 2 (Blooming Flower -> Drifting Petals -> Pulsing Heart & 'I love you') */}
      {currentStage === 'animation2' && (
        <AnimationTwo
          onBackToGarden={() => setCurrentStage('animation1')}
          onBackToStart={() => setCurrentStage('hero')}
        />
      )}
    </main>
  );
}
