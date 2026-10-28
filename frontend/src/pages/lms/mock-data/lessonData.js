import { mockLessonMicroQuizzes } from './microQuizData';

export const MODULE_LESSONS_DATA = [
	{
		id: 'les-1',
		number: 1,
		moduleId: 'mod-dp-101',
		moduleName: 'Dasar Pemrograman: Tipe Data & Program Sederhana',
		title: 'Konsep Dasar Pemrograman & Tipe Data Utama',
		type: 'text',
		format: 'text',
		duration: '10 min',
		xp: 25,
		status: 'completed',
		summary:
			'Memahami arsitektur Stored Program Computer serta konsep tipe data dasar.',
		contentUrl: '/content-lesson/lesson_01.html', // 👈 Cukup panggil path-nya di sini
		codeSnippet: `# File: ContohDeklarasiData.py
def main():
    Radius = 10
    print(Radius)`,
		microQuiz: mockLessonMicroQuizzes['les-1'] || [],
	},
	{
		id: 'les-2',
		number: 2,
		moduleId: 'mod-dp-101',
		moduleName: 'Dasar Pemrograman: Tipe Data & Program Sederhana',
		title: 'Tipe Data Logika (Boolean) & Operator Relasional',
		type: 'text',
		format: 'text',
		duration: '8 min',
		xp: 20,
		status: 'completed',
		summary:
			'Penerapan operator logika dan operator relasional pada tipe data numerik.',
		contentUrl: '/content-lesson/lesson_02.html',
		codeSnippet: `x = True\ny = False\nprint(x and y)`,
		microQuiz: mockLessonMicroQuizzes['les-2'] || [],
	},
	{
		id: 'les-3',
		number: 3,
		moduleId: 'mod-dp-101',
		moduleName: 'Dasar Pemrograman: Tipe Data & Program Sederhana',
		title: 'Aturan Penamaan Variabel & Assignment Nilai',
		type: 'text',
		format: 'text',
		duration: '7 min',
		xp: 30,
		status: 'completed',
		summary:
			'Aturan pembuatan identifikasi nama variabel yang valid serta instruksi assignment.',
		contentUrl: '/content-lesson/lesson_03.html',
		codeSnippet: `nilaiA = 250\nnilaiB = nilaiA`,
		microQuiz: mockLessonMicroQuizzes['les-3'] || [],
	},
	{
		id: 'les-4',
		number: 4,
		moduleId: 'mod-dp-101',
		moduleName: 'Dasar Pemrograman: Tipe Data & Program Sederhana',
		title: 'Instruksi Input, Output, dan Formatting Tampilan',
		type: 'text',
		format: 'text',
		duration: '12 min',
		xp: 35,
		status: 'current',
		summary:
			'Penggunaan fungsi input() dan print() serta opsi pengaturan tampilan.',
		contentUrl: '/content-lesson/lesson_04.html',
		codeSnippet: `nama = input("Ketikkan nama: ")`,
		microQuiz: mockLessonMicroQuizzes['les-4'] || [],
	},
	{
		id: 'les-5',
		number: 5,
		moduleId: 'mod-dp-101',
		moduleName: 'Dasar Pemrograman: Tipe Data & Program Sederhana',
		title: 'Struktur Program Sekuensial & Algoritma Tukar Nilai',
		type: 'text',
		format: 'text',
		duration: '10 min',
		xp: 30,
		status: 'locked',
		summary:
			'Struktur kendali sekuensial dan teknik penukaran nilai antara dua variabel.',
		contentUrl: '/content-lesson/lesson_05.html',
		codeSnippet: `t = x\nx = y\ny = t`,
		microQuiz: mockLessonMicroQuizzes['les-5'] || [],
	},
	{
		id: 'les-6',
		number: 6,
		moduleId: 'mod-dp-101',
		moduleName: 'Dasar Pemrograman: Tipe Data & Program Sederhana',
		title: 'Studi Kasus Konversi Detik ke Jam, Menit, & Sisa Detik',
		type: 'text',
		format: 'text',
		duration: '8 min',
		xp: 30,
		status: 'locked',
		summary:
			'Penerapan operator pembagian bulat (//) dan modulo (%) dalam perhitungan detik.',
		contentUrl: '/content-lesson/lesson_06.html',
		codeSnippet: `J = Detik // 3600\nSisa = Detik % 3600`,
		microQuiz: mockLessonMicroQuizzes['les-6'] || [],
	},
];

export const getLessonData = (lessonId) => {
	const found = MODULE_LESSONS_DATA.find((l) => l.id === lessonId);
	return found || MODULE_LESSONS_DATA[0];
};