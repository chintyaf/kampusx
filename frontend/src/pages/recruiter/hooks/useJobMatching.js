import { useState, useCallback, useEffect, useRef } from 'react';
import recruiterApi from '../services/recruiterApi';

/**
 * Custom Hook: useJobMatching
 * Mengelola daftar skill dari backend (/public/skills), state kriteria pekerjaan,
 * dan auto-update hasil Job Matching (/job-matching/search) saat skill berubah
 */
export const useJobMatching = () => {
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [skillsError, setSkillsError] = useState(null);

  const [isMatchingActive, setIsMatchingActive] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]); // Array of { id, name }
  const [matching, setMatching] = useState(false);
  const [matchRankings, setMatchRankings] = useState(null);
  const [matchError, setMatchError] = useState(null);

  const jobTitleRef = useRef(jobTitle);
  jobTitleRef.current = jobTitle;

  // Load skills from /public/skills
  useEffect(() => {
    let active = true;
    const fetchSkills = async () => {
      setLoadingSkills(true);
      setSkillsError(null);
      const res = await recruiterApi.getPublicSkills();
      if (!active) return;

      if (res.success) {
        setAvailableSkills(res.data);
      } else {
        setSkillsError(res.message || 'Gagal memuat daftar skill.');
      }
      setLoadingSkills(false);
    };

    fetchSkills();
    return () => {
      active = false;
    };
  }, []);

  // Auto-update Job Matching results whenever requiredSkills changes
  useEffect(() => {
    if (requiredSkills.length === 0) {
      setMatchRankings(null);
      setIsMatchingActive(false);
      setMatchError(null);
      setMatching(false);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setMatching(true);
      setMatchError(null);
      try {
        const res = await recruiterApi.runSkillMatch({
          job_title: jobTitleRef.current.trim() || 'Posisi Kualifikasi',
          required_skills: requiredSkills,
        });
        if (cancelled) return;

        if (res.success && res.data?.candidates) {
          setMatchRankings(res.data.candidates);
          setIsMatchingActive(true);
        } else {
          setMatchError(res.message || 'Gagal menghitung kecocokan kandidat.');
        }
      } catch (err) {
        if (!cancelled) {
          setMatchError('Terjadi kesalahan saat menghubungi API Job Matching.');
        }
      } finally {
        if (!cancelled) {
          setMatching(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [requiredSkills]);

  const toggleSkill = useCallback((skill) => {
    if (!skill?.id) return;
    const skillId = Number(skill.id);

    setRequiredSkills((prev) => {
      const isSelected = prev.some((s) => Number(s.id) === skillId);
      return isSelected
        ? prev.filter((s) => Number(s.id) !== skillId)
        : [...prev, { id: skillId, name: skill.name }];
    });
  }, []);

  const removeSkill = useCallback((skillOrId) => {
    const targetId = typeof skillOrId === 'object' ? Number(skillOrId.id) : Number(skillOrId);
    setRequiredSkills((prev) => prev.filter((s) => Number(s.id) !== targetId));
  }, []);

  const resetSkills = useCallback(() => {
    setRequiredSkills([]);
  }, []);

  const resetMatch = useCallback(() => {
    setRequiredSkills([]);
    setMatchRankings(null);
    setIsMatchingActive(false);
    setMatchError(null);
  }, []);

  return {
    availableSkills,
    loadingSkills,
    skillsError,
    isMatchingActive,
    setIsMatchingActive,
    jobTitle,
    setJobTitle,
    requiredSkills,
    toggleSkill,
    removeSkill,
    resetSkills,
    matching,
    matchRankings,
    matchError,
    resetMatch,
    setMatchRankings,
    setRequiredSkills,
  };
};

export default useJobMatching;
