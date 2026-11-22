import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CalendarDays, BookOpen, ChevronRight } from 'lucide-react';

const getInitials = (name = '') =>
	name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0].toUpperCase())
		.join('') || '?';

const StatItem = ({ icon: Icon, value, label }) => (
	<div
		className="flex-fill text-center rounded-3 py-2 px-1"
		style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
	>
		<Icon size={16} style={{ color: '#028090' }} />
		<div className="fw-bold text-dark" style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>
			{value}
		</div>
		<div className="text-muted" style={{ fontSize: '0.7rem' }}>
			{label}
		</div>
	</div>
);

const OrganizerCard = ({ instructor }) => {
	const [imageFailed, setImageFailed] = useState(false);

	if (!instructor) return null;

	const {
		id,
		name,
		avatar_url: avatarUrl,
		organization_name: organizationName,
		events_count: eventsCount = 0,
		learning_paths_count: pathsCount = 0,
		joined_at: joinedAt,
	} = instructor;

	const showImage = avatarUrl && !imageFailed;
	const joinedYear = joinedAt ? new Date(joinedAt).getFullYear() : null;

	return (
		<Card
			className="border shadow-sm rounded-3 p-4 mb-4 bg-white"
			style={{ borderColor: '#E2E8F0', borderRadius: '16px' }}
		>
			<div
				className="fw-bold text-muted small text-uppercase mb-3"
				style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}
			>
				Course Instructor
			</div>

			{/* Identitas (klik menuju profil) */}
			<Link
				to={`/profile/${id}`}
				className="d-flex align-items-center gap-3 mb-3 text-decoration-none"
			>
				{showImage ? (
					<img
						src={avatarUrl}
						alt={name}
						className="rounded-circle border flex-shrink-0"
						style={{ width: '56px', height: '56px', objectFit: 'cover' }}
						onError={() => setImageFailed(true)}
					/>
				) : (
					<div
						className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
						style={{ width: '56px', height: '56px', backgroundColor: '#134074' }}
						aria-hidden="true"
					>
						{getInitials(name)}
					</div>
				)}

				<div className="min-w-0">
					<h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem' }}>
						{name}
					</h6>
					{organizationName && <div className="text-muted small">{organizationName}</div>}
					{joinedYear && (
						<div className="text-muted" style={{ fontSize: '0.75rem' }}>
							Bergabung sejak {joinedYear}
						</div>
					)}
				</div>
			</Link>

			{/* Statistik */}
			<div className="d-flex gap-2 mb-3">
				<StatItem icon={CalendarDays} value={eventsCount} label="Event" />
				<StatItem icon={BookOpen} value={pathsCount} label="Learning Path" />
			</div>

			{/* CTA ke profil */}
			<Link
				to={`/profile/${id}`}
				className="d-inline-flex align-items-center justify-content-center gap-1 fw-semibold text-decoration-none small"
				style={{ color: '#028090' }}
			>
				Lihat profil
				<ChevronRight size={14} />
			</Link>
		</Card>
	);
};

export default OrganizerCard;
