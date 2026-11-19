import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
	ChevronLeft,
	ChevronRight,
	FileText,
	Clock,
	Settings,
	HelpCircle,
	Plus,
	Loader2,
} from 'lucide-react';
import api from '@/api/axios';
import { notify } from '@/utils/notify';

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
			<div
				style={{
					fontWeight: 600,
					fontSize: 14,
					lineHeight: 1.35,
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
				}}
			>
				{title}
			</div>
			{subtitle}
		</div>
		<ChevronRight size={18} color={COLORS.muted} />
	</NavLink>
);

const SectionLabel = ({ children }) => (
	<div
		style={{
			padding: '14px 20px 8px',
			fontSize: 12,
			fontWeight: 700,
			color: COLORS.muted,
			textTransform: 'uppercase',
			letterSpacing: '0.5px',
			background: COLORS.soft,
		}}
	>
		{children}
	</div>
);

const LmsEditorSidebar = ({
	moduleId,
	learningId,
	module,
	refreshModule,
	loading,
}) => {
	const navigate = useNavigate();
	const [creatingLesson, setCreatingLesson] = useState(false);
	const base = `/organizer/learning-path/${learningId}/modules/${moduleId}`;

	const lessons = module?.lessons || [];

	const handleAddLesson = async () => {
		if (creatingLesson) return;
		try {
			setCreatingLesson(true);
			const nextOrder = lessons.length + 1;
			const res = await api.post('/organizer/lms/lessons', {
				module_id: Number(moduleId),
				title: `Lesson ${nextOrder}`,
				type: 'article',
				duration_minutes: 10,
				order_index: nextOrder,
				status: 'draft',
			});

			if (res.data?.success && res.data?.data) {
				notify('success', 'Berhasil', 'Lesson baru berhasil dibuat');
				if (refreshModule) {
					await refreshModule();
				}
				navigate(`${base}/lessons/${res.data.data.id}`);
			}
		} catch (error) {
			console.error('Error creating lesson:', error);
			notify(
				'error',
				'Gagal',
				error.response?.data?.message || 'Gagal menambahkan lesson baru.',
			);
		} finally {
			setCreatingLesson(false);
		}
	};

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
					<ChevronLeft size={18} /> Kembali ke Learning Path
				</NavLink>
				<h5
					style={{
						margin: 0,
						fontWeight: 700,
						color: COLORS.text,
						fontSize: 16,
						lineHeight: 1.4,
					}}
				>
					{loading && !module ? 'Memuat Module...' : module?.title || 'Module Editor'}
				</h5>
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
			<SectionLabel>Lesson ({lessons.length})</SectionLabel>
			{lessons.map((lesson) => (
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
								textTransform: 'capitalize',
							}}
						>
							{lesson.type || 'Article'} • <Clock size={13} /> {lesson.duration_minutes || 0} min
						</small>
					}
				/>
			))}

			{/* Tombol tambah lesson */}
			<button
				type="button"
				onClick={handleAddLesson}
				disabled={creatingLesson}
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 8,
					width: '100%',
					padding: '14px 20px',
					border: 'none',
					borderBottom: `1px solid ${COLORS.border}`,
					background: '#fff',
					color: COLORS.primary,
					fontWeight: 600,
					fontSize: 14,
					cursor: creatingLesson ? 'not-allowed' : 'pointer',
					opacity: creatingLesson ? 0.7 : 1,
				}}
			>
				{creatingLesson ? (
					<>
						<Loader2 size={18} className="animate-spin" /> Menambahkan...
					</>
				) : (
					<>
						<Plus size={18} /> Tambah Lesson
					</>
				)}
			</button>

			{/* 3. Tab Kuis */}
			<SectionLabel>Evaluasi</SectionLabel>
			<SidebarItem
				to={`${base}/quiz`}
				icon={<HelpCircle size={22} />}
				title="Kuis Module"
				subtitle={
					<small style={{ color: COLORS.muted }}>
						{module?.quizzes?.length
							? `${module.quizzes.length} kuis tersedia`
							: 'Kelola soal & pengaturan kuis'}
					</small>
				}
			/>
		</aside>
	);
};

export default LmsEditorSidebar;
