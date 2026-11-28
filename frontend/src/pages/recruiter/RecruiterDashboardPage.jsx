import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Badge } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LogoKampusX from '@/assets/images/logo/Logo_KampusX.svg';
import recruiterApi from './services/recruiterApi';
import useRecruiterCandidates from './hooks/useRecruiterCandidates';
import useJobMatching from './hooks/useJobMatching';
import './RecruiterView.css';

// Subcomponents & Views
import RecruiterLeftSidebar from './components/RecruiterLeftSidebar';
import TalentZeroTrustModal from './components/TalentZeroTrustModal';
import TalentDirectoryView from './views/TalentDirectoryView';

/**
 * RecruiterDashboardPage
 * Halaman utama Direktori Talenta untuk Recruiter KampusX
 * Berfokus murni pada penelusuran kandidat, filter, dan Job Matching
 * Navigasi profil kandidat diarahkan ke halaman profil tersendiri (/profile/:id)
 */
const RecruiterDashboardPage = () => {
  const { user } = useAuth();
  const { id: paramCandidateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'directory' (Semua Kandidat) | 'matching' (Job Matching Engine)
  const [activeMode, setActiveMode] = useState('directory');
  const [showMatchingPanel, setShowMatchingPanel] = useState(false);

  // Zero-Trust Modal State
  const [showZeroTrustModal, setShowZeroTrustModal] = useState(false);
  const [zeroTrustTarget, setZeroTrustTarget] = useState({ candidate: null, cert: null });

  // Real Dashboard Stats
  const [stats, setStats] = useState({
    total_candidates: 0,
    total_verified_credentials: 0,
  });

  // Custom Hooks for State Separation
  const {
    search,
    setSearch,
    tier,
    setTier,
    sbtOnly,
    setSbtOnly,
    candidates,
    loading: candidatesLoading,
    error: candidatesError,
    totalResults,
    loadCandidates,
    resetFilters,
  } = useRecruiterCandidates();

  const {
    isMatchingActive,
    setIsMatchingActive,
    jobTitle,
    setJobTitle,
    requiredSkills,
    setRequiredSkills,
    addSkill,
    removeSkill,
    selectPreset,
    resetSkills,
    matching,
    matchRankings,
    setMatchRankings,
    matchError,
    isCriteriaDirty,
    runMatch,
    resetMatch,
  } = useJobMatching();

  // Direct access handler: Jika ada paramCandidateId di URL /recruiter/candidate/:id, arahkan ke /profile/:id
  useEffect(() => {
    if (paramCandidateId) {
      navigate(`/profile/${paramCandidateId}`, {
        replace: true,
        state: { fromRecruiter: true }
      });
    }
  }, [paramCandidateId, navigate]);

  // Restore State ketika recruiter kembali dari halaman profil kandidat
  useEffect(() => {
    if (location.state?.preserveState && location.state?.filterState) {
      const fs = location.state.filterState;
      if (fs.search !== undefined) setSearch(fs.search);
      if (fs.tier !== undefined) setTier(fs.tier);
      if (fs.sbtOnly !== undefined) setSbtOnly(fs.sbtOnly);
      if (fs.jobTitle !== undefined) setJobTitle(fs.jobTitle);
      if (fs.requiredSkills !== undefined) setRequiredSkills(fs.requiredSkills);
      if (fs.isMatchingActive !== undefined) {
        setIsMatchingActive(fs.isMatchingActive);
        if (fs.isMatchingActive) setShowMatchingPanel(true);
      }
      if (fs.matchRankings !== undefined) setMatchRankings(fs.matchRankings);
    }
  }, [location.state, setSearch, setTier, setSbtOnly, setJobTitle, setRequiredSkills, setIsMatchingActive, setMatchRankings]);

  // Load Real Stats from Backend
  useEffect(() => {
    recruiterApi.getDashboard().then((res) => {
      if (res.success && res.data?.stats) {
        setStats({
          total_candidates: res.data.stats.total_candidates || 0,
          total_verified_credentials: res.data.stats.total_verified_credentials || 0,
        });
      }
    });
  }, []);

  // Compute displayed candidates:
  // If matching has been executed, show ONLY ranked candidates with their actual API match scores
  const displayedCandidates = useMemo(() => {
    if (isMatchingActive && matchRankings && matchRankings.length > 0) {
      return matchRankings.map((ranked) => {
        const found = candidates.find((c) => c.id === ranked.candidate_id);
        return {
          id: ranked.candidate_id,
          name: ranked.name,
          email: ranked.email,
          campus: found?.campus || 'Universitas Indonesia',
          major: found?.major || 'Teknik Informatika',
          tier: ranked.tier || found?.tier || 'Silver',
          points: found?.points || 0,
          skills: ranked.matched_skills ? ranked.matched_skills.map((m) => m.skill) : (found?.skills || []),
          verified_sbt_count: ranked.verified_sbt_count || (found?.verified_sbt_count || 0),
          match_score_pct: ranked.match_score_pct,
          matched_skills: ranked.matched_skills,
          unmet_skills: ranked.unmet_skills,
          competency_verdict: ranked.competency_verdict,
          bio: found?.bio,
        };
      });
    }

    // Default: Return normal search/filter candidates (without fake match scores)
    return candidates;
  }, [isMatchingActive, matchRankings, candidates]);

  // Handler: Arahkan ke halaman profil kandidat tersendiri (/profile/:id) dengan membawa context filter & matching
  const handleViewProfile = (candidate) => {
    if (!candidate?.id) return;
    navigate(`/profile/${candidate.id}`, {
      state: {
        fromRecruiter: true,
        filterState: {
          search,
          tier,
          sbtOnly,
          jobTitle,
          requiredSkills,
          isMatchingActive,
          matchRankings,
        },
        matchData: candidate.match_score_pct !== undefined ? {
          jobTitle: jobTitle || 'Kualifikasi Pekerjaan',
          matchScore: candidate.match_score_pct,
          matchedSkills: candidate.matched_skills || [],
          unmetSkills: candidate.unmet_skills || [],
          competencyVerdict: candidate.competency_verdict,
        } : null,
      }
    });
  };

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    if (mode === 'matching') {
      setShowMatchingPanel(true);
    }
  };

  return (
    <div className="recruiter-view-wrapper">
      {/* ==================== COMPACT HEADER ==================== */}
      <div className="recruiter-compact-header">
        <Container>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              {/* <img
                src={LogoKampusX}
                alt="KampusX Logo"
                style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
                className="d-none d-sm-block flex-shrink-0"
              /> */}
              <div>
                {/* <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5" style={{ fontSize: '11px' }}>
                    PORTAL REKRUTER
                  </span>
                  <span className="text-muted small">•</span>
                  <span className="text-muted small" style={{ fontSize: '12px' }}>
                    {stats.total_candidates} Talenta Terdaftar
                  </span>
                </div> */}
                <h1 className="recruiter-heading-title">Direktori Talenta</h1>
                <p className="recruiter-heading-subtitle">
                  Temukan mahasiswa berprestasi dengan rekam jejak capaian pembelajaran dan kredensial terverifikasi.
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Badge bg="light" className="text-dark border px-3 py-2 rounded-pill fw-semibold shadow-2xs" style={{ fontSize: '12px' }}>
                <Users size={13} className="text-primary me-1" /> {stats.total_candidates} Kandidat
              </Badge>
              <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold" style={{ fontSize: '12px' }}>
                {stats.total_verified_credentials} Kredensial Terbit
              </Badge>
            </div>
          </div>
        </Container>
      </div>

      {/* ==================== 2-COLUMN MAIN LAYOUT ==================== */}
      <Container>
        <div className="recruiter-layout-2col">
          {/* Left Column: Sidebar & Filters */}
          <RecruiterLeftSidebar
            user={user}
            activeMode={activeMode}
            onModeChange={handleModeChange}
            stats={stats}
            search={search}
            onSearchChange={setSearch}
            tier={tier}
            onTierChange={setTier}
            sbtOnly={sbtOnly}
            onSbtOnlyChange={setSbtOnly}
            onResetFilters={resetFilters}
          />

          {/* Main Column: Pure Talent Discovery Grid (No inline profile clutter) */}
          <div className="recruiter-main-col" style={{ minWidth: 0 }}>
            <TalentDirectoryView
              candidates={displayedCandidates}
              loading={candidatesLoading}
              error={candidatesError}
              onRetry={loadCandidates}
              totalResults={totalResults}
              activeSkills={requiredSkills}
              // Matching Props
              isMatchingActive={isMatchingActive}
              showMatchingPanel={showMatchingPanel}
              onToggleMatchingPanel={() => setShowMatchingPanel(!showMatchingPanel)}
              jobTitle={jobTitle}
              onJobTitleChange={setJobTitle}
              requiredSkills={requiredSkills}
              onAddSkill={addSkill}
              onRemoveSkill={removeSkill}
              onSelectPreset={selectPreset}
              onResetSkills={resetSkills}
              onRunMatch={runMatch}
              matching={matching}
              matchError={matchError}
              isCriteriaDirty={isCriteriaDirty}
              onResetMatch={resetMatch}
              // Navigation to dedicated profile
              onViewProfile={handleViewProfile}
            />
          </div>
        </div>

        {/* Zero-Trust Cryptographic Modal */}
        <TalentZeroTrustModal
          show={showZeroTrustModal}
          onHide={() => setShowZeroTrustModal(false)}
          candidate={zeroTrustTarget.candidate}
          certificate={zeroTrustTarget.cert}
        />
      </Container>
    </div>
  );
};

export default RecruiterDashboardPage;
