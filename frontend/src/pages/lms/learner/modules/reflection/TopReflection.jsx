import React from 'react';

const TopReflection = () => {
	return (
		<div
			style={{
				background: '#FFFFFF',
				borderBottom: '1px solid #E2E8F0',
				padding: '16px 0',
				position: 'sticky',
				top: 0,
				zIndex: 1020,
			}}
		>
			<Container>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						flexWrap: 'wrap',
						gap: 16,
					}}
				>
					{/* Sisi Kiri: Tombol Silabus, Pill Badge, & Judul Modul */}
					<div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
						{/* Kembali ke Silabus */}
						<button
							onClick={() => navigate('/learning')}
							style={{
								background: 'none',
								border: 'none',
								display: 'flex',
								alignItems: 'center',
								gap: 6,
								color: '#475569',
								fontSize: '14px',
								fontWeight: 700,
								padding: 0,
								cursor: 'pointer',
							}}
						>
							<ChevronLeft size={18} style={{ color: '#475569' }} />
							<span>Silabus</span>
						</button>

						{/* Badge SUMMATIVE QUIZ (Pill / Capsule) */}
						<span
							style={{
								fontSize: '0.72rem',
								fontWeight: 800,
								backgroundColor: '#EBF5FF',
								color: '#1D4ED8',
								letterSpacing: '0.04em',
								padding: '6px 16px',
								borderRadius: '50px',
								textTransform: 'uppercase',
								display: 'inline-block',
							}}
						>
							SUMMATIVE QUIZ
						</span>

						{/* Judul Modul */}
						<span
							style={{
								fontSize: '15px',
								fontWeight: 800,
								color: '#0F172A',
								letterSpacing: '-0.01em',
							}}
						>
							{moduleTitle}
						</span>
					</div>

					{/* Sisi Kanan: Badge Status Kuis Selesai */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 6,
							backgroundColor: '#E6F4EA',
							border: '1px solid #A7F3D0',
							color: '#15803D',
							borderRadius: '50px',
							padding: '6px 16px',
							fontSize: '0.82rem',
							fontWeight: 700,
						}}
					>
						<Check size={16} style={{ strokeWidth: 2.5 }} />
						<span>Kuis selesai</span>
					</div>
				</div>
			</Container>
		</div>
	);
};

export default TopReflection;
