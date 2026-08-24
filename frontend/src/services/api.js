import { supabase } from './supabase';
import { encryptData, decryptData } from './encryption';

const STORAGE_KEY = 'resume-builder-data';

function getGuestSessionId() {
  try {
    let sid = sessionStorage.getItem('resora_guest_session_token');
    if (!sid) {
      // New browser session: purge previous guest resume records
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith(STORAGE_KEY) || k.startsWith('resora-uploaded-resume'))) {
          localStorage.removeItem(k);
        }
      }
      sid = 'guest_' + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem('resora_guest_session_token', sid);
    }
    return sid;
  } catch {
    return 'temp';
  }
}

// --- Browser Session Storage (Anonymous Guest Users) ---

export function loadResume(profession) {
  try {
    const uploadedRaw = sessionStorage.getItem('resora-uploaded-resume') || localStorage.getItem('resora-uploaded-resume');
    if (uploadedRaw) {
      const uploadedData = JSON.parse(uploadedRaw);
      if (uploadedData && uploadedData.resume) {
        if (!profession || uploadedData.profession === profession) {
          return uploadedData.resume;
        }
      }
    }

    const sid = getGuestSessionId();
    const key = profession ? `${STORAGE_KEY}-${sid}-${profession}` : `${STORAGE_KEY}-${sid}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveResume(data, profession) {
  try {
    const sid = getGuestSessionId();
    const key = profession ? `${STORAGE_KEY}-${sid}-${profession}` : `${STORAGE_KEY}-${sid}`;
    localStorage.setItem(key, JSON.stringify(data));
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
        profession: profession || 'it',
        targetRole: headline || profession || 'Software Developer',
        resume: data
      };
      localStorage.setItem('resora-last-active-resume-info', JSON.stringify(resInfo));
    } catch {}

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
    } catch {}

    return true;
  } catch (err) {
    console.error('Catch error clearing resume from Supabase:', err);
    return false;
  }
}

export async function findExistingUserResume(user) {
  try {
    if (user) {
      const { data, error } = await supabase
        .from('resumes')
        .select('profession, resume_data, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        for (const item of data) {
          const decrypted = decryptData(item.resume_data, user.id);
          if (decrypted) {
            const headline = decrypted.headline || decrypted.experience?.[0]?.title || '';
            const resInfo = {
              hasResume: true,
              profession: item.profession || 'it',
              targetRole: headline || item.profession || 'Software Developer',
              resume: decrypted
            };
            try {
              localStorage.setItem('resora-last-active-resume-info', JSON.stringify(resInfo));
            } catch {}
            return resInfo;
          }
        }
      }
    }

    // Check guest uploaded or guest local storage
    const uploadedRaw = sessionStorage.getItem('resora-uploaded-resume') || localStorage.getItem('resora-uploaded-resume');
    if (uploadedRaw) {
      const uploadedData = JSON.parse(uploadedRaw);
      if (uploadedData && uploadedData.resume) {
        const headline = uploadedData.resume.headline || uploadedData.resume.experience?.[0]?.title || '';
        const resInfo = {
          hasResume: true,
          profession: uploadedData.profession || 'it',
          targetRole: headline || uploadedData.profession || 'Software Developer',
          resume: uploadedData.resume
        };
        try {
          localStorage.setItem('resora-last-active-resume-info', JSON.stringify(resInfo));
        } catch {}
        return resInfo;
      }
    }

    // Check guest session storage
    const sid = sessionStorage.getItem('resora_guest_session_token');
    if (sid) {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(`${STORAGE_KEY}-${sid}`)) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            const parts = k.split('-');
            const prof = parts[parts.length - 1] || 'it';
            const headline = parsed.headline || parsed.experience?.[0]?.title || '';
            const resInfo = {
              hasResume: true,
              profession: prof,
              targetRole: headline || prof || 'Software Developer',
              resume: parsed
            };
            try {
              localStorage.setItem('resora-last-active-resume-info', JSON.stringify(resInfo));
            } catch {}
            return resInfo;
          }
        }
      }
    }
  } catch (err) {
    console.error('Error finding existing user resume:', err);
  }

  try {
    localStorage.removeItem('resora-last-active-resume-info');
  } catch {}
  return null;
}
