import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Image as ImageIcon } from 'lucide-react';
import { getEventImageUrl } from '@/utils/eventUtils';
import StatusBadge from './StatusBadge';
import { formatDate } from './utils';

export const HeroCard = ({ heroEvent }) => {
	const navigate = useNavigate();

	if (!heroEvent) return null;

	return (
		<div className="org-hero-card mb-4 border rounded-3 p-4 d-flex gap-4 align-items-center bg-white shadow-sm">
			<div
				className="hero-banner flex-shrink-0 rounded-3 overflow-hidden border"
				style={{ width: '35%', aspectRatio: '16/9' }}
			>
				{heroEvent.image_path ? (
					<img
						src={getEventImageUrl(heroEvent)}
						alt={heroEvent.title}
						className="w-100 h-100 object-fit-cover"
					/>
				) : (
					<div
						className="w-100 h-100 d-flex align-items-center justify-content-center"
						style={{ backgroundColor: 'var(--color-bg)' }}
					>
						<ImageIcon size={32} color="var(--color-secondary)" />
					</div>
				)}
			</div>
			<div className="hero-content flex-grow-1">
				<div className="d-flex align-items-center gap-2 mb-2">
					<StatusBadge status={heroEvent.status} />
					<span className="text-muted fw-medium fs-5">
						{heroEvent.status === 'ongoing'
							? '📍 Sedang Berlangsung'
							: heroEvent.status === 'published'
								? '⏳ Mendatang Terdekat'
								: '✨ Highlight Acara'}
					</span>
				</div>
				<h2 className="fs-1 fw-bold mb-3">{heroEvent.title}</h2>
				<div className="d-flex align-items-center gap-4 mb-4 fs-4 text-muted">
					<span className="d-flex align-items-center gap-2">
						<Calendar size={18} /> {formatDate(heroEvent.start_date)}
					</span>
					<span className="d-flex align-items-center gap-2">
						<Users size={18} />{' '}
						{(heroEvent.attendees || 0).toLocaleString('id-ID')}{' '}
						Terdaftar
					</span>
				</div>
				<div className="d-flex gap-3">
					<button
						onClick={() =>
							navigate(`/organizer/${heroEvent.id}/event-dashboard`)
						}
						className="btn btn-dark px-4 py-2 fw-medium fs-4 rounded-2"
					>
						Kelola Event
					</button>
					<button
						onClick={() =>
							navigate(`/organizer/${heroEvent.id}/event-pos`)
						}
						className="btn btn-outline-dark px-4 py-2 fw-medium fs-4 rounded-2"
					>
						Buka Scanner
					</button>
				</div>
			</div>
		</div>
	);
};

export default HeroCard;
