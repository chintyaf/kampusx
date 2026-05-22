import React from 'react';

const FormHeading = ({ title, description, className }) => {
	return (
		<>
			<div className={`d-flex align-items-start ${className || ''}`}>
				<div>
					<h5 className="fw-bold mb-1" style={{ fontSize: '1.1rem' }}>
						{title}
					</h5>
					<p className="text-muted small mb-0">{description}</p>
				</div>
			</div>
		</>
	);
};

export default FormHeading;
