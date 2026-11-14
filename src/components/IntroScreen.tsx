import React, { useState } from 'react';
import { ArrowRight, Sparkles, Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../types';
import { IntroStageGraphic, SkillPathMark } from './Illustrations';

interface IntroScreenProps {
  theme: ThemeMode;
  effectsEnabled: boolean;
  onToggleTheme: () => void;
  onToggleEffects: () => void;
  onComplete: () => void;
}

const INTRO_STAGES = [
  {
    kicker: 'Precision Career Navigation',
    headline: 'Every career leap starts with clarity.',
    body: 'Map where your engineering skills stand today before choosing what to study next.',
    cta: 'Reveal Step 1',
  },
  {
    kicker: 'Targeted Skill Gaps',
    headline: 'Isolate the exact gaps that matter.',
    body: 'Compare your current baseline against Full Stack, Data Science, or DevOps benchmarks.',
    cta: 'Reveal Step 2',
  },
  {
    kicker: 'Verified Progression',
    headline: 'Learn in prerequisite order and prove mastery.',
    body: 'Complete curated resources, practical exercises, and scored assessments at your own pace.',
    cta: 'Enter SkillPath',
  },
];

export function IntroScreen({
  theme,
  effectsEnabled,
  onToggleTheme,
  onToggleEffects,
  onComplete,
}: IntroScreenProps) {
  const [stage, setStage] = useState(0);

  const current = INTRO_STAGES[stage];

  const handleAdvance = () => {
    if (stage < INTRO_STAGES.length - 1) {
      setStage((s) => s + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-between px-4 py-5 sm:px-8 sm:py-7">
      <header className="flex items-center justify-between gap-4 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <SkillPathMark className="w-7 h-7" />
          <span className="font-display text-2xl font-semibold tracking-tight">SkillPath</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleEffects}
            className="px-3 py-2 rounded-lg text-xs font-mono sp-card hover:border-[var(--sp-gold-bright)] whitespace-nowrap shrink-0"
          >
            Effects: {effectsEnabled ? 'On' : 'Off'}
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium sp-card hover:border-[var(--sp-gold-bright)] whitespace-nowrap shrink-0"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button
            type="button"
            onClick={onComplete}
            className="px-3 py-2 rounded-lg text-xs font-medium text-[var(--sp-text-muted)] hover:text-[var(--sp-text)] transition-colors whitespace-nowrap shrink-0"
          >
            Skip intro
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-2xl">
          <button
            type="button"
            onClick={handleAdvance}
            data-testid="intro-stage-button"
            className="w-full text-center sp-card sp-spotlight-card rounded-2xl p-8 sm:p-12 cursor-pointer hover:border-[var(--sp-gold-bright)] focus-visible:ring-2 transition-all"
          >
            <div key={stage} className="sp-animate-reveal space-y-6">
              <div className="flex items-center justify-center gap-2 text-xs font-mono tracking-wide text-[var(--sp-teal)]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{current.kicker}</span>
              </div>

              <IntroStageGraphic stage={stage} />

              <div className="space-y-3 max-w-lg mx-auto">
                <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight text-balance">
                  {current.headline}
                </h1>
                <p className="text-sm sm:text-base text-[var(--sp-text-muted)] leading-relaxed">
                  {current.body}
                </p>
              </div>

              <div className="pt-2 flex flex-col items-center gap-4">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--sp-gold-bright)] text-[#12151e] shadow-sm">
                  <span>{current.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>

                <div className="flex items-center gap-2" aria-label={`Step ${stage + 1} of ${INTRO_STAGES.length}`}>
                  {INTRO_STAGES.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === stage
                          ? 'w-7 bg-[var(--sp-gold-bright)]'
                          : idx < stage
                          ? 'w-3 bg-[var(--sp-teal)]'
                          : 'w-2 bg-[var(--sp-border-strong)]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[var(--sp-text-muted)]">
                  Click anywhere on this card to advance
                </span>
              </div>
            </div>
          </button>
        </div>
      </main>

      <footer className="max-w-6xl w-full mx-auto flex items-center justify-between text-xs text-[var(--sp-text-muted)]">
        <span>SkillPath Career-Learning Platform</span>
        <span className="font-mono">
          {stage + 1} / {INTRO_STAGES.length}
        </span>
      </footer>
    </div>
  );
}
