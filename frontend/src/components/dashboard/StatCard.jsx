import React from 'react';

const iconStyles = {
	blue: { backgroundColor: '#dff3ff', color: '#00699e' },
	green: { backgroundColor: '#dcfce7', color: '#166534' },
	yellow: { backgroundColor: '#fef3c7', color: '#92400e' },
	red: { backgroundColor: '#fee2e2', color: '#991b1b' },
};

const StatCard = ({ Icon, label, value, type }) => {
	const style = iconStyles[type] || iconStyles.blue;

	return (
		<div className="stat-card">
			<div style={style} className="stat-card__icon">
				{Icon ? <Icon size={17} /> : <div className="placeholder-icon" />}
			</div>
			<div>
				<p className="stat-card__label">{label}</p>
				<p className="stat-card__value">{value}</p>
			</div>
		</div>
	);
};

export default StatCard;
