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
	Building2,
	Wallet,
	CreditCard,
	Info,
	Ticket,
	ScanLine,
	Gift,
	Tv,
} from 'lucide-react';

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
			id: '3',
			name: 'Kelola Pengguna',
			icon: <UsersRound size={16} className="me-2" />,
			path: 'admin/kelola-pengguna',
		},
		{
			id: '4',
			name: 'Pantau Acara',
			icon: <CalendarDays size={16} className="me-2" />,
			path: 'admin/pantau-acara',
		},
		{
			id: 'institusi',
			name: 'Institusi',
			icon: <Building2 size={16} className="me-2" />,
			path: 'admin/master-data/institusi',
		},

		{
			id: '2',
			name: 'Verifikasi Organizer',
			icon: <UserCheck size={16} className="me-2" />,
			path: 'admin/verifikasi-organizer',
		},
		{
			id: '5',
			name: 'Kontrol Promosi',
			icon: <Megaphone size={16} className="me-2" />,
			path: 'admin/kontrol-promosi',
		},
		{
			id: 'payment-simulator',
			name: 'Payment Simulator',
			icon: <CreditCard size={16} className="me-2" />,
			path: 'admin/payment',
		},
		{
			id: 'gamifikasi',
			name: 'Gamifikasi Event',
			icon: <Award size={16} className="me-2" />,
			path: 'admin/gamifikasi',
			submenu: [
				{
					name: 'Kelola Aktivitas',
					path: 'aktivitas',
				},
				{
					name: 'Reward Global',
					path: 'reward',
				},
				{
					name: 'Aturan Konversi',
					path: 'konversi',
				},
			],
		},

		{
			id: 'master-data',
			name: 'Master Data',
			icon: <FolderOpen size={16} className="me-2" />, // Icon kalender lebih merepresentasikan acara
			path: 'admin/master-data',
			submenu: [
				{
					name: 'Kategori',
					path: 'kategori',
				},
				{
					name: 'Tipe Event',
					path: 'tipe-event',
				},
				{
					name: 'Institusi',
					path: 'institusi',
				},
			],
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
			path: '/organizer/:eventId/event-dashboard',
			submenu: [
				{
					name: 'Informasi Umum',
					path: 'info',
					// isCompleted: true
				},
				{
					name: 'Tempat Pelaksanaan',
					path: 'tempat',
					// isCompleted: true
				},
				{
					name: 'Jadwal',
					path: 'sesi',
					// isCompleted: true
				},
				{
					name: 'Kategori Tiket',
					path: 'tiket',
					// isCompleted: false
				},
			],
		},

		// --- PEMECAHAN "OPERASIONAL/PESERTA" ---
		{
			id: 'daftar-peserta',
			name: 'Daftar Peserta',
			icon: <UsersRound size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/daftar-peserta',
		},
		{
			id: 'check-in',
			name: 'Check-in & Scanner',
			icon: <ScanLine size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/check-in',
		},

		// --- PEMECAHAN "MODUL BELAJAR" & LAINNYA ---
		{
			id: 'materi-belajar',
			name: 'Materi Acara',
			icon: <BookOpen size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/materi-after', // Langsung arahkan ke materinya
		},
		// {
		// 	id: 'survey-form',
		// 	name: 'Kelola Survei',
		// 	icon: <ClipboardList size={16} className="me-2" />,
		// 	path: '/organizer/:eventId/event-dashboard/survey-form',
		// },
		{
			id: 'sertifikat-event',
			name: 'Sertifikat',
			icon: <Award size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/sertifikat',
		},
		{
			id: 'pengumuman-event',
			name: 'Pengumuman',
			icon: <Megaphone size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/pengumuman',
		},
		{
			id: 'rewards-event',
			name: 'Reward Lokal',
			icon: <Gift size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/rewards',
		},
		{
			id: 'redemptions-event',
			name: 'Log Penukaran',
			icon: <ClipboardList size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/redemptions',
		},
		{
			id: 'kiosk-event',
			name: 'Kiosk Mode',
			icon: <Tv size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/kiosk',
		},
	],
};
