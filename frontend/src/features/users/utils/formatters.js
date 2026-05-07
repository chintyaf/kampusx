import { AVATAR_COLORS } from '../data/mockUsers';

export function getInitials(name) {
	return name
		.split(' ')
		.map((w) => w[0])
		.slice(0, 2)
		.join('')
		.toUpperCase();
}

export function getAvatarColor(name) {
	let h = 0;
	for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xff;
	return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function fmtDate(d) {
	return new Date(d).toLocaleDateString('id-ID', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
}
