import React from 'react';
import { Calendar, BookOpen, Users, Clock, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLMSUrl } from '@/utils/imageUtils';

// Organizer
const LearningPathCard = ({ data }) => {
	const isPublished = data.status === 'Published';

	const completion = Math.min(100, Math.max(0, Number(data.completion) || 0));

	const categories = Array.isArray(data.categories)
		? data.categories
		: data.category
			? [data.category]
			: [];

	return (
		<div className="col-12 col-md-6 col-lg-4">
			<div
				style={{
					backgroundColor: 'var(--card)',
					borderRadius: 'var(--radius-lg)',
					border: '1px solid var(--neutral-border)',
					overflow: 'hidden',
					boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{/* Thumbnail */}
				<div
					style={{
						width: '100%',
						height: '170px',
						backgroundColor: 'var(--neutral-bg)',
						overflow: 'hidden',
					}}
				>
					<img
						src={data.thumbnail}
						alt={data.title}
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
						}}
					/>
				</div>

				<div
					style={{
						padding: '24px',
						display: 'flex',
						flexDirection: 'column',
						flex: 1,
						justifyContent: 'space-between',
					}}
				>
					<div>
						{/* Header */}
						<div className="d-flex justify-content-between align-items-start gap-2 mb-2">
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
									backgroundColor: isPublished
										? 'var(--success-bg)'
										: 'var(--neutral-bg)',
									color: isPublished
										? 'var(--success-text)'
										: 'var(--neutral-text)',
									border: `1px solid ${
										isPublished
											? 'var(--success-border-color)'
											: 'var(--neutral-border)'
									}`,
									padding: '2px 10px',
									borderRadius: 'var(--radius-full)',
									fontSize: 'var(--font-xs)',
									fontWeight: '600',
									whiteSpace: 'nowrap',
								}}
							>
								{data.status}
							</span>
						</div>

						{/* Categories */}
						{categories.length > 0 && (
							<div className="d-flex flex-wrap gap-2 mb-3">
								{categories.map((category, index) => (
									<span
										key={`${category}-${index}`}
										style={{
											display: 'inline-flex',
											alignItems: 'center',
											gap: '5px',
											padding: '4px 9px',
											borderRadius: 'var(--radius-sm)',
											backgroundColor: 'var(--primary-light)',
											color: 'var(--primary)',
											fontSize: 'var(--font-xs)',
											fontWeight: '500',
										}}
									>
										{index === 0 && <Tag size={12} />}
										{category}
									</span>
								))}
							</div>
						)}

						{/* Event */}
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

						{/* Published Information */}
						{isPublished ? (
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
										{completion}%
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
											width: `${completion}%`,
											height: '100%',
											backgroundColor: 'var(--primary)',
											borderRadius: 'var(--radius-full)',
										}}
									/>
								</div>
							</div>
						) : (
							<div
								className="mb-4 p-3"
								style={{
									backgroundColor: 'var(--neutral-bg)',
									borderRadius: 'var(--radius-md)',
								}}
							>
								<div className="d-flex align-items-center gap-2 mb-1">
									<Clock size={16} style={{ color: 'var(--text-muted)' }} />
									<span
										style={{
											color: 'var(--text-muted)',
											fontSize: 'var(--font-xs)',
											fontWeight: '500',
										}}
									>
										Last Updated
									</span>
								</div>

								<span
									style={{
										color: 'var(--text)',
										fontSize: 'var(--font-sm)',
										fontWeight: '600',
									}}
								>
									{data.updatedAt || 'Not available'}
								</span>
							</div>
						)}

						{/* Meta Information */}
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

							{isPublished && (
								<div className="d-flex align-items-center gap-2">
									<Users size={18} />
									<span>{data.enrolled}</span>
								</div>
							)}
						</div>
					</div>

					{/* Manage Button */}
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
						}}
					>
						Manage
					</Link>
				</div>
			</div>
		</div>
	);
};

export default LearningPathCard;
