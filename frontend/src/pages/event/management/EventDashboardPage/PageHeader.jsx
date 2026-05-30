import React, { useState, useRef, useEffect } from 'react';
import './EventDashboardPage.css';
import {
	Lock,
	Monitor,
	Share2,
	MoreVertical,
	Pencil,
	Ticket,
	ScanLine,
	FileText,
	Upload,
	MapPin,
	Calendar,
	Tag,
	Copy,
} from 'lucide-react';
import { formatEventDate, formatDateRange, checkIfDatePassed } from '@/utils/dateUtils';
import { notify } from '@/utils/notify';

const STATUS_BADGES = {
	draft: {
		label: 'Draft',
		badgeClass: 'status-badge draft',
	},
	published: {
		label: 'Published',
		badgeClass: 'status-badge published',
	},
	ongoing: {
		label: 'On Going',
		badgeClass: 'status-badge ongoing',
	},
	post_event: {
		label: 'Post Event',
		badgeClass: 'status-badge completed',
	},
	completed: {
		label: 'Completed',
		badgeClass: 'status-badge completed',
	},
	cancelled: {
		label: 'Cancelled',
		badgeClass: 'status-badge cancelled',
	},
};

export default function PageHeader({
	title = 'Event Dashboard',
	status,
	startDate,
	endDate,
	location,
	categories = [],
	isPublishDisabled = false,
	posPin,
	onPreview,
	onPublish,
	onShare,
	onEdit,
	onKelolaTiket,
	onScanner,
	onFormulir,
}) {
	const [showMoreMenu, setShowMoreMenu] = useState(false);
	const menuRef = useRef(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setShowMoreMenu(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleCopyStaffLink = (e) => {
		e.preventDefault();
		const shareText = `Portal Login Staff: ${window.location.origin}/staff/login\nPIN Scanner Anda: ${posPin}`;
		navigator.clipboard.writeText(shareText)
			.then(() => {
				notify('success', 'Berhasil Disalin', 'Tautan login staff dan PIN berhasil disalin ke clipboard!');
			})
			.catch(() => {
				notify('error', 'Gagal', 'Gagal menyalin tautan staff.');
			});
	};

	const isPassed = checkIfDatePassed(endDate);
	const badgeConfig = STATUS_BADGES[status] || STATUS_BADGES.draft;
	console.log('Event Status:', status, 'Badge Config:', badgeConfig);
	const formattedDate = formatEventDate(startDate);
	const formattedDateRange = formatDateRange(startDate, endDate);

	const isDraft = status === 'draft';

	return (
		<div className="d-flex justify-content-between align-items-start flex-wrap gap-4 mb-4 pb-3">
			{/* Left Column: Badges, Title, Visibility, Date */}
			<div className="d-flex flex-column gap-1 flex-grow-1" style={{ minWidth: '280px' }}>
				{/* Top Badges */}
				<div className="d-flex align-items-center gap-2">
					{status && <span className={badgeConfig.badgeClass}>{badgeConfig.label}</span>}
					{isPassed && <span className="status-badge passed">Event passed</span>}
					{(status === 'ongoing' || status === 'published') && posPin && (
						<button 
							onClick={handleCopyStaffLink}
							className="status-badge d-inline-flex align-items-center gap-1 border-0 text-decoration-none" 
							style={{ 
								backgroundColor: '#e0f2fe', 
								color: '#0369a1', 
								border: '1px solid #bae6fd', 
								fontWeight: '600', 
								padding: '4px 8px', 
								borderRadius: '6px', 
								fontSize: '11px',
								cursor: 'pointer',
								transition: 'all 0.15s ease-in-out',
							}}
							onMouseOver={(e) => {
								e.currentTarget.style.backgroundColor = '#bae6fd';
								e.currentTarget.style.color = '#0284c7';
							}}
							onMouseOut={(e) => {
								e.currentTarget.style.backgroundColor = '#e0f2fe';
								e.currentTarget.style.color = '#0369a1';
							}}
							title="Klik untuk menyalin Link Login Staff & PIN"
						>
							<Lock size={12} className="me-1" />
							PIN Scanner: {posPin}
							<Copy size={11} className="ms-1" style={{ opacity: 0.8 }} />
						</button>
					)}
				</div>

				{/* Title */}
				<h1
					className="fw-bold text-dark m-0 mt-2"
					style={{ fontSize: '20px', letterSpacing: '-0.8px', lineHeight: '1.2' }}
				>
					{title}
				</h1>

				{/* Metadata Ringkas (Untuk Fase Draft) */}
				<div
					className="d-flex align-items-center flex-wrap gap-3 text-secondary mt-2 small"
					style={{ fontSize: '13px', color: '#64748B' }}
				>
					{location && (
						<span className="d-inline-flex align-items-center gap-2">
							<MapPin size={13} className="text-secondary" />
							{location}
						</span>
					)}
					{location && formattedDateRange && (
						<span className="text-muted opacity-50">|</span>
					)}
					{formattedDateRange && (
						<span className="d-inline-flex align-items-center gap-2">
							<Calendar size={13} className="text-secondary" />
							{formattedDateRange}
						</span>
					)}
					{formattedDateRange && categories && categories.length > 0 && (
						<span className="text-muted opacity-50">|</span>
					)}
					{categories && categories.length > 0 && (
						<span className="d-inline-flex align-items-center gap-2">
							<Tag size={13} className="text-secondary" />
							{categories.join(', ')}
						</span>
					)}
				</div>


			</div>

			{/* Right Column: Actions (Preview, Publish, Share, More) */}
			<div className="d-flex align-items-center gap-2 mt-3 mt-md-0 align-self-md-end mb-1">
				{/* Preview Button */}
				{onPreview && (
					<button
						onClick={onPreview}
						className="btn btn-minimal btn-minimal-outline d-inline-flex align-items-center gap-1.5 fw-semibold"
					>
						<Monitor size={15} strokeWidth={2} />
						Preview
					</button>
				)}

				{/* Publish Button - Styled using standard Bootstrap 'btn-primary' */}
				{isDraft && onPublish && (
					<button
						onClick={onPublish}
						disabled={isPublishDisabled}
						className="btn btn-minimal btn-minimal-primary d-inline-flex align-items-center px-4 fw-semibold shadow-sm"
					>
						Publish
					</button>
				)}

				{/* Share Button */}
				{onShare && (
					<button
						onClick={onShare}
						className="btn btn-minimal btn-minimal-outline d-inline-flex align-items-center justify-content-center"
						style={{ width: '38px', height: '38px' }}
						title="Share Event"
					>
						<Share2 size={15} strokeWidth={2} />
					</button>
				)}

				{/* More Options Button (Three Dots) with Dropdown */}
				<div className="position-relative" ref={menuRef}>
					<button
						onClick={() => setShowMoreMenu(!showMoreMenu)}
						className="btn btn-minimal btn-minimal-outline d-inline-flex align-items-center justify-content-center"
						style={{ width: '38px', height: '38px' }}
						title="More Options"
					>
						<MoreVertical size={15} strokeWidth={2} />
					</button>

					{/* Sleek Floating Dropdown Menu */}
					{showMoreMenu && (
						<div
							className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow p-1"
							style={{
								zIndex: 1000,
								minWidth: '180px',
								animation: 'fadeSlideIn 0.15s ease-out',
							}}
						>
							<style>{`
								@keyframes fadeSlideIn {
									from { opacity: 0; transform: translateY(-5px); }
									to { opacity: 1; transform: translateY(0); }
								}
							`}</style>
							{onEdit && (
								<button
									onClick={() => {
										onEdit();
										setShowMoreMenu(false);
									}}
									className="dropdown-item d-flex align-items-center gap-2 rounded-2 py-2 px-3 text-secondary"
								>
									<Pencil size={14} strokeWidth={2} />
									Edit Detail Event
								</button>
							)}
							{onKelolaTiket && (
								<button
									onClick={() => {
										onKelolaTiket();
										setShowMoreMenu(false);
									}}
									className="dropdown-item d-flex align-items-center gap-2 rounded-2 py-2 px-3 text-secondary"
								>
									<Ticket size={14} strokeWidth={2} />
									Kelola Tiket
								</button>
							)}
							{onScanner && (
								<button
									onClick={() => {
										onScanner();
										setShowMoreMenu(false);
									}}
									className="dropdown-item d-flex align-items-center gap-2 rounded-2 py-2 px-3 text-secondary"
								>
									<ScanLine size={14} strokeWidth={2} />
									Scanner Absensi
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
