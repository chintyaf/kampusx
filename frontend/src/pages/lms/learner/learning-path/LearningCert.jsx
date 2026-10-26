import React from 'react';

const LearningCert = () => {
	return (
		<>
			<Card
				className="border shadow-sm rounded-3 p-4 mb-4 overflow-hidden position-relative"
				style={{
					borderColor: '#BAE6FD',
					borderRadius: '16px',
					background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
				}}
			>
				<div className="d-flex align-items-center gap-2 mb-2">
					<ShieldCheck size={18} style={{ color: '#028090' }} />
					<h6 className="fw-bold mb-0" style={{ color: '#0B2545', fontSize: '0.95rem' }}>
						KampusX Certificate of Completion
					</h6>
				</div>

				<p
					className="text-muted small mb-3"
					style={{ fontSize: '0.78rem', lineHeight: 1.45 }}
				>
					Selesaikan seluruh 6 modul untuk mengklaim sertifikat digital yang tercatat di
					Blockchain Smart Contract dengan hash unik anti-pemalsuan.
				</p>

				<div
					className="p-3 rounded-3 bg-white border text-center shadow-sm mb-3"
					style={{ borderColor: '#BAE6FD' }}
				>
					<div className="fw-bold text-dark small mb-1">CERTIFICATE PREVIEW</div>
					<div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
						ID: KX-AI-RAG-2026-9921
					</div>
					<div
						className="badge bg-success-subtle text-success mt-2 px-3 py-1"
						style={{ fontSize: '0.7rem' }}
					>
						✓ Smart Contract Verified
					</div>
				</div>
			</Card>
		</>
	);
};

export default LearningCert;
