import React, { useState, useRef, useEffect, isValidElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Spinner } from 'react-bootstrap';

import '@/pages/lms/lessonContent.css';

/* ==========================================================================
   HELPER
   ========================================================================== */

const LANG_BY_EXT = {
	py: 'Python',
	js: 'JavaScript',
	ts: 'TypeScript',
	java: 'Java',
	cpp: 'C++',
	c: 'C',
	html: 'HTML',
	css: 'CSS',
	sql: 'SQL',
	php: 'PHP',
};

/** Ambil teks mentah dari children React (tetap aman jika nanti ditambah syntax highlight). */
const nodeToText = (node) => {
	if (node == null || typeof node === 'boolean') return '';
	if (typeof node === 'string' || typeof node === 'number') return String(node);
	if (Array.isArray(node)) return node.map(nodeToText).join('');
	if (isValidElement(node)) return nodeToText(node.props.children);
	return '';
};

/* ==========================================================================
   CUSTOM RENDERER
   ========================================================================== */

/** Blok kode dengan header (label bahasa/nama file + tombol salin). */
const CodeBlock = ({ className, children }) => {
	const [copied, setCopied] = useState(false);
	const timerRef = useRef(null);

	useEffect(() => () => clearTimeout(timerRef.current), []);

	const source = nodeToText(children).replace(/\n$/, '');

	// Deteksi nama file dari komentar "File: xxx.ext" atau bahasa dari ```lang
	const fileMatch = source.match(/^\s*(?:#|\/\/|--)\s*File:\s*(\S+)/i);
	const filename = fileMatch?.[1] || '';
	const ext = filename.split('.').pop().toLowerCase();
	const classLang = /language-(\S+)/.exec(className || '')?.[1];
	const lang = LANG_BY_EXT[ext] || classLang || 'Kode';

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(source);
			setCopied(true);
			clearTimeout(timerRef.current);
			timerRef.current = setTimeout(() => setCopied(false), 1500);
		} catch (err) {
			console.error('Gagal menyalin kode:', err);
		}
	};

	return (
		<div className="lesson-code">
			<div className="lesson-code-header">
				<span className="lesson-code-lang">
					{filename ? `${lang} · ${filename}` : lang}
				</span>
				<button
					type="button"
					className={`lesson-code-copy${copied ? ' is-copied' : ''}`}
					onClick={handleCopy}
				>
					{copied ? 'Tersalin ✓' : 'Salin'}
				</button>
			</div>
			<pre>
				<code className={className}>{source}</code>
			</pre>
		</div>
	);
};

// Didefinisikan di luar komponen agar referensinya stabil antar render
const markdownComponents = {
	// ```fenced code``` -> CodeBlock (inline `code` tetap pakai render bawaan)
	pre: ({ children }) => {
		const codeEl = React.Children.toArray(children).find(isValidElement);
		return (
			<CodeBlock className={codeEl?.props?.className}>{codeEl?.props?.children}</CodeBlock>
		);
	},

	// Tabel scrollable di layar kecil
	table: ({ children }) => (
		<div className="lesson-table-wrap">
			<table>{children}</table>
		</div>
	),

	// Link eksternal dibuka di tab baru
	a: ({ href, children }) => {
		const isExternal = /^https?:\/\//i.test(href || '');
		return (
			<a href={href} {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}>
				{children}
			</a>
		);
	},

	// Gambar responsif
	img: ({ src, alt }) => <img src={src} alt={alt || ''} loading="lazy" className="img-fluid" />,
};

/* ==========================================================================
   COMPONENT
   ========================================================================== */

const LessonContent = ({ markdown = '', loading = false }) => {
	if (loading) {
		return (
			<div className="py-5 text-center text-muted d-flex flex-column align-items-center gap-2">
				<Spinner animation="border" variant="primary" size="sm" />
				<span style={{ fontSize: 'var(--font-sm)' }}>Memuat konten lesson...</span>
			</div>
		);
	}

	if (!markdown) return null;

	return (
		<div className="lesson-body-content">
			<ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
				{markdown}
			</ReactMarkdown>
		</div>
	);
};

export default LessonContent;
