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
			id: '1',
			name: 'Dashboard',
			icon: <LayoutDashboard size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard',
		},
		{
			id: '2',
			name: 'Detil Event',
			icon: <Form size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/detail',
			submenu: [
				{ name: 'Info Utama', path: 'info', isCompleted: true },
				{ name: 'Tempat Acara', path: 'tempat', isCompleted: true  },
				{ name: 'Susunan Acara', path: 'sesi', isCompleted: true  },
				{ name: 'Daftar Pembicara', path: 'pembicara', isCompleted: false },
				{ name: 'Formulir Registrasi', path: 'formulir', isCompleted: false },
				{ name: 'Tiket', path: 'tiket', isCompleted: false },
			],
		},
		{
			id: '7',
			name: 'Staff Administrasi',
			icon: <UserRoundPen size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/kelola-staff',
		},
		{
			id: '3',
			name: 'Daftar Peserta',
			icon: <UsersRound size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/daftar-peserta',
		},
		{
			id: '8',
			name: 'Cetak Sertifikat',
			icon: <UserRoundPen size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/cetak-sertifikat',
		},
		{
			id: '4',
			name: 'Distribusi Materi',
			icon: <FolderOpen size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/distribusi-materi',
		},
		{
			id: '4b',
			name: 'Materi After-Event',
			icon: <FolderOpen size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/upload-materi-after',
		},
		{
			id: '5',
			name: 'Statistik',
			icon: <ChartColumn size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/statistik',
		},
		{
			id: '6',
			name: 'Promosi',
			icon: <Star size={16} className="me-2" />,
			path: '/organizer/:eventId/event-dashboard/promosi',
		},
	],
};
