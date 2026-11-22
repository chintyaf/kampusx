import React, { useEffect, useRef, useState } from 'react';
import { X, Target, Zap, Lightbulb, PartyPopper } from 'lucide-react';
import { useSRL } from '@/context/SRLContext';
import ForethoughtPhase from './ForethoughtPhase';
import PerformancePhase from './PerformancePhase';
import SelfReflectionPhase from './SelfReflectionPhase';
import './srl.css';

const PHASES = [
	{ key: 'forethought', label: 'Rencanakan' },
	{ key: 'performance', label: 'Belajar' },
	{ key: 'reflection', label: 'Refleksi' },
];

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

const errorBoxStyle = {
	display: 'flex',
	alignItems: 'flex-start',
	justifyContent: 'space-between',
	gap: 10,
	marginBottom: 14,
	padding: '10px 14px',
	borderRadius: 'var(--radius)',
	background: 'var(--error-bg)',
	border: 'var(--border-w-xs) solid var(--error-border)',
	color: 'var(--error-heading)',
	fontSize: 'var(--font-sm)',
	lineHeight: 1.4,
};

const errorCloseStyle = {
	flex: '0 0 auto',
	display: 'inline-flex',
	padding: 2,
	border: 0,
	background: 'transparent',
	color: 'inherit',
	cursor: 'pointer',
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
		// Simpan progress dulu (membaca state terbaru, termasuk timer yang berjalan).
		// Kalau gagal tetap lanjut, data masih ada di lokal.
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
							<div key={currentPhase} className="srlm-phase mt-3">
								{apiError && (
									<div style={errorBoxStyle} role="alert">
										<span>{apiError}</span>
										<button
											type="button"
											style={errorCloseStyle}
											onClick={clearError}
											aria-label="Tutup pesan"
										>
											<X size={14} />
										</button>
									</div>
								)}

								{currentPhase === 'forethought' && (
									<ForethoughtPhase
										srlData={srlData}
										updatePhaseData={updatePhaseData}
										startSession={startSession}
									/>
								)}

								{currentPhase === 'performance' && (
									<PerformancePhase
										srlData={srlData}
										updatePhaseData={updatePhaseData}
										closeModal={closeModal}
										goToReflection={handleGoToReflection}
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
