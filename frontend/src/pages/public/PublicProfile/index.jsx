import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import api from '../../../api/axios';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileTabs from './ProfileTabs';
import SbtCertificatesView from './SbtCertificatesView';
import SkillMatrixView from './SkillMatrixView';
import ActivityFeedView from './ActivityFeedView';
import EventHistoryView from './EventHistoryView';
import ZeroTrustModal from './ZeroTrustModal';
import './PublicProfile.css';

// === DUMMY CANDIDATE PROFILES FALLBACK ===
const MOCK_PROFILES_DATABASE = {
  '1': {
    id: 1,
    name: 'Ahmad Fauzi',
    initials: 'AH',
    username: 'ahmadfauzi.ai',
    headline: 'Data Scientist & AI Enthusiast | UGM Computer Science • Ranked #1 Leaderboard',
    campus: 'Universitas Gadjah Mada',
    major: 'Ilmu Komputer',
    location: 'Yogyakarta, Indonesia',
    tier: 'Diamond',
    points: 5450,
    rank: 1,
    modulesCompleted: 8,
    sbtCount: 5,
    walletAddress: '0x3a4b98F12c09Ad6E9b7E185c899d214C718b89Fc',
    interests: ['Artificial Intelligence', 'Data Science', 'Machine Learning', 'Python', 'NLP'],
    skills: [
      { name: 'Python', level: 94 },
      { name: 'Machine Learning', level: 90 },
      { name: 'Data Analysis', level: 88 },
      { name: 'SQL & Database', level: 85 },
      { name: 'Deep Learning', level: 82 }
    ],
    sbtCertificates: [
      {
        id: 'sbt-1',
        tokenId: '#SBT-2026-0041',
        title: 'Advanced AI & Deep Learning Specialist',
        issuer: 'KampusX Verified Credentials',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x94f1c8a73b22e185c899d214c718b90a61849f2b87e91402ba815349e5d4cb3c',
        date: '28 Sep 2026'
      },
      {
        id: 'sbt-2',
        tokenId: '#SBT-2026-0035',
        title: 'Python for Data Science Masterclass',
        issuer: 'Google Developer Student Clubs & KampusX',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x43a81290bb3914a87c10b65f419c832e0192847aef92153e1a902cbb3918a4d7',
        date: '14 Sep 2026'
      },
      {
        id: 'sbt-3',
        tokenId: '#SBT-2026-0019',
        title: 'Self-Regulated Learning (SRL) Cognition Award',
        issuer: 'KampusX Pedagogy Center',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x17c2f849a902eb3918d6a718c9492e85a67140b91e847192a54b38294719be1a',
        date: '02 Sep 2026'
      }
    ],
    srlModules: [
      { id: 'm1', title: 'Python Data Structures & Algorithm Optimization', score: 98, duration: '25 Menit', date: '25 Sep 2026' },
      { id: 'm2', title: 'Generative AI Prompting & RAG Architecture', score: 95, duration: '20 Menit', date: '18 Sep 2026' },
      { id: 'm3', title: 'Exploratory Data Analysis with Pandas & Seaborn', score: 92, duration: '30 Menit', date: '10 Sep 2026' },
      { id: 'm4', title: 'Forethought & Reflection Strategies for Coders', score: 100, duration: '15 Menit', date: '01 Sep 2026' }
    ],
    activities: [
      {
        id: 'act-1',
        date: '2 hari lalu',
        content: 'Baru saja menyelesaikan riset implementasi RAG untuk pencarian lowongan kerja berbasis matriks keahlian. Senang sekali skor kelulusan kuis kognitif mencapai 98%! Kredensial SBT sudah tercatat di Polygon.',
        isVerified: true,
        likes: 38,
        comments: 5,
        attachment: {
          title: 'Advanced AI & Deep Learning Specialist',
          meta: 'Token ID: #SBT-2026-0041 • Polygon Ledger'
        }
      },
      {
        id: 'act-2',
        date: '1 minggu lalu',
        content: 'Menghadiri webinar nasional "Next-Gen Web3 & Decentralized Credentials in Higher Education". Terima kasih panitia atas wawasan mendalamnya!',
        isVerified: false,
        likes: 21,
        comments: 2
      }
    ],
    events: [
      { id: 101, title: 'National AI & Data Science Summit 2026', status: 'attended', date: '20 Sep 2026' },
      { id: 102, title: 'Web3 & Blockchain Developer Camp', status: 'attended', date: '12 Sep 2026' },
      { id: 103, title: 'UI/UX & Human-Centered Computing Seminar', status: 'published', date: '05 Sep 2026' }
    ]
  },
  'current-user': {
    id: 'current-user',
    name: 'Kamu (Budi Pratama)',
    initials: 'KM',
    username: 'budi.pratama',
    headline: 'Mahasiswa Teknik Informatika | Universitas Indonesia • Silver Tier Member',
    campus: 'Universitas Indonesia',
    major: 'Teknik Informatika',
    location: 'Depok, Jawa Barat',
    tier: 'Silver',
    points: 2450,
    rank: 12,
    modulesCompleted: 5,
    sbtCount: 2,
    walletAddress: '0x81ee99A044d188EC3a4b98F12c09Ad6E9b7E185c',
    interests: ['Software Engineering', 'React', 'Blockchain', 'Cloud Computing'],
    skills: [
      { name: 'JavaScript & React', level: 88 },
      { name: 'Python Basics', level: 82 },
      { name: 'SQL & Database', level: 80 },
      { name: 'Web3 & Solidity', level: 75 }
    ],
    sbtCertificates: [
      {
        id: 'sbt-cu-1',
        tokenId: '#SBT-2026-0291',
        title: 'Modern Frontend Architecture with React',
        issuer: 'KampusX Verified Credentials',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x629a81234b981e74a682910ba7491029c8714019a82740192847bca8271039de',
        date: '20 Sep 2026'
      },
      {
        id: 'sbt-cu-2',
        tokenId: '#SBT-2026-0240',
        title: 'Smart Contract & Token Fundamentals',
        issuer: 'Polygon Developer League & KampusX',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x38471928a471029c8714019a82740192847bca8271039de629a81234b981e74a',
        date: '08 Sep 2026'
      }
    ],
    srlModules: [
      { id: 'm-cu-1', title: 'State Management & Custom Hooks in React 19', score: 94, duration: '20 Menit', date: '19 Sep 2026' },
      { id: 'm-cu-2', title: 'RESTful API & Asynchronous Programming', score: 90, duration: '25 Menit', date: '11 Sep 2026' },
      { id: 'm-cu-3', title: 'Forethought Goal Setting for Student Engineers', score: 96, duration: '15 Menit', date: '04 Sep 2026' }
    ],
    activities: [
      {
        id: 'act-cu-1',
        date: '3 hari lalu',
        content: 'Berhasil mengumpulkan 2,450 poin global di KampusX dan menempati rank #12 klasemen Bulanan! Target berikutnya adalah menembus Top 10 dan naik ke Gold Tier 🚀',
        isVerified: true,
        likes: 27,
        comments: 4,
        attachment: {
          title: 'Modern Frontend Architecture with React',
          meta: 'Token ID: #SBT-2026-0291 • Polygon Ledger'
        }
      }
    ],
    events: [
      { id: 201, title: 'Hackathon Nasional KampusX 2026', status: 'attended', date: '18 Sep 2026' },
      { id: 202, title: 'Workshop Fullstack Web Development', status: 'attended', date: '05 Sep 2026' }
    ]
  }
};

