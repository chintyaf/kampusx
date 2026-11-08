import React from 'react';
import { useNavigate } from 'react-router-dom';
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
	const navigate = useNavigate();
	const { forethought, performance } = module?.session || {};
	const currentIdx = SRL_PHASES.findIndex((p) => p.key === module?.srlPhase);
	const progress = module?.lessonTotal ? Math.round((module.lessonsDone / module.lessonTotal) * 100) : 60;

	const handleContinue = () => {
		if (onContinue) {
			onContinue();
		} else {
			const targetModule = module?.id === 'mod-rest-api' ? 'mod-arch-101' : (module?.id || 'mod-arch-101');
			navigate(`/learner/modules/${targetModule}`);
		}
	};

	const handleViewAll = () => {
		if (onViewAll) {
			onViewAll();
		} else {
			navigate('/explore-microlearning');
		}
	};

	return (
		<section className="ld-card ld-active">
			<div style={{ cursor: 'pointer' }} onClick={handleContinue}>
				<ModuleThumb module={module} className="ld-active-thumb" />
			</div>

			<div className="ld-active-body">
				<div className="ld-chips">
					<span className="ld-chip is-primary">Lanjutkan belajar</span>
					<span className="ld-chip is-neutral">{module.category}</span>
					<span className="ld-active-left">
						<Icon name="clock" size={14} /> {module.minutesLeft} menit tersisa
					</span>
				</div>

				<h2 className="ld-active-title" style={{ cursor: 'pointer' }} onClick={handleContinue}>
					{module.title}
				</h2>
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

				<div className="ld-actions">
					<button type="button" className="ld-btn ld-btn-primary" onClick={handleContinue}>
						<Icon name="play" size={14} /> {CTA_LABEL[module.srlPhase] || 'Lanjutkan Belajar'}
					</button>
					<button type="button" className="ld-link" onClick={handleViewAll}>
						Lihat semua modul <Icon name="arrow-right" size={14} />
					</button>
				</div>
			</div>
		</section>
	);
};

export default ContinueLearningCard;