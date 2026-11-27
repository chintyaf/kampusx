import React, { useEffect, useState } from 'react';
import { X, Play, Zap, Pause, ClipboardCheck, Target } from 'lucide-react';
import { useSRL } from '@/context/SRLContext';

const RING_RADIUS = 40;
const SEGMENT_SWEEP = 96;
const SEGMENT_START = [-80, 40, 160];

const formatTime = (totalSeconds) => {
	const s = Math.max(0, Math.floor(totalSeconds));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;

	const mm = String(m).padStart(2, '0');
	const ss = String(sec).padStart(2, '0');

	return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

const SRLTriggerButton = () => {
	const { toggleModal, isOpen, isSessionActive, currentPhase, isPaused, srlData } = useSRL();

	// Timer
	const perf = srlData?.performance ?? {};

	const isRunning = perf.startedAt !== null && perf.startedAt !== undefined && !isPaused;

	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (!isRunning || isOpen) return undefined;

		setNow(Date.now());

		const id = setInterval(() => {
			setNow(Date.now());
		}, 1000);

		return () => clearInterval(id);
	}, [isRunning, isOpen]);

	const targetSeconds = (Number(srlData?.forethought?.estimatedTime) || 25) * 60;

	const elapsed = Math.max(
		0,
		(perf.accumulatedSeconds || 0) +
			(isRunning ? Math.floor((now - perf.startedAt) / 1000) : 0),
	);

	const reached = elapsed >= targetSeconds;

	const timeText = reached
		? `+${formatTime(elapsed - targetSeconds)}`
		: formatTime(targetSeconds - elapsed);

	// Phase configuration
	const getPhaseConfig = () => {
		if (!isSessionActive || currentPhase === 'forethought') {
			return {
				phase: 1,
				name: 'Forethought',
				icon: isSessionActive ? (
					<Target size={22} />
				) : (
					<Play size={22} fill="currentColor" />
				),
				accent: 'var(--primary)',
			};
		}

		if (currentPhase === 'performance') {
			return {
				phase: 2,
				name: 'Performance',
				icon: isPaused ? (
					<Pause size={22} fill="currentColor" />
				) : (
					<Zap size={24} fill="currentColor" />
				),
				accent: isPaused ? 'var(--warning-text)' : 'var(--primary)',
			};
		}

		return {
			phase: 3,
			name: 'Self-Reflection',
			icon: <ClipboardCheck size={22} />,
			accent: 'var(--purple-text)',
		};
	};

	const config = getPhaseConfig();

	const showTimer = !isOpen && isSessionActive && currentPhase === 'performance';

	const icon = isOpen ? <X size={22} /> : config.icon;

	const title = isOpen
		? 'Tutup SRL'
		: showTimer
			? `Waktu belajar: ${timeText}`
			: `SRL - ${config.name}`;

	return (
		<>
			<style>{`
				.srl-trigger-container {
					position: fixed;
					bottom: 75px;
					right: 28px;
					z-index: 9999;
					display: flex;
					align-items: center;
					justify-content: center;
					font-family: var(--font, inherit);
					--srl-color: ${config.accent};
					--srl-accent: ${config.accent};
					--srl-track: var(--bahama-blue-200);
				}

				/* ---------- Trigger button ---------- */

				.srl-trigger {
					position: relative;
					width: 68px;
					height: 68px;
					padding: 0;
					border: 0;
					border-radius: 50%;
					background: color-mix(
						in srgb,
						var(--card) 40%,
						transparent
					);
					-webkit-backdrop-filter: blur(10px) saturate(1.4);
					backdrop-filter: blur(10px) saturate(1.4);
					color: var(--color-white);
					cursor: pointer;
					box-shadow:
						0 8px 24px rgba(8, 47, 73, 0.12),
						inset 0 0 0 var(--border-w-xs)
							rgba(255, 255, 255, 0.55);
					transition:
						transform .25s ease,
						box-shadow .25s ease;
				}

				.srl-trigger:hover {
					transform: translateY(-3px);
					box-shadow:
						0 12px 30px rgba(8, 47, 73, 0.18),
						inset 0 0 0 var(--border-w-xs)
							rgba(255, 255, 255, 0.7);
				}

				.srl-trigger:active {
					transform: translateY(-1px) scale(0.97);
				}

				.srl-trigger:focus-visible {
					outline: var(--border-w-md) solid var(--srl-color);
					outline-offset: 3px;
				}

				/* ---------- Progress ring ---------- */

				.srl-ring {
					position: absolute;
					inset: 0;
					width: 100%;
					height: 100%;
				}

				.srl-seg {
					fill: none;
					stroke-width: 4.5;
					stroke-linecap: round;
					transform-origin: 50px 50px;
					transition:
						stroke .3s ease,
						opacity .3s ease;
				}

				.srl-seg.is-todo {
					stroke: var(--srl-track);
				}

				.srl-seg.is-done {
					stroke: var(--srl-color);
					opacity: .45;
				}

				.srl-seg.is-active {
					stroke: var(--srl-color);
					filter: drop-shadow(
						0 0 2px
						color-mix(
							in srgb,
							var(--srl-color) 50%,
							transparent
						)
					);
				}

				/* ---------- Button core ---------- */

				.srl-core {
					position: absolute;
					inset: 24%;
					border-radius: 50%;
					background: linear-gradient(
						145deg,
						var(--srl-accent),
						color-mix(
							in srgb,
							var(--srl-accent) 65%,
							black
						)
					);
					box-shadow: 0 6px 14px
						color-mix(
							in srgb,
							var(--srl-accent) 40%,
							transparent
						);
					display: flex;
					align-items: center;
					justify-content: center;
				}

				/* ---------- Session indicator ---------- */

				.srl-trigger-dot {
					position: absolute;
					top: -3px;
					right: -3px;
					width: 14px;
					height: 14px;
					border-radius: 50%;
					background: ${isPaused ? 'var(--warning-border)' : 'var(--success-border-color)'};
					border: var(--border-w-md) solid var(--card);
				}

				/* ---------- Compact Performance timer ---------- */

				.srl-timer {
					position: absolute;
					top: calc(100%);
					left: 50%;
					transform: translateX(-50%);
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 5px;
					padding: 5px 10px;
					border-radius: 20px;
					background: var(--card);
					border: var(--border-w-xs) solid var(--border-md);
					box-shadow: 0 3px 12px rgba(8, 47, 73, 0.10);
					color: var(--text);
					font-size: 12px;
					font-weight: 700;
					font-variant-numeric: tabular-nums;
					white-space: nowrap;
					pointer-events: none;
					animation: srl-timer-in .2s ease-out;
				}

				.srl-timer.is-paused {
					color: var(--warning-text);
				}

				.srl-timer.is-overtime {
					color: var(--danger-text, #dc2626);
				}

				.srl-timer-dot {
					width: 6px;
					height: 6px;
					border-radius: 50%;
					background: var(--success-border-color);
					flex-shrink: 0;
				}

				.srl-timer.is-paused .srl-timer-dot {
					background: var(--warning-border);
				}

				@keyframes srl-timer-in {
					from {
						opacity: 0;
						transform: translate(-50%, -4px);
					}
					to {
						opacity: 1;
						transform: translate(-50%, 0);
					}
				}

				@media (max-width: 576px) {
					.srl-trigger-container {
						bottom: 26px;
						right: 18px;
					}

					.srl-trigger {
						width: 60px;
						height: 60px;
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.srl-trigger,
					.srl-seg,
					.srl-timer {
						transition: none;
						animation: none;
					}
				}
			`}</style>

			<div className="srl-trigger-container">
				<button
					type="button"
					onClick={toggleModal}
					title={title}
					aria-label={
						`SRL, fase ${config.phase} dari 3: ${config.name}` +
						(showTimer ? `. Waktu belajar ${timeText}` : '')
					}
					aria-expanded={isOpen}
					className="srl-trigger"
				>
					<svg className="srl-ring" viewBox="0 0 100 100" aria-hidden="true">
						{SEGMENT_START.map((start, i) => {
							const n = i + 1;

							const state =
								n < config.phase
									? 'is-done'
									: n === config.phase
										? 'is-active'
										: 'is-todo';

							return (
								<circle
									key={n}
									className={`srl-seg ${state}`}
									cx="50"
									cy="50"
									r={RING_RADIUS}
									pathLength="360"
									strokeDasharray={`${SEGMENT_SWEEP} ${360 - SEGMENT_SWEEP}`}
									style={{
										transform: `rotate(${start}deg)`,
									}}
								/>
							);
						})}
					</svg>

					<span className="srl-core">{icon}</span>

					{isSessionActive && !isOpen && <span className="srl-trigger-dot" />}
				</button>

				{/* Timer only appears during Performance */}
				{showTimer && (
					<div
						className={`srl-timer ${
							isPaused ? 'is-paused' : ''
						} ${reached ? 'is-overtime' : ''}`}
						aria-live="off"
						title={isPaused ? 'Sesi pembelajaran dijeda' : 'Sisa waktu pembelajaran'}
					>
						<span className="srl-timer-dot" />
						<span>{timeText}</span>
					</div>
				)}
			</div>
		</>
	);
};

export default SRLTriggerButton;
