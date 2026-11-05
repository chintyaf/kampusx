import React from 'react';
import { Pencil, Eye } from 'lucide-react';
import { SectionCard, Btn, TextArea } from '../shared/SectionCard';
import { MateriToolbar } from './MateriToolbar';
import { MateriPreview } from './MateriPreview';
import { T } from '../utils/lessonConstants';

export const MateriContent = ({
	body = '',
	editorMode = 'edit',
	setEditorMode,
	isStacked = false,
	bodyRef,
	onUpdateBody,
	onBodyKeyDown,
	onFormat,
	words = 0,
	moduleName,
	duration,
	title,
	summary,
}) => {
	const previewPane = (
		<MateriPreview
			moduleName={moduleName}
			duration={duration}
			title={title}
			summary={summary}
			body={body}
		/>
	);

	return (
		<SectionCard
			icon={Pencil}
			title="Isi materi"
			desc="Tulis dengan Markdown. Pakai toolbar atau pintasan Ctrl+B / Ctrl+I."
			right={
				<div
					role="group"
					aria-label="Mode editor"
					style={{
						display: 'inline-flex',
						border: `1px solid ${T.border}`,
						borderRadius: T.rMd,
						overflow: 'hidden',
					}}
				>
					{[
						{ id: 'edit', label: 'Tulis', icon: Pencil },
						...(!isStacked ? [{ id: 'split', label: 'Split', icon: null }] : []),
						{ id: 'preview', label: 'Pratinjau', icon: Eye },
					].map((m) => (
						<Btn
							key={m.id}
							aria-pressed={editorMode === m.id}
							onClick={() => setEditorMode(m.id)}
							style={{
								padding: '6px 12px',
								gap: 6,
								border: 'none',
								fontSize: T.fxs,
								fontWeight: 600,
								background: editorMode === m.id ? T.primary : T.card,
								color: editorMode === m.id ? T.white : T.muted,
							}}
							hoverStyle={
								editorMode === m.id ? {} : { backgroundColor: T.neutralBg }
							}
						>
							{m.icon && <m.icon size={13} />} {m.label}
						</Btn>
					))}
				</div>
			}
		>
			{editorMode !== 'preview' && <MateriToolbar onFormat={onFormat} />}

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: editorMode === 'split' ? '1fr 1fr' : '1fr',
					gap: 12,
				}}
			>
				{editorMode !== 'preview' && (
					<TextArea
						ref={bodyRef}
						aria-label="Isi materi"
						value={body}
						onChange={(e) => onUpdateBody(e.target.value)}
						onKeyDown={onBodyKeyDown}
						placeholder="Tuliskan materi pembelajaran di sini…"
						style={{
							minHeight: 360,
							fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
							fontSize: 13.5,
							lineHeight: 1.7,
						}}
					/>
				)}
				{editorMode !== 'edit' && previewPane}
			</div>

			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					gap: 8,
					flexWrap: 'wrap',
					marginTop: 8,
					fontSize: T.fxs,
					color: T.muted,
				}}
			>
				<span>
					{words} kata • ±{Math.max(1, Math.round(words / 200))} menit baca
				</span>
				<span>Markdown didukung: judul, poin, kutipan, kode, tautan</span>
			</div>
		</SectionCard>
	);
};

export default MateriContent;
