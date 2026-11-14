import React, { useEffect, useRef, useState } from 'react';
import { ThemeMode } from '../types';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface BackgroundEffectsProps {
  effectsEnabled: boolean;
  theme: ThemeMode;
}

interface StarNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  char: string;
  alpha: number;
}

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

const CODE_CHARS = ['0', '1', '{', '}', '/', '>', '<', ';', '=', '+', 'λ', 'Δ'];

export function BackgroundEffects({ effectsEnabled, theme }: BackgroundEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const sparklesRef = useRef<Sparkle[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    if (!effectsEnabled) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    const width = () => window.innerWidth;
    const height = () => window.innerHeight;

    const nodeCount = Math.min(36, Math.max(18, Math.floor(window.innerWidth / 44)));
    const stars: StarNode[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width(),
      y: Math.random() * height(),
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: 1.1 + Math.random() * 1.4,
    }));

    const colCount = Math.min(28, Math.max(12, Math.floor(window.innerWidth / 58)));
    const drops: RainDrop[] = Array.from({ length: colCount }, (_, idx) => ({
      x: (idx + 0.5) * (width() / colCount),
      y: Math.random() * height(),
      speed: 0.35 + Math.random() * 0.55,
      char: CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
      alpha: 0.04 + Math.random() * 0.08,
    }));

    let rafId = 0;

    const renderFrame = () => {
      const w = width();
      const h = height();
      ctx.clearRect(0, 0, w, h);

      const isDark = theme === 'dark';
      const starColor = isDark ? '212, 168, 79' : '158, 107, 19';
      const lineColor = isDark ? '45, 212, 191' : '15, 118, 110';
      const rainColor = isDark ? '148, 163, 184' : '100, 116, 139';

      // Subtle code rain
      ctx.font = '11px "JetBrains Mono", monospace';
      for (const drop of drops) {
        drop.y += drop.speed;
        if (drop.y > h + 20) {
          drop.y = -16;
          drop.char = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
        }
        ctx.fillStyle = `rgba(${rainColor}, ${isDark ? drop.alpha : drop.alpha * 0.75})`;
        ctx.fillText(drop.char, drop.x, drop.y);
      }

      // Star network nodes and edges
      for (let i = 0; i < stars.length; i++) {
        const a = stars[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;

        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor}, ${isDark ? 0.36 : 0.24})`;
        ctx.fill();

        for (let j = i + 1; j < stars.length; j++) {
          const b = stars[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 155) {
            const opacity = (1 - dist / 155) * (isDark ? 0.14 : 0.1);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Pointer sparkles
      const nextSparkles: Sparkle[] = [];
      for (const sp of sparklesRef.current) {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life -= 0.032;
        if (sp.life > 0) {
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${starColor}, ${sp.life * 0.55})`;
          ctx.fill();
          nextSparkles.push(sp);
        }
      }
      sparklesRef.current = nextSparkles;

      rafId = window.requestAnimationFrame(renderFrame);
    };

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [effectsEnabled, theme]);

  useEffect(() => {
    if (!effectsEnabled) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${e.clientX - 180}px, ${e.clientY - 180}px, 0)`;
        glowRef.current.style.opacity = '1';
      }

      if (e.pointerType === 'mouse' && sparklesRef.current.length < 30) {
        sparklesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -0.35 - Math.random() * 0.45,
          life: 1,
          size: 1.1 + Math.random() * 1.4,
        });
      }

      const target = (e.target as HTMLElement | null)?.closest('.sp-spotlight-card') as HTMLElement | null;
      if (target) {
        const rect = target.getBoundingClientRect();
        target.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        target.style.setProperty('--my', `${e.clientY - rect.top}px`);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 560);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [effectsEnabled]);

  return (
    <>
      <canvas
        ref={canvasRef}
        data-testid="background-effects-canvas"
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      />
      {effectsEnabled && (
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-0 h-[360px] w-[360px] rounded-full opacity-0 transition-opacity duration-300"
          style={{
            background:
              theme === 'dark'
                ? 'radial-gradient(circle, rgba(212, 168, 79, 0.11) 0%, rgba(45, 212, 191, 0.04) 45%, transparent 72%)'
                : 'radial-gradient(circle, rgba(197, 139, 32, 0.1) 0%, rgba(15, 118, 110, 0.04) 45%, transparent 72%)',
          }}
        />
      )}
      {effectsEnabled &&
        ripples.map((r) => (
          <span
            key={r.id}
            aria-hidden="true"
            className="sp-click-ripple pointer-events-none fixed z-40 h-14 w-14 rounded-full border border-amber-400/50"
            style={{ left: r.x, top: r.y }}
          />
        ))}
    </>
  );
}
