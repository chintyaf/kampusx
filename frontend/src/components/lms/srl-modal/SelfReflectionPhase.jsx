import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Field, ChipGroup, formatDuration } from './SRLFields';

const ACHIEVEMENT_OPTIONS = [
	{ value: 'tercapai', title: 'Tercapai', desc: 'Saya menyelesaikan seluruh tujuan belajar.' },
	{ value: 'sebagian', title: 'Sebagian', desc: 'Sebagian tujuan tercapai, sisanya belum.' },
	{ value: 'belum', title: 'Belum tercapai', desc: 'Tujuan belum tercapai di sesi ini.' },
];

const FACTOR_OPTIONS = [
	'Fokus penuh',
	'Strategi belajar efektif',
	'Lingkungan nyaman',
	'Kondisi tubuh / energi baik',
	'Banyak distraksi',
	'Materi terlalu sulit',
	'Waktu kurang',
	'Kurang motivasi',
];

const SelfReflectionPhase = ({
	srlData,
	updatePhaseData,
	backToPerformance,
	handleFinish,
	isSubmitting,
}) => {
	const { forethought: f, performance: p, reflection: r } = srlData;
	const set = (field, value) => updatePhaseData('reflection', field, value);

	const canFinish = Boolean(r.goalAchievement) && !isSubmitting;

	return (
		<div className="px-3">
			<div className="srlf-goal-box">
				<small>
					Tujuan sesi · durasi belajar {formatDuration(p.accumulatedSeconds)} dari target{' '}
					{f.estimatedMinutes} menit
				</small>
				<p>{f.goal}</p>
			</div>

			<Field label="Seberapa tercapai tujuan belajarmu?" required>
				<div className="srlf-options" role="radiogroup">
					{ACHIEVEMENT_OPTIONS.map((opt) => (
						<button
							type="button"
							key={opt.value}
							role="radio"
							aria-checked={r.goalAchievement === opt.value}
							className={`srlf-option ${r.goalAchievement === opt.value ? 'is-active' : ''}`}
							onClick={() => set('goalAchievement', opt.value)}
						>
							<strong>{opt.title}</strong>
							<span>{opt.desc}</span>
						</button>
					))}
				</div>
			</Field>

			<Field
				label="Faktor apa yang memengaruhi hasil belajarmu?"
				hint="Pilih yang paling relevan, atau tambahkan sendiri."
			>
				<ChipGroup
					options={FACTOR_OPTIONS}
					value={r.factors}
					onChange={(v) => set('factors', v)}
					allowCustom
					customPlaceholder="Faktor lain…"
				/>
			</Field>

			<Field label="Evaluasi diri" hint="Apa yang sudah berjalan baik dan apa yang kurang?">
				<textarea
					className="form-control"
					rows={3}
					maxLength={2000}
					value={r.evaluation}
					onChange={(e) => set('evaluation', e.target.value)}
					placeholder="Tulis evaluasimu…"
				/>
				<div className="srlf-counter">{r.evaluation.length}/2000</div>
			</Field>

			<Field label="Apa yang akan kamu ubah di sesi berikutnya?">
				<textarea
					className="form-control"
					rows={3}
					maxLength={2000}
					value={r.futureAdjustment}
					onChange={(e) => set('futureAdjustment', e.target.value)}
					placeholder="Misalnya: mulai dengan latihan soal, matikan notifikasi HP…"
				/>
				<div className="srlf-counter">{r.futureAdjustment.length}/2000</div>
			</Field>

			<div className="srlf-actions">
				<button
					type="button"
					className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
					onClick={backToPerformance}
					disabled={isSubmitting}
				>
					<ArrowLeft size={16} /> Kembali
				</button>
				<button
					type="button"
					className="btn btn-success d-inline-flex align-items-center gap-2"
					onClick={handleFinish}
					disabled={!canFinish}
				>
					{isSubmitting ? (
						<>
							<span
								className="spinner-border spinner-border-sm"
								role="status"
								aria-hidden="true"
							/>
							Menyimpan…
						</>
					) : (
						<>
							<Check size={16} /> Selesai
						</>
					)}
				</button>
			</div>
		</div>
	);
};

export default SelfReflectionPhase;
