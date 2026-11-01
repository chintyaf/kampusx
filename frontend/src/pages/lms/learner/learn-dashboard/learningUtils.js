// Helper bersama untuk komponen Learning Dashboard.

// Tabel 3.6 laporan: pemetaan Readiness Score (0–1) → Readiness Level.
export const READINESS_LEVELS = {
	belum_siap: {
		label: 'Belum Siap',
		tone: 'danger',
		action: 'Ulangi materi atau ikuti remedial sebelum mengerjakan kuis kembali.',
	},
	cukup_siap: {
		label: 'Cukup Siap',
		tone: 'warning',
		action: 'Perkuat dengan materi pendukung sebelum melanjutkan pembelajaran.',
	},
	siap: {
		label: 'Siap',
		tone: 'success',
		action: 'Kamu siap melanjutkan ke materi berikutnya.',
	},
};

export const getReadinessLevel = (score) =>
	score < 0.5 ? 'belum_siap' : score < 0.75 ? 'cukup_siap' : 'siap';

// Tiga fase Self-Regulated Learning (Gambar 3.2 laporan).
export const SRL_PHASES = [
	{ key: 'forethought', label: 'Forethought', hint: 'Rencanakan', icon: 'target' },
	{ key: 'performance', label: 'Performance', hint: 'Pelajari', icon: 'activity' },
	{ key: 'reflection', label: 'Self-Reflection', hint: 'Evaluasi', icon: 'refresh' },
];

export const GOAL_STATUS = {
	tercapai: { label: 'Tercapai', tone: 'success', icon: 'check-circle' },
	sebagian: { label: 'Sebagian', tone: 'warning', icon: 'activity' },
	belum: { label: 'Belum', tone: 'danger', icon: 'alert' },
};

export const scoreText = (n, digits = 2) => Number(n).toFixed(digits).replace('.', ',');

export const formatMinutes = (min) => {
	const total = Math.round(min);
	const h = Math.floor(total / 60);
	const m = total % 60;
	if (h && m) return `${h} jam ${m} menit`;
	if (h) return `${h} jam`;
	return `${m} menit`;
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const formatSessionDate = (iso) => {
	const d = new Date(iso);
	const diff = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
	const time = d
		.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
		.replace('.', ':');
	if (diff <= 0) return `Hari ini, ${time}`;
	if (diff === 1) return `Kemarin, ${time}`;
	return `${diff} hari lalu, ${time}`;
};

// Total menit belajar per hari untuk 7 hari terakhir (urut lama → hari ini).
export const getWeeklyStudyMinutes = (sessions = []) =>
	Array.from({ length: 7 }, (_, i) => {
		const d = new Date();
		d.setDate(d.getDate() - (6 - i));
		const minutes = sessions
			.filter((s) => new Date(s.startedAt).toDateString() === d.toDateString())
			.reduce((t, s) => t + s.performance.accumulatedSeconds / 60, 0);
		return { label: d.toLocaleDateString('id-ID', { weekday: 'short' }), minutes };
	});
