import React, { useMemo, useState } from 'react';
import Icon from './Icon';
import ModuleThumb from './ModuleThumb';
import { READINESS_LEVELS, SRL_PHASES, getReadinessLevel } from './learningUtils';

const TABS = [
	{ key: 'all', label: 'Semua' },
	{ key: 'in_progress', label: 'Berjalan' },
	{ key: 'completed', label: 'Selesai' },
];

const PHASE_LABEL = Object.fromEntries(SRL_PHASES.map((p) => [p.key, p.label]));

/**
 * Learning path Member: progres lesson, fase SRL aktif, skor kuis terakhir, dan Readiness Level per modul.
 */
const EnrolledModules = ({ modules = [], onContinue, onViewCertificate }) => {
	const [tab, setTab] = useState('all');

	const counts = useMemo(
		() => ({
			all: modules.length,
			in_progress: modules.filter((m) => m.status === 'in_progress').length,
			completed: modules.filter((m) => m.status === 'completed').length,
		}),
		[modules],
	);
	const visible = tab === 'all' ? modules : modules.filter((m) => m.status === tab);

	return (
		<section className="ld-card">
			<div className="ld-card-head">
				<div>
					<h2 className="ld-title">Learning Path Saya</h2>
					<p className="ld-sub">Pantau progres, fase SRL, dan kesiapan di setiap modul</p>
				</div>
				<div className="ld-tabs" role="tablist">
					{TABS.map((t) => (
						<button
							key={t.key}
							type="button"
							role="tab"
							aria-selected={tab === t.key}
							className={`ld-tab ${tab === t.key ? 'is-active' : ''}`}
							onClick={() => setTab(t.key)}
						>
							{t.label} <span className="ld-count">{counts[t.key]}</span>
						</button>
					))}
				</div>
			</div>

			<div className="ld-rows">
				{visible.map((m) => {
					const pct = Math.round((m.lessonsDone / m.lessonTotal) * 100);
					const done = m.status === 'completed';
					const level = READINESS_LEVELS[getReadinessLevel(m.readiness)];
					return (
						<article key={m.id} className="ld-row">
							<ModuleThumb module={m} className="ld-row-thumb" />

							<div className="ld-row-main">
								<h3 className="ld-row-title">{m.title}</h3>
								<div className="ld-chips">
									<span className="ld-chip is-neutral">{m.category}</span>
									{done ? (
										<span className="ld-chip is-success">
											<Icon name="check-circle" size={12} /> Selesai
										</span>
									) : (
										<span className="ld-chip is-warning">Belum Selesai</span>
									)}
									<span className={`ld-chip is-${level.tone}`}>
										{level.label}
									</span>
								</div>
								<p className="ld-row-meta">
									{m.lessonsDone}/{m.lessonTotal} lesson
									<i>·</i>
									Kuis terakhir {m.lastQuizScore}
									<i>·</i>
									{m.lastActivity}
								</p>
							</div>

							<div className="ld-row-side">
								<div className="ld-progress-row">
									<span>Progres</span>
									<strong>{pct}%</strong>
								</div>
								<div className="ld-progress is-thin">
									<div
										className={`ld-progress-bar ${done ? 'is-success' : ''}`}
										style={{ width: `${pct}%` }}
									/>
								</div>
								{done ? (
									<button
										type="button"
										className="ld-btn ld-btn-sm ld-btn-outline"
										onClick={() => onViewCertificate?.(m)}
									>
										<Icon name="award" size={14} /> Lihat Sertifikat
									</button>
								) : (
									<button
										type="button"
										className="ld-btn ld-btn-sm ld-btn-primary"
										onClick={() => onContinue?.(m)}
									>
										<Icon name="play" size={12} /> Lanjutkan
									</button>
								)}
							</div>
						</article>
					);
				})}
				{!visible.length && <p className="ld-empty">Belum ada modul pada kategori ini.</p>}
			</div>
		</section>
	);
};

export default EnrolledModules;
