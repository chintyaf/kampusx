// Dummy data kandidat mahasiswa, kredensial on-chain SBT, dan social feed

export const MOCK_TALENTS = [
  {
    id: 1,
    name: 'Ahmad Fauzi',
    initials: 'AH',
    headline: 'Data Scientist & AI Specialist | UGM Computer Science • Top #1 Leaderboard',
    campus: 'Universitas Gadjah Mada',
    major: 'Ilmu Komputer',
    email: 'ahmad.fauzi@mail.ugm.ac.id',
    phone: '+62 812-3456-7890',
    tier: 'Diamond',
    avatarBg: '#fef3c7',
    avatarColor: '#92400e',
    bio: 'Fokus pada riset NLP, Machine Learning, dan Big Data. Telah menyelesaikan kurikulum microlearning SRL Python & AI di KampusX dengan skor kognitif 98%.',
    skills: [
      { name: 'Python', level: 96, category: 'AI & Data' },
      { name: 'Machine Learning', level: 92, category: 'AI & Data' },
      { name: 'Deep Learning', level: 89, category: 'AI & Data' },
      { name: 'Data Analysis', level: 88, category: 'AI & Data' },
      { name: 'SQL', level: 85, category: 'Database' }
    ],
    modulesCompleted: 8,
    eventsAttended: 21,
    sbtCount: 5,
    walletAddress: '0x3a4b98F12c09Ad6E9b7E185c899d214C718b89Fc',
    sbtList: [
      {
        tokenId: '#SBT-2026-0041',
        title: 'Advanced AI & Deep Learning Specialist',
        category: 'Python',
        issuer: 'KampusX Verified Authority & GDSC Indonesia',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x94f1c8a73b22e185c899d214c718b90a61849f2b87e91402ba815349e5d4cb3c',
        date: '28 Sep 2026',
        block: '58,219,044',
        standard: 'ERC-5192 (Soulbound / Non-Transferable)'
      }
    ],
    latestSbt: {
      tokenId: '#SBT-2026-0041',
      title: 'Advanced AI & Deep Learning Specialist',
      contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
      txHash: '0x94f1c8a73b22e185c899d214c718b90a61849f2b87e91402ba815349e5d4cb3c',
      date: '28 Sep 2026',
      block: '58,219,044'
    }
  },
  {
    id: 4,
    name: 'Siti Rahma',
    initials: 'SI',
    headline: 'AI Engineer & Deep Learning Researcher | Universitas Brawijaya',
    campus: 'Universitas Brawijaya',
    major: 'Ilmu Komputer',
    email: 'siti.rahma@student.ub.ac.id',
    phone: '+62 813-7788-9900',
    tier: 'Gold',
    avatarBg: '#fef3c7',
    avatarColor: '#b45309',
    bio: 'Tertarik pada Computer Vision, generative models, RAG retrieval optimization, dan automasi Python berintegritas tinggi.',
    skills: [
      { name: 'Python', level: 93, category: 'AI & Data' },
      { name: 'Machine Learning', level: 89, category: 'AI & Data' },
      { name: 'TensorFlow', level: 85, category: 'AI & Data' },
      { name: 'Data Analysis', level: 86, category: 'AI & Data' },
      { name: 'Solidity', level: 82, category: 'Web3' }
    ],
    modulesCompleted: 6,
    eventsAttended: 13,
    sbtCount: 3,
    walletAddress: '0x44d188ec3a4b98f12c09ad6e9b7e185c899d9182',
    sbtList: [
      {
        tokenId: '#SBT-2026-0118',
        title: 'Deep Learning & Neural Networks Practitioner',
        category: 'Python',
        issuer: 'KampusX Verified Credentials',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x629a81234b981e74a682910ba7491029c8714019a82740192847bca8271039de',
        date: '10 Sep 2026',
        block: '58,091,230',
        standard: 'ERC-5192 (Soulbound / Non-Transferable)'
      }
    ],
    latestSbt: {
      tokenId: '#SBT-2026-0118',
      title: 'Deep Learning & Neural Networks Practitioner',
      contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
      txHash: '0x629a81234b981e74a682910ba7491029c8714019a82740192847bca8271039de',
      date: '10 Sep 2026',
      block: '58,091,230'
    }
  },
  {
    id: 2,
    name: 'Rian Hidayat',
    initials: 'RI',
    headline: 'Fullstack Software Engineer & Cloud Architect | ITB Informatics',
    campus: 'Institut Teknologi Bandung',
    major: 'Teknik Informatika',
    email: 'rian.hidayat@itb.ac.id',
    phone: '+62 821-4567-8901',
    tier: 'Platinum',
    avatarBg: '#e0f2fe',
    avatarColor: '#0369a1',
    bio: 'Membangun aplikasi web performa tinggi menggunakan React, Node.js, and arsitektur microservices.',
    skills: [
      { name: 'React', level: 92, category: 'Frontend' },
      { name: 'Node.js', level: 88, category: 'Backend' },
      { name: 'TypeScript', level: 85, category: 'Frontend' },
      { name: 'Docker', level: 82, category: 'DevOps' }
    ],
    modulesCompleted: 7,
    eventsAttended: 15,
    sbtCount: 4,
    walletAddress: '0x7b1298412c09ad6e9b7e185c899d214c718b44d9',
    sbtList: [
      {
        tokenId: '#SBT-2026-0082',
        title: 'Fullstack Microservices & Cloud Engineering',
        category: 'Software Engineering',
        issuer: 'KampusX Verified Credentials',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x53e1a902cbb3918a4d701e4a68291b29a674510b65f419c832e0192847aef921',
        date: '22 Sep 2026',
        block: '58,190,412',
        standard: 'ERC-5192 (Soulbound / Non-Transferable)'
      }
    ],
    latestSbt: {
      tokenId: '#SBT-2026-0082',
      title: 'Fullstack Microservices & Cloud Engineering',
      contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
      txHash: '0x53e1a902cbb3918a4d701e4a68291b29a674510b65f419c832e0192847aef921',
      date: '22 Sep 2026',
      block: '58,190,412'
    }
  },
  {
    id: 3,
    name: 'Dian Sastro',
    initials: 'DI',
    headline: 'Product Designer (UI/UX) & Design System Enthusiast | UI Information Systems',
    campus: 'Universitas Indonesia',
    major: 'Sistem Informasi',
    email: 'dian.sastro@ui.ac.id',
    phone: '+62 811-9876-5432',
    tier: 'Gold',
    avatarBg: '#fce7f3',
    avatarColor: '#9d174d',
    bio: 'Mendesain antarmuka berbasis riset pengguna (UX Research), wireframing, dan design system Figma berstandar enterprise.',
    skills: [
      { name: 'Figma', level: 96, category: 'UI/UX' },
      { name: 'UI/UX Design', level: 92, category: 'UI/UX' },
      { name: 'Design System', level: 90, category: 'UI/UX' },
      { name: 'UX Research', level: 85, category: 'UI/UX' }
    ],
    modulesCompleted: 6,
    eventsAttended: 12,
    sbtCount: 3,
    walletAddress: '0x99c418294719be1a02eb3918d6a718c9492e71ab',
    sbtList: [
      {
        tokenId: '#SBT-2026-0105',
        title: 'Human-Centered UI/UX Master Credentials',
        category: 'UI/UX Design',
        issuer: 'KampusX Verified Credentials',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x17c2f849a902eb3918d6a718c9492e85a67140b91e847192a54b38294719be1a',
        date: '15 Sep 2026',
        block: '58,124,500',
        standard: 'ERC-5192 (Soulbound / Non-Transferable)'
      }
    ],
    latestSbt: {
      tokenId: '#SBT-2026-0105',
      title: 'Human-Centered UI/UX Master Credentials',
      contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
      txHash: '0x17c2f849a902eb3918d6a718c9492e85a67140b91e847192a54b38294719be1a',
      date: '15 Sep 2026',
      block: '58,124,500'
    }
  },
  {
    id: 5,
    name: 'Budi Santoso',
    initials: 'BU',
    headline: 'Backend Engineer (Golang & Kubernetes) | ITS Informatics',
    campus: 'Institut Teknologi Sepuluh Nopember',
    major: 'Teknik Informatika',
    email: 'budi.santoso@mhs.its.ac.id',
    phone: '+62 856-7890-1234',
    tier: 'Gold',
    avatarBg: '#ede9fe',
    avatarColor: '#6d28d9',
    bio: 'Spesialis sistem terdistribusi, database concurrency, Redis caching, dan event-driven microservices.',
    skills: [
      { name: 'Go', level: 93, category: 'Backend' },
      { name: 'SQL', level: 89, category: 'Database' },
      { name: 'Docker', level: 84, category: 'DevOps' },
      { name: 'Redis', level: 86, category: 'Backend' }
    ],
    modulesCompleted: 5,
    eventsAttended: 9,
    sbtCount: 3,
    walletAddress: '0x81ee1928a471029c8714019a82740192847b99a0',
    sbtList: [
      {
        tokenId: '#SBT-2026-0130',
        title: 'High-Throughput Backend Architecture',
        category: 'Backend',
        issuer: 'KampusX Verified Credentials',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x38471928a471029c8714019a82740192847bca8271039de629a81234b981e74a',
        date: '05 Sep 2026',
        block: '58,014,921',
        standard: 'ERC-5192 (Soulbound / Non-Transferable)'
      }
    ],
    latestSbt: {
      tokenId: '#SBT-2026-0130',
      title: 'High-Throughput Backend Architecture',
      contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
      txHash: '0x38471928a471029c8714019a82740192847bca8271039de629a81234b981e74a',
      date: '05 Sep 2026',
      block: '58,014,921'
    }
  },
  {
    id: 6,
    name: 'Citra Kirana',
    initials: 'CI',
    headline: 'Product Manager & Tech Strategist | Universitas Padjadjaran',
    campus: 'Universitas Padjadjaran',
    major: 'Manajemen Bisnis & IT',
    email: 'citra.kirana@mail.unpad.ac.id',
    phone: '+62 818-1234-5678',
    tier: 'Gold',
    avatarBg: '#dcfce7',
    avatarColor: '#166534',
    bio: 'Menghubungkan strategi bisnis dengan eksekusi rekayasa perangkat lunak melalui metodologi Scrum/Agile.',
    skills: [
      { name: 'Product Management', level: 92, category: 'Product' },
      { name: 'Data Analysis', level: 86, category: 'AI & Data' },
      { name: 'Scrum Agile', level: 90, category: 'Management' },
      { name: 'UI/UX Design', level: 78, category: 'UI/UX' }
    ],
    modulesCompleted: 5,
    eventsAttended: 11,
    sbtCount: 2,
    walletAddress: '0x12a8192847bca8271039de629a81234b981e55c1',
    sbtList: [
      {
        tokenId: '#SBT-2026-0144',
        title: 'Digital Product Management Excellence',
        category: 'Product',
        issuer: 'KampusX Verified Credentials',
        contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
        txHash: '0x9918274a1029c8714019a82740192847bca8271039de629a81234b981e74a384',
        date: '01 Sep 2026',
        block: '57,984,110',
        standard: 'ERC-5192 (Soulbound / Non-Transferable)'
      }
    ],
    latestSbt: {
      tokenId: '#SBT-2026-0144',
      title: 'Digital Product Management Excellence',
      contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
      txHash: '0x9918274a1029c8714019a82740192847bca8271039de629a81234b981e74a384',
      date: '01 Sep 2026',
      block: '57,984,110'
    }
  }
];

