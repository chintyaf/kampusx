import React from 'react';
import { User, Hash, QrCode, Sparkles, Calendar, Building2, Type } from 'lucide-react';

export const FIELDS = [
	{
		id: 'f1',
		label: 'Nama Peserta',
		key: '{ Nama Peserta }',
		icon: <User size={16} />,
		example: 'Budi Santoso',
	},
	{
		id: 'f2',
		label: 'ID Sertifikat',
		key: '{ ID Sertifikat }',
		icon: <Hash size={16} />,
		example: 'CERT-2026-00123',
	},
	{
		id: 'f3',
		label: 'QR Code',
		key: '{ QR Code }',
		icon: <QrCode size={16} />,
		example: 'Kode verifikasi',
	},
	{
		id: 'f4',
		label: 'Nama Event',
		key: '{ Nama Event }',
		icon: <Sparkles size={16} />,
		example: 'AI & Tech Summit 2026',
	},
	{
		id: 'f5',
		label: 'Tanggal',
		key: '{ Tanggal }',
		icon: <Calendar size={16} />,
		example: '18–20 Agustus 2025',
	},
	{
		id: 'f6',
		label: 'Instansi',
		key: '{ Instansi }',
		icon: <Building2 size={16} />,
		example: 'Universitas Teknologi',
	},
	{
		id: 'f7',
		label: 'Teks Kustom',
		key: '{ Kustom }',
		icon: <Type size={16} />,
		example: 'Teks bebas...',
	},
];

export const INITIAL_ELEMENTS = [
	{
		id: 'ce1',
		fieldId: 'f1',
		label: '{ Nama Peserta }',
		x: 50,
		y: 46,
		fontSize: 24,
		bold: true,
		color: '#0f172a',
	},
	{
		id: 'ce2',
		fieldId: 'f2',
		label: '{ ID Sertifikat }',
		x: 50,
		y: 56,
		fontSize: 12,
		bold: false,
		color: '#6c757d',
	},
];

export const FONT_SIZES = [10, 12, 14, 16, 20, 24, 28];
export const COLORS = ['#0f172a', '#0d6efd', '#1e3a5f', '#6c757d', '#ffffff', '#fd7e14', '#198754'];

export const QR_PATTERN = Array.from({ length: 25 }, (_, i) =>
	[0, 1, 3, 5, 6, 7, 10, 12, 14, 17, 18, 19, 21, 23, 24].includes(i),
);
