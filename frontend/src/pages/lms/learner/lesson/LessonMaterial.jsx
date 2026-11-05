import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Target, Lightbulb, BookOpen, Timer } from 'lucide-react';
import { Card, Badge, Spinner, Alert } from 'react-bootstrap';

import '@/pages/lms/lessonContent.css';

/* ==========================================================================
   HELPER: Normalisasi HTML lesson (lesson.html tetap polos / unstyled)
   ========================================================================== */

/**
 * Menghapus indentasi bawaan dari blok kode tanpa merusak indentasi aslinya.
 * Kasus khusus: baris pertama sering membawa indentasi tag HTML,
 * sedangkan baris lainnya tidak.
 */
const dedent = (text = '') => {
	const lines = text.replace(/\t/g, '    ').split('\n');
	while (lines.length && !lines[0].trim()) lines.shift();
	while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
	if (!lines.length) return '';

	const indentOf = (l) => l.match(/^ */)[0].length;
	const rest = lines.slice(1).filter((l) => l.trim());
	const restMin = rest.length ? Math.min(...rest.map(indentOf)) : 0;

	if (indentOf(lines[0]) > restMin) lines[0] = lines[0].trimStart();

	const min = Math.min(...lines.filter((l) => l.trim()).map(indentOf));
	return lines.map((l) => l.slice(min).replace(/\s+$/, '')).join('\n');
};

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

