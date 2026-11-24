// Mock data Learning Dashboard. Bentuk data mengikuti rancangan basis data & model pada laporan:
// enrollments, srl_forethought / learning_activities / srl_reflections, readiness_predictions,
// recommendations, user_badges, certificates, credential_submissions, member_skills.

export const mockUserLearningProfile = {
	currentStreak: 7,
};

// Modul yang sedang dipelajari (enrollment aktif + sesi SRL yang berjalan).
export const mockActiveModule = {
	id: 'mod-rest-api',
	title: 'Web Application Architecture & REST API Design',
	category: 'System Architecture',
	thumbnail: null,
	lessonsDone: 5,
	lessonTotal: 8,
	currentLesson: 6,
	lessonTitle: 'Scalable Endpoints, Idempotency & Rate Limiting',
	minutesLeft: 15,
	srlPhase: 'performance', // forethought | performance | reflection
	session: {
		forethought: {
			sessionGoal: 'Memahami idempotency pada REST API',
			estimatedTime: 25,
			confidence: 3,
			selectedStrategies: ['Mencatat Poin Penting', 'Teknik Pomodoro'],
		},
		performance: { accumulatedSeconds: 12 * 60 },
	},
};

// Output model Learning Readiness (Random Forest): Readiness Score 0–1 + fitur masukan (Tabel 3.5).
export const mockLearningReadiness = {
	moduleTitle: 'Web Application Architecture & REST API Design',
	score: 0.68,
	factors: [
		{ label: 'Rata-rata skor kuis', value: '78' },
		{ label: 'Tren skor kuis', value: '+6', tone: 'success' },
		{ label: 'Percobaan kuis', value: '2×' },
		{ label: 'Durasi belajar', value: '1j 35m' },
		{ label: 'Frekuensi belajar', value: '4 sesi/mgg' },
		{ label: 'Penyelesaian materi', value: '63%' },
	],
	lastQuiz: {
		lesson: 'Lesson 5 · HTTP Methods & Status Codes',
		score: 80,
		feedback:
			'Pemahaman method dan status code sudah baik. Perdalam perbedaan PUT dan PATCH, serta kapan memakai 409 vs 422.',
	},
};

// Output Recommendation Engine (hybrid CBF + CF), sudah disaring dari materi yang pernah diakses.
export const mockRecommendedModules = [
	{
		id: 'rec-1',
		title: 'Securing Distributed APIs: OAuth 2.1 & Zero Trust JWT',
		category: 'Security',
		lessons: 3,
		level: 'Intermediate',
		duration: 12,
		score: 0.91,
		source: 'hybrid',
		reason: 'pendukung',
		skills: ['API Security', 'Authentication'],
	},
	{
		id: 'rec-2',
		title: 'Microservices Event-Driven Patterns with Kafka & Redis',
		category: 'System Architecture',
		lessons: 5,
		level: 'Intermediate',
		duration: 18,
		score: 0.86,
		source: 'cbf',
		reason: 'lanjut',
		skills: ['Message Queue', 'Microservices'],
	},
	{
		id: 'rec-3',
		title: 'React 19 Server Components, Actions & Optimistic UI',
		category: 'Frontend Development',
		lessons: 4,
		level: 'Advanced',
		duration: 14,
		score: 0.79,
		source: 'cf',
		reason: 'lanjut',
		skills: ['React', 'Server Components'],
	},
	{
		id: 'rec-4',
		title: 'Self-Regulated Learning (SRL): High Performance Habits',
		category: 'Soft Skills',
		lessons: 3,
		level: 'All Levels',
		duration: 10,
		score: 0.74,
		source: 'cf',
		reason: 'pendukung',
		skills: ['Time Management'],
	},
];

export const mockEnrolledModules = [
	{
		id: 'enr-1',
		title: 'Web Application Architecture & REST API Design',
		category: 'System Architecture',
		thumbnail: null,
		status: 'in_progress',
		lessonsDone: 5,
		lessonTotal: 8,
		srlPhase: 'performance',
		lastQuizScore: 80,
		readiness: 0.68,
		lastActivity: 'Hari ini, 10:30',
	},
	{
		id: 'enr-2',
		title: 'Modern State Management with Redux Toolkit & Zustand',
		category: 'Frontend Development',
		thumbnail: null,
		status: 'in_progress',
		lessonsDone: 2,
		lessonTotal: 6,
		srlPhase: 'reflection',
		lastQuizScore: 70,
		readiness: 0.46,
		lastActivity: 'Kemarin',
	},
	{
		id: 'enr-3',
		title: 'Database Indexing & PostgreSQL Query Optimization',
		category: 'Database Systems',
		thumbnail: null,
		status: 'in_progress',
		lessonsDone: 3,
		lessonTotal: 6,
		srlPhase: 'forethought',
		lastQuizScore: 76,
		readiness: 0.77,
		lastActivity: '3 hari lalu',
	},
	{
		id: 'enr-4',
		title: 'Docker & Containerization for Fullstack Engineers',
		category: 'DevOps & Cloud',
		thumbnail: null,
		status: 'completed',
		lessonsDone: 6,
		lessonTotal: 6,
		srlPhase: null,
		lastQuizScore: 90,
		readiness: 0.88,
		lastActivity: '5 hari lalu',
	},
	{
		id: 'enr-5',
		title: 'Clean Architecture & Domain Driven Design Essentials',
		category: 'Software Engineering',
		thumbnail: null,
		status: 'completed',
		lessonsDone: 7,
		lessonTotal: 7,
		srlPhase: null,
		lastQuizScore: 85,
		readiness: 0.82,
		lastActivity: '1 minggu lalu',
	},
];

