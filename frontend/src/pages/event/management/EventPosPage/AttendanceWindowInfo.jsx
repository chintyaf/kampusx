import React from 'react';
import { Clock } from 'lucide-react';

/**
 * Component: AttendanceWindowInfo
 * Displays a clean operational banner with the active time bounds allowed for
 * participant attendance check-in/out.
 * 
 * @param {Object} event - The main event object details
 */
const AttendanceWindowInfo = ({ event }) => {
	// Helper to format date cleanly
	const formatDateTime = (dateObjOrStr) => {
		if (!dateObjOrStr) return '-';
		const date = dateObjOrStr instanceof Date
			? dateObjOrStr
			: new Date((dateObjOrStr.includes('T') ? dateObjOrStr : dateObjOrStr.replace(' ', 'T')) + 'Z');
		return date.toLocaleString('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	// Calculate start time and end time window dynamically (30 minutes start buffer)
	const getAttendanceWindow = () => {
		if (!event || !event.start_date || !event.end_date) return null;

		const startDate = new Date(event.start_date.replace(' ', 'T') + 'Z');
		const endDate = new Date(event.end_date.replace(' ', 'T') + 'Z');

		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

		// Presensi opens 30 minutes before the actual event start time
		const allowedStart = new Date(startDate.getTime() - 30 * 60 * 1000);

		return {
			start: allowedStart,
			end: endDate
		};
	};

	const windowTimes = getAttendanceWindow();

	if (!event || !windowTimes) return null;

	return (
		<div className="bg-white border-start border-primary border-4 rounded-3 p-3 d-flex align-items-center gap-3 shadow-none border" style={{ borderLeft: '4px solid #1A365D' }}>
			{/* Icon Box */}
			<div style={{
				width: '40px',
				height: '40px',
				borderRadius: '8px',
				backgroundColor: 'rgba(26, 54, 93, 0.1)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				color: '#1A365D',
				flexShrink: 0
			}}>
				<Clock size={20} />
			</div>

			{/* Text info layout */}
			<div>
				<div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
					Rongga Waktu Presensi Aktif (Attendance Window)
				</div>
				<div className="text-muted mt-0.5" style={{ fontSize: '0.82rem' }}>
					Scanner hanya dapat memproses QR pada: <span className="fw-semibold text-primary">{formatDateTime(windowTimes.start.toISOString())}</span> s/d <span className="fw-semibold text-danger">{formatDateTime(windowTimes.end.toISOString())}</span> ({event.timezone || 'WIB'})
				</div>
			</div>
		</div>
	);
};

export default AttendanceWindowInfo;
