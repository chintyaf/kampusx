import React from 'react';
import {
	Container,
	Row,
	Col,
	Card,
	Button,
	Nav,
	Badge,
	Spinner,
	Alert,
} from 'react-bootstrap';
import {
	ArrowLeft,
	Layout,
	BookOpen,
	MessageCircle,
	QrCode,
	Award,
	Gift,
	Megaphone,
	ShieldAlert,
	Video,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ParticipantMaterialsTab from '../../../components/event/ParticipantMaterialsTab';
import EventAnnouncementsTab from '../../../components/event/EventAnnouncementsTab';

// Sub-components import
import TicketModal from './TicketModal';
import RedeemWarningModal from './RedeemWarningModal';
import OverviewTab from './OverviewTab';
import DiscussionTab from './DiscussionTab';
import CertificateTab from './CertificateTab';
import RewardsTab from './RewardsTab';
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
				return (
					<CertificateTab
						id={id}
						alreadySubmitted={alreadySubmitted}
						participantName={participantName}
					/>
				);
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
				<Container className="py-3">
					<div className="d-flex align-items-center justify-content-between">
						<div className="d-flex align-items-center gap-3">
							<Button
								variant="light"
								className="rounded-circle p-2 d-flex border"
								onClick={() => navigate(-1)}
							>
								<ArrowLeft size={20} className="text-dark" />
							</Button>
							<div>
								<h5
									className="fw-bold mb-0 text-truncate"
									style={{
										maxWidth: '600px',
										color: 'var(--color-primary, #1A365D)',
									}}
								>
									{title}
								</h5>
								<span className="text-muted small">Penyelenggara: {organizer}</span>
							</div>
						</div>

						{/* TOMBOL CEPAT QR CODE DI HEADER & JOIN MEETING */}
						<div className="d-flex gap-2">
							{(locationType === 'online' || locationType === 'hybrid') && meetingLink && (
								<Button 
									variant="success" 
									className="rounded-pill px-4 py-2 d-flex align-items-center shadow-sm fw-medium gap-1.5"
									href={meetingLink}
									target="_blank"
									rel="noopener noreferrer"
								>
									<Video size={18} /> Join Meeting
								</Button>
							)}
							<Button
								variant="dark"
								className="rounded-pill px-4 py-2 d-flex align-items-center shadow-sm fw-medium"
								onClick={() => setShowTicketModal(true)}
							>
								<QrCode size={18} className="me-2" /> E-Tiket QR
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
					{/* SIDEBAR NAVIGASI */}
					<Col lg={3} md={4}>
						<Card
							className="border-0 shadow-sm rounded-4 position-sticky"
							style={{ top: '100px' }}
						>
							<Card.Body className="p-3">
								<Nav className="flex-column gap-2 custom-pills">
									<Nav.Link
										className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'overview' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
										onClick={() => setActiveTab('overview')}
									>
										<Layout size={18} className="me-3" /> Overview
									</Nav.Link>
									<Nav.Link
										className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'materi' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
										onClick={() => setActiveTab('materi')}
									>
										<BookOpen size={18} className="me-3" /> Materi Pembelajaran
									</Nav.Link>
									<Nav.Link
										className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'diskusi' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
										onClick={() => setActiveTab('diskusi')}
									>
										<MessageCircle size={18} className="me-3" /> Forum Diskusi
									</Nav.Link>
									<Nav.Link
										className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'pengumuman' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
										onClick={() => setActiveTab('pengumuman')}
									>
										<Megaphone size={18} className="me-3" /> Pengumuman Event
									</Nav.Link>
									<Nav.Link
										className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'rewards' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
										onClick={() => setActiveTab('rewards')}
										style={{ transition: 'background-color 0.2s' }}
									>
										<Gift size={18} className="me-3" style={{ color: activeTab === 'rewards' ? '#fff' : '#0d9488' }} /> 
										Tukar Local Reward
										<Badge bg={activeTab === 'rewards' ? 'light' : 'primary-subtle'} className={`${activeTab === 'rewards' ? 'text-dark' : 'text-primary'} ms-auto rounded-pill border small font-bold px-2 py-1`}>
											{memberPoints || 0} Pts
										</Badge>
									</Nav.Link>

									<hr className="my-2.5 opacity-25" />

									{/* MENU SERTIFIKAT & ULASAN DI SIDEBAR */}
									<Nav.Link
										className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'sertifikat' ? 'bg-success text-white shadow-sm' : 'text-success hover-bg-success-subtle'}`}
										onClick={() => setActiveTab('sertifikat')}
										style={{ transition: 'all 0.2s ease' }}
									>
										<Award size={18} className="me-3" /> Sertifikat & Ulasan
										{alreadySubmitted ? (
											<Badge
												bg="success-subtle"
												text="success"
												className="ms-auto rounded-pill border border-success border-opacity-10 small"
											>
												Aktif
											</Badge>
										) : (
											<Badge
												bg="warning-subtle"
												text="warning"
												className="ms-auto rounded-pill border border-warning border-opacity-10 small"
											>
												Klaim
											</Badge>
										)}
									</Nav.Link>
								</Nav>
							</Card.Body>
						</Card>
					</Col>

					{/* MAIN CONTENT AREA */}
					<Col lg={9} md={8}>
						{activeTab === 'materi' ? (
							<div className="fade-in">
								<ParticipantMaterialsTab eventId={id} />
							</div>
						) : (
							<Card
								className="border-0 shadow-sm rounded-4"
								style={{ minHeight: '450px' }}
							>
								<Card.Body className="p-4 p-md-5">{renderContent()}</Card.Body>
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
