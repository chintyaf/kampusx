import React from 'react';
import { Card, Button, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Award, Lock, ExternalLink, GraduationCap, CheckCircle } from 'lucide-react';

const LearningCert = ({ pathId = 'lp-1', progressPercent = 33, totalModules = 6, completedModules = 2 }) => {
	const navigate = useNavigate();
	const isEligibleForCert = progressPercent >= 100 || completedModules >= totalModules;

	return (
		<Card
			className="border-0 shadow-sm rounded-4 p-4 mb-4 overflow-hidden position-relative"
			style={{
				borderRadius: '16px',
				background: isEligibleForCert
					? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
					: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
				border: isEligibleForCert ? '1px solid #6EE7B7' : '1px solid #BAE6FD',
			}}
		>
			<div className="d-flex align-items-center justify-content-between mb-2">
				<div className="d-flex align-items-center gap-2">
					{isEligibleForCert ? (
						<GraduationCap size={20} className="text-emerald-600" />
					) : (
						<ShieldCheck size={20} style={{ color: '#028090' }} />
					)}
					<h6 className="fw-bold mb-0 text-slate-900" style={{ fontSize: '0.95rem' }}>
						KampusX Verified Certificate
					</h6>
				</div>

				{isEligibleForCert ? (
					<span className="badge bg-emerald-600 text-white rounded-pill px-2.5 py-1 text-xs">
						Siap Diklaim ✓
					</span>
				) : (
					<span className="badge bg-slate-200 text-slate-700 rounded-pill px-2.5 py-1 text-xs d-flex align-items-center gap-1">
						<Lock size={11} />
						Terkunci
					</span>
				)}
			</div>

			<p className="text-slate-600 small mb-3" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
				{isEligibleForCert
					? 'Selamat! Kamu telah menyelesaikan seluruh kurikulum. Sertifikat kelulusan digital resmi telah terbit.'
					: `Selesaikan seluruh ${totalModules} modul untuk mengklaim sertifikat kelulusan digital yang tercatat di Blockchain Smart Contract.`}
			</p>

			{/* Certificate Miniature Preview Card */}
			<div
				className="p-3 rounded-3 bg-white border text-center shadow-2xs mb-3 position-relative overflow-hidden"
				style={{ borderColor: isEligibleForCert ? '#A7F3D0' : '#BAE6FD' }}
			>
				<div className="d-flex items-center justify-content-between mb-2">
					<span className="text-[10px] font-bold text-slate-400 font-monospace">
						CREDENTIAL PREVIEW
					</span>
					<span className="text-[10px] font-bold text-amber-600">
						ERC-1155
					</span>
				</div>

				<div className="py-2">
					<div className="fw-extrabold text-slate-900 small mb-0.5">
						CERTIFICATE OF COMPLETION
					</div>
					<div className="text-slate-400 font-monospace" style={{ fontSize: '0.68rem' }}>
						ID: KX-CERT-2026-9921
					</div>
				</div>

				<div className="pt-2 border-t border-slate-100 d-flex items-center justify-between text-[11px]">
					<span className="text-emerald-600 font-semibold flex items-center gap-1">
						<CheckCircle size={12} />
						Zero-Trust Verified
					</span>
					<span className="text-slate-400">Polygon PoS</span>
				</div>
			</div>

			{/* Progress to Unlock */}
			{!isEligibleForCert && (
				<div className="mb-3">
					<div className="d-flex justify-content-between small text-slate-600 mb-1">
						<span style={{ fontSize: '0.75rem' }}>Syarat Kelulusan:</span>
						<span className="fw-bold" style={{ fontSize: '0.75rem' }}>
							{completedModules}/{totalModules} Modul ({progressPercent}%)
						</span>
					</div>
					<ProgressBar
						now={progressPercent}
						variant="info"
						style={{ height: 6, borderRadius: 10 }}
					/>
				</div>
			)}

			<Button
				variant={isEligibleForCert ? 'success' : 'primary'}
				className="w-100 rounded-pill py-2 fw-bold small d-inline-flex align-items-center justify-content-center gap-2 shadow-xs"
				onClick={() => navigate(`/learner/learning-paths/${pathId}/certificate`)}
			>
				<GraduationCap size={16} />
				{isEligibleForCert ? 'Buka & Unduh Sertifikat 🎓' : 'Preview Syarat Sertifikat'}
			</Button>
		</Card>
	);
};

export default LearningCert;