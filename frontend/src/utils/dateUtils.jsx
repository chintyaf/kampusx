/**
 * Memformat tanggal dengan dukungan multi-bahasa (i18n).
 * @param {string} dateString - Tanggal yang akan diformat (misal: "2026-05-24").
 * @param {string} type - 'long' (Selasa, 24 Mei) atau 'short' (Sel, 24 Mei).
 * @param {string} locale - Kode bahasa ('id-ID' untuk Indo, 'en-US' untuk Inggris). Default: 'id-ID'.
 */
export const formatDate = (dateString, type = 'long', locale = 'id-ID') => {
	if (!dateString) return '';

	const dateObj = new Date(dateString);

	// Konfigurasi panjang/pendeknya format
	const options =
		type === 'long'
			? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
			: { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };

	// Gunakan parameter locale yang dikirim
	return dateObj.toLocaleDateString(locale, options);
};

/**
 * Menghitung total durasi dari sekumpulan sesi
 * @param {Array} sessions - Array of session objects yang memiliki startTime dan endTime
 * @returns {string} - Format "Xj Ym" (contoh: "4j 30m" atau "2j" atau "45m")
 */
export const calculateTotalDuration = (sessions) => {
	if (!sessions || sessions.length === 0) return '0m';

	// 1. Kelompokkan sesi berdasarkan hari/tanggal
	// Ganti 's.date' dengan properti yang sesuai di data kamu (misal: s.dayId, s.tanggal)
	const sessionsByDate = sessions.reduce((acc, s) => {
		const dateKey = s.date || 'unknown_date';
		if (!acc[dateKey]) acc[dateKey] = [];
		acc[dateKey].push(s);
		return acc;
	}, {});

	let totalMinutesAllDays = 0;

	// 2. Loop untuk setiap hari dan hitung durasinya (termasuk merge bentrok)
	for (const dateKey in sessionsByDate) {
		const dailySessions = sessionsByDate[dateKey];

		// Ubah sesi di HARI INI menjadi rentang [start, end] dalam menit
		const intervals = dailySessions
			.map((s) => {
				const startParts = s.startTime.split(':');
				const endParts = s.endTime.split(':');
				let start = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10);
				let end = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);

				if (end < start) end += 24 * 60; // Handle tengah malam
				return [start, end];
			})
			// Urutkan berdasarkan waktu mulai terkecil
			.sort((a, b) => a[0] - b[0]);

		// Gabungkan rentang yang bentrok (Merge Overlapping Intervals) khusus hari ini
		const merged = [];
		if (intervals.length > 0) {
			let current = intervals[0];

			for (let i = 1; i < intervals.length; i++) {
				const next = intervals[i];

				if (next[0] <= current[1]) {
					// Ada bentrok! Perbarui waktu selesai ke yang paling lama
					current[1] = Math.max(current[1], next[1]);
				} else {
					// Tidak bentrok, simpan yang lama dan ganti ke yang baru
					merged.push(current);
					current = next;
				}
			}
			merged.push(current);
		}

		// Hitung total menit di HARI INI, lalu tambahkan ke total keseluruhan
		const dailyMinutes = merged.reduce((sum, [start, end]) => sum + (end - start), 0);
		totalMinutesAllDays += dailyMinutes;
	}

	// 3. Format Output
	const hours = Math.floor(totalMinutesAllDays / 60);
	const minutes = totalMinutesAllDays % 60;

	if (hours > 0 && minutes > 0) return `${hours}j ${minutes}m`;
	if (hours > 0) return `${hours}j`;
	if (minutes > 0) return `${minutes}m`;
	return '0m';
};
