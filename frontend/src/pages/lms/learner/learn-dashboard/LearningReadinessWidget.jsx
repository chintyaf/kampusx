import React from 'react';
import { READINESS_LEVELS, getReadinessLevel, scoreText } from './learningUtils';

const CX = 90;
const CY = 90;
const R = 76;
const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

/**
 * Learning Readiness Score (Random Forest, 0–1):
 * < 0,50 Belum Siap · 0,50–0,75 Cukup Siap · ≥ 0,75 Siap.
 *
 * Versi sederhana: gauge bersih, satu kalimat saran, dan detail
 * (faktor + feedback kuis) disembunyikan di balik "Lihat detail".
 */
const LearningReadinessWidget = ({ readiness }) => {
	const levelKey = getReadinessLevel(readiness.score);
	const level = READINESS_LEVELS[levelKey];

	return (
		<section className="ld-card ld-readiness">
			<div className="ld-card-head">
				<div>
					<h2 className="ld-title">Learning Readiness</h2>
					<p className="ld-sub">{readiness.moduleTitle}</p>
				</div>
			</div>

			<div className="ld-gauge">
				<svg
					viewBox="0 0 180 100"
					role="img"
					aria-label={`Readiness score ${scoreText(readiness.score)}`}
				>
					<path d={ARC} className="ld-gauge-track" pathLength="100" />
					<path
						d={ARC}
						className={`ld-gauge-value is-${level.tone}`}
						pathLength="100"
						strokeDasharray={`${readiness.score * 100} 100`}
					/>
					<text x={CX} y={CY - 4} textAnchor="middle" className="ld-gauge-score">
						{scoreText(readiness.score)}
					</text>
				</svg>
				<span className={`ld-chip is-${level.tone} ld-gauge-level`}>{level.label}</span>
			</div>

			<p className="ld-rd-action">{level.action}</p>

			<details className="ld-rd-details">
				<summary>Lihat detail</summary>

				<dl className="ld-rd-factors">
					{readiness.factors.map((f) => (
						<div key={f.label} className="ld-rd-factor">
							<dt>{f.label}</dt>
							<dd className={f.tone ? `is-${f.tone}` : ''}>{f.value}</dd>
						</div>
					))}
				</dl>

				{readiness.lastQuiz && (
					<div className="ld-rd-quiz">
						<p className="ld-rd-quiz-head">
							{readiness.lastQuiz.lesson}
							<strong>Skor {readiness.lastQuiz.score}</strong>
						</p>
						<p>{readiness.lastQuiz.feedback}</p>
					</div>
				)}
			</details>

			<p className="ld-note">
				Prediksi hanya panduan tindak lanjut belajar dan tidak mengunci akses ke materi.
			</p>
		</section>
	);
};

export default LearningReadinessWidget;
