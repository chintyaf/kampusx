import React from 'react';
import { Row, Col, Card, Badge, Alert, Button, Accordion } from 'react-bootstrap';
import {
	Users,
	Wifi,
	Calendar,
	Clock,
	MapPin,
	Award,
	Sparkles,
	CheckCircle,
	Download,
	Bell,
	Paperclip,
} from 'lucide-react';
import { STORAGE_URL } from '../../../api/storage';

const OverviewTab = ({
	event,
	alreadySubmitted,
	announcements,
	setActiveTab,
	getFullAttachmentUrl,
	formatTimeAgo,
	canClaimCertificate,
}) => {
	// Helper to format event date range (e.g. "Kamis, 11 Juni 2026" or "11 - 13 Juni 2026")
	const formatEventDate = () => {
		if (!event?.start_date) return 'Tanggal Acara';
		try {
			const start = new Date(event.start_date);
			const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
			const startFormatted = start.toLocaleDateString('id-ID', options);

			if (event.end_date) {
				const end = new Date(event.end_date);
				if (start.toDateString() === end.toDateString()) {
					return startFormatted;
				} else {
					const startDay = start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
					const endDay = end.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
					return `${startDay} - ${endDay}`;
				}
			}
			return startFormatted;
		} catch (e) {
			return 'Tanggal Acara';
		}
	};

	// Helper to format event time (e.g. "18:00 - 21:00 WIB")
	const formatEventTime = () => {
		if (!event?.start_date) return '09:00 - Selesai';
		try {
			const start = new Date(event.start_date);
			const startStr = start.toLocaleTimeString('id-ID', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false,
			}).replace('.', ':');

			let endStr = 'Selesai';
			if (event.end_date) {
				const end = new Date(event.end_date);
				endStr = end.toLocaleTimeString('id-ID', {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false,
				}).replace('.', ':');
			}

			return `${startStr} - ${endStr} ${event.timezone || 'WIB'}`;
		} catch (e) {
			return '09:00 - Selesai';
		}
	};

	// Helper to format event location (e.g. "Online (Zoom)" or "Aula Utama, Jakarta")
	const formatEventLocation = () => {
		const loc = event?.location_detail || event?.locationDetail;
		if (!loc) return 'Venue Acara';

		if (loc.type === 'online') {
			return `Online (${loc.platform || 'Platform'})`;
		} else if (loc.type === 'offline') {
			return [loc.location_name, loc.city].filter(Boolean).join(', ') || 'Venue Acara';
		} else if (loc.type === 'hybrid') {
			const offlinePart = [loc.location_name, loc.city].filter(Boolean).join(', ');
			return `${offlinePart || 'Venue Acara'} & Online (${loc.platform || 'Platform'})`;
		}
		return 'Venue Acara';
	};

	return (
		<div className="fade-in">
			{/* 1. PHOTO BANNER EVENT */}
			<div
				className="mb-4 overflow-hidden rounded-4 shadow-sm border position-relative"
				style={{ height: 'clamp(180px, 30vw, 320px)' }}
			>
				<img
					src={
						event?.image_path
							? `${STORAGE_URL}/${event.image_path}`
							: `${STORAGE_URL}/event-banners/${event?.id}.jpg`
					}
					alt={event?.title}
					className="w-100 h-100 object-fit-cover"
				/>
				<div
					style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						right: 0,
						background:
							'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
						padding: 'clamp(12px, 3vw, 24px)',
						color: '#ffffff',
					}}
				>
					<div className="d-flex flex-wrap gap-2 mb-2">
						{event?.is_in_person && (
							<Badge
								bg="light"
								text="dark"
								className="border px-2.5 py-1.5 small"
							>
								<Users size={12} className="me-1" /> Onsite
							</Badge>
						)}
						{event?.is_online && (
							<Badge
								bg="primary"
								className="border border-primary px-2.5 py-1.5 small"
							>
								<Wifi size={12} className="me-1" /> Online
							</Badge>
						)}
						{event?.category && (
							<Badge bg="secondary" className="px-2.5 py-1.5 small">
								{event.category}
							</Badge>
						)}
					</div>
					<h3 className="fw-bold mb-1 fs-5 fs-md-3">{event?.title}</h3>
					<div className="d-flex flex-wrap gap-3 small opacity-90">
						<span className="d-flex align-items-center gap-1">
							<Calendar size={14} /> {formatEventDate()}
						</span>
						<span className="d-flex align-items-center gap-1">
							<MapPin size={14} /> {formatEventLocation()}
						</span>
					</div>
				</div>
			</div>

			{/* Certificate Claim Alert Banner */}
			{canClaimCertificate && (
				!alreadySubmitted ? (
					<Alert
						variant="warning"
						className="border-0 shadow-sm rounded-4 p-3.5 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
					>
						<div className="d-flex align-items-center gap-3">
							<div className="bg-warning bg-opacity-20 rounded-circle p-2 text-warning d-flex">
								<Award size={24} className="animate-bounce" />
							</div>
							<div>
								<h6
									className="fw-bold text-dark mb-1"
									style={{ fontSize: '14px' }}
								>
									E-Sertifikat Kelulusan Tersedia!
								</h6>
								<p
									className="mb-0 text-muted small"
									style={{ fontSize: '12px' }}
								>
									Silakan menuju ke tab Sertifikat untuk melihat dan mengunduh sertifikat resmi Anda.
								</p>
							</div>
						</div>
						<Button
							variant="warning"
							size="sm"
							onClick={() => setActiveTab('sertifikat')}
							className="rounded-pill px-3.5 py-1.5 fw-bold shadow-sm d-flex align-items-center gap-1.5"
							style={{ fontSize: '12px' }}
						>
							<Sparkles size={14} /> Klaim Sertifikat
						</Button>
					</Alert>
				) : (
					<Alert
						variant="success"
						className="border-0 shadow-sm rounded-4 p-3.5 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
					>
						<div className="d-flex align-items-center gap-3">
							<div className="bg-success bg-opacity-20 rounded-circle p-2 text-success d-flex">
								<CheckCircle size={24} />
							</div>
							<div>
								<h6
									className="fw-bold text-dark mb-1"
									style={{ fontSize: '14px' }}
								>
									E-Sertifikat Kelulusan Telah Aktif!
								</h6>
								<p
									className="mb-0 text-muted small"
									style={{ fontSize: '12px' }}
								>
									Terima kasih atas partisipasi Anda. Berkas e-sertifikat
									PDF dengan kode QR verifikasi unik telah siap diunduh.
								</p>
							</div>
						</div>
						<Button
							variant="success"
							size="sm"
							onClick={() => setActiveTab('sertifikat')}
							className="rounded-pill px-3.5 py-1.5 fw-bold shadow-sm d-flex align-items-center gap-1.5"
							style={{ fontSize: '12px' }}
						>
							<Download size={14} /> Unduh Sertifikat
						</Button>
					</Alert>
				)
			)}

			{/* PENGUMUMAN TERBARU */}
			<Card className="border-0 shadow-sm rounded-4 mb-4">
				<Card.Header className="bg-white border-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
					<div className="d-flex align-items-center gap-2">
						<Bell size={18} className="text-primary animate-bounce" />
						<h6 className="fw-extrabold text-dark mb-0">
							Pengumuman Terbaru
						</h6>
					</div>
					{announcements.length > 0 && (
						<Button
							variant="link"
							size="sm"
							className="p-0 text-primary text-decoration-none fw-bold"
							onClick={() => setActiveTab('pengumuman')}
							style={{ fontSize: '12px' }}
						>
							Lihat Semua
						</Button>
					)}
				</Card.Header>
				<Card.Body className="px-4 pb-4 pt-2">
					{announcements && announcements.length > 0 ? (
						<div className="d-flex flex-column gap-3">
							{announcements.slice(0, 3).map((ann) => {
								const badgeConfig = {
									announcement: {
										label: '📌 PENGUMUMAN',
										color: '#3b82f6',
										bg: 'rgba(59, 130, 246, 0.08)',
									},
									event_updated: {
										label: '🔄 UPDATE ACARA',
										color: '#06b6d4',
										bg: 'rgba(6, 182, 212, 0.08)',
									},
									'H-24': {
										label: '📅 H-1 ACARA',
										color: '#eab308',
										bg: 'rgba(234, 179, 8, 0.08)',
									},
									'H-1': {
										label: '⚠️ PENTING (1 JAM)',
										color: '#f97316',
										bg: 'rgba(249, 115, 22, 0.08)',
									},
									'M-15': {
										label: '🚨 MENDESAK (15 MENIT)',
										color: '#ef4444',
										bg: 'rgba(239, 68, 68, 0.08)',
									},
								};

								const config = badgeConfig[ann.type] || {
									label: '📢 UPDATE',
									color: '#3b82f6',
									bg: 'rgba(59, 130, 246, 0.05)',
								};

								const rawAnn = ann.raw || {};
								const hasAttachment =
									ann.file_url ||
									ann.attachment ||
									ann.attachment_path ||
									ann.attachment_url ||
									rawAnn.attachment_path ||
									rawAnn.attachment_url;
								const attachmentUrl = getFullAttachmentUrl(
									ann.attachment_url ||
										rawAnn.attachment_url ||
										ann.file_url ||
										ann.attachment,
									ann.attachment_path || rawAnn.attachment_path,
								);

								return (
									<div
										key={ann.id}
										className="border-start border-4 rounded-3 p-3 mb-3"
										style={{
											borderColor: config.color,
											backgroundColor: config.bg || 'rgba(59, 130, 246, 0.05)',
										}}
									>
										<div className="d-flex justify-content-between align-items-center mb-2">
											<span
												className="badge border px-2 py-1 rounded small fw-bold"
												style={{
													fontSize: '10px',
													borderColor: `${config.color}22`,
													color: config.color,
													backgroundColor: '#ffffff',
												}}
											>
												{config.label}
											</span>
											<span
												className="text-muted small"
												style={{ fontSize: '11px' }}
											>
												{formatTimeAgo(ann.date)}
											</span>
										</div>
										<h6
											className="fw-bold mb-1 text-dark"
											style={{ fontSize: '13.5px' }}
										>
											{ann.title}
										</h6>
										<p
											className="text-muted mb-0 small"
											style={{
												fontSize: '12px',
												lineHeight: '1.5',
												display: '-webkit-box',
												WebkitLineClamp: 2,
												WebkitBoxOrient: 'vertical',
												overflow: 'hidden',
											}}
										>
											{ann.content}
										</p>

										{hasAttachment && (
											<div className="d-block mt-2">
												<Button
													variant="outline-primary"
													size="sm"
													className="rounded-pill mt-2 d-inline-flex align-items-center gap-1"
													href={attachmentUrl}
													target="_blank"
													rel="noopener noreferrer"
													style={{ fontSize: '11px', padding: '0.25rem 0.75rem' }}
												>
													<Paperclip size={12} />
													<span>Buka Lampiran</span>
												</Button>
											</div>
										)}
									</div>
								);
							})}
						</div>
					) : (
						<div className="text-center py-4 bg-light rounded-4 border border-dashed">
							<p className="text-muted small m-0">Belum ada pengumuman</p>
						</div>
					)}
				</Card.Body>
			</Card>

			{/* TENTANG EVENT */}
			<Card className="border-0 shadow-sm rounded-4 mb-4">
				<Card.Body className="p-4">
					<h6 className="fw-extrabold text-dark mb-3">Tentang Event Ini</h6>
					<div
						style={{
							lineHeight: '1.8',
							color: 'var(--color-secondary)',
							fontSize: '13px',
						}}
						dangerouslySetInnerHTML={{
							__html: event?.description || '<p>Deskripsi tidak tersedia.</p>',
						}}
					/>
				</Card.Body>
			</Card>

			{/* PENYELENGGARA & COLLABORATORS */}
			<Card className="border-0 shadow-sm rounded-4 mb-4">
				<Card.Body className="p-4">
					<h6 className="fw-extrabold text-dark mb-3">Penyelenggara & Partner</h6>
					<div className="d-flex align-items-center gap-3">
						<div 
							className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
							style={{ width: '48px', height: '48px' }}
						>
							<Users size={22} />
						</div>
						<div>
							<h6 className="fw-bold text-dark mb-0">
								{event?.organizer?.organization_name || event?.organizer?.name || event?.institution?.name || 'Penyelenggara KampusX'}
							</h6>
							<p className="mb-0 text-muted small">Penyelenggara Utama</p>
						</div>
					</div>

					{/* Collaborators / Co-Hosts / Sponsors */}
					{event?.collaborators && event.collaborators.length > 0 && (
						<div className="mt-4 border-top pt-3">
							<h6 className="fw-bold text-secondary text-uppercase tracking-wider mb-3" style={{ fontSize: '11px' }}>
								Partner Pendukung
							</h6>
							<div className="d-flex flex-wrap gap-2">
								{event.collaborators.map((col, idx) => {
									const roleLabels = {
										co_host: 'Co-Host',
										sponsor: 'Sponsor Resmi',
										media_partner: 'Media Partner',
									};
									const roleLabel = roleLabels[col.pivot?.role] || 'Partner';
									return (
										<Badge 
											key={col.id || idx} 
											bg="light" 
											text="dark" 
											className="border px-3 py-2 rounded-pill small fw-medium"
										>
											🤝 {col.name} <span className="text-muted opacity-75">({roleLabel})</span>
										</Badge>
									);
								})}
							</div>
						</div>
					)}
				</Card.Body>
			</Card>

			{/* RUNDOWN & SESSIONS */}
			<Card className="border-0 shadow-sm rounded-4 mb-4">
				<Card.Header className="bg-white border-0 pt-4 px-4 pb-2">
					<h6 className="fw-extrabold text-dark mb-0 d-flex align-items-center gap-2">
						<Clock size={18} className="text-primary" />
						<span>Rundown & Agenda Sesi</span>
					</h6>
					<small className="text-secondary">
						Waktu pelaksanaan dan detail pemateri acara
					</small>
				</Card.Header>
				<Card.Body className="px-4 pb-4 pt-2">
					{event?.sessions && event.sessions.length > 0 ? (
						(() => {
							const sessionsByDay = event.sessions.reduce((acc, session) => {
								const day = session.day_number || 1;
								if (!acc[day]) acc[day] = [];
								acc[day].push(session);
								return acc;
							}, {});

							return (
								<Accordion defaultActiveKey="day-1" className="custom-accordion">
									{Object.keys(sessionsByDay).map((day) => (
										<Accordion.Item
											eventKey={`day-${day}`}
											key={day}
											className="mb-3 border rounded-4 overflow-hidden shadow-sm"
										>
											<Accordion.Header>
												<div className="fw-bold text-dark">Hari {day}</div>
											</Accordion.Header>
											<Accordion.Body className="p-3">
												<ul className="list-unstyled m-0">
													{sessionsByDay[day]
														.sort((a, b) =>
															(a.start_time || '').localeCompare(b.start_time || ''),
														)
														.map((session, index) => (
															<li
																key={session.id || index}
																className="d-flex flex-column flex-sm-row mb-4 align-items-start gap-2 gap-sm-3"
															>
																<div
																	className="fw-bold text-primary text-nowrap"
																	style={{
																		minWidth: '95px',
																		fontSize: '12px',
																	}}
																>
																	{session.start_time
																		? session.start_time.substring(0, 5)
																		: '09:00'}{' '}
																	-{' '}
																	{session.end_time
																		? session.end_time.substring(0, 5)
																		: '10:00'}
																</div>
																<div className="flex-grow-1">
																	<div
																		className="fw-bold text-dark"
																		style={{
																			fontSize: '13px',
																		}}
																	>
																		{session.title}
																	</div>
																	{session.description && (
																		<p
																			className="text-muted small mb-2"
																			style={{
																				fontSize: '12px',
																			}}
																		>
																			{session.description}
																		</p>
																	)}
																	{session.speakers &&
																		session.speakers.length > 0 && (
																			<div className="d-flex flex-wrap gap-2 mt-1">
																				{session.speakers.map((speaker, idx) => (
																					<span
																						key={speaker.id || idx}
																						className="badge bg-light text-dark border small py-1 px-2"
																						style={{
																							borderRadius: '6px',
																							fontSize: '10px',
																						}}
																					>
																						🎤 {speaker.name} ({speaker.role || 'Pembicara'})
																					</span>
																				))}
																			</div>
																		)}
																</div>
															</li>
														))}
												</ul>
											</Accordion.Body>
										</Accordion.Item>
									))}
								</Accordion>
							);
						})()
					) : (
						<p className="text-muted small m-0 text-center py-4 bg-light rounded-4">
							Jadwal sesi acara belum diumumkan oleh penyelenggara.
						</p>
					)}
				</Card.Body>
			</Card>
		</div>
	);
};

export default OverviewTab;
