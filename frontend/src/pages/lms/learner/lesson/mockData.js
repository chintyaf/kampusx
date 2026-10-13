// ============================================================================
// MOCK DATA: Micro Quizzes
// ============================================================================
export const mockLessonMicroQuizzes = {
	'les-1': [],
	'les-2': [],
	'les-3': [],
	'les-4': [],
	'les-5': [],
	'les-6': [],
};

// ============================================================================
// MOCK DATA: Curated Multi-Unit Lessons for Lesson Viewer
// ============================================================================
export const MODULE_LESSONS_DATA = [
	{
		id: 'les-1',
		number: 1,
		title: 'Fondasi RESTful Semantic & URI Naming Convention',
		type: 'video',
		duration: '10 min',
		xp: 25,
		videoDuration: '10:00',
		videoUrl:
			'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
		summary:
			'Pelajari prinsip keterbacaan URI dalam arsitektur REST, pemisahan resource koleksi dengan resource singular, dan penggunaan HTTP methods yang tepat.',
		codeSnippet: `// ❌ Bad Practice:
GET /getUsers
POST /deleteUser/123

// ✅ Good RESTful Practice:
GET    /api/v1/users        // Ambil daftar users
POST   /api/v1/users        // Buat user baru
GET    /api/v1/users/:id    // Ambil detail user
DELETE /api/v1/users/:id    // Hapus user`,
		microQuiz: mockLessonMicroQuizzes['les-1'] || [],
	},
	{
		id: 'les-2',
		number: 2,
		title: 'HTTP Status Codes, Error Handling & RFC 7807',
		type: 'article',
		duration: '8 min',
		xp: 20,
		videoDuration: '08:00',
		videoUrl:
			'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
		summary:
			'Standardisasi format pesan error response menggunakan RFC 7807 Problem Details for HTTP APIs.',
		codeSnippet: `// Standard RFC 7807 JSON Error Response
{
  "type": "https://api.kampusx.id/errors/insufficient-credits",
  "title": "Insufficient Balance",
  "status": 403,
  "detail": "Saldo kuota belajar Anda tidak mencukupi untuk request ini.",
  "instance": "/orders/req-99124"
}`,
		microQuiz: mockLessonMicroQuizzes['les-2'] || [],
	},
	{
		id: 'les-3',
		number: 3,
		title: 'Diagnostic Checkpoint: REST Principles Assessment',
		type: 'quiz',
		duration: '7 min',
		xp: 30,
		videoDuration: '07:00',
		videoUrl:
			'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=1200&q=80',
		summary:
			'Uji pemahaman mandiri konsep HTTP idempotency, caching headers, dan RESTful URI conventions.',
		codeSnippet: `// Evaluasi Checkpoint:
// GET & DELETE bersifat Idempotent (Multiple identical requests = Same server state)
// POST bersifat Non-Idempotent (Creating multiple resources on repeat)`,
		microQuiz: mockLessonMicroQuizzes['les-3'] || [],
	},
	{
		id: 'les-4',
		number: 4,
		title: 'Scalable Endpoints, Idempotency & Rate Limiting',
		type: 'video',
		duration: '12 min',
		xp: 35,
		videoDuration: '12:30',
		videoUrl:
			'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
		summary:
			'Dalam lesson ini, kita akan membahas teknik mitigasi double-payment dengan Idempotency Keys di Redis dan algoritma Token Bucket untuk rate-limiting endpoint API.',
		codeSnippet: `// Contoh Header Idempotency pada Pembayaran:
POST /api/v1/payments/charge
Host: api.kampusx.id
Idempotency-Key: a48b7762-2df0-4e2b-bfe9-6231d683a31c
Content-Type: application/json

{
  "amount": 250000,
  "currency": "IDR",
  "reference_id": "ORD-2026-X1"
}`,
		microQuiz: mockLessonMicroQuizzes['les-4'] || [],
	},
	{
		id: 'les-5',
		number: 5,
		title: 'Interactive Code Lab: Implementing Idempotency Middleware',
		type: 'code',
		duration: '10 min',
		xp: 30,
		videoDuration: '10:00',
		videoUrl:
			'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
		summary:
			'Implementasikan middleware validasi Idempotency Key dengan fallback database lock and cache response.',
		codeSnippet: `async function idempotencyMiddleware(req, res, next) {
  const key = req.headers['idempotency-key'];
  if (!key) return next();

  const cached = await redis.get(\`idemp:\${key}\`);
  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }
  // Proceed and cache response
  next();
}`,
		microQuiz: mockLessonMicroQuizzes['les-5'] || [],
	},
	{
		id: 'les-6',
		number: 6,
		title: 'Refleksi Diri SRL & Ringkasan Modul REST API',
		type: 'reflection',
		duration: '8 min',
		xp: 30,
		videoDuration: '08:00',
		videoUrl:
			'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
		summary:
			'Refleksi komprehensif, evaluasi metakognisi pembelajaran mandiri, dan sertifikasi penyelesaian modul.',
		codeSnippet: `// Metakognisi SRL:
// 1. Apakah strategi Active Note-Taking berhasil meningkatkan pemahamanmu?
// 2. Bagaimana kamu akan menerapkan prinsip Idempotency pada proyekmu selanjutnya?`,
		microQuiz: mockLessonMicroQuizzes['les-6'] || [],
	},
];
