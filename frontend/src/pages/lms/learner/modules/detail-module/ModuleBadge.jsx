import React from 'react';
import { Card } from 'react-bootstrap';
import { Award, ShieldCheck } from 'lucide-react';

const ModuleBadge = ({ moduleData }) => {
	const badgeTitle = moduleData?.badgeEarned?.title || 'API Architect Apprentice';
	const badgeDescription =
		moduleData?.badgeEarned?.description ||
		'Selesaikan seluruh unit pembelajaran dan checkpoint refleksi SRL untuk mengklaim badge kredensial digital ini.';

	return (
		<Card
			className="border-0 shadow-sm rounded-4 p-4 mb-4"
			style={{
				borderRadius: '16px',
				background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
				border: '1px solid #BAE6FD',
			}}
		>
			<div className="d-flex align-items-center gap-2 mb-2">
				<Award size={20} style={{ color: '#028090' }} />
				<h6 className="fw-bold mb-0" style={{ color: '#0B2545', fontSize: '0.95rem' }}>
					Badge Modul: {badgeTitle}
				</h6>
			</div>

			<p className="text-muted small mb-3" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
				{badgeDescription}
			</p>

			<div
				className="p-3 rounded-3 bg-white border text-center shadow-2xs"
				style={{ borderColor: '#BAE6FD' }}
			>
				<div
					className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-2 shadow-2xs"
					style={{
						width: '48px',
						height: '48px',
						background: 'linear-gradient(135deg, #028090 0%, #00A896 100%)',
						color: '#FFFFFF',
					}}
				>
					<Award size={26} />
				</div>
				<div className="fw-bold text-dark small">{badgeTitle}</div>
				<div className="text-muted d-flex align-items-center justify-content-center gap-1 mt-1" style={{ fontSize: '0.7rem' }}>
					<ShieldCheck size={12} className="text-success" />
					Verified Micro-Credential
				</div>
			</div>
		</Card>
	);
};

export default ModuleBadge;