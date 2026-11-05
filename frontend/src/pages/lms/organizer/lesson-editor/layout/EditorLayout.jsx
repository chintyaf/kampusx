import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Chip } from '../shared/SectionCard';
import { T } from '../utils/lessonConstants';

export const EditorLayout = ({
	isNarrow,
	drawerOpen,
	setDrawerOpen,
	sidebar,
	topBar,
	tabBar,
	tab,
	editorMode,
	kind,
	currentLabel,
	moduleInfo,
	lesson,
	children,
	footer,
	toast,
}) => {
	return (
		<div
			style={{
				fontFamily: T.font,
				background: T.bg,
				color: T.text,
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'flex-start',
			}}
		>
			{!isNarrow && sidebar}
			{isNarrow && drawerOpen && (
				<>
					<div
						onClick={() => setDrawerOpen(false)}
						style={{
							position: 'fixed',
							inset: 0,
							zIndex: 1030,
							background: 'rgba(15,23,42,0.45)',
						}}
					/>
					{sidebar}
				</>
			)}

			<div style={{ flex: 1, minWidth: 0 }}>
				{topBar}
				<main
					style={{
						maxWidth: editorMode === 'split' && tab === 'materi' ? 1100 : 820,
						margin: '0 auto',
						padding: '24px 24px 80px',
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 10,
							flexWrap: 'wrap',
							marginBottom: 4,
						}}
					>
						<h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
							{kind === 'quiz' ? 'Editor Kuis' : 'Editor Lesson'}
						</h1>
						<Chip
							bg={lesson.status === 'published' ? T.successBg : T.neutralBg}
							color={lesson.status === 'published' ? T.successText : T.muted}
						>
							{lesson.status === 'published' ? 'Siap terbit' : 'Draft'}
						</Chip>
					</div>
					<p style={{ margin: '0 0 20px', fontSize: T.fsm, color: T.muted }}>
						{currentLabel} • Module {moduleInfo.number}: {moduleInfo.name}
					</p>

					{tabBar}

					<div role="tabpanel">{children}</div>

					{footer}
				</main>
			</div>

			{/* Toast */}
			{toast && (
				<div
					role="status"
					style={{
						position: 'fixed',
						right: 24,
						bottom: 24,
						zIndex: 1100,
						display: 'flex',
						alignItems: 'center',
						gap: 10,
						maxWidth: 380,
						padding: '12px 16px',
						fontSize: T.fsm,
						borderRadius: T.rMd,
						background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
						color: toast.type === 'error' ? '#b91c1c' : '#166534',
						border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
						boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
					}}
				>
					{toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
					<span style={{ flex: 1 }}>{toast.message}</span>
				</div>
			)}
		</div>
	);
};

export default EditorLayout;