// LinkedIn-style dummy social posts
export const MOCK_SOCIAL_POSTS = [
  {
    id: 'p1',
    authorName: 'Ahmad Fauzi',
    authorInitials: 'AH',
    authorHeadline: 'Data Scientist & AI Specialist • UGM',
    timeAgo: '2 jam yang lalu',
    content:
      'Sangat bersyukur baru saja menyelesaikan modul SRL Microlearning "Python & Deep Learning Foundations" dengan passing grade 98%! Kredensial sertifikat otomatis tercetak sebagai Soulbound Token (SBT) permanen di Blockchain Polygon 🎓🚀 Terima kasih KampusX!',
    badgeHighlight: {
      title: 'Advanced AI & Deep Learning Specialist',
      tokenId: '#SBT-2026-0041',
      issuer: 'KampusX Verified Credentials & Polygon Ledger'
    },
    likesCount: 34,
    commentsCount: 6,
    sbtModalTarget: MOCK_TALENTS[0]
  },
  {
    id: 'p2',
    authorName: 'Rian Hidayat',
    authorInitials: 'RI',
    authorHeadline: 'Fullstack Software Engineer • ITB',
    timeAgo: '5 jam yang lalu',
    content:
      'Tim kami berhasil mengimplementasikan arsitektur Smart Contract Soulbound Token ERC-5192 untuk portofolio digital mahasiswa. Dengan verifikasi Zero-Trust on-chain, rekruter dapat langsung membuktikan keabsahan sertifikat tanpa pihak ketiga! Cek kredensial saya di bawah:',
    badgeHighlight: {
      title: 'Fullstack Microservices & Cloud Engineering',
      tokenId: '#SBT-2026-0082',
      issuer: 'KampusX Verified Credentials & Polygon Ledger'
    },
    likesCount: 52,
    commentsCount: 11,
    sbtModalTarget: MOCK_TALENTS[2]
  },
  {
    id: 'p3',
    authorName: 'Dian Sastro',
    authorInitials: 'DI',
    authorHeadline: 'Product Designer (UI/UX) • Universitas Indonesia',
    timeAgo: '1 hari yang lalu',
    content:
      'Desain yang baik selalu berlandaskan data dan kebutuhan riil pengguna. Senang sekali bisa berbagi materi seputar Design System & UX Research di workshop KampusX kemarin! Kredensial pembicara sudah terverifikasi di Polygon Ledger.',
    badgeHighlight: {
      title: 'Human-Centered UI/UX Master Credentials',
      tokenId: '#SBT-2026-0105',
      issuer: 'KampusX Verified Credentials & Polygon Ledger'
    },
    likesCount: 41,
    commentsCount: 4,
    sbtModalTarget: MOCK_TALENTS[3]
  }
];

export const AVAILABLE_SKILLS_FOR_MATCH = [
  'Python',
  'Data Analysis',
  'Machine Learning',
  'Deep Learning',
  'React',
  'Node.js',
  'SQL',
  'Figma',
  'UI/UX Design',
  'Go',
  'Docker',
  'Solidity'
];

export const SKILL_PRESETS = [
  { label: 'Python & AI Specialist', skills: ['Python', 'Machine Learning', 'Data Analysis'] },
  { label: 'Fullstack Developer', skills: ['React', 'Node.js', 'SQL', 'Docker'] },
  { label: 'UI/UX Product Designer', skills: ['Figma', 'UI/UX Design'] }
];
