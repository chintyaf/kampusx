import React, { useState } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

// Sample dummy data jika tidak ada data dari props
const DEFAULT_REMEDIAL_LESSONS = [
	{
		id: 'l1',
		lessonNumber: 1,
		title: 'Lesson 1 — Dasar HTTP & REST API',
		status: 'Terlewat',
		question:
			'Manakah protokol yang paling umum digunakan untuk komunikasi antara client dan server pada REST API?',
		userAnswer: 'Belum dijawab',
		correctAnswer: 'HTTP/HTTPS',
		actionText: 'Pelajari Lesson 1',
	},
	{
		id: 'l2',
		lessonNumber: 2,
		title: 'Lesson 2 — HTTP Methods & Status Codes',
		status: 'Salah',
		question:
			'HTTP Method manakah yang bersifat idempotent dan digunakan untuk memperbarui resource secara keseluruhan?',
		userAnswer: 'POST',
		correctAnswer: 'PUT',
		actionText: 'Pelajari Lesson 2',
	},
];

const LessonReview = ({ currentOutcome, remedialLessons = DEFAULT_REMEDIAL_LESSONS }) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const remedialCount = currentOutcome?.remedialCount ?? remedialLessons.length;
	const lessons = remedialLessons.slice(0, remedialCount);

	const handlePrev = () => {
		setCurrentIndex((prev) => Math.max(prev - 1, 0));
	};

	const handleNext = () => {
		setCurrentIndex((prev) => Math.min(prev + 1, lessons.length - 1));
	};

	// Tampilan jika semua lesson sudah dikuasai (tidak ada remedial)
	if (remedialCount === 0 || lessons.length === 0) {
		return (
			<div style={{ marginTop: 32 }}>
				<span
					style={{
						fontSize: '0.78rem',
						color: '#64748B',
						fontWeight: 700,
						letterSpacing: '0.05em',
						textTransform: 'uppercase',
						display: 'block',
						marginBottom: 4,
					}}
				>
					Lesson Review
				</span>
				<Card
					style={{
						borderRadius: 16,
						background: '#F0FDF4',
						padding: 24,
						border: '1px solid #DCFCE7',
					}}
				>
					<div className="d-flex align-items-center gap-2">
						<CheckCircle2 size={20} className="text-success" />
						<h5
							style={{
								fontSize: '1rem',
								fontWeight: 700,
								color: '#166534',
								margin: 0,
							}}
						>
							Semua lesson telah dikuasai dengan baik!
						</h5>
					</div>
				</Card>
			</div>
		);
	}

	const currentLesson = lessons[currentIndex] || lessons[0];

	return (
		<div style={{ marginTop: 32 }}>
			<span
				style={{
					fontSize: '0.78rem',
					color: '#64748B',
					fontWeight: 700,
					letterSpacing: '0.05em',
					textTransform: 'uppercase',
					display: 'block',
					marginBottom: 4,
				}}
			>
				Lesson Review
			</span>

			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginBottom: 16,
				}}
			>
				<h5
					style={{
						fontSize: '1.2rem',
						fontWeight: 800,
						color: '#0F172A',
						margin: 0,
					}}
				>
					{`${remedialCount} lesson perlu ditinjau`}
				</h5>

				{lessons.length > 1 && (
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<button
							type="button"
							className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
							style={{ width: 32, height: 32 }}
							onClick={handlePrev}
							disabled={currentIndex === 0}
						>
							<ChevronLeft size={16} />
						</button>
						<span
							style={{
								fontSize: '0.8rem',
								color: '#64748B',
								fontWeight: 600,
							}}
						>
							{currentIndex + 1} dari {lessons.length}
						</span>
						<button
							type="button"
							className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
							style={{ width: 32, height: 32 }}
							onClick={handleNext}
							disabled={currentIndex === lessons.length - 1}
						>
							<ChevronRight size={16} />
						</button>
					</div>
				)}
			</div>

			{/* Card Recommendation Lesson */}
			<Card
				style={{
					borderRadius: 16,
					background: '#FFFFFF',
					padding: 24,
					border: 'none',
					borderLeft: '4px solid #F59E0B',
					boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: 12,
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<span
							style={{
								background: '#FEF3C7',
								color: '#78350F',
								fontSize: '0.75rem',
								fontWeight: 700,
								padding: '2px 8px',
								borderRadius: 6,
							}}
						>
							{currentLesson.lessonNumber}
						</span>
						<span
							style={{
								fontSize: '0.95rem',
								fontWeight: 700,
								color: '#0F172A',
							}}
						>
							{currentLesson.title}
						</span>
					</div>

					<Badge
						bg="warning-subtle"
						className="text-warning-emphasis"
						style={{
							fontSize: '0.72rem',
							borderRadius: 50,
							padding: '4px 10px',
							display: 'flex',
							alignItems: 'center',
							gap: 4,
							fontWeight: 600,
						}}
					>
						<AlertCircle size={12} /> {currentLesson.status}
					</Badge>
				</div>

				<p
					style={{
						fontSize: '0.9rem',
						fontWeight: 600,
						color: '#1E293B',
						marginBottom: 14,
					}}
				>
					{currentLesson.question}
				</p>

				<div
					style={{
						padding: '12px 16px',
						borderRadius: 10,
						background: '#F8FAFC',
						border: '1px solid #F1F5F9',
						marginBottom: 16,
					}}
				>
					<div
						style={{
							fontSize: '0.82rem',
							display: 'flex',
							alignItems: 'center',
							gap: 8,
							marginBottom: 4,
						}}
					>
						<span style={{ color: '#64748B' }}>Jawabanmu:</span>
						<span style={{ color: '#EF4444', fontWeight: 600 }}>
							{currentLesson.userAnswer}
						</span>
					</div>
					<div
						style={{
							fontSize: '0.82rem',
							display: 'flex',
							alignItems: 'center',
							gap: 8,
						}}
					>
						<span style={{ color: '#64748B' }}>Jawaban benar:</span>
						<span style={{ color: '#10B981', fontWeight: 700 }}>
							{currentLesson.correctAnswer}
						</span>
					</div>
				</div>

				<div>
					<Button
						size="sm"
						style={{
							backgroundColor: '#0284C7',
							borderColor: '#0284C7',
							fontSize: '0.82rem',
							fontWeight: 600,
							borderRadius: 8,
							padding: '8px 16px',
							display: 'inline-flex',
							alignItems: 'center',
							gap: 6,
							color: '#FFFFFF',
						}}
					>
						<span>{currentLesson.actionText}</span>
						<ChevronRight size={14} />
					</Button>
				</div>
			</Card>
		</div>
	);
};

export default LessonReview;
