import React from 'react';

const CelebrationToast = () => {
	return (
		<Alert
			variant="success"
			className="d-flex align-items-center justify-content-between rounded-3 shadow-sm mb-3 py-2 px-3"
		>
			<div className="d-flex align-items-center gap-2">
				<Sparkles size={18} className="text-warning" />
				<span className="fw-bold small">
					Unit {currentLesson.number} Selesai! +{currentLesson.xp} XP ditambahkan ke
					profil belajarmu.
				</span>
			</div>
			<CheckCircle2 size={18} className="text-success" />
		</Alert>
	);
};

export default CelebrationToast;

// {showCelebration && (

// )}
