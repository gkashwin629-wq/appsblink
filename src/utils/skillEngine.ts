import { SKILL_CATALOG, SKILL_LEVEL_LABELS, TARGET_ROLES } from '../data/catalog';
import {
  AchievementBadgeDefinition,
  AchievementStatus,
  LearnerProfile,
  SkillDefinition,
  TargetRoleId,
} from '../types';

export interface SkillGapItem {
  skill: SkillDefinition;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  status: 'Ready' | 'Developing' | 'Gap';
}

export interface RoleFitSummary {
  roleId: TargetRoleId;
  roleTitle: string;
  fitPercent: number;
  readyCount: number;
  developingCount: number;
  gapCount: number;
  totalRequiredSkills: number;
  skills: SkillGapItem[];
  gapsOnly: SkillGapItem[];
  resourceCompletionPercent: number;
  completedResourceCount: number;
  totalResourceCount: number;
}

export interface RoadmapNode {
  skill: SkillDefinition;
  tier: number;
  isRequiredForRole: boolean;
  targetLevel: number;
  currentLevel: number;
  prerequisitesMet: boolean;
  missingPrerequisites: SkillDefinition[];
  completedResourceCount: number;
  totalResourceCount: number;
}

export interface AssessmentOutcome {
  skillId: string;
  skillName: string;
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  previousLevel: number;
  newLevel: number;
  levelUpdated: boolean;
  results: Array<{
    questionId: string;
    prompt: string;
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export function calculateRoleFit(profile: LearnerProfile, catalog: SkillDefinition[] = SKILL_CATALOG): RoleFitSummary {
  const role = TARGET_ROLES[profile.targetRole];
  const entries = Object.entries(role.requiredSkills);
  let achievedPoints = 0;
  let maxPoints = 0;
  let readyCount = 0;
  let developingCount = 0;
  let gapCount = 0;

  const skillItems: SkillGapItem[] = [];

  for (const [skillId, targetLevel] of entries) {
    const skill = catalog.find((s) => s.id === skillId);
    if (!skill) continue;
    const currentLevel = clampLevel(profile.skillLevels[skillId] ?? 0);
    const capped = Math.min(currentLevel, targetLevel);
    achievedPoints += capped;
    maxPoints += targetLevel;

    const gap = Math.max(0, targetLevel - currentLevel);
    let status: SkillGapItem['status'] = 'Ready';
    if (gap === 0) {
      readyCount += 1;
      status = 'Ready';
    } else if (currentLevel > 0 && gap === 1) {
      developingCount += 1;
      status = 'Developing';
    } else {
      gapCount += 1;
      status = 'Gap';
    }

    skillItems.push({
      skill,
      currentLevel,
      targetLevel,
      gap,
      status,
    });
  }

  skillItems.sort((a, b) => b.gap - a.gap || a.skill.name.localeCompare(b.skill.name));

  const fitPercent = maxPoints === 0 ? 0 : Math.round((achievedPoints / maxPoints) * 100);

  const relevantSkills = catalog.filter((s) => role.requiredSkills[s.id] !== undefined);
  const totalResourceCount = relevantSkills.reduce((acc, s) => acc + s.resources.length, 0);
  const completedResourceCount = relevantSkills.reduce(
    (acc, s) => acc + s.resources.filter((r) => profile.completedResources.includes(r.id)).length,
    0
  );
  const resourceCompletionPercent =
    totalResourceCount === 0 ? 0 : Math.round((completedResourceCount / totalResourceCount) * 100);

  return {
    roleId: role.id,
    roleTitle: role.title,
    fitPercent,
    readyCount,
    developingCount,
    gapCount,
    totalRequiredSkills: skillItems.length,
    skills: skillItems,
    gapsOnly: skillItems.filter((item) => item.gap > 0),
    resourceCompletionPercent,
    completedResourceCount,
    totalResourceCount,
  };
}

export function buildOrderedRoadmap(
  profile: LearnerProfile,
  catalog: SkillDefinition[] = SKILL_CATALOG
): RoadmapNode[] {
  const role = TARGET_ROLES[profile.targetRole];
  const skillMap = new Map<string, SkillDefinition>(catalog.map((s) => [s.id, s]));
  const tierCache = new Map<string, number>();

  function computeTier(skillId: string, visiting = new Set<string>()): number {
    if (tierCache.has(skillId)) return tierCache.get(skillId)!;
    if (visiting.has(skillId)) return 0; // cycle guard
    visiting.add(skillId);
    const skill = skillMap.get(skillId);
    if (!skill || skill.prerequisites.length === 0) {
      tierCache.set(skillId, 0);
      return 0;
    }
    const maxPrereqTier = Math.max(
      ...skill.prerequisites.map((pid) => computeTier(pid, new Set(visiting)))
    );
    const tier = maxPrereqTier + 1;
    tierCache.set(skillId, tier);
    return tier;
  }

  const nodes: RoadmapNode[] = catalog.map((skill) => {
    const tier = computeTier(skill.id);
    const targetLevel = role.requiredSkills[skill.id] ?? 0;
    const currentLevel = clampLevel(profile.skillLevels[skill.id] ?? 0);
    const missingPrerequisites = skill.prerequisites
      .map((pid) => skillMap.get(pid))
      .filter((p): p is SkillDefinition => Boolean(p))
      .filter((prereq) => (profile.skillLevels[prereq.id] ?? 0) < 2);

    const completedResourceCount = skill.resources.filter((r) =>
      profile.completedResources.includes(r.id)
    ).length;

    return {
      skill,
      tier,
      isRequiredForRole: targetLevel > 0,
      targetLevel,
      currentLevel,
      prerequisitesMet: missingPrerequisites.length === 0,
      missingPrerequisites,
      completedResourceCount,
      totalResourceCount: skill.resources.length,
    };
  });

  nodes.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.isRequiredForRole !== b.isRequiredForRole) return a.isRequiredForRole ? -1 : 1;
    return (b.targetLevel - b.currentLevel) - (a.targetLevel - a.currentLevel);
  });

  return nodes;
}

