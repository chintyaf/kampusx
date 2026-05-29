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

		// Filter sesi yang tidak valid, lalu ubah menjadi rentang [start, end] dalam menit
		const intervals = dailySessions
			// --- BAGIAN YANG DITAMBAHKAN ---
			// Abaikan jika startTime/endTime tidak ada, atau formatnya salah (tidak ada ':')
			.filter(
				(s) =>
					s.startTime &&
					s.endTime &&
					s.startTime.includes(':') &&
					s.endTime.includes(':'),
			)
			// -------------------------------
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

/**
 * Memformat tanggal event dengan format "Tue 10th Mar 2026, 3:00 pm WIT"
 * @param {string} dateStr - String tanggal dari API (contoh: "10 Mar 2026, 15:00")
 * @param {string} timezoneStr - Zona waktu, default: 'WIT'
 * @returns {string} - Tanggal terformat
 */
export const formatEventDate = (dateStr, timezoneStr = 'WIT') => {
	if (!dateStr) return '';
	const regex = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4}),\s+(\d{1,2}):(\d{2})$/;
	const match = dateStr.match(regex);
	
	let dateObj;
	if (match) {
		const [_, day, monthStr, year, hour, minute] = match;
		const months = {
			jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5, jul: 6, ags: 7, agu: 7, sep: 8, okt: 9, nov: 10, des: 11,
			january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
		};
		const month = months[monthStr.toLowerCase()] !== undefined ? months[monthStr.toLowerCase()] : new Date(monthStr + " 1, 2000").getMonth();
		dateObj = new Date(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute));
	} else {
		dateObj = new Date(dateStr);
	}

	if (isNaN(dateObj.getTime())) {
		return dateStr;
	}

	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	
	const dayName = days[dateObj.getDay()];
	const dayNum = dateObj.getDate();
	const monthName = monthsList[dateObj.getMonth()];
	const yearNum = dateObj.getFullYear();
	
	let hours = dateObj.getHours();
	const minutes = String(dateObj.getMinutes()).padStart(2, '0');
	const ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12;
	
	let suffix = 'th';
	if (dayNum === 1 || dayNum === 21 || dayNum === 31) suffix = 'st';
	else if (dayNum === 2 || dayNum === 22) suffix = 'nd';
	else if (dayNum === 3 || dayNum === 23) suffix = 'rd';
	
	return `${dayName} ${dayNum}${suffix} ${monthName} ${yearNum}, ${hours}:${minutes} ${ampm} ${timezoneStr}`;
};

/**
 * Memformat rentang tanggal untuk draf event (contoh: "28 - 29 Jun 2026")
 * @param {string} startStr - Tanggal mulai dari API
 * @param {string} endStr - Tanggal selesai dari API
 * @returns {string} - Rentang tanggal terformat
 */
export const formatDateRange = (startStr, endStr) => {
	if (!startStr) return endStr || '';
	if (!endStr) return startStr;
	
	const regex = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/;
	const startMatch = startStr.match(regex);
	const endMatch = endStr.match(regex);
	
	if (startMatch && endMatch) {
		const [_, sDay, sMonth, sYear] = startMatch;
		const [__, eDay, eMonth, eYear] = endMatch;
		
		if (sYear === eYear) {
			if (sMonth === eMonth) {
				if (sDay === eDay) {
					return `${sDay} ${sMonth} ${sYear}`;
				}
				return `${sDay} - ${eDay} ${sMonth} ${sYear}`;
			}
			return `${sDay} ${sMonth} - ${eDay} ${eMonth} ${sYear}`;
		}
		return `${sDay} ${sMonth} ${sYear} - ${eDay} ${eMonth} ${eYear}`;
	}
	
	return `${startStr} - ${endStr}`;
};

/**
 * Memeriksa apakah suatu tanggal sudah lewat dibanding waktu sekarang
 * @param {string} dateStr - String tanggal yang akan diperiksa
 * @returns {boolean} - True jika tanggal sudah lewat
 */
export const checkIfDatePassed = (dateStr) => {
	if (!dateStr) return false;
	const regex = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4}),\s+(\d{1,2}):(\d{2})$/;
	const match = dateStr.match(regex);
	let dateObj;
	if (match) {
		const [_, day, monthStr, year, hour, minute] = match;
		const months = {
			jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5, jul: 6, ags: 7, agu: 7, sep: 8, okt: 9, nov: 10, des: 11,
			january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
		};
		const month = months[monthStr.toLowerCase()] !== undefined ? months[monthStr.toLowerCase()] : new Date(monthStr + " 1, 2000").getMonth();
		dateObj = new Date(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute));
	} else {
		dateObj = new Date(dateStr);
	}
	if (isNaN(dateObj.getTime())) return false;
	return new Date() > dateObj;
};

