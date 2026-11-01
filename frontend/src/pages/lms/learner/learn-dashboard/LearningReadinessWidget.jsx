import React from 'react';
import Icon from './Icon';
import { READINESS_LEVELS, getReadinessLevel, scoreText } from './learningUtils';

const CX = 90;
const CY = 90;
const R = 76;
const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

// Titik pada busur setengah lingkaran untuk nilai t (0–1).
const pointAt = (t, r) => {
	const a = Math.PI * (1 - t);
	return [CX + r * Math.cos(a), CY - r * Math.sin(a)];
};

/**
 * Learning Readiness Score (Random Forest, 0–1) dengan tiga Readiness Level:
 * < 0,50 Belum Siap · 0,50–0,75 Cukup Siap · ≥ 0,75 Siap.
 */
const LearningReadinessWidget = ({ readiness }) => {
	const levelKey = getReadinessLevel(readiness.score);
	const level = READINESS_LEVELS[levelKey];

	return (
		<section className="ld-card">
			<div className="ld-card-head">
				<div>
					<h2 className="ld-title">Learning Readiness</h2>
					<p className="ld-sub">{readiness.moduleTitle}</p>
				</div>
			</div>

			<div className="ld-gauge">
				<svg viewBox="0 0 180 112" role="img" aria-label={`Readiness score ${scoreText(readiness.score)}`}>
					<path d={ARC} className="ld-gauge-track" pathLength="100" />
					<path
						d={ARC}
						className={`ld-gauge-value is-${level.tone}`}
						pathLength="100"
						strokeDasharray={`${readiness.score * 100} 100`}
					/>
					{[0.5, 0.75].map((t) => {
						const [x1, y1] = pointAt(t, R - 11);
						const [x2, y2] = pointAt(t, R + 11);
						return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} className="ld-gauge-tick" />;
					})}
					<text x={CX} y={CY - 6} textAnchor="middle" className="ld-gauge-score">
						{scoreText(readiness.score)}
					</text>
					<text x={CX} y={CY + 12} textAnchor="middle" className="ld-gauge-caption">
						Readiness Score
					</text>
					<text x={CX - R} y={CY + 24} textAnchor="middle" className="ld-gauge-axis">0</text>
					<text x={CX + R} y={CY + 24} textAnchor="middle" className="ld-gauge-axis">1</text>
				</svg>
				<span className={`ld-chip is-${level.tone} ld-gauge-level`}>{level.label}</span>
			</div>

			<div className={`ld-callout is-${level.tone}`}>
				<Icon name="lightbulb" size={16} />
				<p>{level.action}</p>
			</div>

			<h3 className="ld-subtitle">Faktor yang dianalisis</h3>
			<div className="ld-factors">
				{readiness.factors.map((f) => (
					<div key={f.label} className="ld-factor">
						<strong className={f.tone ? `is-${f.tone}` : ''}>{f.value}</strong>
						<small>{f.label}</small>
					</div>
				))}
			</div>

			{readiness.lastQuiz && (
				<div className="ld-quiz">
					<div className="ld-quiz-head">
						<small>{readiness.lastQuiz.lesson}</small>
						<span className="ld-chip is-primary">Skor {readiness.lastQuiz.score}</span>
					</div>
					<p>{readiness.lastQuiz.feedback}</p>
				</div>
			)}

			<p className="ld-note">
				Prediksi hanya panduan tindak lanjut belajar dan tidak mengunci akses ke materi.
			</p>
		</section>
	);
};

export default LearningReadinessWidget;
