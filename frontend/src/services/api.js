import { supabase } from './supabase';
import { encryptData, decryptData } from './encryption';
import { isResumeEmpty, hasSufficientContent } from '../data/defaultResume';


const STORAGE_KEY = 'resume-builder-data';

function getGuestSessionId() {
  try {
    // Check both storages — localStorage survives new tabs/browser restarts
    let sid = localStorage.getItem('resora_guest_session_token') || sessionStorage.getItem('resora_guest_session_token');
    if (!sid) {
      sid = 'guest_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('resora_guest_session_token', sid);
    }
    // Keep sessionStorage in sync for fast same-session reads
    sessionStorage.setItem('resora_guest_session_token', sid);
    return sid;
  } catch {
    return 'temp';
  }
}

// --- Browser Session Storage (Anonymous Guest Users) ---

export function loadResume(profession) {
  try {
    // 1. Check saved guest resume for this profession first (contains user's latest edits)
    const sid = getGuestSessionId();
    const key = profession ? `${STORAGE_KEY}-${sid}-${profession}` : `${STORAGE_KEY}-${sid}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);

    // 2. Fall back to uploaded resume payload if not yet saved to a profession slot
    const uploadedRaw = sessionStorage.getItem('resora-uploaded-resume') || localStorage.getItem('resora-uploaded-resume');
    if (uploadedRaw) {
      const uploadedData = JSON.parse(uploadedRaw);
      if (uploadedData && uploadedData.resume) {
        if (!profession || uploadedData.profession === profession) {
          return uploadedData.resume;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function saveResume(data, profession, user = null) {
  try {
    const sid = getGuestSessionId();
    const key = profession ? `${STORAGE_KEY}-${sid}-${profession}` : `${STORAGE_KEY}-${sid}`;
    localStorage.setItem(key, JSON.stringify(data));

    // Instantly update active resume info in localStorage (0ms delay)
    const headline = data.headline || data.experience?.[0]?.title || '';
    const resInfo = {
      hasResume: true,
      userId: user ? user.id : sid,
      profession: profession || 'it',
      targetRole: headline || profession || 'Software Developer',
      resume: data
    };
    localStorage.setItem('resora-last-active-resume-info', JSON.stringify(resInfo));

    // Also keep the uploaded resume cache synchronized with the latest edits
    const uploadedRaw = sessionStorage.getItem('resora-uploaded-resume') || localStorage.getItem('resora-uploaded-resume');
    if (uploadedRaw) {
      try {
        const uploadedData = JSON.parse(uploadedRaw);
        if (uploadedData && (!profession || uploadedData.profession === profession)) {
          const updatedUpload = { ...uploadedData, resume: data };
          sessionStorage.setItem('resora-uploaded-resume', JSON.stringify(updatedUpload));
          localStorage.setItem('resora-uploaded-resume', JSON.stringify(updatedUpload));
        }
      } catch {
        /* ignore */
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resora-resume-updated', { detail: resInfo }));
    }
  } catch {
    // ignore
  }
}

export function clearResume(profession) {
  try {
    const sid = getGuestSessionId();
    const key = profession ? `${STORAGE_KEY}-${sid}-${profession}` : `${STORAGE_KEY}-${sid}`;
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function clearAllGuestResumes() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(STORAGE_KEY) || k.startsWith('resora-uploaded-resume'))) {
        localStorage.removeItem(k);
      }
    }
    sessionStorage.removeItem('resora_guest_session_token');
  } catch {
    // ignore
  }
}

export function purgeUserAndSessionData() {
  try {
    // 1. Remove all cached resume builder data from localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(STORAGE_KEY) || k.startsWith('resora-uploaded-resume') || k.startsWith('resora-last-active-resume-info') || k.startsWith('resora-route') || k === 'resora-remaining-uploads' || k === 'resora-upload-rate-limit-until')) {
        localStorage.removeItem(k);
      }
    }

    // 2. Remove all cached resume data from sessionStorage
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && (k.startsWith(STORAGE_KEY) || k.startsWith('resora-uploaded-resume') || k.startsWith('resora-last-active-resume-info') || k.startsWith('resora-route') || k === 'resora_guest_session_token')) {
        sessionStorage.removeItem(k);
      }
    }

    // 3. Assign a brand-new clean guest session token
    const newGuestToken = 'guest_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('resora_guest_session_token', newGuestToken);
    sessionStorage.setItem('resora_guest_session_token', newGuestToken);

    // 4. Dispatch events to notify all active components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resora-resume-updated', { detail: null }));
      window.dispatchEvent(new Event('resora-upload-cleared'));
    }
  } catch {
    /* ignore */
  }
}

// --- Supabase Persistence (Authenticated Users) ---
export async function loadResumeFromSupabase(profession, userId) {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('resume_data')
      .eq('user_id', userId)
      .eq('profession', profession)
      .maybeSingle();

    if (error) {
      console.error('Error loading resume from Supabase:', error);
      return null;
    }

    const rawData = data ? data.resume_data : null;
    // Decrypt data, falling back to plaintext if the record is legacy/unencrypted
    return decryptData(rawData, userId);
  } catch (err) {
    console.error('Catch error loading resume from Supabase:', err);
    return null;
  }
}

export async function saveResumeToSupabase(data, profession, userId) {
  try {
    const empty = isResumeEmpty(data);
    if (empty) {
      // If resume has been cleared, remove it from Supabase and cache
      await clearResumeFromSupabase(profession, userId);
      try {
        localStorage.removeItem('resora-last-active-resume-info');
      } catch {
        /* ignore */
      }
      return true;
    }

    // Encrypt the JSON data using the user's derived key
    const encryptedData = encryptData(data, userId);

    const { error } = await supabase
      .from('resumes')
      .upsert({
        user_id: userId,
        profession: profession,
        resume_data: encryptedData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,profession' });

    if (error) {
      console.error('Error saving resume to Supabase:', error);
      return false;
    }

    try {
      const headline = data.headline || data.experience?.[0]?.title || '';
      const resInfo = {
        hasResume: true,
        userId: userId,
        profession: profession || 'it',
        targetRole: headline || profession || 'Software Developer',
        resume: data
      };
      localStorage.setItem('resora-last-active-resume-info', JSON.stringify(resInfo));

      // Keep uploaded resume cache in sync with user edits
      const uploadedRaw = sessionStorage.getItem('resora-uploaded-resume') || localStorage.getItem('resora-uploaded-resume');
      if (uploadedRaw) {
        try {
          const uploadedData = JSON.parse(uploadedRaw);
          if (uploadedData && (!profession || uploadedData.profession === profession)) {
            const updatedUpload = { ...uploadedData, resume: data };
            sessionStorage.setItem('resora-uploaded-resume', JSON.stringify(updatedUpload));
            localStorage.setItem('resora-uploaded-resume', JSON.stringify(updatedUpload));
          }
        } catch {
          /* ignore */
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('resora-resume-updated', { detail: resInfo }));
      }
    } catch {
      /* ignore storage errors */
    }

    return true;
  } catch (err) {
    console.error('Catch error saving resume to Supabase:', err);
    return false;
  }
}

export async function clearResumeFromSupabase(profession, userId) {
  try {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('user_id', userId)
      .eq('profession', profession);

    if (error) {
      console.error('Error clearing resume from Supabase:', error);
      return false;
    }

    try {
      localStorage.removeItem('resora-last-active-resume-info');
    } catch {
      /* ignore storage errors */
    }

    return true;
  } catch (err) {
    console.error('Catch error clearing resume from Supabase:', err);
    return false;
  }
}

export async function findExistingUserResume(user) {
  if (!user) {
    try {
      localStorage.removeItem('resora-last-active-resume-info');
    } catch {
      /* ignore storage errors */
    }
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('profession, resume_data, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data && data.length > 0) {
      for (const item of data) {
        const decrypted = decryptData(item.resume_data, user.id);
        if (decrypted && hasSufficientContent(decrypted)) {
          const headline = decrypted.headline || decrypted.experience?.[0]?.title || '';
          const resInfo = {
            hasResume: true,
            userId: user.id,
            profession: item.profession || 'it',
            targetRole: headline || item.profession || 'Software Developer',
            resume: decrypted
          };
          try {
            localStorage.setItem('resora-last-active-resume-info', JSON.stringify(resInfo));
          } catch {
            /* ignore storage errors */
          }
          return resInfo;
        }
      }
    }
  } catch (err) {
    console.error('Error finding existing user resume:', err);
  }

  try {
    localStorage.removeItem('resora-last-active-resume-info');
  } catch {
    /* ignore storage errors */
  }
  return null;
}
