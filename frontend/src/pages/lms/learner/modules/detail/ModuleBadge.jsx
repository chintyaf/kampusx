import React from 'react';

const ModuleBadge = () => {
	return (
		<>
			<Card
				className="border shadow-sm rounded-3 p-4 mb-4"
				style={{
					borderColor: '#BAE6FD',
					borderRadius: '16px',
					background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
				}}
			>
				<div className="d-flex align-items-center gap-2 mb-2">
					<Award size={18} style={{ color: '#028090' }} />
					<h6 className="fw-bold mb-0" style={{ color: '#0B2545', fontSize: '0.95rem' }}>
						Badge Modul: {moduleData.badgeEarned.title}
					</h6>
				</div>

				<p
					className="text-muted small mb-3"
					style={{ fontSize: '0.78rem', lineHeight: 1.45 }}
				>
					Selesaikan seluruh 6 unit pembelajaran dan checkpoint refleksi SRL untuk
					mengklaim badge kredensial digital ini.
				</p>

				<div
					className="p-3 rounded-3 bg-white border text-center shadow-sm"
					style={{ borderColor: '#BAE6FD' }}
				>
					<div
						className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-2"
						style={{
							width: '48px',
							height: '48px',
							backgroundColor: '#028090',
							color: '#FFFFFF',
						}}
					>
						<Award size={26} />
					</div>
					<div className="fw-bold text-dark small">{moduleData.badgeEarned.title}</div>
					<div className="text-muted" style={{ fontSize: '0.7rem' }}>
						Verified Micro-Credential
					</div>
				</div>
			</Card>
		</>
	);
};

export default ModuleBadge;
