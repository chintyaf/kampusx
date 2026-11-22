import React from 'react';
import { Card } from 'react-bootstrap';
import { Layers, BookOpen, Award } from 'lucide-react';

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const StatItem = ({ icon: Icon, value, label }) => (
	<div
		className="flex-fill text-center rounded-3 py-2 px-1"
		style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
	>
		<Icon size={16} style={{ color: '#028090' }} />
		<div className="fw-bold text-dark" style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>
			{value}
		</div>
		<div className="text-muted" style={{ fontSize: '0.7rem' }}>
			{label}
		</div>
	</div>
);

const LearningAnalytics = ({ metrics = {} }) => {
	const {
		progressPercent = 0,
		moduleCount = 0,
		completedModules = 0,
		lessonCount = 0,
		completedLessons = 0,
		averageScore = null,
	} = metrics;

	const percent = clamp(Number(progressPercent) || 0, 0, 100);
	const strokeDashoffset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
	const hasScore = averageScore !== null && averageScore !== undefined;

	return (
		<Card
			className="border-0 shadow-sm rounded-4 p-4 mb-4 bg-white"
			style={{ borderRadius: '16px' }}
		>
			<h5 className="fw-bold mb-3 text-dark" style={{ fontSize: '1.05rem' }}>
				Learning Analytics & Progress
			</h5>

			{/* Radial progress */}
			<div className="d-flex align-items-center justify-content-center my-3">
				<div style={{ position: 'relative', width: '120px', height: '120px' }}>
					<svg
						viewBox="0 0 120 120"
						style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}
						role="img"
						aria-label={`Progres ${percent} persen`}
					>
						<circle
							cx="60"
							cy="60"
							r={RADIUS}
							fill="none"
							stroke="#E2E8F0"
							strokeWidth="8"
						/>
						<circle
							cx="60"
							cy="60"
							r={RADIUS}
							fill="none"
							stroke="#028090"
							strokeWidth="8"
							strokeDasharray={CIRCUMFERENCE}
							strokeDashoffset={strokeDashoffset}
							strokeLinecap="round"
							style={{ transition: 'stroke-dashoffset 0.5s ease' }}
						/>
					</svg>
					<div
						style={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							textAlign: 'center',
						}}
					>
						<div
							className="fw-bold text-dark"
							style={{ fontSize: '1.5rem', lineHeight: 1 }}
						>
							{percent}%
						</div>
						<div
							className="text-muted"
							style={{ fontSize: '0.68rem', fontWeight: 600 }}
						>
							SELESAI
						</div>
					</div>
				</div>
			</div>

			<div className="text-center fw-semibold text-dark small mb-3">
				{completedModules} dari {moduleCount} modul selesai
			</div>

			<div className="d-flex gap-2">
				<StatItem
					icon={Layers}
					value={`${completedModules}/${moduleCount}`}
					label="Modul"
				/>
				<StatItem
					icon={BookOpen}
					value={`${completedLessons}/${lessonCount}`}
					label="Lesson"
				/>
				{hasScore && (
					<StatItem
						icon={Award}
						value={Math.round(averageScore)}
						label="Rata-rata skor"
					/>
				)}
			</div>
		</Card>
	);
};

export default LearningAnalytics;
