import React from 'react';
import Icon from './Icon';
import ModuleThumb from './ModuleThumb';
import { SRL_PHASES } from './learningUtils';

const CTA_LABEL = {
	forethought: 'Atur Target Belajar',
	performance: 'Lanjutkan Belajar',
	reflection: 'Isi Refleksi',
};

/**
 * Kartu "lanjutkan belajar": modul aktif + posisi Member pada siklus SRL
 * (Forethought → Performance → Self-Reflection) dan konteks sesi yang sedang berjalan.
 */
const ContinueLearningCard = ({ module, onContinue, onViewAll }) => {
	const { forethought, performance } = module.session || {};
	const currentIdx = SRL_PHASES.findIndex((p) => p.key === module.srlPhase);
	const progress = Math.round((module.lessonsDone / module.lessonTotal) * 100);
	const estimated = forethought?.estimatedTime || 0;
	const studied = performance ? Math.round(performance.accumulatedSeconds / 60) : 0;
	const timePct = estimated ? Math.min(100, Math.round((studied / estimated) * 100)) : 0;

	return (
		<section className="ld-card ld-active">
			<ModuleThumb module={module} className="ld-active-thumb" />

			<div className="ld-active-body">
				<div className="ld-chips">
					<span className="ld-chip is-primary">Lanjutkan belajar</span>
					<span className="ld-chip is-neutral">{module.category}</span>
					<span className="ld-active-left">
						<Icon name="clock" size={14} /> {module.minutesLeft} menit tersisa
					</span>
				</div>

				<h2 className="ld-active-title">{module.title}</h2>
				<p className="ld-sub">
					Lesson {module.currentLesson} dari {module.lessonTotal} · {module.lessonTitle}
				</p>

				<div className="ld-progress-row">
					<span>
						Progres modul · {module.lessonsDone}/{module.lessonTotal} lesson
					</span>
					<strong>{progress}%</strong>
				</div>
				<div className="ld-progress">
					<div className="ld-progress-bar" style={{ width: `${progress}%` }} />
				</div>

				<ol className="ld-srl-steps">
					{SRL_PHASES.map((p, i) => {
						const state = i < currentIdx ? 'is-done' : i === currentIdx ? 'is-current' : '';
						return (
							<li key={p.key} className={`ld-srl-step ${state}`}>
								<span className="ld-srl-dot">
									<Icon name={i < currentIdx ? 'check' : p.icon} size={14} />
								</span>
								<span className="ld-srl-text">
									<strong>{p.label}</strong>
									<small>{p.hint}</small>
								</span>
							</li>
						);
					})}
				</ol>

				{forethought && (
					<div className="ld-session">
						<div className="ld-session-goal">
							<small>Target sesi ini</small>
							<p>{forethought.sessionGoal}</p>
							<div className="ld-chips">
								{forethought.selectedStrategies.map((s) => (
									<span key={s} className="ld-chip is-purple">
										{s}
									</span>
								))}
							</div>
						</div>
						<div className="ld-session-time">
							<small>Waktu belajar</small>
							<p>
								<strong>{studied}</strong> / {estimated} menit
							</p>
							<div className="ld-progress is-thin">
								<div className="ld-progress-bar is-purple" style={{ width: `${timePct}%` }} />
							</div>
						</div>
					</div>
				)}

				<div className="ld-actions">
					<button type="button" className="ld-btn ld-btn-primary" onClick={onContinue}>
						<Icon name="play" size={14} /> {CTA_LABEL[module.srlPhase] || 'Lanjutkan Belajar'}
					</button>
					<button type="button" className="ld-link" onClick={onViewAll}>
						Lihat semua modul <Icon name="arrow-right" size={14} />
					</button>
				</div>
			</div>
		</section>
	);
};

export default ContinueLearningCard;
