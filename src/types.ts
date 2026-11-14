export type ThemeMode = 'dark' | 'light';

export type TargetRoleId = 'fullstack' | 'data-scientist' | 'devops';

export type AppScreen = 'intro' | 'auth' | 'app';

export type AppTab = 'dashboard' | 'profile' | 'roadmap' | 'assessment' | 'mentor';

export type SkillCategory = 'Programming' | 'Web Development' | 'Data & ML' | 'DevOps & Cloud';

export interface SkillResource {
  id: string;
  title: string;
  type: 'Guide' | 'Interactive Lab' | 'Reference' | 'Architecture Note';
  durationMinutes: number;
  summary: string;
}

export interface PracticalExercise {
  id: string;
  title: string;
  deliverable: string;
}

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SkillDefinition {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  prerequisites: string[];
  resources: SkillResource[];
  exercises: PracticalExercise[];
  questions: AssessmentQuestion[];
}

export interface TargetRole {
  id: TargetRoleId;
  title: string;
  tagline: string;
  requiredSkills: Record<string, number>; // skillId -> target proficiency (1..5)
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  summary: string;
  skillsUsed: string[];
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  actor: 'Learner' | 'SkillPath Agent';
  action: string;
  detail: string;
}

export type AchievementBadgeId =
  | 'first-resource'
  | 'completed-10-resources'
  | 'hands-on-builder'
  | 'level-5-proficiency'
  | 'portfolio-ready'
  | 'role-benchmark-80';

export interface AchievementBadgeDefinition {
  id: AchievementBadgeId;
  title: string;
  description: string;
  criteriaLabel: string;
  targetCount: number;
  unitLabel: string;
}

export interface AchievementStatus {
  badge: AchievementBadgeDefinition;
  earned: boolean;
  earnedAt: string | null;
  currentCount: number;
  targetCount: number;
  progressPercent: number;
}

export interface LearnerProfile {
  name: string;
  email: string;
  isDemo: boolean;
  targetRole: TargetRoleId;
  skillLevels: Record<string, number>; // 0..5
  completedResources: string[];
  completedExercises: string[];
  certifications: Certification[];
  projects: ProjectItem[];
  activityLog: ActivityLogEntry[];
  earnedBadges?: Record<string, string>; // badgeId -> timestamp
}

export interface SimulatedAccount {
  email: string;
  password: string;
  name: string;
  provider: 'local' | 'google-simulated';
  profile: LearnerProfile;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
}
