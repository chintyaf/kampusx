import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { ChevronLeft, ArrowRight, Award } from 'lucide-react';
import { MODULE_LESSONS_DATA } from './mockData';

const LessonFooter = () => {
	const { moduleId = 'mod-arch-101', lessonId = 'les-4' } = useParams();
	const navigate = useNavigate();

	const lessons = MODULE_LESSONS_DATA || [];
	const activeIndex = lessons.findIndex((l) => l.id === lessonId);
	const currentIndex = activeIndex !== -1 ? activeIndex : 0;
	const totalLessons = lessons.length;
	const isLastLesson = totalLessons > 0 && currentIndex === totalLessons - 1;

	// Persentase progres membaca
	const progressPercent =
		totalLessons > 0 ? Math.round(((currentIndex + 1) / totalLessons) * 100) : 0;

	const handlePrev = () => {
		if (currentIndex > 0) {
			const prevId = lessons[currentIndex - 1].id;
			navigate(`/learner/modules/${moduleId}/lesson/${prevId}`);
		}
	};

	const handleNext = () => {
		if (currentIndex < totalLessons - 1) {
			const nextId = lessons[currentIndex + 1].id;
			navigate(`/learner/modules/${moduleId}/lesson/${nextId}`);
		} else {
			navigate(`/learner/modules/${moduleId}/quiz`);
		}
	};

	return (
		<footer
			className="border-top py-2 px-3"
			style={{
				backgroundColor: 'var(--card)',
				borderColor: 'var(--border)',
			}}
		>
			<div className="d-flex align-items-center justify-content-between">
				{/* Tombol Sebelumnya */}
				<Button
					variant="outline-secondary"
					size="sm"
					className="d-inline-flex align-items-center gap-1 rounded-3 fw-semibold"
					disabled={currentIndex === 0}
					onClick={handlePrev}
					style={{
						color: 'var(--text-muted)',
						borderColor: 'var(--neutral-border)',
					}}
				>
					<ChevronLeft size={16} />
					<span className="d-none d-sm-inline">Lesson Sebelumnya</span>
					<span className="d-sm-none">Prev</span>
				</Button>

				{/* Tombol Selanjutnya / Selesai */}
				<Button
					size="sm"
					className="d-inline-flex align-items-center gap-1 rounded-3 fw-bold text-white shadow-sm border-0"
					onClick={handleNext}
					style={{
						backgroundColor: isLastLesson ? 'var(--success-text)' : 'var(--primary)',
					}}
				>
					{isLastLesson ? (
						<>
							<span className="d-none d-sm-inline">Kuis Modul</span>
							<span className="d-sm-none">Kuis</span>
							<Award size={16} />
						</>
					) : (
						<>
							<span className="d-none d-sm-inline">Lesson Berikutnya</span>
							<span className="d-sm-none">Next</span>
							<ArrowRight size={16} />
						</>
					)}
				</Button>
			</div>
		</footer>
	);
};

export default LessonFooter;
