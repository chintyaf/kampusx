import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { CheckCircle2, XCircle, AlertCircle, Clock, ChevronRight } from 'lucide-react';

const ScoreDoughnut = ({ score, color }) => {
	const size = 120;
	const strokeWidth = 10;
	const center = size / 2;
	const radius = center - strokeWidth;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (score / 100) * circumference;

	return (
		<div
			style={{
				position: 'relative',
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
				<circle
					cx={center}
					cy={center}
					r={radius}
					stroke="#E2E8F0"
					strokeWidth={strokeWidth}
					fill="transparent"
				/>
				<circle
					cx={center}
					cy={center}
					r={radius}
					stroke={color}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
					style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
				/>
			</svg>
			<div style={{ position: 'absolute', textAlign: 'center' }}>
				<span
					style={{
						fontSize: '1.75rem',
						fontWeight: 800,
						color: '#0F172A',
						display: 'block',
						lineHeight: 1,
					}}
				>
					{score}
				</span>
				<span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>
					Nilai akhir
				</span>
			</div>
		</div>
	);
};

const ResultCard = ({ currentOutcome }) => {
	if (!currentOutcome) return null;

	return (
		<Card
			style={{
				borderRadius: 24,
				background: '#FFFFFF',
				padding: '28px 32px',
				border: '1px solid #E2E8F0',
				boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.05)',
				marginBottom: 24,
			}}
		>
			<Row className="g-4 align-items-stretch">
				{/* SISI KIRI: HERO SCORE & STATUS LULUS */}
				<Col
					lg={4}
					className="d-flex flex-column align-items-center justify-content-center p-3"
					style={{
						borderRight: '1px solid #F1F5F9',
					}}
				>
					<span
						style={{
							fontSize: '0.72rem',
							color: '#64748B',
							fontWeight: 700,
							letterSpacing: '0.08em',
							textTransform: 'uppercase',
							marginBottom: 12,
						}}
					>
						SKOR AKHIR KUIS
					</span>

					{/* Score Doughnut Chart */}
					<div className="my-2" style={{ position: 'relative' }}>
						<ScoreDoughnut
							score={currentOutcome.score}
							color={currentOutcome.themeColor}
						/>
					</div>

					{/* Status Lulus / Belum Lulus Badge */}
					<div
						style={{
							marginTop: 16,
							padding: '6px 20px',
							borderRadius: 50,
							backgroundColor: `${currentOutcome.themeColor}15`,
							color: currentOutcome.themeColor,
							fontWeight: 800,
							fontSize: '0.88rem',
							letterSpacing: '0.04em',
							display: 'inline-flex',
							alignItems: 'center',
							gap: 6,
						}}
					>
						{currentOutcome.score >= currentOutcome.passingScore
							? '✓ LULUS'
							: '✕ BELUM LULUS'}
					</div>

					<span
						style={{
							fontSize: '0.75rem',
							color: '#94A3B8',
							marginTop: 8,
							fontWeight: 500,
						}}
					>
						Kriteria Kelulusan: Min. {currentOutcome.passingScore}
					</span>
				</Col>

				{/* SISI KANAN: READINESS LEVEL, HEADLINE & REKOMENDASI AI */}
				<Col lg={8} className="d-flex flex-column justify-content-between ps-lg-4">
					<div>
						{/* Header & Readiness Badge */}
						<div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
							<span
								style={{
									fontSize: '0.75rem',
									color: '#0284C7',
									letterSpacing: '0.06em',
									fontWeight: 700,
									textTransform: 'uppercase',
								}}
							>
								HASIL SUMMATIVE QUIZ
							</span>

							{/* Readiness Level Chip */}
							<div
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: 6,
									padding: '4px 12px',
									borderRadius: 20,
									backgroundColor: `${currentOutcome.themeColor}12`,
									border: `1px solid ${currentOutcome.themeColor}30`,
								}}
							>
								<span
									style={{
										width: 8,
										height: 8,
										borderRadius: '50%',
										backgroundColor: currentOutcome.themeColor,
									}}
								/>
								<span
									style={{
										fontSize: '0.75rem',
										fontWeight: 800,
										color: currentOutcome.themeColor,
									}}
								>
									READINESS: {currentOutcome.badgeText}
								</span>
							</div>
						</div>

						{/* Headline & Feedback */}
						<h3
							style={{
								fontSize: '1.45rem',
								fontWeight: 800,
								color: '#0F172A',
								lineHeight: 1.3,
								marginBottom: 8,
							}}
						>
							{currentOutcome.headline}
						</h3>
						<p
							style={{
								fontSize: '0.88rem',
								color: '#64748B',
								lineHeight: 1.6,
								marginBottom: 20,
							}}
						>
							{currentOutcome.feedback}
						</p>

						{/* Metrik Soal & Waktu Pengerjaan */}
						<div style={{ marginBottom: 20 }}>
							<span
								style={{
									fontSize: '0.7rem',
									color: '#94A3B8',
									fontWeight: 700,
									letterSpacing: '0.05em',
									textTransform: 'uppercase',
									display: 'block',
									marginBottom: 8,
								}}
							>
								Rincian Kuis & Durasi
							</span>
							<div className="d-flex flex-wrap gap-2">
								<div
									style={{
										padding: '6px 14px',
										borderRadius: 8,
										background: '#F0FDF4',
										border: '1px solid #DCFCE7',
										display: 'flex',
										alignItems: 'center',
										gap: 6,
									}}
								>
									<CheckCircle2 size={15} className="text-success" />
									<span
										style={{
											fontSize: '0.82rem',
											color: '#166534',
											fontWeight: 700,
										}}
									>
										{currentOutcome.metrics.correct} Benar
									</span>
								</div>

								<div
									style={{
										padding: '6px 14px',
										borderRadius: 8,
										background: '#FEF2F2',
										border: '1px solid #FEE2E2',
										display: 'flex',
										alignItems: 'center',
										gap: 6,
									}}
								>
									<XCircle size={15} className="text-danger" />
									<span
										style={{
											fontSize: '0.82rem',
											color: '#991B1B',
											fontWeight: 700,
										}}
									>
										{currentOutcome.metrics.wrong} Salah
									</span>
								</div>

								<div
									style={{
										padding: '6px 14px',
										borderRadius: 8,
										background: '#FFFBEB',
										border: '1px solid #FEF3C7',
										display: 'flex',
										alignItems: 'center',
										gap: 6,
									}}
								>
									<AlertCircle size={15} style={{ color: '#D97706' }} />
									<span
										style={{
											fontSize: '0.82rem',
											color: '#92400E',
											fontWeight: 700,
										}}
									>
										{currentOutcome.metrics.unanswered} Terlewat
									</span>
								</div>

								<div
									style={{
										padding: '6px 14px',
										borderRadius: 8,
										background: '#F8FAFC',
										border: '1px solid #E2E8F0',
										display: 'flex',
										alignItems: 'center',
										gap: 6,
									}}
								>
									<Clock size={15} style={{ color: '#64748B' }} />
									<span
										style={{
											fontSize: '0.82rem',
											color: '#334155',
											fontWeight: 700,
										}}
									>
										{currentOutcome.duration || '08m 45s'}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Progress Bar Ringkas */}
					<div
						style={{
							padding: '12px 16px',
							background: '#F8FAFC',
							borderRadius: 12,
							border: '1px solid #F1F5F9',
						}}
					>
						<div className="d-flex justify-content-between align-items-center mb-1">
							<span
								style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}
							>
								Progres Skor vs Target Kelulusan ({currentOutcome.passingScore}%)
							</span>
							<span
								style={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: 800 }}
							>
								{currentOutcome.score}%
							</span>
						</div>
						<div
							style={{
								position: 'relative',
								height: 8,
								background: '#E2E8F0',
								borderRadius: 50,
							}}
						>
							<div
								style={{
									height: '100%',
									width: `${Math.min(currentOutcome.score, 100)}%`,
									backgroundColor: currentOutcome.themeColor,
									borderRadius: 50,
									transition: 'width 0.5s ease',
								}}
							/>
							<div
								style={{
									position: 'absolute',
									left: `${currentOutcome.passingScore}%`,
									top: -3,
									width: 2,
									height: 14,
									backgroundColor: '#0F172A',
									borderRadius: 1,
								}}
							/>
						</div>
					</div>
				</Col>
			</Row>

			{/* FOOTER ACTION BAR */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'end',
					flexWrap: 'wrap',
					gap: 12,
					marginTop: 24,
					paddingTop: 18,
					borderTop: '1px solid #F1F5F9',
				}}
			>
				<Button
					style={{
						backgroundColor: currentOutcome.themeColor,
						borderColor: currentOutcome.themeColor,
						fontSize: '0.88rem',
						fontWeight: 700,
						borderRadius: 10,
						padding: '10px 22px',
						display: 'inline-flex',
						alignItems: 'center',
						gap: 8,
						color: '#FFFFFF',
						boxShadow: `0 4px 12px ${currentOutcome.themeColor}33`,
					}}
				>
					<span>{currentOutcome.ctaPrimaryText}</span>
					<ChevronRight size={16} />
				</Button>
			</div>
		</Card>
	);
};

export default ResultCard;
