import React, { useState } from 'react';
import { ArrowRight, KeyRound, Moon, ShieldAlert, Sun } from 'lucide-react';
import { LearnerProfile, ThemeMode } from '../types';
import {
  createDemoResetCode,
  createSimulatedAccount,
  enterDemoSession,
  signInSimulatedAccount,
  signInSimulatedGoogle,
  verifyDemoResetAndUpdatePassword,
} from '../utils/storage';
import {
  CareerRoadmapHeroIllustration,
  FocusTargetIllustration,
  GrowthChartIllustration,
  LearningPathIllustration,
  SkillPathMark,
} from './Illustrations';

interface AuthScreenProps {
  theme: ThemeMode;
  effectsEnabled: boolean;
  storageDegraded: boolean;
  onToggleTheme: () => void;
  onToggleEffects: () => void;
  onAuthenticated: (profile: LearnerProfile) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export function AuthScreen({
  theme,
  effectsEnabled,
  storageDegraded,
  onToggleTheme,
  onToggleEffects,
  onAuthenticated,
}: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex@skillpath.demo');
  const [password, setPassword] = useState('skillpath123');
  const [resetEmail, setResetEmail] = useState('alex@skillpath.demo');
  const [generatedDemoCode, setGeneratedDemoCode] = useState<string | null>(null);
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const result = signInSimulatedAccount(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onAuthenticated(result.account.profile);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const result = createSimulatedAccount(name, email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onAuthenticated(result.account.profile);
  };

  const handleGoogleSimulated = () => {
    setError(null);
    const account = signInSimulatedGoogle();
    onAuthenticated(account.profile);
  };

  const handleDemoMode = () => {
    setError(null);
    const demoProfile = enterDemoSession();
    onAuthenticated(demoProfile);
  };

  const handleRequestResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const res = createDemoResetCode(resetEmail);
    if (!res.ok) {
      setError(res.error);
      setGeneratedDemoCode(null);
      return;
    }
    setGeneratedDemoCode(res.code);
    setNotice('Demo-only reset code generated locally. No real email was sent.');
  };

  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = verifyDemoResetAndUpdatePassword(resetEmail, resetCodeInput, newPassword);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setGeneratedDemoCode(null);
    setResetCodeInput('');
    setNewPassword('');
    setMode('signin');
    setEmail(resetEmail);
    setPassword('');
    setNotice('Simulated account password updated in browser storage. Sign in with your new password.');
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col px-4 py-5 sm:px-8 sm:py-6">
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4 pb-6">
        <div className="flex items-center gap-2.5 shrink-0">
          <SkillPathMark className="w-7 h-7" />
          <span className="font-display text-2xl font-semibold tracking-tight whitespace-nowrap">
            SkillPath
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start py-2">
        {/* Left: Editorial Hero + 3 Feature Cards + Architecture SVG */}
        <section className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-mono tracking-wide text-[var(--sp-teal)]">
              SkillPath Career-Learning Platform
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.08] tracking-tight text-balance">
              Learn. Grow. Get there.
            </h1>
            <p className="text-base text-[var(--sp-text-muted)] max-w-xl leading-relaxed">
              Pinpoint real skill gaps against your target engineering role, follow a prerequisite-ordered roadmap, and verify readiness with practical assessments.
            </p>
          </div>

          {/* 3 Compact Feature Cards with Inline SVGs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <article className="sp-card sp-spotlight-card rounded-xl p-4 space-y-3">
              <FocusTargetIllustration className="w-10 h-10" />
              <div className="space-y-1">
                <h2 className="font-display text-xl font-semibold leading-snug">Find your focus</h2>
                <p className="text-xs text-[var(--sp-text-muted)] leading-relaxed">
                  Measure your current proficiency against role benchmarks to surface priority gaps.
                </p>
              </div>
            </article>

            <article className="sp-card sp-spotlight-card rounded-xl p-4 space-y-3">
              <LearningPathIllustration className="w-10 h-10" />
              <div className="space-y-1">
                <h2 className="font-display text-xl font-semibold leading-snug">Follow your path</h2>
                <p className="text-xs text-[var(--sp-text-muted)] leading-relaxed">
                  Learn in prerequisite tiers with curated guides, labs, and practical exercises.
                </p>
              </div>
            </article>

            <article className="sp-card sp-spotlight-card rounded-xl p-4 space-y-3">
              <GrowthChartIllustration className="w-10 h-10" />
              <div className="space-y-1">
                <h2 className="font-display text-xl font-semibold leading-snug">Track your growth</h2>
                <p className="text-xs text-[var(--sp-text-muted)] leading-relaxed">
                  Pass skill assessments to level up automatically and watch role fit climb.
                </p>
              </div>
            </article>
          </div>

          {/* Larger Career-Learning Architecture Illustration */}
          <div className="sp-card rounded-2xl p-4 sm:p-5">
            <CareerRoadmapHeroIllustration />
          </div>
        </section>

        {/* Right: Concise Simulated Auth Card */}
        <aside className="lg:col-span-5">
          <div className="sp-card sp-spotlight-card rounded-2xl p-6 sm:p-7 space-y-5">
            {storageDegraded && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300 dark:text-amber-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Browser storage is restricted; changes stay active in memory for this session.</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleDemoMode}
              className="w-full py-3 px-4 rounded-xl bg-[var(--sp-gold-bright)] hover:opacity-95 text-[#12151e] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-opacity shadow-sm cursor-pointer"
            >
              <span>Try Demo Mode · No account needed</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 text-xs text-[var(--sp-text-muted)]">
              <div className="h-px flex-1 bg-[var(--sp-border)]" />
              <span>or use a simulated local account</span>
              <div className="h-px flex-1 bg-[var(--sp-border)]" />
            </div>

