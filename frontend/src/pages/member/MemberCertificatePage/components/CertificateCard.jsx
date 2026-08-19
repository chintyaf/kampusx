import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge, Button, Form } from 'react-bootstrap';
import {
	Award,
	QrCode,
	Calendar,
	Building,
	Lock,
	Sparkles,
	ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';

const CertificateCard = ({ cert, certId, handleShowPreview, handleShowQR }) => {
	const hasTemplate = cert.has_template !== false && cert.certificate_template !== null && cert.certificate_template !== undefined;

	const [inPortfolio, setInPortfolio] = useState(() => {
		const key = `cert-portfolio-${cert.id || cert.ticket_code || cert.ticket?.ticket_code}`;
		return localStorage.getItem(key) === 'true';
	});

	const handleTogglePortfolio = (e) => {
		e.stopPropagation();
		const nextVal = !inPortfolio;
		setInPortfolio(nextVal);
		const key = `cert-portfolio-${cert.id || cert.ticket_code || cert.ticket?.ticket_code}`;
		localStorage.setItem(key, nextVal.toString());
		if (nextVal) {
			toast.success('Sertifikat ditambahkan ke portofolio publik!');
		} else {
			toast.success('Sertifikat dihapus dari portofolio publik.');
		}
	};

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
					<Link to={`/certificate/${cert.ticket_code || cert.ticket?.ticket_code}`} className="w-100 d-block">
						<div
							className="position-relative bg-secondary bg-opacity-25 w-100"
							ref={containerRef}
							style={{
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
						className="position-relative d-flex flex-column justify-content-center align-items-center w-100"
						style={{
							backgroundColor: '#F9FAFB',
							borderBottom: '1px solid #E2E8F0',
							aspectRatio: hasTemplate ? `${cert.certificate_template.canvas_width || 1120}/${cert.certificate_template.canvas_height || 792}` : '1120/792',
							color: '#94A3B8'
						}}
					>
						<div 
							className="d-flex flex-column align-items-center justify-content-center"
							style={{ padding: '24px' }}
						>
							<div 
								className="rounded-circle d-flex align-items-center justify-content-center mb-3 border border-secondary border-opacity-10 shadow-sm"
								style={{ 
									width: '54px', 
									height: '54px', 
									backgroundColor: '#FFFFFF',
									color: !hasTemplate ? '#94A3B8' : '#F59E0B'
								}}
							>
								<Lock size={22} />
							</div>
							<span className="fw-bold small text-center" style={{ fontSize: '12.5px', color: '#64748B', letterSpacing: '0.3px' }}>
								{!hasTemplate ? 'Sertifikat Belum Tersedia' : 'Sertifikat Terkunci'}
							</span>
						</div>
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

				<div className="text-muted small mb-3">
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

				{/* Portfolio Integration Toggle */}
				{cert.is_unlocked && (
					<div 
						className="d-flex justify-content-between align-items-center mb-3 mt-auto pt-2 border-top"
						style={{ borderTop: '1px dashed #e2e8f0' }}
					>
						<span className="text-muted" style={{ fontSize: '12.5px', fontWeight: 500 }}>
							Tampilkan di Profil Publik
						</span>
						<Form.Check 
							type="switch"
							id={`portfolio-switch-${cert.id || cert.ticket_code || cert.ticket?.ticket_code}`}
							checked={inPortfolio}
							onChange={handleTogglePortfolio}
							onClick={(e) => e.stopPropagation()}
							style={{ cursor: 'pointer' }}
						/>
					</div>
				)}

				{/* Action Buttons */}
				<div className={`d-flex gap-2 w-100 ${!cert.is_unlocked ? 'mt-auto' : ''}`}>
					{!hasTemplate ? (
						<Button
							variant="secondary"
							disabled
							className="w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
							style={{ cursor: 'not-allowed', fontSize: '13px', padding: '10px 12px', backgroundColor: '#F1F5F9', borderColor: '#E2E8F0', color: '#94A3B8' }}
						>
							Menunggu Organizer
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
