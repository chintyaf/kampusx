import React from 'react';
import Icon from './Icon';

/**
 * Profil kompetensi Member (Vector Skill-Matrix) dan kesesuaian dengan pekerjaan:
 * Match Score (Cosine Similarity) beserta Skill Gap.
 */
const SkillMatrixWidget = ({ data, onOpenJobMatching }) => (
	<section className="ld-card">
		<div className="ld-card-head">
			<div>
				<h2 className="ld-title">Profil Kompetensi</h2>
				<p className="ld-sub">Terbentuk dari modul, hasil kuis, dan sertifikatmu</p>
			</div>
		</div>

		<div className="ld-skills">
			{data.skills.map((s) => (
				<div key={s.name} className="ld-skill">
					<div className="ld-progress-row">
						<span>{s.name}</span>
						<strong>{Math.round(s.level * 100)}%</strong>
					</div>
					<div className="ld-progress is-thin">
						<div className="ld-progress-bar" style={{ width: `${s.level * 100}%` }} />
					</div>
				</div>
			))}
		</div>

		{/* <h3 className="ld-subtitle">
			<Icon name="briefcase" size={14} /> Kesesuaian karier
		</h3>
		<div className="ld-jobs">
			{data.careerFit.map((j) => (
				<div key={j.role} className="ld-job">
					<div className="ld-job-head">
						<div>
							<strong>{j.role}</strong>
							<small>{j.company}</small>
						</div>
						<span className="ld-match">{Math.round(j.matchScore * 100)}%</span>
					</div>
					<div className="ld-chips">
						<small>Skill gap:</small>
						{j.gaps.map((g) => (
							<span key={g} className="ld-chip is-warning">
								{g}
							</span>
						))}
					</div>
				</div>
			))}
		</div>

		<button type="button" className="ld-btn ld-btn-outline ld-btn-block" onClick={onOpenJobMatching}>
			Lihat Job Matching <Icon name="arrow-right" size={14} />
		</button> */}
	</section>
);

export default SkillMatrixWidget;
