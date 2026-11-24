import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import ModuleThumb from './ModuleThumb';
import { READINESS_LEVELS, SRL_PHASES, getReadinessLevel } from './learningUtils';

const TABS = [
	{ key: 'all', label: 'Semua' },
	{ key: 'in_progress', label: 'Berjalan' },
	{ key: 'completed', label: 'Selesai' },
];

const PAGE_SIZE = 5;

const PHASE_LABEL = Object.fromEntries(SRL_PHASES.map((p) => [p.key, p.label]));

/**
 * Bikin daftar nomor halaman dengan ellipsis, mis. [1, '…', 4, 5, 6, '…', 12]
 */
const getPageItems = (current, total) => {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	const items = [1];
	const start = Math.max(2, current - 1);
	const end = Math.min(total - 1, current + 1);
	if (start > 2) items.push('start-ellipsis');
	for (let i = start; i <= end; i++) items.push(i);
	if (end < total - 1) items.push('end-ellipsis');
	items.push(total);
	return items;
};

/**
 * Learning path Member: progres lesson, fase SRL aktif, skor kuis terakhir, dan Readiness Level per modul.
 */
const EnrolledModules = ({ modules = [], onContinue, onViewCertificate }) => {
	const navigate = useNavigate();
	const [tab, setTab] = useState('all');
	const [page, setPage] = useState(1);

	const handleContinue = (m) => {
		if (onContinue) {
			onContinue(m);
		} else {
			const targetId = m.id === 'enr-1' ? 'mod-arch-101' : m.id;
			navigate(`/learner/modules/${targetId}`);
		}
	};

	const handleViewCert = (m) => {
		if (onViewCertificate) {
			onViewCertificate(m);
		} else {
			navigate('/learner/learning-paths/lp-1/certificate');
		}
	};

	const counts = useMemo(
		() => ({
			all: modules.length,
			in_progress: modules.filter((m) => m.status === 'in_progress').length,
			completed: modules.filter((m) => m.status === 'completed').length,
		}),
		[modules],
	);

	const filtered = useMemo(
		() => (tab === 'all' ? modules : modules.filter((m) => m.status === tab)),
		[modules, tab],
	);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages);
	const startIdx = (currentPage - 1) * PAGE_SIZE;
	const visible = filtered.slice(startIdx, startIdx + PAGE_SIZE);

	// Reset ke halaman 1 saat tab berganti
	useEffect(() => {
		setPage(1);
	}, [tab]);

	// Jaga-jaga kalau data berkurang dan halaman saat ini jadi tidak valid
	useEffect(() => {
		if (page > totalPages) setPage(totalPages);
	}, [page, totalPages]);

	const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

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
										onClick={() => handleViewCert(m)}
									>
										<Icon name="award" size={14} /> Lihat Sertifikat
									</button>
								) : (
									<button
										type="button"
										className="ld-btn ld-btn-sm ld-btn-primary"
										onClick={() => handleContinue(m)}
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

			{filtered.length > PAGE_SIZE && (
				<nav className="ld-pagination" aria-label="Pagination learning path">
					<p className="ld-pagination-info">
						Menampilkan {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, filtered.length)}{' '}
						dari {filtered.length} modul
					</p>
					<div className="ld-pagination-controls">
						<button
							type="button"
							className="ld-page-btn"
							onClick={() => goTo(currentPage - 1)}
							disabled={currentPage === 1}
							aria-label="Halaman sebelumnya"
						>
							‹
						</button>
						{getPageItems(currentPage, totalPages).map((item) =>
							typeof item === 'number' ? (
								<button
									key={item}
									type="button"
									className={`ld-page-btn ${item === currentPage ? 'is-active' : ''}`}
									onClick={() => goTo(item)}
									aria-current={item === currentPage ? 'page' : undefined}
								>
									{item}
								</button>
							) : (
								<span key={item} className="ld-page-ellipsis" aria-hidden="true">
									…
								</span>
							),
						)}
						<button
							type="button"
							className="ld-page-btn"
							onClick={() => goTo(currentPage + 1)}
							disabled={currentPage === totalPages}
							aria-label="Halaman berikutnya"
						>
							›
						</button>
					</div>
				</nav>
			)}
		</section>
	);
};

export default EnrolledModules;
