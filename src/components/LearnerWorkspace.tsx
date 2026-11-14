import React, { useState } from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { SKILL_CATALOG, TARGET_ROLES } from '../data/catalog';
import { AppTab, Certification, LearnerProfile, ProjectItem, TargetRoleId, ThemeMode } from '../types';
import { AssessmentOutcome } from '../utils/skillEngine';
import { AssessmentTab } from './AssessmentTab';
import { DashboardTab } from './DashboardTab';
import { SkillPathMark } from './Illustrations';
import { MentorTab } from './MentorTab';
import { ProfileTab } from './ProfileTab';
import { RoadmapTab } from './RoadmapTab';

interface LearnerWorkspaceProps {
  profile: LearnerProfile;
  theme: ThemeMode;
  effectsEnabled: boolean;
  onToggleTheme: () => void;
  onToggleEffects: () => void;
  onChangeTargetRole: (roleId: TargetRoleId) => void;
  onUpdateName: (name: string) => void;
  onUpdateSkillLevel: (skillId: string, level: number) => void;
  onAddCertification: (cert: Omit<Certification, 'id'>) => void;
  onRemoveCertification: (id: string) => void;
  onAddProject: (project: Omit<ProjectItem, 'id'>) => void;
  onRemoveProject: (id: string) => void;
  onToggleResource: (resourceId: string, skillName: string, resourceTitle: string) => void;
  onToggleExercise: (exerciseId: string, skillName: string, exerciseTitle: string) => void;
  onAssessmentEvaluated: (outcome: AssessmentOutcome) => void;
  onLogout: () => void;
}

const TABS: Array<{ id: AppTab; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'profile', label: 'Profile' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'mentor', label: 'Mentor' },
];

export function LearnerWorkspace({
  profile,
  theme,
  effectsEnabled,
  onToggleTheme,
  onToggleEffects,
  onChangeTargetRole,
  onUpdateName,
  onUpdateSkillLevel,
  onAddCertification,
  onRemoveCertification,
  onAddProject,
  onRemoveProject,
  onToggleResource,
  onToggleExercise,
  onAssessmentEvaluated,
  onLogout,
}: LearnerWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [focusedSkillId, setFocusedSkillId] = useState<string>(SKILL_CATALOG[0].id);

  const handleNavigateTab = (tab: AppTab, skillId?: string) => {
    if (skillId) setFocusedSkillId(skillId);
    setActiveTab(tab);
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-[var(--sp-border)] bg-[var(--sp-surface)] backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <SkillPathMark className="w-7 h-7" />
            <span className="font-display text-2xl font-semibold tracking-tight whitespace-nowrap">
              SkillPath
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="target-role-selector" className="text-xs text-[var(--sp-text-muted)] whitespace-nowrap">
                Target Role
              </label>
              <select
                id="target-role-selector"
                value={profile.targetRole}
                onChange={(e) => onChangeTargetRole(e.target.value as TargetRoleId)}
                className="sp-input rounded-lg px-2.5 py-1.5 text-xs font-medium"
              >
                {Object.values(TARGET_ROLES).map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden sm:block h-4 w-px bg-[var(--sp-border)]" aria-hidden="true" />

            <span className="text-xs font-medium truncate max-w-[160px]" title={profile.name}>
              {profile.name}
            </span>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--sp-border-strong)] hover:border-[var(--sp-gold-bright)] text-xs font-medium whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Workspace Tab Navigation & Display Controls */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 flex flex-wrap items-center justify-between gap-2.5">
          <nav aria-label="Learner workspace tabs" className="w-full md:w-auto">
            <div role="tablist" className="flex flex-wrap items-center gap-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[var(--sp-gold-bright)] text-[#12151e] font-semibold'
                        : 'text-[var(--sp-text-muted)] hover:text-[var(--sp-text)] hover:bg-[var(--sp-surface-muted)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleEffects}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono border border-[var(--sp-border)] hover:border-[var(--sp-gold-bright)] whitespace-nowrap cursor-pointer"
            >
              Effects: {effectsEnabled ? 'On' : 'Off'}
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-[var(--sp-border)] hover:border-[var(--sp-gold-bright)] whitespace-nowrap cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24">
        {activeTab === 'dashboard' && (
          <DashboardTab profile={profile} onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'profile' && (
          <ProfileTab
            profile={profile}
            onUpdateName={onUpdateName}
            onUpdateSkillLevel={onUpdateSkillLevel}
            onAddCertification={onAddCertification}
            onRemoveCertification={onRemoveCertification}
            onAddProject={onAddProject}
            onRemoveProject={onRemoveProject}
          />
        )}
        {activeTab === 'roadmap' && (
          <RoadmapTab
            profile={profile}
            focusedSkillId={focusedSkillId}
            onToggleResource={onToggleResource}
            onToggleExercise={onToggleExercise}
            onOpenAssessment={(skillId) => handleNavigateTab('assessment', skillId)}
          />
        )}
        {activeTab === 'assessment' && (
          <AssessmentTab
            profile={profile}
            selectedSkillId={focusedSkillId}
            onSelectSkill={setFocusedSkillId}
            onAssessmentEvaluated={onAssessmentEvaluated}
          />
        )}
        {activeTab === 'mentor' && <MentorTab profile={profile} />}
      </main>
    </div>
  );
}
