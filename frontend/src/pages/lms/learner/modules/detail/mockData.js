// ============================================================================
// MOCK DATA: Curated Modules with SRL Forethought and Multi-Unit Lessons
// ============================================================================

export const MODULE_DATA_REGISTRY = {
	'mod-arch-101': {
		id: 'mod-arch-101',
		title: 'Web Application Architecture & REST API Design',
		learningPath: 'Full-Stack AI-Powered Web Architecture',
		learningPathId: 'lp-1',
		category: 'System Architecture',
		level: 'Menengah',
		duration: '45 Menit',
		totalLessons: 6,
		completedLessons: 3,
		progressPercent: 50,
		currentLessonId: 'les-4',
		currentLessonTitle: 'Lesson 4: Scalable Endpoints, Idempotency & Rate Limiting',
		xpReward: 150,
		description:
			'Pelajari prinsip perancangan endpoint RESTful yang skalabel, penanganan idempotent request methods, strategi HTTP caching headers, serta teknik rate limiting untuk sistem backend berkinerja tinggi.',
		instructor: {
			name: 'Ir. Hendra Pratama, M.T.',
			title: 'Principal Software Architect @ TechCorp',
			avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
			rating: 4.95,
			totalStudents: '3,820',
			bio: '12+ tahun pengalaman membangun arsitektur backend berskala terdistribusi di fintech dan platform edutech.',
		},
		learningOutcomes: [
			'Memahami semantik HTTP methods (GET, POST, PUT, PATCH, DELETE) & HTTP status codes standar industri.',
			'Menerapkan prinsip Idempotency pada payment endpoints dan transfer data kritikal.',
			'Mengkonfigurasi strategi rate-limiting menggunakan algoritma Token Bucket dan Redis.',
			'Membangun API documentation terstruktur menggunakan OpenAPI (Swagger) v3.1.',
		],
		prerequisites: [
			'Dasar pemrograman backend (Node.js/Python/Go)',
			'Pemahaman protokol dasar HTTP/1.1 & HTTP/2',
		],
		badgeEarned: {
			title: 'API Architect Apprentice',
			description: 'Menyelesaikan implementasi RESTful API best practices.',
		},
		lessons: [
			{
				id: 'les-1',
				number: 1,
				title: 'Fondasi RESTful Semantic & URI Naming Convention',
				format: 'video',
				duration: '10 min',
				status: 'completed', // completed | current | locked
				xp: 25,
				summary:
					'Aturan penamaan URI RESTful, resource plural vs singular, dan anti-patterns.',
			},
			{
				id: 'les-2',
				number: 2,
				title: 'HTTP Status Codes, Error Handling & RFC 7807',
				format: 'article',
				duration: '8 min',
				status: 'completed',
				xp: 20,
				summary:
					'Standardisasi format pesan galat JSON menggunakan standar Problem Details (RFC 7807).',
			},
			{
				id: 'les-3',
				number: 3,
				title: 'Diagnostic Checkpoint: REST Principles Assessment',
				format: 'quiz',
				duration: '7 min',
				status: 'completed',
				score: '92/100',
				xp: 30,
				summary: 'Kuis evaluasi pemahaman HTTP contracts dan payload serialization.',
			},
			{
				id: 'les-4',
				number: 4,
				title: 'Scalable Endpoints, Idempotency & Rate Limiting',
				format: 'video',
				duration: '12 min',
				status: 'current',
				xp: 35,
				summary:
					'Kunci idempotency key dengan Redis dan konfigurasi sliding window rate limiter.',
			},
			{
				id: 'les-5',
				number: 5,
				title: 'Interactive Code Lab: Implementing Idempotency Middleware',
				format: 'code',
				duration: '10 min',
				status: 'locked',
				xp: 30,
				summary:
					'Tulis middleware Express/FastAPI untuk validasi idempotency token pada transaksi.',
			},
			{
				id: 'les-6',
				number: 6,
				title: 'Refleksi Diri SRL & Ringkasan Modul REST API',
				format: 'reflection',
				duration: '8 min',
				status: 'locked',
				xp: 30,
				summary:
					'Evaluasi metakognisi, pencatatan insight utama, dan penyesuaian strategi belajar.',
			},
		],
	},
};

/**
 * Fallback module generator if non-registered ID is visited
 */
export const getModuleData = (moduleId) => {
	if (MODULE_DATA_REGISTRY[moduleId]) {
		return MODULE_DATA_REGISTRY[moduleId];
	}

	// Generic template for other IDs
	return {
		id: moduleId || 'mod-default',
		title: 'Microlearning Mastery & Technical Foundations',
		learningPath: 'Web Development & Modern Engineering',
		learningPathId: 'lp-1',
		category: 'Software Engineering',
		level: 'Menengah',
		duration: '40 Menit',
		totalLessons: 5,
		completedLessons: 2,
		progressPercent: 40,
		currentLessonId: 'les-3',
		currentLessonTitle: 'Lesson 3: Core Implementation & Best Practices',
		xpReward: 120,
		description:
			'Modul pembelajaran modular microlearning untuk mempercepat akselerasi keahlian teknis secara mandiri melalui kurikulum bertahap.',
		instructor: {
			name: 'Dr. Reza Fauzi',
			title: 'Principal AI Researcher & Tech Mentor',
			avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
			rating: 4.9,
			totalStudents: '2,400',
			bio: 'Spesialis dalam arsitektur pembelajaran adaptif mandiri dan teknologi web terdistribusi.',
		},
		learningOutcomes: [
			'Memahami alur implementasi teknis dari level dasar hingga production-ready.',
			'Menerapkan self-regulation dan deliberate practice dalam pemecahan masalah coding.',
			'Membangun portofolio implementasi nyata yang dapat diverifikasi.',
		],
		prerequisites: ['Pemahaman dasar web programming', 'Kemauan untuk belajar aktif mandiri'],
		badgeEarned: {
			title: 'Active Tech Scholar',
			description: 'Menyelesaikan modul dengan konsistensi belajar tinggi.',
		},
		lessons: [
			{
				id: 'les-1',
				number: 1,
				title: 'Pengantar Konsep & Prinsip Dasar',
				format: 'video',
				duration: '10 min',
				status: 'completed',
				xp: 25,
				summary: 'Dasar pemahaman arsitektur dan framework yang digunakan.',
			},
			{
				id: 'les-2',
				number: 2,
				title: 'Deep Dive: Komponen Utama & Praktik Nyata',
				format: 'article',
				duration: '8 min',
				status: 'completed',
				xp: 20,
				summary: 'Ulasan mendalam dengan studi kasus riil industri.',
			},
			{
				id: 'les-3',
				number: 3,
				title: 'Core Implementation & Best Practices',
				format: 'video',
				duration: '12 min',
				status: 'current',
				xp: 35,
				summary: 'Sesi praktik langsung dan penulisan kode terstruktur.',
			},
			{
				id: 'les-4',
				number: 4,
				title: 'Checkpoint Evaluasi & Diagnostic Quiz',
				format: 'quiz',
				duration: '8 min',
				status: 'locked',
				xp: 25,
				summary: 'Uji pemahaman mandiri dengan soal diagnostik adaptif.',
			},
			{
				id: 'les-5',
				number: 5,
				title: 'Refleksi Diri SRL & Metakognisi Belajar',
				format: 'reflection',
				duration: '7 min',
				status: 'locked',
				xp: 25,
				summary: 'Refleksi evaluasi capaian belajar dan rencana aplikasi nyata.',
			},
		],
	};
};
