import { useMemo } from 'react';
import { Calendar, LayoutGrid, Users, Clock } from 'lucide-react';
import { calculateTotalDuration, formatDate } from '@/utils/dateUtils';

const SessionSummary = ({ summary, days, timezone = 'WIB' }) => {
	// Data dummy default agar tampilannya langsung sama persis seperti di gambar.
	// Nanti kamu bisa mengganti ini dengan data asli dari props API kamu.

	const defaultSummary = {
		totalHari: 3,
		totalSesi: 3,
		pembicara: 5,
		totalDurasi: '4j 30m',
	};

	const summaryData = useMemo(() => {
		const totalHari = days.length;
		const allSessions = days.flatMap((day) => day.sessions || []);
		const totalSesi = allSessions.length;

		const totalDurasi = calculateTotalDuration(allSessions);

		return {
			totalHari,
			totalSesi,
			pembicara: 5,
			totalDurasi,
		};
	}, [days]);

	const sessions = days.sessions || [];
	console.log('test', days, sessions);

	const defaultDays = days || [
		{ id: 1, title: 'Hari 1', date: 'Sel, 18 Agu 2026', sessions: 3, duration: '4j 30m' },
		{ id: 2, title: 'Hari 2', date: 'Kam, 20 Agu 2026', sessions: 0, duration: null },
		{ id: 3, title: 'Hari 3', date: 'Sab, 5 Sep 2026', sessions: 0, duration: null },
	];

	const summaryItems = [
		{ icon: Calendar, label: 'Total Hari', value: summaryData.totalHari },
		{ icon: LayoutGrid, label: 'Total Sesi', value: summaryData.totalSesi },
		{ icon: Users, label: 'Pembicara', value: summaryData.pembicara },
		{ icon: Clock, label: 'Total Durasi', value: summaryData.totalDurasi },
	];

	return (
		<div style={{ width: '300px' }} className="bg-white border rounded-2">
			<div className="p-4">
				{/* BAGIAN 1: RINGKASAN */}
				<p className="text-uppercase text-muted fw-bold mb-3 fs-5">Ringkasan</p>

				{/* BAGIAN 2: ZONA WAKTU */}
				<div
					className="d-flex align-items-center gap-2 p-2 mb-3 rounded-3 border"
					style={{ backgroundColor: '#f8fafc' }} // Warna biru-abu sangat terang
				>
					<Clock size={16} className="text-muted ms-2" strokeWidth={1.5} />
					<span className="text-muted" style={{ fontSize: '0.85rem' }}>
						Zona waktu:
					</span>
					<span className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
						{timezone}
					</span>
				</div>

				<div className="d-flex flex-column gap-3 mb-4">
					{summaryItems.map((item, idx) => (
						<div key={idx} className="d-flex align-items-center gap-3">
							<div
								className="bg-white border rounded d-flex align-items-center justify-content-center flex-shrink-0"
								style={{ width: '36px', height: '36px' }}
							>
								<item.icon size={16} className="text-muted" />
							</div>
							<div>
								<p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
									{item.label}
								</p>
								<p
									className="fw-bold mb-0 text-dark"
									style={{ fontSize: '0.95rem' }}
								>
									{item.value}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* BAGIAN 3: PER HARI */}
				<p className="text-uppercase text-muted fw-bold pt-6 mb-3 fs-5">Per Hari</p>

				<div className="d-flex flex-column gap-3">
					{days.map((day, i) => {
						var sessions = day.sessions || [];
						return (
							<div key={day.id || i}>
								<div className="d-flex justify-content-between align-items-center mb-1">
									<span className="text-dark fs-4 fw-semibold">
										Hari {day.day_number}
									</span>
									<span className="text-dark fs-4 fw-semibold">
										{sessions.length} sesi
									</span>
								</div>
								<div className="d-flex justify-content-between align-items-center">
									<span className="text-muted fs-5">{formatDate(day.date)}</span>
									{day.duration && (
										<span className="text-muted fs-5">
											{calculateTotalDuration(sessions)}
										</span>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default SessionSummary;
