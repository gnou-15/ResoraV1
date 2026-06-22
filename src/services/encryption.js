import CryptoJS from 'crypto-js';

// Read pepper from env, with a secure fallback for local development
const masterKey = import.meta.env.VITE_ENCRYPTION_KEY || 'resora-default-secret-pepper-9921a';

/**
 * Derives a unique key for a user by hashing the master key and user UUID.
 */
function getKey(userId) {
    if (!userId) return null;
    // Derive a stable, unique 256-bit key for this user
    return CryptoJS.SHA256(masterKey + ":" + userId).toString();
}

/**
 * Encrypts a name (or simple string) and prefixes it with 'enc:'
 */
export function encryptName(text, userId) {
    if (!text || !userId) return text;
    const key = getKey(userId);
    if (!key) return text;

    try {
        const encrypted = CryptoJS.AES.encrypt(text.trim(), key).toString();
        return `enc:${encrypted}`;
    } catch (err) {
        console.error('Error encrypting name:', err);
        return text;
    }
}

/**
 * Decrypts a name (or simple string) if it has the 'enc:' prefix
 */
export function decryptName(text, userId) {
    if (!text || typeof text !== 'string' || !userId) return text;
    if (!text.startsWith('enc:')) return text; // plaintext fallback

    const key = getKey(userId);
    if (!key) return text;

    try {
        const ciphertext = text.slice(4); // Remove 'enc:' prefix
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || text; // fallback to original if decryption fails
    } catch (err) {
        console.error('Error decrypting name:', err);
        return text;
    }
}

/**
 * Encrypts any JS object or string. Returns an encrypted wrapper.
 */
export function encryptData(data, userId) {
    if (!data || !userId) return data;
    const key = getKey(userId);
    if (!key) return data;

    try {
        const jsonStr = JSON.stringify(data);
        const ciphertext = CryptoJS.AES.encrypt(jsonStr, key).toString();
        return {
            encrypted: true,
            ciphertext
        };
    } catch (err) {
        console.error('Error encrypting data:', err);
        return data;
    }
}

/**
 * Decrypts data if it is wrapped in the encrypted structure.
 */
export function decryptData(data, userId) {
    if (!data || !userId) return data;
    if (!data.encrypted || !data.ciphertext) return data; // plaintext fallback

    const key = getKey(userId);
    if (!key) return data;

    try {
        const bytes = CryptoJS.AES.decrypt(data.ciphertext, key);
        const jsonStr = bytes.toString(CryptoJS.enc.Utf8);
        if (!jsonStr) return data;
        return JSON.parse(jsonStr);
    } catch (err) {
        console.error('Error decrypting data:', err);
        return data;
    }
}
