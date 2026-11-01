import React from 'react';
import {
	Clock,
	Target,
	CheckCircle2,
	CircleDot,
	CircleDashed,
	ArrowLeft,
	Sparkles,
} from 'lucide-react';
import { Button, Row } from 'react-bootstrap';

// Self-judgment: membandingkan hasil dengan tujuan
const ACHIEVEMENT_OPTIONS = [
	{
		value: 'tercapai',
		label: 'Tercapai',
		hint: 'Sesuai target',
		icon: CheckCircle2,
		tone: 'success',
	},
	{
		value: 'sebagian',
		label: 'Sebagian',
		hint: 'Masih ada yang kurang',
		icon: CircleDot,
		tone: 'warning',
	},
	{ value: 'belum', label: 'Belum', hint: 'Perlu diulang', icon: CircleDashed, tone: 'danger' },
];

// Self-judgment: atribusi penyebab hasil belajar
const FACTOR_OPTIONS = [
	'Strategi belajar',
	'Fokus dan konsentrasi',
	'Manajemen waktu',
	'Tingkat kesulitan materi',
	'Pengetahuan awal',
	'Kondisi tubuh dan lingkungan',
];

const formatDuration = (totalSeconds) => {
	const s = Math.max(0, Math.floor(totalSeconds));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	if (h > 0) return `${h} jam ${m} menit`;
	if (m > 0) return sec > 0 ? `${m} menit ${sec} detik` : `${m} menit`;
	return `${sec} detik`;
};

