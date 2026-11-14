import React, { useMemo, useState } from 'react';
import { Award, CheckCircle2, FolderGit2, Lock, Plus, Trash2, Trophy } from 'lucide-react';
import { SKILL_CATALOG, SKILL_LEVEL_LABELS } from '../data/catalog';
import { Certification, LearnerProfile, ProjectItem } from '../types';
import { evaluateAchievements } from '../utils/skillEngine';
import { AchievementBadgeIcon } from './Illustrations';

interface ProfileTabProps {
  profile: LearnerProfile;
  onUpdateName: (name: string) => void;
  onUpdateSkillLevel: (skillId: string, level: number) => void;
  onAddCertification: (cert: Omit<Certification, 'id'>) => void;
  onRemoveCertification: (id: string) => void;
  onAddProject: (project: Omit<ProjectItem, 'id'>) => void;
  onRemoveProject: (id: string) => void;
}

export function ProfileTab({
  profile,
  onUpdateName,
  onUpdateSkillLevel,
  onAddCertification,
  onRemoveCertification,
  onAddProject,
  onRemoveProject,
}: ProfileTabProps) {
  const [nameInput, setNameInput] = useState(profile.name);
  const [nameSavedMessage, setNameSavedMessage] = useState<string | null>(null);

  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certYear, setCertYear] = useState('2026');

  const [projTitle, setProjTitle] = useState('');
  const [projSummary, setProjSummary] = useState('');
  const [projSkills, setProjSkills] = useState<string[]>([]);
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'earned' | 'locked'>('all');

  const achievements = useMemo(() => evaluateAchievements(profile), [profile]);
  const earnedCount = achievements.filter((a) => a.earned).length;
  const filteredAchievements = useMemo(() => {
    if (badgeFilter === 'earned') return achievements.filter((a) => a.earned);
    if (badgeFilter === 'locked') return achievements.filter((a) => !a.earned);
    return achievements;
  }, [achievements, badgeFilter]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    onUpdateName(trimmed);
    setNameSavedMessage('Learner name updated.');
    window.setTimeout(() => setNameSavedMessage(null), 2500);
  };

  const handleCreateCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim() || !certIssuer.trim()) return;
    onAddCertification({
      name: certName.trim(),
      issuer: certIssuer.trim(),
      year: certYear.trim() || '2026',
    });
    setCertName('');
    setCertIssuer('');
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projSummary.trim()) return;
    onAddProject({
      title: projTitle.trim(),
      summary: projSummary.trim(),
      skillsUsed: projSkills,
    });
    setProjTitle('');
    setProjSummary('');
    setProjSkills([]);
  };

  const toggleProjectSkill = (skillId: string) => {
    setProjSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Learner Identity */}
      <section className="sp-card rounded-2xl p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-3xl font-semibold">Learner Profile</h2>
          <p className="text-xs text-[var(--sp-text-muted)]">
            {profile.email} · {profile.isDemo ? 'Demo Mode (Browser Storage)' : 'Simulated Local Account'}
          </p>
        </div>

        <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row sm:items-end gap-3 max-w-xl">
          <div className="flex-1 space-y-1">
            <label htmlFor="profile-name-input" className="block text-xs font-medium text-[var(--sp-text-muted)]">
              Display name
            </label>
            <input
              id="profile-name-input"
              type="text"
              required
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="sp-input w-full rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[var(--sp-gold-bright)] text-[#12151e] text-xs font-semibold hover:opacity-95 whitespace-nowrap cursor-pointer"
          >
            Save Name
          </button>
        </form>
        {nameSavedMessage && (
          <p role="status" className="text-xs text-[var(--sp-teal)]">
            {nameSavedMessage}
          </p>
        )}
      </section>

      {/* Achievement Badges */}
      <section aria-labelledby="achievement-badges-heading" className="sp-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[var(--sp-gold-bright)] shrink-0" />
              <h3 id="achievement-badges-heading" className="font-display text-2xl font-semibold">
                Achievement Badges
              </h3>
            </div>
            <p className="text-xs text-[var(--sp-text-muted)]">
              <span className="font-mono tabular-nums text-[var(--sp-gold-bright)]">
                {earnedCount} / {achievements.length}
              </span>{' '}
              milestones unlocked automatically as you learn and verify skills.
            </p>
          </div>

          <div className="flex items-center p-1 rounded-lg bg-[var(--sp-surface-muted)] self-start">
            {(['all', 'earned', 'locked'] as const).map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                onClick={() => setBadgeFilter(filterKey)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize whitespace-nowrap cursor-pointer ${
                  badgeFilter === filterKey
                    ? 'bg-[var(--sp-surface-solid)] text-[var(--sp-text)] shadow-sm'
                    : 'text-[var(--sp-text-muted)]'
                }`}
              >
                {filterKey}
              </button>
            ))}
          </div>
        </div>

        {filteredAchievements.length === 0 ? (
          <p className="text-xs text-[var(--sp-text-muted)] rounded-xl bg-[var(--sp-surface-muted)] p-4">
            No {badgeFilter} achievement badges right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredAchievements.map((item) => (
              <article
                key={item.badge.id}
                data-testid={`badge-card-${item.badge.id}`}
                data-earned={item.earned ? 'true' : 'false'}
                className={`rounded-xl p-4 border transition-colors space-y-3 ${
                  item.earned
                    ? 'bg-[var(--sp-surface-muted)] border-amber-600/45 dark:border-amber-400/50'
                    : 'bg-[var(--sp-surface-muted)]/60 border-[var(--sp-border)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AchievementBadgeIcon
                    badgeId={item.badge.id}
                    earned={item.earned}
                    className="w-11 h-11 shrink-0"
                  />
                  <div className="min-w-0 space-y-1">
                    <h4 className="text-sm font-semibold leading-snug">{item.badge.title}</h4>
                    <p className="text-xs text-[var(--sp-text-muted)] leading-relaxed">
                      {item.badge.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-[var(--sp-border)]">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                    {item.earned ? (
                      <span className="inline-flex items-center gap-1 text-[var(--sp-teal)]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Earned{item.earnedAt ? ` · ${item.earnedAt}` : ''}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[var(--sp-text-muted)]">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}
                    <span className="tabular-nums text-[var(--sp-text-muted)]">
                      {item.currentCount}/{item.targetCount} {item.badge.unitLabel}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--sp-surface-solid)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-300"
                      style={{
                        width: `${item.progressPercent}%`,
                        background: item.earned ? 'var(--sp-gold-bright)' : 'var(--sp-teal)',
                      }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certifications */}
        <section className="sp-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[var(--sp-gold-bright)]" />
            <h3 className="font-display text-2xl font-semibold">Certifications</h3>
          </div>

          {profile.certifications.length === 0 ? (
            <p className="text-xs text-[var(--sp-text-muted)] rounded-xl bg-[var(--sp-surface-muted)] p-3.5">
              No certifications listed yet. Add a credential below to record your verified milestones.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {profile.certifications.map((cert) => (
                <li
                  key={cert.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[var(--sp-surface-muted)] px-3.5 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">{cert.name}</p>
                    <p className="text-xs text-[var(--sp-text-muted)]">
                      {cert.issuer} · {cert.year}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveCertification(cert.id)}
                    aria-label={`Remove certification ${cert.name}`}
                    className="p-1.5 rounded-lg text-[var(--sp-text-muted)] hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleCreateCert} className="space-y-2.5 pt-2 border-t border-[var(--sp-border)]">
            <p className="text-xs font-medium text-[var(--sp-text-muted)]">Add certification</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                aria-label="Certification title"
                placeholder="Certification title"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                required
                className="sp-input rounded-lg px-3 py-2 text-xs"
              />
              <input
                type="text"
                aria-label="Issuing organization"
                placeholder="Issuer (e.g. AWS, Linux Foundation)"
                value={certIssuer}
                onChange={(e) => setCertIssuer(e.target.value)}
                required
                className="sp-input rounded-lg px-3 py-2 text-xs"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <input
                type="text"
                aria-label="Certification year"
                placeholder="Year"
                value={certYear}
                onChange={(e) => setCertYear(e.target.value)}
                className="sp-input w-24 rounded-lg px-3 py-2 text-xs font-mono"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-700 text-white dark:bg-[#2dd4bf] dark:text-[#091214] text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Certification</span>
              </button>
            </div>
          </form>
        </section>

        {/* Projects */}
        <section className="sp-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-[var(--sp-teal)]" />
            <h3 className="font-display text-2xl font-semibold">Projects</h3>
          </div>

          {profile.projects.length === 0 ? (
            <p className="text-xs text-[var(--sp-text-muted)] rounded-xl bg-[var(--sp-surface-muted)] p-3.5">
              No projects added yet. Document a hands-on build below to demonstrate applied skills.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {profile.projects.map((proj) => (
                <li
                  key={proj.id}
                  className="flex items-start justify-between gap-3 rounded-xl bg-[var(--sp-surface-muted)] px-3.5 py-2.5"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{proj.title}</p>
                    <p className="text-xs text-[var(--sp-text-muted)] leading-relaxed">{proj.summary}</p>
                    {proj.skillsUsed.length > 0 && (
                      <p className="text-[11px] font-mono text-[var(--sp-teal)]">
                        {proj.skillsUsed
                          .map((id) => SKILL_CATALOG.find((s) => s.id === id)?.name ?? id)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveProject(proj.id)}
                    aria-label={`Remove project ${proj.title}`}
                    className="p-1.5 rounded-lg text-[var(--sp-text-muted)] hover:text-rose-500 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleCreateProject} className="space-y-2.5 pt-2 border-t border-[var(--sp-border)]">
            <p className="text-xs font-medium text-[var(--sp-text-muted)]">Add project</p>
            <input
              type="text"
              aria-label="Project title"
              placeholder="Project title"
              value={projTitle}
              onChange={(e) => setProjTitle(e.target.value)}
              required
              className="sp-input w-full rounded-lg px-3 py-2 text-xs"
            />
            <textarea
              rows={2}
              aria-label="Project summary"
              placeholder="What you built and technical outcome"
              value={projSummary}
              onChange={(e) => setProjSummary(e.target.value)}
              required
              className="sp-input w-full rounded-lg px-3 py-2 text-xs resize-none"
            />
            <div className="space-y-1.5">
              <p className="text-[11px] text-[var(--sp-text-muted)]">Skills applied</p>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_CATALOG.slice(0, 8).map((s) => {
                  const selected = projSkills.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleProjectSkill(s.id)}
                      aria-pressed={selected}
                      className={`px-2 py-1 rounded-md text-[11px] border transition-colors cursor-pointer ${
                        selected
                          ? 'border-[var(--sp-teal)] bg-[var(--sp-teal)]/15 text-[var(--sp-teal)]'
                          : 'border-[var(--sp-border)] text-[var(--sp-text-muted)]'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-700 text-white dark:bg-[#2dd4bf] dark:text-[#091214] text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </form>
        </section>
      </div>

      {/* Editable Skill Levels */}
      <section className="sp-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-display text-2xl font-semibold">Skill Proficiency Matrix</h3>
            <p className="text-xs text-[var(--sp-text-muted)]">
              Adjust your self-assessed proficiency (0 = Unexplored, 5 = Expert) or earn updates via Assessments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SKILL_CATALOG.map((skill) => {
            const level = profile.skillLevels[skill.id] ?? 0;
            return (
              <div
                key={skill.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-[var(--sp-surface-muted)] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{skill.name}</p>
                  <p className="text-[11px] text-[var(--sp-text-muted)]">
                    {skill.category} · {SKILL_LEVEL_LABELS[level]}
                  </p>
                </div>
                <label className="sr-only" htmlFor={`skill-select-${skill.id}`}>
                  {skill.name} level
                </label>
                <select
                  id={`skill-select-${skill.id}`}
                  value={level}
                  onChange={(e) => onUpdateSkillLevel(skill.id, Number(e.target.value))}
                  className="sp-input rounded-lg px-2.5 py-1.5 text-xs font-mono shrink-0"
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      Lv {n} · {SKILL_LEVEL_LABELS[n]}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
