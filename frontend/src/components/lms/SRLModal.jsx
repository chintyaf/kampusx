import React, { useEffect, useRef, useState } from 'react';
import { X, Target, Zap, Lightbulb, PartyPopper, Trophy } from 'lucide-react';
import { useSRL } from '@/context/SRLContext';
import ForethoughtPhase from './srl/ForethoughtPhase';
import PerformancePhase from './srl/PerformancePhase';
import SelfReflectionPhase from './srl/SelfReflectionPhase';

const PHASES = [
	{ key: 'forethought', label: 'Rencanakan' },
	{ key: 'performance', label: 'Belajar' },
	{ key: 'reflection', label: 'Refleksi' },
];

// Banner motivasi per fase
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

// Provisi header dinamis berdasarkan `currentPhase`
const HEADER_CONTENT = {
	forethought: {
		title: 'Rencana Belajar',
		subtitle: 'Atur target dan strategi sesi ini',
	},
	performance: {
		title: 'Sesi Belajar',
		subtitle: 'Tetap fokus dan pantau progresmu',
	},
	reflection: {
		title: 'Refleksi Sesi',
		subtitle: 'Evaluasi pemahaman belajarmu',
	},
};

const SRLModal = () => {
	const {
		isOpen,
		closeModal,
		currentPhase,
		srlData,
		updatePhaseData,
		startSession,
		goToReflection,
		backToPerformance,
		finishSession,
	} = useSRL();

	const [isCompletedView, setIsCompletedView] = useState(false);
	const [isVisible, setIsVisible] = useState(isOpen);
	const [isClosing, setIsClosing] = useState(false);

	const finishTimer = useRef(null);
	const closeTimer = useRef(null);

	// Dapatkan header berdasarkan currentPhase di dalam komponen
	const currentHeader = HEADER_CONTENT[currentPhase] || {
		title: 'Panduan Sesi Pembelajaran',
		subtitle: 'Kelola target, aktivitas, dan evaluasi belajar Anda',
	};

	// Sinkronisasi status modal dengan animasi
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

	// Bersihkan timer saat komponen dilepas
	useEffect(() => {
		return () => {
			clearTimeout(finishTimer.current);
			clearTimeout(closeTimer.current);
		};
	}, []);

	// Tutup dengan tombol Escape
	useEffect(() => {
		if (!isOpen) return undefined;

		const onKeyDown = (e) => {
			if (e.key === 'Escape') closeModal();
		};

		window.addEventListener('keydown', onKeyDown);

		return () => window.removeEventListener('keydown', onKeyDown);
	}, [isOpen, closeModal]);

	if (!isVisible) return null;

	const phaseIndex = Math.max(
		PHASES.findIndex((p) => p.key === currentPhase),
		0,
	);

	const handleFinish = () => {
		setIsCompletedView(true);

		finishTimer.current = setTimeout(() => {
			setIsCompletedView(false);
			finishSession();
		}, 2200);
	};

	const motivation = PHASE_MOTIVATION[currentPhase] || PHASE_MOTIVATION.forethought;
	const MotivationIcon = motivation.icon;

	return (
		<div className="srlm-overlay">
			<style>{`
                .srlm-overlay {
                    position: fixed;
                    bottom: 112px;
                    right: 28px;
                    z-index: 9999;
                    pointer-events: none;
                }

                .srlm-card {
                    pointer-events: auto;
                    width: 350px;
                    max-width: calc(100vw - 32px);
                    max-height: calc(80vh - 150px);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-sizing: border-box;
                    background: var(--card);
                    color: var(--text);
                    border: var(--border-w-xs) solid var(--border-md);
                    border-radius: var(--radius-lg);
                    box-shadow: 0 16px 40px rgba(8, 47, 73, 0.18);
                    transform-origin: bottom right;
                }

                /* ---------- Opening Animation ---------- */

                .srlm-card.pop-down {
                    animation: popDown 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }

                @keyframes popDown {
                    0% {
                        opacity: 0;
                        transform: translateY(-18px) scale(0.92);
                    }

                    70% {
                        opacity: 1;
                        transform: translateY(3px) scale(1.02);
                    }

                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                /* ---------- Closing Animation ---------- */

                .srlm-card.pop-out {
                    animation: popOut 0.1s ease-in forwards;
                    pointer-events: none;
                }

                @keyframes popOut {
                    from {
                        opacity: 1;
                        transform: scale(1);
                    }

                    to {
                        opacity: 0;
                        transform: scale(0.9) translateY(8px);
                    }
                }

                .srlm-scroll {
                    flex: 1 1 auto;
                    min-height: 0;
                    overflow-y: auto;
                    overscroll-behavior: contain;
                    padding: 0 14px 20px 20px;
                    scrollbar-width: thin;
                    scrollbar-color: var(--neutral-bg) transparent;
                }

                /* ---------- Header ---------- */

                .srlm-title {
                    margin: 0;
                    font-size: var(--font-md);
                    font-weight: 800;
                    line-height: 1.2;
                }

                .srlm-subtitle {
                    font-size: var(--font-xs);
                    color: var(--text-muted);
                }

                .srlm-close {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    margin: -4px -6px 0 0;
                    padding: 0;
                    border: 0;
                    border-radius: 50%;
                    background: transparent;
                    color: var(--muted);
                    cursor: pointer;
                    transition: background .1s ease, color .1s ease;
                }

                .srlm-close:hover {
                    background: var(--neutral-bg);
                    color: var(--text);
                }

                /* ---------- Stepper ---------- */

                .srlm-stepper {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    margin: 16px 0 14px;
                }

                .srlm-step {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .srlm-step-bar {
                    height: 6px;
                    border-radius: var(--radius-full);
                    background: var(--bahama-blue-100);
                    transition: background .3s ease;
                }

                .srlm-step.is-done .srlm-step-bar {
                    background: var(--bahama-blue-300);
                }

                .srlm-step.is-active .srlm-step-bar {
                    background: var(--primary);
                }

                .srlm-step-label {
                    font-size: var(--font-xs);
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .srlm-step.is-active .srlm-step-label {
                    color: var(--primary);
                    font-weight: 700;
                }

                /* ---------- Banner motivasi ---------- */

                .srlm-banner {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                    margin-bottom: 20px;
                    padding: 12px 14px;
                    border-radius: var(--radius);
                    border: var(--border-w-xs) solid;
                }

                .srlm-banner svg {
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .srlm-banner-title {
                    font-size: var(--font-sm);
                    font-weight: 600;
                    line-height: 1.4;
                }

                .srlm-banner-quote {
                    font-size: var(--font-xs);
                    line-height: 1.4;
                    color: var(--text-muted);
                }

                .srlm-banner.is-info {
                    background: var(--info-bg);
                    border-color: var(--info-border-color);
                }

                .srlm-banner.is-info svg {
                    color: var(--info-text);
                }

                .srlm-banner.is-info .srlm-banner-title {
                    color: var(--bahama-blue-900);
                }

                .srlm-banner.is-purple {
                    background: var(--purple-bg);
                    border-color: var(--purple-border-color);
                }

                .srlm-banner.is-purple svg {
                    color: var(--purple-text);
                }

                .srlm-banner.is-purple .srlm-banner-title {
                    color: var(--purple-text);
                }

                .srlm-phase {
                    animation: srlm-slide .35s cubic-bezier(0.16, 1, 0.3, 1);
                }

                /* ---------- Layar selesai ---------- */

                .srlm-done {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 24px 12px;
                    text-align: center;
                }

                .srlm-done-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: var(--success-bg);
                    color: var(--success-text);
                    animation: srlm-celebrate .6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .srlm-done-title {
                    margin: 16px 0 0;
                    font-size: var(--font-lg);
                    font-weight: 800;
                    color: var(--success-text);
                }

                .srlm-done-text {
                    margin: 8px 0 0;
                    font-size: var(--font-sm);
                    line-height: 1.5;
                    color: var(--text-muted);
                }

                .srlm-reward {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 20px;
                    padding: 8px 16px;
                    border-radius: var(--radius-full);
                    border: var(--border-w-xs) solid var(--success-border-color);
                    background: var(--success-bg);
                    color: var(--success-text);
                    font-size: var(--font-sm);
                    font-weight: 700;
                }

                .srlm-card button:focus-visible {
                    outline: var(--border-w-md) solid var(--bahama-blue-400);
                    outline-offset: 2px;
                }

                @keyframes srlm-slide {
                    from {
                        opacity: 0;
                        transform: translateX(12px);
                    }

                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes srlm-celebrate {
                    0% {
                        transform: scale(0.4);
                        opacity: 0;
                    }

                    60% {
                        transform: scale(1.12);
                    }

                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @media (max-width: 576px) {
                    .srlm-overlay {
                        bottom: 96px;
                        right: 18px;
                    }

                    .srlm-card {
                        max-height: calc(100vh - 130px);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .srlm-card,
                    .srlm-phase,
                    .srlm-done-icon {
                        animation: none;
                    }

                    .srlm-step-bar {
                        transition: none;
                    }
                }
            `}</style>

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

							<div className="srlm-reward">
								<Trophy size={16} /> +50 XP SRL Mastery
							</div>
						</div>
					</div>
				) : (
					<>
						<div
							className="border-bottom bg-light"
							style={{
								flex: '0 0 auto',
								padding: '14px 28px',
							}}
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

						<div className="srlm-scroll">
							<div key={currentPhase} className="srlm-phase mt-3">
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
										goToReflection={goToReflection}
									/>
								)}

								{currentPhase === 'reflection' && (
									<SelfReflectionPhase
										srlData={srlData}
										updatePhaseData={updatePhaseData}
										backToPerformance={backToPerformance}
										handleFinish={handleFinish}
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
