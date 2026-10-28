import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Code } from 'lucide-react';

import '@/pages/lms/lessonContent.css';

const LessonMaterial = ({ data = [], item }) => {
	const { lessonId } = useParams();

	// 1. Ambil lesson aktif dari prop `item` atau cari berdasarkan `lessonId` di URL
	const currentLesson =
		item || data.find((l) => String(l.id) === String(lessonId)) || data[0] || {};

	// 2. State untuk menampung konten HTML jika menggunakan `contentUrl`
	const [fetchedContent, setFetchedContent] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// Jika lesson memiliki path file HTML (contoh: '/content-lesson/lesson_01.html')
		if (currentLesson.contentUrl) {
			setLoading(true);
			fetch(currentLesson.contentUrl)
				.then((res) => res.text())
				.then((html) => {
					setFetchedContent(html);
					setLoading(false);
				})
				.catch((err) => {
					console.error('Gagal memuat file HTML lesson:', err);
					setFetchedContent('<p class="text-danger">Gagal memuat materi lesson.</p>');
					setLoading(false);
				});
		} else {
			setFetchedContent('');
		}
	}, [currentLesson.contentUrl]);

	return (
		<div
			className="py-4 px-3 px-md-4 mx-auto"
			style={{
				backgroundColor: 'var(--card)',
				borderRadius: 'var(--radius-lg)',
			}}
		>
			{/* 1. Header Metadata / Badge */}
			<div
				className="d-flex align-items-center flex-wrap gap-2 mb-3"
				style={{ fontSize: 'var(--font-xs)' }}
			>
				<span
					className="fw-semibold px-2 py-1 text-uppercase"
					style={{
						backgroundColor: 'var(--purple-bg)',
						color: 'var(--purple-text)',
						border: 'var(--border-w-xs) solid var(--purple-border-color)',
						borderRadius: 'var(--radius-xs)',
						fontSize: 'var(--font-xs)',
						letterSpacing: '0.5px',
					}}
				>
					{currentLesson.format || currentLesson.type || 'TEXT'}
				</span>

				<span
					className="d-flex align-items-center gap-1"
					style={{ color: 'var(--text-muted)' }}
				>
					<Clock size={14} /> {currentLesson.duration || '10 min'}
				</span>

				<span style={{ color: 'var(--text-muted)' }}>•</span>

				<span style={{ color: 'var(--text-muted)' }}>
					{currentLesson.moduleName || 'Modul Pembelajaran'}
				</span>
			</div>

			{/* 2. Title & Summary */}
			<h1
				className="fw-bold mb-3"
				style={{ fontSize: 'var(--font-xl)', color: 'var(--text)', lineHeight: '1.3' }}
			>
				{currentLesson.title || 'Materi Pelajaran'}
			</h1>

			{currentLesson.summary && (
				<p
					className="mb-4"
					style={{
						fontSize: 'var(--font-sm)',
						color: 'var(--text-muted)',
						lineHeight: '1.65',
					}}
				>
					{currentLesson.summary}
				</p>
			)}

			{/* 3. Main Content (Render HTML string `content` atau `contentUrl` fetched) */}
			{loading ? (
				<div className="py-4 text-center text-muted">Memuat konten lesson...</div>
			) : currentLesson.content || fetchedContent ? (
				<div
					className="lesson-content lesson-body-content mb-4"
					style={{ fontSize: 'var(--font-sm)', lineHeight: '1.7', color: 'var(--text)' }}
					dangerouslySetInnerHTML={{
						__html: currentLesson.content || fetchedContent,
					}}
				/>
			) : null}

		</div>
	);
};

export default LessonMaterial;
