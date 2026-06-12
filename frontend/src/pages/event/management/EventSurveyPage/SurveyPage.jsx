import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import {
	ArrowLeft,
	Star,
	Lock,
	Award,
	Download,
	CheckCircle,
	MessageSquare,
	ShieldCheck,
	Sparkles,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import html2pdf from 'html2pdf.js';
import api from '../../../../api/axios';

export default function SurveyPage() {
	const { id: eventId } = useParams();
	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [event, setEvent] = useState(null);
	const [alreadySubmitted, setAlreadySubmitted] = useState(false);
	const [participantName, setParticipantName] = useState('');
	const [surveyResponse, setSurveyResponse] = useState(null);
	const [certificateTemplate, setCertificateTemplate] = useState(null);
	const [customSurvey, setCustomSurvey] = useState(null);

	const containerRef = useRef(null);
	const [containerWidth, setContainerWidth] = useState(1120);

	useEffect(() => {
		if (!containerRef.current) return;
		
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
	}, [certificateTemplate]);

	const scale = containerWidth / (certificateTemplate?.canvas_width || 1120);
	const [isPreviewOnly, setIsPreviewOnly] = useState(false);
	const [ticketStatus, setTicketStatus] = useState(null);

	// Dynamic form answers: { [question_id]: value }
	const [answers, setAnswers] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const [successMsg, setSuccessMsg] = useState('');

	useEffect(() => {
		fetchSurveyData();
	}, [eventId]);

	const fetchSurveyData = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await api.get(`/events/${eventId}/survey`);
			if (response.data.success) {
				const {
					event,
					already_submitted,
					survey_response,
					certificate_template,
					participant_name,
					custom_survey,
					is_preview_only,
					ticket_status,
				} = response.data.data;

				setEvent(event);
				setAlreadySubmitted(already_submitted);
				setSurveyResponse(survey_response);
				setCertificateTemplate(certificate_template);
				setParticipantName(participant_name);
				setCustomSurvey(custom_survey || null);
				setIsPreviewOnly(!!is_preview_only);
				setTicketStatus(ticket_status || null);

				if (already_submitted && survey_response?.answers) {
 					const existing = {};
 					survey_response.answers.forEach((a) => {
 						existing[a.question_id] = a.value || '';
 					});
 					setAnswers(existing);
 				}
			}
		} catch (err) {
			setError(
				err.response?.data?.message || 'Terjadi kesalahan saat memuat halaman survei.',
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmitCustomSurvey = async (e) => {
		e.preventDefault();
		if (isPreviewOnly) {
			alert('Mode Pratinjau: Penyelenggara tidak dapat mengirimkan jawaban survei.');
			return;
		}

		// Validate required questions
		const required = customSurvey.questions.filter((q) => q.is_required);
		for (const q of required) {
			const val = answers[q.id];
			if (!val || val.toString().trim() === '') {
				alert(`Pertanyaan "${q.label}" wajib diisi.`);
				return;
			}
		}

		setSubmitting(true);
		setError(null);
		try {
			const answersPayload = customSurvey.questions.map((q) => ({
				question_id: q.id,
				value: answers[q.id]?.toString() || '',
			}));

			const response = await api.post(`/events/${eventId}/survey`, {
				survey_id: customSurvey.id,
				answers: answersPayload,
			});

			if (response.data.success) {
				setSuccessMsg(response.data.message);
				setAlreadySubmitted(true);
				setSurveyResponse(response.data.data.survey_response);
				setCertificateTemplate(response.data.data.certificate_template);
				setParticipantName(response.data.data.participant_name);
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		} catch (err) {
			setError(
				err.response?.data?.message || 'Gagal menyimpan jawaban. Silakan coba kembali.',
			);
		} finally {
			setSubmitting(false);
		}
	};



	const handleDownloadPDF = () => {
		const element = document.getElementById('certificate-print-area');
		if (!element) return;
		const canvasWidth = certificateTemplate?.canvas_width || 1120;
		const canvasHeight = certificateTemplate?.canvas_height || 792;
		const opt = {
			margin: 0,
			filename: `Sertifikat_${event?.title?.replace(/\s+/g, '_') || 'Event'}.pdf`,
			image: { type: 'jpeg', quality: 1.0 },
			html2canvas: { 
				scale: 2, 
				useCORS: true, 
				logging: false,
				onclone: (clonedDoc) => {
					const clonedArea = clonedDoc.getElementById('certificate-print-area');
					if (clonedArea) {
						clonedArea.style.width = `${canvasWidth}px`;
						clonedArea.style.height = `${canvasHeight}px`;
						
						const textElements = clonedArea.querySelectorAll('[data-design-font-size]');
						textElements.forEach((el) => {
							const designSize = el.getAttribute('data-design-font-size');
							if (designSize) {
								el.style.fontSize = `${designSize}px`;
							}
						});

						const qrContainers = clonedArea.querySelectorAll('[data-design-qr-size]');
						qrContainers.forEach((container) => {
							const designQrSize = parseInt(container.getAttribute('data-design-qr-size') || '80', 10);
							container.style.width = `${designQrSize + 8}px`;
							container.style.height = `${designQrSize + 8}px`;
							
							const svg = container.querySelector('svg');
							if (svg) {
								svg.setAttribute('width', designQrSize.toString());
								svg.setAttribute('height', designQrSize.toString());
								svg.style.width = `${designQrSize}px`;
								svg.style.height = `${designQrSize}px`;
							}
						});
					}
				}
			},
			jsPDF: { unit: 'px', format: [canvasWidth, canvasHeight], orientation: 'landscape' },
		};
		const toast = document.createElement('div');
		toast.className =
			'position-fixed bottom-0 end-0 m-4 p-3 bg-dark text-white rounded-3 shadow-lg';
		toast.style.zIndex = '9999';
		toast.innerHTML = '⚡ Sedang memproses PDF...';
		document.body.appendChild(toast);
		html2pdf()
			.from(element)
			.set(opt)
			.save()
			.then(() => {
				toast.innerHTML = '🎉 Sertifikat berhasil diunduh!';
				setTimeout(() => toast.remove(), 3000);
			})
			.catch(() => {
				toast.className = toast.className.replace('bg-dark', 'bg-danger');
				toast.innerHTML = '❌ Gagal.';
				setTimeout(() => toast.remove(), 4000);
			});
	};

	const certId = `CERT-${eventId}-${surveyResponse?.id || '00000'}`;

	// ─── Loading State ───
	if (isLoading) {
		return (
			<div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
				<Spinner
					animation="border"
					variant="primary"
					style={{ width: '3rem', height: '3rem' }}
				/>
				<h5 className="mt-4 fw-medium text-muted">Menyiapkan Formulir Evaluasi...</h5>
			</div>
		);
	}

	// ─── Error State ───
	if (error && !event) {
		return (
			<Container className="py-5 text-center">
				<Card
					className="border-0 shadow-sm p-5 rounded-4 mx-auto"
					style={{ maxWidth: '500px' }}
				>
					<div className="text-danger mb-4">
						<Lock size={64} className="mx-auto" />
					</div>
					<h4 className="fw-bold mb-3">Akses Terkunci</h4>
					<Alert variant="danger" className="rounded-3">
						{error}
					</Alert>
					<Button
						variant="outline-dark"
						className="rounded-pill mt-3"
						onClick={() => navigate(-1)}
					>
						<ArrowLeft size={16} className="me-2" /> Kembali
					</Button>
				</Card>
			</Container>
		);
	}

	// ─── Main Render ───
	return (
		<div className="bg-light min-vh-100 pb-5">
			{/* Sticky Header */}
			<div
				className="bg-white border-bottom shadow-sm sticky-top mb-4"
				style={{ zIndex: 1020 }}
			>
				<Container className="py-3">
					<div className="d-flex align-items-center gap-3">
						<Button
							variant="light"
							className="rounded-circle p-2 d-flex border"
							onClick={() => navigate(`/event-space/${eventId}`)}
						>
							<ArrowLeft size={20} className="text-dark" />
						</Button>
						<div>
							<h5 className="fw-bold mb-0">Evaluasi & Klaim Sertifikat</h5>
							<span className="text-muted small">{event?.title}</span>
						</div>
					</div>
				</Container>
			</div>

			<Container>
				{successMsg && (
					<Alert
						variant="success"
						className="border-0 shadow-sm rounded-4 p-4 mb-4 d-flex align-items-center gap-3"
					>
						<CheckCircle size={32} className="text-success flex-shrink-0" />
						<div>
							<h6 className="fw-bold mb-1">Berhasil!</h6>
							<p className="mb-0 text-muted small">{successMsg}</p>
						</div>
					</Alert>
				)}

				<Row className="g-4">
					{/* ── LEFT: Certificate Preview ── */}
					<Col lg={alreadySubmitted ? 12 : 7}>
						<Card className="border-0 shadow-lg rounded-4 overflow-hidden mb-4">
							<Card.Body className="p-4 p-md-5">
								{alreadySubmitted ? (
									<>
										<div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
											<div>
												<h4 className="fw-bold text-dark d-flex align-items-center gap-2">
													<Award size={28} className="text-warning" />{' '}
													Selamat, {participantName}!
												</h4>
												<p className="text-muted mb-0 small">
													Sertifikat kelulusan Anda telah diterbitkan
													secara resmi.
												</p>
											</div>
											<Button
												variant="success"
												className="rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow"
												onClick={handleDownloadPDF}
											>
												<Download size={18} /> Unduh PDF
											</Button>
										</div>
// ... (rest of the code until certificate mapping)

										<div
											className="bg-dark rounded-4 p-3 d-flex align-items-center justify-content-center overflow-auto"
											style={{ minHeight: '400px' }}
										>
											<div className="w-100" style={{ maxWidth: '900px' }}>
												{certificateTemplate ? (
													<div
														id="certificate-print-area"
														ref={containerRef}
														style={{
															position: 'relative',
															width: '100%',
															aspectRatio: `${certificateTemplate.canvas_width}/${certificateTemplate.canvas_height}`,
															overflow: 'hidden',
															backgroundColor: '#fff',
														}}
													>
														<img
															src={certificateTemplate.background_url}
															alt="Certificate Template"
															className="w-100 h-100"
															style={{ display: 'block', objectFit: 'fill', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
															crossOrigin="anonymous"
														/>
														{certificateTemplate.elements.map((el) => {
															const xPct = el.position_x;
															const yPct = el.position_y;
															if (el.element_type === 'qr_code') {
																const qrSize = Math.max(30, Math.round((el.font_size || 80) * scale));
																return (
																	<div
																		key={el.id}
																		data-design-qr-size={el.font_size || 80}
																		style={{
																			position: 'absolute',
																			left: `${xPct}%`,
																			top: `${yPct}%`,
																			transform: 'translate(-50%,-50%)',
																			background: 'white',
																			padding: '4px',
																			borderRadius: '4px',
																			zIndex: 2,
																			width: `${qrSize + 8}px`,
																			height: `${qrSize + 8}px`,
																			display: 'flex',
																			alignItems: 'center',
																			justifyContent: 'center',
																		}}
																	>
																		<QRCode
																			value={`${window.location.origin}/certificate/verify/${certId}`}
																			size={qrSize}
																			style={{ width: '100%', height: '100%' }}
																		/>
																	</div>
																);
															}
															const content =
																el.element_type === 'nama_peserta'
																	? participantName
																	: el.element_type ===
																		'id_sertifikat'
																		? certId
																		: el.custom_value || '';
															const currentFontSize = Math.round((el.font_size || 24) * scale);
															return (
																<div
																	key={el.id}
																	data-design-font-size={el.font_size || 24}
																	style={{
																		position: 'absolute',
																		left: `${xPct}%`,
																		top: `${yPct}%`,
																		transform: `translate(${el.text_align === 'center' ? '-50%' : el.text_align === 'right' ? '-100%' : '0%'}, -50%)`,
																		textAlign: el.text_align || 'center',
																		fontSize: `${currentFontSize}px`,
																		color: el.font_color || '#000',
																		fontFamily: el.font_family || 'Georgia, serif',
																		fontWeight:
																			el.element_type ===
																				'nama_peserta'
																				? 'bold'
																				: 'normal',
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
												) : (
													<FallbackCertificate
														participantName={participantName}
														certId={certId}
														event={event}
														surveyResponse={surveyResponse}
													/>
												)}
											</div>
										</div>

										<div className="mt-4 bg-light rounded-4 p-4 d-flex align-items-center gap-3 border">
											<ShieldCheck
												size={32}
												className="text-success flex-shrink-0"
											/>
											<div>
												<h6 className="fw-bold mb-1">
													Keaslian Sertifikat Terjamin
												</h6>
												<p className="mb-0 text-muted small">
													Sertifikat dilengkapi ID unik dan QR verifikasi
													publik.
												</p>
											</div>
										</div>
									</>
								) : (
									/* Locked blurred preview */
									<div
										className="position-relative"
										style={{ minHeight: '340px' }}
									>
										<div
											style={{
												filter: 'blur(7px) grayscale(50%)',
												transform: 'scale(1.03)',
											}}
											className="d-flex flex-column justify-content-center align-items-center text-center p-5"
										>
											<h1
												style={{ fontFamily: 'Georgia, serif' }}
												className="fw-bold mb-3"
											>
												CERTIFICATE OF COMPLETION
											</h1>
											<h5 className="mb-2">This is to certify that</h5>
											<h2 className="fw-bold text-decoration-underline mb-3">
												Alex Participant
											</h2>
											<h3 className="fw-bold">"{event?.title}"</h3>
										</div>
										<div
											className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
											style={{
												backdropFilter: 'blur(2px)',
												background: 'rgba(255,255,255,0.6)',
											}}
										>
											<div className="text-center p-4">
												<div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex p-3 mb-3 border border-warning border-opacity-25">
													<Lock size={40} />
												</div>
												<h4 className="fw-bold mb-2">
													Sertifikat Terkunci
												</h4>
												<p
													className="text-muted small mx-auto"
													style={{ maxWidth: '360px' }}
												>
													Sertifikat akan terbuka jika Anda telah tercatat hadir (check-in) dan pihak Penyelenggara telah menerbitkan desain sertifikat resmi.
												</p>
											</div>
										</div>
									</div>
								)}
							</Card.Body>
						</Card>
					</Col>

					{/* ── RIGHT: Claim Prerequisites ── */}
					{!alreadySubmitted && (
						<Col lg={5}>
							<Card className="border-0 shadow-sm rounded-4 overflow-hidden">
								{/* Header */}
								<div
									className="p-4 text-white"
									style={{
										background: 'linear-gradient(135deg, #1a365d, #3b82f6)',
									}}
								>
									<div className="d-flex align-items-center gap-3">
										<div className="bg-white bg-opacity-20 rounded-circle p-2 d-flex">
											<ShieldCheck size={22} />
										</div>
										<div>
											<h5 className="fw-bold mb-0">Persyaratan Klaim</h5>
											<p
												className="mb-0 small mt-1"
												style={{ color: 'rgba(255,255,255,0.75)' }}
											>
												Penuhi persyaratan berikut untuk mengunduh sertifikat
											</p>
										</div>
									</div>
								</div>

								<Card.Body className="p-4">
									<div className="d-flex flex-column gap-4">
										{/* Prasyarat 1: Check-in */}
										<div className="d-flex align-items-start gap-3">
											{ticketStatus === 'used' ? (
												<CheckCircle className="text-success mt-1 flex-shrink-0" size={24} />
											) : (
												<Lock className="text-warning mt-1 flex-shrink-0" size={24} />
											)}
											<div>
												<h6 className="fw-bold mb-1">Kehadiran (Check-in)</h6>
												<p className="text-muted small mb-0">
													{ticketStatus === 'used'
														? 'Anda telah melakukan check-in kehadiran di lokasi event.'
														: 'Anda belum tercatat hadir. Pastikan panitia telah melakukan scan E-Tiket Anda.'}
												</p>
											</div>
										</div>

										<hr className="my-0 opacity-25" />

										{/* Prasyarat 2: Template Ready */}
										<div className="d-flex align-items-start gap-3">
											{certificateTemplate ? (
												<CheckCircle className="text-success mt-1 flex-shrink-0" size={24} />
											) : (
												<Lock className="text-warning mt-1 flex-shrink-0" size={24} />
											)}
											<div>
												<h6 className="fw-bold mb-1">Penerbitan Sertifikat</h6>
												<p className="text-muted small mb-0">
													{certificateTemplate
														? 'Desain sertifikat resmi telah diterbitkan oleh Penyelenggara.'
														: 'Penyelenggara belum menerbitkan desain sertifikat resmi untuk event ini.'}
												</p>
											</div>
										</div>
									</div>
								</Card.Body>
							</Card>
						</Col>
					)}
				</Row>
			</Container>
		</div>
	);
}

function FallbackCertificate({ participantName, certId, event, surveyResponse }) {
	return (
		<div
			id="certificate-print-area"
			className="bg-white text-center position-relative overflow-hidden"
			style={{
				width: '100%',
				aspectRatio: '1120/792',
				border: '5px solid #d4af37',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				padding: '60px 80px',
			}}
		>
			<div
				style={{
					position: 'absolute',
					border: '1px solid rgba(212,175,55,0.3)',
					inset: '20px',
					pointerEvents: 'none',
				}}
			/>
			<Award size={56} className="text-warning mb-3" />
			<h1
				style={{
					fontFamily: 'Georgia, serif',
					letterSpacing: '4px',
					fontSize: '26px',
					fontWeight: 'bold',
					marginBottom: '4px',
				}}
			>
				SERTIFIKAT KELULUSAN
			</h1>
			<p
				style={{
					letterSpacing: '2px',
					fontSize: '11px',
					color: '#888',
					marginBottom: '20px',
				}}
			>
				NOMOR: {certId}
			</p>
			<p
				style={{
					fontSize: '13px',
					color: '#666',
					fontStyle: 'italic',
					marginBottom: '8px',
				}}
			>
				Diberikan kepada:
			</p>
			<h2
				style={{
					fontFamily: 'Georgia, serif',
					fontSize: '24px',
					fontWeight: 'bold',
					textDecoration: 'underline',
					textUnderlineOffset: '6px',
					marginBottom: '16px',
					textTransform: 'uppercase',
				}}
			>
				{participantName}
			</h2>
			<p
				style={{
					fontSize: '12px',
					color: '#555',
					maxWidth: '480px',
					lineHeight: '1.6',
					marginBottom: '10px',
				}}
			>
				Atas keberhasilan menyelesaikan seluruh rangkaian pembelajaran pada event bertajuk:
			</p>
			<h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '28px' }}>
				"{event?.title}"
			</h4>
			<div
				style={{
					width: '100%',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-end',
				}}
			>
				<div style={{ textAlign: 'left' }}>
					<p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Penyelenggara:</p>
					<p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>
						{event?.institution?.name || event?.organizer?.name || 'KampusX Academy'}
					</p>
				</div>
				<div
					style={{
						background: 'white',
						padding: '4px',
						border: '1px solid #eee',
						borderRadius: '4px',
					}}
				>
					<QRCode value={`${window.location.origin}/certificate/verify/${certId}`} size={48} />
				</div>
				<div style={{ textAlign: 'right' }}>
					<p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Diterbitkan:</p>
					<p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>
						{new Date(surveyResponse?.created_at || Date.now()).toLocaleDateString(
							'id-ID',
							{ day: 'numeric', month: 'long', year: 'numeric' },
						)}
					</p>
					<span style={{ color: '#22c55e', fontSize: '11px', fontWeight: '600' }}>
						✓ VALID
					</span>
				</div>
			</div>
		</div>
	);
}

function getRatingText(score) {
	const map = {
		1: 'Sangat Buruk',
		2: 'Kurang Baik',
		3: 'Cukup Baik',
		4: 'Sangat Bagus',
		5: 'Sempurna!',
	};
	return map[score] || '';
}