const SelfReflectionPhase = ({
	srlData,
	updatePhaseData,
	backToPerformance,
	handleFinish,
	styles,
}) => {
	const plan = srlData?.forethought ?? {};
	const perf = srlData?.performance ?? {};
	const reflection = srlData?.reflection ?? {};

	const goal = plan.sessionGoal || plan.goal || plan.learningGoal || '';
	const targetMinutes = Number(plan.estimatedTime ?? plan.targetMinutes ?? plan.duration) || 0;
	const targetSeconds = targetMinutes * 60;

	// Waktu belajar dari fase Performance (termasuk jika timer masih berjalan)
	const liveSeconds = perf.startedAt ? Math.floor((Date.now() - perf.startedAt) / 1000) : 0;
	let studiedSeconds = (perf.accumulatedSeconds ?? 0) + liveSeconds;
	if (targetSeconds) studiedSeconds = Math.min(studiedSeconds, targetSeconds);
	const studiedPercent = targetSeconds
		? Math.round((studiedSeconds / targetSeconds) * 100)
		: null;

	const achievement = reflection.goalAchievement ?? '';
	const factors = Array.isArray(reflection.factors) ? reflection.factors : [];
	const evaluation = reflection.evaluation ?? '';
	const futureAdjustment = reflection.futureAdjustment ?? '';

	const save = (field, value) => updatePhaseData('reflection', field, value);

	const toggleFactor = (factor) =>
		save(
			'factors',
			factors.includes(factor) ? factors.filter((f) => f !== factor) : [...factors, factor],
		);

	return (
		<>
			<style>{`
				.refl {
					display: flex;
					flex-direction: column;
					gap: 22px;
					font-family: var(--font, inherit);
					color: var(--text);
				}

				/* ---------- Ringkasan sesi ---------- */
				.refl-summary {
					display: flex;
					flex-direction: column;
					gap: 12px;
					padding: 14px 16px;
					border-radius: var(--radius-lg);
					background: var(--bahama-blue-50);
					border: var(--border-w-xs) solid var(--primary-border);
				}
				.refl-summary-row { display: flex; gap: 10px; align-items: flex-start; }
				.refl-summary-row svg { color: var(--primary); flex-shrink: 0; margin-top: 2px; }
				.refl-summary-label { font-size: var(--font-xs); color: var(--text-muted); }
				.refl-summary-value { font-size: var(--font-sm); font-weight: 600; color: var(--bahama-blue-900); line-height: 1.4; }
				.refl-summary-note { color: var(--text-muted); font-weight: 400; }
				.refl-notes {
					margin: 0;
					padding-top: 12px;
					border-top: var(--border-w-xs) dashed var(--primary-border);
					font-size: var(--font-sm);
					line-height: 1.5;
					color: var(--text-muted);
					white-space: pre-wrap;
					max-height: 84px;
					overflow-y: auto;
				}

				/* ---------- Section ---------- */
				.refl-section { display: flex; flex-direction: column; gap: 10px; }
				.refl-title { font-size: var(--font-sm); font-weight: 700; }
				.refl-hint { font-size: var(--font-xs); color: var(--text-muted); margin-top: -6px; }

				/* ---------- Pencapaian ---------- */
				.refl-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
				.refl-option {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 4px;
					padding: 12px 6px;
					border-radius: var(--radius);
					border: var(--border-w-xs) solid var(--border-md);
					background: var(--card);
					color: var(--text-muted);
					font: inherit;
					cursor: pointer;
					transition: background .2s ease, border-color .2s ease, color .2s ease;
				}
				.refl-option:hover { border-color: var(--primary-mid); }
				.refl-option-label { font-size: var(--font-sm); font-weight: 700; color: var(--text); }
				.refl-option-hint { font-size: var(--font-xs); text-align: center; line-height: 1.25; }

				.refl-option.is-success.is-active { background: var(--success-bg); border-color: var(--success-border-color); color: var(--success-text); }
				.refl-option.is-warning.is-active { background: var(--warning-bg); border-color: var(--warning-border); color: var(--warning-heading); }
				.refl-option.is-danger.is-active { background: var(--danger-bg); border-color: var(--danger-border-color); color: var(--danger-text); }
				.refl-option.is-active .refl-option-label { color: inherit; }

				/* ---------- Faktor ---------- */
				.refl-chips { display: flex; flex-wrap: wrap; gap: 8px; }
				.refl-chip {
					padding: 7px 14px;
					border-radius: var(--radius-full);
					border: var(--border-w-xs) solid var(--border-md);
					background: var(--card);
					color: var(--text-muted);
					font: inherit;
					font-size: var(--font-xs);
					font-weight: 600;
					cursor: pointer;
					transition: background .2s ease, border-color .2s ease, color .2s ease;
				}
				.refl-chip:hover { border-color: var(--primary-mid); color: var(--primary); }
				.refl-chip.is-active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }

				/* ---------- Input ---------- */
				.refl-field {
					width: 100%;
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
				textarea.refl-field { min-height: 96px; resize: vertical; }
				.refl-field::placeholder { color: var(--text-muted); }

				/* ---------- Footer ---------- */
				.refl-footer { display: flex; gap: 10px; }
				.refl-back,
				.refl-finish {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 8px;
					padding: 12px 16px;
					border-radius: var(--radius);
					font: inherit;
					font-size: var(--font-sm);
					font-weight: 700;
					cursor: pointer;
					transition: background .2s ease, border-color .2s ease;
				}
				.refl-back { flex: 0 0 auto; border: var(--border-w-xs) solid var(--border-md); background: var(--card); color: var(--text-muted); }
				.refl-back:hover { background: var(--neutral-bg); color: var(--text); }
				.refl-finish { flex: 1; border: 0; background: var(--primary); color: var(--color-white); }
				.refl-finish:hover { background: var(--bahama-blue-800); }

				.refl button:focus-visible,
				.refl textarea:focus-visible,
				.refl input:focus-visible {
					outline: var(--border-w-md) solid var(--bahama-blue-400);
					outline-offset: 2px;
				}

				@media (max-width: 420px) {
					.refl-options { grid-template-columns: 1fr; }
					.refl-option { flex-direction: row; justify-content: flex-start; gap: 10px; padding: 10px 14px; }
					.refl-option-hint { text-align: left; }
				}

				@media (prefers-reduced-motion: reduce) {
					.refl * { transition: none !important; }
				}
			`}</style>

			<div className="refl" style={styles?.animatedBody}>
				{/* ---------- Ringkasan sesi ---------- */}
				<div className="refl-summary">
					{goal && (
						<div className="refl-summary-row">
							<Target size={18} />
							<div>
								<div className="refl-summary-label">Tujuan belajar</div>
								<div className="refl-summary-value">{goal}</div>
							</div>
						</div>
					)}
					<div className="refl-summary-row">
						<Clock size={18} />
						<div>
							<div className="refl-summary-label">Waktu belajar</div>
							<div className="refl-summary-value">
								{formatDuration(studiedSeconds)}
								{targetMinutes > 0 && (
									<span className="refl-summary-note">
										{' '}
										dari {targetMinutes} menit ({studiedPercent}%)
									</span>
								)}
							</div>
						</div>
					</div>
					{perf.notes && <p className="refl-notes">{perf.notes}</p>}
				</div>

				{/* ---------- Pencapaian target ---------- */}
				<div className="refl-section">
					<span className="refl-title" id="refl-achievement">
						Apakah target belajarmu tercapai?
					</span>
					<div
						className="refl-options"
						role="radiogroup"
						aria-labelledby="refl-achievement"
					>
						{ACHIEVEMENT_OPTIONS.map(({ value, label, hint, icon: Icon, tone }) => (
							<button
								key={value}
								type="button"
								role="radio"
								aria-checked={achievement === value}
								className={`refl-option is-${tone}${achievement === value ? ' is-active' : ''}`}
								onClick={() => save('goalAchievement', value)}
							>
								<Icon size={20} />
								<span className="refl-option-label">{label}</span>
								<span className="refl-option-hint">{hint}</span>
							</button>
						))}
					</div>
				</div>

				{/* ---------- Faktor penyebab ---------- */}
				<div className="refl-section">
					<span className="refl-title">Apa yang paling memengaruhi hasilnya?</span>
					<span className="refl-hint">Pilih satu atau lebih.</span>
					<div className="refl-chips">
						{FACTOR_OPTIONS.map((factor) => {
							const active = factors.includes(factor);
							return (
								<button
									key={factor}
									type="button"
									aria-pressed={active}
									className={`refl-chip${active ? ' is-active' : ''}`}
									onClick={() => toggleFactor(factor)}
								>
									{factor}
								</button>
							);
						})}
					</div>
				</div>

				{/* ---------- Evaluasi ---------- */}
				<div className="refl-section">
					<label className="refl-title" htmlFor="refl-evaluation">
						Evaluasi: bagian mana yang sudah dan belum kamu pahami?
					</label>
					<textarea
						id="refl-evaluation"
						className="refl-field"
						value={evaluation}
						onChange={(e) => save('evaluation', e.target.value)}
						placeholder="Contoh: Berhasil paham async/await, tapi masih agak bingung di try/catch..."
					/>
				</div>

				{/* ---------- Penyesuaian ---------- */}
				<div className="refl-section">
					<label className="refl-title" htmlFor="refl-adjustment">
						Penyesuaian untuk sesi berikutnya
					</label>
					<input
						id="refl-adjustment"
						type="text"
						className="refl-field"
						value={futureAdjustment}
						onChange={(e) => save('futureAdjustment', e.target.value)}
						placeholder="Contoh: Lebih banyak latihan kode langsung dibanding hanya membaca"
					/>
				</div>

				{/* ---------- Aksi ---------- */}
				<div className="d-flex justify-content-between" style={styles?.footer}>
					<Button className="btn-secondary" onClick={backToPerformance}>
						<ArrowLeft size={16} /> Kembali
					</Button>
					<Button className="btn-primary" style={{ width: 100 }} onClick={handleFinish}>
						Selesaikan
					</Button>
				</div>
			</div>
		</>
	);
};

export default SelfReflectionPhase;
