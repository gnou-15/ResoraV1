import { useState, useEffect, useCallback, useRef } from 'react'
import { defaultResume, migrateResume } from '../data/defaultResume'
import { getTemplateForProfession } from '../data/professionTemplates'
import {
  loadResume,
  saveResume,
  clearResume as clearStoredResume,
  loadResumeFromSupabase,
  saveResumeToSupabase,
  clearResumeFromSupabase
} from '../services/api'

export function useResume(profession, user) {
  const [resume, setResumeRaw] = useState(() => {
    if (user) {
      return {
        ...defaultResume,
        personal: {
          ...defaultResume.personal,
          fullName: user.user_metadata?.full_name || "",
        },
      };
    }
    return migrateResume(loadResume(profession));
  })

  const setResume = useCallback((value) => {
    setResumeRaw((prev) => {
      let next = typeof value === "function" ? value(prev) : value;
      if (user) {
        const currentPersonal = next.personal || {};
        next = {
          ...next,
          personal: {
            ...defaultResume.personal,
            ...currentPersonal,
            fullName: user.user_metadata?.full_name || currentPersonal.fullName || "",
          },
        };
      }
      return next;
    });
  }, [user]);
  const [loadedProfession, setLoadedProfession] = useState(profession)
  const [saved, setSaved] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // Sync state if profession or user changes dynamically
  useEffect(() => {
    let active = true;
    setIsInitialized(false);

    const fetchResume = async () => {
      let data;
      if (user) {
        data = await loadResumeFromSupabase(profession, user.id);
      } else {
        data = loadResume(profession);
      }
      if (active) {
        let migrated;
        if (data) {
          migrated = migrateResume(data);
        } else {
          // Check if there is an API configured for templates
          let apiPayload = null;
          const api = localStorage.getItem("templateApi");
          if (api) {
            try {
              const url = `${api.replace(/\/?$/, "")}?profession=${encodeURIComponent(profession)}`;
              const res = await fetch(url);
              if (res.ok) {
                const apiData = await res.json();
                apiPayload = apiData.resume || apiData;
              }
            } catch (e) {
              // ignore and fallback
            }
          }

          if (apiPayload) {
            migrated = migrateResume(apiPayload);
          } else {
            const tpl = getTemplateForProfession(profession);
            migrated = migrateResume({ ...defaultResume, ...tpl });
          }
        }

        if (user) {
          migrated.personal = {
            ...defaultResume.personal,
            ...migrated.personal,
            fullName: user.user_metadata?.full_name || migrated.personal.fullName || "",
          };
        }
        setResume(migrated);
        setLoadedProfession(profession);
        setIsInitialized(true);
      }
    };

    fetchResume();

    return () => {
      active = false;
    };
  }, [profession, user, setResume]);

  useEffect(() => {
    // Only save if the loaded resume state matches the active profession and is initialized
    if (!isInitialized || profession !== loadedProfession || !profession) return

    setSaved(false)
    const timer = setTimeout(async () => {
      if (user) {
        await saveResumeToSupabase(resume, profession, user.id);
      } else {
        saveResume(resume, profession);
      }
      setSaved(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [resume, profession, loadedProfession, user, isInitialized])

  // Save changes immediately on unmount if they haven't been saved yet
  const unmountRef = useRef({ resume, profession, user, isInitialized, saved });
  useEffect(() => {
    unmountRef.current = { resume, profession, user, isInitialized, saved };
  }, [resume, profession, user, isInitialized, saved]);

  useEffect(() => {
    return () => {
      const { resume: curResume, profession: curProf, user: curUser, isInitialized: curInit, saved: curSaved } = unmountRef.current;
      if (curInit && !curSaved && curProf) {
        if (curUser) {
          saveResumeToSupabase(curResume, curProf, curUser.id);
        } else {
          saveResume(curResume, curProf);
        }
      }
    };
  }, []);

  const updatePersonal = useCallback((field, value) => {
    setResume((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }))
  }, [setResume])

  const updateLocation = useCallback((field, value) => {
    setResume((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        location: { ...prev.personal.location, [field]: value },
      },
    }))
  }, [setResume])

  const updateHeadline = useCallback((value) => {
    setResume((prev) => ({ ...prev, headline: value }))
  }, [setResume])

  const updateSummary = useCallback((value) => {
    setResume((prev) => ({ ...prev, summary: value }))
  }, [setResume])

  const updateTechnicalSkill = useCallback((key, value) => {
    setResume((prev) => ({
      ...prev,
      technicalSkills: { ...prev.technicalSkills, [key]: value },
    }))
  }, [setResume])

  const updateUserType = useCallback((value) => {
    setResume((prev) => ({ ...prev, userType: value }))
  }, [setResume])

  const resetResume = useCallback(async () => {
    if (user) {
      await clearResumeFromSupabase(profession, user.id);
    } else {
      clearStoredResume(profession);
    }
    const resetData = { ...defaultResume };
    if (user) {
      resetData.personal = {
        ...resetData.personal,
        fullName: user.user_metadata?.full_name || "",
      };
    }
    setResume(resetData);
  }, [profession, user, setResume])

  return {
    resume,
    setResume,
    saved,
    updatePersonal,
    updateLocation,
    updateHeadline,
    updateSummary,
    updateTechnicalSkill,
    updateUserType,
    resetResume,
  }
}