/** Bungkus <pre> dengan header (label bahasa + tombol salin). */
const buildCodeBlock = (doc, pre) => {
	const code = pre.querySelector('code');
	const source = dedent((code || pre).textContent);

	if (code) {
		// Buang whitespace nyasar antara <pre> dan <code>
		[...pre.childNodes].forEach((n) => {
			if (n !== code && n.nodeType === 3 && !n.textContent.trim()) {
				pre.removeChild(n);
			}
		});
		code.textContent = source;
	} else {
		pre.textContent = source;
	}

	// Deteksi bahasa & nama file dari komentar "File: xxx.ext" atau class language-xxx
	const fileMatch = source.match(/^\s*(?:#|\/\/|--)\s*File:\s*(\S+)/i);
	const filename = fileMatch?.[1] || '';
	const ext = filename.split('.').pop().toLowerCase();
	const classLang = code && [...code.classList].find((c) => c.startsWith('language-'));
	const lang = LANG_BY_EXT[ext] || (classLang ? classLang.replace('language-', '') : 'Kode');

	const wrap = doc.createElement('div');
	wrap.className = 'lesson-code';

	const header = doc.createElement('div');
	header.className = 'lesson-code-header';

	const label = doc.createElement('span');
	label.className = 'lesson-code-lang';
	label.textContent = filename ? `${lang} · ${filename}` : lang;

	const btn = doc.createElement('button');
	btn.type = 'button';
	btn.className = 'lesson-code-copy';
	btn.setAttribute('data-copy', '');
	btn.textContent = 'Salin';

	header.append(label, btn);
	pre.parentNode.insertBefore(wrap, pre);
	wrap.append(header, pre);
};

const normalizeLessonHtml = (html = '') => {
	if (!html) return '';

	// 1. Perbaiki typo tag seperti <h2"> -> <h2>
	const fixed = html.replace(/<h([1-6])"/gi, '<h$1');
	const doc = new DOMParser().parseFromString(fixed, 'text/html');

	// 2. Blok kode: rapikan + bungkus dengan header
	doc.querySelectorAll('pre').forEach((pre) => buildCodeBlock(doc, pre));

	// 3. Tabel scrollable di layar kecil
	doc.querySelectorAll('table').forEach((table) => {
		const wrap = doc.createElement('div');
		wrap.className = 'lesson-table-wrap';
		table.parentNode.insertBefore(wrap, table);
		wrap.appendChild(table);
	});

	// 4. Link eksternal dibuka di tab baru
	doc.querySelectorAll('a[href^="http"]').forEach((a) => {
		a.setAttribute('target', '_blank');
		a.setAttribute('rel', 'noopener noreferrer');
	});

	return doc.body.innerHTML;
};

const formatTime = (totalSeconds) => {
	const mins = Math.floor(totalSeconds / 60);
	const secs = totalSeconds % 60;
	return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
};

/* ==========================================================================
   COMPONENT
   ========================================================================== */

const LessonMaterial = ({ data = [], item, forethoughtData, onCompleteLesson }) => {
	const { lessonId } = useParams();

	const currentLesson =
		item || data.find((l) => String(l.id) === String(lessonId)) || data[0] || {};

	const [fetchedContent, setFetchedContent] = useState('');
	const [loading, setLoading] = useState(false);
	const [secondsSpent, setSecondsSpent] = useState(0);

	// Timer aktif belajar, reset setiap pindah lesson
	useEffect(() => {
		setSecondsSpent(0);
		const timer = setInterval(() => setSecondsSpent((p) => p + 1), 1000);
		return () => clearInterval(timer);
	}, [currentLesson.id]);

	// Fetch konten HTML dengan guard race condition
	useEffect(() => {
		if (!currentLesson.contentUrl) {
			setFetchedContent('');
			return;
		}

		let cancelled = false;
		setLoading(true);

		fetch(currentLesson.contentUrl)
			.then((res) => res.text())
			.then((html) => {
				if (!cancelled) setFetchedContent(html);
			})
			.catch((err) => {
				console.error('Gagal memuat file HTML lesson:', err);
				if (!cancelled) {
					setFetchedContent('<p class="text-danger">Gagal memuat materi lesson.</p>');
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [currentLesson.contentUrl]);

	const htmlContent = useMemo(
		() => normalizeLessonHtml(currentLesson.content || fetchedContent),
		[currentLesson.content, fetchedContent],
	);

	// Tombol "Salin" pada blok kode (event delegation)
	const handleContentClick = async (e) => {
		const btn = e.target.closest('[data-copy]');
		if (!btn) return;

		const pre = btn.closest('.lesson-code')?.querySelector('pre');
		if (!pre) return;

		try {
			await navigator.clipboard.writeText(pre.textContent);
			btn.textContent = 'Tersalin ✓';
			btn.classList.add('is-copied');
			setTimeout(() => {
				btn.textContent = 'Salin';
				btn.classList.remove('is-copied');
			}, 1500);
		} catch (err) {
			console.error('Gagal menyalin kode:', err);
		}
	};

	return (
		<Card
			className="shadow-sm border-0 rounded-3 mb-4"
			style={{ backgroundColor: 'var(--card)' }}
		>
			<Card.Body className="p-4 p-md-5">
				{/* A. FORETHOUGHT REMINDER */}
				{forethoughtData?.goal && (
					<Card
						className="border-0 shadow-sm mb-4 overflow-hidden"
						style={{
							backgroundColor: 'var(--bahama-blue-50)',
							borderLeft: '4px solid var(--primary)',
						}}
					>
						<Card.Body className="p-3 d-flex align-items-start gap-3">
							<div className="p-2 rounded-circle bg-white shadow-sm text-primary flex-shrink-0 d-flex align-items-center justify-content-center">
								<Target size={18} />
							</div>
							<div className="w-100">
								<div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-1">
									<span
										className="fw-bold text-uppercase text-primary"
										style={{
											fontSize: 'var(--font-xs)',
											letterSpacing: '0.5px',
										}}
									>
										Target Belajar Sesi Ini (Forethought)
									</span>
									<Badge bg="primary" className="fw-medium px-2 py-1">
										{forethoughtData.strategy || 'Fokus Membaca'}
									</Badge>
								</div>
								<p
									className="mb-0 text-dark fw-medium"
									style={{ fontSize: 'var(--font-sm)' }}
								>
									"{forethoughtData.goal}"
								</p>
							</div>
						</Card.Body>
					</Card>
				)}

				{/* B. HEADER METADATA & TIMER */}
				<div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4 pb-3 border-bottom">
					<div className="d-flex align-items-center gap-2 flex-wrap">
						<Badge
							bg="light"
							text="dark"
							className="border d-flex align-items-center gap-1 px-2 py-1 fw-normal"
							style={{ fontSize: 'var(--font-xs)' }}
						>
							<BookOpen size={13} className="text-primary" />
							<span>{currentLesson.moduleName || 'Modul Pembelajaran'}</span>
						</Badge>

						<span className="text-muted" style={{ fontSize: 'var(--font-xs)' }}>
							•
						</span>

						<span
							className="d-flex align-items-center gap-1 text-muted"
							style={{ fontSize: 'var(--font-xs)' }}
						>
							<Clock size={13} /> Est. {currentLesson.duration || '10 min'}
						</span>
					</div>

					<div
						className="d-flex align-items-center gap-1 text-primary fw-semibold"
						style={{ fontSize: 'var(--font-xs)' }}
					>
						<Timer size={14} />
						<span>Waktu Belajar: {formatTime(secondsSpent)}</span>
					</div>
				</div>

				{/* C. TITLE & SUMMARY */}
				<h1 className="lesson-title">{currentLesson.title || 'Materi Pelajaran'}</h1>

				{currentLesson.summary && (
					<Alert
						variant="light"
						className="mb-4 border-0 border-start border-4 border-primary bg-light p-3"
					>
						<p
							className="mb-0 text-muted"
							style={{ fontSize: 'var(--font-sm)', lineHeight: 1.65 }}
						>
							{currentLesson.summary}
						</p>
					</Alert>
				)}

				{/* D. MAIN CONTENT */}
				{loading ? (
					<div className="py-5 text-center text-muted d-flex flex-column align-items-center gap-2">
						<Spinner animation="border" variant="primary" size="sm" />
						<span style={{ fontSize: 'var(--font-sm)' }}>Memuat konten lesson...</span>
					</div>
				) : htmlContent ? (
					<div
						className="lesson-body-content"
						onClick={handleContentClick}
						dangerouslySetInnerHTML={{ __html: htmlContent }}
					/>
				) : null}

				{/* E. PERTANYAAN REFLEKSI */}
				{currentLesson.reflectionQuestion && (
					<Alert variant="warning" className="p-3 mt-4 mb-0 border-0 shadow-sm">
						<div
							className="d-flex align-items-center gap-2 mb-2 fw-bold text-warning-emphasis"
							style={{ fontSize: 'var(--font-xs)' }}
						>
							<Lightbulb size={16} />
							<span>PERTANYAAN REFLEKSI MANDIRI</span>
						</div>
						<p className="mb-0 text-dark" style={{ fontSize: 'var(--font-sm)' }}>
							{currentLesson.reflectionQuestion}
						</p>
					</Alert>
				)}
			</Card.Body>
		</Card>
	);
};

export default LessonMaterial;
