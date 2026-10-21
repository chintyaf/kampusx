import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner, Modal, Button, Badge } from 'react-bootstrap';
import {
  Lock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  FileText,
  Brain,
  LogIn,
  UserPlus
} from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileTabs from './ProfileTabs';
import SbtCertificatesView from './SbtCertificatesView';
import SkillMatrixView from './SkillMatrixView';
import ActivityFeedView from './ActivityFeedView';
import EventHistoryView from './EventHistoryView';
import ZeroTrustModal from './ZeroTrustModal';
import CertificateFileModal from './CertificateFileModal';
import './PublicProfile.css';

// === DUMMY CANDIDATE PROFILES DATABASE (Mencakup Top Leaderboard & Talenta) ===
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
        ticketCode: 'CERT-2026-0041',
        title: 'Advanced AI & Deep Learning Specialist',
        issuer: 'KampusX Verified Credentials',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x94f1c8a73b22e185c899d214c718b90a61849f2b87e91402ba815349e5d4cb3c',
        date: '28 Sep 2026'
      },
      {
        id: 'sbt-2',
        tokenId: '#SBT-2026-0035',
        ticketCode: 'CERT-2026-0035',
        title: 'Python for Data Science Masterclass',
        issuer: 'Google Developer Student Clubs & KampusX',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x43a81290bb3914a87c10b65f419c832e0192847aef92153e1a902cbb3918a4d7',
        date: '14 Sep 2026'
      },
      {
        id: 'sbt-3',
        tokenId: '#SBT-2026-0019',
        ticketCode: 'CERT-2026-0019',
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
  '2': {
    id: 2,
    name: 'Rian Hidayat',
    initials: 'RI',
    username: 'rian.hidayat',
    headline: 'Fullstack Software Engineer & Cloud Architect | ITB Informatics • Ranked #2 Leaderboard',
    campus: 'Institut Teknologi Bandung',
    major: 'Teknik Informatika',
    location: 'Bandung, Jawa Barat',
    tier: 'Platinum',
    points: 4820,
    rank: 2,
    modulesCompleted: 7,
    sbtCount: 4,
    walletAddress: '0x7b1298E12c09Ad6E9b7E185c899d214C718b44d9',
    interests: ['Fullstack Development', 'React', 'Node.js', 'Cloud Architecture', 'DevOps'],
    skills: [
      { name: 'React & Next.js', level: 92 },
      { name: 'Node.js & Express', level: 88 },
      { name: 'TypeScript', level: 85 },
      { name: 'Docker & Kubernetes', level: 80 }
    ],
    sbtCertificates: [
      {
        id: 'sbt-2-1',
        tokenId: '#SBT-2026-0082',
        ticketCode: 'CERT-2026-0082',
        title: 'Fullstack Microservices & Cloud Engineering',
        issuer: 'KampusX Verified Credentials',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x53e1a902cbb3918a4d701e4a68291b29a674510b65f419c832e0192847aef921',
        date: '22 Sep 2026'
      },
      {
        id: 'sbt-2-2',
        tokenId: '#SBT-2026-0061',
        ticketCode: 'CERT-2026-0061',
        title: 'Advanced Asynchronous Javascript Patterns',
        issuer: 'Tech Leaders League & KampusX',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x8192847aef92153e1a902cbb3918a4d701e4a68291b29a674510b65f419c832e',
        date: '10 Sep 2026'
      }
    ],
    srlModules: [
      { id: 'm2-1', title: 'Microservices Communication with gRPC & RabbitMQ', score: 96, duration: '30 Menit', date: '21 Sep 2026' },
      { id: 'm2-2', title: 'React 19 Server Components Deep Dive', score: 94, duration: '20 Menit', date: '14 Sep 2026' }
    ],
    activities: [
      {
        id: 'act-2-1',
        date: '4 hari lalu',
        content: 'Merilis starter boilerplate open source untuk implementasi Web3 Login dengan Wagmi dan Laravel Sanctum! Siapa saja boleh berkontribusi di repositori saya.',
        isVerified: true,
        likes: 31,
        comments: 6
      }
    ],
    events: [
      { id: 104, title: 'ITB Cloud Computing Forum 2026', status: 'attended', date: '18 Sep 2026' },
      { id: 105, title: 'DevOps & GitOps Summit', status: 'attended', date: '04 Sep 2026' }
    ]
  },
  '3': {
    id: 3,
    name: 'Dian Sastro',
    initials: 'DI',
    username: 'diansastro.ui',
    headline: 'Product Designer (UI/UX) & Design System Enthusiast | UI Information Systems • Ranked #4 Leaderboard',
    campus: 'Universitas Indonesia',
    major: 'Sistem Informasi',
    location: 'Jakarta Selatan, Indonesia',
    tier: 'Gold',
    points: 3920,
    rank: 4,
    modulesCompleted: 6,
    sbtCount: 3,
    walletAddress: '0x4f8281EC3a4b98F12c09Ad6E9b7E185c899d2112',
    interests: ['Product Design', 'UI/UX', 'Figma', 'Design Systems', 'User Research'],
    skills: [
      { name: 'Figma & Prototyping', level: 95 },
      { name: 'Design Systems', level: 90 },
      { name: 'User Research', level: 86 },
      { name: 'HTML/CSS Basics', level: 78 }
    ],
    sbtCertificates: [
      {
        id: 'sbt-3-1',
        tokenId: '#SBT-2026-0112',
        ticketCode: 'CERT-2026-0112',
        title: 'Mastering Design Systems & Accessibility WCAG 2.2',
        issuer: 'KampusX Verified Credentials',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x7a8192847aef92153e1a902cbb3918a4d701e4a68291b29a674510b65f419c83',
        date: '19 Sep 2026'
      }
    ],
    srlModules: [
      { id: 'm3-1', title: 'Usability Testing & Cognitive Walkthrough Methods', score: 97, duration: '25 Menit', date: '17 Sep 2026' }
    ],
    activities: [
      {
        id: 'act-3-1',
        date: '5 hari lalu',
        content: 'Eksperimen baru merancang visual hierarchy microlearning dengan pendekatan kognitif Self-Regulated Learning di Figma.',
        isVerified: true,
        likes: 24,
        comments: 3
      }
    ],
    events: [
      { id: 106, title: 'UI UX Design Fest Indonesia 2026', status: 'attended', date: '11 Sep 2026' }
    ]
  },
  '4': {
    id: 4,
    name: 'Siti Rahma',
    initials: 'SI',
    username: 'siti.rahma',
    headline: 'Cybersecurity Analyst & Blockchain Auditor | UB Computer Science • Ranked #3 Leaderboard',
    campus: 'Universitas Brawijaya',
    major: 'Ilmu Komputer',
    location: 'Malang, Jawa Timur',
    tier: 'Gold',
    points: 4100,
    rank: 3,
    modulesCompleted: 7,
    sbtCount: 3,
    walletAddress: '0x5c9118EC3a4b98F12c09Ad6E9b7E185c899d9182',
    interests: ['Cybersecurity', 'Smart Contract Audit', 'Solidity', 'Penetration Testing'],
    skills: [
      { name: 'Solidity & Smart Contracts', level: 90 },
      { name: 'Penetration Testing', level: 87 },
      { name: 'Network Security', level: 84 },
      { name: 'Python for Security', level: 82 }
    ],
    sbtCertificates: [
      {
        id: 'sbt-4-1',
        tokenId: '#SBT-2026-0095',
        ticketCode: 'CERT-2026-0095',
        title: 'Smart Contract Security & EVM Vulnerabilities',
        issuer: 'KampusX Verified Credentials',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x3918a4d701e4a68291b29a674510b65f419c832e0192847aef92153e1a902cbb',
        date: '15 Sep 2026'
      }
    ],
    srlModules: [
      { id: 'm4-1', title: 'Reentrancy & Frontrunning Mitigation in Web3', score: 98, duration: '20 Menit', date: '12 Sep 2026' }
    ],
    activities: [
      {
        id: 'act-4-1',
        date: '1 minggu lalu',
        content: 'Berhasil menemukan 2 edge case vulnerability pada mock smart contract saat workshop audit on-chain!',
        isVerified: true,
        likes: 29,
        comments: 4
      }
    ],
    events: [
      { id: 107, title: 'National Cyber Security Championship 2026', status: 'attended', date: '08 Sep 2026' }
    ]
  },
  '5': {
    id: 5,
    name: 'Budi Santoso',
    initials: 'BU',
    username: 'budi.santoso',
    headline: 'Backend Engineer & Distributed Systems | ITS Informatics • Ranked #5 Leaderboard',
    campus: 'Institut Teknologi Sepuluh Nopember',
    major: 'Teknik Informatika',
    location: 'Surabaya, Jawa Timur',
    tier: 'Gold',
    points: 3680,
    rank: 5,
    modulesCompleted: 6,
    sbtCount: 3,
    walletAddress: '0x6e7218EC3a4b98F12c09Ad6E9b7E185c899d3419',
    interests: ['Go / Golang', 'Distributed Systems', 'PostgreSQL', 'Docker'],
    skills: [
      { name: 'Go (Golang)', level: 91 },
      { name: 'PostgreSQL & SQL Tuning', level: 88 },
      { name: 'Redis Caching', level: 85 },
      { name: 'Docker', level: 82 }
    ],
    sbtCertificates: [
      {
        id: 'sbt-5-1',
        tokenId: '#SBT-2026-0130',
        ticketCode: 'CERT-2026-0130',
        title: 'High-Concurrency Backend Systems with Go',
        issuer: 'KampusX Verified Credentials',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x291b29a674510b65f419c832e0192847aef92153e1a902cbb3918a4d701e4a68',
        date: '12 Sep 2026'
      }
    ],
    srlModules: [
      { id: 'm5-1', title: 'Database Indexing Strategies for Large Scale Apps', score: 95, duration: '25 Menit', date: '10 Sep 2026' }
    ],
    activities: [
      {
        id: 'act-5-1',
        date: '6 hari lalu',
        content: 'Optimasi query Postgres dari 1.2 detik menjadi 14ms menggunakan partial indexes dan connection pooling.',
        isVerified: true,
        likes: 22,
        comments: 2
      }
    ],
    events: [
      { id: 108, title: 'Surabaya Tech Meetup #44', status: 'attended', date: '06 Sep 2026' }
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
        ticketCode: 'CERT-2026-0291',
        title: 'Modern Frontend Architecture with React',
        issuer: 'KampusX Verified Credentials',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x629a81234b981e74a682910ba7491029c8714019a82740192847bca8271039de',
        date: '20 Sep 2026'
      },
      {
        id: 'sbt-cu-2',
        tokenId: '#SBT-2026-0240',
        ticketCode: 'CERT-2026-0240',
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

// Helper untuk menghasilkan profil kandidat dinamis jika ID tidak ada di tabel tetap
const getDynamicMockProfile = (id) => {
  if (MOCK_PROFILES_DATABASE[String(id)]) {
    return MOCK_PROFILES_DATABASE[String(id)];
  }

  // Nama-nama kandidat sesuai Leaderboard table
  const CANDIDATE_NAMES_BY_ID = {
    '6': { name: 'Citra Kirana', campus: 'Universitas Padjadjaran', major: 'Teknik Informatika', rank: 6, points: 3410 },
    '7': { name: 'Eko Prasetyo', campus: 'Universitas Diponegoro', major: 'Teknik Komputer', rank: 7, points: 3150 },
    '8': { name: 'Fahri Alamsyah', campus: 'Universitas Airlangga', major: 'Sains Data', rank: 8, points: 2990 },
    '9': { name: 'Gita Gutawa', campus: 'Universitas Sebelas Maret', major: 'Informatika', rank: 9, points: 2750 },
    '10': { name: 'Hendra Wijaya', campus: 'Binus University', major: 'Computer Science', rank: 10, points: 2560 },
    '11': { name: 'Kevin Anggara', campus: 'Universitas Telkom', major: 'Rekayasa Perangkat Lunak', rank: 11, points: 2500 },
    '12': { name: 'Budi Pratama', campus: 'Universitas Indonesia', major: 'Teknik Informatika', rank: 12, points: 2450 },
    '13': { name: 'Nadin Amizah', campus: 'Universitas Pelita Harapan', major: 'Sistem Informasi', rank: 13, points: 2380 },
    '14': { name: 'Raditya Dika', campus: 'Universitas Prasetya Mulya', major: 'Bisnis Digital', rank: 14, points: 2210 },
    '15': { name: 'Tara Basro', campus: 'Universitas Bina Nusantara', major: 'Desain Komunikasi Visual', rank: 15, points: 2090 }
  };

  const info = CANDIDATE_NAMES_BY_ID[String(id)] || {
    name: `Kandidat Mahasiswa #${id}`,
    campus: 'Universitas Indonesia',
    major: 'Teknik Informatika',
    rank: 15,
    points: 2100
  };

  const nameParts = info.name.split(' ');
  const initials = nameParts.length > 1
    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    : info.name.substring(0, 2).toUpperCase();

  return {
    id: id,
    name: info.name,
    initials: initials,
    username: info.name.toLowerCase().replace(/\s+/g, '.'),
    headline: `Mahasiswa ${info.major} | ${info.campus} • Ranked #${info.rank} Leaderboard`,
    campus: info.campus,
    major: info.major,
    location: 'Indonesia',
    tier: info.points >= 4000 ? 'Platinum' : info.points >= 2500 ? 'Gold' : 'Silver',
    points: info.points,
    rank: info.rank,
    modulesCompleted: 5,
    sbtCount: 3,
    walletAddress: `0x${String(id).padStart(4, '0')}4b98F12c09Ad6E9b7E185c899d214C718b89Fc`,
    interests: ['Software Engineering', 'Artificial Intelligence', 'Web Development'],
    skills: [
      { name: 'Problem Solving & Logic', level: 88 },
      { name: 'Web Programming', level: 85 },
      { name: 'Database & SQL', level: 82 },
      { name: 'Collaboration & Git', level: 80 }
    ],
    sbtCertificates: [
      {
        id: `sbt-${id}-1`,
        tokenId: `#SBT-2026-0${id}9`,
        ticketCode: `CERT-2026-0${id}9`,
        title: 'Certified Competence & Practical Technology Mastery',
        issuer: 'KampusX Verified Credentials',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x94f1c8a73b22e185c899d214c718b90a61849f2b87e91402ba815349e5d4cb3c',
        date: '18 Sep 2026'
      },
      {
        id: `sbt-${id}-2`,
        tokenId: `#SBT-2026-0${id}2`,
        ticketCode: `CERT-2026-0${id}2`,
        title: 'Self-Regulated Learning (SRL) Core Achievement',
        issuer: 'KampusX Pedagogy Center',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x17c2f849a902eb3918d6a718c9492e85a67140b91e847192a54b38294719be1a',
        date: '04 Sep 2026'
      }
    ],
    srlModules: [
      { id: `m-${id}-1`, title: 'Goal Setting & SRL Forethought Strategy', score: 95, duration: '20 Menit', date: '16 Sep 2026' },
      { id: `m-${id}-2`, title: 'Applied Web Development & Clean Code', score: 91, duration: '25 Menit', date: '09 Sep 2026' }
    ],
    activities: [
      {
        id: `act-${id}-1`,
        date: '4 hari lalu',
        content: `Senang bisa belajar dan menyelesaikan tantangan mingguan di KampusX. Terus berproses menuju target berikutnya!`,
        isVerified: true,
        likes: 18,
        comments: 2
      }
    ],
    events: [
      { id: 401, title: 'KampusX Tech Discovery 2026', status: 'attended', date: '14 Sep 2026' }
    ]
  };
};

const UserProfile = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sbt');

  // LinkedIn-style Guest Restriction state
  const isGuest = !isAuthenticated;
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalContext, setLoginModalContext] = useState({
    title: 'Akses Eksklusif Member KampusX',
    description: 'Masuk atau buat akun KampusX gratis untuk membuka akses penuh portofolio, evaluasi kognitif SRL, dan verifikasi sertifikat lengkap.'
  });

  // Modal verification state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedSbt, setSelectedSbt] = useState(null);

  // Modal file certificate state
  const [showCertificateFileModal, setShowCertificateFileModal] = useState(false);
  const [selectedCertForFile, setSelectedCertForFile] = useState(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        // Cek data mock bawaan
        const mockFallback = getDynamicMockProfile(id);

        // Coba fetch dari backend jika tersedia
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
            sbtCertificates: mockFallback.sbtCertificates,
            skills: mockFallback.skills,
            srlModules: mockFallback.srlModules,
            activities: mockFallback.activities,
            events: apiData.history?.past || mockFallback.events
          };
          setProfileData(merged);
        } else {
          setProfileData(mockFallback);
        }
      } catch (err) {
        console.warn('Menggunakan fallback mock profile data:', err);
        setProfileData(getDynamicMockProfile(id));
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

  const handleOpenFileModal = (cert) => {
    if (isGuest && cert && cert.id !== 'sbt-1' && cert.id !== 'sbt-2-1' && cert.id !== 'sbt-3-1' && cert.id !== 'sbt-4-1' && cert.id !== 'sbt-5-1' && cert.id !== 'sbt-cu-1') {
      promptLoginRequired(
        'Buka Dokumen Sertifikat Lengkap',
        'Masuk ke akun KampusX untuk membuka dan mengunduh seluruh file dokumen e-sertifikat mahasiswa ini.'
      );
      return;
    }
    if (cert) {
      setSelectedCertForFile(cert);
    } else if (profileData && profileData.sbtCertificates && profileData.sbtCertificates.length > 0) {
      setSelectedCertForFile(profileData.sbtCertificates[0]);
    }
    setShowCertificateFileModal(true);
  };

  const promptLoginRequired = (title, description) => {
    setLoginModalContext({
      title: title || 'Akses Eksklusif Member KampusX',
      description: description || 'Fitur ini memerlukan autentikasi akun. Masuk atau daftar secara gratis untuk melanjutkan.'
    });
    setShowLoginModal(true);
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
    <div className={`public-profile-wrapper ${isGuest ? 'guest-view-active' : ''}`}>
      <Container className="pt-4 pt-md-5">

        {/* ==================== 0. LINKEDIN-STYLE GUEST CALLOUT BANNER ==================== */}
        {isGuest && (
          <div className="profile-guest-callout mb-4">
            <div className="d-flex align-items-center gap-3">
              <div className="guest-callout-icon">
                <Lock size={20} />
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h6 className="guest-callout-title mb-0">Mode Publik Terbatas (Guest Preview)</h6>
                  <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle" style={{ fontSize: '10px' }}>
                    LinkedIn-Style Gating
                  </span>
                </div>
                <p className="guest-callout-desc mb-0">
                  Anda sedang melihat versi publik mahasiswa ini. Masuk atau buat akun KampusX gratis untuk melihat rekaman evaluasi kognitif SRL lengkap, mengunduh On-Chain CV ber-QR code, dan mengirim penawaran kolaborasi/rekrutmen.
                </p>
              </div>
              <div className="guest-callout-actions d-none d-md-flex align-items-center gap-2 flex-shrink-0">
                <Link to="/login" className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold">
                  <LogIn size={13} className="me-1" /> Masuk
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm rounded-pill px-3 fw-bold">
                  <UserPlus size={13} className="me-1" /> Buat Akun
                </Link>
              </div>
            </div>
            {/* Mobile Actions */}
            <div className="d-flex d-md-none gap-2 mt-3 pt-2 border-top">
              <Link to="/login" className="btn btn-outline-primary btn-sm rounded-pill flex-fill fw-bold text-center">
                Masuk
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm rounded-pill flex-fill fw-bold text-center">
                Daftar Gratis
              </Link>
            </div>
          </div>
        )}

        {/* ==================== 1. PROFILE HEADER ==================== */}
        <ProfileHeader
          profile={profileData}
          isOwnProfile={is_own_profile || (user && String(user.id) === String(id)) || id === 'current-user'}
          isGuest={isGuest}
          promptLoginRequired={promptLoginRequired}
          onOpenVerifyModal={() => handleOpenVerifyModal()}
        />

        {/* ==================== 2. PROFILE STATS ==================== */}
        <ProfileStats stats={profileData} />

        {/* ==================== 3. TABS NAVIGATION ==================== */}
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ==================== 4. TAB VIEWS (WITH LINKEDIN-STYLE GATING) ==================== */}
        {activeTab === 'sbt' && (
          <SbtCertificatesView
            sbtCertificates={sbtCertificates}
            onVerifySbt={handleOpenVerifyModal}
            onOpenFileModal={handleOpenFileModal}
            studentName={name}
            isGuest={isGuest}
            promptLoginRequired={promptLoginRequired}
          />
        )}

        {activeTab === 'skills' && (
          <SkillMatrixView
            skills={skills}
            srlModules={srlModules}
            isGuest={isGuest}
            promptLoginRequired={promptLoginRequired}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityFeedView
            activities={activities}
            authorName={name}
            authorInitials={initials}
            isGuest={isGuest}
            promptLoginRequired={promptLoginRequired}
          />
        )}

        {activeTab === 'events' && (
          <EventHistoryView
            events={events}
            isGuest={isGuest}
            promptLoginRequired={promptLoginRequired}
          />
        )}

        {/* ==================== 5. ZERO-TRUST BLOCKCHAIN MODAL (PUBLICLY ACCESSIBLE) ==================== */}
        <ZeroTrustModal
          show={showVerifyModal}
          onHide={() => setShowVerifyModal(false)}
          sbtData={selectedSbt}
          studentName={name}
          onOpenFileModal={handleOpenFileModal}
        />

        {/* ==================== 5.5 DOKUMEN FILE E-SERTIFIKAT MODAL ==================== */}
        <CertificateFileModal
          show={showCertificateFileModal}
          onHide={() => setShowCertificateFileModal(false)}
          certData={selectedCertForFile}
          studentName={name}
          onVerifyOnChain={handleOpenVerifyModal}
        />

        {/* ==================== 6. LOGIN REQUIRED INTERACTIVE MODAL ==================== */}
        <Modal
          show={showLoginModal}
          onHide={() => setShowLoginModal(false)}
          centered
          backdrop="static"
          className="login-required-modal"
        >
          <Modal.Header closeButton className="border-0 pb-0">
            <div className="d-flex align-items-center gap-2">
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: '#eff6ff',
                  color: '#00699e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Lock size={18} />
              </div>
              <span className="fw-bold text-dark fs-6">Akses Khusus Member</span>
            </div>
          </Modal.Header>
          <Modal.Body className="pt-3 pb-4">
            <h5 className="fw-bold text-dark mb-2">{loginModalContext.title}</h5>
            <p className="text-secondary small mb-4">{loginModalContext.description}</p>

            <div className="bg-light p-3 rounded-3 border mb-4">
              <div className="fw-semibold text-dark small mb-2">Benefit Terdaftar di KampusX:</div>
              <ul className="list-unstyled mb-0 small text-muted d-flex flex-column gap-2">
                <li className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                  <span>Download On-Chain CV ber-QR code audit Polygon</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                  <span>Akses data analitik kognitif 3-Fase SRL & waktu modul</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                  <span>Kirim pesan dan tawaran magang/proyek langsung</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                  <span>Akses klaim reward tiket & merch di Reward Hub</span>
                </li>
              </ul>
            </div>

            <div className="d-flex flex-column gap-2">
              <Link
                to="/login"
                className="btn btn-primary py-2 rounded-pill fw-bold text-center d-flex align-items-center justify-content-center gap-2"
                onClick={() => setShowLoginModal(false)}
              >
                <LogIn size={16} /> Masuk ke Akun Sekarang
              </Link>
              <Link
                to="/register"
                className="btn btn-outline-secondary py-2 rounded-pill fw-semibold text-center d-flex align-items-center justify-content-center gap-2"
                onClick={() => setShowLoginModal(false)}
              >
                <UserPlus size={16} /> Daftar Akun Baru (Gratis)
              </Link>
            </div>
          </Modal.Body>
        </Modal>

        {/* ==================== 7. BOTTOM FLOATING STICKY GUEST BAR ==================== */}
        {isGuest && (
          <div className="profile-floating-guest-bar">
            <Container className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-3">
                <div className="floating-guest-avatar d-none d-sm-flex">
                  {initials}
                </div>
                <div>
                  <div className="fw-bold text-white small d-flex align-items-center gap-1">
                    <span>Tertarik berkolaborasi dengan {name}?</span>
                    <Sparkles size={14} className="text-warning" />
                  </div>
                  <div className="text-white-50" style={{ fontSize: '11px' }}>
                    Masuk ke KampusX untuk membuka profil utuh & menghubungi kandidat ini.
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 ms-auto">
                <Link to="/login" className="btn btn-light btn-sm rounded-pill fw-bold px-3 py-1-5">
                  Masuk
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm rounded-pill fw-bold px-3 py-1-5">
                  Daftar
                </Link>
              </div>
            </Container>
          </div>
        )}

      </Container>
    </div>
  );
};

export default UserProfile;