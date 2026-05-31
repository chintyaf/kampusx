import { useNavigate } from 'react-router-dom';
import { Calendar, Users, ChevronRight, Zap, FileText, Image as ImageIcon } from 'lucide-react';
import { getEventImageUrl } from '@/utils/eventUtils';
import StatusBadge from './StatusBadge';
import { formatDate } from './utils';

export const EventCard = ({ event }) => {
	const navigate = useNavigate();

	const capacity = event.capacity || 200;
	const attendees = event.attendees || 0;
	const fillPercentage = Math.min((attendees / capacity) * 100, 100);

	return (
		<div
			onClick={() => navigate(`/organizer/${event.id}/event-dashboard`)}
			className="org-event-card d-flex gap-4 p-3 border"
		>
			{/* Banner Area (~22%) */}
			<div className="org-event-banner flex-shrink-0 border overflow-hidden rounded-2">
				{event.image_path ? (
					<img
						src={getEventImageUrl(event)}
						alt={event.title}
						className="w-100 h-100 object-fit-cover"
					/>
				) : (
					<div
						className="w-100 h-100 d-flex align-items-center justify-content-center"
						style={{ backgroundColor: 'var(--color-bg)' }}
					>
						<ImageIcon size={24} color="var(--color-secondary)" strokeWidth={1.5} />
					</div>
				)}
			</div>

			{/* Right Content Area */}
			<div className="flex-grow-1 min-w-0 d-flex flex-column justify-content-between py-1">
				<div>
					<div className="d-flex align-items-start justify-content-between gap-3 mb-2">
						<div className="d-flex flex-column gap-1 min-w-0">
							<div className="d-flex align-items-center gap-2 flex-wrap mb-1">
								<span
									className="org-event-title fs-3 fw-bold text-truncate"
									style={{ maxWidth: '600px' }}
								>
									{event.title}
								</span>
								<StatusBadge status={event.status} />
							</div>
							<div className="org-event-meta d-flex align-items-center gap-3 fs-5">
								<span className="d-flex align-items-center gap-2 text-dark">
									<Calendar size={14} /> {formatDate(event.start_date)}
								</span>
								<span className="text-muted">|</span>
								<span className="d-flex align-items-center gap-2 text-dark">
									<Users size={14} /> {attendees.toLocaleString('id-ID')} /{' '}
									{capacity.toLocaleString('id-ID')} Terdaftar
								</span>
							</div>
						</div>
						<button
							onClick={(e) => {
								e.stopPropagation();
								navigate(`/organizer/${event.id}/event-dashboard`);
							}}
							className="org-event-btn d-flex align-items-center gap-2 py-2 px-3 fw-medium flex-shrink-0 border fs-5 rounded"
						>
							Kelola <ChevronRight size={14} />
						</button>
					</div>
					{/* Progress Bar for Capacity */}
					<div className="mt-3" style={{ maxWidth: '300px' }}>
						<div
							className="progress rounded-pill"
							style={{ height: '4px', backgroundColor: 'var(--color-border)' }}
						>
							<div
								className="progress-bar rounded-pill"
								role="progressbar"
								style={{
									width: `${fillPercentage}%`,
									backgroundColor: 'var(--color-text)',
								}}
								aria-valuenow={fillPercentage}
								aria-valuemin="0"
								aria-valuemax="100"
							></div>
						</div>
					</div>

					{/* Attention Badges */}
					<div className="d-flex gap-2 mt-3">
						{event.needsAttention && event.status === 'draft' && (
							<div className="org-attention-badge attention-draft d-inline-flex align-items-center gap-1 py-1 px-2 fw-medium">
								<Zap size={10} />{' '}
								{event.attentionMessage || 'Butuh struktur alur sesi'}
							</div>
						)}
						{event.needsAttention && event.status === 'completed' && (
							<div className="org-attention-badge attention-completed d-inline-flex align-items-center gap-1 py-1 px-2 fw-medium">
								<FileText size={10} />{' '}
								{event.attentionMessage || 'Sertifikat siap didistribusikan'}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default EventCard;
