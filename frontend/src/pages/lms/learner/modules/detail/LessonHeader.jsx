import React from 'react';

const LessonHeader = ({ totalLessons, uncompletedCount, lessonFilter, setLessonFilter }) => {
	return (
		<div
			className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2"
			style={{ fontFamily: 'var(--font)' }}
		>
			<div>
				<h3
					className="fw-bold mb-1"
					style={{ fontSize: 'var(--font-lg)', color: 'var(--text)' }}
				>
					Daftar Unit Pembelajaran
				</h3>
				<p
					className="mb-0"
					style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}
				>
					Pilih unit pembelajaran yang ingin kamu akses dan pelajari.
				</p>
			</div>

			{/* Filter Tabs */}
			<div
				className="btn-group p-1 border"
				style={{
					backgroundColor: 'var(--color-bg-2)',
					borderColor: 'var(--neutral-border)',
					borderRadius: 'var(--radius)',
				}}
			>
				<button
					type="button"
					className="btn btn-sm py-1 px-3 fw-medium"
					style={{
						borderRadius: 'var(--radius-sm)',
						fontSize: 'var(--font-xs)',
						backgroundColor: lessonFilter === 'all' ? 'var(--card)' : 'transparent',
						color: lessonFilter === 'all' ? 'var(--primary)' : 'var(--text-muted)',
						boxShadow: lessonFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
						border: 'none',
					}}
					onClick={() => setLessonFilter && setLessonFilter('all')}
				>
					Semua ({totalLessons})
				</button>
				<button
					type="button"
					className="btn btn-sm py-1 px-3 fw-medium"
					style={{
						borderRadius: 'var(--radius-sm)',
						fontSize: 'var(--font-xs)',
						backgroundColor:
							lessonFilter === 'uncompleted' ? 'var(--card)' : 'transparent',
						color:
							lessonFilter === 'uncompleted' ? 'var(--primary)' : 'var(--text-muted)',
						boxShadow:
							lessonFilter === 'uncompleted' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
						border: 'none',
					}}
					onClick={() => setLessonFilter && setLessonFilter('uncompleted')}
				>
					Belum Selesai ({uncompletedCount})
				</button>
			</div>
		</div>
	);
};

export default LessonHeader;
