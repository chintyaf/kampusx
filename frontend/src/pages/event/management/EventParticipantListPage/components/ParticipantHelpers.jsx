import React from 'react';
import { CalendarX, LogOut, LogIn } from 'lucide-react';

export const ATTENDANCE_FILTERS = [
	{ value: '', label: 'Semua Status' },
	{ value: 'not_attended', label: 'Belum Hadir' },
	{ value: 'checked_in', label: 'Sudah Check-in' },
	{ value: 'checked_out', label: 'Sudah Check-out' },
];

const AVATAR_COLORS = [
	{ bg: '#dff3ff', text: '#00699e' },
	{ bg: '#dcfce7', text: '#166534' },
	{ bg: '#fef3c7', text: '#92400e' },
	{ bg: '#fce7f3', text: '#9d174d' },
	{ bg: '#ede9fe', text: '#4c1d95' },
	{ bg: '#fee2e2', text: '#991b1b' },
];

export const maskEmail = (email) => {
	if (!email) return '-';
	const [user, domain] = email.split('@');
	if (!domain) return email;
	const visible = user.slice(0, Math.min(3, user.length));
	return `${visible}***@${domain}`;
};

export const maskPhone = (phone) => {
	if (!phone) return '-';
	const digits = phone.replace(/\D/g, '');
	if (digits.length < 6) return '***';
	return digits.slice(0, 3) + ' **** ' + digits.slice(-3);
};

export const getAttendanceStatus = (ticket) => {
	const log = ticket.attendance_log;
	if (!log || !log.scan_time) {
		return {
			key: 'not_attended',
			label: 'Belum Hadir',
			className: 'attendance-badge attendance-badge--absent',
			icon: <CalendarX size={11} />,
		};
	}
	if (log.checkout_time) {
		return {
			key: 'checked_out',
			label: 'Selesai',
			className: 'attendance-badge attendance-badge--checkout',
			icon: <LogOut size={11} />,
		};
	}
	return {
		key: 'checked_in',
		label: 'Hadir',
		className: 'attendance-badge attendance-badge--checkin',
		icon: <LogIn size={11} />,
	};
};

export const fmtTime = (isoStr) => {
	if (!isoStr) return null;
	return new Date(isoStr).toLocaleTimeString('id-ID', {
		hour: '2-digit',
		minute: '2-digit',
	});
};

export const getInitials = (name = '') =>
	name
		.split(' ')
		.slice(0, 2)
		.map((w) => w[0])
		.join('')
		.toUpperCase();

export const getAvatarColor = (name = '') => {
	const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
	return AVATAR_COLORS[code % AVATAR_COLORS.length];
};
