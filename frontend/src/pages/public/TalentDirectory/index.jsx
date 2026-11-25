import React, { useState, useMemo } from 'react';
import { Container, Badge, Modal, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Users,
  Lock
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './TalentDirectory.css';

// Modular Data & Utilities
import { MOCK_TALENTS, MOCK_SOCIAL_POSTS } from './data/talentsData';
import { calculateCosineSimilarity, checkCandidateHasSkillSbt } from './utils/cosineSimilarity';

// Modular Subcomponents
import SkillFilterBar from './components/SkillFilterBar';
import JobMatchingPanel from './components/JobMatchingPanel';
import TalentCard from './components/TalentCard';
import TalentLeftSidebar from './components/TalentLeftSidebar';
import TalentRightSidebar from './components/TalentRightSidebar';
import TalentSocialFeed from './components/TalentSocialFeed';
import TalentZeroTrustModal from './components/TalentZeroTrustModal';
import RecruiterContactModal from './components/RecruiterContactModal';
import GuestLockedSection from './components/GuestLockedSection';

const TalentDirectory = () => {
  const { user } = useAuth();

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState('talents');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedSkills, setSelectedSkills] = useState(['Python']);

  // Modal States
  const [selectedSbtTalent, setSelectedSbtTalent] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [contactTalent, setContactTalent] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState('');

  // Social feed interaction state
  const [likedPosts, setLikedPosts] = useState({});

  // Skill filter handlers
  const handleToggleSkill = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  const handleResetSkills = () => {
    setSelectedSkills([]);
  };

  const handleSelectPreset = (skills) => {
    setSelectedSkills(skills);
  };

  // Modal Triggers
  const handleOpenVerifyModal = (talent) => {
    setSelectedSbtTalent(talent);
    setShowVerifyModal(true);
  };

  const handleOpenContactModal = (talent) => {
    setContactTalent(talent);
    setShowContactModal(true);
  };

  const promptLoginRequired = (message) => {
    setLoginModalMessage(
      message ||
        'Untuk menjaga privasi data akademik mahasiswa serta integritas verifikasi blockchain kredensial Soulbound Token, silakan masuk ke akun KampusX Anda terlebih dahulu.'
    );
    setShowLoginModal(true);
  };

  const handleToggleLike = (postId) => {
    if (!user) {
      promptLoginRequired('Masuk ke akun KampusX Anda untuk memberikan apresiasi dan berinteraksi di Social Feed.');
      return;
    }
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Process & rank talents based on Cosine Similarity
  const processedTalents = useMemo(() => {
    return MOCK_TALENTS.map((talent) => {
      const matchResult = calculateCosineSimilarity(
        talent.skills,
        selectedSkills,
        talent.sbtList
      );
      return {
        ...talent,
        matchScore: matchResult.score,
        hasSbtBonus: matchResult.hasSbtBonus
      };
    })
      .filter((talent) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          talent.name.toLowerCase().includes(query) ||
          talent.campus.toLowerCase().includes(query) ||
          talent.headline.toLowerCase().includes(query) ||
          talent.skills.some((s) => s.name.toLowerCase().includes(query));

        let matchesRole = true;
        if (selectedRole === 'DATA') {
          matchesRole = talent.skills.some((s) =>
            ['Python', 'Machine Learning', 'Deep Learning', 'Data Analysis'].includes(s.name)
          );
        } else if (selectedRole === 'ENGINEERING') {
          matchesRole = talent.skills.some((s) =>
            ['React', 'Node.js', 'Go', 'Docker', 'TypeScript'].includes(s.name)
          );
        } else if (selectedRole === 'DESIGN') {
          matchesRole = talent.skills.some((s) =>
            ['Figma', 'UI/UX Design', 'Design System', 'UX Research'].includes(s.name)
          );
        }

        return matchesQuery && matchesRole;
      })
      .sort((a, b) => {
        // Jika ada filter kriteria, urutkan berdasarkan Match Score tertinggi (Cosine Similarity)
        if (selectedSkills.length > 0) {
          return (b.matchScore || 0) - (a.matchScore || 0);
        }
        return b.sbtCount - a.sbtCount;
      });
  }, [searchQuery, selectedRole, selectedSkills]);

  // Hitung jumlah talent yang memiliki SBT terverifikasi untuk filter aktif
  const sbtVerifiedCount = useMemo(() => {
    if (selectedSkills.length === 0) return processedTalents.length;
    return processedTalents.filter((t) =>
      selectedSkills.some((s) => checkCandidateHasSkillSbt(t, s))
    ).length;
  }, [processedTalents, selectedSkills]);

  return (
    <div className="talent-page-wrapper">
      <Container className="pt-4 pt-md-5">
        {/* ==================== HERO BANNER ==================== */}
        <div className="talent-header-banner">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Badge bg="light" text="dark" className="px-3 py-1-5 fw-bold" style={{ fontSize: '11px' }}>
              <ShieldCheck size={13} className="text-primary me-1" /> KAMPUSX TALENT & RECRUITER HUB
            </Badge>
          </div>
          <h1 className="talent-banner-title">Direktori Talent & Portofolio Mahasiswa</h1>
          <p className="talent-banner-subtitle">
            Jelajahi rekam jejak capaian belajar, keahlian riil hasil evaluasi SRL, dan sertifikat
            kredensial Soulbound Token (SBT) berbasis Blockchain Polygon.
          </p>
        </div>

        {/* ==================== 3-COLUMN LINKEDIN STYLE LAYOUT ==================== */}
        <Row className="g-4">
          {/* Left Column: Sidebar (Lebar 3/12 di Desktop, 4/12 di Tablet) */}
          <Col lg={3} md={4}>
            <TalentLeftSidebar
              user={user}
              selectedRole={selectedRole}
              onSelectRole={setSelectedRole}
            />
          </Col>

          {/* Center/Right Column: Main Content (Lebar 9/12 di Desktop, 8/12 di Tablet) */}
          <Col lg={9} md={8}>
            <div className="linkedin-center-col" style={{ maxWidth: '100%' }}>
              {/* Tab Navigation */}
              <div className="feed-tab-bar">
                <button
                  type="button"
                  className={`feed-tab-btn ${activeTab === 'talents' ? 'active' : ''}`}
                  onClick={() => setActiveTab('talents')}
                >
                  <Users size={16} /> Direktori Talent ({processedTalents.length})
                </button>
                <button
                  type="button"
                  className={`feed-tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('feed')}
                >
                  <Sparkles size={16} /> Feed Prestasi & Pembelajaran
                </button>
              </div>

              {/* TAB 1: TALENTS DIRECTORY */}
              {activeTab === 'talents' && (
                <>
                  {!user && (
                    <div className="guest-preview-notice mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <ShieldCheck size={18} className="text-primary flex-shrink-0" />
                        <span className="small text-dark">
                          <strong>Mode Pratinjau Publik:</strong> Menampilkan 2 profil kandidat sampel.{' '}
                          <Link to="/login" className="text-primary fw-bold text-decoration-none">
                            Masuk ke KampusX
                          </Link>{' '}
                          untuk melihat seluruh 1.200+ talenta, kontak langsung, dan verifikasi on-chain.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Search Bar */}
                  <div className="position-relative mb-3">
                    <Search
                      size={16}
                      className="position-absolute text-muted"
                      style={{ top: '12px', left: '16px' }}
                    />
                    <input
                      type="text"
                      className="form-control ps-5 py-2 border rounded-pill bg-white shadow-sm"
                      placeholder="Cari talenta berdasarkan nama, kampus, jurusan, atau skill..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ fontSize: '13.5px' }}
                    />
                  </div>

                  {/* Skill Filter Bar */}
                  <SkillFilterBar
                    selectedSkills={selectedSkills}
                    onToggleSkill={handleToggleSkill}
                    onResetSkills={handleResetSkills}
                    onSelectPreset={handleSelectPreset}
                    totalResults={processedTalents.length}
                    sbtVerifiedCount={sbtVerifiedCount}
                  />

                  {/* Vector Skill-Matrix */}
                  <JobMatchingPanel
                    activeSkills={selectedSkills}
                    topCandidate={processedTalents[0]}
                  />

                  {/* Talent Cards List */}
                  {processedTalents.length > 0 ? (
                    <>
                      {(user ? processedTalents : processedTalents.slice(0, 2)).map((talent) => (
                        <TalentCard
                          key={talent.id}
                          talent={talent}
                          activeSkills={selectedSkills}
                          onOpenVerifyModal={handleOpenVerifyModal}
                          onOpenContactModal={handleOpenContactModal}
                        />
                      ))}

                      {!user && (
                        <GuestLockedSection previewCandidate={processedTalents[2]} />
                      )}
                    </>
                  ) : (
                    <div className="clean-card p-5 text-center text-muted">
                      <Users size={32} className="mb-2 text-secondary" />
                      <h6 className="fw-bold text-dark">Tidak ada kandidat ditemukan</h6>
                      <p className="small mb-0">Coba ubah kata kunci pencarian atau reset filter kriteria.</p>
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: SOCIAL ACTIVITY FEED */}
              {activeTab === 'feed' && (
                <TalentSocialFeed
                  posts={MOCK_SOCIAL_POSTS}
                  user={user}
                  likedPosts={likedPosts}
                  onToggleLike={handleToggleLike}
                  onOpenVerifyModal={handleOpenVerifyModal}
                  onPromptLogin={promptLoginRequired}
                />
              )}
            </div>
          </Col>
        </Row>
      {/* </Container> */}
      </Container>

      {/* Modals */}
      <TalentZeroTrustModal
        show={showVerifyModal}
        onHide={() => setShowVerifyModal(false)}
        talent={selectedSbtTalent}
      />

      <RecruiterContactModal
        show={showContactModal}
        onHide={() => setShowContactModal(false)}
        talent={contactTalent}
        activeSkills={selectedSkills}
      />

      {/* Login Required Modal */}
      <Modal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        centered
        contentClassName="border-0 shadow-lg"
        style={{ borderRadius: '24px' }}
      >
        <Modal.Body className="p-4 text-center">
          <div className="modal-lock-badge mb-3">
            <Lock size={30} className="text-primary" />
          </div>
          <h5 className="fw-bold text-dark mb-2">Akses Khusus Pengguna Terdaftar</h5>
          <p className="text-muted small mb-4">
            {loginModalMessage ||
              'Untuk menjaga privasi data akademik mahasiswa serta integritas verifikasi blockchain kredensial Soulbound Token, silakan masuk ke akun KampusX Anda terlebih dahulu.'}
          </p>
          <div className="d-flex flex-column gap-2 mb-3">
            <Link to="/login" className="btn btn-primary rounded-pill py-2 fw-bold">
              Masuk ke Akun Anda
            </Link>
            <Link to="/register" className="btn btn-outline-secondary rounded-pill py-2 fw-bold">
              Daftar Akun Baru (Gratis)
            </Link>
          </div>
          <button
            type="button"
            className="btn btn-link text-muted small text-decoration-none"
            onClick={() => setShowLoginModal(false)}
          >
            Tutup
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TalentDirectory;
