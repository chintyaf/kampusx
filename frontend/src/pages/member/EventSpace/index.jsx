import React from 'react';
import {
	Container,
	Row,
	Col,
	Card,
	Button,
	Spinner,
	Alert,
} from 'react-bootstrap';
import {
	ArrowLeft,
	QrCode,
	ShieldAlert,
	Video,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ParticipantMaterialsTab from '../../../components/event/ParticipantMaterialsTab';
import EventAnnouncementsTab from '../../../components/event/EventAnnouncementsTab';

// Sub-components import
import TicketModal from './TicketModal';
import RedeemWarningModal from './RedeemWarningModal';
import OverviewTab from './OverviewTab';
import DiscussionTab from './DiscussionTab';
import CertificateTab from './CertificateTab';
import RewardsTab from './RewardsTab';
import SidebarNav from './SidebarNav';
import { useEventSpace } from './useEventSpace';

const EventSpace = () => {
	const navigate = useNavigate();
	const {
		id,
		activeTab,
		setActiveTab,
		showTicketModal,
		setShowTicketModal,
		isLoading,
		apiError,
		isAccessDenied,
		event,
		alreadySubmitted,
		ticketCode,
		qrToken,
		participantName,
		announcements,
		memberPoints,
		localRewardsCatalog,
		myRedemptions,
		showRedeemWarningModal,
		setShowRedeemWarningModal,
		pendingRedeemReward,
		handleRedeemReward,
		executeRedemption,
		getFullAttachmentUrl,
		formatTimeAgo,
		ticketStatus,
		certificateTemplate,
		customSurvey,
		isPreviewOnly,
	} = useEventSpace();

	if (isLoading) {
		return (
			<div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
				<Spinner
					animation="border"
					variant="primary"
					style={{ width: '3rem', height: '3rem' }}
				/>
				<p className="text-muted mt-3 fw-medium">Memuat Dashboard Event Space...</p>
			</div>
		);
	}

	if (isAccessDenied) {
		return (
			<div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light p-4">
				<Card
					className="border-0 shadow-lg rounded-4 text-center p-5 bg-white"
					style={{ maxWidth: '480px' }}
				>
					<Card.Body className="d-flex flex-column align-items-center">
						<div className="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex p-4 mb-4 border border-danger border-opacity-25 shadow-sm">
							<ShieldAlert size={48} className="animate-pulse" />
						</div>
						<h4 className="fw-bold text-dark mb-2">Akses Ditolak</h4>
						<p
							className="text-secondary small mb-4 px-2"
							style={{ fontSize: '14px', lineHeight: '1.6' }}
						>
							Akses Ditolak: Anda belum terdaftar di event ini
						</p>
						<Button
							variant="primary"
							onClick={() => navigate('/explore-events')}
							className="w-100 rounded-pill py-2.5 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
						>
							Kembali ke Eksplor Event
						</Button>
					</Card.Body>
				</Card>
			</div>
		);
	}

	const title = event?.title || 'Workshop & Kelas Pembelajaran Unggulan';
	const organizer = event?.organizer?.name || event?.institution?.name || 'Penyelenggara KampusX';

	const locationDetail = event?.location_detail || event?.locationDetail || {};
	const locationType = locationDetail?.type || event?.location_type || 'offline';
	const meetingLink = locationDetail?.meeting_link || event?.meeting_link;

	const canClaimCertificate = !!isPreviewOnly || (
		ticketStatus === 'used' &&
		(event?.status === 'completed' || event?.status === 'post_event') &&
		!!certificateTemplate &&
		!!customSurvey
	);

	const renderContent = () => {
		switch (activeTab) {
			case 'overview':
				return (
					<OverviewTab
						event={event}
						alreadySubmitted={alreadySubmitted}
						announcements={announcements}
						setActiveTab={setActiveTab}
						getFullAttachmentUrl={getFullAttachmentUrl}
						formatTimeAgo={formatTimeAgo}
						canClaimCertificate={canClaimCertificate}
					/>
				);
			case 'materi':
				return (
					<div className="fade-in">
						<div className="d-flex justify-content-between align-items-center mb-4">
							<h4 className="fw-bold mb-0">Materi Pembelajaran</h4>
							<span className="text-muted small">100% Selesai</span>
						</div>
					</div>
				);
			case 'diskusi':
				return <DiscussionTab />;
			case 'pengumuman':
				return (
					<div className="fade-in">
						<EventAnnouncementsTab eventId={id} />
					</div>
				);
			case 'sertifikat':
				return canClaimCertificate ? (
					<CertificateTab
						id={id}
						alreadySubmitted={alreadySubmitted}
						participantName={participantName}
					/>
				) : null;
			case 'rewards':
				return (
					<RewardsTab
						event={event}
						memberPoints={memberPoints}
						localRewardsCatalog={localRewardsCatalog}
						myRedemptions={myRedemptions}
						handleRedeemReward={handleRedeemReward}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="bg-light min-vh-100 pb-5">
			{/* HEADER MICRO LMS */}
			<div className="bg-white border-bottom shadow-sm sticky-top" style={{ zIndex: 1020 }}>
				<Container className="py-2 py-md-3">
					<div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 gap-md-0">
						<div className="d-flex align-items-center gap-2 gap-sm-3 w-100 w-md-auto">
							<Button
								variant="light"
								className="rounded-circle p-2 d-flex border"
								onClick={() => navigate(-1)}
							>
								<ArrowLeft size={20} className="text-dark" />
							</Button>
							<div className="overflow-hidden">
								<h5
									className="fw-bold mb-0 text-truncate fs-md-4"
									style={{
										maxWidth: '100%',
										color: 'var(--color-primary, #1A365D)',
									}}
									title={title}
								>
									{title}
								</h5>
								<span className="text-muted small text-truncate d-block">Penyelenggara: {organizer}</span>
							</div>
						</div>

						{/* TOMBOL CEPAT QR CODE DI HEADER & JOIN MEETING */}
						<div className="d-flex gap-2 w-100 w-md-auto justify-content-start justify-content-md-end">
							{(locationType === 'online' || locationType === 'hybrid') && meetingLink && (
								<Button
									variant="success"
									className="rounded-pill px-3 px-md-4 py-2 d-flex align-items-center shadow-sm fw-medium gap-1.5 text-nowrap"
									href={meetingLink}
									target="_blank"
									rel="noopener noreferrer"
									style={{ fontSize: '13px' }}
								>
									<Video size={16} /> <span>Join<span className="d-none d-sm-inline"> Meeting</span></span>
								</Button>
							)}
							<Button
								variant="dark"
								className="rounded-pill px-3 px-md-4 py-2 d-flex align-items-center shadow-sm fw-medium text-nowrap"
								onClick={() => setShowTicketModal(true)}
								style={{ fontSize: '13px' }}
							>
								<QrCode size={16} className="me-1.5" /> <span><span className="d-none d-sm-inline">E-Tiket </span>QR</span>
							</Button>
						</div>
					</div>
				</Container>
			</div>

			<Container className="mt-4">
				{apiError && (
					<Alert variant="warning" className="rounded-4 border-0 shadow-sm mb-4">
						{apiError}
					</Alert>
				)}

				<Row className="g-4">
					{/* NAVIGASI (SIDEBAR / HORIZONTAL SCROLL) */}
					<Col lg={3} md={4} xs={12}>
						<SidebarNav
							activeTab={activeTab}
							setActiveTab={setActiveTab}
							memberPoints={memberPoints}
							alreadySubmitted={alreadySubmitted}
							canClaimCertificate={canClaimCertificate}
						/>
					</Col>

					{/* MAIN CONTENT AREA */}
					<Col lg={9} md={8} xs={12}>
						{activeTab === 'materi' ? (
							<div className="fade-in">
								<ParticipantMaterialsTab eventId={id} />
							</div>
						) : (
							<Card
								className="border-0 shadow-sm rounded-4"
								style={{ minHeight: '450px' }}
							>
								<Card.Body className="p-3 p-md-5">{renderContent()}</Card.Body>
							</Card>
						)}
					</Col>
				</Row>
			</Container>

			{/* MODAL POP-UP QR TIKET */}
			<TicketModal
				show={showTicketModal}
				onHide={() => setShowTicketModal(false)}
				ticketCode={ticketCode}
				qrToken={qrToken}
			/>

			{/* WARNING MODAL: ONLINE EVENT + PHYSICAL REWARD */}
			<RedeemWarningModal
				show={showRedeemWarningModal}
				onHide={() => setShowRedeemWarningModal(false)}
				pendingRedeemReward={pendingRedeemReward}
				executeRedemption={executeRedemption}
			/>
		</div>
	);
};

export default EventSpace;

