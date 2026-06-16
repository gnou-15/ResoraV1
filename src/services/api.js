import { supabase } from './supabase';

const STORAGE_KEY = 'resume-builder-data';

// --- Local Storage Fallbacks (Anonymous Users) ---

export function loadResume(profession) {
  try {
    const key = profession ? `${STORAGE_KEY}-${profession}` : STORAGE_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveResume(data, profession) {
  const key = profession ? `${STORAGE_KEY}-${profession}` : STORAGE_KEY;
  localStorage.setItem(key, JSON.stringify(data));
}

export function clearResume(profession) {
  const key = profession ? `${STORAGE_KEY}-${profession}` : STORAGE_KEY;
  localStorage.removeItem(key);
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
    return data ? data.resume_data : null;
  } catch (err) {
    console.error('Catch error loading resume from Supabase:', err);
    return null;
  }
}

export async function saveResumeToSupabase(data, profession, userId) {
  try {
    const { error } = await supabase
      .from('resumes')
      .upsert({
        user_id: userId,
        profession: profession,
        resume_data: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,profession' });

    if (error) {
      console.error('Error saving resume to Supabase:', error);
      return false;
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
    return true;
  } catch (err) {
    console.error('Catch error clearing resume from Supabase:', err);
    return false;
  }
}
