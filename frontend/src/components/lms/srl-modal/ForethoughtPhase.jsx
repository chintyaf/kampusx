import React from 'react';
import { Play } from 'lucide-react';
import { Field, ChipGroup, RatingScale } from './SRLFields';

const STRATEGY_OPTIONS = [
	'Membaca materi',
	'Menonton video pembelajaran',
	'Membuat catatan',
	'Mengerjakan latihan soal',
	'Mengulang materi sebelumnya',
	'Bertanya / berdiskusi',
];

const DURATION_PRESETS = [15, 25, 45, 60];

const ForethoughtPhase = ({ srlData, updatePhaseData, startSession, isSubmitting }) => {
	const f = srlData.forethought;
	const set = (field, value) => updatePhaseData('forethought', field, value);

	const canStart = f.goal.trim().length > 0 && !isSubmitting;

	const handleMinutes = (e) => {
		const raw = e.target.value;
		// Biarkan kosong saat mengetik; dibatasi 5–300 saat blur
		set('estimatedMinutes', raw === '' ? '' : Number(raw));
	};

	const clampMinutes = () => {
		const n = Math.round(Number(f.estimatedMinutes) || 25);
		set('estimatedMinutes', Math.min(300, Math.max(5, n)));
	};

	return (
		<div className="px-3">
			<Field
				label="Apa tujuan belajarmu di sesi ini?"
				required
				hint="Tulis sespesifik mungkin, misalnya: “Memahami konsep closure di JavaScript dan mengerjakan 3 soal latihan”."
			>
				<textarea
					className="form-control"
					rows={3}
					maxLength={1000}
					value={f.goal}
					onChange={(e) => set('goal', e.target.value)}
					placeholder="Tujuan belajar…"
				/>
				<div className="srlf-counter">{f.goal.length}/1000</div>
			</Field>

			<Field
				label="Apa yang memotivasimu?"
				hint="Opsional. Alasan yang jelas membantu menjaga semangat."
			>
				<textarea
					className="form-control"
					rows={2}
					maxLength={1000}
					value={f.motivation}
					onChange={(e) => set('motivation', e.target.value)}
					placeholder="Misalnya: ada ujian minggu depan, ingin lulus sertifikasi…"
				/>
			</Field>

			<Field
				label="Strategi yang akan kamu pakai"
				hint="Pilih satu atau lebih, atau tambahkan sendiri."
			>
				<ChipGroup
					options={STRATEGY_OPTIONS}
					value={f.strategies}
					onChange={(v) => set('strategies', v)}
					allowCustom
					customPlaceholder="Strategi lain…"
				/>
			</Field>

			<Field label="Estimasi waktu belajar (menit)" hint="Antara 5 sampai 300 menit.">
				<input
					type="number"
					className="form-control"
					style={{ maxWidth: 140 }}
					min={5}
					max={300}
					value={f.estimatedMinutes}
					onChange={handleMinutes}
					onBlur={clampMinutes}
				/>
				<div className="srlf-presets">
					{DURATION_PRESETS.map((m) => (
						<button
							type="button"
							key={m}
							className={`srlf-chip ${Number(f.estimatedMinutes) === m ? 'is-active' : ''}`}
							onClick={() => set('estimatedMinutes', m)}
						>
							{m} menit
						</button>
					))}
				</div>
			</Field>

			<Field label="Seberapa yakin kamu bisa mencapai tujuan ini?">
				<RatingScale
					value={f.confidenceLevel}
					onChange={(v) => set('confidenceLevel', f.confidenceLevel === v ? null : v)}
					lowLabel="Kurang yakin"
					highLabel="Sangat yakin"
				/>
			</Field>

			<div className="srlf-actions" style={{ justifyContent: 'flex-end' }}>
				<button
					type="button"
					className="btn btn-primary d-inline-flex align-items-center gap-2"
					disabled={!canStart}
					onClick={startSession}
				>
					{isSubmitting ? (
						<>
							<span
								className="spinner-border spinner-border-sm"
								role="status"
								aria-hidden="true"
							/>
							Memulai…
						</>
					) : (
						<>
							<Play size={16} />
							Mulai Belajar
						</>
					)}
				</button>
			</div>
		</div>
	);
};

export default ForethoughtPhase;
