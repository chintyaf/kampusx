import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import {
	Award,
	QrCode,
	Calendar,
	Building,
	Lock,
	Sparkles,
	AlertCircle,
	ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/api/axios';
import QRCode from 'react-qr-code';

const CertificateCard = ({ cert, certId, handleShowPreview, handleShowQR }) => {
	const hasTemplate = cert.has_template !== false && cert.certificate_template !== null && cert.certificate_template !== undefined;

	const containerRef = useRef(null);
	const [containerWidth, setContainerWidth] = useState(300);

	useEffect(() => {
		if (!hasTemplate || !cert.is_unlocked || !containerRef.current) return;
		
		const updateWidth = () => {
			if (containerRef.current) {
				setContainerWidth(containerRef.current.clientWidth);
			}
		};
		
		updateWidth();
		
		const resizeObserver = new ResizeObserver(() => {
			updateWidth();
		});
		resizeObserver.observe(containerRef.current);
		
		return () => {
			resizeObserver.disconnect();
		};
	}, [cert, hasTemplate]);

	const scale = containerWidth / (cert.certificate_template?.canvas_width || 1120);

	return (
		<>
			<Card className="border-0 shadow-sm h-100 overflow-hidden rounded-4 border border-secondary border-opacity-10 d-flex flex-column" style={{ opacity: hasTemplate ? 1 : 0.75 }}>
				{/* Certificate Image Header */}
				{hasTemplate && cert.is_unlocked ? (
					<Link to={`/certificate/${cert.ticket_code || cert.ticket?.ticket_code}`}>
						<div
							className="position-relative bg-secondary bg-opacity-25"
							ref={containerRef}
							style={{
								height: '170px',
								overflow: 'hidden',
								cursor: 'pointer',
								aspectRatio: `${cert.certificate_template.canvas_width || 1120}/${cert.certificate_template.canvas_height || 792}`
							}}
						>
							<img
								src={cert.certificate_template.background_url}
								alt="Certificate Thumbnail"
								className="w-100 h-100"
								style={{ display: 'block', objectFit: 'fill', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
								crossOrigin="anonymous"
							/>
							{cert.certificate_template.elements && cert.certificate_template.elements.map((el) => {
								const xPct = el.position_x;
								const yPct = el.position_y;

								if (el.element_type === 'qr_code') {
									const qrSize = Math.max(12, Math.round((el.font_size || 80) * scale));
									return (
										<div
											key={el.id}
											style={{
												position: 'absolute',
												left: `${xPct}%`,
												top: `${yPct}%`,
												transform: 'translate(-50%,-50%)',
												background: 'white',
												padding: '1.5px',
												borderRadius: '1.5px',
												zIndex: 2,
												width: `${qrSize + 3}px`,
												height: `${qrSize + 3}px`,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<QRCode
												value={el.custom_value || `${window.location.origin}/certificate/verify/${cert.ticket_code || cert.ticket?.ticket_code}`}
												size={qrSize}
												style={{ width: '100%', height: '100%' }}
											/>
										</div>
									);
								}

								const content =
									el.element_type === 'nama_peserta'
										? cert.attendee_name
										: el.element_type === 'id_sertifikat'
											? (cert.ticket_code || cert.ticket?.ticket_code)
											: el.custom_value || '';
								const currentFontSize = Math.round((el.font_size || 24) * scale);
								return (
									<div
										key={el.id}
										style={{
											position: 'absolute',
											left: `${xPct}%`,
											top: `${yPct}%`,
											transform: `translate(${el.text_align === 'center' ? '-50%' : el.text_align === 'right' ? '-100%' : '0%'}, -50%)`,
											textAlign: el.text_align || 'center',
											fontSize: `${currentFontSize}px`,
											color: el.font_color || '#000',
											fontFamily: el.font_family || 'Georgia, serif',
											fontWeight: el.element_type === 'nama_peserta' ? 'bold' : 'normal',
											pointerEvents: 'none',
											whiteSpace: 'nowrap',
											zIndex: 2,
										}}
									>
										{content}
									</div>
								);
							})}
						</div>
					</Link>
				) : (
					<div
						className="position-relative bg-secondary bg-opacity-25"
						style={{
							height: '170px',
							overflow: 'hidden',
							aspectRatio: hasTemplate ? `${cert.certificate_template.canvas_width || 1120}/${cert.certificate_template.canvas_height || 792}` : undefined
						}}
					>
						<img
							src={hasTemplate && cert.certificate_template?.background_url
								? cert.certificate_template.background_url
								: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
							}
							alt="Certificate Locked"
							className="w-100 h-100"
							style={{
								display: 'block',
								objectFit: 'fill',
								position: 'absolute',
								top: 0,
								left: 0,
								zIndex: 1,
								filter: 'blur(5px) grayscale(100%)',
								transition: 'all 0.4s ease',
							}}
							crossOrigin="anonymous"
						/>
						{!hasTemplate ? (
							<div
								className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-white"
								style={{
									background: 'rgba(30, 41, 59, 0.75)',
									backdropFilter: 'blur(3px)',
									zIndex: 2,
								}}
							>
								<div className="bg-secondary bg-opacity-20 text-light p-2 rounded-circle border border-light border-opacity-25 mb-2">
									<Lock size={20} />
								</div>
								<span className="fw-bold small text-center px-3" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
									Belum Tersedia
								</span>
							</div>
						) : (
							<div
								className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-white"
								style={{
									background: 'rgba(30, 41, 59, 0.7)',
									backdropFilter: 'blur(2px)',
									zIndex: 2,
								}}
							>
								<div className="bg-warning bg-opacity-20 text-warning p-2 rounded-circle border border-warning border-opacity-25 mb-2">
									<Lock size={20} className="animate-bounce" />
								</div>
								<span className="fw-bold small letter-spacing-1">
									Sertifikat Terkunci
								</span>
							</div>
						)}
					</div>
				)}

			{/* Certificate Content Body */}
			<Card.Body className="p-4 d-flex flex-column flex-grow-1">
				<div className="d-flex justify-content-between align-items-center mb-3">
					<Badge
						bg={!hasTemplate ? 'secondary' : cert.is_unlocked ? 'success-subtle' : 'warning-subtle'}
						className={`px-3 py-1.5 rounded-pill fw-semibold ${!hasTemplate ? 'text-secondary border border-secondary border-opacity-10 bg-secondary bg-opacity-10' : cert.is_unlocked ? 'text-success border border-success border-opacity-10' : 'text-warning border border-warning border-opacity-10'}`}
					>
						{!hasTemplate ? 'Menunggu Organizer' : cert.is_unlocked ? '✓ Terbuka' : '⚡ Klaim'}
					</Badge>
					<span className="text-muted small fw-mono">{certId}</span>
				</div>

				{hasTemplate && cert.is_unlocked ? (
					<Link
						to={`/certificate/${cert.ticket_code || cert.ticket?.ticket_code}`}
						className="text-decoration-none text-dark link-primary"
					>
						<Card.Title
							className="fw-bold mb-3 text-truncate"
							style={{ fontSize: '1.1rem', cursor: 'pointer' }}
							title={cert.event.title}
						>
							{cert.event.title}
						</Card.Title>
					</Link>
				) : (
					<Card.Title
						className="fw-bold text-dark mb-3 text-truncate"
						style={{ fontSize: '1.1rem' }}
						title={cert.event.title}
					>
						{cert.event.title}
					</Card.Title>
				)}

				<div className="text-muted small mb-4 mt-auto">
					<div className="d-flex align-items-center gap-2 mb-2">
						<Building size={14} className="text-secondary" />
						<span className="text-truncate" style={{ maxWidth: '240px' }}>
							{cert.event.organizer_name}
						</span>
					</div>
					<div className="d-flex align-items-center gap-2">
						<Calendar size={14} className="text-secondary" /> {cert.event.date}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="d-flex gap-2 w-100">
					{!hasTemplate ? (
						<Button
							variant="secondary"
							disabled
							className="w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
							style={{ cursor: 'not-allowed', fontSize: '12px', padding: '10px 12px' }}
						>
							Sertifikat Belum Tersedia / Menunggu Organizer
						</Button>
					) : cert.is_unlocked ? (
						<>
							<Link
								to={`/certificate/${cert.ticket_code || cert.ticket?.ticket_code}`}
								className="flex-grow-1 text-decoration-none"
							>
								<Button
									variant="primary"
									className="w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
								>
									<Sparkles size={16} /> Preview & Unduh
								</Button>
							</Link>
							<Button
								variant="outline-dark"
								onClick={() => handleShowQR(cert)}
								className="rounded-circle p-2.5 d-flex align-items-center justify-content-center shadow-sm"
								title="Tampilkan QR Code Verifikasi"
							>
								<QrCode size={18} />
							</Button>
						</>
					) : (
						<Link
							to={`/event-space/${cert.event.slug || cert.event.id}`}
							className="w-100 text-decoration-none"
						>
							<Button
								variant="warning"
								className="w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
							>
								Cek Detail Klaim <ArrowRight size={16} />
							</Button>
						</Link>
					)}
				</div>
			</Card.Body>
			</Card>
		</>
	);
};

export default CertificateCard;
