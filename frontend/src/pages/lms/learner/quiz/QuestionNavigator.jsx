import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';

const LEGEND = [
	['is-answered', 'Sudah Dijawab'],
	['is-current', 'Sedang Dibuka'],
	['is-flagged', 'Ragu-Ragu / Review'],
];

const QuestionNavigator = ({
	questions,
	current,
	answers,
	flags,
	answeredCount,
	progressPercent,
	onSelect,
}) => {
	// Prioritas status: sedang dibuka > ragu-ragu > sudah dijawab
	const statusOf = (q, i) =>
		i === current
			? 'is-current'
			: flags[q.id]
				? 'is-flagged'
				: answers[q.id] != null
					? 'is-answered'
					: '';

	return (
		<Card className="qz-card qz-nav-card position-sticky" style={{ top: 88 }}>
			<div className="d-flex align-items-center justify-content-between mb-2">
				<h6 className="qz-eyebrow is-muted m-0">Navigasi Soal</h6>
				<span className="badge border fw-bold bg-light text-dark rounded-pill">
					{answeredCount} / {questions.length}
				</span>
			</div>

			<ProgressBar now={progressPercent} variant="success" className="mb-3" style={{ height: 6 }} />

			<div className="qz-nav-grid">
				{questions.map((q, i) => (
					<button
						key={q.id}
						className={`qz-nav-btn ${statusOf(q, i)}`}
						onClick={() => onSelect(i)}
						title={`Soal ${i + 1}`}
					>
						{i + 1}
						{flags[q.id] && <span className="qz-flag-mark" />}
					</button>
				))}
			</div>

			{answeredCount < questions.length && (
				<p className="qz-hint">
					Jawab semua soal untuk mengirim ({questions.length - answeredCount} belum dijawab).
				</p>
			)}

			<div className="qz-legend">
				{LEGEND.map(([cls, label]) => (
					<div key={cls}>
						<span className={`qz-dot ${cls}`} />
						<span>{label}</span>
					</div>
				))}
			</div>
		</Card>
	);
};

export default QuestionNavigator;
