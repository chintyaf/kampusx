import React from 'react';

const XPToast = () => {
	return (
		<div
			className="position-fixed top-0 end-0 m-3 m-md-4 p-3 rounded-3 shadow-lg d-flex align-items-center gap-3 text-white"
			style={{
				backgroundColor: '#0F172A',
				border: '2px solid #10B981',
				borderRadius: '16px',
				zIndex: 9999,
				boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.35)',
				animation: 'fadeIn 0.25s ease-out',
			}}
		>
			<div
				className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
				style={{
					width: 40,
					height: 40,
					backgroundColor: '#10B981',
					color: '#FFFFFF',
				}}
			>
				<Zap size={20} fill="currentColor" />
			</div>
			<div>
				<div className="fw-bold text-success" style={{ fontSize: '0.92rem' }}>
					+{xpToast.xp} XP DIPEROLEH!
				</div>
				<div className="small text-light" style={{ fontSize: '0.8rem', opacity: 0.9 }}>
					{xpToast.text}
				</div>
			</div>
		</div>
	);
};

export default XPToast;

// {xpToast.show &&