// Profil kompetensi (member_skills) hasil pemetaan module_skills + Match Score & Skill Gap.
export const mockSkillProfile = {
	skills: [
		{ name: 'REST API Design', level: 0.72 },
		{ name: 'Containerization', level: 0.9 },
		{ name: 'Software Architecture', level: 0.85 },
		{ name: 'Database Optimization', level: 0.5 },
		{ name: 'State Management', level: 0.33 },
	],
	careerFit: [
		{
			role: 'Backend Engineer',
			company: 'PT Nusantara Digital',
			matchScore: 0.78,
			gaps: ['Message Queue', 'Kubernetes'],
		},
		{
			role: 'Fullstack Developer',
			company: 'Studio Kode Bandung',
			matchScore: 0.71,
			gaps: ['React Testing', 'GraphQL'],
		},
	],
};

// Badge (user_badges) dan kredensial digital (certificates + credential_submissions).
export const mockAchievements = {
	badges: [
		{ id: 'b1', name: 'Konsisten 7 Hari', icon: 'flame', earned: true },
		{ id: 'b2', name: 'Pembelajar Reflektif', icon: 'refresh', earned: true },
		{ id: 'b3', name: 'Path Finisher', icon: 'award', earned: false },
		{ id: 'b4', name: 'Kuis Sempurna', icon: 'zap', earned: false },
	],
	// status: recorded (tercatat) | processing (diproses) | pending (menunggu kelulusan)
	credentials: [
		{
			id: 'c1',
			module: 'Docker & Containerization for Fullstack Engineers',
			score: 90,
			status: 'recorded',
		},
		{
			id: 'c2',
			module: 'Clean Architecture & Domain Driven Design Essentials',
			score: 85,
			status: 'processing',
		},
	],
};

// Riwayat sesi SRL. Struktur field mengikuti tiga fase SRL:
// forethought → { sessionGoal, estimatedTime, confidence, selectedStrategies }
// performance → { accumulatedSeconds }
// reflection  → { goalAchievement, factors, evaluation, futureAdjustment }
const daysAgo = (days, hour, minute) => {
	const d = new Date();
	d.setDate(d.getDate() - days);
	d.setHours(hour, minute, 0, 0);
	return d.toISOString();
};

