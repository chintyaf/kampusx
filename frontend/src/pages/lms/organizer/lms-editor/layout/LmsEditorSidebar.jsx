import React from 'react';
import { NavLink } from 'react-router-dom';
import {
	ChevronLeft,
	ChevronRight,
	FileText,
	Clock,
	Settings,
	HelpCircle,
	Plus,
} from 'lucide-react';

// Data dummy — nanti ganti dengan data dari API
const DUMMY_MODULE = {
	title: 'Web Architecture & REST API Design',
	lessons: [
		{ id: 1, title: 'Konsep Dasar Pemrograman & Tipe Data Utama', type: 'Text', duration: 10 },
		{
			id: 2,
			title: 'Tipe Data Logika (Boolean) & Operator Relasional',
			type: 'Text',
			duration: 8,
		},
		{ id: 3, title: 'Aturan Penamaan Variabel & Assignment Nilai', type: 'Text', duration: 7 },
	],
};

const COLORS = {
	primary: '#0a6a9a',
	primaryBg: '#dff1fc',
	text: '#0f1e3d',
	muted: '#6b7488',
	border: '#e5e9f0',
	soft: '#f7f8fa',
};

// Item navigasi umum (dipakai Module, Lesson, dan Kuis)
const SidebarItem = ({ to, icon, title, subtitle, end }) => (
	<NavLink
		to={to}
		end={end}
		style={({ isActive }) => ({
			display: 'flex',
			alignItems: 'center',
			gap: 12,
			padding: '16px 20px',
			textDecoration: 'none',
			color: COLORS.text,
			background: isActive ? COLORS.primaryBg : '#fff',
			borderLeft: `4px solid ${isActive ? COLORS.primary : 'transparent'}`,
			borderBottom: `1px solid ${COLORS.border}`,
		})}
	>
		<div style={{ color: COLORS.primary, flexShrink: 0 }}>{icon}</div>
		<div style={{ flex: 1, minWidth: 0 }}>
			<div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.35 }}>{title}</div>
			{subtitle}
		</div>
		<ChevronRight size={18} color={COLORS.muted} />
	</NavLink>
);

const SectionLabel = ({ children }) => (
	<div
		style={{
			padding: '14px 20px 8px',
			fontSize: 13,
			fontWeight: 700,
			color: COLORS.muted,
			background: COLORS.soft,
		}}
	>
		{children}
	</div>
);

const LmsEditorSidebar = ({ moduleId = 1, learningId, module = DUMMY_MODULE }) => {
	const base = `/organizer/learning-path/${learningId}/modules/${moduleId}`; // sesuaikan dengan route kamu

	return (
		<aside
			style={{
				width: 340,
				height: '100%',
				overflowY: 'auto',
				background: '#fff',
				borderRight: `1px solid ${COLORS.border}`,
				flexShrink: 0,
			}}
		>
			{/* Header */}
			<div style={{ padding: 20, borderBottom: `1px solid ${COLORS.border}` }}>
				<NavLink
					to={`/organizer/learning-path/${learningId}`}
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 4,
						color: COLORS.muted,
						textDecoration: 'none',
						fontSize: 14,
						marginBottom: 12,
					}}
				>
					<ChevronLeft size={18} /> Kembali
				</NavLink>
				<h5 style={{ margin: 0, fontWeight: 700, color: COLORS.text }}>{module.title}</h5>
			</div>

			{/* 1. Tab Module (metadata) */}
			<SectionLabel>Pengaturan</SectionLabel>
			<SidebarItem
				to={`${base}/info`}
				icon={<Settings size={22} />}
				title="Informasi Module"
				subtitle={
					<small style={{ color: COLORS.muted }}>Judul, deskripsi, & metadata</small>
				}
			/>

			{/* 2. Daftar Lesson */}
			<SectionLabel>Lesson</SectionLabel>
			{module.lessons.map((lesson) => (
				<SidebarItem
					key={lesson.id}
					to={`${base}/lessons/${lesson.id}`}
					icon={<FileText size={22} />}
					title={lesson.title}
					subtitle={
						<small
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 6,
								color: COLORS.muted,
								marginTop: 4,
							}}
						>
							{lesson.type} • <Clock size={13} /> {lesson.duration} min
						</small>
					}
				/>
			))}

			{/* Tombol tambah lesson */}
			<button
				type="button"
				onClick={() => console.log('Tambah lesson')}
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 6,
					width: '100%',
					padding: '14px 20px',
					border: 'none',
					borderBottom: `1px solid ${COLORS.border}`,
					background: '#fff',
					color: COLORS.primary,
					fontWeight: 600,
					fontSize: 14,
					cursor: 'pointer',
				}}
			>
				<Plus size={18} /> Tambah Lesson
			</button>

			{/* 3. Tab Kuis */}
			<SectionLabel>Evaluasi</SectionLabel>
			<SidebarItem
				to={`${base}/quiz`}
				icon={<HelpCircle size={22} />}
				title="Kuis Module"
				subtitle={
					<small style={{ color: COLORS.muted }}>Kelola soal & pengaturan kuis</small>
				}
			/>
		</aside>
	);
};

export default LmsEditorSidebar;
