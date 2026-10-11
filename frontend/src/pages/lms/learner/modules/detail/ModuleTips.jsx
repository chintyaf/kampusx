import React from 'react';

const ModuleTips = () => {
	return (
		<>
			<Card
				className="border shadow-sm rounded-3 p-4 bg-white"
				style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}
			>
				<div className="d-flex align-items-center gap-2 mb-2">
					<Sparkles size={16} className="text-warning" />
					<h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.92rem' }}>
						Tips Metakognisi Belajar (SRL)
					</h6>
				</div>
				<p
					className="text-muted small mb-0"
					style={{ fontSize: '0.8rem', lineHeight: 1.5 }}
				>
					"Riset membuktikan bahwa mahasiswa yang menentukan alokasi waktu dan mencatat
					poin kunci secara mandiri memiliki retensi ingatan 40% lebih tinggi dibandingkan
					menonton pasif."
				</p>
			</Card>
		</>
	);
};

export default ModuleTips;
