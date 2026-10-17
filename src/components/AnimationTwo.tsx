import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, RotateCcw, Heart } from 'lucide-react';
import { audioManager } from '../utils/audio';

interface AnimationTwoProps {
  onBackToGarden: () => void;
  onBackToStart: () => void;
}

export const AnimationTwo: React.FC<AnimationTwoProps> = ({
  onBackToGarden,
  onBackToStart,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const swayRef = useRef<SVGGElement>(null);
  const sepalsGRef = useRef<SVGGElement>(null);
  const petalsGRef = useRef<SVGGElement>(null);
  const centerGRef = useRef<SVGGElement>(null);
  const heartGRef = useRef<SVGGElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const [showReplay, setShowReplay] = useState<boolean>(false);

  const stateRef = useRef<{
    GEN: number;
    breatheId: number | null;
    heartPulseId: number | null;
    isAlive: boolean;
    playFn: () => void;
  }>({
    GEN: 0,
    breatheId: null,
    heartPulseId: null,
    isAlive: true,
    playFn: () => {},
  });

  useEffect(() => {
    stateRef.current.isAlive = true;
    const svgNS = 'http://www.w3.org/2000/svg';
    const el = (n: string, a: Record<string, string | number> = {}) => {
      const e = document.createElementNS(svgNS, n);
      for (const k in a) e.setAttribute(k, String(a[k]));
      return e;
    };

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
    const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
    const easeOutBack = (t: number) => {
      const c = 2.0;
      return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
    };

    function tween(o: {
      dur: number;
      delay?: number;
      ease?: (t: number) => number;
      update: (e: number, t: number) => void;
      done?: () => void;
    }) {
      const gen = stateRef.current.GEN;
      const t0 = performance.now() + (o.delay || 0) * 1000;
      function step(now: number) {
        if (gen !== stateRef.current.GEN || !stateRef.current.isAlive) return;
        let t = (now - t0) / (o.dur * 1000);
        if (t < 0) return requestAnimationFrame(step);
        t = Math.min(1, t);
        o.update((o.ease || easeOutCubic)(t), t);
        if (t < 1) requestAnimationFrame(step);
        else o.done && o.done();
      }
      requestAnimationFrame(step);
    }

    function petalPath(len: number, wid: number) {
      return `M0 0
              C ${wid * 0.9} ${-len * 0.18}, ${wid} ${-len * 0.62}, ${wid * 0.22} ${-len * 0.96}
              Q 0 ${-len * 1.04}, ${-wid * 0.22} ${-len * 0.96}
              C ${-wid} ${-len * 0.62}, ${-wid * 0.9} ${-len * 0.18}, 0 0 Z`;
    }

    function makePetal(len: number, wid: number, fill = 'url(#petalGrad)', edge = 'rgba(255,255,255,.65)') {
      const g = el('g');
      g.append(el('path', { d: petalPath(len, wid), fill, stroke: edge, 'stroke-width': 0.8, 'stroke-linejoin': 'round' }));
      g.append(
        el('path', {
          d: `M0 ${-len * 0.12} L0 ${-len * 0.86}`,
          stroke: 'rgba(255,170,60,.20)',
          'stroke-width': 1.4,
          fill: 'none',
          'stroke-linecap': 'round',
        })
      );
      return g;
    }

    // Breathing loop
    function breathe(now: number) {
      if (!stateRef.current.isAlive) return;
      const t = now / 1000;
      if (swayRef.current) {
        swayRef.current.setAttribute(
          'transform',
          `rotate(${2.2 * Math.sin(t * 0.7)}) scale(${1 + 0.012 * Math.sin(t * 1.15)})`
        );
      }
      stateRef.current.breatheId = requestAnimationFrame(breathe);
    }
    stateRef.current.breatheId = requestAnimationFrame(breathe);

    function play() {
      stateRef.current.GEN++;
      const gen = stateRef.current.GEN;
      setShowReplay(false);

      const sepalsG = sepalsGRef.current;
      const petalsG = petalsGRef.current;
      const centerG = centerGRef.current;
      const heartG = heartGRef.current;
      const msg = msgRef.current;
      const glow = glowRef.current;

      if (!sepalsG || !petalsG || !centerG || !heartG || !msg || !glow) return;

      sepalsG.innerHTML = '';
      petalsG.innerHTML = '';
      centerG.innerHTML = '';
      sepalsG.setAttribute('opacity', '1');
      heartG.innerHTML = '';
      heartG.setAttribute('opacity', '0');
      msg.innerHTML = '';
      glow.style.opacity = '0';

      if (stateRef.current.heartPulseId) {
        cancelAnimationFrame(stateRef.current.heartPulseId);
      }

      // 1. Green sepals peek out first
      for (let i = 0; i < 5; i++) {
        const a = i * 72 + 36;
        const g = makePetal(80, 17, 'url(#sepalGrad)', 'rgba(0,0,0,.18)');
        sepalsG.append(g);
        tween({
          dur: 1.1,
          delay: 0.1 + i * 0.07,
          ease: easeOutBack,
          update: (e) => {
            g.setAttribute('opacity', String(Math.min(1, e * 2)));
            g.setAttribute('transform', `rotate(${a - 30 * (1 - e)}) scale(${0.15 + 0.85 * e})`);
          },
        });
      }

      // 2. Three whorls of petals bloom
      const allPetals: { g: SVGElement; a: number; len: number; sc: number }[] = [];
      const LAYERS = [
        { n: 5, len: 152, wid: 45, off: 0, delay: 0.75, dur: 1.9, sc: 1.0 },
        { n: 5, len: 120, wid: 36, off: 36, delay: 1.15, dur: 1.7, sc: 0.96 },
        { n: 5, len: 90, wid: 28, off: 12, delay: 1.55, dur: 1.5, sc: 0.9 },
      ];

      LAYERS.forEach((L) => {
        for (let i = 0; i < L.n; i++) {
          const a = i * (360 / L.n) + L.off;
          const g = makePetal(L.len, L.wid);
          petalsG.append(g);
          allPetals.push({ g, a, len: L.len, sc: L.sc });
          g.setAttribute('opacity', '0');
          tween({
            dur: L.dur,
            delay: L.delay + i * 0.12,
            ease: easeOutBack,
            update: (e) => {
              g.setAttribute('opacity', String(Math.min(1, e * 2.5)));
              g.setAttribute(
                'transform',
                `rotate(${a - 38 * (1 - e)}) scale(${L.sc * (0.12 + 0.88 * e)}) scale(1, ${0.35 + 0.65 * e})`
              );
            },
            done: () => g.setAttribute('transform', `rotate(${a}) scale(${L.sc})`),
          });
        }
      });

      // 3. Golden center pops in
      const c = el('g');
      c.append(el('circle', { r: 15, fill: 'url(#centerGrad)' }));
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        c.append(el('circle', { cx: Math.cos(a) * 8, cy: Math.sin(a) * 8, r: 1.8, fill: '#e65100', opacity: 0.85 }));
      }
      c.append(el('circle', { r: 4.5, fill: '#ff8f00' }));
      centerG.append(c);
      centerG.setAttribute('opacity', '0');
      tween({
        dur: 0.9,
        delay: 3.4,
        ease: easeOutBack,
        update: (e) => {
          centerG.setAttribute('opacity', String(Math.min(1, e * 2)));
          centerG.setAttribute('transform', `scale(${0.2 + 0.8 * e})`);
        },
      });

      // 4. Warm glow brightens
      setTimeout(() => {
        if (gen === stateRef.current.GEN && glowRef.current) {
          glowRef.current.style.opacity = '1';
        }
      }, 1600);

      // 5. Petals catch the breeze and drift away
      allPetals.forEach((p, i) => {
        const dist = 250 + Math.random() * 140;
        const spin = (Math.random() - 0.5) * 260;
        const wob = 30 + Math.random() * 45;
        const ph = Math.random() * Math.PI * 2;
        tween({
          dur: 1.5 + Math.random() * 0.9,
          delay: 5.4 + i * 0.07 + Math.random() * 0.5,
          ease: easeInOutSine,
          update: (e, t) => {
            const w = Math.sin(t * Math.PI * 2 + ph) * wob * t;
            p.g.setAttribute(
              'transform',
              `rotate(${p.a}) translate(${w}, ${-dist * e}) rotate(${spin * e} 0 ${-p.len / 2}) scale(${p.sc})`
            );
            p.g.setAttribute('opacity', String(t < 0.35 ? 1 : Math.max(0, 1 - (t - 0.35) / 0.65)));
          },
          done: () => p.g.remove(),
        });
      });

      tween({
        dur: 1,
        delay: 5.8,
        update: (e) => sepalsG.setAttribute('opacity', String(1 - e)),
      });

      // 6. A heart remains
      const HEART =
        'M0 18 C -6 8, -22 2, -22 -10 C -22 -22, -12 -26, 0 -14 C 12 -26, 22 -22, 22 -10 C 22 2, 6 8, 0 18 Z';
      heartG.append(el('path', { d: HEART, fill: 'url(#heartGrad)' }));

      tween({
        dur: 0.9,
        delay: 6.35,
        ease: easeOutBack,
        update: (e) => {
          heartG.setAttribute('opacity', String(Math.min(1, e * 1.6)));
          heartG.setAttribute('transform', `translate(0,-4) scale(${2 * (0.1 + 0.9 * e)})`);
        },
        done: () => {
          const t0 = performance.now();
          const targetHeart = heartG;
          function pulse(now: number) {
            if (gen !== stateRef.current.GEN || !stateRef.current.isAlive) return;
            const t = (now - t0) / 1000;
            targetHeart.setAttribute('transform', `translate(0,-4) scale(${2 * (1 + 0.05 * Math.sin(t * 3.4))})`);
            stateRef.current.heartPulseId = requestAnimationFrame(pulse);
          }
          stateRef.current.heartPulseId = requestAnimationFrame(pulse);
        },
      });

      // 7. And the words appear: "I love you"
      const words = 'I love you';
      [...words].forEach((ch, i) => {
        const s = document.createElement('span');
        s.innerHTML = ch === ' ' ? '&nbsp;' : ch;
        s.style.display = 'inline-block';
        s.style.opacity = '0';
        msg.append(s);
        tween({
          dur: 0.8,
          delay: 6.9 + i * 0.14,
          ease: easeOutQuint,
          update: (e) => {
            s.style.opacity = String(e);
            s.style.transform = `translateY(${0.4 * (1 - e)}em) rotate(${5 * (1 - e)}deg)`;
          },
        });
      });

      setTimeout(() => {
        if (gen === stateRef.current.GEN && stateRef.current.isAlive) {
          setShowReplay(true);
        }
      }, 9400);
    }

    stateRef.current.playFn = play;

    // Fireflies creation
    const container = containerRef.current;
    if (container) {
      // Remove any prior fireflies
      const existingFlies = container.querySelectorAll('.firefly-dot');
      existingFlies.forEach((f) => f.remove());

      for (let i = 0; i < 28; i++) {
        const f = document.createElement('div');
        f.className = 'firefly-dot absolute rounded-full pointer-events-none';
        const s = 2 + Math.random() * 3.5;
        f.style.width = `${s}px`;
        f.style.height = `${s}px`;
        f.style.left = `${Math.random() * 100}%`;
        f.style.top = `${15 + Math.random() * 75}%`;
        f.style.backgroundColor = '#ffe9a8';
        f.style.boxShadow = '0 0 10px 2px rgba(255,233,168,.65)';
        f.style.opacity = '0';
        f.style.animation = `drift ${7 + Math.random() * 8}s linear infinite`;
        f.style.animationDelay = `${-Math.random() * 15}s`;
        container.append(f);
      }
    }

    play();

    return () => {
      stateRef.current.isAlive = false;
      if (stateRef.current.breatheId) cancelAnimationFrame(stateRef.current.breatheId);
      if (stateRef.current.heartPulseId) cancelAnimationFrame(stateRef.current.heartPulseId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center select-none"
      style={{
        background: 'radial-gradient(120% 120% at 50% 35%, #143021 0%, #08130c 55%, #030704 100%)',
      }}
    >
      <style>{`
        @keyframes drift {
          0%   { transform: translate(0, 0); opacity: 0; }
          15%  { opacity: .9; }
          55%  { transform: translate(34px, -70px); opacity: .45; }
          100% { transform: translate(-22px, -150px); opacity: 0; }
        }
      `}</style>

      {/* Radial soft golden glow */}
      <div
        ref={glowRef}
        className="absolute w-[130vmin] h-[130vmin] rounded-full pointer-events-none transition-opacity duration-[2500ms]"
        style={{
          background: 'radial-gradient(circle, rgba(255,213,128,.16) 0%, rgba(255,213,128,0) 60%)',
          opacity: 0,
        }}
      />

      {/* Blooming Flower SVG */}
      <svg
        id="flower"
        viewBox="-210 -210 420 420"
        role="img"
        aria-label="A flower blooms, its petals drift away, and a heart appears with the words I love you"
        className="relative z-10 w-[min(92vmin,680px)] h-[min(92vmin,680px)] overflow-visible"
      >
        <defs>
          <radialGradient id="petalGrad" cx="50%" cy="100%" r="95%">
            <stop offset="0%" stopColor="#ffb300" />
            <stop offset="20%" stopColor="#ffd54f" />
            <stop offset="45%" stopColor="#fff3c4" />
            <stop offset="75%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fbfbf4" />
          </radialGradient>
          <radialGradient id="sepalGrad" cx="50%" cy="100%" r="90%">
            <stop offset="0%" stopColor="#3e9142" />
            <stop offset="100%" stopColor="#1b5e20" />
          </radialGradient>
          <radialGradient id="centerGrad" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#ffd54f" />
            <stop offset="65%" stopColor="#ffb300" />
            <stop offset="100%" stopColor="#ef6c00" />
          </radialGradient>
          <radialGradient id="heartGrad" cx="50%" cy="32%" r="85%">
            <stop offset="0%" stopColor="#ff92a5" />
            <stop offset="55%" stopColor="#ff4d6d" />
            <stop offset="100%" stopColor="#d92047" />
          </radialGradient>
          <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="heartGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g id="sway" ref={swayRef}>
          <g id="sepals" ref={sepalsGRef} />
          <g id="petals" ref={petalsGRef} />
          <g id="center" ref={centerGRef} filter="url(#softGlow)" />
          <g id="heart" ref={heartGRef} filter="url(#heartGlow)" opacity="0" />
        </g>
      </svg>

      {/* "I love you" script message */}
      <div
        ref={msgRef}
        className="absolute left-1/2 top-[73%] -translate-x-1/2 -translate-y-1/2 text-[min(13vmin,96px)] text-[#fff6e8] whitespace-nowrap z-20 pointer-events-none font-['Great_Vibes',cursive]"
        style={{
          textShadow: '0 0 14px rgba(255,214,140,.9), 0 0 46px rgba(255,160,90,.45)',
        }}
      />

      {/* Replay Bloom Button */}
      <button
        onClick={() => stateRef.current.playFn()}
        className={`absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 font-sans text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.24em] uppercase text-[#ffe9b8] bg-white/[0.08] border border-[#ffe9b8]/35 hover:bg-white/[0.18] px-5 sm:px-6 py-2.5 rounded-full cursor-pointer backdrop-blur-md z-30 transition-all duration-700 whitespace-nowrap ${
          showReplay ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-90'
        }`}
      >
        ✿ bloom again
      </button>

      {/* Navigation helpers */}
      <div className="absolute top-16 sm:top-20 left-3 sm:left-6 z-30 flex items-center gap-2">
        <button
          onClick={onBackToGarden}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium text-emerald-100/90 hover:text-white bg-black/50 hover:bg-black/70 border border-emerald-500/30 backdrop-blur-md transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Garden Note</span>
        </button>
      </div>

      <div className="absolute top-16 sm:top-20 right-3 sm:right-6 z-30 flex items-center gap-2">
        <button
          onClick={onBackToStart}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium text-amber-200/90 hover:text-white bg-black/50 hover:bg-black/70 border border-amber-500/30 backdrop-blur-md transition-colors cursor-pointer"
        >
          <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-rose-500 text-rose-500" />
          <span>Cover</span>
        </button>
      </div>
    </div>
  );
};
