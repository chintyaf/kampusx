import React, { useMemo, useState } from 'react';
import Icon from './Icon';
import { GOAL_STATUS, formatSessionDate } from './learningUtils';

const DAY = 86400000;
const FILTERS = [
	{ key: 'all', label: 'Semua' },
	{ key: 'tercapai', label: 'Tercapai' },
	{ key: 'sebagian', label: 'Sebagian' },
	{ key: 'belum', label: 'Belum' },
];
const PREVIEW = 4;

/**
 * Riwayat sesi SRL: ringkasan dan detail tiga fase
 * (Forethought → Performance → Self-Reflection) per sesi.
 */
const SRLHistory = ({ sessions = [] }) => {
	const [filter, setFilter] = useState('all');
	const [openId, setOpenId] = useState(null);
	const [showAll, setShowAll] = useState(false);

	const sorted = useMemo(
		() => [...sessions].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)),
		[sessions],
	);

	const summary = useMemo(() => {
		const now = Date.now();
		const recent = sorted.filter((s) => now - new Date(s.startedAt) <= 7 * DAY);
		const achieved = sorted.filter((s) => s.reflection.goalAchievement === 'tercapai').length;

		const stat = {};
		sorted.forEach((s) =>
			s.forethought.selectedStrategies.forEach((name) => {
				stat[name] = stat[name] || { used: 0, ok: 0 };
				stat[name].used += 1;
				if (s.reflection.goalAchievement === 'tercapai') stat[name].ok += 1;
			}),
		);
		const best = Object.entries(stat)
			.filter(([, v]) => v.used >= 2)
			.sort(([, a], [, b]) => b.ok / b.used - a.ok / a.used || b.ok - a.ok)[0];

		return { recent: recent.length, achieved, best };
	}, [sorted]);

	const counts = useMemo(
		() => ({
			all: sorted.length,
			tercapai: sorted.filter((s) => s.reflection.goalAchievement === 'tercapai').length,
			sebagian: sorted.filter((s) => s.reflection.goalAchievement === 'sebagian').length,
			belum: sorted.filter((s) => s.reflection.goalAchievement === 'belum').length,
		}),
		[sorted],
	);

	const filtered =
		filter === 'all' ? sorted : sorted.filter((s) => s.reflection.goalAchievement === filter);
	const visible = showAll ? filtered : filtered.slice(0, PREVIEW);

	return (
		<section className="ld-card">
			<div className="ld-card-head">
				<div>
					<h2 className="ld-title">Riwayat SRL</h2>
					<p className="ld-sub">
						Tinjau rencana, proses, dan refleksi dari setiap sesi belajarmu
					</p>
				</div>
				<div className="ld-tabs" role="tablist">
					{FILTERS.map((f) => (
						<button
							key={f.key}
							type="button"
							role="tab"
							aria-selected={filter === f.key}
							className={`ld-tab ${filter === f.key ? 'is-active' : ''}`}
							onClick={() => {
								setFilter(f.key);
								setShowAll(false);
							}}
						>
							{f.label} <span className="ld-count">{counts[f.key]}</span>
						</button>
					))}
				</div>
			</div>

			<div className="ld-kpis">
				<div className="ld-kpi">
					<Icon name="calendar" size={18} />
					<div>
						<small>Sesi 7 hari terakhir</small>
						<strong>{summary.recent} sesi</strong>
					</div>
				</div>
				<div className="ld-kpi">
					<Icon name="target" size={18} />
					<div>
						<small>Target tercapai</small>
						<strong>
							{summary.achieved} dari {sorted.length} sesi
						</strong>
					</div>
				</div>
				<div className="ld-kpi">
					<Icon name="zap" size={18} />
					<div>
						<small>Strategi paling efektif</small>
						<strong>{summary.best ? summary.best[0] : '-'}</strong>
						{summary.best && (
							<em>
								{summary.best[1].ok} dari {summary.best[1].used} sesi tercapai
							</em>
						)}
					</div>
				</div>
			</div>

			<div className="ld-srl-layout">
				<div className="ld-srl-list">
					{visible.map((s) => {
						const status = GOAL_STATUS[s.reflection.goalAchievement];
						const actual = Math.round(s.performance.accumulatedSeconds / 60);
						const planned = s.forethought.estimatedTime;
						const open = openId === s.id;
						return (
							<article
								key={s.id}
								className={`ld-session-item ${open ? 'is-open' : ''}`}
							>
								<button
									type="button"
									className="ld-session-head"
									aria-expanded={open}
									onClick={() => setOpenId(open ? null : s.id)}
								>
									<span className={`ld-status-icon is-${status.tone}`}>
										<Icon name={status.icon} size={18} />
									</span>
									<span className="ld-session-info">
										<strong>{s.forethought.sessionGoal}</strong>
										<small>
											{s.module}
											<i>·</i>
											{formatSessionDate(s.startedAt)}
										</small>
									</span>
									<span className="ld-session-time-col">
										<strong>{actual} menit</strong>
										<small>dari {planned}</small>
									</span>
									<span className={`ld-chip is-${status.tone}`}>
										{status.label}
									</span>
									<Icon name="chevron-down" size={16} className="ld-chevron" />
								</button>

								{open && (
									<div className="ld-phases">
										<div className="ld-phase">
											<h4>
												<Icon name="target" size={14} /> Forethought
											</h4>
											<small>Keyakinan awal</small>
											<div
												className="ld-dots"
												aria-label={`Keyakinan ${s.forethought.confidence} dari 5`}
											>
												{[1, 2, 3, 4, 5].map((n) => (
													<span
														key={n}
														className={
															n <= s.forethought.confidence
																? 'is-on'
																: ''
														}
													/>
												))}
											</div>
											<small>Strategi</small>
											<div className="ld-chips">
												{s.forethought.selectedStrategies.map((st) => (
													<span key={st} className="ld-chip is-purple">
														{st}
													</span>
												))}
											</div>
										</div>

										<div className="ld-phase">
											<h4>
												<Icon name="activity" size={14} /> Performance
											</h4>
											<small>Waktu aktual vs rencana</small>
											<p>
												<strong>{actual}</strong> / {planned} menit
											</p>
											<div className="ld-progress is-thin">
												<div
													className={`ld-progress-bar ${actual >= planned ? 'is-success' : 'is-warning'}`}
													style={{
														width: `${Math.min(100, (actual / planned) * 100)}%`,
													}}
												/>
											</div>
										</div>

										<div className="ld-phase">
											<h4>
												<Icon name="refresh" size={14} /> Self-Reflection
											</h4>
											<small>Faktor yang memengaruhi</small>
											<div className="ld-chips">
												{s.reflection.factors.map((f) => (
													<span key={f} className="ld-chip is-neutral">
														{f}
													</span>
												))}
											</div>
											<p>{s.reflection.evaluation}</p>
											<p className="ld-next">
												<Icon name="arrow-right" size={13} />{' '}
												{s.reflection.futureAdjustment}
											</p>
										</div>
									</div>
								)}
							</article>
						);
					})}
					{!visible.length && (
						<p className="ld-empty">Belum ada sesi pada kategori ini.</p>
					)}

					{filtered.length > PREVIEW && (
						<button
							type="button"
							className="ld-btn ld-btn-outline ld-btn-block"
							onClick={() => setShowAll(!showAll)}
						>
							{showAll
								? 'Tampilkan lebih sedikit'
								: `Lihat semua riwayat (${filtered.length})`}
						</button>
					)}
				</div>
			</div>
		</section>
	);
};

export default SRLHistory;
