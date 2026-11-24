import React from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Trophy, Zap, Clock, ArrowRight, X } from 'lucide-react';

/**
 * Helper format detik ke menit & detik
 */
const formatDuration = (totalSeconds) => {
	if (!totalSeconds) return null;
	const mins = Math.floor(totalSeconds / 60);
	const secs = totalSeconds % 60;
	if (mins === 0) return `${secs} dtk`;
	return `${mins}m ${secs > 0 ? `${secs}s` : ''}`;
};

/**
 * Menampilkan Toast Notifikasi saat user menyelesaikan suatu lesson
 */
export const showLessonCompleteToast = ({
	lesson = {},
	durationSeconds = 0,
	progress = null,
	isLast = false,
	onNext = null,
	onGoToQuiz = null,
}) => {
	const durationText = formatDuration(durationSeconds);
	const xpEarned = lesson.xp || 25;

	toast.custom(
		(t) => (
			<div
				style={{
					opacity: t.visible ? 1 : 0,
					transform: t.visible ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.96)',
					transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
					minWidth: '320px',
					maxWidth: '420px',
					background: '#ffffff',
					borderRadius: '16px',
					boxShadow: '0 12px 36px -4px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.08)',
					border: '1px solid #e2e8f0',
					padding: '16px',
					pointerEvents: 'auto',
					fontFamily: 'inherit',
				}}
			>
				{/* Top Bar: Icon, Header, Close */}
				<div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
					{/* Status Icon */}
					<div
						style={{
							width: '40px',
							height: '40px',
							borderRadius: '12px',
							background: isLast ? '#fef3c7' : '#ecfdf5',
							color: isLast ? '#d97706' : '#059669',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexShrink: 0,
						}}
					>
						{isLast ? <Trophy size={22} /> : <CheckCircle2 size={22} />}
					</div>

					{/* Title & Body */}
					<div style={{ flex: 1, minWidth: 0 }}>
						<div
							style={{
								fontSize: '11px',
								fontWeight: 700,
								textTransform: 'uppercase',
								letterSpacing: '0.04em',
								color: isLast ? '#b45309' : '#047857',
								marginBottom: '2px',
							}}
						>
							{isLast ? '🎉 Modul Selesai!' : '✨ Pelajaran Selesai!'}
						</div>

						<h6
							style={{
								margin: '0 0 6px 0',
								fontSize: '14px',
								fontWeight: 700,
								color: '#0f172a',
								lineHeight: 1.35,
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
							}}
							title={lesson.title || 'Materi Selesai'}
						>
							{lesson.title || 'Pelajaran Berhasil Diselesaikan'}
						</h6>

						{/* Rewards & Meta Chips */}
						<div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
							<span
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: '4px',
									fontSize: '11px',
									fontWeight: 700,
									color: '#b45309',
									background: '#fef3c7',
									padding: '2px 8px',
									borderRadius: '999px',
								}}
							>
								<Zap size={12} fill="#f59e0b" color="#d97706" />
								+{xpEarned} XP
							</span>

							{durationText && (
								<span
									style={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: '4px',
										fontSize: '11px',
										fontWeight: 500,
										color: '#64748b',
										background: '#f1f5f9',
										padding: '2px 8px',
										borderRadius: '999px',
									}}
								>
									<Clock size={11} />
									{durationText}
								</span>
							)}

							{progress && (
								<span
									style={{
										fontSize: '11px',
										fontWeight: 600,
										color: '#005a87',
										background: '#f0f9ff',
										padding: '2px 8px',
										borderRadius: '999px',
									}}
								>
									{progress.completed}/{progress.total} selesai
								</span>
							)}
						</div>
					</div>

					{/* Close Button */}
					<button
						onClick={() => toast.dismiss(t.id)}
						style={{
							background: 'none',
							border: 'none',
							padding: '4px',
							color: '#94a3b8',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							borderRadius: '6px',
							transition: 'color 0.15s ease',
						}}
						aria-label="Tutup notifikasi"
					>
						<X size={16} />
					</button>
				</div>

				{/* Progress Mini Bar (jika ada data progress) */}
				{progress && typeof progress.percent === 'number' && (
					<div
						style={{
							marginTop: '12px',
							height: '4px',
							background: '#f1f5f9',
							borderRadius: '999px',
							overflow: 'hidden',
						}}
					>
						<div
							style={{
								width: `${Math.min(100, progress.percent)}%`,
								height: '100%',
								background: isLast ? '#f59e0b' : '#059669',
								transition: 'width 0.4s ease',
							}}
						/>
					</div>
				)}

				{/* Footer Quick Action */}
				{(onNext || onGoToQuiz) && (
					<div
						style={{
							marginTop: '12px',
							paddingTop: '10px',
							borderTop: '1px solid #f1f5f9',
							display: 'flex',
							justifyContent: 'flex-end',
							gap: '8px',
						}}
					>
						<button
							onClick={() => {
								toast.dismiss(t.id);
								if (isLast && onGoToQuiz) {
									onGoToQuiz();
								} else if (onNext) {
									onNext();
								}
							}}
							style={{
								background: isLast ? '#d97706' : '#005a87',
								color: '#ffffff',
								border: 'none',
								borderRadius: '8px',
								padding: '6px 14px',
								fontSize: '12px',
								fontWeight: 600,
								display: 'inline-flex',
								alignItems: 'center',
								gap: '6px',
								cursor: 'pointer',
								boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
							}}
						>
							{isLast ? 'Kerjakan Kuis Modul' : 'Materi Selanjutnya'}
							<ArrowRight size={13} />
						</button>
					</div>
				)}
			</div>
		),
		{
			duration: 4500,
			position: 'top-right',
		}
	);
};

export default showLessonCompleteToast;

