import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Download, RotateCcw, Heart, ArrowRight } from 'lucide-react';
import { audioManager } from '../utils/audio';

interface AnimationOneProps {
  messageText: string;
  onProceedToAnimationTwo: () => void;
  onBackToQuiz: () => void;
}

interface Palette {
  name: string;
  bg: string;
  flower: string;
  stem: string;
  line: string;
  text: string;
}

const PALETTES: Palette[] = [
  { name: 'Rose noir', bg: '#000000', flower: '#FF1400', stem: '#3257FF', line: '#FFB4A8', text: '#FFFFFF' },
  { name: 'Paper', bg: '#F3EEE4', flower: '#FF3B1F', stem: '#1C2B8F', line: '#FFD2C4', text: '#111111' },
  { name: 'Midnight', bg: '#0D1B4C', flower: '#FF5A4E', stem: '#9FB4FF', line: '#FFD6CF', text: '#FFFFFF' },
  { name: 'Citrus', bg: '#0E1A12', flower: '#FF8A00', stem: '#1FA463', line: '#FFE2B8', text: '#FFF6E8' },
  { name: 'Orchid', bg: '#140A1F', flower: '#E63CFF', stem: '#2FB8A6', line: '#F9D1FF', text: '#FFFFFF' },
  { name: 'Moss', bg: '#133A2A', flower: '#FFB7C5', stem: '#7FD18B', line: '#FFFFFF', text: '#F6F1E7' },
  { name: 'Tomato', bg: '#FF1400', flower: '#FFF1E0', stem: '#0B0B0B', line: '#FF1400', text: '#000000' },
  { name: 'Butter', bg: '#FFE9A8', flower: '#E4002B', stem: '#0F5132', line: '#FFC2C2', text: '#1A1A1A' },
  { name: 'Blush', bg: '#FAD4D8', flower: '#C8102E', stem: '#274690', line: '#FFE3E6', text: '#1A1A1A' },
  { name: 'Mono', bg: '#000000', flower: '#F2F2F2', stem: '#6E6E6E', line: '#000000', text: '#FFFFFF' },
];

