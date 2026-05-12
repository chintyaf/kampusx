import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
	LayoutDashboard,
	UserCheck,
	ChevronDown,
	Plus,
	UsersRound,
	FolderOpen,
	ChartColumn,
	Star,
	Form,
	UserRoundPen,
	BookOpen,
	Megaphone,
	Award,
	ClipboardList,
	MapPin,
	CalendarDays,
} from 'lucide-react';

// ... (kode lainnya)
// --- Configuration Data ---
export const MENU_ITEMS = {
	admin: [
		{
			id: '1',
			name: 'Admin Dashboard',
			icon: <LayoutDashboard size={16} className="me-2" />,
			path: 'admin/dashboard',
		},
		{
			id: '2',
			name: 'Verifikasi Organizer',
			icon: <UserCheck size={16} className="me-2" />,
			path: 'admin/verifikasi-organizer',
		},
		{
			id: '3',
			name: 'Kelola Pengguna',
			icon: <UserCheck size={16} className="me-2" />,
			path: 'admin/kelola-pengguna',
		},
		{
			id: '4',
			name: 'Pantau Acara',
			icon: <UserCheck size={16} className="me-2" />,
			path: 'admin/pantau-acara',
		},
		{
			id: '5',
			name: 'Kontrol Promosi',
			icon: <UserCheck size={16} className="me-2" />,
			path: 'admin/kontrol-promosi',
		},
	],
	organizer: [
		{
			id: '1',
			name: 'Dashboard',
			icon: <LayoutDashboard size={16} className="me-2" />,
			path: 'organizer/dashboard',
		},
		{
			id: '2',
			name: 'Daftar Acara',
			icon: <LayoutDashboard size={16} className="me-2" />,
			path: 'organizer/daftar-acara',
		},
	],

	event_detail: [
		{
			id: 'event-dashboard',
			name: 'Dashboard',
			icon: <LayoutDashboard size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard',
		},
		{
			id: 'detil-event',
			name: 'Detail Event',
			icon: <CalendarDays size={16} className="me-2" />, // Icon kalender lebih merepresentasikan acara
			path: '/organizer/:eventId/event-dashboard/detail',
			submenu: [
				{ name: 'Informasi Umum', path: 'info', isCompleted: true },
				{ name: 'Tempat Pelaksanaan', path: 'tempat', isCompleted: true },
				{ name: 'Jadwal', path: 'sesi', isCompleted: true },
				{ name: 'Kategori Tiket', path: 'tiket', isCompleted: false },
			],
		},
		{
			id: 'event-pos',
			name: 'Pos Check-in', // Lebih spesifik sesuai fungsinya
			icon: <MapPin size={16} className="me-2" />, // Pin map merepresentasikan titik/lokasi pos
			path: '/organizer/:eventId/event-dashboard/event-pos',
		},
		{
			id: 'daftar-peserta',
			name: 'Daftar Peserta',
			icon: <UsersRound size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/daftar-peserta',
		},
		// --- GRUP LEARNING & FEEDBACK ---
		{
			id: 'modul-belajar',
			name: 'Modul Belajar',
			icon: <BookOpen size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/modul-belajar',
			submenu: [
				{ name: 'Materi Acara', path: 'materi-acara', isCompleted: true },
				{ name: 'Materi Pasca-Acara', path: 'materi-after', isCompleted: false },
				{ name: 'Kelola Kuis', path: 'kuis', isCompleted: false },
			],
		},
		{
			id: 'survey-form',
			name: 'Kelola Survei',
			icon: <ClipboardList size={16} className="me-2" />, // Icon clipboard cocok untuk form/kuesioner
			path: '/organizer/:eventId/event-dashboard/survey-form',
		},
		{
			id: 'sertifikat-event',
			name: 'Sertifikat',
			icon: <Award size={16} className="me-2" />, // Icon medali/penghargaan sangat pas untuk sertifikat
			path: '/organizer/:eventId/event-dashboard/sertifikat/sertifikat',
			// submenu: [
			// 	{ name: 'Atur Template', path: 'atur-template', isCompleted: true },
			// 	{ name: 'Kirim Sertifikat', path: 'kirim-sertifikat', isCompleted: false },
			// ],
		},
		// --- GRUP MARKETING & REPORT ---
		{
			id: 'promosi-event',
			name: 'Promosi',
			icon: <Megaphone size={16} className="me-2" />, // Megaphone adalah standar industri untuk marketing/promosi
			path: '/organizer/:eventId/event-dashboard/promosi',
		},
		{
			id: 'statistik-event',
			name: 'Statistik',
			icon: <ChartColumn size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/statistik',
		},
	],
};
