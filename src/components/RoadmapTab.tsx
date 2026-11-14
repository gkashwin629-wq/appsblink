import React, { useMemo, useState } from 'react';
import { BookOpen, CheckSquare, Lock, Search, Square, Unlock } from 'lucide-react';
import { SKILL_LEVEL_LABELS, TARGET_ROLES } from '../data/catalog';
import { LearnerProfile } from '../types';
import { buildOrderedRoadmap } from '../utils/skillEngine';

interface RoadmapTabProps {
  profile: LearnerProfile;
  focusedSkillId?: string | null;
  onToggleResource: (resourceId: string, skillName: string, resourceTitle: string) => void;
  onToggleExercise: (exerciseId: string, skillName: string, exerciseTitle: string) => void;
  onOpenAssessment: (skillId: string) => void;
}

export function RoadmapTab({
  profile,
  focusedSkillId,
  onToggleResource,
  onToggleExercise,
  onOpenAssessment,
}: RoadmapTabProps) {
  const [scope, setScope] = useState<'role' | 'all'>('role');
  const [search, setSearch] = useState('');

  const allNodes = useMemo(() => buildOrderedRoadmap(profile), [profile]);
  const role = TARGET_ROLES[profile.targetRole];

  const visibleNodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allNodes.filter((node) => {
      if (scope === 'role' && !node.isRequiredForRole) return false;
      if (!q) return true;
      return (
        node.skill.name.toLowerCase().includes(q) ||
        node.skill.category.toLowerCase().includes(q) ||
        node.skill.description.toLowerCase().includes(q)
      );
    });
  }, [allNodes, scope, search]);

  return (
    <div className="space-y-6">
      <section className="sp-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-3xl font-semibold">Prerequisite-Ordered Roadmap</h2>
            <p className="text-xs text-[var(--sp-text-muted)]">
              Sequenced from foundational prerequisites to role specialization for {role.title}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center p-1 rounded-lg bg-[var(--sp-surface-muted)]">
              <button
                type="button"
                onClick={() => setScope('role')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
                  scope === 'role'
                    ? 'bg-[var(--sp-surface-solid)] text-[var(--sp-text)] shadow-sm'
                    : 'text-[var(--sp-text-muted)]'
                }`}
              >
                Role Path
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
                  scope === 'all'
                    ? 'bg-[var(--sp-surface-solid)] text-[var(--sp-text)] shadow-sm'
                    : 'text-[var(--sp-text-muted)]'
                }`}
              >
                Full Catalog
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--sp-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Filter roadmap skills"
                placeholder="Search skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sp-input rounded-lg pl-8 pr-3 py-1.5 text-xs w-48"
              />
            </div>
          </div>
        </div>
      </section>

      {visibleNodes.length === 0 ? (
        <div className="sp-card rounded-2xl p-8 text-center space-y-2">
          <p className="text-sm font-medium">No skills match your current filter.</p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setScope('all');
            }}
            className="text-xs text-[var(--sp-gold-bright)] hover:underline cursor-pointer"
          >
            Reset roadmap filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleNodes.map((node) => {
            const isHighlighted = focusedSkillId === node.skill.id;
            return (
              <article
                key={node.skill.id}
                className={`sp-card sp-spotlight-card rounded-2xl p-5 sm:p-6 space-y-4 ${
                  isHighlighted ? 'ring-2 ring-[var(--sp-gold-bright)]' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--sp-text-muted)]">
                      <span className="text-[var(--sp-gold-bright)]">Tier {node.tier + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span>{node.skill.category}</span>
                      <span aria-hidden="true">·</span>
                      {node.prerequisitesMet ? (
                        <span className="inline-flex items-center gap-1 text-[var(--sp-teal)]">
                          <Unlock className="w-3 h-3" />
                          <span>Prerequisites Ready</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-500">
                          <Lock className="w-3 h-3" />
                          <span>
                            Needs {node.missingPrerequisites.map((p) => p.name).join(', ')} (Lv 2+)
                          </span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-2xl font-semibold">{node.skill.name}</h3>
                    <p className="text-xs sm:text-sm text-[var(--sp-text-muted)] max-w-2xl">
                      {node.skill.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-mono tabular-nums">
                        Level {node.currentLevel}/5
                        {node.isRequiredForRole ? ` (Target ${node.targetLevel})` : ''}
                      </p>
                      <p className="text-[11px] text-[var(--sp-text-muted)]">
                        {SKILL_LEVEL_LABELS[node.currentLevel]}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenAssessment(node.skill.id)}
                      className="px-3.5 py-2 rounded-lg bg-[var(--sp-gold-bright)] text-[#12151e] text-xs font-semibold hover:opacity-95 whitespace-nowrap cursor-pointer"
                    >
                      Take Assessment
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-[var(--sp-border)]">
                  {/* Learning Resources */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <BookOpen className="w-3.5 h-3.5 text-[var(--sp-teal)]" />
                        <span>Learning Resources</span>
                      </span>
                      <span className="font-mono text-[var(--sp-text-muted)] tabular-nums">
                        {node.completedResourceCount}/{node.totalResourceCount} done
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {node.skill.resources.map((res) => {
                        const checked = profile.completedResources.includes(res.id);
                        return (
                          <li key={res.id}>
                            <button
                              type="button"
                              onClick={() => onToggleResource(res.id, node.skill.name, res.title)}
                              aria-pressed={checked}
                              className="w-full text-left flex items-start gap-2.5 rounded-xl bg-[var(--sp-surface-muted)] p-3 hover:border-[var(--sp-gold-bright)] border border-transparent transition-colors cursor-pointer"
                            >
                              {checked ? (
                                <CheckSquare className="w-4 h-4 text-[var(--sp-teal)] shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-4 h-4 text-[var(--sp-text-muted)] shrink-0 mt-0.5" />
                              )}
                              <div className="space-y-0.5">
                                <p className={`text-xs font-medium ${checked ? 'line-through opacity-75' : ''}`}>
                                  {res.title}
                                </p>
                                <p className="text-[11px] text-[var(--sp-text-muted)]">
                                  {res.type} · {res.durationMinutes} min — {res.summary}
                                </p>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Practical Exercises */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-medium">Practical Exercises</p>
                    <ul className="space-y-2">
                      {node.skill.exercises.map((ex) => {
                        const checked = profile.completedExercises.includes(ex.id);
                        return (
                          <li key={ex.id}>
                            <button
                              type="button"
                              onClick={() => onToggleExercise(ex.id, node.skill.name, ex.title)}
                              aria-pressed={checked}
                              className="w-full text-left flex items-start gap-2.5 rounded-xl bg-[var(--sp-surface-muted)] p-3 hover:border-[var(--sp-gold-bright)] border border-transparent transition-colors cursor-pointer"
                            >
                              {checked ? (
                                <CheckSquare className="w-4 h-4 text-[var(--sp-gold-bright)] shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-4 h-4 text-[var(--sp-text-muted)] shrink-0 mt-0.5" />
                              )}
                              <div className="space-y-0.5">
                                <p className={`text-xs font-medium ${checked ? 'line-through opacity-75' : ''}`}>
                                  {ex.title}
                                </p>
                                <p className="text-[11px] text-[var(--sp-text-muted)]">
                                  Deliverable: {ex.deliverable}
                                </p>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
