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
		<footer className="border-top bg-white py-2 px-3">
			<div className="d-flex align-items-center justify-content-between">
				{/* Tombol Sebelumnya */}
				<Button
					variant="outline-secondary"
					size="sm"
					className="d-inline-flex align-items-center gap-1 rounded-3 fw-semibold"
					disabled={currentIndex === 0}
					onClick={handlePrev}
				>
					<ChevronLeft size={16} />
					<span className="d-none d-sm-inline">Lesson Sebelumnya</span>
					<span className="d-sm-none">Prev</span>
				</Button>

				{/* Indicator Progres */}
				<div className="d-flex align-items-center gap-2">
					<span className="text-muted small fw-medium d-none d-md-inline">
						Progres Membaca
					</span>
					<div
						className="bg-light rounded-pill overflow-hidden"
						style={{ width: 'clamp(80px, 15vw, 150px)', height: '6px' }}
					>
						<div
							className="bg-info h-100 rounded-pill"
							style={{
								width: `${progressPercent}%`,
								transition: 'width 0.3s ease',
							}}
						/>
					</div>
					<span className="text-muted small fw-bold font-monospace">
						{progressPercent}%
					</span>
				</div>

				{/* Tombol Selanjutnya / Selesai */}
				<Button
					variant={isLastLesson ? 'success' : 'dark'}
					size="sm"
					className="d-inline-flex align-items-center gap-1 rounded-3 fw-bold text-white shadow-sm"
					onClick={handleNext}
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
