import React from 'react';
import { BookOpen, Clock } from 'lucide-react';
import { Chip } from '../shared/SectionCard';
import { MarkdownPreview } from '../shared/MarkdownPreview';
import { T } from '../utils/lessonConstants';

export const MateriPreview = ({
	moduleName = '',
	duration = 5,
	title = '',
	summary = '',
	body = '',
}) => {
	return (
		<div
			style={{
				background: T.card,
				border: `1px solid ${T.border}`,
				borderRadius: T.rMd,
				padding: 24,
				minHeight: 360,
				overflow: 'auto',
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					flexWrap: 'wrap',
					marginBottom: 14,
				}}
			>
				{moduleName && (
					<Chip bg={T.neutralBg} color={T.muted} style={{ border: `1px solid ${T.border}` }}>
						<BookOpen size={12} /> {moduleName}
					</Chip>
				)}
				<span
					style={{
						fontSize: T.fxs,
						color: T.muted,
						display: 'inline-flex',
						alignItems: 'center',
						gap: 4,
					}}
				>
					<Clock size={12} /> Est. {duration} min
				</span>
			</div>
			<h1 style={{ margin: '0 0 14px', fontSize: 28, fontWeight: 700, lineHeight: 1.25 }}>
				{title.trim() || <span style={{ color: '#94a3b8' }}>Judul lesson</span>}
			</h1>
			{summary.trim() && (
				<div
					style={{
						padding: '14px 18px',
						borderLeft: `4px solid ${T.primary}`,
						background: T.field,
						borderRadius: `0 ${T.rMd} ${T.rMd} 0`,
						color: T.muted,
						marginBottom: 8,
					}}
				>
					{summary}
				</div>
			)}
			{body.trim() ? (
				<MarkdownPreview source={body} />
			) : (
				<p style={{ color: '#94a3b8', fontSize: T.fsm }}>Isi materi masih kosong.</p>
			)}
		</div>
	);
};

export default MateriPreview;
