import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Target, Lightbulb, BookOpen, Timer } from 'lucide-react';
import { Card, Badge, Alert } from 'react-bootstrap';

import LessonContent from './LessonContent';
import '@/pages/lms/lessonContent.css';

const formatTime = (totalSeconds) => {
	const mins = Math.floor(totalSeconds / 60);
	const secs = totalSeconds % 60;
	return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
};

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

	// Fetch konten Markdown dengan guard race condition
	useEffect(() => {
		if (!currentLesson.contentUrl) {
			setFetchedContent('');
			return;
		}

		let cancelled = false;
		setLoading(true);

		fetch(currentLesson.contentUrl)
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.text();
			})
			.then((md) => {
				if (!cancelled) setFetchedContent(md);
			})
			.catch((err) => {
				console.error('Gagal memuat file Markdown lesson:', err);
				if (!cancelled) setFetchedContent('_Gagal memuat materi lesson._');
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [currentLesson.contentUrl]);

	const markdown = currentLesson.content || fetchedContent;

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

				{/* D. MAIN CONTENT (Markdown) */}
				<LessonContent markdown={markdown} loading={loading} />

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