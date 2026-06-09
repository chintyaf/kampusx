import React, { useState, useEffect } from 'react';
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

const CertificateCard = ({ cert, certId, handleShowPreview, handleShowQR }) => {
	const hasTemplate = cert.has_template !== false && cert.certificate_template !== null && cert.certificate_template !== undefined;

	return (
		<>
			<Card className="border-0 shadow-sm h-100 overflow-hidden rounded-4 border border-secondary border-opacity-10 d-flex flex-column" style={{ opacity: hasTemplate ? 1 : 0.75 }}>
				{/* Certificate Image Header */}
				<div
					className="position-relative bg-secondary bg-opacity-25"
					style={{ height: '170px', overflow: 'hidden' }}
				>
					<div
						style={{
							backgroundImage: hasTemplate && cert.certificate_template?.background_url
								? `url(${cert.certificate_template.background_url})`
								: `url(https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							width: '100%',
							height: '100%',
							filter: (hasTemplate && cert.is_unlocked) ? 'none' : 'blur(5px) grayscale(100%)',
							transition: 'all 0.4s ease',
						}}
					/>
					{!hasTemplate ? (
						<div
							className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-white"
							style={{
								background: 'rgba(30, 41, 59, 0.75)',
								backdropFilter: 'blur(3px)',
							}}
						>
							<div className="bg-secondary bg-opacity-20 text-light p-2 rounded-circle border border-light border-opacity-25 mb-2">
								<Lock size={20} />
							</div>
							<span className="fw-bold small text-center px-3" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
								Belum Tersedia
							</span>
						</div>
					) : !cert.is_unlocked && (
						<div
							className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-white"
							style={{
								background: 'rgba(30, 41, 59, 0.7)',
								backdropFilter: 'blur(2px)',
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

					<Card.Title
						className="fw-bold text-dark mb-3 text-truncate"
						style={{ fontSize: '1.1rem' }}
						title={cert.event.title}
					>
						{cert.event.title}
					</Card.Title>

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
								<Button
									variant="primary"
									onClick={() => handleShowPreview(cert)}
									className="flex-grow-1 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
								>
									<Sparkles size={16} /> Preview & Unduh
								</Button>
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
								to={`/event-space/${cert.event.slug || cert.event.id}/survey`}
								className="w-100 text-decoration-none"
							>
								<Button
									variant="warning"
									className="w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
								>
									Isi Survei & Klaim <ArrowRight size={16} />
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
