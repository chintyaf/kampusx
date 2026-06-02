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
	// Robust helper to safely parse any date string or Date object
	const safeParseDate = (value) => {
		if (!value) return null;
		if (value instanceof Date) {
			return isNaN(value.getTime()) ? null : value;
		}

		let str = String(value).trim();

		// Replace space with 'T' if it is a standard date string format
		if (!str.includes('T') && str.includes(' ')) {
			str = str.replace(' ', 'T');
		}

		// Ensure we don't duplicate 'Z' or timezone offsets
		const hasTimezone = str.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(str);
		if (!hasTimezone) {
			str = str + 'Z';
		}

		const date = new Date(str);
		return isNaN(date.getTime()) ? null : date;
	};

	// Helper to format date cleanly
	const formatDateTime = (dateObjOrStr) => {
		const date = safeParseDate(dateObjOrStr);
		if (!date) return '-';
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

		const startDate = safeParseDate(event.start_date);
		const endDate = safeParseDate(event.end_date);

		if (!startDate || !endDate) return null;

		// Presensi opens 30 minutes before the actual event start time
		const allowedStart = new Date(startDate.getTime() - 30 * 60 * 1000);

		return {
			start: allowedStart,
			end: endDate
		};
	};

	const windowTimes = getAttendanceWindow();

	if (!event || !windowTimes) return null;

	const isExpired = new Date() > windowTimes.end;

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
					Rentang Waktu Presensi Aktif
				</div>
				<div className="text-muted mt-0.5" style={{ fontSize: '0.82rem' }}>
					Scanner hanya dapat memproses QR pada: <span className="fw-semibold text-primary">{formatDateTime(windowTimes.start)}</span> s/d <span className={`fw-semibold ${isExpired ? 'text-danger' : 'text-dark'}`}>{formatDateTime(windowTimes.end)}</span> ({event.timezone || 'WIB'})
					{isExpired && <span className="text-danger ms-2 fw-semibold">(Sudah Berakhir)</span>}
				</div>
			</div>
		</div>
	);
};

export default AttendanceWindowInfo;
