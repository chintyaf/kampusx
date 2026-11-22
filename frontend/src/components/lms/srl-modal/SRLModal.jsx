import React, { useEffect, useRef, useState } from 'react';
import { X, Target, Zap, Lightbulb, PartyPopper } from 'lucide-react';
import { useSRL } from '@/context/SRLContext';
import ForethoughtPhase from './ForethoughtPhase';
import PerformancePhase from './PerformancePhase';
import SelfReflectionPhase from './SelfReflectionPhase';
import './srl.css';
import './srl-fields.css';

const PHASE_MOTIVATION = {
	forethought: {
		icon: Target,
		title: 'Siapkan amunisi belajar',
		quote: 'Memiliki tujuan yang jelas adalah 50% dari keberhasilan.',
		tone: 'info',
	},
	performance: {
		icon: Zap,
		title: 'Tetap fokus dan terjaga',
		quote: 'Konsistensi kecil setiap menit menghasilkan lompatan besar.',
		tone: 'info',
	},
	reflection: {
		icon: Lightbulb,
		title: 'Waktunya refleksi',
		quote: 'Kita belajar bukan hanya dari pengalaman, tetapi dari merefleksikannya.',
		tone: 'purple',
	},
};

const HEADER_CONTENT = {
	forethought: { title: 'Rencana Belajar', subtitle: 'Atur target dan strategi sesi ini' },
	performance: { title: 'Sesi Belajar', subtitle: 'Tetap fokus dan pantau progresmu' },
	reflection: { title: 'Refleksi Sesi', subtitle: 'Evaluasi pemahaman belajarmu' },
};

const SRLModal = () => {
	const {
		isOpen,
		closeModal,
		currentPhase,
		srlData,
		updatePhaseData,
		// status API
		apiError,
		clearError,
		isSubmitting,
		// timer
		timerRunning,
		startTimer,
		pauseTimer,
		// API actions
		startSession,
		syncProgress,
		reflect,
		abandon,
		finishSession,
		// Phase nav
		goToReflection,
		backToPerformance,
	} = useSRL();

	const [isCompletedView, setIsCompletedView] = useState(false);
	const [isVisible, setIsVisible] = useState(isOpen);
	const [isClosing, setIsClosing] = useState(false);

	const finishTimer = useRef(null);
	const closeTimer = useRef(null);

	const currentHeader = HEADER_CONTENT[currentPhase] || {
		title: 'Panduan Sesi Pembelajaran',
		subtitle: 'Kelola target, aktivitas, dan evaluasi belajar Anda',
	};

	const motivation = PHASE_MOTIVATION[currentPhase];

	// ── Animasi buka/tutup ───────────────────────────────────
	useEffect(() => {
		if (isOpen) {
			clearTimeout(closeTimer.current);
			setIsVisible(true);
			setIsClosing(false);
		} else if (isVisible) {
			setIsClosing(true);
			closeTimer.current = setTimeout(() => {
				setIsVisible(false);
				setIsClosing(false);
			}, 200);
		}
		return () => clearTimeout(closeTimer.current);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	useEffect(() => {
		return () => {
			clearTimeout(finishTimer.current);
			clearTimeout(closeTimer.current);
		};
	}, []);

	useEffect(() => {
		if (!isOpen) return undefined;
		const onKeyDown = (e) => {
			if (e.key === 'Escape') closeModal();
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [isOpen, closeModal]);

	if (!isVisible) return null;

	// ── Handler performance -> reflection ────────────────────
	const handleGoToReflection = async () => {
		// Simpan progress dulu; kalau gagal tetap lanjut (data masih ada di lokal)
		await syncProgress();
		clearError();
		goToReflection();
	};

	// ── Handler selesai (reflection -> done) ─────────────────
	const handleFinish = async () => {
		if (isSubmitting) return;
		const ok = await reflect();
		if (!ok) return; // tetap di fase refleksi, pesan error muncul di banner

		setIsCompletedView(true);
		finishTimer.current = setTimeout(() => {
			setIsCompletedView(false);
			finishSession();
		}, 2200);
	};

	const MotivationIcon = motivation?.icon;

	return (
		<div className="srlm-overlay">
			<div
				className={`srlm-card ${isClosing ? 'pop-out' : 'pop-down'}`}
				role="dialog"
				aria-label="Self-Regulated Learning"
			>
				{isCompletedView ? (
					<div className="srlm-scroll">
						<div className="srlm-done" role="status">
							<div className="srlm-done-icon">
								<PartyPopper size={38} />
							</div>
							<h2 className="srlm-done-title">Sesi belajar selesai</h2>
							<p className="srlm-done-text">
								Setiap refleksi yang kamu buat membawamu satu langkah lebih dekat ke
								penguasaan materi.
							</p>
						</div>
					</div>
				) : (
					<>
						{/* Header */}
						<div
							className="border-bottom bg-light"
							style={{ flex: '0 0 auto', padding: '14px 28px' }}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									gap: '12px',
								}}
							>
								<div className="srlm-title-wrapper">
									<h2 className="srlm-title">{currentHeader.title}</h2>
									<p className="srlm-subtitle">{currentHeader.subtitle}</p>
								</div>
								<button
									type="button"
									className="srlm-close"
									onClick={closeModal}
									aria-label="Tutup"
								>
									<X size={18} />
								</button>
							</div>
						</div>

						{/* Body */}
						<div className="srlm-scroll">
							{apiError && (
								<div
									className="alert alert-warning d-flex justify-content-between align-items-center mx-3 mt-3 mb-0"
									role="alert"
								>
									<span>{apiError}</span>
									<button
										type="button"
										className="btn-close"
										onClick={clearError}
										aria-label="Tutup"
									/>
								</div>
							)}

							<div key={currentPhase} className="srlm-phase mt-3">
								{motivation && (
									<div className="px-3">
										<div className={`srlf-motivation srlf-${motivation.tone}`}>
											<MotivationIcon
												size={20}
												style={{ flex: '0 0 auto', marginTop: 2 }}
											/>
											<div>
												<p className="srlf-motivation-title">
													{motivation.title}
												</p>
												<p className="srlf-motivation-quote">
													“{motivation.quote}”
												</p>
											</div>
										</div>
									</div>
								)}

								{currentPhase === 'forethought' && (
									<ForethoughtPhase
										srlData={srlData}
										updatePhaseData={updatePhaseData}
										startSession={startSession}
										isSubmitting={isSubmitting}
									/>
								)}

								{currentPhase === 'performance' && (
									<PerformancePhase
										srlData={srlData}
										updatePhaseData={updatePhaseData}
										closeModal={closeModal}
										goToReflection={handleGoToReflection}
										syncProgress={syncProgress}
										timerRunning={timerRunning}
										startTimer={startTimer}
										pauseTimer={pauseTimer}
										abandon={abandon}
									/>
								)}

								{currentPhase === 'reflection' && (
									<SelfReflectionPhase
										srlData={srlData}
										updatePhaseData={updatePhaseData}
										backToPerformance={backToPerformance}
										handleFinish={handleFinish}
										isSubmitting={isSubmitting}
									/>
								)}
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default SRLModal;
