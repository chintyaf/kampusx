import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Sesuaikan import jika diperlukan
import { ChevronLeft, Play, CheckSquare, Square, Brain, Clock } from 'lucide-react';
import LessonSidebarItem from './LessonSidebarItem';
import QuizSidebarItem from './QuizSidebarItem';

const LessonSidebar = ({ data = [] }) => {
	const { moduleId = 'mod-arch-101', lessonId = 'les-4' } = useParams();
	const navigate = useNavigate();

	// Cari lesson yang sedang aktif
	const activeLessonIndex = data.findIndex((l) => l.id === lessonId);
	const currentLessonIndex = activeLessonIndex !== -1 ? activeLessonIndex : 0;
	const currentLesson = data[currentLessonIndex] || data[0];

	// Track completed lessons set
	const [completedLessonIds] = useState(new Set(['les-1', 'les-2', 'les-3']));

	// Navigasi ke lesson yang dipilih
	const handleSelectLesson = (id) => {
		navigate(`/learner/lesson/${id}`);
	};

	// Hitung persentase progress secara aman (mencegah pembagian 0/NaN)
	const totalLessons = data.length;
	const progressPercent = totalLessons > 0 ? (completedLessonIds.size / totalLessons) * 100 : 0;

	return (
		<div className="d-flex flex-column h-100" style={{ backgroundColor: 'var(--card)' }}>
			{/* --- Sidebar Header --- */}
			<div className="p-3 border-bottom flex-shrink-0">
				<div className="d-flex align-items-center justify-content-between mb-2">
					<Link
						to={`/learner/modules/${moduleId}`}
						className="text-decoration-none d-inline-flex align-items-center gap-1"
						style={{
							fontSize: 'var(--font-xs)',
							color: 'var(--text-muted)',
						}}
					>
						<ChevronLeft size={14} style={{ color: 'var(--text-muted)' }} />
						<span>Kembali</span>
					</Link>
				</div>

				<h6
					className="fw-bold mb-2 mt-2"
					style={{ color: 'var(--text)', fontSize: '14px' }}
				>
					Web Architecture & REST API Design
				</h6>

				{/* Mini progress tracker */}
				<div className="d-flex align-items-center justify-content-between mb-1 small">
					<span className="fw-bold" style={{ fontSize: '10px', color: 'var(--text)' }}>
						{completedLessonIds.size} / {totalLessons}
					</span>

					<span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
						20%
					</span>
				</div>

				<div
					className="progress rounded-pill"
					style={{
						height: '5px',
						backgroundColor: 'var(--color-bg-2)',
					}}
				>
					<div
						className="progress-bar rounded-pill"
						style={{
							width: `${progressPercent}%`,
							backgroundColor: 'var(--primary)',
						}}
					/>
				</div>
			</div>

			{/* --- Lesson Units List --- */}
			<div className="flex-grow-1 overflow-auto">
				{data.map((item) => {
					const isQuiz = item.type === 'quiz' || item.type === 'assessment';

					if (isQuiz) {
						return (
							<QuizSidebarItem
								key={item.id}
								item={item}
								isSelected={item.id === currentLesson?.id}
								isDone={completedLessonIds.has(item.id)}
								isPassed={item.score >= (item.passingScore || 70)}
								score={item.score}
								onSelect={() => handleSelectLesson(item.id)}
							/>
						);
					}

					return (
						<LessonSidebarItem
							key={item.id}
							item={item}
							isSelected={item.id === currentLesson?.id}
							isDone={completedLessonIds.has(item.id)}
							onSelect={() => handleSelectLesson(item.id)}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default LessonSidebar;
