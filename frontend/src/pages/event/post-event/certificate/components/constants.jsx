import React from 'react';
import { User, Hash, QrCode, Sparkles, Calendar, Building2, Type } from 'lucide-react';

export const FIELDS = [
	{
		id: 'f1',
		label: 'Nama Peserta',
		key: '{ Nama Peserta }',
		icon: <User size={16} />,
		example: 'Budi Santoso',
		required: true,
	},
	{
		id: 'f2',
		label: 'ID Sertifikat',
		key: '{ ID Sertifikat }',
		icon: <Hash size={16} />,
		example: 'CERT-2026-00123',
		required: false,
	},
	{
		id: 'f3',
		label: 'QR Code',
		key: '{ QR Code }',
		icon: <QrCode size={16} />,
		example: 'Kode verifikasi',
		required: true,
	},
	{
		id: 'f4',
		label: 'Nama Event',
		key: '{ Nama Event }',
		icon: <Sparkles size={16} />,
		example: 'AI & Tech Summit 2026',
		required: false,
	},
	{
		id: 'f5',
		label: 'Tanggal',
		key: '{ Tanggal }',
		icon: <Calendar size={16} />,
		example: '18–20 Agustus 2025',
		required: false,
	},
	{
		id: 'f6',
		label: 'Instansi',
		key: '{ Instansi }',
		icon: <Building2 size={16} />,
		example: 'Universitas Teknologi',
		required: false,
	},
	{
		id: 'f7',
		label: 'Teks Kustom',
		key: '{ Kustom }',
		icon: <Type size={16} />,
		example: 'Teks bebas...',
		required: false,
	},
];

export const INITIAL_ELEMENTS = [
	{
		id: 'ce1',
		fieldId: 'f1',
		label: '{ Nama Peserta }',
		x: 50,
		y: 46,
		fontSize: 64,
		bold: true,
		color: '#0f172a',
	},
	{
		id: 'ce2',
		fieldId: 'f2',
		label: '{ ID Sertifikat }',
		x: 50,
		y: 56,
		fontSize: 24,
		bold: false,
		color: '#6c757d',
	},
];

export const FONT_SIZES = [12, 16, 20, 24, 28, 36, 48, 64, 72, 80, 96, 120];
export const COLORS = [
	'#0f172a', // Slate Dark (Sangat bagus untuk teks utama, lebih elegan dari hitam murni)
	'#ffffff', // White (Teks di atas latar gelap atau sebaliknya)
	'#2563eb', // Royal Blue (Warna primer yang modern dan bersih)
	'#64748b', // Slate Gray (Untuk teks sekunder atau elemen netral)
	'#f59e0b', // Warm Amber (Sebagai aksen/highlight yang tidak menyilaukan)
	'#10b981', // Emerald Green (Untuk status sukses/positif yang segar)
];
export const FONTS = [
	{ name: 'Arial', family: 'Arial, sans-serif' },
	{ name: 'Georgia', family: 'Georgia, serif' },
	{ name: 'Times New Roman', family: 'Times New Roman, Times, serif' },
	{ name: 'Courier New', family: 'Courier New, monospace' },
	{ name: 'Montserrat', family: 'Montserrat, sans-serif' },
	{ name: 'Playfair Display', family: 'Playfair Display, serif' },
	{ name: 'Great Vibes', family: 'Great Vibes, cursive' },
	{ name: 'Cinzel', family: 'Cinzel, serif' },
	{ name: 'Alex Brush', family: 'Alex Brush, cursive' },
	{ name: 'Inter', family: 'Inter, sans-serif' },
];

export const QR_PATTERN = Array.from({ length: 25 }, (_, i) =>
	[0, 1, 3, 5, 6, 7, 10, 12, 14, 17, 18, 19, 21, 23, 24].includes(i),
);
