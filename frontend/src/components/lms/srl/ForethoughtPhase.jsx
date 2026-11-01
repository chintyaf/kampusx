import React, { useEffect, useRef, useState } from 'react';
import { Target, Plus, ArrowRight, X, CheckCircle2, Loader2, Compass, Flame } from 'lucide-react';
import { Button } from 'react-bootstrap';

const DEFAULT_STRATEGIES = [
	'Mencatat Poin Penting',
	'Latihan Soal Praktis',
	'Teknik Pomodoro',
	'Menjelaskan Ulang (Feynman Technique)',
];

const CONFIDENCE_LEVELS = [1, 2, 3, 4, 5];

const ForethoughtPhase = ({ srlData, updatePhaseData, startSession, styles }) => {
	// Data tersimpan di srlData.forethought atau srlData
	const saved = srlData?.forethought ?? srlData ?? {};

	// 1. Target Belajar (Goal)
	const [sessionGoal, setSessionGoal] = useState(saved.sessionGoal || saved.goal);

	// 2. Motivasi Belajar (Motivation)
	const [motivation, setMotivation] = useState(saved.motivation || '');

	// 3. Perencanaan Strategi Belajar (Plan / Strategies)
	const [allStrategies, setAllStrategies] = useState(saved.allStrategies || DEFAULT_STRATEGIES);
	const [selectedStrategies, setSelectedStrategies] = useState(
		saved.selectedStrategies ||
			(Array.isArray(saved.plan) ? saved.plan : ['Mencatat Poin Penting']),
	);
	const [newStrategy, setNewStrategy] = useState('');

	// 4. Estimasi Waktu Belajar (Time Planning)
	const [estimatedTime, setEstimatedTime] = useState(saved.estimatedTime || 25);

	// 5. Kepercayaan Diri / Keyakinan (Self-Efficacy / Confidence)
	const [confidence, setConfidence] = useState(saved.confidence || 3);

	// Animasi transisi saat memulai sesi
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const timers = useRef([]);

	useEffect(() => () => timers.current.forEach(clearTimeout), []);

	const toggleStrategy = (strategy) => {
		if (isSubmitting) return;
		setSelectedStrategies((prev) =>
			prev.includes(strategy) ? prev.filter((s) => s !== strategy) : [...prev, strategy],
		);
	};

	const addCustomStrategy = () => {
		const trimmed = newStrategy.trim();
		if (trimmed && !allStrategies.includes(trimmed)) {
			setAllStrategies((prev) => [...prev, trimmed]);
			setSelectedStrategies((prev) => [...prev, trimmed]);
			setNewStrategy('');
		}
	};

	const removeCustomStrategy = (strategy) => {
		setAllStrategies((prev) => prev.filter((s) => s !== strategy));
		setSelectedStrategies((prev) => prev.filter((s) => s !== strategy));
	};

	const handleStartLearning = (e) => {
		e.preventDefault();
		if (isSubmitting) return;
		setIsSubmitting(true);

		// Standardisasi payload data sesuai entitas srl_forethought di DB TA
		const formData = {
			goal: sessionGoal, // Entitas goal DB
			sessionGoal, // Kompatibilitas UI lokal
			plan: selectedStrategies, // Entitas plan DB
			allStrategies,
			selectedStrategies,
			motivation, // Entitas motivation DB
			estimatedTime, // Estimasi durasi (menit)
			confidence, // Tingkat keyakinan
		};

		timers.current.push(
			setTimeout(() => {
				setIsSuccess(true);

				timers.current.push(
					setTimeout(() => {
						if (typeof updatePhaseData === 'function') {
							Object.entries(formData).forEach(([field, value]) =>
								updatePhaseData('forethought', field, value),
							);
						}
						if (typeof startSession === 'function') startSession(formData);
					}, 500),
				);
			}, 800),
		);
	};

	return (
		<>
			<style>{`
                .fore {
                    display: flex;
                    flex-direction: column;
                    gap: 22px;
                    font-family: var(--font, inherit);
                    color: var(--text);
                }

                /* ---------- Section ---------- */
                .fore-section { display: flex; flex-direction: column; gap: 10px; }
                .fore-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
                .fore-title { display: inline-flex; align-items: center; gap: 4px; font-size: var(--font-xs); font-weight: 700; }
                .fore-value { font-size: var(--font-xs); font-weight: 700; color: var(--primary); }
                .fore-scale { display: flex; justify-content: space-between; font-size: var(--font-xs); color: var(--text-muted); }

                /* ---------- Input & Textarea ---------- */
                .fore-field {
                    width: 100%;
                    padding: 11px 14px;
                    border-radius: var(--radius);
                    border: var(--border-w-xs) solid var(--border-md);
                    background: var(--card);
                    color: var(--text);
                    font: inherit;
                    font-size: var(--font-sm);
                    box-sizing: border-box;
                }
                .fore-field::placeholder { color: var(--text-muted); }
                .fore-field:disabled { background: var(--neutral-bg); cursor: not-allowed; }
                .fore-textarea {
                    resize: vertical;
                    min-height: 70px;
                }

                /* ---------- Strategi ---------- */
                .fore-chips { display: flex; flex-wrap: wrap; gap: 8px; }
                .fore-chip {
                    display: inline-flex;
                    align-items: center;
                    border-radius: var(--radius-full);
                    border: var(--border-w-xs) solid var(--border-md);
                    background: var(--card);
                    color: var(--text-muted);
                    transition: background .2s ease, border-color .2s ease, color .2s ease;
                }
                .fore-chip:hover { border-color: var(--primary-mid); }
                .fore-chip.is-active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }
                .fore-chip-main {
                    padding: 7px 14px;
                    border: 0;
                    border-radius: var(--radius-full);
                    background: transparent;
                    color: inherit;
                    font: inherit;
                    font-size: var(--font-xs);
                    font-weight: 600;
                    cursor: pointer;
                }
                .fore-chip-main:disabled { cursor: not-allowed; }
                .fore-chip-remove {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 22px;
                    height: 22px;
                    margin-right: 6px;
                    margin-left: -6px;
                    padding: 0;
                    border: 0;
                    border-radius: 50%;
                    background: transparent;
                    color: inherit;
                    cursor: pointer;
                }
                .fore-chip-remove:hover { background: rgba(0, 105, 158, .12); }

                .fore-add { display: flex; gap: 8px; }
                .fore-add-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    flex: 0 0 42px;
                    border-radius: var(--radius);
                    border: var(--border-w-xs) solid var(--border-md);
                    background: var(--card);
                    color: var(--muted);
                    cursor: pointer;
                    transition: background .2s ease, color .2s ease;
                }
                .fore-add-btn:hover:not(:disabled) { background: var(--primary-light); color: var(--primary); }
                .fore-add-btn:disabled { opacity: .5; cursor: not-allowed; }

                /* ---------- Slider ---------- */
                .fore-range { width: 100%; accent-color: var(--primary); cursor: pointer; }
                .fore-range:disabled { cursor: not-allowed; opacity: .6; }

                /* ---------- Keyakinan ---------- */
                .fore-levels { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
                .fore-level {
                    padding: 10px 0;
                    border-radius: var(--radius);
                    border: var(--border-w-xs) solid var(--border-md);
                    background: var(--card);
                    color: var(--text-muted);
                    font: inherit;
                    font-size: var(--font-md);
                    font-weight: 700;
                    cursor: pointer;
                    transition: all .2s ease;
                }
                .fore-level:hover:not(:disabled) { border-color: var(--primary-mid); color: var(--primary); }
                .fore-level.is-active { background: var(--primary); border-color: var(--primary); color: var(--color-white); }
                .fore-level:disabled { cursor: not-allowed; }

                /* ---------- Tombol mulai ---------- */
                .fore-submit {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 12px 16px;
                    border: 0;
                    border-radius: var(--radius);
                    background: var(--primary);
                    color: var(--color-white);
                    font: inherit;
                    font-size: var(--font-sm);
                    font-weight: 700;
                    cursor: pointer;
                    transition: background .3s ease;
                }
                .fore-submit:hover:not(:disabled) { background: var(--bahama-blue-800); }
                .fore-submit:disabled { cursor: default; }
                .fore-submit.is-success { background: var(--success-text); }
                .fore-spin { animation: fore-spin .8s linear infinite; }

                .fore button:focus-visible,
                .fore input:focus-visible,
                .fore textarea:focus-visible {
                    outline: var(--border-w-md) solid var(--bahama-blue-400);
                    outline-offset: 2px;
                }

                @keyframes fore-spin { to { transform: rotate(360deg); } }

                @media (prefers-reduced-motion: reduce) {
                    .fore * { transition: none !important; }
                    .fore-spin { animation-duration: 2s; }
                }
            `}</style>

			<form className="fore" onSubmit={handleStartLearning}>
				{/* ---------- 1. Target Sesi Belajar (Goal) ---------- */}
				<div className="fore-section">
					<label className="fore-title required" htmlFor="fore-goal">
						Target Sesi Ini
					</label>
					<input
						id="fore-goal"
						type="text"
						className="fore-field"
						required
						disabled={isSubmitting}
						placeholder="Apa tujuan spesifik yang ingin kamu kuasai?"
						value={sessionGoal}
						onChange={(e) => setSessionGoal(e.target.value)}
					/>
				</div>

				{/* ---------- 2. Motivasi Belajar (Motivation) ---------- */}
				<div className="fore-section">
					<label className="fore-title" htmlFor="fore-motivation">
						Motivasi Belajar
					</label>
					<textarea
						id="fore-motivation"
						className="fore-field fore-textarea"
						disabled={isSubmitting}
						placeholder="Tuliskan dorongan atau alasan kamu mempelajari materi ini hari ini..."
						value={motivation}
						onChange={(e) => setMotivation(e.target.value)}
					/>
				</div>

				{/* ---------- 3. Perencanaan Strategi (Plan) ---------- */}
				<div className="fore-section">
					<span className="fore-title">Strategi Fokus & Metode Belajar</span>
					<div className="fore-chips">
						{allStrategies.map((strategy) => {
							const active = selectedStrategies.includes(strategy);
							const isDefault = DEFAULT_STRATEGIES.includes(strategy);
							return (
								<span
									key={strategy}
									className={`fore-chip${active ? ' is-active' : ''}`}
								>
									<button
										type="button"
										className="fore-chip-main"
										aria-pressed={active}
										disabled={isSubmitting}
										onClick={() => toggleStrategy(strategy)}
									>
										{strategy}
									</button>
									{!isDefault && !isSubmitting && (
										<button
											type="button"
											className="fore-chip-remove"
											aria-label={`Hapus strategi ${strategy}`}
											onClick={() => removeCustomStrategy(strategy)}
										>
											<X size={13} />
										</button>
									)}
								</span>
							);
						})}
					</div>

					<div className="fore-add">
						<input
							type="text"
							className="fore-field"
							disabled={isSubmitting}
							placeholder="Tambah strategi sendiri..."
							value={newStrategy}
							onChange={(e) => setNewStrategy(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									addCustomStrategy();
								}
							}}
						/>
						<button
							type="button"
							className="fore-add-btn"
							disabled={isSubmitting}
							onClick={addCustomStrategy}
							aria-label="Tambah strategi"
						>
							<Plus size={16} />
						</button>
					</div>
				</div>

				{/* ---------- 4. Estimasi Waktu Belajar ---------- */}
				<div className="fore-section">
					<div className="fore-head">
						<label className="fore-title" htmlFor="fore-time">
							Estimasi Waktu Belajar
						</label>
						<span className="fore-value">{estimatedTime} menit</span>
					</div>
					<input
						id="fore-time"
						type="range"
						className="fore-range"
						min={5}
						max={60}
						step={5}
						disabled={isSubmitting}
						value={estimatedTime}
						onChange={(e) => setEstimatedTime(Number(e.target.value))}
					/>
					<div className="fore-scale">
						<span>5 menit</span>
						<span>60 menit</span>
					</div>
				</div>

				{/* ---------- 5. Keyakinan Diri (Self-Efficacy) ---------- */}
				<div className="fore-section">
					<div className="fore-head">
						<span className="fore-title">Tingkat Keyakinan (Self-Efficacy)</span>
						<span className="fore-value">Skor: {confidence} / 5</span>
					</div>
					<div className="fore-levels">
						{CONFIDENCE_LEVELS.map((lvl) => (
							<button
								key={lvl}
								type="button"
								className={`fore-level${confidence === lvl ? ' is-active' : ''}`}
								disabled={isSubmitting}
								onClick={() => setConfidence(lvl)}
							>
								{lvl}
							</button>
						))}
					</div>
					<div className="fore-scale">
						<span>Ragu-ragu</span>
						<span>Sangat Yakin</span>
					</div>
				</div>

				{/* ---------- Tombol Aksi ---------- */}
				<div style={styles?.footer}>
					<Button type="submit" className={`fore-submit`} disabled={isSubmitting}>
						{isSubmitting ? (
							isSuccess ? (
								<>
									Memulai Sesi <CheckCircle2 size={18} />
								</>
							) : (
								<>
									<Loader2 size={18} className="fore-spin" /> Menyiapkan Sesi
								</>
							)
						) : (
							<>
								Mulai Belajar <ArrowRight size={16} />
							</>
						)}
					</Button>
				</div>
			</form>
		</>
	);
};

export default ForethoughtPhase;
