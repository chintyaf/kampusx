// ============================================================================
// MICRO QUIZZES (Per-Lesson Assessment)
// ============================================================================

export const mockLessonMicroQuizzes = {
	'les-1': [
		{
			id: 'mq-1-1',
			question: 'Manakah penamaan URI RESTful yang mengikuti best practice industri?',
			options: [
				'GET /getAllUsersList',
				'POST /deleteUserById?id=12',
				'GET /api/v1/users',
				'POST /api/v1/users/createNew',
			],
			correctAnswer: 2,
			explanation:
				'Gunakan noun jamak (/users) untuk koleksi resource dan hindari kata kerja dalam URI.',
			xpReward: 15,
		},
		{
			id: 'mq-1-2',
			question: 'Mengapa URI harus bersifat stateless dalam arsitektur REST?',
			options: [
				'Agar server tidak perlu menyimpan status sesi antar request, sehingga mudah di-scale',
				'Agar database tidak perlu menyimpan user session',
				'Agar client bisa mengubah routing secara dinamis',
				'Agar token tidak perlu dikirim dalam HTTP header',
			],
			correctAnswer: 0,
			explanation:
				'Statelessness memastikan setiap request membawa semua informasi yang dibutuhkan server untuk mengeksekusinya.',
			xpReward: 15,
		},
	],
	'les-2': [
		{
			id: 'mq-2-1',
			question: 'HTTP Status Code apa yang paling tepat saat validasi payload form gagal?',
			options: [
				'400 Bad Request / 422 Unprocessable Content',
				'404 Not Found',
				'500 Internal Server Error',
				'401 Unauthorized',
			],
			correctAnswer: 0,
			explanation:
				'422 Unprocessable Content atau 400 Bad Request mengindikasikan payload sintaksis valid tetapi semantic validasi gagal.',
			xpReward: 15,
		},
		{
			id: 'mq-2-2',
			question: 'Apa format standard error yang didefinisikan oleh RFC 7807?',
			options: [
				'application/json dengan key status_code dan error_msg',
				'application/problem+json dengan field type, title, status, dan detail',
				'text/plain dengan stacktrace',
				'application/xml dengan tag <error>',
			],
			correctAnswer: 1,
			explanation:
				'RFC 7807 menstandarkan Problem Details dengan tipe application/problem+json.',
			xpReward: 15,
		},
	],
	'les-3': [
		{
			id: 'mq-3-1',
			question: 'Manakah kumpulan HTTP Method yang seluruhnya bersifat Idempotent?',
			options: [
				'POST, PUT, DELETE',
				'GET, PUT, DELETE, HEAD',
				'POST, PATCH, GET',
				'POST, GET, OPTIONS',
			],
			correctAnswer: 1,
			explanation:
				'GET, PUT, DELETE, HEAD, dan OPTIONS bersifat idempotent karena pengulangan request menghasilkan state server yang sama.',
			xpReward: 15,
		},
	],
	// 'les-4': [
	// 	{
	// 		id: 'mq-4-1',
	// 		question: 'Bagaimana Idempotency-Key mencegah duplikasi transaksi pembayaran?',
	// 		options: [
	// 			'Menolak setiap transaksi yang terjadi di bawah 1 detik',
	// 			'Menyimpan UUID unik di Redis; request dengan key yang sama mengembalikan cached response',
	// 			'Mengunci akun user selama proses pembayaran',
	// 			'Mengenkripsi saldo sebelum request dikirim',
	// 		],
	// 		correctAnswer: 1,
	// 		explanation:
	// 			'Idempotency-Key di-cache bersama responsnya. Jika koneksi terputus dan client mencoba lagi, respons yang sama dikembalikan tanpa menagih ulang.',
	// 		xpReward: 15,
	// 	},
	// ],
	// 'les-5': [
	// 	{
	// 		id: 'mq-5-1',
	// 		question:
	// 			'Komponen apa yang wajib disimpan bersama Idempotency-Key di caching layer (Redis)?',
	// 		options: [
	// 			'Hanya boolean status proses (success/fail)',
	// 			'HTTP status code, response headers, dan response body',
	// 			'Seluruh file log server',
	// 			'Password user yang di-hash',
	// 		],
	// 		correctAnswer: 1,
	// 		explanation:
	// 			'Status code, headers relevan, dan payload response harus disimpan agar replika respons identik dapat dikirim ulang.',
	// 		xpReward: 15,
	// 	},
	// ],
	// 'les-6': [
	// 	{
	// 		id: 'mq-6-1',
	// 		question: 'Pada fase Self-Regulated Learning (SRL), kapan evaluasi hasil pemahaman dilakukan?',
	// 		options: [
	// 			'Forethought Phase',
	// 			'Performance Phase',
	// 			'Self-Reflection Phase',
	// 			'Preparation Phase',
	// 		],
	// 		correctAnswer: 2,
	// 		explanation:
	// 			'Self-Reflection Phase berfokus pada metakognisi, self-assessment nilai, dan formulasi adaptasi untuk sesi belajar berikutnya.',
	// 		xpReward: 15,
	// 	},
	// ],
};
