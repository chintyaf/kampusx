import { Link } from 'react-router-dom';
import { Calendar, Users, ChevronRight, Zap, FileText, Image as ImageIcon, Globe, MapPin, Layers, Video, Wallet } from 'lucide-react';
import { getEventImageUrl } from '@/utils/eventUtils';
import StatusBadge from './StatusBadge';
import { formatDate } from './utils';

export const EventCard = ({ event }) => {
	const capacity = event.capacity || 200;
	const attendees = event.attendees || 0;
	const fillPercentage = Math.min((attendees / capacity) * 100, 100);

	const eventLocation = event.location_detail || event.locationDetail;
	const sessionsCount = event.sessions?.length || 0;
	const revenue = event.revenue || 0;

	// format price/revenue helper
	const formatRevenue = (val) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
		}).format(val);
	};

	const renderFormatPill = (type) => {
		if (type === 'online') {
			return (
				<span className="org-format-pill format-online">
					<Globe size={10} /> Online
				</span>
			);
		}
		if (type === 'offline') {
			return (
				<span className="org-format-pill format-offline">
					<MapPin size={10} /> Offline
				</span>
			);
		}
		if (type === 'hybrid') {
			return (
				<span className="org-format-pill format-hybrid">
					<Layers size={10} /> Hybrid
				</span>
			);
		}
		return null;
	};

	const getLocationText = () => {
		if (!eventLocation) return '';
		if (eventLocation.type === 'online') {
			return eventLocation.platform || 'Online Platform';
		}
		if (eventLocation.type === 'offline') {
			return eventLocation.location_name || eventLocation.city || 'Offline Venue';
		}
		if (eventLocation.type === 'hybrid') {
			const platform = eventLocation.platform || 'Online';
			const venue = eventLocation.location_name || eventLocation.city || 'Offline';
			return `${platform} & ${venue}`;
		}
		return '';
	};

	const locationText = getLocationText();

	return (
		<Link
			to={`/organizer/${event.id}/event-dashboard`}
			className={`org-event-card d-flex gap-4 p-3 border ${event.status === 'cancelled' ? 'event-cancelled' : ''}`}
			style={{ textDecoration: 'none', color: 'inherit' }}
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
						style={{ backgroundColor: 'var(--color-bg-2)', border: '1px dashed var(--color-border)' }}
					>
						<ImageIcon size={20} className="text-secondary opacity-60" strokeWidth={1.5} />
					</div>
				)}
			</div>

			{/* Right Content Area */}
			<div className="flex-grow-1 min-w-0 d-flex justify-content-between py-1">
				{/* 1. Left/Center Details Column */}
				<div className="org-card-content">
					<div className="d-flex flex-column gap-1">
						{/* Title & Badges */}
						<div className="d-flex align-items-center gap-2 flex-wrap mb-1">
							<span
								className="org-event-title fs-3 fw-bold text-truncate"
								style={{ maxWidth: '450px' }}
							>
								{event.title}
							</span>
							<StatusBadge status={event.status} />
							{renderFormatPill(eventLocation?.type)}
						</div>

						{/* Logistics details */}
						<div className="org-event-meta d-flex align-items-center gap-3 fs-5 flex-wrap">
							<span className="d-flex align-items-center gap-1 text-dark">
								<Calendar size={13} className="text-secondary" /> {formatDate(event.start_date)}
							</span>
							{sessionsCount > 0 && (
								<>
									<span className="text-muted opacity-50">|</span>
									<span className="d-flex align-items-center gap-1 text-dark">
										<Layers size={13} className="text-secondary" /> {sessionsCount} Sesi
									</span>
								</>
							)}
							{locationText && (
								<>
									<span className="text-muted opacity-50">|</span>
									<span className="d-flex align-items-center gap-1 text-truncate text-dark" style={{ maxWidth: '250px' }} title={locationText}>
										{eventLocation?.type === 'online' ? (
											<Video size={13} className="text-secondary" />
										) : (
											<MapPin size={13} className="text-secondary" />
										)}
										<span className="text-truncate ms-1">{locationText}</span>
									</span>
								</>
							)}
						</div>

						{/* Registration & Revenue Metrics */}
						<div className="d-flex align-items-center gap-3 fs-5 flex-wrap text-dark mt-1">
							<span className="d-flex align-items-center gap-1">
								<Users size={13} className="text-secondary" />
								<span>{attendees.toLocaleString('id-ID')} / {capacity.toLocaleString('id-ID')} Terdaftar ({fillPercentage.toFixed(0)}%)</span>
							</span>
							<span className="text-muted opacity-50">|</span>
							<span className="d-flex align-items-center gap-1">
								<Wallet size={13} className="text-secondary" />
								<span>Pendapatan: <strong className="text-success">{revenue > 0 ? formatRevenue(revenue) : 'Gratis'}</strong></span>
							</span>
						</div>

						{/* Mini progress bar */}
						<div
							className="progress rounded-pill mt-1"
							style={{ height: '3px', width: '200px', backgroundColor: 'var(--color-border)' }}
						>
							<div
								className="progress-bar rounded-pill"
								role="progressbar"
								style={{
									width: `${fillPercentage}%`,
									background: 'linear-gradient(90deg, var(--bahama-blue-500) 0%, var(--bahama-blue-700) 100%)',
								}}
								aria-valuenow={fillPercentage}
								aria-valuemin="0"
								aria-valuemax="100"
							></div>
						</div>
					</div>

					{/* Attention Badges */}
					<div className="d-flex gap-2 mt-auto pt-1">
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

				{/* 2. Action Button Column */}
				<div className="org-card-action">
					<div
						className="org-event-btn d-flex align-items-center gap-2 py-2 px-3 fw-medium border fs-5 rounded"
					>
						Kelola <ChevronRight size={14} />
					</div>
				</div>
			</div>
		</Link>
	);
};

export default EventCard;
