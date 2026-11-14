import React from 'react';
import { ArrowRight, CheckCircle2, Compass, Target } from 'lucide-react';
import { SKILL_LEVEL_LABELS, TARGET_ROLES } from '../data/catalog';
import { AppTab, LearnerProfile } from '../types';
import { calculateRoleFit, getRecommendedNextSteps } from '../utils/skillEngine';

interface DashboardTabProps {
  profile: LearnerProfile;
  onNavigateTab: (tab: AppTab, skillId?: string) => void;
}

export function DashboardTab({ profile, onNavigateTab }: DashboardTabProps) {
  const role = TARGET_ROLES[profile.targetRole];
  const fit = calculateRoleFit(profile);
  const nextSteps = getRecommendedNextSteps(profile);

  return (
    <div className="space-y-6">
      {/* Role Summary Banner + 4 KPI Metrics */}
      <section className="sp-card sp-spotlight-card rounded-2xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-mono text-[var(--sp-teal)]">Target Role Readiness</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
              {role.title}
            </h2>
            <p className="text-sm text-[var(--sp-text-muted)] max-w-2xl">{role.tagline}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('roadmap')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--sp-gold-bright)] text-[#12151e] text-xs font-semibold hover:opacity-95 whitespace-nowrap cursor-pointer"
            >
              <span>Open Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[var(--sp-border)]">
          <div className="rounded-xl bg-[var(--sp-surface-muted)] p-4">
            <p className="text-xs text-[var(--sp-text-muted)]">Target-Role Fit</p>
            <p className="font-mono text-2xl font-semibold tabular-nums mt-1 text-[var(--sp-gold-bright)]">
              {fit.fitPercent}%
            </p>
            <p className="text-[11px] text-[var(--sp-text-muted)] mt-1">
              {fit.readyCount} of {fit.totalRequiredSkills} skills ready
            </p>
          </div>

          <div className="rounded-xl bg-[var(--sp-surface-muted)] p-4">
            <p className="text-xs text-[var(--sp-text-muted)]">Skill Gaps</p>
            <p className="font-mono text-2xl font-semibold tabular-nums mt-1">
              {fit.gapsOnly.length}
            </p>
            <p className="text-[11px] text-[var(--sp-text-muted)] mt-1">
              {fit.developingCount} developing · {fit.gapCount} priority gaps
            </p>
          </div>

          <div className="rounded-xl bg-[var(--sp-surface-muted)] p-4">
            <p className="text-xs text-[var(--sp-text-muted)]">Role Resources</p>
            <p className="font-mono text-2xl font-semibold tabular-nums mt-1 text-[var(--sp-teal)]">
              {fit.resourceCompletionPercent}%
            </p>
            <p className="text-[11px] text-[var(--sp-text-muted)] mt-1">
              {fit.completedResourceCount} / {fit.totalResourceCount} completed
            </p>
          </div>

          <div className="rounded-xl bg-[var(--sp-surface-muted)] p-4">
            <p className="text-xs text-[var(--sp-text-muted)]">Portfolio Proof</p>
            <p className="font-mono text-2xl font-semibold tabular-nums mt-1">
              {profile.projects.length + profile.certifications.length}
            </p>
            <p className="text-[11px] text-[var(--sp-text-muted)] mt-1">
              {profile.projects.length} {profile.projects.length === 1 ? 'project' : 'projects'} ·{' '}
              {profile.certifications.length}{' '}
              {profile.certifications.length === 1 ? 'certification' : 'certifications'}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Skill Gaps Matrix */}
        <section className="lg:col-span-7 sp-card rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--sp-gold-bright)] shrink-0" />
              <h3 className="font-display text-2xl font-semibold">Skill Gap Breakdown</h3>
            </div>
            <span className="text-xs font-mono text-[var(--sp-text-muted)] whitespace-nowrap shrink-0">
              {fit.totalRequiredSkills} required skills
            </span>
          </div>

          <div className="divide-y divide-[var(--sp-border)]">
            {fit.skills.map((item) => {
              const pct = Math.min(100, Math.round((item.currentLevel / item.targetLevel) * 100));
              return (
                <div key={item.skill.id} className="py-3.5 first:pt-1 last:pb-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.skill.name}</p>
                      <p className="text-xs text-[var(--sp-text-muted)]">
                        {item.skill.category} · Current: {SKILL_LEVEL_LABELS[item.currentLevel]} ({item.currentLevel}/5) · Target: {item.targetLevel}/5
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-mono font-medium ${
                          item.status === 'Ready'
                            ? 'text-[var(--sp-teal)]'
                            : item.status === 'Developing'
                            ? 'text-[var(--sp-gold-bright)]'
                            : 'text-rose-500 dark:text-rose-400'
                        }`}
                      >
                        {item.status === 'Ready' ? 'Ready' : `Gap -${item.gap}`}
                      </span>
                      {item.gap > 0 && (
                        <button
                          type="button"
                          onClick={() => onNavigateTab('assessment', item.skill.id)}
                          className="px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--sp-border-strong)] hover:border-[var(--sp-gold-bright)] whitespace-nowrap cursor-pointer"
                        >
                          Assess
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--sp-surface-muted)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        background:
                          item.status === 'Ready'
                            ? 'var(--sp-teal)'
                            : 'linear-gradient(90deg, var(--sp-teal), var(--sp-gold-bright))',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Recommended Next Steps + Agent Activity Log */}
        <div className="lg:col-span-5 space-y-6">
          <section className="sp-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[var(--sp-teal)]" />
              <h3 className="font-display text-2xl font-semibold">Recommended Next Steps</h3>
            </div>

            {nextSteps.length === 0 ? (
              <div className="rounded-xl bg-[var(--sp-surface-muted)] p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--sp-teal)] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">All role benchmarks reached</p>
                  <p className="text-xs text-[var(--sp-text-muted)]">
                    Switch target roles in the top bar or explore elective modules in the Roadmap tab.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {nextSteps.map((node) => (
                  <div
                    key={node.skill.id}
                    className="rounded-xl bg-[var(--sp-surface-muted)] p-3.5 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{node.skill.name}</p>
                        <p className="text-xs text-[var(--sp-text-muted)]">
                          {node.prerequisitesMet
                            ? 'Prerequisites satisfied · Ready now'
                            : `Requires: ${node.missingPrerequisites.map((p) => p.name).join(', ')}`}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-[var(--sp-gold-bright)] whitespace-nowrap">
                        Lv {node.currentLevel} → {node.targetLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onNavigateTab('roadmap', node.skill.id)}
                        className="px-3 py-1.5 rounded-md bg-[var(--sp-surface-solid)] border border-[var(--sp-border)] hover:border-[var(--sp-gold-bright)] text-xs font-medium cursor-pointer"
                      >
                        Study in Roadmap
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigateTab('assessment', node.skill.id)}
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--sp-teal)] hover:underline cursor-pointer"
                      >
                        Take Quiz
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="sp-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">Agent Activity Log</h3>
              <span className="text-[11px] font-mono text-[var(--sp-text-muted)]">
                {profile.activityLog.length} events
              </span>
            </div>

            {profile.activityLog.length === 0 ? (
              <p className="text-xs text-[var(--sp-text-muted)]">
                No activity recorded yet. Complete a resource or assessment to populate this log.
              </p>
            ) : (
              <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {profile.activityLog.slice(0, 10).map((entry) => (
                  <li
                    key={entry.id}
                    className="border-b border-[var(--sp-border)] pb-2.5 last:border-b-0 last:pb-0 space-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[var(--sp-text-muted)]">
                      <span className={entry.actor === 'SkillPath Agent' ? 'text-[var(--sp-teal)]' : 'text-[var(--sp-gold-bright)]'}>
                        {entry.actor}
                      </span>
                      <span className="tabular-nums">{entry.timestamp}</span>
                    </div>
                    <p className="text-xs font-medium">{entry.action}</p>
                    <p className="text-xs text-[var(--sp-text-muted)] leading-relaxed">{entry.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
