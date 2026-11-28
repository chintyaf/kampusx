import { useState, useCallback } from 'react';
import recruiterApi from '../services/recruiterApi';

/**
 * Custom Hook: useJobMatching
 * Mengelola state input kriteria pekerjaan, eksekusi API Cosine Similarity, dan ranking hasil matching
 */
export const useJobMatching = () => {
  const [isMatchingActive, setIsMatchingActive] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [matching, setMatching] = useState(false);
  const [matchRankings, setMatchRankings] = useState(null);
  const [matchError, setMatchError] = useState(null);
  const [isCriteriaDirty, setIsCriteriaDirty] = useState(false);

  const addSkill = useCallback((skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    setRequiredSkills((prev) => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed];
    });
    if (matchRankings) setIsCriteriaDirty(true);
  }, [matchRankings]);

  const removeSkill = useCallback((skill) => {
    setRequiredSkills((prev) => prev.filter((s) => s !== skill));
    if (matchRankings) setIsCriteriaDirty(true);
  }, [matchRankings]);

  const selectPreset = useCallback((skill) => {
    setRequiredSkills((prev) => {
      if (prev.includes(skill)) return prev;
      return [...prev, skill];
    });
    if (matchRankings) setIsCriteriaDirty(true);
  }, [matchRankings]);

  const resetSkills = useCallback(() => {
    setRequiredSkills([]);
    if (matchRankings) setIsCriteriaDirty(true);
  }, [matchRankings]);

  const runMatch = useCallback(async () => {
    if (requiredSkills.length === 0) {
      setMatchError('Silakan masukkan minimal satu keahlian yang dibutuhkan.');
      return;
    }

    setMatching(true);
    setMatchError(null);
    try {
      const res = await recruiterApi.runSkillMatch({
        job_title: jobTitle.trim() || 'Posisi Kualifikasi',
        required_skills: requiredSkills,
      });

      if (res.success && res.data?.candidates) {
        setMatchRankings(res.data.candidates);
        setIsMatchingActive(true);
        setIsCriteriaDirty(false);
      } else {
        setMatchError(res.message || 'Gagal menghitung kecocokan kandidat.');
      }
    } catch (err) {
      setMatchError('Terjadi kesalahan saat menghubungi API Job Matching.');
    } finally {
      setMatching(false);
    }
  }, [jobTitle, requiredSkills]);

  const resetMatch = useCallback(() => {
    setMatchRankings(null);
    setIsMatchingActive(false);
    setIsCriteriaDirty(false);
    setMatchError(null);
  }, []);

  return {
    isMatchingActive,
    setIsMatchingActive,
    jobTitle,
    setJobTitle: (val) => {
      setJobTitle(val);
      if (matchRankings) setIsCriteriaDirty(true);
    },
    requiredSkills,
    addSkill,
    removeSkill,
    selectPreset,
    resetSkills,
    matching,
    matchRankings,
    matchError,
    isCriteriaDirty,
    runMatch,
    resetMatch,
    setMatchRankings,
    setRequiredSkills,
  };
};

export default useJobMatching;
