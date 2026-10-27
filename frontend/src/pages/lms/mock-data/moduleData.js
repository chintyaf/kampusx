import { MODULE_LESSONS_DATA } from './lessonData';

// ============================================================================
// MODULE REGISTRY (Curated Modules & Detail Overviews)
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
		durationMinutes: 45,
		totalLessons: 6,
		completedLessons: 3,
		progressPercent: 50,
		currentLessonId: 'les-4',
		currentLessonTitle: 'Lesson 4: Scalable Endpoints, Idempotency & Rate Limiting',
		xpReward: 150,
		passingScore: 75,
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
		lessons: MODULE_LESSONS_DATA,
	},

	'mod-daspro-101': {
		id: 'mod-daspro-101',
		title: 'Dasar Pemrograman: Tipe Data & Program Sederhana',
		learningPath: 'Dasar Pemrograman dengan Python',
		learningPathId: 'lp-daspro',
		category: 'Computer Science',
		level: 'Pemula',
		duration: '45 Menit',
		durationMinutes: 45,
		totalLessons: 6,
		completedLessons: 3,
		progressPercent: 50,
		currentLessonId: 'les-4',
		currentLessonTitle: 'Lesson 4: Instruksi Input, Output & Formatting Output',
		xpReward: 150,
		passingScore: 70,
		description:
			'Modul ini membahas konsep dasar pemrograman komputer meliputi jenis tipe data (boolean, integer, float, string), penulisan variabel, pengisian nilai (assignment), instruksi input/output, hingga implementasi algoritma sekuensial sederhana menggunakan Python.',
		instructor: {
			name: 'Tim Dosen Dasar Pemrograman',
			title: 'Program Studi S-1 Teknik Informatika',
			avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
			rating: 4.95,
			totalStudents: '3,820',
			bio: 'Fakultas Teknologi Informasi - Universitas Kristen Maranatha.',
		},
		learningOutcomes: [
			'Memahami konsep Stored Program Computer, 4 tipe data dasar (boolean, integer, float, string), dan operatornya.',
			'Menguasai aturan penamaan variabel yang valid, konsep assignment, dan penulisan struktur program Python.',
			'Menerapkan instruksi masukan/keluaran (input/print) dan teknik formatting output (end, sep, format numerik).',
			'Menyelesaikan persoalan sekuensial seperti tukar isi variabel, konversi waktu, suhu, mata uang, dan pecahan uang.',
		],
		prerequisites: [
			'Pengenalan dasar logika matematika',
			'Instalasi Python 3.x pada perangkat lokal',
		],
		badgeEarned: {
			title: 'Python Fundamental Novice',
			description:
				'Berhasil menguasai tipe data dan penyusunan program sekuensial sederhana.',
		},
		lessons: [
			{
				id: 'py-les-1',
				number: 1,
				title: 'Pengenalan Konsep Stored Program & Tipe Data Dasar',
				type: 'video',
				format: 'video',
				duration: '10 min',
				status: 'completed',
				xp: 25,
				summary:
					'Alur Stored Program Computer dan 4 tipe data dasar (boolean, integer, float, string).',
			},
			{
				id: 'py-les-2',
				number: 2,
				title: 'Operator Aritmatika, Relasional & Logika',
				type: 'article',
				format: 'article',
				duration: '8 min',
				status: 'completed',
				xp: 20,
				summary:
					'Operasi aritmatika khusus (//, %, **), operator logika (and, or, not), dan operator string.',
			},
			{
				id: 'py-les-3',
				number: 3,
				title: 'Aturan Penamaan Variabel, Assignment & Struktur Program',
				type: 'video',
				format: 'video',
				duration: '10 min',
				status: 'completed',
				score: '95/100',
				xp: 25,
				summary:
					'Aturan penamaan nama/variabel valid, instruksi assignment, dan struktur main() Python.',
			},
			{
				id: 'py-les-4',
				number: 4,
				title: 'Instruksi Input, Output & Formatting Output',
				type: 'article',
				format: 'article',
				duration: '12 min',
				status: 'current',
				xp: 35,
				summary:
					'Pembacaan input(), cetak print(), parameter end/sep, serta formatting integer dan float.',
			},
			{
				id: 'py-les-5',
				number: 5,
				title: 'Interactive Code Lab: Aksi Sekuensial & Algoritma Konversi',
				type: 'code',
				format: 'code',
				duration: '12 min',
				status: 'locked',
				xp: 30,
				summary:
					'Praktik penulisan algoritma sekuensial untuk tukar variabel dan konversi waktu/detik.',
			},
			{
				id: 'py-les-6',
				number: 6,
				title: 'Refleksi Diri & Evaluasi Pemrograman Sederhana',
				type: 'reflection',
				format: 'reflection',
				duration: '8 min',
				status: 'locked',
				xp: 30,
				summary:
					'Evaluasi metakognisi dan penyelesaian latihan studi kasus (mata uang, suhu, pecahan uang).',
			},
		],
	},
};

// Aliases for registry lookups (e.g., 'mod-1' -> 'mod-arch-101')
MODULE_DATA_REGISTRY['mod-1'] = MODULE_DATA_REGISTRY['mod-arch-101'];
MODULE_DATA_REGISTRY['1'] = MODULE_DATA_REGISTRY['mod-arch-101'];

/**
 * Fallback module generator if non-registered ID is visited
 */
export const getModuleData = (moduleId) => {
	if (MODULE_DATA_REGISTRY[moduleId]) {
		return MODULE_DATA_REGISTRY[moduleId];
	}

	// Generic fallback template for other IDs
	return {
		id: moduleId || 'mod-default',
		title: 'Microlearning Mastery & Technical Foundations',
		learningPath: 'Web Development & Modern Engineering',
		learningPathId: 'lp-1',
		category: 'Software Engineering',
		level: 'Menengah',
		duration: '40 Menit',
		durationMinutes: 40,
		totalLessons: 5,
		completedLessons: 2,
		progressPercent: 40,
		currentLessonId: 'les-3',
		currentLessonTitle: 'Lesson 3: Core Implementation & Best Practices',
		xpReward: 120,
		passingScore: 75,
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
		lessons: MODULE_LESSONS_DATA,
	};
};
