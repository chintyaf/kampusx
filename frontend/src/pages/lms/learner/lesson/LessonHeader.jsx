import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { Clock, Bookmark, Share2 } from 'lucide-react';

const LessonHeader = ({ data = [] }) => {
	const { lessonId } = useParams();

	// Find active lesson langsung dari props data
	const activeLessonIndex = data.findIndex((l) => l.id === lessonId);
	const currentLessonIndex = activeLessonIndex !== -1 ? activeLessonIndex : 0;
	const currentLesson = data[currentLessonIndex] || {};

	const [isBookmarked, setIsBookmarked] = useState(false);

	return (
		<div className="">
			<div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
				<div className="d-flex align-items-center gap-2">
					<span
						className="badge px-3 py-1 rounded-pill fw-bold text-uppercase"
						style={{
							backgroundColor: '#E0F2FE',
							color: '#028090',
							fontSize: '0.75rem',
						}}
					>
						Unit {currentLesson.number} of {data.length}
					</span>
					<span
						className="text-muted small d-flex align-items-center gap-1"
						style={{ fontSize: '0.78rem' }}
					>
						<Clock size={13} />
						<span>{currentLesson.duration}</span>
					</span>
					<span
						className="badge rounded-pill bg-light text-muted border px-2 py-1"
						style={{ fontSize: '0.72rem' }}
					>
						+{currentLesson.xp} XP
					</span>
				</div>

				{/* <div className="d-flex align-items-center gap-2">
					<Button
						variant="light"
						size="sm"
						className="border p-2 rounded-circle text-muted d-flex align-items-center justify-content-center"
						style={{ width: '32px', height: '32px' }}
						title={isBookmarked ? 'Hapus Bookmark' : 'Bookmark Lesson'}
						onClick={() => setIsBookmarked(!isBookmarked)}
					>
						<Bookmark
							size={15}
							color={isBookmarked ? '#f59e0b' : '#64748b'}
							fill={isBookmarked ? '#f59e0b' : 'transparent'}
						/>
					</Button>
					<Button
						variant="light"
						size="sm"
						className="border p-2 rounded-circle text-muted d-flex align-items-center justify-content-center"
						style={{ width: '32px', height: '32px' }}
						title="Bagikan Tautan"
						onClick={() => {
							if (navigator.clipboard) {
								navigator.clipboard.writeText(window.location.href);
								alert('Tautan lesson berhasil disalin!');
							}
						}}
					>
						<Share2 size={15} />
					</Button>
				</div> */}
			</div>

			<h1 className="lesson-main-title">{currentLesson.title}</h1>

			<p className="text-muted mb-0" style={{ fontSize: '0.88rem', lineHeight: 1.55 }}>
				{currentLesson.summary}
			</p>
		</div>
	);
};

export default LessonHeader;
