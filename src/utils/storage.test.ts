import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearActiveSession,
  createDemoResetCode,
  createSimulatedAccount,
  enterDemoSession,
  loadActiveSessionProfile,
  loadEffectsPreference,
  loadThemePreference,
  saveEffectsPreference,
  saveLearnerProfile,
  saveThemePreference,
  signInSimulatedAccount,
  StorageLike,
  verifyDemoResetAndUpdatePassword,
} from './storage';

function makeMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

test('theme and effects preferences persist cleanly', () => {
  const store = makeMemoryStorage();
  assert.equal(loadThemePreference(store), 'dark');
  saveThemePreference('light', store);
  assert.equal(loadThemePreference(store), 'light');

  assert.equal(loadEffectsPreference(false, store), true);
  assert.equal(loadEffectsPreference(true, store), false);
  saveEffectsPreference(false, store);
  assert.equal(loadEffectsPreference(false, store), false);
});

test('simulated account creation, sign-in, and demo-only password reset flow', () => {
  const store = makeMemoryStorage();
  const created = createSimulatedAccount('Jordan Lee', 'jordan@example.com', 'secret99', store);
  assert.equal(created.ok, true);

  clearActiveSession(store);
  assert.equal(loadActiveSessionProfile(store), null);

  const badLogin = signInSimulatedAccount('jordan@example.com', 'wrongpass', store);
  assert.equal(badLogin.ok, false);

  const resetReq = createDemoResetCode('jordan@example.com', store);
  assert.equal(resetReq.ok, true);
  if (!resetReq.ok) return;

  const badReset = verifyDemoResetAndUpdatePassword('jordan@example.com', '000000', 'newpass123', store);
  assert.equal(badReset.ok, false);

  const goodReset = verifyDemoResetAndUpdatePassword('jordan@example.com', resetReq.code, 'newpass123', store);
  assert.equal(goodReset.ok, true);

  const goodLogin = signInSimulatedAccount('jordan@example.com', 'newpass123', store);
  assert.equal(goodLogin.ok, true);
});

test('demo session saves and reloads profile modifications', () => {
  const store = makeMemoryStorage();
  const demo = enterDemoSession(store);
  demo.name = 'Updated Demo Learner';
  demo.targetRole = 'devops';
  saveLearnerProfile(demo, store);

  const reloaded = loadActiveSessionProfile(store);
  assert.ok(reloaded);
  assert.equal(reloaded?.name, 'Updated Demo Learner');
  assert.equal(reloaded?.targetRole, 'devops');
});
