import React from 'react';
import { Pause, Play, ClipboardCheck, XCircle } from 'lucide-react';
import { Field, RatingScale, formatDuration } from './SRLFields';

const PerformancePhase = ({
	srlData,
	updatePhaseData,
	closeModal,
	goToReflection,
	syncProgress,
	timerRunning,
	startTimer,
	pauseTimer,
	abandon,
}) => {
	const { forethought: f, performance: p } = srlData;
	const set = (field, value) => updatePhaseData('performance', field, value);

	const targetSeconds = (Number(f.estimatedMinutes) || 25) * 60;
	const percent = Math.min(100, Math.round(((p.accumulatedSeconds || 0) / targetSeconds) * 100));
	const isOver = (p.accumulatedSeconds || 0) >= targetSeconds;

	const handleAbandon = async () => {
		if (window.confirm('Batalkan sesi belajar ini? Progres sesi tidak akan dilanjutkan.')) {
			await abandon();
		}
	};

	return (
		<div className="px-3">
			<div className="srlf-goal-box">
				<small>Tujuan sesi ini</small>
				<p>{f.goal}</p>
			</div>

			<div className="srlf-timer-card">
				<div className="srlf-timer-value">{formatDuration(p.accumulatedSeconds)}</div>
				<p className="srlf-timer-sub">
					{isOver
						? `Target ${f.estimatedMinutes} menit tercapai 🎉`
						: `Target ${f.estimatedMinutes} menit · ${percent}%`}
				</p>
				<div className={`srlf-progress ${isOver ? 'is-over' : ''}`}>
					<div style={{ width: `${percent}%` }} />
				</div>
				{timerRunning ? (
					<button
						type="button"
						className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
						onClick={pauseTimer}
					>
						<Pause size={16} /> Jeda
					</button>
				) : (
					<button
						type="button"
						className="btn btn-primary d-inline-flex align-items-center gap-2"
						onClick={startTimer}
					>
						<Play size={16} /> Lanjutkan
					</button>
				)}
				<p className="srlf-hint mt-3 mb-0">
					Timer tetap berjalan walau jendela ini ditutup, jadi kamu bisa langsung membuka
					materi.
				</p>
			</div>

			<Field label="Seberapa fokus kamu saat ini?">
				<RatingScale
					value={p.focusLevel}
					onChange={(v) => {
						const next = p.focusLevel === v ? null : v;
						set('focusLevel', next);
						syncProgress({ focusLevel: next });
					}}
					lowLabel="Mudah terdistraksi"
					highLabel="Sangat fokus"
				/>
			</Field>

			<Field
				label="Catatan belajar"
				hint="Opsional. Tersimpan otomatis saat kamu selesai mengetik."
			>
				<textarea
					className="form-control"
					rows={4}
					value={p.notes}
					onChange={(e) => set('notes', e.target.value)}
					onBlur={() => syncProgress({ notes: p.notes })}
					placeholder="Poin penting, pertanyaan, atau hal yang belum dipahami…"
				/>
			</Field>

			<div className="srlf-actions">
				<button
					type="button"
					className="btn btn-link text-danger p-0 d-inline-flex align-items-center gap-1"
					onClick={handleAbandon}
				>
					<XCircle size={16} /> Batalkan sesi
				</button>
				<div className="srlf-actions-right">
					<button
						type="button"
						className="btn btn-outline-secondary"
						onClick={closeModal}
					>
						Lanjut belajar
					</button>
					<button
						type="button"
						className="btn btn-primary d-inline-flex align-items-center gap-2"
						onClick={goToReflection}
					>
						<ClipboardCheck size={16} /> Selesai &amp; Refleksi
					</button>
				</div>
			</div>
		</div>
	);
};

export default PerformancePhase;
