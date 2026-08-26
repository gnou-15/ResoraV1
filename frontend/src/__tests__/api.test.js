// @vitest-environment jsdom
/**
 * Tests for guest session persistence and resume storage logic in api.js.
 *
 * These tests cover the exact bug that caused guest resume data to be wiped:
 * getGuestSessionId() was only reading from sessionStorage, so opening a new
 * tab (new sessionStorage, same localStorage) generated a new session token
 * and purged all existing guest resume data.
 *
 * The fix: read from localStorage first, write to both storages.
 */
import { describe, it, expect, beforeEach } from 'vitest';

// ── Minimal localStorage / sessionStorage mock ──────────────────────────────
// vitest + jsdom provides these, but we define a clean reset helper.

function clearAllStorage() {
  localStorage.clear();
  sessionStorage.clear();
}

// We import the functions under test after mocks are set up because api.js
// imports supabase which isn't available in the test environment.
// We use vi.mock to stub the problematic imports.
import { vi } from 'vitest';

vi.mock('../services/supabase', () => ({ supabase: {} }));
vi.mock('../services/encryption', () => ({
  encryptData: (data) => data,
  decryptData: (data) => data,
}));
vi.mock('../data/defaultResume', () => ({
  isResumeEmpty: () => false,
  defaultResume: {},
  migrateResume: (d) => d,
}));

// Import after mocks
const { loadResume, saveResume, clearResume } = await import('../services/api');

// ── Tests ────────────────────────────────────────────────────────────────────

describe('getGuestSessionId (via saveResume / loadResume)', () => {
  beforeEach(clearAllStorage);

  it('creates a session token on first call and stores it in localStorage', () => {
    saveResume({ headline: 'Test' }, 'it');
    const token = localStorage.getItem('resora_guest_session_token');
    expect(token).toBeTruthy();
    expect(token).toMatch(/^guest_/);
  });

  it('returns the same token on subsequent calls within the same session', () => {
    saveResume({ headline: 'First' }, 'it');
    const tokenA = localStorage.getItem('resora_guest_session_token');
    saveResume({ headline: 'Second' }, 'it');
    const tokenB = localStorage.getItem('resora_guest_session_token');
    expect(tokenA).toBe(tokenB);
  });

  it('survives a simulated new tab (sessionStorage cleared, localStorage kept)', () => {
    // Simulate first tab: write some resume data
    saveResume({ headline: 'My Resume' }, 'it');
    const originalToken = localStorage.getItem('resora_guest_session_token');

    // Simulate new tab: sessionStorage is wiped, localStorage persists
    sessionStorage.clear();

    // Load resume — should still find data using localStorage token
    const loaded = loadResume('it');
    expect(loaded).not.toBeNull();
    expect(loaded?.headline).toBe('My Resume');

    // Token should remain the same (read from localStorage)
    const tokenAfterNewTab = localStorage.getItem('resora_guest_session_token');
    expect(tokenAfterNewTab).toBe(originalToken);
  });

  it('does NOT purge existing resume data when a new session token is needed', () => {
    // Set up resume data under an existing token in localStorage
    const existingToken = 'guest_existingtoken';
    localStorage.setItem('resora_guest_session_token', existingToken);
    localStorage.setItem(`resume-builder-data-${existingToken}-it`, JSON.stringify({ headline: 'Kept' }));

    // New "session" — sessionStorage is empty
    sessionStorage.clear();

    // Load should still find the existing data
    const loaded = loadResume('it');
    expect(loaded?.headline).toBe('Kept');
  });
});

describe('saveResume / loadResume', () => {
  beforeEach(clearAllStorage);

  it('saves and loads resume data for a profession', () => {
    const data = { headline: 'Software Developer', summary: 'I build things.' };
    saveResume(data, 'it');
    const loaded = loadResume('it');
    expect(loaded).toEqual(data);
  });

  it('returns null when no resume is stored for a profession', () => {
    const loaded = loadResume('healthcare');
    expect(loaded).toBeNull();
  });

  it('stores different resumes under different profession keys', () => {
    saveResume({ headline: 'Developer' }, 'it');
    saveResume({ headline: 'Nurse' }, 'healthcare');

    expect(loadResume('it')?.headline).toBe('Developer');
    expect(loadResume('healthcare')?.headline).toBe('Nurse');
  });
});

describe('clearResume', () => {
  beforeEach(clearAllStorage);

  it('removes the resume for the specified profession', () => {
    saveResume({ headline: 'To be deleted' }, 'it');
    clearResume('it');
    expect(loadResume('it')).toBeNull();
  });

  it('does not affect resume data for other professions', () => {
    saveResume({ headline: 'Developer' }, 'it');
    saveResume({ headline: 'Nurse' }, 'healthcare');
    clearResume('it');

    expect(loadResume('it')).toBeNull();
    expect(loadResume('healthcare')?.headline).toBe('Nurse');
  });
});
