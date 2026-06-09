import React from 'react';

const iconStyles = {
	blue: { backgroundColor: '#dff3ff', color: '#00699e' },
	green: { backgroundColor: '#dcfce7', color: '#166534' },
	yellow: { backgroundColor: '#fef3c7', color: '#92400e' },
	red: { backgroundColor: '#fee2e2', color: '#991b1b' },
};

const StatCard = ({ Icon, label, value, type, className, style: customStyle, iconBg, iconColor }) => {
	const defaultStyle = iconStyles[type] || iconStyles.blue;
	const iconStyle = {
		backgroundColor: iconBg || defaultStyle.backgroundColor,
		color: iconColor || defaultStyle.color,
	};

	return (
		<div className={`stat-card ${className || ''}`} style={customStyle}>
			<div style={iconStyle} className="stat-card__icon">
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