            <div
              role="tablist"
              aria-label="Authentication mode"
              className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[var(--sp-surface-muted)]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signin'}
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setNotice(null);
                }}
                className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  mode === 'signin'
                    ? 'bg-[var(--sp-surface-solid)] text-[var(--sp-text)] shadow-sm'
                    : 'text-[var(--sp-text-muted)] hover:text-[var(--sp-text)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setNotice(null);
                }}
                className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  mode === 'signup'
                    ? 'bg-[var(--sp-surface-solid)] text-[var(--sp-text)] shadow-sm'
                    : 'text-[var(--sp-text-muted)] hover:text-[var(--sp-text)]'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'forgot'}
                onClick={() => {
                  setMode('forgot');
                  setError(null);
                  setNotice(null);
                }}
                className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  mode === 'forgot'
                    ? 'bg-[var(--sp-surface-solid)] text-[var(--sp-text)] shadow-sm'
                    : 'text-[var(--sp-text-muted)] hover:text-[var(--sp-text)]'
                }`}
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-600 dark:text-rose-300">
                {error}
              </div>
            )}

            {notice && (
              <div role="status" className="rounded-lg border border-teal-500/40 bg-teal-500/10 px-3 py-2.5 text-xs text-teal-700 dark:text-teal-300">
                {notice}
              </div>
            )}

            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div className="space-y-1">
                  <label htmlFor="signin-email" className="block text-xs font-medium text-[var(--sp-text-muted)]">
                    Email address
                  </label>
                  <input
                    id="signin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@skillpath.demo"
                    className="sp-input w-full rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="signin-password" className="block text-xs font-medium text-[var(--sp-text-muted)]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-[var(--sp-gold-bright)] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="signin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="sp-input w-full rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-teal-700 text-white dark:bg-[#2dd4bf] dark:text-[#091214] font-semibold text-sm transition-opacity cursor-pointer"
                >
                  Sign In (Simulated)
                </button>
                <p className="text-[11px] font-mono text-[var(--sp-text-muted)]">
                  Sample demo login: alex@skillpath.demo / skillpath123
                </p>
              </form>
            )}

            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div className="space-y-1">
                  <label htmlFor="signup-name" className="block text-xs font-medium text-[var(--sp-text-muted)]">
                    Full name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Lee"
                    className="sp-input w-full rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="signup-email" className="block text-xs font-medium text-[var(--sp-text-muted)]">
                    Email address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jordan@example.com"
                    className="sp-input w-full rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="signup-password" className="block text-xs font-medium text-[var(--sp-text-muted)]">
                    Password (min 6 characters)
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a demo password"
                    className="sp-input w-full rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-teal-700 text-white dark:bg-[#2dd4bf] dark:text-[#091214] hover:opacity-95 font-semibold text-sm transition-opacity cursor-pointer"
                >
                  Create Account (Simulated)
                </button>
              </form>
            )}

            {mode === 'forgot' && (
              <div className="space-y-4">
                <form onSubmit={handleRequestResetCode} className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="reset-email" className="block text-xs font-medium text-[var(--sp-text-muted)]">
                      Simulated account email
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="sp-input w-full rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-lg border border-[var(--sp-border-strong)] hover:border-[var(--sp-gold-bright)] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Generate Demo-Only Reset Code
                  </button>
                </form>

                {generatedDemoCode && (
                  <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--sp-gold-bright)]">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Demo-Only Reset Code (No email sent)</span>
                    </div>
                    <p className="font-mono text-lg font-semibold tracking-widest">
                      {generatedDemoCode}
                    </p>
                  </div>
                )}

                <form onSubmit={handleConfirmReset} className="space-y-3 pt-1 border-t border-[var(--sp-border)]">
                  <div className="space-y-1">
                    <label htmlFor="reset-code" className="block text-xs font-medium text-[var(--sp-text-muted)]">
                      Enter demo reset code
                    </label>
                    <input
                      id="reset-code"
                      type="text"
                      required
                      value={resetCodeInput}
                      onChange={(e) => setResetCodeInput(e.target.value)}
                      placeholder="6-digit demo code"
                      className="sp-input w-full rounded-lg px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="reset-new-password" className="block text-xs font-medium text-[var(--sp-text-muted)]">
                      New password
                    </label>
                    <input
                      id="reset-new-password"
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="sp-input w-full rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-lg bg-teal-700 text-white dark:bg-[#2dd4bf] dark:text-[#091214] hover:opacity-95 font-semibold text-sm cursor-pointer"
                  >
                    Update Demo Password
                  </button>
                </form>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSimulated}
              className="w-full py-2.5 px-4 rounded-lg border border-[var(--sp-border-strong)] hover:border-[var(--sp-gold-bright)] text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.2 14.7 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z"
                />
              </svg>
              <span>Continue with Google (Simulated)</span>
            </button>

            <p className="text-[11px] leading-relaxed text-[var(--sp-text-muted)] border-t border-[var(--sp-border)] pt-3">
              Simulated authentication: sample accounts and progress are saved locally in browser storage. This is a front-end demo, not a secure production login service.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