export const mockSRLHistory = [
	{
		id: 'srl-008',
		startedAt: daysAgo(0, 10, 30),
		module: 'Web Application Architecture & REST API Design',
		forethought: {
			sessionGoal: 'Memahami idempotency pada REST API',
			estimatedTime: 25,
			confidence: 3,
			selectedStrategies: ['Mencatat Poin Penting', 'Teknik Pomodoro'],
		},
		performance: { accumulatedSeconds: 25 * 60 },
		reflection: {
			goalAchievement: 'tercapai',
			factors: ['Strategi belajar', 'Fokus dan konsentrasi'],
			evaluation:
				'Sudah paham cara kerja idempotency key, tinggal latihan menerapkannya di endpoint POST.',
			futureAdjustment: 'Langsung praktik di Postman setelah selesai membaca materi.',
		},
	},
	{
		id: 'srl-007',
		startedAt: daysAgo(1, 19, 15),
		module: 'Modern State Management with Redux Toolkit & Zustand',
		forethought: {
			sessionGoal: 'Memahami perbedaan Redux Toolkit dan Zustand',
			estimatedTime: 30,
			confidence: 2,
			selectedStrategies: ['Menjelaskan Ulang (Feynman Technique)'],
		},
		performance: { accumulatedSeconds: 22 * 60 },
		reflection: {
			goalAchievement: 'sebagian',
			factors: ['Tingkat kesulitan materi'],
			evaluation: 'Konsep slice sudah jelas, tapi async thunk masih membingungkan.',
			futureAdjustment: 'Ulangi bagian createAsyncThunk dengan contoh kecil.',
		},
	},
	{
		id: 'srl-006',
		startedAt: daysAgo(2, 16, 0),
		module: 'Database Indexing & PostgreSQL Query Optimization',
		forethought: {
			sessionGoal: 'Memahami B-tree index dan kapan dipakai',
			estimatedTime: 25,
			confidence: 3,
			selectedStrategies: ['Latihan Soal Praktis', 'Mencatat Poin Penting'],
		},
		performance: { accumulatedSeconds: 25 * 60 },
		reflection: {
			goalAchievement: 'tercapai',
			factors: ['Strategi belajar', 'Pengetahuan awal'],
			evaluation: 'Bisa menjelaskan kapan index membantu dan kapan justru memperlambat write.',
			futureAdjustment: 'Lanjut ke composite index dengan studi kasus tabel besar.',
		},
	},
	{
		id: 'srl-005',
		startedAt: daysAgo(3, 20, 40),
		module: 'Database Indexing & PostgreSQL Query Optimization',
		forethought: {
			sessionGoal: 'Membaca output EXPLAIN ANALYZE',
			estimatedTime: 20,
			confidence: 4,
			selectedStrategies: ['Teknik Pomodoro'],
		},
		performance: { accumulatedSeconds: 9 * 60 },
		reflection: {
			goalAchievement: 'belum',
			factors: ['Manajemen waktu', 'Kondisi tubuh dan lingkungan'],
			evaluation: 'Waktu habis untuk setup dan badan sudah lelah, belum sampai membaca output.',
			futureAdjustment: 'Siapkan database sampel sebelum sesi dimulai dan belajar lebih awal.',
		},
	},
	{
		id: 'srl-004',
		startedAt: daysAgo(4, 9, 20),
		module: 'Docker & Containerization for Fullstack Engineers',
		forethought: {
			sessionGoal: 'Menulis Dockerfile multi-stage',
			estimatedTime: 30,
			confidence: 3,
			selectedStrategies: ['Latihan Soal Praktis'],
		},
		performance: { accumulatedSeconds: 30 * 60 },
		reflection: {
			goalAchievement: 'tercapai',
			factors: ['Strategi belajar'],
			evaluation: 'Ukuran image turun drastis setelah memakai multi-stage build.',
			futureAdjustment: 'Coba menerapkannya pada proyek KP.',
		},
	},
	{
		id: 'srl-003',
		startedAt: daysAgo(6, 14, 10),
		module: 'Clean Architecture & Domain Driven Design Essentials',
		forethought: {
			sessionGoal: 'Memahami aggregate dan bounded context',
			estimatedTime: 40,
			confidence: 2,
			selectedStrategies: ['Menjelaskan Ulang (Feynman Technique)', 'Mencatat Poin Penting'],
		},
		performance: { accumulatedSeconds: 35 * 60 },
		reflection: {
			goalAchievement: 'tercapai',
			factors: ['Strategi belajar', 'Fokus dan konsentrasi'],
			evaluation: 'Menjelaskan ulang ke teman membantu melihat bagian yang belum kupahami.',
			futureAdjustment: 'Buat diagram sederhana untuk setiap bounded context.',
		},
	},
	{
		id: 'srl-002',
		startedAt: daysAgo(8, 18, 30),
		module: 'Web Application Architecture & REST API Design',
		forethought: {
			sessionGoal: 'Memahami rate limiting dengan token bucket',
			estimatedTime: 25,
			confidence: 4,
			selectedStrategies: ['Teknik Pomodoro'],
		},
		performance: { accumulatedSeconds: 14 * 60 },
		reflection: {
			goalAchievement: 'sebagian',
			factors: ['Manajemen waktu'],
			evaluation: 'Konsep token bucket paham, tapi belum sempat membandingkan dengan leaky bucket.',
			futureAdjustment: 'Sisihkan sesi khusus untuk membandingkan algoritma rate limiting.',
		},
	},
	{
		id: 'srl-001',
		startedAt: daysAgo(10, 8, 45),
		module: 'Modern State Management with Redux Toolkit & Zustand',
		forethought: {
			sessionGoal: 'Mempelajari dasar Redux Toolkit',
			estimatedTime: 25,
			confidence: 3,
			selectedStrategies: ['Mencatat Poin Penting'],
		},
		performance: { accumulatedSeconds: 25 * 60 },
		reflection: {
			goalAchievement: 'tercapai',
			factors: ['Pengetahuan awal', 'Fokus dan konsentrasi'],
			evaluation: 'Alur store, slice, dan reducer sudah masuk.',
			futureAdjustment: 'Lanjut ke async thunk dengan contoh API sederhana.',
		},
	},
];