export const AnimationOne: React.FC<AnimationOneProps> = ({
  messageText,
  onProceedToAnimationTwo,
  onBackToQuiz,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [currentPalIndex, setCurrentPalIndex] = useState<number>(0);
  const [showNextPrompt, setShowNextPrompt] = useState<boolean>(false);
  const [typedCount, setTypedCount] = useState<number>(0);

  // References to keep mutable animation state without causing re-renders
  const stateRef = useRef<{
    animId: number | null;
    autoTimer: ReturnType<typeof setTimeout> | null;
    isAlive: boolean;
    startShowFn: () => void;
    savePngFn: () => void;
  }>({
    animId: null,
    autoTimer: null,
    isAlive: true,
    startShowFn: () => {},
    savePngFn: () => {},
  });

  const MSG = messageText || 'Happy Anniversary Jazmin';

  useEffect(() => {
    stateRef.current.isAlive = true;
    const canvas = canvasRef.current;
    const inp = inputRef.current;
    const container = containerRef.current;
    if (!canvas || !inp || !container) return;

    const gContext = canvas.getContext('2d');
    if (!gContext) return;
    const g: CanvasRenderingContext2D = gContext;

    const F = '"Playfair Display",Georgia,serif';

    let pi = 0;
    let CC = {
      bg: PALETTES[0].bg,
      flower: PALETTES[0].flower,
      stem: PALETTES[0].stem,
      line: PALETTES[0].line,
      text: PALETTES[0].text,
      vein: '#000000',
      red: '#FF1400',
      blue: '#3257FF',
    };

    function rgba(hex: string, a: number) {
      const n = parseInt(hex.slice(1), 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }

    function applyPalette(idx: number) {
      pi = ((idx % PALETTES.length) + PALETTES.length) % PALETTES.length;
      setCurrentPalIndex(pi);
      const p = PALETTES[pi];
      CC = {
        bg: p.bg,
        flower: p.flower,
        stem: p.stem,
        line: p.line,
        text: p.text,
        vein: '#000000',
        red: '#FF1400',
        blue: '#3257FF',
      };
    }

    // State variables
    let W = 0, H = 0, dpr = 1;
    let letters: any[] = [];
    let uid = 1;
    let cache: Record<string, number> = {};
    let Sd = 0, St = 0, wrapped = false;
    let mx: number | null = null, my: number | null = null;
    let flies: any[] = [], perch: any[] = [], gifts: any[] = [], nextFly = Infinity;
    let lastT = 0;
    let autoI = 0, autoTimer: ReturnType<typeof setTimeout> | null = null, autoOn = false;
    let lastTap: { t: number; x: number; y: number } | null = null, lastPlant = 0;

    // Math functions
    function spr(t: number, k = 7, w = 16) {
      if (t <= 0) return 0;
      return 1 - Math.exp(-t * k) * Math.cos(t * w);
    }
    function eo(t: number) {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      return 1 - Math.pow(1 - t, 3);
    }
    function rng(seed: number) {
      let s = seed | 0;
      return () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    function bez(a: [number, number], b: [number, number], c: [number, number], d: [number, number], n: number) {
      const P: [number, number][] = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, u = 1 - t;
        P.push([
          u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
          u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
        ]);
      }
      return P;
    }
    function at(P: [number, number][], u: number): [[number, number], number] {
      const n = P.length;
      const i = Math.min(n - 2, Math.max(1, Math.round(u * (n - 1))));
      return [P[i], Math.atan2(P[i + 1][1] - P[i - 1][1], P[i + 1][0] - P[i - 1][0])];
    }
    function path(ctx: CanvasRenderingContext2D, p: [number, number][], closed: boolean) {
      const n = p.length;
      if (n < 2) return;
      const m = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (closed) {
        const s = m(p[n - 1], p[0]);
        ctx.moveTo(s[0], s[1]);
        for (let i = 0; i < n; i++) {
          const q = m(p[i], p[(i + 1) % n]);
          ctx.quadraticCurveTo(p[i][0], p[i][1], q[0], q[1]);
        }
        ctx.closePath();
      } else {
        ctx.moveTo(p[0][0], p[0][1]);
        for (let i = 1; i < n - 1; i++) {
          const q = m(p[i], p[i + 1]);
          ctx.quadraticCurveTo(p[i][0], p[i][1], q[0], q[1]);
        }
        ctx.lineTo(p[n - 1][0], p[n - 1][1]);
      }
    }

    const B = {
      fill(p: [number, number][], col: string) {
        g.beginPath();
        path(g, p, true);
        g.fillStyle = col;
        g.fill();
      },
      stroke(p: [number, number][], col: string, w: number) {
        g.beginPath();
        path(g, p, false);
        g.strokeStyle = col;
        g.lineWidth = w;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.stroke();
      },
    };

    function circlePts(x: number, y: number, r: number): [number, number][] {
      const p: [number, number][] = [];
      for (let i = 0; i < 14; i++) {
        const t = (i / 14) * 6.2832;
        p.push([x + Math.cos(t) * r, y + Math.sin(t) * r]);
      }
      return p;
    }

    function vine(
      base: [number, number],
      dir: number,
      len: number,
      amp: number,
      waves: number,
      ph: number,
      bend: number,
      n = 40
    ): [number, number][] {
      const P: [number, number][] = [[base[0], base[1]]];
      const step = len / n;
      let x = base[0], y = base[1];
      for (let i = 1; i <= n; i++) {
        const u = i / n;
        const a = dir + bend * u + amp * Math.sin(u * Math.PI * waves + ph) * Math.min(1, u * 3);
        x += Math.cos(a) * step;
        y += Math.sin(a) * step;
        P.push([x, y]);
      }
      return P;
    }

    function curl(P: [number, number][], sign: number, rad: number) {
      const n = P.length;
      const e = P[n - 1];
      const a = Math.atan2(e[1] - P[n - 2][1], e[0] - P[n - 2][0]);
      const c = [e[0] - Math.sin(a) * sign * rad, e[1] + Math.cos(a) * sign * rad];
      const a0 = Math.atan2(e[1] - c[1], e[0] - c[0]);
      for (let i = 1; i <= 14; i++) {
        const u = i / 14;
        const t = a0 + sign * u * Math.PI * 1.6;
        const rr = rad * (1 - 0.5 * u);
        P.push([c[0] + Math.cos(t) * rr, c[1] + Math.sin(t) * rr]);
      }
      return P;
    }

    function weave(r: () => number, startLayer: number) {
      const cuts: number[] = [];
      const nc = 1 + Math.floor(r() * 3);
      for (let i = 0; i < nc; i++) cuts.push(0.15 + r() * 0.7);
      cuts.sort((a, b) => a - b);
      const segs: { u0: number; u1: number; layer: number }[] = [];
      let u0 = 0, layer = startLayer;
      for (const c of cuts) {
        if (c <= u0) continue;
        segs.push({ u0, u1: c, layer });
        if (r() < 0.3) {
          const gp = 0.02 + r() * 0.03;
          u0 = Math.min(0.98, c + gp);
        } else {
          u0 = c;
        }
        layer = 1 - layer;
      }
      segs.push({ u0, u1: 1, layer });
      return segs;
    }

    function layerAt(segs: { u0: number; u1: number; layer: number }[], u: number) {
      for (const s of segs) {
        if (u >= s.u0 && u <= s.u1) return s.layer;
      }
      return segs[segs.length - 1].layer;
    }

    function mw(ch: string) {
      if (cache[ch] != null) return cache[ch];
      g.font = `700 100px ${F}`;
      let w = g.measureText(ch).width / 100;
      if (ch === ' ') w *= 1.4;
      return (cache[ch] = w);
    }

    function layoutCore(A: any[], Wl: number, Hl: number, prevWrapped: boolean) {
      const maxW = Wl * 0.8, S0 = Hl * 0.28, LH = 2.1;
      const ws = A.map((l) => mw(l.ch));
      const words: any[] = [];
      let cur: any = null;
      A.forEach((l, i) => {
        if (l.ch === ' ') {
          if (cur) {
            words.push(cur);
            cur = null;
          }
          words.push({ sp: true, idx: [i] });
        } else {
          if (!cur) cur = { idx: [] };
          cur.idx.push(i);
        }
      });
      if (cur) words.push(cur);

      const lineW = (li: number[], S: number) => {
        let e = li.length;
        while (e > 0 && A[li[e - 1]].ch === ' ') e--;
        let w = 0;
        for (let k = 0; k < e; k++) w += ws[li[k]];
        return w * S;
      };

      const wrap = (S: number) => {
        const lines: number[][] = [[]];
        let lw = 0;
        for (const w of words) {
          const ww = w.idx.reduce((s: number, i: number) => s + ws[i], 0) * S;
          if (!w.sp && lw > 0 && lw + ww > maxW) {
            lines.push([]);
            lw = 0;
          }
          lines[lines.length - 1].push(...w.idx);
          lw += ww;
        }
        return lines;
      };

      let lines = [A.map((_, i) => i)];
      const unit = lineW(lines[0], 1);
      let S = unit > 0 ? Math.min(S0, maxW / unit) : S0;
      const multi = words.filter((w) => !w.sp).length > 1;
      let wr = multi && (S < Hl * 0.1 || (prevWrapped && S < Hl * 0.14));
      if (wr) {
        let lo = Hl * 0.03, hi = Hl * 0.15;
        for (let k = 0; k < 22; k++) {
          const mid = (lo + hi) / 2;
          const ls = wrap(mid);
          const ok = ls.every((li) => lineW(li, mid) <= maxW) && ls.length * LH * mid <= Hl * 0.82;
          if (ok) lo = mid;
          else hi = mid;
        }
        S = lo;
        lines = wrap(S);
        if (lines.length < 2) wr = false;
      }
      const n = lines.length, lh = LH * S;
      lines.forEach((li, k) => {
        let x = Wl / 2 - lineW(li, S) / 2;
        const y = Hl / 2 + (k - (n - 1) / 2) * lh + 0.33 * S;
        li.forEach((i) => {
          const l = A[i], w = ws[i] * S;
          l.tx = x + w / 2;
          l.ty = y;
          l.tw = w;
          l.line = k;
          x += w;
        });
      });
      return { S, wrapped: wr, n };
    }

    function layout(snap = false) {
      if (!W) return;
      const A = letters.filter((l) => !l.dead);
      const res = layoutCore(A, W, H, wrapped);
      wrapped = res.wrapped;
      A.forEach((l) => {
        if (l.x == null) {
          l.x = l.tx;
          l.y = l.ty;
        }
      });
      St = res.S;
      if (snap || !Sd) {
        Sd = res.S;
        A.forEach((l) => {
          l.x = l.tx;
          l.y = l.ty;
        });
      }
    }

    function resize() {
      if (!containerRef.current || !canvasRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      const d = window.devicePixelRatio || 1;
      if (!r.width || !r.height) return;
      W = r.width;
      H = r.height;
      dpr = d;
      canvasRef.current.width = Math.round(r.width * d);
      canvasRef.current.height = Math.round(r.height * d);
      layout(true);
    }

    function wordParams(ws: number) {
      const r = rng(ws * 7 + 13), dens = 1;
      return {
        roseP: 0.3 + r() * 0.3,
        leafy: (0.6 + r() * 0.8) * dens,
        dens,
        lean: (r() - 0.5) * 0.6,
        big: 0.85 + r() * 0.45,
        curvy: 0.8 + r() * 0.6,
        bridgeP: Math.min(0.95, (0.45 + r() * 0.35) * dens),
        w: 0.5,
      };
    }

    function grow(r: () => number, E: any[], nid: () => number, p: any, o: any) {
      const tip = o.tip || (r() < p.roseP ? 'rose' : r() < 0.45 ? 'fan' : r() < 0.6 ? 'leaf' : 'curl');
      let P =
        o.pts ||
        vine(o.base, o.dir, o.len, (0.35 + r() * 0.45) * p.curvy, 1 + r() * 1.6, r() * 6.28, (r() - 0.5) * 1.2, 40);
      if (tip === 'curl') P = curl(P, r() < 0.5 ? -1 : 1, 0.05 + r() * 0.05);
      const segs = weave(r, o.layer0 != null ? o.layer0 : r() < 0.5 ? 0 : 1);
      const dur = Math.max(320, (o.len || 0.8) * 620);
      const thorns: any[] = [];
      const nt = Math.floor(r() * 2.5);
      for (let i = 0; i < nt; i++) thorns.push({ u: 0.15 + r() * 0.65, s: r() < 0.5 ? -1 : 1 });
      E.push({ t: 'stem', id: nid(), pts: P, segs, d0: o.d0, dur, w: o.depth ? 0.82 : 1, thorns });

      const nl = Math.floor(r() * 2.8 * p.leafy);
      let sd = r() < 0.5 ? -1 : 1;
      for (let i = 0; i < nl; i++) {
        const u = 0.25 + r() * 0.6;
        const [q, a] = at(P, u);
        sd = -sd;
        E.push({
          t: 'leaf',
          id: nid(),
          x: q[0],
          y: q[1],
          a: a + sd * (0.55 + r() * 0.5),
          L: (0.14 + r() * 0.2) * (o.depth ? 0.8 : 1),
          bend: (r() - 0.5) * 1.2,
          layer: layerAt(segs, u),
          d0: o.d0 + dur * u,
        });
      }

      const [tp, ta] = at(P, 1);
      const td = o.d0 + dur * 0.8;
      const tl = layerAt(segs, 1);

      if (tip === 'rose') {
        const R = (0.13 + r() * 0.15) * p.big * (o.depth ? 0.75 : 1);
        const over = tp[1] > -0.78 && tp[1] < 0.05 && Math.abs(tp[0]) < p.w * 0.5;
        const layer = over ? (r() < 0.22 ? 1 : 0) : r() < 0.6 ? 1 : tl;
        E.push({
          t: 'rose',
          id: nid(),
          x: tp[0],
          y: tp[1],
          R,
          rot: (r() - 0.5) * 1.0,
          ph1: r() * 6.28,
          ph2: r() * 6.28,
          turns: 1.8 + r() * 1,
          layer,
          d0: td,
        });
        if (r() < 0.2) {
          const oo = ta + (r() < 0.5 ? 1 : -1) * 1.3;
          E.push({
            t: 'rose',
            id: nid(),
            x: tp[0] + Math.cos(oo) * R * 1.4,
            y: tp[1] + Math.sin(oo) * R * 1.4,
            R: R * (0.6 + r() * 0.3),
            rot: (r() - 0.5) * 1.2,
            ph1: r() * 6.28,
            ph2: r() * 6.28,
            turns: 1.8 + r(),
            layer,
            d0: td + 120,
          });
        }
      } else if (tip === 'fan') {
        const spread = 0.6 + r() * 0.3;
        for (let j = 0; j < 2; j++) {
          E.push({
            t: 'leaf',
            id: nid(),
            x: tp[0],
            y: tp[1],
            a: ta + (j - 0.5) * spread,
            L: 0.2 + r() * 0.2,
            bend: (j - 0.5) * 0.8,
            layer: tl,
            d0: td + j * 60,
          });
        }
      } else if (tip === 'leaf') {
        E.push({
          t: 'leaf',
          id: nid(),
          x: tp[0],
          y: tp[1],
          a: ta + (r() - 0.5) * 0.3,
          L: 0.16 + r() * 0.16,
          bend: r() - 0.5,
          layer: tl,
          d0: td,
        });
      }

      if (!o.depth && r() < 0.3) {
        const u = 0.35 + r() * 0.35;
        const [q, a] = at(P, u);
        grow(r, E, nid, p, {
          base: q,
          dir: a + (r() < 0.5 ? -1 : 1) * (0.7 + r() * 0.4),
          len: (o.len || 0.8) * (0.35 + r() * 0.2),
          d0: o.d0 + dur * u,
          depth: 1,
          layer0: layerAt(segs, u),
        });
      }
      return P;
    }

    function gen(l: any) {
      const r = rng((l.ws ^ Math.imul(l.wi + 1, 2654435761)) + Math.floor(Math.random() * 1e6));
      const p = wordParams(l.ws);
      const E: any[] = [];
      let k0 = 0;
      const nid = () => l.id * 100 + k0++;
      const w = mw(l.ch);
      const inX = () => (r() - 0.5) * w * 0.7;
      p.w = w;

      const nUp = 1 + (r() < 0.45 * p.dens ? 1 : 0);
      for (let i = 0; i < nUp; i++) {
        grow(r, E, nid, p, {
          base: [inX(), -r() * 0.3],
          dir: -Math.PI / 2 + p.lean * 0.5 + (r() - 0.5) * 0.7,
          len: 0.6 + r() * 0.5,
          d0: 40 + i * 130,
          tip: l.wi === 0 && i === 0 ? 'rose' : null,
        });
      }
      if (r() < 0.4 * p.dens) {
        grow(r, E, nid, p, {
          base: [inX(), -0.1 - r() * 0.35],
          dir: Math.PI / 2 + (r() - 0.5) * 0.8,
          len: 0.35 + r() * 0.35,
          d0: 160,
        });
      }
      if (l.prev && r() < p.bridgeP) {
        const px = -(mw(l.prev.ch) + w) / 2;
        const a = [inX(), -0.05 - r() * 0.55] as [number, number];
        const b = [px + (r() - 0.5) * 0.25, -0.05 - r() * 0.55] as [number, number];
        const bulge = (r() < 0.55 ? -1 : 1) * (0.4 + r() * 0.4);
        const dx = b[0] - a[0];
        let P = bez(a, [a[0] + dx * 0.15, a[1] + bulge], [b[0] - dx * 0.15, b[1] + bulge * 0.9], b, 40);
        if (r() < 0.45) P = P.slice(0, Math.floor(P.length * (0.7 + r() * 0.2)));
        grow(r, E, nid, p, {
          pts: P,
          len: Math.abs(dx) + Math.abs(bulge),
          d0: 90,
          tip: r() < 0.5 ? 'curl' : r() < 0.5 ? 'leaf' : 'rose',
        });
      }
      if (l.wi === 0) {
        grow(r, E, nid, p, {
          base: [-w * 0.3, -0.15 - r() * 0.4],
          dir: Math.PI + (r() - 0.5) * 1.2,
          len: 0.45 + r() * 0.3,
          d0: 120,
          tip: 'curl',
        });
      }
      l.els = E;
      l.endEls = null;
      const T: any[] = [];
      const tr = rng(l.id * 977 + Math.floor(Math.random() * 1e6));
      grow(tr, T, () => l.id * 100 + 90 + T.length, p, {
        base: [w * 0.25, -0.1 - tr() * 0.45],
        dir: (tr() - 0.5) * 1.4,
        len: 0.45 + tr() * 0.25,
        d0: 0,
        tip: 'curl',
        depth: 1,
      });
      l.tend = T.filter((e) => e.t === 'stem').slice(0, 1);
    }

    function genEnd(l: any, rel: number) {
      const r = rng(l.ws + l.wi * 31 + Math.floor(Math.random() * 1e6));
      const p = wordParams(l.ws);
      const E: any[] = [];
      let k0 = 50;
      const nid = () => l.id * 100 + k0++;
      const w = mw(l.ch);
      const n = 1 + Math.floor(r() * 2.5);
      p.w = w;
      for (let i = 0; i < n; i++) {
        const dir = -Math.PI / 2 + 0.6 + (i - (n - 1) / 2) * 0.9 + (r() - 0.5) * 0.4;
        grow(r, E, nid, p, {
          base: [(r() - 0.2) * w * 0.6, -r() * 0.5],
          dir,
          len: 0.4 + r() * 0.45,
          d0: rel + 40 + i * 90,
          depth: 1,
          tip: i === 0 || r() < 0.5 ? 'rose' : 'fan',
        });
      }
      l.endEls = E;
    }

    function strokeRange(P: [number, number][], a: number, b: number, col: string, w: number) {
      const n = P.length - 1;
      const ia = a * n;
      const ib = Math.max(a * n + 0.001, b * n);
      const lerp = (t: number): [number, number] => {
        const i = Math.min(n - 1, Math.floor(t));
        const f = t - i;
        return [P[i][0] + (P[i + 1][0] - P[i][0]) * f, P[i][1] + (P[i + 1][1] - P[i][1]) * f];
      };
      const pts: [number, number][] = [lerp(ia)];
      for (let i = Math.floor(ia) + 1; i < ib; i++) pts.push(P[i]);
      pts.push(lerp(ib));
      if (pts.length >= 2) B.stroke(pts, col, w);
    }

    function thornAt(P: [number, number][], u: number, s: number, S: number) {
      const [p, a] = at(P, u);
      const d = a + s * 2.3;
      const L = S * 0.045;
      B.stroke([p, [p[0] + Math.cos(d) * L, p[1] + Math.sin(d) * L]], CC.blue, S * 0.022);
    }

    function leaf(bx: number, by: number, a: number, L: number, bend: number) {
      if (L < 0.5) return;
      const ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
      const N = 10, up: [number, number][] = [], dn: [number, number][] = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N, b = Math.sin(Math.PI * u) * bend * 0.18 * L;
        const sx = bx + ca * u * L + px * b, sy = by + sa * u * L + py * b;
        const wHalf = L * 0.15 * Math.sin(Math.PI * Math.min(1, u * 1.06)) + L * 0.012;
        up.push([sx + px * wHalf, sy + py * wHalf]);
        dn.push([sx - px * wHalf, sy - py * wHalf]);
      }
      dn.reverse();
      B.fill(up.concat(dn), CC.stem);
      const vs: [number, number][] = [];
      for (let i = 0; i <= 6; i++) {
        const u = i / 6, b = Math.sin(Math.PI * u) * bend * 0.18 * L;
        vs.push([bx + ca * u * L + px * b, by + sa * u * L + py * b]);
      }
      B.stroke(vs, CC.vein, Math.max(0.7, L * 0.035));
    }

    function roseDraw(x: number, y: number, R: number, rot: number, ph2: number, turns: number, prog: number) {
      if (R < 0.6 || prog <= 0) return;
      const N = 64, n = Math.max(2, Math.floor(N * prog)), pts: [number, number][] = [];
      const total = turns * Math.PI * 2;
      for (let i = 0; i <= n; i++) {
        const u = i / N, ang = rot - u * total;
        const rad = R * (1 - 0.8 * u) * (1 + 0.09 * Math.sin(ang * 4 + ph2));
        pts.push([x + Math.cos(ang) * rad, y + Math.sin(ang) * rad]);
      }
      B.stroke(pts, CC.flower, Math.max(1.2, R * 0.17));
      if (prog > 0.35) {
        B.stroke(
          pts.slice(0, Math.max(3, Math.floor(pts.length * 0.35))),
          rgba(CC.line, 0.5),
          Math.max(0.8, R * 0.06)
        );
      }
      if (prog > 0.9) {
        const c = pts[pts.length - 1];
        B.fill(circlePts(c[0], c[1], Math.max(1.2, R * 0.09)), CC.flower);
      }
    }

    function drawEl(e: any, base: number, S: number, pass: number) {
      if (e.t === 'stem') {
        const t = (base - e.d0) / e.dur;
        if (t <= 0) return;
        const gp = eo(Math.min(1, t));
        for (const s of e.segs) {
          if (s.layer !== pass) continue;
          const sp = (gp - s.u0) / (s.u1 - s.u0);
          if (sp <= 0) continue;
          const b = s.u0 + (s.u1 - s.u0) * Math.min(1, sp);
          strokeRange(e.pts, s.u0, b, CC.stem, S * 0.017 * e.w);
          for (const th of e.thorns) {
            if (th.u >= s.u0 && th.u <= b) thornAt(e.pts, th.u, th.s, S);
          }
        }
      } else if (e.t === 'leaf') {
        if (e.layer !== pass) return;
        const t = (base - e.d0) / 700;
        if (t <= 0) return;
        const sc = Math.max(0.02, Math.min(1.1, spr(Math.min(1.1, t), 6, 13)));
        leaf(e.x * S, e.y * S, e.a, e.L * S * sc, e.bend);
      } else if (e.t === 'rose') {
        if (e.layer !== pass) return;
        const t = (base - e.d0) / 1000;
        if (t <= 0) return;
        const sc = Math.max(0.02, Math.min(1.12, spr(Math.min(1.15, t), 5, 11)));
        const rot = e.rot + (1 - Math.min(1, t)) * 0.7 * (e.ph1 > 3.14 ? 1 : -1);
        roseDraw(e.x * S, e.y * S, e.R * S * sc, rot, e.ph2, e.turns, eo(Math.min(1, t * 1.2)));
      }
    }

    function sway(l: any, now: number) {
      const t = now / 1000;
      return Math.sin(t * 1.85 + l.id * 1.7) * 0.02 + Math.sin(t * 0.6 + l.id * 0.7) * 0.012 + (l.lean || 0);
    }

    function passEls(l: any, pass: number, now: number, S: number, isLast: boolean) {
      const base = now - l.birth;
      for (const e of l.els) drawEl(e, base, S, pass);
      if (l.endEls) for (const e of l.endEls) drawEl(e, base, S, pass);
      if (pass === 1 && isLast && l.tend && l.tend.length && !l.dead) {
        for (const e of l.tend) {
          const t = (now - l.tb) / 1000;
          if (t <= 0) continue;
          strokeRange(e.pts, 0, eo(Math.min(1, t)), CC.stem, S * 0.015);
        }
      }
    }

    function drawLetter(l: any, now: number, isLast: boolean) {
      const S = St || 100;
      const alpha = l.dead ? Math.max(0, 1 - (now - l.dead) / 620) : 1;
      if (alpha <= 0) return;
      g.save();
      g.globalAlpha = alpha;
      g.translate(l.x, l.y);
      g.rotate(sway(l, now) + (l.dead ? (1 - alpha) * 0.06 : 0));
      let tsc = Math.max(0.02, Math.min(1.06, spr(Math.min(1.1, (now - l.birth) / 1000), 7, 13)));
      if (l.dead) tsc *= 1 - 0.12 * (1 - alpha);
      g.scale(tsc, tsc);
      passEls(l, 0, now, S, isLast);
      g.font = `700 ${S}px ${F}`;
      g.textAlign = 'center';
      g.textBaseline = 'alphabetic';
      g.fillStyle = CC.text;
      g.fillText(l.ch, 0, 0);
      passEls(l, 1, now, S, isLast);
      g.restore();
    }

    // Butterfly simulation
    function butterfly(x: number, y: number, s: number, ang: number, o: number) {
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const T = (px: number, py: number): [number, number] => [x + (px * ca - py * sa) * s, y + (px * sa + py * ca) * s];
      const wing = (cx: number, cy: number, rx: number, ry: number, a: number, side: number): [number, number][] => {
        const pts: [number, number][] = [], c = Math.cos(a), sn = Math.sin(a);
        for (let k = 0; k < 22; k++) {
          const th = (k / 22) * Math.PI * 2, r = 1 + 0.08 * Math.sin(th * 3);
          const lx = Math.cos(th) * rx * r, ly = Math.sin(th) * ry * r;
          pts.push(T(side * (cx + lx * c - ly * sn) * (0.12 + 0.88 * o), cy + lx * sn + ly * c));
        }
        return pts;
      };
      for (const sd of [-1, 1]) {
        B.fill(wing(0.46, 0.28, 0.36, 0.3, 0.5, sd), CC.text);
        B.fill(wing(0.55, -0.32, 0.55, 0.36, -0.55, sd), CC.text);
        if (o > 0.35) B.fill(wing(0.66, -0.4, 0.13, 0.11, 0, sd), CC.red);
      }
      const body: [number, number][] = [];
      for (let k = 0; k < 18; k++) {
        const th = (k / 18) * Math.PI * 2;
        body.push(T(Math.cos(th) * 0.08, Math.sin(th) * 0.48));
      }
      B.fill(body, CC.blue);
      const lw = Math.max(0.8, s * 0.05);
      B.stroke([T(0, -0.42), T(-0.14, -0.72), T(-0.24, -0.86)], CC.blue, lw);
      B.stroke([T(0, -0.42), T(0.14, -0.72), T(0.24, -0.86)], CC.blue, lw);
    }

    function flyOff(f: any) {
      f.st = 'leave';
      f.pid = null;
      f.ex = f.x < W / 2 ? -80 : W + 80;
      f.ey = f.y - H * 0.3;
    }

    function spawnFly(cx: number, cy: number) {
      if (flies.length >= 6) {
        const o = flies.find((f) => f.st !== 'leave');
        if (o) flyOff(o);
      }
      const taken = new Set(flies.filter((f) => f.st !== 'leave').map((f) => f.pid));
      let best = null, bd = 1e9;
      for (const p of perch) {
        if (taken.has(p.id)) continue;
        const d = Math.hypot(p.x - cx, p.y - cy);
        if (d < bd) {
          bd = d;
          best = p;
        }
      }
      const left = cx < W / 2, sz = Math.max(9, Sd * 0.09);
      flies.push({
        x: left ? -40 : W + 40,
        y: cy + (Math.random() - 0.5) * H * 0.4,
        vx: 0,
        vy: 0,
        st: best ? 'fly' : 'wander',
        pid: best ? best.id : null,
        hx: cx,
        hy: cy,
        t0: performance.now(),
        ph: Math.random() * 6,
        sz,
        seed: Math.random() * 100,
        ang: 0,
      });
    }

    function drawFlies(now: number, dt: number) {
      const byId: Record<string, any> = {};
      for (const p of perch) byId[p.id] = p;
      flies = flies.filter((f) => {
        const t = (now - f.t0) / 1000;
        let tx = 0, ty = 0;
        if (f.st === 'sit' || f.st === 'fly') {
          const p = byId[f.pid];
          if (!p) flyOff(f);
          else {
            tx = p.x + p.R * 0.05;
            ty = p.y - p.R * 0.55;
          }
        }
        if (f.st === 'wander') {
          tx = f.hx + Math.sin(t * 1.3 + f.seed) * 70;
          ty = f.hy + Math.sin(t * 2.1 + f.seed) * 40;
          if (t > 3.5) flyOff(f);
        }
        if (f.st === 'leave') {
          tx = f.ex;
          ty = f.ey;
        }
        if (f.st === 'sit') {
          f.x += (tx - f.x) * 0.35;
          f.y += (ty - f.y) * 0.35;
          f.ang *= 0.85;
          f.ph += dt * 0.004;
          const burst = Math.sin((now / 1000) * 0.9 + f.seed) > 0.75;
          f.open = burst
            ? 0.2 + 0.8 * Math.abs(Math.cos((now / 1000) * 9 + f.seed))
            : 0.25 + 0.15 * Math.sin(f.ph);
        } else {
          const dx = tx - f.x, dy = ty - f.y, d = Math.hypot(dx, dy) || 1;
          const sp = f.st === 'leave' ? 0.42 : Math.min(0.34, 0.06 + d * 0.0016);
          const flut = Math.sin(t * 7 + f.seed) * 0.12, wob = Math.cos(t * 4.3 + f.seed) * 0.1;
          const ax = (dx / d) * sp + wob - f.vx, ay = (dy / d) * sp + flut - f.vy;
          f.vx += (ax * 0.06 * dt) / 16;
          f.vy += (ay * 0.06 * dt) / 16;
          f.x += f.vx * dt;
          f.y += f.vy * dt + Math.sin(t * 13 + f.seed) * 0.6;
          f.ang += (Math.max(-0.5, Math.min(0.5, f.vx * 1.4)) - f.ang) * 0.1;
          f.open = Math.abs(Math.cos(t * 17 + f.seed));
          if (f.st === 'fly' && d < 5) {
            f.st = 'sit';
            f.ph = 0;
          }
          if (f.st === 'leave' && (f.x < -60 || f.x > W + 60 || f.y < -60)) return false;
        }
        butterfly(f.x, f.y, f.sz, f.ang, f.open);
        return true;
      });
    }

    function frame(now: number) {
      if (!stateRef.current.isAlive) return;
      stateRef.current.animId = requestAnimationFrame(frame);
      const dt = Math.min(48, now - (lastT || now));
      lastT = now;
      if (!W) return;

      letters = letters.filter((l) => !l.dead || now - l.dead < 640);
      const A = letters.filter((l) => !l.dead);
      const lastL = A.length ? A[A.length - 1] : null;
      const k = 1 - Math.exp(-dt / 90);

      for (const l of letters) {
        if (l.tx != null) {
          if (l.x == null) {
            l.x = l.tx;
            l.y = l.ty;
          } else {
            l.x += (l.tx - l.x) * k;
            l.y += (l.ty - l.y) * k;
          }
        }
      }

      for (const l of A) {
        let target = 0;
        if (mx != null && my != null) {
          const dx = mx - l.x, dy = my - l.y, d = Math.hypot(dx, dy);
          if (d < 300 && d > 0.001) {
            const w = 1 - d / 300, s = w * w * (3 - 2 * w);
            target = Math.max(-0.14, Math.min(0.14, dx / 260)) * s;
          }
        }
        l.lean = (l.lean || 0) + (target - l.lean) * Math.min(1, dt / 110);
      }

      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = CC.bg;
      g.fillRect(0, 0, W, H);
      const S = St || Sd || 100;
      perch = [];

      for (const l of A) {
        const sw = sway(l, now), cs = Math.cos(sw), sn = Math.sin(sw);
        for (const e of l.els.concat(l.endEls || [])) {
          if (e.t === 'rose') {
            if (now - l.birth - e.d0 < 500) continue;
            const lx = e.x * S, ly = e.y * S;
            perch.push({ id: e.id, x: l.x + (lx * cs - ly * sn), y: l.y + (lx * sn + ly * cs), R: e.R * S });
          }
        }
      }

      gifts.forEach((gt, i) => perch.push({ id: 'g' + i, x: gt.x * W, y: gt.y * H, R: Sd * 0.16 }));
      for (const gt of gifts) {
        const t = (now - gt.t0) / 1000;
        const sc = Math.max(0.02, Math.min(1.1, spr(Math.min(1.1, t), 5, 11)));
        const sw2 = Math.sin((now / 1000) * 1.2 + gt.e.ph1) * 0.05;
        roseDraw(gt.x * W, gt.y * H, Sd * 0.16 * sc, gt.rot + sw2, gt.e.ph2, gt.e.turns, eo(Math.min(1, t)));
      }

      for (const l of letters) drawLetter(l, now, l === lastL);

      if (!document.hidden && perch.length >= 4 && flies.length < 2 && now > nextFly) {
        nextFly = now + 9000 + Math.random() * 9000;
        const p = perch[(Math.random() * perch.length) | 0];
        spawnFly(p.x, p.y);
      }

      drawFlies(now, dt);
    }

    function add(ch: string, now: number) {
      const A = letters.filter((l) => !l.dead), last = A[A.length - 1];
      if (ch === ' ') {
        if (last && last.ch !== ' ') {
          last.cut = now;
          genEnd(last, now - last.birth);
        }
        letters.push({ ch: ' ', id: uid++, birth: now, els: [] });
        layout();
        return;
      }
      const same = last && last.ch !== ' ';
      const l = {
        ch,
        id: uid++,
        birth: now,
        tb: now,
        ws: same ? last.ws : Math.floor(Math.random() * 1e9),
        wi: same ? last.wi + 1 : 0,
        prev: same ? last : null,
      };
      gen(l);
      letters.push(l);
      layout();
      setTypedCount((c) => c + 1);
    }

    function wither(now: number) {
      const A = letters.filter((l) => !l.dead), last = A[A.length - 1];
      if (!last) return;
      last.dead = now;
      const pv = A[A.length - 2];
      if (pv && pv.ch !== ' ') {
        pv.cut = null;
        pv.endEls = null;
        pv.tb = now;
      }
      layout();
    }

    function stopAuto() {
      if (!autoOn) return;
      autoOn = false;
      if (autoTimer) clearTimeout(autoTimer);
      if (nextFly === Infinity) nextFly = performance.now() + 6000;
    }

    function startShow() {
      if (autoTimer) clearTimeout(autoTimer);
      letters = [];
      gifts = [];
      flies = [];
      layout(true);
      autoI = 0;
      autoOn = true;
      nextFly = Infinity;
      setShowNextPrompt(false);

      const step = () => {
        if (!autoOn || !stateRef.current.isAlive) return;
        if (autoI >= MSG.length) {
          autoOn = false;
          nextFly = performance.now() + 2500;
          setShowNextPrompt(true);
          return;
        }
        const ch = MSG[autoI++];
        add(ch, performance.now());
        let d = 230 + Math.random() * 240;
        if (ch === ' ') d = 520;
        if (MSG[autoI] === 'J') d = 700; // soft breath
        autoTimer = setTimeout(step, d);
      };

      autoTimer = setTimeout(step, 800);
      stateRef.current.autoTimer = autoTimer;
    }

    stateRef.current.startShowFn = startShow;

    function savePNG() {
      if (!canvasRef.current) return;
      canvasRef.current.toBlob((b) => {
        if (!b) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = (MSG.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'garden') + '.png';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }, 'image/png');
    }
    stateRef.current.savePngFn = savePNG;

    // Pointer events
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    };
    const handlePointerLeave = () => {
      mx = null;
    };
    const handlePointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest('button')) return;
      inp.focus({ preventScroll: true });
      const now = performance.now();
      const lp = lastTap;
      const rect = container.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      lastTap = { t: now, x: cx, y: cy };

      if (lp && now - lp.t < 340 && Math.hypot(cx - lp.x, cy - lp.y) < 40 && now - (lastPlant || 0) > 1800) {
        lastPlant = now;
        lastTap = null;
        const s = Math.floor(Math.random() * 1e6);
        const r = rng(s);
        gifts.push({
          x: cx / W,
          y: cy / H,
          t0: now,
          rot: (r() - 0.5) * 0.8,
          e: { ph1: r() * 6.283, ph2: r() * 6.283, turns: 1.4 + r() * 0.5 },
        });
        if (gifts.length > 14) gifts.shift();
      }
    };

    // Keyboard handling
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          savePNG();
        }
        return;
      }
      if (e.target && (e.target as HTMLElement).tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) return;
      const now = performance.now();
      if (e.key === 'Backspace') {
        e.preventDefault();
        stopAuto();
        wither(now);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        stopAuto();
        letters = [];
        gifts = [];
        layout();
        return;
      }
      if (e.key.length !== 1) return;
      e.preventDefault();
      stopAuto();
      add(e.key, now);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('keydown', handleKeyDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);
    container.addEventListener('pointerdown', handlePointerDown);

    resize();
    stateRef.current.animId = requestAnimationFrame(frame);

    // Initial boot
    const fontLoad =
      document.fonts && document.fonts.load
        ? document.fonts.load('700 100px "Playfair Display"').then(() => {
            cache = {};
            layout(true);
          })
        : Promise.resolve();

    Promise.race([fontLoad, new Promise((r) => setTimeout(r, 1200))]).then(() => {
      if (!stateRef.current.isAlive) return;
      cache = {};
      layout(true);
      startShow();
    });

    return () => {
      stateRef.current.isAlive = false;
      if (stateRef.current.animId) cancelAnimationFrame(stateRef.current.animId);
      if (autoTimer) clearTimeout(autoTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      container.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [MSG]);

  const currentPal = PALETTES[currentPalIndex];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden select-none transition-colors duration-500"
      style={{ backgroundColor: currentPal.bg }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      <input
        ref={inputRef}
        type="text"
        className="fixed -left-96 -top-96 opacity-0 pointer-events-none"
        aria-label="Type to grow garden"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {/* Prominent Next Step Prompt: "There is one more thing you should know..." */}
      <div className="absolute top-16 sm:top-20 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 z-30 flex justify-center pointer-events-auto">
        <button
          onClick={onProceedToAnimationTwo}
          className="group relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium tracking-wide shadow-2xl backdrop-blur-xl border border-rose-400/40 bg-gradient-to-r from-rose-950/90 via-black/90 to-rose-950/90 text-rose-100 hover:text-white hover:border-rose-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 animate-pulse cursor-pointer max-w-md w-full text-center"
        >
          <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-rose-500 text-rose-400 shrink-0 group-hover:scale-125 transition-transform" />
          <span className="font-['Playfair_Display'] font-semibold leading-tight text-balance">
            There is one more thing you should know... click here to find out
          </span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Bottom control bar with safe area */}
      <div className="absolute bottom-2 left-2 right-2 sm:bottom-6 sm:left-6 sm:right-6 z-20 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 font-mono text-[11px] sm:text-xs pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {/* Interactive hints */}
        <div
          className="hidden sm:flex flex-wrap items-center gap-x-4 gap-y-1 opacity-75"
          style={{ color: currentPal.text }}
        >
          <span>type to grow</span>
          <span>· space cuts</span>
          <span>· backspace withers</span>
          <span>· double-click plants a rose</span>
        </div>
        <div
          className="sm:hidden text-[10px] opacity-70 tracking-wider text-center"
          style={{ color: currentPal.text }}
        >
          <span>tap to type · double-tap plants rose</span>
        </div>

        {/* Palettes, Replay & Save PNG in a single unified bar */}
        <div className="flex items-center gap-2 max-w-full overflow-x-auto py-1 px-1">
          <div
            className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full border backdrop-blur-md overflow-x-auto max-w-[190px] sm:max-w-none"
            style={{
              borderColor: `${currentPal.text}33`,
              backgroundColor: `${currentPal.bg}99`,
            }}
          >
            {PALETTES.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentPalIndex(idx);
                  const event = new CustomEvent('setpal', { detail: idx });
                  window.dispatchEvent(event);
                }}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-transform shrink-0 cursor-pointer ${
                  currentPalIndex === idx ? 'scale-115 ring-2 ring-white/80' : 'scale-90 hover:scale-100'
                }`}
                style={{ backgroundColor: p.bg, border: `1px solid ${p.text}66` }}
                title={p.name}
              >
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: p.flower }} />
              </button>
            ))}
          </div>

          <button
            onClick={() => stateRef.current.startShowFn()}
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border backdrop-blur-md transition-all shrink-0 cursor-pointer text-[10px] sm:text-xs"
            style={{
              borderColor: `${currentPal.text}33`,
              backgroundColor: `${currentPal.bg}88`,
              color: currentPal.text,
            }}
            title="Grow the note again"
          >
            <RotateCcw className="w-3 h-3" />
            <span>replay</span>
          </button>

          <button
            onClick={() => stateRef.current.savePngFn()}
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border backdrop-blur-md transition-colors shrink-0 cursor-pointer text-[10px] sm:text-xs"
            style={{
              borderColor: `${currentPal.text}33`,
              backgroundColor: `${currentPal.bg}88`,
              color: currentPal.text,
            }}
          >
            <Download className="w-3 h-3" />
            <span>save</span>
          </button>
        </div>
      </div>
    </div>
  );
};