const UserProfile = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sbt');

  // Modal verification state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedSbt, setSelectedSbt] = useState(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        // Cek apakah ada data mock bawaan untuk ID ini
        const mockFallback = MOCK_PROFILES_DATABASE[id] || MOCK_PROFILES_DATABASE['1'];

        // Coba fetch dari backend
        const res = await api.get(`/profile/${id}`).catch(() => null);

        if (res && res.data && res.data.success && res.data.data) {
          const apiData = res.data.data;
          const merged = {
            ...mockFallback,
            ...apiData.profile,
            id: apiData.profile?.id || id,
            name: apiData.profile?.name || mockFallback.name,
            institution: apiData.profile?.institution || mockFallback.campus,
            interests: apiData.interests || mockFallback.interests,
            is_own_profile: apiData.is_own_profile || false,
            // Jika ada sertifikat dari API, gabungkan dengan data mock SBT
            sbtCertificates: mockFallback.sbtCertificates,
            skills: mockFallback.skills,
            srlModules: mockFallback.srlModules,
            activities: mockFallback.activities,
            events: apiData.history?.past || mockFallback.events
          };
          setProfileData(merged);
        } else {
          // Gunakan fallback mock profile
          setProfileData(mockFallback);
        }
      } catch (err) {
        console.warn('Menggunakan fallback mock profile data:', err);
        setProfileData(MOCK_PROFILES_DATABASE[id] || MOCK_PROFILES_DATABASE['1']);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleOpenVerifyModal = (sbt) => {
    if (sbt) {
      setSelectedSbt(sbt);
    } else if (profileData && profileData.sbtCertificates && profileData.sbtCertificates.length > 0) {
      setSelectedSbt(profileData.sbtCertificates[0]);
    }
    setShowVerifyModal(true);
  };

  if (isLoading) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: '100vh', background: 'var(--color-bg)' }}
      >
        <Spinner animation="border" style={{ color: 'var(--color-primary)' }} />
        <p className="mt-3 text-muted fw-semibold" style={{ fontSize: '14px' }}>
          Memuat profil mahasiswa…
        </p>
      </div>
    );
  }

  const {
    name,
    initials,
    headline,
    campus,
    major,
    location,
    tier,
    points,
    rank,
    modulesCompleted,
    sbtCount,
    walletAddress,
    interests,
    skills,
    sbtCertificates,
    srlModules,
    activities,
    events,
    is_own_profile
  } = profileData || {};

  return (
    <div className="public-profile-wrapper">
      <Container className="pt-4 pt-md-5">
        {/* ==================== 1. PROFILE HEADER ==================== */}
        <ProfileHeader
          profile={profileData}
          isOwnProfile={is_own_profile || id === 'current-user'}
          onOpenVerifyModal={() => handleOpenVerifyModal()}
        />

        {/* ==================== 2. PROFILE STATS ==================== */}
        <ProfileStats stats={profileData} />

        {/* ==================== 3. TABS NAVIGATION ==================== */}
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ==================== 4. TAB VIEWS ==================== */}
        {activeTab === 'sbt' && (
          <SbtCertificatesView
            sbtCertificates={sbtCertificates}
            onVerifySbt={handleOpenVerifyModal}
          />
        )}

        {activeTab === 'skills' && (
          <SkillMatrixView
            skills={skills}
            srlModules={srlModules}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityFeedView
            activities={activities}
            authorName={name}
            authorInitials={initials}
          />
        )}

        {activeTab === 'events' && (
          <EventHistoryView events={events} />
        )}

        {/* ==================== 5. ZERO-TRUST BLOCKCHAIN MODAL ==================== */}
        <ZeroTrustModal
          show={showVerifyModal}
          onHide={() => setShowVerifyModal(false)}
          sbtData={selectedSbt}
          studentName={name}
        />
      </Container>
    </div>
  );
};

export default UserProfile;