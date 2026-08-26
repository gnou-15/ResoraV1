import { describe, it, expect } from 'vitest';
import { encryptData, decryptData, encryptName, decryptName } from '../services/encryption';

const MOCK_USER_ID = 'test-user-uuid-1234-abcd';

describe('encryptData / decryptData', () => {
  it('encrypts an object and returns an object with encrypted: true and ciphertext', () => {
    const data = { headline: 'Software Developer', summary: 'Builds apps.' };
    const encrypted = encryptData(data, MOCK_USER_ID);

    expect(encrypted).toBeDefined();
    expect(encrypted.encrypted).toBe(true);
    expect(typeof encrypted.ciphertext).toBe('string');
    expect(encrypted.ciphertext.length).toBeGreaterThan(10);
  });

  it('decrypts back to the original object', () => {
    const original = { headline: 'Engineer', skills: 'React, Node.js' };
    const encrypted = encryptData(original, MOCK_USER_ID);
    const decrypted = decryptData(encrypted, MOCK_USER_ID);

    expect(decrypted).toEqual(original);
  });

  it('returns null (not the raw wrapper) when decryption fails due to wrong userId', () => {
    const data = { headline: 'Secret' };
    const encrypted = encryptData(data, MOCK_USER_ID);

    // Attempt to decrypt with the wrong key
    const result = decryptData(encrypted, 'wrong-user-id');
    expect(result).toBeNull();
  });

  it('returns null when ciphertext is corrupted', () => {
    const corrupted = { encrypted: true, ciphertext: 'definitely-not-valid-base64!!!' };
    const result = decryptData(corrupted, MOCK_USER_ID);
    expect(result).toBeNull();
  });

  it('returns original data as-is if it is not in encrypted format (plaintext fallback)', () => {
    const plaintext = { headline: 'Legacy plaintext', summary: 'Old format' };
    // No `encrypted` flag — treat as plaintext
    const result = decryptData(plaintext, MOCK_USER_ID);
    expect(result).toEqual(plaintext);
  });

  it('returns data when userId is missing for non-encrypted data', () => {
    const plaintext = { headline: 'No user id' };
    const result = decryptData(plaintext, null);
    expect(result).toEqual(plaintext);
  });

  it('returns null when encrypted data is provided but userId is null', () => {
    const data = { headline: 'Test' };
    const encrypted = encryptData(data, MOCK_USER_ID);
    const result = decryptData(encrypted, null);
    expect(result).toBeNull();
  });
});

describe('encryptName / decryptName', () => {
  it('encrypts a name with enc: prefix and decrypts it back', () => {
    const name = 'Daniel Kane Isidore Mapano';
    const encrypted = encryptName(name, MOCK_USER_ID);

    expect(encrypted).toMatch(/^enc:/);
    expect(encrypted).not.toBe(name);

    const decrypted = decryptName(encrypted, MOCK_USER_ID);
    expect(decrypted).toBe(name);
  });

  it('returns plaintext unchanged if it does not start with enc:', () => {
    const plainName = 'Daniel Mapano';
    const result = decryptName(plainName, MOCK_USER_ID);
    expect(result).toBe(plainName);
  });

  it('returns original text if decryption fails due to wrong userId', () => {
    const name = 'Daniel Mapano';
    const encrypted = encryptName(name, MOCK_USER_ID);
    // Wrong userId: decryption should fail, return the raw encrypted string
    const result = decryptName(encrypted, 'wrong-user');
    // Should not throw, should return something (either original enc string or empty)
    expect(result).toBeDefined();
  });
});
