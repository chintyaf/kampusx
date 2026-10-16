import React from 'react';
import { Calendar, BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const LearningPathCard = ({ data }) => {
	return (
		<div className="col-12 col-md-6">
			<div
				style={{
					backgroundColor: 'var(--card)',
					borderRadius: 'var(--radius-lg)',
					border: '1px solid var(--neutral-border)',
					padding: '24px',
					boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
				}}
			>
				<div>
					{/* Header Kartu */}
					<div className="d-flex justify-content-between align-items-start mb-1">
						<h3
							style={{
								fontSize: 'var(--font-md)',
								fontWeight: '700',
								color: 'var(--text)',
								margin: 0,
							}}
						>
							{data.title}
						</h3>
						<span
							style={{
								backgroundColor:
									data.status === 'Published'
										? 'var(--success-bg)'
										: 'var(--neutral-bg)',
								color:
									data.status === 'Published'
										? 'var(--success-text)'
										: 'var(--neutral-text)',
								border: `1px solid ${
									data.status === 'Published'
										? 'var(--success-border-color)'
										: 'var(--neutral-border)'
								}`,
								padding: '2px 10px',
								borderRadius: 'var(--radius-full)',
								fontSize: 'var(--font-xs)',
								fontWeight: '600',
							}}
						>
							{data.status}
						</span>
					</div>

					{/* Subtitle / Event */}
					<div
						className="d-flex align-items-center gap-2 mb-4"
						style={{
							color: 'var(--text-muted)',
							fontSize: 'var(--font-sm)',
						}}
					>
						<Calendar size={16} />
						<span>{data.event}</span>
					</div>

					{/* Progress Bar */}
					<div className="mb-4">
						<div className="d-flex justify-content-between align-items-center mb-2">
							<span
								style={{
									color: 'var(--text-muted)',
									fontSize: 'var(--font-xs)',
									fontWeight: '500',
								}}
							>
								Overall Completion
							</span>
							<span
								style={{
									color: 'var(--text)',
									fontSize: 'var(--font-xs)',
									fontWeight: '600',
								}}
							>
								{data.completion}%
							</span>
						</div>

						<div
							style={{
								height: '6px',
								backgroundColor: 'var(--neutral-bg)',
								borderRadius: 'var(--radius-full)',
								overflow: 'hidden',
							}}
						>
							<div
								style={{
									width: `${data.completion}%`,
									height: '100%',
									backgroundColor: 'var(--primary)',
									borderRadius: 'var(--radius-full)',
								}}
							/>
						</div>
					</div>

					{/* Meta Info */}
					<div
						className="d-flex align-items-center gap-4 mb-4"
						style={{
							color: 'var(--text-muted)',
							fontSize: 'var(--font-sm)',
						}}
					>
						<div className="d-flex align-items-center gap-2">
							<BookOpen size={18} />
							<span>{data.modules} modules</span>
						</div>
						<div className="d-flex align-items-center gap-2">
							<Users size={18} />
							<span>{data.enrolled}</span>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="row g-2">
					<div className="col-6">
						<Link
							to={`/organizer/learning-path/${data.id}`}
							style={{
								display: 'block',
								width: '100%',
								textAlign: 'center',
								textDecoration: 'none',
								backgroundColor: 'var(--primary-light)',
								color: 'var(--primary)',
								border: '1px solid var(--primary-border)',
								padding: '8px 16px',
								borderRadius: 'var(--radius-md)',
								fontSize: 'var(--font-sm)',
								fontWeight: '600',
								cursor: 'pointer',
								transition: 'all 0.2s',
							}}
						>
							Manage
						</Link>
					</div>
					<div className="col-6">
						<button
							style={{
								width: '100%',
								backgroundColor: 'transparent',
								color: 'var(--text-muted)',
								border: '1px solid var(--neutral-border)',
								padding: '8px 16px',
								borderRadius: 'var(--radius-md)',
								fontSize: 'var(--font-sm)',
								fontWeight: '600',
								cursor: 'pointer',
								transition: 'all 0.2s',
							}}
						>
							Edit
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LearningPathCard;
