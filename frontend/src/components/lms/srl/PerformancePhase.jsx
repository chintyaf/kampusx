import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Target, CheckCircle2 } from 'lucide-react';
import { Button } from 'react-bootstrap';

const DEFAULT_TARGET_MINUTES = 25;
const RING_RADIUS = 52;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const formatTime = (totalSeconds) => {
	const s = Math.max(0, Math.floor(totalSeconds));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	const mm = String(m).padStart(2, '0');
	const ss = String(sec).padStart(2, '0');
	return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

const PerformancePhase = ({ srlData, updatePhaseData, closeModal, goToReflection, styles }) => {
	// ---- Data dari fase sebelumnya (Forethought) & fase ini ----
	// Sesuaikan nama field di bawah dengan struktur srlData milikmu.
	const plan = srlData?.forethought ?? {};
	const perf = srlData?.performance ?? {};

	const goal = plan.sessionGoal || plan.goal || plan.learningGoal || '';
	const targetMinutes =
		Number(plan.estimatedTime ?? plan.targetMinutes ?? plan.duration) || DEFAULT_TARGET_MINUTES;
	const targetSeconds = targetMinutes * 60;

	const accumulated = perf.accumulatedSeconds ?? 0;
	const startedAt = perf.startedAt ?? null;
	const isRunning = startedAt !== null;
	const hasStarted = perf.hasStarted ?? false;
	const notes = perf.notes ?? '';

	// Satu pintu untuk menyimpan data fase ini: updatePhaseData(fase, field, value)
	const save = (patch) =>
		Object.entries(patch).forEach(([field, value]) =>
			updatePhaseData('performance', field, value),
		);

	// ---- Timer berbasis timestamp: tetap akurat walau panel ditutup ----
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (!isRunning) return undefined;
		setNow(Date.now());
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, [isRunning]);

	// Tidak dibatasi targetSeconds, jadi waktu terus bertambah setelah target tercapai
	const elapsed = Math.max(
		0,
		accumulated + (isRunning ? Math.floor((now - startedAt) / 1000) : 0),
	);
	const reached = elapsed >= targetSeconds; // target tercapai
	const overtime = Math.max(0, elapsed - targetSeconds); // waktu tambahan
	const remaining = targetSeconds - elapsed;
	const progress = Math.min(elapsed / targetSeconds, 1); // ring maksimal penuh

	const displayTime = reached ? `+${formatTime(overtime)}` : formatTime(remaining);

	const handleStart = () => save({ startedAt: Date.now(), hasStarted: true });
	const handlePause = () => save({ accumulatedSeconds: elapsed, startedAt: null });
	const handleReset = () => save({ accumulatedSeconds: 0, startedAt: null, hasStarted: true });

	const handleRingClick = () => (isRunning ? handlePause() : handleStart());

	const ringAction = isRunning ? 'Jeda timer' : 'Lanjutkan timer';

	// Simpan total waktu aktual sebelum pindah ke Reflection
	const handleFinish = () => {
		if (isRunning) handlePause();
		goToReflection();
	};

	// Timer langsung berjalan saat fase ini pertama kali dibuka
	const autoStarted = useRef(false);
	useEffect(() => {
		if (autoStarted.current || hasStarted) return;
		autoStarted.current = true;
		handleStart();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<style>{`
				.perf {
					display: flex;
					flex-direction: column;
					gap: 22px;
					font-family: var(--font, inherit);
					color: var(--text);
				}

				/* ---------- Tujuan ---------- */
				.perf-goal {
					display: flex;
					gap: 10px;
					align-items: flex-start;
					padding: 12px 14px;
					border-radius: var(--radius);
					background: var(--info-bg);
					border: var(--border-w-xs) solid var(--info-border-color);
				}
				.perf-goal svg { color: var(--info-text); flex-shrink: 0; margin-top: 2px; }
				.perf-goal-label { font-size: var(--font-xs); color: var(--text-muted); }
				.perf-goal-text { font-size: var(--font-sm); font-weight: 600; color: var(--bahama-blue-900); line-height: 1.4; }

				/* ---------- Timer ---------- */
				.perf-timer {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 14px;
				}
				.perf-ring {
					position: relative;
					width: 168px;
					height: 168px;
					padding: 0;
					border: 0;
					border-radius: 50%;
					background: transparent;
					color: inherit;
					font: inherit;
					cursor: pointer;
					transition: transform .2s ease;
				}
				.perf-ring:hover { transform: scale(1.03); }
				.perf-ring:active { transform: scale(.98); }
				.perf-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
				.perf-ring-track { fill: none; stroke: var(--bahama-blue-100); stroke-width: 8; }
				.perf-ring-bar {
					fill: none;
					stroke: var(--primary);
					stroke-width: 8;
					stroke-linecap: round;
					stroke-dasharray: ${RING_LENGTH};
					stroke-dashoffset: ${RING_LENGTH * (1 - progress)};
					transition: stroke-dashoffset .9s linear, stroke .3s ease;
				}
				.perf-ring.is-done .perf-ring-bar { stroke: var(--success-text); }
				.perf-ring-center {
					position: absolute;
					inset: 0;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
				}
				.perf-time {
					font-size: 32px;
					font-weight: 800;
					letter-spacing: -0.5px;
					font-variant-numeric: tabular-nums;
					line-height: 1.1;
				}
				.perf-ring.is-done .perf-time { color: var(--success-text); }
				.perf-time-sub { margin-top: 4px; font-size: var(--font-xs); color: var(--text-muted); }

				.perf-state {
					display: inline-flex;
					align-items: center;
					gap: 6px;
					padding: 4px 12px;
					border-radius: var(--radius-full);
					font-size: var(--font-xs);
					font-weight: 600;
					background: var(--neutral-bg);
					color: var(--neutral-text);
					border: var(--border-w-xs) solid var(--neutral-border);
				}
				.perf-state.is-running { background: var(--info-bg); color: var(--info-text); border-color: var(--info-border-color); }
				.perf-state.is-done { background: var(--success-bg); color: var(--success-text); border-color: var(--success-border-color); }

				.perf-controls { display: flex; gap: 10px; }
				.perf-btn-main {
					display: inline-flex;
					align-items: center;
					gap: 8px;
					padding: 10px 22px;
					border: 0;
					border-radius: var(--radius-full);
					background: var(--primary);
					color: var(--color-white);
					font: inherit;
					font-size: var(--font-sm);
					font-weight: 700;
					cursor: pointer;
					transition: background .2s ease, transform .2s ease;
				}
				.perf-btn-main:hover { background: var(--bahama-blue-800); }
				.perf-btn-main:active { transform: scale(.97); }
				.perf-btn-main.is-pause { background: var(--warning-text); }
				.perf-btn-main.is-pause:hover { background: var(--warning-heading); }
				.perf-btn-icon {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					width: 42px;
					height: 42px;
					border-radius: 50%;
					border: var(--border-w-xs) solid var(--border-md);
					background: var(--card);
					color: var(--muted);
					cursor: pointer;
					transition: background .2s ease, color .2s ease;
				}
				.perf-btn-icon:hover { background: var(--neutral-bg); color: var(--text); }
				.perf-btn-icon:disabled { opacity: .5; cursor: not-allowed; }

				/* ---------- Catatan ---------- */
				.perf-section { display: flex; flex-direction: column; gap: 10px; }
				.perf-section-title { font-size: var(--font-sm); font-weight: 700; }

				.perf-notes {
					width: 100%;
					min-height: 92px;
					resize: vertical;
					padding: 12px 14px;
					border-radius: var(--radius);
					border: var(--border-w-xs) solid var(--border-md);
					background: var(--card);
					color: var(--text);
					font: inherit;
					font-size: var(--font-sm);
					line-height: 1.5;
					box-sizing: border-box;
				}
				.perf-notes::placeholder { color: var(--text-muted); }

				@media (prefers-reduced-motion: reduce) {
					.perf * { transition: none !important; }
				}
			`}</style>

			<div className="perf">
				{goal && (
					<div className="perf-goal">
						<Target size={18} />
						<div>
							<div className="perf-goal-label">Tujuan belajar kamu</div>
							<div className="perf-goal-text">{goal}</div>
						</div>
					</div>
				)}

				{/* ---------- Waktu belajar ---------- */}
				<div className="perf-timer">
					<button
						type="button"
						className={`perf-ring${reached ? ' is-done' : ''}`}
						onClick={handleRingClick}
						title={ringAction}
						aria-label={`${ringAction}. ${reached ? 'Waktu tambahan' : 'Sisa waktu'} ${displayTime}`}
					>
						<svg viewBox="0 0 120 120" aria-hidden="true">
							<circle className="perf-ring-track" cx="60" cy="60" r={RING_RADIUS} />
							<circle className="perf-ring-bar" cx="60" cy="60" r={RING_RADIUS} />
						</svg>
						<span className="perf-ring-center">
							<span className="perf-time">{displayTime}</span>
							{reached && <span className="perf-time-sub">melebihi target</span>}
						</span>
					</button>

					<span
						className={`perf-state${reached ? ' is-done' : isRunning ? ' is-running' : ''}`}
					>
						{reached ? (
							<>
								<CheckCircle2 size={14} />
								{isRunning
									? 'Target tercapai · waktu tambahan berjalan'
									: 'Target tercapai · dijeda'}
							</>
						) : isRunning ? (
							'Sedang berjalan'
						) : (
							'Dijeda'
						)}
					</span>

					<div className="perf-controls">
						{isRunning ? (
							<button
								type="button"
								className="perf-btn-main is-pause"
								onClick={handlePause}
							>
								<Pause size={18} fill="currentColor" /> Jeda
							</button>
						) : (
							<button type="button" className="perf-btn-main" onClick={handleStart}>
								<Play size={18} fill="currentColor" /> Lanjutkan
							</button>
						)}
						<button
							type="button"
							className="perf-btn-icon"
							onClick={handleReset}
							disabled={elapsed === 0}
							title="Atur ulang waktu"
							aria-label="Atur ulang waktu"
						>
							<RotateCcw size={16} />
						</button>
					</div>
				</div>

				{/* ---------- Catatan ---------- */}
				<div className="perf-section">
					<label className="perf-section-title" htmlFor="perf-notes">
						Catatan belajar
					</label>
					<textarea
						id="perf-notes"
						className="perf-notes"
						value={notes}
						onChange={(e) => save({ notes: e.target.value })}
						placeholder="Tulis poin penting, bagian yang sulit, atau pertanyaan yang muncul."
					/>
				</div>

				{/* ---------- Aksi ---------- */}
				<div className="d-flex justify-content-between">
					<Button className="btn-primary" onClick={closeModal}>
						Lanjut Sesi
					</Button>
					<Button className="btn-secondary border" onClick={handleFinish}>
						Selesai
					</Button>
				</div>
			</div>
		</>
	);
};

export default PerformancePhase;
