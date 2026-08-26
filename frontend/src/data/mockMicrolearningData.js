// Mock data for KampusX Microlearning Feature Integration

export const MOCK_LEARNING_PATHS = [
  {
    id: 1,
    title: 'Pengenalan Design Thinking untuk Pemula',
    category: 'Design',
    difficulty_level: 'beginner',
    points_reward: 50,
    thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&q=80',
    description: 'Pahami cara berpikir kreatif dan solutif untuk memecahkan masalah user secara mendalam.',
    status: 'published',
    modules: [
      {
        id: 101,
        title: 'Konsep Dasar Empati & Ideasi',
        sequence_order: 1,
        lessons: [
          { id: 1001, title: 'Apa itu Empati?', content_type: 'article', estimated_duration_minutes: 3, content_body: 'Empati adalah kemampuan untuk memahami apa yang dirasakan orang lain, melihat dari sudut pandang mereka, dan membayangkan diri sendiri berada di posisi orang tersebut.' },
          { id: 1002, title: 'Membuat Empathy Map', content_type: 'article', estimated_duration_minutes: 4, content_body: 'Empathy Map adalah alat visual yang digunakan untuk merangkum perilaku dan sikap pengguna guna membangun empati yang mendalam.' },
          { id: 1003, title: 'Video: Teknik Brainstorming Kreatif', content_type: 'video', estimated_duration_minutes: 5, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 1004, title: 'Latihan Ideasi Mandiri', content_type: 'quiz', estimated_duration_minutes: 3 }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Teknik Presentasi yang Memukau Audiens',
    category: 'Speaking',
    difficulty_level: 'intermediate',
    points_reward: 75,
    thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=80',
    description: 'Kuasai bahasa tubuh, intonasi suara, dan struktur presentasi untuk meyakinkan audiens Anda.',
    status: 'published',
    modules: [
      {
        id: 102,
        title: 'Struktur Hook & Storytelling',
        sequence_order: 1,
        lessons: [
          { id: 1005, title: 'Membuka Presentasi dengan Hook', content_type: 'article', estimated_duration_minutes: 3, content_body: '30 detik pertama presentasi Anda menentukan apakah audiens akan mendengarkan Anda atau sibuk dengan ponsel mereka.' },
          { id: 1006, title: 'Kerangka Storytelling 3 Babak', content_type: 'article', estimated_duration_minutes: 4, content_body: 'Storytelling membantu mengemas data yang membosankan menjadi narasi emosional yang mudah diingat.' },
          { id: 1007, title: 'Video: Latihan Kontrol Nada Suara', content_type: 'video', estimated_duration_minutes: 6, video_url: 'https://www.w3schools.com/html/movie.mp4' }
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Dasar-dasar Kepemimpinan Tim Efektif',
    category: 'Leadership',
    difficulty_level: 'beginner',
    points_reward: 100,
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80',
    description: 'Pelajari cara mendelegasikan tugas, memberikan umpan balik, dan memotivasi anggota tim.',
    status: 'published',
    modules: [
      {
        id: 103,
        title: 'Situational Leadership Model',
        sequence_order: 1,
        lessons: [
          { id: 1008, title: 'Gaya Kepemimpinan Situasional', content_type: 'article', estimated_duration_minutes: 3 },
          { id: 1009, title: 'Teknik Delegasi Tugas', content_type: 'article', estimated_duration_minutes: 4 },
          { id: 1010, title: 'Memberikan Feedback Konstruktif', content_type: 'video', estimated_duration_minutes: 5, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ]
  },
  {
    id: 4,
    title: 'Deep Work: Fokus Tanpa Distraksi Digital',
    category: 'Productivity',
    difficulty_level: 'beginner',
    points_reward: 40,
    thumbnail: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&q=80',
    description: 'Temukan metode ilmiah untuk melatih fokus mendalam di era digital yang penuh gangguan.',
    status: 'published',
    modules: [
      {
        id: 104,
        title: 'Membangun Ritual Deep Work',
        sequence_order: 1,
        lessons: [
          { id: 1011, title: 'Apa itu Deep Work?', content_type: 'article', estimated_duration_minutes: 3 },
          { id: 1012, title: 'Time Blocking Method', content_type: 'article', estimated_duration_minutes: 4 },
          { id: 1013, title: 'Video: Cara Membaca Cepat & Fokus', content_type: 'video', estimated_duration_minutes: 5, video_url: 'https://www.w3schools.com/html/movie.mp4' }
        ]
      }
    ]
  }
];

export const MOCK_QUIZZES = {
  101: [
    {
      id: 201,
      question: 'Apa langkah pertama yang harus dilakukan dalam proses Design Thinking?',
      options: [
        { key: 'A', text: 'Membuat prototype produk secepat mungkin.' },
        { key: 'B', text: 'Berempati (Empathize) untuk memahami kebutuhan pengguna.' },
        { key: 'C', text: 'Melakukan testing langsung ke pasar luas.' }
      ],
      correct: 'B',
      explanation: 'Berempati adalah fondasi utama Design Thinking untuk memahami kebutuhan riil dari pengguna sebelum menciptakan solusi.'
    },
    {
      id: 202,
      question: 'Manakah dari elemen berikut yang TIDAK termasuk dalam sebuah Empathy Map?',
      options: [
        { key: 'A', text: 'Apa yang pengguna katakan (Say).' },
        { key: 'B', text: 'Berapa banyak keuntungan finansial proyek (Revenue).' },
        { key: 'C', text: 'Apa yang pengguna rasakan (Feel).' }
      ],
      correct: 'B',
      explanation: 'Empathy Map berfokus pada emosi dan perilaku pengguna (Say, Do, Think, Feel), bukan aspek keuangan.'
    },
    {
      id: 203,
      question: 'Bagaimana cara terbaik melakukan sesi brainstorming yang efektif?',
      options: [
        { key: 'A', text: 'Mengevaluasi setiap ide secara langsung saat diutarakan.' },
        { key: 'B', text: 'Mengumpulkan kuantitas ide sebanyak mungkin tanpa menghakimi.' },
        { key: 'C', text: 'Hanya mendengarkan ide dari pemimpin tim.' }
      ],
      correct: 'B',
      explanation: 'Tujuan utama brainstorming adalah kuantitas ide. Evaluasi ditunda agar kreativitas tidak terhambat.'
    }
  ],
  102: [
    {
      id: 204,
      question: 'Di mana letak waktu paling krusial untuk menarik minat audiens saat presentasi?',
      options: [
        { key: 'A', text: '30 detik pertama presentasi (Hook).' },
        { key: 'B', text: 'Tepat di tengah-tengah slide presentasi.' },
        { key: 'C', text: 'Saat sesi tanya jawab di bagian akhir.' }
      ],
      correct: 'A',
      explanation: 'Audiens menentukan tingkat ketertarikannya dalam 30 detik pertama. Hook yang kuat menentukan kesuksesan presentasi.'
    }
  ]
};

export const MOCK_BADGES = [
  { id: 1, title: 'Thinker Master', description: 'Menyelesaikan modul Design Thinking dengan skor kuis > 80%', icon: 'Brain', color: '#7c3aed', points_required: 50 },
  { id: 2, title: 'Stage Controller', description: 'Menyelesaikan modul Public Speaking dengan skor kuis > 80%', icon: 'Award', color: '#0369a1', points_required: 75 },
  { id: 3, title: 'Team Captain', description: 'Menyelesaikan modul Leadership dengan skor kuis > 80%', icon: 'Crown', color: '#b45309', points_required: 100 },
  { id: 4, title: 'Unstoppable Focus', description: 'Menyelesaikan modul Deep Work dengan skor kuis > 80%', icon: 'Target', color: '#047857', points_required: 40 }
];

export const MOCK_ANALYTICS = {
  learning_paths: [
    { name: 'Design Thinking', active_students: 154, completion_rate: 76, avg_score: 84 },
    { name: 'Public Speaking', active_students: 98, completion_rate: 58, avg_score: 72 },
    { name: 'Leadership', active_students: 120, completion_rate: 65, avg_score: 78 },
    { name: 'Deep Work', active_students: 84, completion_rate: 82, avg_score: 88 }
  ],
  drop_offs: [
    { name: 'Fase Planning', students: 420 },
    { name: 'Lesson 1', students: 380 },
    { name: 'Lesson 2', students: 310 },
    { name: 'Lesson 3 (Video)', students: 210 },
    { name: 'Lesson 4 (Quiz)', students: 160 }
  ],
  quiz_effectiveness: [
    { id: 'Q1', question: 'Langkah pertama Design Thinking', correct_rate: 92, difficulty: 'Mudah' },
    { id: 'Q2', question: 'Elemen Empathy Map', correct_rate: 68, difficulty: 'Sedang' },
    { id: 'Q3', question: 'Brainstorming Efektif', correct_rate: 45, difficulty: 'Sulit' }
  ],
  member_progress: {
    streak: 5,
    streak_history: ['2026-08-20', '2026-08-21', '2026-08-22', '2026-08-23', '2026-08-24'],
    skills: {
      labels: ['Analisis Masalah', 'Komunikasi', 'Kepemimpinan', 'Fokus Kerja', 'Kreativitas'],
      values: [85, 70, 75, 90, 80]
    },
    weekly_study_hours: [
      { day: 'Sen', hours: 1.5 },
      { day: 'Sel', hours: 2.0 },
      { day: 'Rab', hours: 0.8 },
      { day: 'Kam', hours: 1.2 },
      { day: 'Jum', hours: 2.5 },
      { day: 'Sab', hours: 3.0 },
      { day: 'Min', hours: 1.0 }
    ]
  }
};
