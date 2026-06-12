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
		{ isHeader: true, id: 'header-utama', name: 'UTAMA' },
		{
			id: 'event-dashboard',
			name: 'Dashboard',
			icon: <LayoutDashboard size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard',
		},

		{ isHeader: true, id: 'header-persiapan', name: 'PERSIAPAN EVENT' },
		{
			id: 'detil-event',
			name: 'Detail Event',
			icon: <CalendarDays size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard',
			submenu: [
				{ name: 'Informasi Umum', path: 'info' },
				{ name: 'Lokasi & Jadwal', path: 'tempat' },
				{ name: 'Sesi', path: 'sesi' },
				{ name: 'Tiket', path: 'tiket' },
			],
		},
		{
			id: 'materi-acara',
			name: 'Materi Acara',
			icon: <BookOpen size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/materi-acara',
		},

		{ isHeader: true, id: 'header-pelaksanaan', name: 'PELAKSANAAN & INTERAKSI' },
		{
			id: 'check-in',
			name: 'Scan Check-in',
			icon: <ScanLine size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/check-in',
		},
		{
			id: 'pengumuman-event',
			name: 'Pengumuman',
			icon: <Megaphone size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/pengumuman',
		},

		{ isHeader: true, id: 'header-pasca', name: 'PASCA EVENT' },
		{
			id: 'manajemen-peserta',
			name: 'Peserta & Poin',
			icon: <UsersRound size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard',
			submenu: [
				{ name: 'Daftar & Poin', path: 'daftar-peserta' },
				{ name: 'Katalog Reward', path: 'rewards' },
				{ name: 'Log Redeem', path: 'redemptions' },
			],
		},
		// {
		// 	id: 'survey-form',
		// 	name: 'Survei & Feedback',
		// 	icon: <ClipboardList size={16} className="me-2" />,
		// 	path: '/organizer/:eventId/event-dashboard/survey-form',
		// },
		{
			id: 'sertifikat-event',
			name: 'Sertifikat',
			icon: <Award size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/sertifikat',
		},
	],
};