export function getRecommendedNextSteps(
  profile: LearnerProfile,
  catalog: SkillDefinition[] = SKILL_CATALOG,
  limit = 3
): RoadmapNode[] {
  const roadmap = buildOrderedRoadmap(profile, catalog);
  const candidates = roadmap.filter(
    (node) => node.isRequiredForRole && node.currentLevel < node.targetLevel
  );

  // Prioritize skills whose prerequisites are already met, then by largest gap
  candidates.sort((a, b) => {
    if (a.prerequisitesMet !== b.prerequisitesMet) return a.prerequisitesMet ? -1 : 1;
    const gapDiff = (b.targetLevel - b.currentLevel) - (a.targetLevel - a.currentLevel);
    if (gapDiff !== 0) return gapDiff;
    return a.tier - b.tier;
  });

  return candidates.slice(0, limit);
}

export function evaluateAssessment(
  skill: SkillDefinition,
  selectedAnswers: Record<string, number>,
  currentLevel: number
): AssessmentOutcome {
  const results = skill.questions.map((q) => {
    const selectedIndex = selectedAnswers[q.id] ?? -1;
    const isCorrect = selectedIndex === q.correctIndex;
    return {
      questionId: q.id,
      prompt: q.prompt,
      selectedIndex,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const score = results.filter((r) => r.isCorrect).length;
  const total = skill.questions.length;
  const percent = total === 0 ? 0 : Math.round((score / total) * 100);
  const passed = percent >= 67;

  let earnedLevel = currentLevel;
  if (percent === 100) {
    earnedLevel = Math.max(currentLevel, 4);
  } else if (percent >= 67) {
    earnedLevel = Math.max(currentLevel, 3);
  } else if (percent >= 33) {
    earnedLevel = Math.max(currentLevel, 2);
  }

  return {
    skillId: skill.id,
    skillName: skill.name,
    score,
    total,
    percent,
    passed,
    previousLevel: currentLevel,
    newLevel: earnedLevel,
    levelUpdated: earnedLevel > currentLevel,
    results,
  };
}

export function generateMentorReply(
  userMessage: string,
  profile: LearnerProfile,
  catalog: SkillDefinition[] = SKILL_CATALOG
): string {
  const fit = calculateRoleFit(profile, catalog);
  const nextSteps = getRecommendedNextSteps(profile, catalog, 2);
  const text = userMessage.toLowerCase();

  if (text.includes('gap') || text.includes('missing') || text.includes('focus')) {
    if (fit.gapsOnly.length === 0) {
      return `Simulated Mentor: You currently meet or exceed every target requirement for ${fit.roleTitle} (${fit.fitPercent}% fit). Consider polishing portfolio projects or exploring cross-domain skills in the Roadmap.`;
    }
    const topGaps = fit.gapsOnly
      .slice(0, 3)
      .map((g) => `${g.skill.name} (Level ${g.currentLevel} -> ${g.targetLevel})`)
      .join(', ');
    return `Simulated Mentor: For ${fit.roleTitle}, your readiness is ${fit.fitPercent}%. Your highest-leverage skill gaps are ${topGaps}. Start with ${nextSteps[0]?.skill.name ?? fit.gapsOnly[0].skill.name} because its prerequisite chain is ready.`;
  }

  if (text.includes('next') || text.includes('roadmap') || text.includes('order') || text.includes('start')) {
    if (nextSteps.length === 0) {
      return `Simulated Mentor: All target-role skills for ${fit.roleTitle} are at target level! Try taking an Assessment to verify mastery or switching target roles to explore adjacent tracks.`;
    }
    const first = nextSteps[0];
    const firstResource = first.skill.resources[0]?.title ?? 'the core guide';
    return `Simulated Mentor: Recommended next step is ${first.skill.name} (${SKILL_LEVEL_LABELS[first.currentLevel]} -> ${SKILL_LEVEL_LABELS[first.targetLevel]}). Open the Roadmap tab, complete "${firstResource}", finish its practical exercise, and validate with the Assessment tab.`;
  }

  if (text.includes('assessment') || text.includes('quiz') || text.includes('level') || text.includes('test')) {
    const lowest = fit.gapsOnly[0];
    return `Simulated Mentor: Passing an Assessment (67%+ score) automatically promotes your recorded skill level up to Proficient (Level 3) or Advanced (Level 4) at 100%. ${
      lowest
        ? `A great target right now is ${lowest.skill.name}.`
        : 'All role skills are already on target.'
    }`;
  }

  if (text.includes('project') || text.includes('portfolio') || text.includes('resume')) {
    return `Simulated Mentor: Employers evaluating ${fit.roleTitle} candidates look for proof combining multiple skills. Try building a scoped project connecting ${
      fit.skills
        .slice(0, 2)
        .map((s) => s.skill.name)
        .join(' and ')
    }, then log it in your Profile tab.`;
  }

  const nextNames = nextSteps.map((n) => n.skill.name).join(' and ');
  return `Simulated Mentor (Demo Mode): You are tracking ${fit.roleTitle} at ${fit.fitPercent}% role fit (${fit.readyCount}/${fit.totalRequiredSkills} skills ready). ${
    nextNames
      ? `Your immediate priorities are ${nextNames}. Ask me about "top skill gaps", "what to study next", or "portfolio project ideas".`
      : 'You have met every target benchmark for this role!'
  }`;
}

export function buildAskAiUrls(question: string): { chatGptUrl: string; geminiUrl: string } {
  const trimmed = question.trim();
  const encoded = encodeURIComponent(trimmed);
  return {
    chatGptUrl: trimmed ? `https://chatgpt.com/?q=${encoded}` : 'https://chatgpt.com/',
    geminiUrl: trimmed ? `https://gemini.google.com/app?q=${encoded}` : 'https://gemini.google.com/app',
  };
}

export const ACHIEVEMENT_BADGES: AchievementBadgeDefinition[] = [
  {
    id: 'first-resource',
    title: 'First Step',
    description: 'Completed your first learning resource in the roadmap.',
    criteriaLabel: 'Complete 1 learning resource',
    targetCount: 1,
    unitLabel: 'resources',
  },
  {
    id: 'completed-10-resources',
    title: 'Completed 10 Resources',
    description: 'Sustained study momentum across ten roadmap guides and labs.',
    criteriaLabel: 'Complete 10 learning resources',
    targetCount: 10,
    unitLabel: 'resources',
  },
  {
    id: 'hands-on-builder',
    title: 'Hands-On Builder',
    description: 'Verified practical engineering execution across multiple exercises.',
    criteriaLabel: 'Complete 3 practical exercises',
    targetCount: 3,
    unitLabel: 'exercises',
  },
  {
    id: 'level-5-proficiency',
    title: 'Level 5 Proficiency',
    description: 'Reached Expert (Level 5) mastery in at least one catalog skill.',
    criteriaLabel: 'Reach Level 5 in 1 skill',
    targetCount: 5,
    unitLabel: 'max level',
  },
  {
    id: 'portfolio-ready',
    title: 'Portfolio Ready',
    description: 'Backed up your skills with documented projects or certifications.',
    criteriaLabel: 'Log 2 projects or certifications',
    targetCount: 2,
    unitLabel: 'items',
  },
  {
    id: 'role-benchmark-80',
    title: 'Target Role Ready',
    description: 'Reached at least 80% Target-Role Fit for your selected career track.',
    criteriaLabel: 'Reach 80% target-role fit',
    targetCount: 80,
    unitLabel: '% fit',
  },
];

export function evaluateAchievements(
  profile: LearnerProfile,
  catalog: SkillDefinition[] = SKILL_CATALOG
): AchievementStatus[] {
  const earnedMap = profile.earnedBadges ?? {};
  const maxSkillLevel = Math.max(0, ...Object.values(profile.skillLevels));
  const portfolioCount = profile.projects.length + profile.certifications.length;
  const roleFit = calculateRoleFit(profile, catalog).fitPercent;

  return ACHIEVEMENT_BADGES.map((badge) => {
    let currentCount = 0;
    if (badge.id === 'first-resource' || badge.id === 'completed-10-resources') {
      currentCount = profile.completedResources.length;
    } else if (badge.id === 'hands-on-builder') {
      currentCount = profile.completedExercises.length;
    } else if (badge.id === 'level-5-proficiency') {
      currentCount = maxSkillLevel;
    } else if (badge.id === 'portfolio-ready') {
      currentCount = portfolioCount;
    } else if (badge.id === 'role-benchmark-80') {
      currentCount = roleFit;
    }

    const earnedAt = earnedMap[badge.id] ?? null;
    const isConditionMet = currentCount >= badge.targetCount;
    const earned = Boolean(earnedAt) || isConditionMet;
    const progressPercent = earned
      ? 100
      : Math.min(100, Math.round((currentCount / badge.targetCount) * 100));

    return {
      badge,
      earned,
      earnedAt,
      currentCount: Math.min(currentCount, badge.targetCount),
      targetCount: badge.targetCount,
      progressPercent,
    };
  });
}

export function syncProfileAchievements(
  profile: LearnerProfile,
  timestamp: string = formatTimestampNow(),
  catalog: SkillDefinition[] = SKILL_CATALOG
): { profile: LearnerProfile; newlyEarned: AchievementBadgeDefinition[] } {
  const existing = { ...(profile.earnedBadges ?? {}) };
  const statuses = evaluateAchievements(profile, catalog);
  const newlyEarned: AchievementBadgeDefinition[] = [];

  for (const status of statuses) {
    if (status.earned && !existing[status.badge.id]) {
      existing[status.badge.id] = timestamp;
      newlyEarned.push(status.badge);
    }
  }

  if (newlyEarned.length === 0 && profile.earnedBadges) {
    return { profile, newlyEarned: [] };
  }

  const newLogs = newlyEarned.map((badge, idx) => ({
    id: `log-badge-${Date.now()}-${idx}-${badge.id}`,
    timestamp,
    actor: 'SkillPath Agent' as const,
    action: 'Achievement Badge Earned',
    detail: `Awarded "${badge.title}" (${badge.criteriaLabel}).`,
  }));

  return {
    profile: {
      ...profile,
      earnedBadges: existing,
      activityLog: [...newLogs, ...profile.activityLog],
    },
    newlyEarned,
  };
}

export function clampLevel(val: number): number {
  if (!Number.isFinite(val)) return 0;
  return Math.max(0, Math.min(5, Math.round(val)));
}

export function formatTimestampNow(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}
