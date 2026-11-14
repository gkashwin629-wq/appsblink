import { createInitialDemoProfile } from '../data/catalog';
import { LearnerProfile, SimulatedAccount, ThemeMode } from '../types';

const KEYS = {
  theme: 'skillpath_theme_v1',
  effects: 'skillpath_effects_v1',
  accounts: 'skillpath_accounts_v1',
  sessionEmail: 'skillpath_session_email_v1',
  demoProfile: 'skillpath_demo_profile_v1',
  resetCodes: 'skillpath_demo_reset_codes_v1',
};

const memoryFallback = new Map<string, string>();

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function getSafeStorage(customStorage?: StorageLike): { storage: StorageLike | null; hasError: boolean } {
  if (customStorage) {
    return { storage: customStorage, hasError: false };
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__sp_probe__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return { storage: window.localStorage, hasError: false };
    }
  } catch {
    return { storage: null, hasError: true };
  }
  return { storage: null, hasError: false };
}

export function safeGetItem(key: string, customStorage?: StorageLike): { value: string | null; storageDegraded: boolean } {
  const { storage, hasError } = getSafeStorage(customStorage);
  if (!storage) {
    return { value: memoryFallback.get(key) ?? null, storageDegraded: hasError };
  }
  try {
    return { value: storage.getItem(key), storageDegraded: false };
  } catch {
    return { value: memoryFallback.get(key) ?? null, storageDegraded: true };
  }
}

export function safeSetItem(key: string, value: string, customStorage?: StorageLike): boolean {
  memoryFallback.set(key, value);
  const { storage } = getSafeStorage(customStorage);
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemoveItem(key: string, customStorage?: StorageLike): boolean {
  memoryFallback.delete(key);
  const { storage } = getSafeStorage(customStorage);
  if (!storage) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function loadThemePreference(customStorage?: StorageLike): ThemeMode {
  const { value } = safeGetItem(KEYS.theme, customStorage);
  return value === 'light' ? 'light' : 'dark';
}

export function saveThemePreference(theme: ThemeMode, customStorage?: StorageLike): void {
  safeSetItem(KEYS.theme, theme, customStorage);
}

export function loadEffectsPreference(prefersReducedMotion: boolean, customStorage?: StorageLike): boolean {
  const { value } = safeGetItem(KEYS.effects, customStorage);
  if (value === 'off') return false;
  if (value === 'on') return true;
  return !prefersReducedMotion;
}

export function saveEffectsPreference(enabled: boolean, customStorage?: StorageLike): void {
  safeSetItem(KEYS.effects, enabled ? 'on' : 'off', customStorage);
}

function defaultSeedAccounts(): SimulatedAccount[] {
  const alex = createInitialDemoProfile('Alex Rivera', 'alex@skillpath.demo', false);
  return [
    {
      email: 'alex@skillpath.demo',
      password: 'skillpath123',
      name: 'Alex Rivera',
      provider: 'local',
      profile: alex,
    },
  ];
}

export function loadSimulatedAccounts(customStorage?: StorageLike): SimulatedAccount[] {
  const { value } = safeGetItem(KEYS.accounts, customStorage);
  if (!value) {
    const seeded = defaultSeedAccounts();
    safeSetItem(KEYS.accounts, JSON.stringify(seeded), customStorage);
    return seeded;
  }
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // recover gracefully
  }
  const seeded = defaultSeedAccounts();
  safeSetItem(KEYS.accounts, JSON.stringify(seeded), customStorage);
  return seeded;
}

export function saveSimulatedAccounts(accounts: SimulatedAccount[], customStorage?: StorageLike): void {
  safeSetItem(KEYS.accounts, JSON.stringify(accounts), customStorage);
}

export function signInSimulatedAccount(
  email: string,
  password: string,
  customStorage?: StorageLike
): { ok: true; account: SimulatedAccount } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    return { ok: false, error: 'Enter both an email address and password.' };
  }
  const accounts = loadSimulatedAccounts(customStorage);
  const found = accounts.find((a) => a.email.toLowerCase() === normalized);
  if (!found || found.password !== password) {
    return { ok: false, error: 'Invalid email or password for simulated demo accounts.' };
  }
  safeSetItem(KEYS.sessionEmail, found.email, customStorage);
  return { ok: true, account: found };
}

export function createSimulatedAccount(
  name: string,
  email: string,
  password: string,
  customStorage?: StorageLike
): { ok: true; account: SimulatedAccount } | { ok: false; error: string } {
  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  if (!trimmedName) {
    return { ok: false, error: 'Please enter your display name.' };
  }
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (password.length < 6) {
    return { ok: false, error: 'Use at least 6 characters for your demo password.' };
  }

  const accounts = loadSimulatedAccounts(customStorage);
  if (accounts.some((a) => a.email.toLowerCase() === normalizedEmail)) {
    return { ok: false, error: 'An account with this email already exists in browser storage.' };
  }

  const profile = createInitialDemoProfile(trimmedName, normalizedEmail, false);
  const newAccount: SimulatedAccount = {
    email: normalizedEmail,
    password,
    name: trimmedName,
    provider: 'local',
    profile,
  };
  saveSimulatedAccounts([...accounts, newAccount], customStorage);
  safeSetItem(KEYS.sessionEmail, normalizedEmail, customStorage);
  return { ok: true, account: newAccount };
}

