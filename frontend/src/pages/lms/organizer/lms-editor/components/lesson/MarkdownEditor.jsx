import React, { useRef, useState, useMemo } from 'react';

import { Button, ButtonGroup } from 'react-bootstrap';

import {
	Bold,
	Italic,
	Strikethrough,
	Heading2,
	Heading3,
	Quote,
	Code,
	Link as LinkIcon,
	Image as ImageIcon,
	List,
	ListOrdered,
	Minus,
	Pencil,
	Eye,
	Columns,
} from 'lucide-react';

import { renderMarkdown } from './LessonContentUtils';

const styles = {
	wrapper: {
		border: '1px solid #ced4da',
		borderRadius: 8,
		overflow: 'hidden',
		background: '#fff',
	},
	topBar: {
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
		padding: '6px 8px',
		background: '#f8f9fa',
		borderBottom: '1px solid #dee2e6',
	},
	toolGroup: {
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: 2,
	},
	toolBtn: {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: 32,
		height: 32,
		padding: 0,
		border: 'none',
		background: 'transparent',
		color: '#495057',
		borderRadius: 6,
	},
	divider: {
		width: 1,
		height: 20,
		background: '#dee2e6',
		margin: '0 6px',
	},
	modeBtn: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 6,
		fontSize: '.85rem',
	},
	panes: {
		display: 'flex',
		flexWrap: 'wrap',
	},
	textarea: {
		flex: '1 1 320px',
		minWidth: 0,
		width: '100%',
		border: 'none',
		outline: 'none',
		resize: 'vertical',
		padding: '12px 14px',
		fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
		fontSize: '.9rem',
		lineHeight: 1.6,
		background: '#fff',
		color: '#212529',
	},
	preview: {
		flex: '1 1 320px',
		minWidth: 0,
		padding: '12px 16px',
		overflowY: 'auto',
		background: '#fff',
		color: '#212529',
		wordBreak: 'break-word',
	},
	previewSplit: {
		borderLeft: '1px solid #dee2e6',
	},
	empty: {
		color: '#adb5bd',
		fontStyle: 'italic',
	},
	footer: {
		display: 'flex',
		justifyContent: 'space-between',
		gap: 8,
		padding: '6px 12px',
		fontSize: '.78rem',
		color: '#6c757d',
		background: '#f8f9fa',
		borderTop: '1px solid #dee2e6',
	},
};

