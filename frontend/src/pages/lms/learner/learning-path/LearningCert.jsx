import React from 'react';
import { Card, Button, ProgressBar, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Award, Lock } from 'lucide-react';

const LearningCert = ({ pathId = 'lp-1', totalModules = 6, completedModules = 2 }) => {
	const navigate = useNavigate();

	const isEligibleForCert = totalModules > 0 && completedModules >= totalModules;
	const percent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
	const remaining = totalModules - completedModules;

	return (
		<Card className="mb-4 lms-container-card" style={{ borderRadius: 'var(--radius-lg)' }}>
			<Card.Body className="p-4">
				<Stack direction="horizontal" gap={3} className="align-items-start mb-3">
					<div
						className="d-flex align-items-center justify-content-center flex-shrink-0"
						style={{
							width: 40,
							height: 40,
							borderRadius: 'var(--radius-full)',
							backgroundColor: isEligibleForCert
								? 'var(--primary-light)'
								: 'var(--neutral-bg)',
							color: isEligibleForCert
								? 'var(--color-primary)'
								: 'var(--neutral-text)',
						}}
					>
						{isEligibleForCert ? <Award size={20} /> : <Lock size={18} />}
					</div>

					<div>
						<h6
							className="fw-bold mb-1"
							style={{ fontSize: 'var(--font-md)', color: 'var(--color-text)' }}
						>
							Sertifikat Kelulusan
						</h6>
						<p
							style={{
								fontSize: 'var(--font-sm)',
								lineHeight: 1.5,
								color: 'var(--text-muted)',
							}}
						>
							{isEligibleForCert
								? 'Selamat, semua modul sudah selesai. Sertifikatmu siap diklaim.'
								: `Selesaikan semua modul untuk mengklaim sertifikat. Tinggal ${remaining} modul lagi.`}
						</p>
					</div>
				</Stack>

				{!isEligibleForCert && (
					<div className="mb-3">
						<Stack direction="horizontal" className="justify-content-between mb-1">
							<span
								style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}
							>
								Progres modul
							</span>
							<span
								className="fw-semibold"
								style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text)' }}
							>
								{completedModules}/{totalModules}
							</span>
						</Stack>
						<ProgressBar
							now={percent}
							style={{
								height: 6,
								borderRadius: 'var(--radius-full)',
								backgroundColor: 'var(--bahama-blue-100)',
								'--bs-progress-bar-bg': 'var(--color-primary)',
							}}
						/>
					</div>
				)}

				<Button
					variant={isEligibleForCert ? 'primary' : 'secondary'}
					disabled={!isEligibleForCert}
					className="w-100 fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
					style={{
						borderRadius: 'var(--radius-full)',
						padding: '9px 12px',
						fontSize: 'var(--font-sm)',
						minHeight: 40,
					}}
					onClick={() => navigate(`/learner/learning-paths/${pathId}/certificate`)}
				>
					{isEligibleForCert ? <Award size={16} /> : <Lock size={14} />}
					{isEligibleForCert ? 'Klaim Sertifikat' : 'Selesaikan Modul Dulu'}
				</Button>
			</Card.Body>
		</Card>
	);
};

export default LearningCert;
