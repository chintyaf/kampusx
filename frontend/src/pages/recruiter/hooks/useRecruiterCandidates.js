import { useState, useCallback, useEffect } from 'react';
import recruiterApi from '../services/recruiterApi';

/**
 * Custom Hook: useRecruiterCandidates
 * Mengelola state pencarian, filter, dan data daftar kandidat mahasiswa
 */
export const useRecruiterCandidates = () => {
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('ALL');
  const [sbtOnly, setSbtOnly] = useState(false);

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruiterApi.getCandidates({
        search,
        tier,
        has_sbt: sbtOnly,
      });

      if (res.success) {
        setCandidates(res.data || []);
        setTotalResults(res.meta?.total || (res.data || []).length);
      } else {
        setError(res.message || 'Gagal memuat kandidat.');
        setCandidates([]);
        setTotalResults(0);
      }
    } catch (err) {
      setError('Terjadi kendala saat memuat data kandidat.');
      setCandidates([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [search, tier, sbtOnly]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setTier('ALL');
    setSbtOnly(false);
  }, []);

  return {
    search,
    setSearch,
    tier,
    setTier,
    sbtOnly,
    setSbtOnly,
    candidates,
    loading,
    error,
    totalResults,
    loadCandidates,
    resetFilters,
  };
};

export default useRecruiterCandidates;
