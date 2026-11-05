import React from 'react';
import {
	ChevronLeft,
	ChevronRight,
	Plus,
	CheckCircle,
	Circle,
	BookOpen,
	Cpu,
	HelpCircle,
	Clock,
} from 'lucide-react';
import { Btn, Chip, NavLink } from '../shared/SectionCard';
import { T, outlineBtn } from '../utils/lessonConstants';

export const EditorSidebar = ({
	moduleInfo,
	items = [],
	numbered = [],
	lessonId,
	lesson,
	dirty,
	isNew,
	currentLabel,
	checklist = [],
	pathTo,
	pathModule,
	pathNew,
	requestNav,
	changeTab,
	setDrawerOpen,
	isNarrow,
}) => {
	const doneCount = checklist.filter((c) => c.ok).length;
	const allDone = doneCount === checklist.length;

	return (
		<aside
			style={{
				width: 320,
				flexShrink: 0,
				background: T.card,
				borderRight: `1px solid ${T.border}`,
				display: 'flex',
				flexDirection: 'column',
				position: isNarrow ? 'fixed' : 'sticky',
				top: 0,
				left: 0,
				bottom: 0,
				zIndex: isNarrow ? 1040 : 20,
				height: '100vh',
				boxShadow: isNarrow ? '0 0 30px rgba(0,0,0,0.18)' : 'none',
			}}
		>
			{/* Header sidebar */}
			<div
				style={{
					padding: '16px 18px',
					borderBottom: `1px solid ${T.border}`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 8,
				}}
			>
				<NavLink
					href={pathModule}
					onNavigate={(h) => {
						setDrawerOpen(false);
						requestNav(h);
					}}
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 6,
						fontSize: T.fxs,
						fontWeight: 700,
						color: T.muted,
						textTransform: 'uppercase',
						letterSpacing: '0.04em',
					}}
				>
					<ChevronLeft size={14} /> Module {moduleInfo.number}
				</NavLink>
				<span
					style={{
						fontSize: T.fxs,
						color: T.muted,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
						maxWidth: 140,
					}}
				>
					{moduleInfo.name}
				</span>
			</div>

			{/* Daftar lesson / kuis */}
			<nav
				aria-label="Daftar unit dalam modul"
				style={{
					flex: 1,
					overflowY: 'auto',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{numbered.map((it) => {
					const active = it.id === lessonId;
					const live = active ? { ...it, title: lesson.title.trim() || it.title } : it;
					const Icon =
						it.type === 'quiz'
							? HelpCircle
							: it.type === 'lesson' && lesson.format === 'micro' && active
								? Cpu
								: BookOpen;
					return (
						<NavLink
							key={it.id}
							href={pathTo(it)}
							aria-current={active ? 'page' : undefined}
							onNavigate={(h) => {
								setDrawerOpen(false);
								if (!active) requestNav(h);
							}}
							style={{
								display: 'flex',
								alignItems: 'flex-start',
								gap: 10,
								padding: '12px 18px',
								borderLeft: `3px solid ${active ? T.primary : 'transparent'}`,
								background: active ? T.primarySoft : 'transparent',
								color: active ? T.primary : T.text,
							}}
						>
							<span
								style={{
									marginTop: 2,
									color: it.status === 'published' ? T.success : T.muted,
									flexShrink: 0,
								}}
							>
								{it.status === 'published' ? (
									<CheckCircle size={18} />
								) : (
									<Circle size={18} />
								)}
							</span>
							<span style={{ minWidth: 0, flex: 1 }}>
								<span
									style={{
										display: 'block',
										fontSize: T.fsm,
										fontWeight: active ? 700 : 500,
										lineHeight: 1.35,
									}}
								>
									{live.label} {live.title}
								</span>
								<span
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 6,
										marginTop: 4,
										fontSize: T.fxs,
										color: T.muted,
									}}
								>
									<Icon size={12} />
									{it.type === 'quiz' ? 'Kuis' : 'Materi'}
									{it.minutes ? (
										<>
											<span>•</span>
											<Clock size={12} /> {it.minutes} min
										</>
									) : null}
									{active && dirty && (
										<Chip bg={T.warnBg} color={T.warnText}>
											Belum disimpan
										</Chip>
									)}
									{!active && it.status === 'draft' && (
										<Chip bg={T.neutralBg} color={T.muted}>
											Draft
										</Chip>
									)}
								</span>
							</span>
							{active && <ChevronRight size={16} style={{ marginTop: 2 }} />}
						</NavLink>
					);
				})}

				{isNew && (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 10,
							padding: '12px 18px',
							borderLeft: `3px solid ${T.primary}`,
							background: T.primarySoft,
							color: T.primary,
							fontSize: T.fsm,
							fontWeight: 700,
						}}
					>
						<Circle size={18} /> {currentLabel}: {lesson.title.trim() || 'Tanpa judul'}
					</div>
				)}
			</nav>

			<div style={{ display: 'flex', gap: 8, padding: '4px 18px 16px' }}>
				<Btn
					onClick={() => {
						setDrawerOpen(false);
						requestNav(pathNew('lesson'));
					}}
					style={{
						...outlineBtn,
						flex: 1,
						justifyContent: 'center',
						padding: '8px 10px',
						fontSize: T.fxs,
						color: T.primary,
						borderStyle: 'dashed',
					}}
					hoverStyle={{ backgroundColor: T.primarySoft }}
				>
					<Plus size={14} /> Lesson
				</Btn>
				<Btn
					onClick={() => {
						setDrawerOpen(false);
						requestNav(pathNew('quiz'));
					}}
					style={{
						...outlineBtn,
						flex: 1,
						justifyContent: 'center',
						padding: '8px 10px',
						fontSize: T.fxs,
						color: T.primary,
						borderStyle: 'dashed',
					}}
					hoverStyle={{ backgroundColor: T.primarySoft }}
				>
					<Plus size={14} /> Kuis
				</Btn>
			</div>

			{/* Checklist kelengkapan */}
			<div
				style={{
					marginTop: 'auto',
					padding: 18,
					borderTop: `1px solid ${T.border}`,
					background: T.field,
				}}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: 8,
					}}
				>
					<strong style={{ fontSize: T.fsm }}>Kelengkapan</strong>
					<Chip
						bg={allDone ? T.successBg : T.warnBg}
						color={allDone ? T.successText : T.warnText}
					>
						{doneCount}/{checklist.length}
					</Chip>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					{checklist.map((c) => (
						<Btn
							key={c.key}
							onClick={() => {
								changeTab(c.tab);
								setDrawerOpen(false);
							}}
							style={{
								background: 'none',
								border: 'none',
								padding: '5px 0',
								gap: 8,
								fontSize: T.fxs,
								color: c.ok ? T.muted : T.text,
								textAlign: 'left',
							}}
							hoverStyle={{ color: T.primary }}
						>
							{c.ok ? (
								<CheckCircle size={14} color={T.success} />
							) : (
								<Circle size={14} color="#94a3b8" />
							)}
							<span style={{ textDecoration: c.ok ? 'line-through' : 'none' }}>
								{c.label}
							</span>
						</Btn>
					))}
				</div>
			</div>
		</aside>
	);
};

export default EditorSidebar;