const MarkdownEditor = ({ name, value, onChange, placeholder, height = 320 }) => {
	const textareaRef = useRef(null);
	const selectionRef = useRef(null);

	const [mode, setMode] = useState('write');
	const [hovered, setHovered] = useState(null);

	// Memastikan data lama langsung terbaca.
	const text = value ?? '';

	const html = useMemo(() => renderMarkdown(text), [text]);

	const words = text.trim() ? text.trim().split(/\s+/).length : 0;

	const getSelection = () => {
		const el = textareaRef.current;

		if (el) {
			return {
				start: el.selectionStart,
				end: el.selectionEnd,
			};
		}

		return (
			selectionRef.current ?? {
				start: text.length,
				end: text.length,
			}
		);
	};

	const emit = (next, start, end) => {
		selectionRef.current = { start, end };

		onChange({
			target: {
				name,
				value: next,
			},
		});

		requestAnimationFrame(() => {
			const el = textareaRef.current;

			if (!el) return;

			el.focus();
			el.setSelectionRange(start, end);
		});
	};

	const wrap = (before, after = before, placeholderText = 'teks') => {
		const { start, end } = getSelection();

		const selected = text.slice(start, end) || placeholderText;

		const next = text.slice(0, start) + before + selected + after + text.slice(end);

		emit(next, start + before.length, start + before.length + selected.length);
	};

	const prefixLines = (getPrefix, placeholderText = 'teks') => {
		const { start, end } = getSelection();

		const lineStart = text.lastIndexOf('\n', start - 1) + 1;

		let lineEnd = text.indexOf('\n', end);

		if (lineEnd === -1) {
			lineEnd = text.length;
		}

		const block = text.slice(lineStart, lineEnd) || placeholderText;

		const replaced = block
			.split('\n')
			.map((line, index) => getPrefix(index) + line)
			.join('\n');

		const next = text.slice(0, lineStart) + replaced + text.slice(lineEnd);

		emit(next, lineStart, lineStart + replaced.length);
	};

	const insertLink = () => {
		const { start, end } = getSelection();

		const label = text.slice(start, end) || 'teks tautan';
		const insert = `[${label}](https://)`;

		const next = text.slice(0, start) + insert + text.slice(end);

		// Fokus langsung ke bagian URL.
		const urlStart = start + label.length + 3;

		emit(next, urlStart, urlStart + 8);
	};

	const insertImage = () => {
		const { start, end } = getSelection();

		const alt = text.slice(start, end) || 'deskripsi gambar';
		const insert = `![${alt}](https://)`;

		const next = text.slice(0, start) + insert + text.slice(end);

		const urlStart = start + alt.length + 4;

		emit(next, urlStart, urlStart + 8);
	};

	const insertRule = () => {
		const { start, end } = getSelection();

		const insert = '\n\n---\n\n';

		const next = text.slice(0, start) + insert + text.slice(end);

		const position = start + insert.length;

		emit(next, position, position);
	};

	const tools = [
		{
			key: 'bold',
			icon: Bold,
			label: 'Tebal (Ctrl+B)',
			run: () => wrap('**', '**', 'teks tebal'),
		},
		{
			key: 'italic',
			icon: Italic,
			label: 'Miring (Ctrl+I)',
			run: () => wrap('*', '*', 'teks miring'),
		},
		{
			key: 'strike',
			icon: Strikethrough,
			label: 'Coret',
			run: () => wrap('~~', '~~', 'teks coret'),
		},
		'divider',
		{
			key: 'h2',
			icon: Heading2,
			label: 'Judul bagian',
			run: () => prefixLines(() => '## ', 'Judul bagian'),
		},
		{
			key: 'h3',
			icon: Heading3,
			label: 'Sub judul',
			run: () => prefixLines(() => '### ', 'Sub judul'),
		},
		'divider',
		{
			key: 'ul',
			icon: List,
			label: 'Daftar poin',
			run: () => prefixLines(() => '- ', 'item'),
		},
		{
			key: 'ol',
			icon: ListOrdered,
			label: 'Daftar bernomor',
			run: () => prefixLines((index) => `${index + 1}. `, 'item'),
		},
		{
			key: 'quote',
			icon: Quote,
			label: 'Kutipan',
			run: () => prefixLines(() => '> ', 'kutipan'),
		},
		'divider',
		{
			key: 'code',
			icon: Code,
			label: 'Kode',
			run: () => wrap('`', '`', 'kode'),
		},
		{
			key: 'link',
			icon: LinkIcon,
			label: 'Tautan (Ctrl+K)',
			run: insertLink,
		},
		{
			key: 'image',
			icon: ImageIcon,
			label: 'Gambar',
			run: insertImage,
		},
		{
			key: 'hr',
			icon: Minus,
			label: 'Garis pemisah',
			run: insertRule,
		},
	];

	const modes = [
		{ key: 'write', icon: Pencil, label: 'Tulis' },
		{ key: 'split', icon: Columns, label: 'Berdampingan' },
		{ key: 'preview', icon: Eye, label: 'Preview' },
	];

	const handleKeyDown = (e) => {
		if (!(e.ctrlKey || e.metaKey)) return;

		const key = e.key.toLowerCase();

		if (key === 'b') {
			e.preventDefault();
			wrap('**', '**', 'teks tebal');
		} else if (key === 'i') {
			e.preventDefault();
			wrap('*', '*', 'teks miring');
		} else if (key === 'k') {
			e.preventDefault();
			insertLink();
		}
	};

	const showEditor = mode === 'write' || mode === 'split';
	const showPreview = mode === 'preview' || mode === 'split';

	return (
		<div style={styles.wrapper}>
			<div style={styles.topBar}>
				<div style={styles.toolGroup} role="toolbar" aria-label="Format markdown">
					{tools.map((tool, index) => {
						if (tool === 'divider') {
							return <span key={`divider-${index}`} style={styles.divider} />;
						}

						const Icon = tool.icon;
						const isHover = hovered === tool.key;

						return (
							<button
								key={tool.key}
								type="button"
								title={tool.label}
								aria-label={tool.label}
								disabled={mode === 'preview'}
								onClick={tool.run}
								onMouseEnter={() => setHovered(tool.key)}
								onMouseLeave={() => setHovered(null)}
								style={{
									...styles.toolBtn,
									background:
										isHover && mode !== 'preview' ? '#e2e6ea' : 'transparent',
									opacity: mode === 'preview' ? 0.4 : 1,
									cursor: mode === 'preview' ? 'not-allowed' : 'pointer',
								}}
							>
								<Icon size={17} />
							</button>
						);
					})}
				</div>

				<ButtonGroup size="sm" aria-label="Mode tampilan">
					{modes.map((item) => {
						const Icon = item.icon;

						return (
							<Button
								key={item.key}
								variant={mode === item.key ? 'primary' : 'outline-secondary'}
								onClick={() => setMode(item.key)}
								style={styles.modeBtn}
								aria-pressed={mode === item.key}
							>
								<Icon size={14} />
								<span>{item.label}</span>
							</Button>
						);
					})}
				</ButtonGroup>
			</div>

			<div style={styles.panes}>
				{showEditor && (
					<textarea
						ref={textareaRef}
						name={name}
						value={text}
						onChange={(e) => {
							selectionRef.current = {
								start: e.target.selectionStart,
								end: e.target.selectionEnd,
							};

							onChange(e);
						}}
						onKeyDown={handleKeyDown}
						onSelect={(e) => {
							selectionRef.current = {
								start: e.target.selectionStart,
								end: e.target.selectionEnd,
							};
						}}
						placeholder={placeholder}
						style={{
							...styles.textarea,
							height,
						}}
						spellCheck={false}
					/>
				)}

				{showPreview && (
					<div
						style={{
							...styles.preview,
							height,
							...(mode === 'split' ? styles.previewSplit : {}),
						}}
					>
						{text.trim() ? (
							<div
								dangerouslySetInnerHTML={{
									__html: html,
								}}
							/>
						) : (
							<span style={styles.empty}>Belum ada konten untuk ditampilkan.</span>
						)}
					</div>
				)}
			</div>

			<div style={styles.footer}>
				<span>Mendukung Markdown</span>
				<span>
					{words} kata · {text.length} karakter
				</span>
			</div>
		</div>
	);
};

export default MarkdownEditor;