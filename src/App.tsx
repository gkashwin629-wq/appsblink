import React, { useEffect, useState } from 'react';
import { AskAiWidget } from './components/AskAiWidget';
import { AuthScreen } from './components/AuthScreen';
import { BackgroundEffects } from './components/BackgroundEffects';
import { IntroScreen } from './components/IntroScreen';
import { LearnerWorkspace } from './components/LearnerWorkspace';
import { ThemeWipe } from './components/ThemeWipe';
import { SKILL_CATALOG, SKILL_LEVEL_LABELS, TARGET_ROLES } from './data/catalog';
import { AppScreen, Certification, LearnerProfile, ProjectItem, TargetRoleId, ThemeMode } from './types';
import {
  AssessmentOutcome,
  clampLevel,
  formatTimestampNow,
  syncProfileAchievements,
} from './utils/skillEngine';
import {
  clearActiveSession,
  enterDemoSession,
  loadActiveSessionProfile,
  loadEffectsPreference,
  loadThemePreference,
  safeGetItem,
  saveEffectsPreference,
  saveLearnerProfile,
  saveThemePreference,
} from './utils/storage';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

export default function App() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const [theme, setTheme] = useState<ThemeMode>(() => loadThemePreference());
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(() =>
    loadEffectsPreference(
      typeof window !== 'undefined' &&
        Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
    )
  );
  const [wipeKey, setWipeKey] = useState(0);
  const [wipeTarget, setWipeTarget] = useState<ThemeMode>('dark');
  const [storageDegraded] = useState<boolean>(() => safeGetItem('skillpath_probe').storageDegraded);

  const [profile, setProfile] = useState<LearnerProfile | null>(() => {
    let loaded: LearnerProfile | null = null;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        loaded = loadActiveSessionProfile() ?? enterDemoSession();
      } else {
        loaded = loadActiveSessionProfile();
      }
    } else {
      loaded = loadActiveSessionProfile();
    }
    if (!loaded) return null;
    const synced = syncProfileAchievements(loaded);
    if (synced.profile !== loaded) saveLearnerProfile(synced.profile);
    return synced.profile;
  });

  const [screen, setScreen] = useState<AppScreen>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return 'app';
    }
    const existing = loadActiveSessionProfile();
    return existing ? 'app' : 'intro';
  });

  const activeEffects = effectsEnabled && !prefersReducedMotion;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('effects-on', activeEffects);
    document.body.dataset.theme = theme;
    document.body.dataset.effects = activeEffects ? 'on' : 'off';
    document.body.dataset.screen = screen;
  }, [theme, activeEffects, screen]);

  const handleToggleTheme = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    if (activeEffects) {
      setWipeTarget(next);
      setWipeKey((k) => k + 1);
      window.setTimeout(() => {
        setTheme(next);
        saveThemePreference(next);
      }, 170);
    } else {
      setTheme(next);
      saveThemePreference(next);
    }
  };

  const handleToggleEffects = () => {
    const next = !effectsEnabled;
    setEffectsEnabled(next);
    saveEffectsPreference(next);
  };

  const updateProfile = (updater: (prev: LearnerProfile) => LearnerProfile) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const updated = updater(prev);
      const { profile: synced } = syncProfileAchievements(updated);
      saveLearnerProfile(synced);
      return synced;
    });
  };

  const handleAuthenticated = (nextProfile: LearnerProfile) => {
    const { profile: synced } = syncProfileAchievements(nextProfile);
    if (synced !== nextProfile) saveLearnerProfile(synced);
    setProfile(synced);
    setScreen('app');
  };

  const handleLogout = () => {
    clearActiveSession();
    setProfile(null);
    setScreen('auth');
  };

  const handleChangeTargetRole = (roleId: TargetRoleId) => {
    updateProfile((prev) => ({
      ...prev,
      targetRole: roleId,
      activityLog: [
        {
          id: `log-${Date.now()}`,
          timestamp: formatTimestampNow(),
          actor: 'SkillPath Agent',
          action: 'Recalculated Role Roadmap',
          detail: `Re-evaluated skill gaps and prerequisite tiers for ${TARGET_ROLES[roleId].title}.`,
        },
        ...prev.activityLog,
      ],
    }));
  };

  const handleUpdateName = (name: string) => {
    updateProfile((prev) => ({
      ...prev,
      name,
      activityLog: [
        {
          id: `log-${Date.now()}`,
          timestamp: formatTimestampNow(),
          actor: 'Learner',
          action: 'Updated Profile Name',
          detail: `Set learner display name to ${name}.`,
        },
        ...prev.activityLog,
      ],
    }));
  };

  const handleUpdateSkillLevel = (skillId: string, level: number) => {
    const skillName = SKILL_CATALOG.find((s) => s.id === skillId)?.name ?? skillId;
    const clamped = clampLevel(level);
    updateProfile((prev) => ({
      ...prev,
      skillLevels: { ...prev.skillLevels, [skillId]: clamped },
      activityLog: [
        {
          id: `log-${Date.now()}`,
          timestamp: formatTimestampNow(),
          actor: 'Learner',
          action: 'Updated Skill Proficiency',
          detail: `Recorded ${skillName} at Level ${clamped} (${SKILL_LEVEL_LABELS[clamped]}).`,
        },
        ...prev.activityLog,
      ],
    }));
  };

  const handleAddCertification = (cert: Omit<Certification, 'id'>) => {
    updateProfile((prev) => ({
      ...prev,
      certifications: [{ ...cert, id: `cert-${Date.now()}` }, ...prev.certifications],
      activityLog: [
        {
          id: `log-${Date.now()}`,
          timestamp: formatTimestampNow(),
          actor: 'Learner',
          action: 'Added Certification',
          detail: `Added "${cert.name}" (${cert.issuer}, ${cert.year}).`,
        },
        ...prev.activityLog,
      ],
    }));
  };

  const handleRemoveCertification = (id: string) => {
    updateProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== id),
    }));
  };

  const handleAddProject = (project: Omit<ProjectItem, 'id'>) => {
    updateProfile((prev) => ({
      ...prev,
      projects: [{ ...project, id: `proj-${Date.now()}` }, ...prev.projects],
      activityLog: [
        {
          id: `log-${Date.now()}`,
          timestamp: formatTimestampNow(),
          actor: 'Learner',
          action: 'Logged Portfolio Project',
          detail: `Added project "${project.title}".`,
        },
        ...prev.activityLog,
      ],
    }));
  };

  const handleRemoveProject = (id: string) => {
    updateProfile((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  const handleToggleResource = (resourceId: string, skillName: string, resourceTitle: string) => {
    updateProfile((prev) => {
      const exists = prev.completedResources.includes(resourceId);
      const nextResources = exists
        ? prev.completedResources.filter((id) => id !== resourceId)
        : [...prev.completedResources, resourceId];
      return {
        ...prev,
        completedResources: nextResources,
        activityLog: exists
          ? prev.activityLog
          : [
              {
                id: `log-${Date.now()}`,
                timestamp: formatTimestampNow(),
                actor: 'Learner',
                action: 'Completed Resource',
                detail: `Finished "${resourceTitle}" under ${skillName}.`,
              },
              ...prev.activityLog,
            ],
      };
    });
  };

  const handleToggleExercise = (exerciseId: string, skillName: string, exerciseTitle: string) => {
    updateProfile((prev) => {
      const exists = prev.completedExercises.includes(exerciseId);
      const nextExercises = exists
        ? prev.completedExercises.filter((id) => id !== exerciseId)
        : [...prev.completedExercises, exerciseId];
      return {
        ...prev,
        completedExercises: nextExercises,
        activityLog: exists
          ? prev.activityLog
          : [
              {
                id: `log-${Date.now()}`,
                timestamp: formatTimestampNow(),
                actor: 'Learner',
                action: 'Completed Practical Exercise',
                detail: `Completed "${exerciseTitle}" (${skillName}).`,
              },
              ...prev.activityLog,
            ],
      };
    });
  };

  const handleAssessmentEvaluated = (outcome: AssessmentOutcome) => {
    updateProfile((prev) => {
      const nextSkillLevels = outcome.levelUpdated
        ? { ...prev.skillLevels, [outcome.skillId]: outcome.newLevel }
        : prev.skillLevels;
      return {
        ...prev,
        skillLevels: nextSkillLevels,
        activityLog: [
          {
            id: `log-${Date.now()}`,
            timestamp: formatTimestampNow(),
            actor: 'SkillPath Agent',
            action: outcome.passed ? 'Assessment Passed' : 'Assessment Recorded',
            detail: outcome.levelUpdated
              ? `Scored ${outcome.score}/${outcome.total} on ${outcome.skillName}; promoted to Level ${outcome.newLevel} (${SKILL_LEVEL_LABELS[outcome.newLevel]}).`
              : `Scored ${outcome.score}/${outcome.total} (${outcome.percent}%) on ${outcome.skillName}.`,
          },
          ...prev.activityLog,
        ],
      };
    });
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <BackgroundEffects effectsEnabled={activeEffects} theme={theme} />
      <ThemeWipe wipeKey={wipeKey} targetTheme={wipeTarget} />

      {screen === 'intro' && (
        <IntroScreen
          theme={theme}
          effectsEnabled={activeEffects}
          onToggleTheme={handleToggleTheme}
          onToggleEffects={handleToggleEffects}
          onComplete={() => setScreen('auth')}
        />
      )}

      {screen === 'auth' && (
        <AuthScreen
          theme={theme}
          effectsEnabled={activeEffects}
          storageDegraded={storageDegraded}
          onToggleTheme={handleToggleTheme}
          onToggleEffects={handleToggleEffects}
          onAuthenticated={handleAuthenticated}
        />
      )}

      {screen === 'app' && profile && (
        <LearnerWorkspace
          profile={profile}
          theme={theme}
          effectsEnabled={activeEffects}
          onToggleTheme={handleToggleTheme}
          onToggleEffects={handleToggleEffects}
          onChangeTargetRole={handleChangeTargetRole}
          onUpdateName={handleUpdateName}
          onUpdateSkillLevel={handleUpdateSkillLevel}
          onAddCertification={handleAddCertification}
          onRemoveCertification={handleRemoveCertification}
          onAddProject={handleAddProject}
          onRemoveProject={handleRemoveProject}
          onToggleResource={handleToggleResource}
          onToggleExercise={handleToggleExercise}
          onAssessmentEvaluated={handleAssessmentEvaluated}
          onLogout={handleLogout}
        />
      )}

      <AskAiWidget />
    </div>
  );
}
