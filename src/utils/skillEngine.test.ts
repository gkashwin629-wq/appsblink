import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialDemoProfile, SKILL_CATALOG } from '../data/catalog';
import {
  buildAskAiUrls,
  buildOrderedRoadmap,
  calculateRoleFit,
  evaluateAchievements,
  evaluateAssessment,
  generateMentorReply,
  getRecommendedNextSteps,
  syncProfileAchievements,
} from './skillEngine';

test('calculateRoleFit computes readiness counts and percentage accurately', () => {
  const profile = createInitialDemoProfile();
  const fit = calculateRoleFit(profile);
  assert.equal(fit.roleId, 'fullstack');
  assert.equal(fit.totalRequiredSkills, 8);
  assert.ok(fit.fitPercent > 0 && fit.fitPercent < 100);
  assert.equal(fit.readyCount + fit.developingCount + fit.gapCount, fit.totalRequiredSkills);
  assert.equal(fit.gapsOnly[0].gap >= fit.gapsOnly[fit.gapsOnly.length - 1].gap, true);
});

test('buildOrderedRoadmap places prerequisites before dependent skills', () => {
  const profile = createInitialDemoProfile();
  const roadmap = buildOrderedRoadmap(profile);
  const indexById = new Map(roadmap.map((node, idx) => [node.skill.id, idx]));

  for (const node of roadmap) {
    for (const prereqId of node.skill.prerequisites) {
      const prereqIdx = indexById.get(prereqId)!;
      const nodeIdx = indexById.get(node.skill.id)!;
      assert.ok(
        prereqIdx < nodeIdx,
        `Expected prerequisite ${prereqId} (idx ${prereqIdx}) before ${node.skill.id} (idx ${nodeIdx})`
      );
    }
  }
});

test('getRecommendedNextSteps prioritizes prerequisite-ready role gaps', () => {
  const profile = createInitialDemoProfile();
  const next = getRecommendedNextSteps(profile, SKILL_CATALOG, 3);
  assert.equal(next.length, 3);
  assert.equal(next[0].prerequisitesMet, true);
  assert.ok(next[0].targetLevel > next[0].currentLevel);
});

test('evaluateAssessment scores answers and promotes level without downgrading', () => {
  const tsSkill = SKILL_CATALOG.find((s) => s.id === 'typescript')!;
  const allCorrect: Record<string, number> = {};
  for (const q of tsSkill.questions) {
    allCorrect[q.id] = q.correctIndex;
  }

  const perfect = evaluateAssessment(tsSkill, allCorrect, 2);
  assert.equal(perfect.score, 3);
  assert.equal(perfect.percent, 100);
  assert.equal(perfect.passed, true);
  assert.equal(perfect.newLevel, 4);
  assert.equal(perfect.levelUpdated, true);

  const alreadyExpert = evaluateAssessment(tsSkill, allCorrect, 5);
  assert.equal(alreadyExpert.newLevel, 5);
  assert.equal(alreadyExpert.levelUpdated, false);
});

test('generateMentorReply references target role and top skill gaps', () => {
  const profile = createInitialDemoProfile();
  profile.targetRole = 'data-scientist';
  const reply = generateMentorReply('What are my top skill gaps?', profile);
  assert.ok(reply.includes('Data Scientist'));
  assert.ok(reply.includes('Simulated Mentor'));
});

test('buildAskAiUrls encodes question into ChatGPT and Gemini URLs', () => {
  const { chatGptUrl, geminiUrl } = buildAskAiUrls('How do React keys work?');
  assert.ok(chatGptUrl.startsWith('https://chatgpt.com/?q=How%20do%20React%20keys%20work%3F'));
  assert.ok(geminiUrl.startsWith('https://gemini.google.com/app?q=How%20do%20React%20keys%20work%3F'));
});

test('achievement badges unlock for Level 5 Proficiency and Completed 10 Resources without duplicating', () => {
  const profile = createInitialDemoProfile();
  const before = evaluateAchievements(profile);
  const lvl5Before = before.find((a) => a.badge.id === 'level-5-proficiency')!;
  const tenResBefore = before.find((a) => a.badge.id === 'completed-10-resources')!;
  assert.equal(lvl5Before.earned, false);
  assert.equal(tenResBefore.earned, false);

  profile.skillLevels['typescript'] = 5;
  profile.completedResources = Array.from({ length: 10 }, (_, i) => `res-${i}`);

  const synced = syncProfileAchievements(profile, '2026-11-13 23:45');
  assert.ok(synced.newlyEarned.some((b) => b.id === 'level-5-proficiency'));
  assert.ok(synced.newlyEarned.some((b) => b.id === 'completed-10-resources'));
  assert.equal(synced.profile.earnedBadges?.['level-5-proficiency'], '2026-11-13 23:45');
  assert.ok(synced.profile.activityLog[0].action === 'Achievement Badge Earned');

  // Re-syncing does not duplicate already-earned badges or logs
  const secondSync = syncProfileAchievements(synced.profile, '2026-11-13 23:50');
  assert.equal(secondSync.newlyEarned.length, 0);
  assert.equal(secondSync.profile.earnedBadges?.['level-5-proficiency'], '2026-11-13 23:45');
});
