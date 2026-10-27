import { mockLessonMicroQuizzes } from './microQuizData';

// ============================================================================
// CURATED LESSONS (Multi-Unit Lesson Content for Lesson Viewer & Modules)
// Data disesuaikan dari materi Tipe Data[cite: 1] dan Program Sederhana[cite: 17]
// ============================================================================

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
			'Memahami arsitektur Stored Program Computer (Input, Process, Output, Storage)[cite: 2] serta konsep tipe data dasar seperti Boolean, Integer, Float, Karakter, dan String.',
		codeSnippet: `# File: ContohDeklarasiData.py[cite: 14]
# Program Deklarasi Data Tipe Dasar[cite: 4]
def main():
    Radius = 10                  # Integer[cite: 7, 14]
    LuasLingk = 22/7 * (10/2)**2 # Float[cite: 9, 14]
    Ketemu = True                # Boolean[cite: 5, 14]
    Nama = "Maranatha"           # String[cite: 12, 14]
    Gender = 'L'                 # String/Char[cite: 11, 14]

    print(Radius)[cite: 14]
    print(LuasLingk)[cite: 14]
    print(Ketemu)[cite: 14]
    print(Nama)[cite: 14]
    print(Gender)[cite: 14]
    return 0[cite: 14]

if __name__ == '__main__':[cite: 14]
    main()[cite: 14]`,
		microQuiz: mockLessonMicroQuizzes['les-1'] || [],
		questions: [
			{
				id: 1,
				question: 'Tipe data manakah yang mempunyai domain harga True dan False?',
				options: [
					'Integer',
					'Float',
					'Boolean',
					'String',
				],
				correctAnswer: 2,
			},
		],
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
			'Penerapan operator logika (and, or, not)[cite: 5] dan operator relasional (<, <=, >, >=, ==, !=)[cite: 8, 10, 11] pada tipe data numerik dan karakter.',
		codeSnippet: `# Operasi Logika (Boolean)[cite: 5, 6]
x = True[cite: 5]
y = False[cite: 5]

print(x and y)   # Hasil: False[cite: 6]
print(x or y)    # Hasil: True[cite: 6]
print(not x)     # Hasil: False[cite: 6]

# Operator Aritmatika & Relasional Integer[cite: 7, 8]
print(10 // 3)   # Hasil: 3 (Bagi integer)[cite: 7]
print(10 % 3)    # Hasil: 1 (Sisa bagi/Modulo)[cite: 7]
print('a' < 'c') # Hasil: True (Relasional Karakter)[cite: 11]`,
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
			'Aturan pembuatan identifikasi nama variabel yang valid[cite: 19, 20] serta instruksi assignment untuk menyimpan nilai ke dalam variabel[cite: 21, 22].',
		codeSnippet: `# Aturan Penamaan Variabel[cite: 19, 20]
# Contoh Benar: DataKe1, Data_1[cite: 20]
# Contoh Salah: $Data, Data 1, Data-1, input[cite: 20]

# Instruksi Assignment[cite: 22]
nilaiA = 250         # Assignment dari konstanta integer[cite: 22]
nilaiy = 20.5        # Assignment dari konstanta float[cite: 22]
nilaiB = nilaiA      # Assignment dari nama variabel lain[cite: 22]
nilaiC = nilaiA + nilaiB # Assignment dari hasil ekspresi[cite: 22]`,
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
			'Penggunaan fungsi input()[cite: 23] dan print()[cite: 24] serta opsi pengaturan tampilan layar menggunakan sep, end[cite: 25, 26], dan format numerik[cite: 27, 28].',
		codeSnippet: `# Perintah Input[cite: 23]
nama = input("Ketikkan nama: ")[cite: 23]
nilaiC = int(input("Masukkan nilai C: "))[cite: 23]
nilaiX = float(input("Masukkan nilai X: "))[cite: 23]

# Perintah Output & Formatting[cite: 25, 26, 28]
print("Hello from", nama, "!", sep="")[cite: 26]
print("Nilai X formatted: {0:4.2f}".format(nilaiX))[cite: 28]`,
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
			'Struktur kendali sekuensial (eksekusi berurutan)[cite: 36] dan teknik penukaran nilai antara dua variabel menggunakan variabel bantu.',
		codeSnippet: `# File: Tukar.py - Program Tukar Isi Variabel[cite: 39]
def main():[cite: 39]
    x = int(input("Nilai x :"))[cite: 39]
    y = int(input("Nilai y :"))[cite: 39]
    print("Sebelum Tukar -> Nilai x:", x, "Nilai y:", y)[cite: 39]
    
    # Proses Tukar menggunakan variabel sementara (t)[cite: 39]
    t = x[cite: 39]
    x = y[cite: 39]
    y = t[cite: 39]

    print("Setelah Tukar -> Nilai x:", x, "Nilai y:", y)[cite: 39]

if __name__ == '__main__':[cite: 39]
    main()[cite: 39]`,
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
			'Penerapan operator pembagian bulat (//) dan modulo (%) dalam persoalan perhitungan jam, menit, dan sisa detik[cite: 43, 44].',
		codeSnippet: `# File: KonversiDetik.py
# Program Konversi Detik[cite: 44]
def main():[cite: 44]
    Detik = int(input(" Input Detik :"))[cite: 44]
    J = Detik // 3600[cite: 44]
    Sisa = Detik % 3600[cite: 44]
    M = Sisa // 60[cite: 44]
    D = Sisa % 60[cite: 44]

    print("Hasil konversi", Detik, "detik")[cite: 44]
    print("Nilai Jam   :", J)[cite: 44]
    print("Nilai Menit :", M)[cite: 44]
    print("Nilai Detik :", D)[cite: 44]

if __name__ == '__main__':[cite: 44]
    main()[cite: 44]`,
		microQuiz: mockLessonMicroQuizzes['les-6'] || [],
	},
];

/**
 * Helper to look up a lesson by ID with graceful fallback
 */
export const getLessonData = (lessonId) => {
	const found = MODULE_LESSONS_DATA.find((l) => l.id === lessonId);
	return found || MODULE_LESSONS_DATA[0];
};