export function signInSimulatedGoogle(customStorage?: StorageLike): SimulatedAccount {
  const email = 'maya.chen@google-demo.local';
  const accounts = loadSimulatedAccounts(customStorage);
  const existing = accounts.find((a) => a.email === email);
  if (existing) {
    safeSetItem(KEYS.sessionEmail, existing.email, customStorage);
    return existing;
  }
  const profile = createInitialDemoProfile('Maya Chen', email, false);
  profile.targetRole = 'data-scientist';
  profile.skillLevels = {
    ...profile.skillLevels,
    'python-data': 3,
    'sql-modeling': 3,
    'statistics-ab': 2,
  };
  const account: SimulatedAccount = {
    email,
    password: 'google-simulated-session',
    name: 'Maya Chen',
    provider: 'google-simulated',
    profile,
  };
  saveSimulatedAccounts([...accounts, account], customStorage);
  safeSetItem(KEYS.sessionEmail, account.email, customStorage);
  return account;
}

export function createDemoResetCode(
  email: string,
  customStorage?: StorageLike
): { ok: true; code: string } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  const accounts = loadSimulatedAccounts(customStorage);
  const found = accounts.find((a) => a.email.toLowerCase() === normalized);
  if (!found) {
    return { ok: false, error: 'No simulated account found for that email address.' };
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const { value } = safeGetItem(KEYS.resetCodes, customStorage);
  let map: Record<string, string> = {};
  if (value) {
    try {
      map = JSON.parse(value) || {};
    } catch {
      map = {};
    }
  }
  map[normalized] = code;
  safeSetItem(KEYS.resetCodes, JSON.stringify(map), customStorage);
  return { ok: true, code };
}

export function verifyDemoResetAndUpdatePassword(
  email: string,
  code: string,
  newPassword: string,
  customStorage?: StorageLike
): { ok: true } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  if (newPassword.length < 6) {
    return { ok: false, error: 'New password must be at least 6 characters.' };
  }
  const { value } = safeGetItem(KEYS.resetCodes, customStorage);
  let map: Record<string, string> = {};
  if (value) {
    try {
      map = JSON.parse(value) || {};
    } catch {
      map = {};
    }
  }
  if (!map[normalized] || map[normalized] !== code.trim()) {
    return { ok: false, error: 'Demo reset code does not match.' };
  }
  const accounts = loadSimulatedAccounts(customStorage);
  const updated = accounts.map((a) =>
    a.email.toLowerCase() === normalized ? { ...a, password: newPassword } : a
  );
  saveSimulatedAccounts(updated, customStorage);
  delete map[normalized];
  safeSetItem(KEYS.resetCodes, JSON.stringify(map), customStorage);
  return { ok: true };
}

export function loadActiveSessionProfile(customStorage?: StorageLike): LearnerProfile | null {
  const { value: sessionEmail } = safeGetItem(KEYS.sessionEmail, customStorage);
  if (!sessionEmail) return null;
  if (sessionEmail === '__demo__') {
    const { value: rawDemo } = safeGetItem(KEYS.demoProfile, customStorage);
    if (rawDemo) {
      try {
        return JSON.parse(rawDemo) as LearnerProfile;
      } catch {
        // fallback below
      }
    }
    return createInitialDemoProfile();
  }
  const accounts = loadSimulatedAccounts(customStorage);
  return accounts.find((a) => a.email.toLowerCase() === sessionEmail.toLowerCase())?.profile ?? null;
}

export function enterDemoSession(customStorage?: StorageLike): LearnerProfile {
  safeSetItem(KEYS.sessionEmail, '__demo__', customStorage);
  const { value: rawDemo } = safeGetItem(KEYS.demoProfile, customStorage);
  if (rawDemo) {
    try {
      return JSON.parse(rawDemo) as LearnerProfile;
    } catch {
      // create fresh
    }
  }
  const demo = createInitialDemoProfile();
  safeSetItem(KEYS.demoProfile, JSON.stringify(demo), customStorage);
  return demo;
}

export function saveLearnerProfile(profile: LearnerProfile, customStorage?: StorageLike): void {
  if (profile.isDemo) {
    safeSetItem(KEYS.demoProfile, JSON.stringify(profile), customStorage);
    return;
  }
  const accounts = loadSimulatedAccounts(customStorage);
  const updated = accounts.map((a) =>
    a.email.toLowerCase() === profile.email.toLowerCase()
      ? { ...a, name: profile.name, profile }
      : a
  );
  saveSimulatedAccounts(updated, customStorage);
}

export function clearActiveSession(customStorage?: StorageLike): void {
  safeRemoveItem(KEYS.sessionEmail, customStorage);
}
