import React from 'react';
import '../EventDashboardPage.css';
import { Monitor, Share2, MapPin, Calendar, Tag, XCircle } from 'lucide-react';
import { formatDateRange, checkIfDatePassed } from '@/utils/dateUtils';

const STATUS_BADGES = {
	draft: { label: 'Draft', badgeClass: 'status-badge draft' },
	published: { label: 'Published', badgeClass: 'status-badge published' },
	ongoing: { label: 'On Going', badgeClass: 'status-badge ongoing' },
	post_event: { label: 'Post Event', badgeClass: 'status-badge completed' },
	completed: { label: 'Completed', badgeClass: 'status-badge completed' },
	cancelled: { label: 'Cancelled', badgeClass: 'status-badge cancelled' },
};

export default function PageHeader({
	title = 'Untitled Event',
	status,
	startDate,
	endDate,
	location,
	categories = [],
	isPublishDisabled = false,
	canCancel = false,
	cancelMessage = '',
	onCancel,
	onPreview,
	onPublish,
	onShare,
}) {
	const isPassed = checkIfDatePassed(endDate);
	const isDraft = status === 'draft';
	const badgeConfig = STATUS_BADGES[status] || STATUS_BADGES.draft;
	const formattedDateRange = formatDateRange(startDate, endDate);

	const metadataItems = [
		{
			show: Boolean(location),
			Icon: MapPin,
			text: location || 'Lokasi belum ditentukan',
		},
		{
			show: Boolean(formattedDateRange),
			Icon: Calendar,
			text: formattedDateRange || 'Tanggal belum ditentukan',
		},
		{
			show: categories && categories.length > 0,
			Icon: Tag,
			text: categories.join(', ') || 'Kategori belum ditentukan',
		},
	].filter((item) => item.show);

	return (
		<div className="d-flex justify-content-between align-items-start flex-wrap gap-4 mb-4 pb-3">
			{/* Left Column: Badges, Title, Visibility, Date */}
			<div className="d-flex flex-column gap-1 flex-grow-1" style={{ minWidth: '280px' }}>
				{/* Top Badges */}
				<div className="d-flex align-items-center gap-2">
					{status && <span className={badgeConfig.badgeClass}>{badgeConfig.label}</span>}
					{isPassed && <span className="status-badge passed">Event passed</span>}
				</div>

				{/* Title */}
				<h1
					className="fw-bold text-dark m-0 mt-2"
					style={{ fontSize: '20px', letterSpacing: '-0.8px', lineHeight: '1.2' }}
				>
					{title}
				</h1>

				{/* Metadata Ringkas */}
				<div
					className="d-flex align-items-center flex-wrap gap-3 text-secondary mt-2 small"
					style={{ fontSize: '13px', color: '#64748B' }}
				>
					{metadataItems.map((item, index) => (
						<React.Fragment key={index}>
							<span className="d-inline-flex align-items-center gap-2">
								<item.Icon size={13} className="text-secondary" />
								{item.text}
							</span>
							{/* Otomatis merender separator '|' jika bukan item terakhir */}
							{index < metadataItems.length - 1 && (
								<span className="text-muted opacity-50">|</span>
							)}
						</React.Fragment>
					))}
				</div>
			</div>

			{/* Right Column: Actions */}
			<div className="d-flex align-items-center gap-2 mt-3 mt-md-0 align-self-md-end mb-1">
				{onPreview && (
					<button
						onClick={onPreview}
						className="btn btn-minimal btn-minimal-outline d-inline-flex align-items-center gap-1.5 fw-semibold"
					>
						<Monitor size={15} strokeWidth={2} />
						Preview
					</button>
				)}

				{isDraft && onPublish && (
					<button
						onClick={onPublish}
						disabled={isPublishDisabled}
						className="btn btn-minimal btn-minimal-primary d-inline-flex align-items-center px-4 fw-semibold shadow-sm"
					>
						Publish
					</button>
				)}

				{onShare && (
					<button
						onClick={onShare}
						className="btn btn-minimal btn-minimal-outline d-inline-flex align-items-center justify-content-center"
						title="Share Event"
					>
						<Share2 size={15} strokeWidth={2} />
						Share Event
					</button>
				)}

				{onCancel && ['published', 'ongoing'].includes(status) && (
					!canCancel ? (
						<span title={cancelMessage} style={{ cursor: 'not-allowed' }}>
							<button
								disabled
								className="btn btn-minimal btn-minimal-danger d-inline-flex align-items-center gap-1.5 fw-semibold"
							>
								<XCircle size={15} strokeWidth={2} />
								Batalkan Event
							</button>
						</span>
					) : (
						<button
							onClick={onCancel}
							className="btn btn-minimal btn-minimal-danger d-inline-flex align-items-center gap-1.5 fw-semibold"
						>
							<XCircle size={15} strokeWidth={2} />
							Batalkan Event
						</button>
					)
				)}
			</div>
		</div>
	);
}
