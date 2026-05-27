import React, { useState, useEffect } from 'react';
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
	const [isPreviewOnly, setIsPreviewOnly] = useState(false);

	// Dynamic form answers: { [question_id]: value }
	const [answers, setAnswers] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const [successMsg, setSuccessMsg] = useState('');

	// Legacy fixed-form states (when no custom survey)
	const [rating, setRating] = useState(0);
	const [speakerRating, setSpeakerRating] = useState(0);
	const [materialRating, setMaterialRating] = useState(0);
	const [comments, setComments] = useState('');
	const [ratingHover, setRatingHover] = useState(0);
	const [speakerHover, setSpeakerHover] = useState(0);
	const [materialHover, setMaterialHover] = useState(0);

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
				} = response.data.data;
				setEvent(event);
				setAlreadySubmitted(already_submitted);
				setSurveyResponse(survey_response);
				setCertificateTemplate(certificate_template);
				setParticipantName(participant_name);
				setCustomSurvey(custom_survey || null);
				setIsPreviewOnly(!!is_preview_only);

				if (already_submitted && survey_response && !custom_survey) {
					setRating(survey_response.rating || 0);
					setSpeakerRating(survey_response.speaker_rating || 0);
					setMaterialRating(survey_response.material_rating || 0);
					setComments(survey_response.comments || '');
				}

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

	const handleSubmitLegacySurvey = async (e) => {
		e.preventDefault();
		if (isPreviewOnly) {
			alert('Mode Pratinjau: Penyelenggara tidak dapat mengirimkan jawaban survei.');
			return;
		}
		if (rating === 0) {
			alert('Silakan berikan penilaian kepuasan keseluruhan acara!');
			return;
		}

		setSubmitting(true);
		setError(null);
		try {
			const response = await api.post(`/events/${eventId}/survey`, {
				rating,
				speaker_rating: speakerRating || null,
				material_rating: materialRating || null,
				comments,
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
				err.response?.data?.message || 'Gagal menyimpan ulasan. Silakan coba kembali.',
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
			html2canvas: { scale: 2, useCORS: true, logging: false },
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

										<div
											className="bg-dark rounded-4 p-3 d-flex align-items-center justify-content-center overflow-auto"
											style={{ minHeight: '400px' }}
										>
											<div className="w-100" style={{ maxWidth: '900px' }}>
												{certificateTemplate ? (
													<div
														id="certificate-print-area"
														style={{
															position: 'relative',
															width: '100%',
															aspectRatio: `${certificateTemplate.canvas_width}/${certificateTemplate.canvas_height}`,
															backgroundImage: `url(${certificateTemplate.background_url})`,
															backgroundSize: 'cover',
															backgroundPosition: 'center',
															overflow: 'hidden',
															backgroundColor: '#fff',
														}}
													>
														{certificateTemplate.elements.map((el) => {
															const xPct =
																(el.position_x /
																	certificateTemplate.canvas_width) *
																100;
															const yPct =
																(el.position_y /
																	certificateTemplate.canvas_height) *
																100;
															if (el.element_type === 'qr_code')
																return (
																	<div
																		key={el.id}
																		style={{
																			position: 'absolute',
																			left: `${xPct}%`,
																			top: `${yPct}%`,
																			transform:
																				'translate(-50%,-50%)',
																			background: 'white',
																			padding: '4px',
																			borderRadius: '4px',
																		}}
																	>
																		<QRCode
																			value={`${window.location.origin}/certificate/verify/${certId}`}
																			size={50}
																		/>
																	</div>
																);
															const content =
																el.element_type === 'nama_peserta'
																	? participantName
																	: el.element_type ===
																		'id_sertifikat'
																		? certId
																		: el.custom_value || '';
															return (
																<div
																	key={el.id}
																	style={{
																		position: 'absolute',
																		left: `${xPct}%`,
																		top: `${yPct}%`,
																		transform: `translate(${el.text_align === 'center' ? '-50%' : el.text_align === 'right' ? '-100%' : '0%'}, -50%)`,
																		textAlign:
																			el.text_align ||
																			'center',
																		fontSize: `calc(${el.font_size || 24}px * (1vw / 12))`,
																		color:
																			el.font_color || '#000',
																		fontFamily:
																			el.font_family ||
																			'Georgia, serif',
																		fontWeight:
																			el.element_type ===
																				'nama_peserta'
																				? 'bold'
																				: 'normal',
																		pointerEvents: 'none',
																		whiteSpace: 'nowrap',
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
													{customSurvey
														? 'Isi formulir evaluasi di sebelah kanan untuk membuka sertifikat.'
														: 'Berikan penilaian Anda untuk membuka sertifikat kelulusan.'}
												</p>
											</div>
										</div>
									</div>
								)}
							</Card.Body>
						</Card>
					</Col>

					{/* ── RIGHT: Survey Form ── */}
					{!alreadySubmitted && (
						<Col lg={5}>
							<Card className="border-0 shadow-sm rounded-4 overflow-hidden">
								{/* Header */}
								<div
									className="p-4 text-white"
									style={{
										background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
									}}
								>
									<div className="d-flex align-items-center gap-3">
										<div className="bg-white bg-opacity-20 rounded-circle p-2 d-flex">
											<MessageSquare size={22} />
										</div>
										<div>
											<h5 className="fw-bold mb-0">
												{customSurvey
													? customSurvey.title
													: 'Formulir Evaluasi'}
											</h5>
											<p
												className="mb-0 small"
												style={{ color: 'rgba(255,255,255,0.75)' }}
											>
												{customSurvey?.description ||
													'Pendapat Anda sangat berharga bagi kami'}
											</p>
										</div>
									</div>
								</div>

								<Card.Body className="p-4">
									{error && (
										<Alert variant="danger" className="rounded-3 mb-4">
											{error}
										</Alert>
									)}

									{isPreviewOnly && (
										<Alert variant="info" className="border-0 shadow-sm rounded-3 mb-4 p-3 d-flex align-items-start gap-2 bg-info-subtle text-info-emphasis">
											<Sparkles size={20} className="text-info flex-shrink-0 mt-0.5" />
											<div className="small">
												<strong>Mode Pratinjau Penyelenggara</strong>
												<br />
												Anda adalah pembuat event ini. Anda dapat menguji formulir survei tetapi tidak dapat mengirimkan jawaban.
											</div>
										</Alert>
									)}

									{/* === CUSTOM DYNAMIC FORM === */}
									{customSurvey ? (
										<Form onSubmit={handleSubmitCustomSurvey}>
											<div className="d-flex flex-column gap-4">
												{customSurvey.questions.map((q, idx) => (
													<Form.Group key={q.id}>
														<Form.Label className="fw-semibold text-dark mb-1">
															{idx + 1}. {q.label}
															{q.is_required && (
																<span className="text-danger ms-1">
																	*
																</span>
															)}
														</Form.Label>

														{/* Rating */}
														{q.type === 'rating' && (
															<div className="d-flex gap-2 align-items-center mt-2 flex-wrap">
																{[1, 2, 3, 4, 5].map((s) => (
																	<Star
																		key={s}
																		size={30}
																		fill={
																			parseInt(
																				answers[q.id] || 0,
																			) >= s
																				? '#ffc107'
																				: 'none'
																		}
																		color={
																			parseInt(
																				answers[q.id] || 0,
																			) >= s
																				? '#ffc107'
																				: '#ced4da'
																		}
																		style={{
																			cursor: 'pointer',
																			transition: 'all 0.15s',
																		}}
																		onClick={() =>
																			setAnswers({
																				...answers,
																				[q.id]: s.toString(),
																			})
																		}
																	/>
																))}
																{answers[q.id] && (
																	<Badge
																		bg="warning-subtle"
																		text="warning"
																		className="ms-1 px-2 py-1 fw-semibold rounded"
																	>
																		{getRatingText(
																			parseInt(answers[q.id]),
																		)}
																	</Badge>
																)}
															</div>
														)}

														{/* Text */}
														{q.type === 'text' && (
															<Form.Control
																type="text"
																value={answers[q.id] || ''}
																onChange={(e) =>
																	setAnswers({
																		...answers,
																		[q.id]: e.target.value,
																	})
																}
																placeholder="Tulis jawaban Anda..."
																className="rounded-3 mt-2"
																required={q.is_required}
															/>
														)}

														{/* Textarea */}
														{q.type === 'textarea' && (
															<Form.Control
																as="textarea"
																rows={3}
																value={answers[q.id] || ''}
																onChange={(e) =>
																	setAnswers({
																		...answers,
																		[q.id]: e.target.value,
																	})
																}
																placeholder="Tulis jawaban Anda..."
																className="rounded-3 mt-2"
																style={{
																	resize: 'none',
																	fontSize: '14px',
																}}
																required={q.is_required}
															/>
														)}

														{/* Radio */}
														{q.type === 'radio' && (
															<div className="mt-2 d-flex flex-column gap-2">
																{(q.options || []).map((opt, i) => (
																	<Form.Check
																		key={i}
																		type="radio"
																		id={`q${q.id}_opt${i}`}
																		name={`q${q.id}`}
																		label={opt}
																		value={opt}
																		checked={
																			answers[q.id] === opt
																		}
																		onChange={() =>
																			setAnswers({
																				...answers,
																				[q.id]: opt,
																			})
																		}
																		className="small"
																	/>
																))}
															</div>
														)}

														{/* Checkbox */}
														{q.type === 'checkbox' && (
															<div className="mt-2 d-flex flex-column gap-2">
																{(q.options || []).map((opt, i) => {
																	const selected = (
																		answers[q.id] || ''
																	)
																		.split(',')
																		.map((v) => v.trim())
																		.filter(Boolean);
																	return (
																		<Form.Check
																			key={i}
																			type="checkbox"
																			id={`q${q.id}_cb${i}`}
																			label={opt}
																			checked={selected.includes(
																				opt,
																			)}
																			onChange={(e) => {
																				const curr =
																					selected;
																				const updated = e
																					.target.checked
																					? [...curr, opt]
																					: curr.filter(
																						(v) =>
																							v !==
																							opt,
																					);
																				setAnswers({
																					...answers,
																					[q.id]: updated.join(
																						', ',
																					),
																				});
																			}}
																			className="small"
																		/>
																	);
																})}
															</div>
														)}
													</Form.Group>
												))}
											</div>

											<Button
												type="submit"
												className={`w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm mt-4 ${
													isPreviewOnly ? 'opacity-75' : ''
												}`}
												style={{
													background: isPreviewOnly
														? 'linear-gradient(135deg, #6c757d, #adb5bd)'
														: 'linear-gradient(135deg,#3b82f6,#7c3aed)',
													border: 'none',
												}}
												disabled={submitting || isPreviewOnly}
											>
												{isPreviewOnly ? (
													<>
														<Lock size={16} /> Hanya Pratinjau
													</>
												) : submitting ? (
													<>
														<Spinner animation="border" size="sm" />{' '}
														Mengirim...
													</>
												) : (
													<>
														<Sparkles size={16} /> Kirim & Buka
														Sertifikat
													</>
												)}
											</Button>
										</Form>
									) : (
										/* === LEGACY FIXED FORM (no custom survey) === */
										<Form onSubmit={handleSubmitLegacySurvey}>
											<Form.Group className="mb-4">
												<Form.Label className="fw-bold text-dark mb-1">
													1. Kepuasan Acara Keseluruhan{' '}
													<span className="text-danger">*</span>
												</Form.Label>
												<div className="d-flex gap-2 mt-2 flex-wrap">
													{[1, 2, 3, 4, 5].map((s) => (
														<Star
															key={s}
															size={32}
															onClick={() => setRating(s)}
															onMouseEnter={() => setRatingHover(s)}
															onMouseLeave={() => setRatingHover(0)}
															fill={
																(ratingHover || rating) >= s
																	? '#ffc107'
																	: 'none'
															}
															color={
																(ratingHover || rating) >= s
																	? '#ffc107'
																	: '#ced4da'
															}
															style={{
																cursor: 'pointer',
																transition: 'all 0.15s ease',
															}}
														/>
													))}
													{rating > 0 && (
														<Badge
															bg="warning-subtle"
															text="warning"
															className="ms-1 px-2 py-1 rounded fw-semibold"
														>
															{getRatingText(rating)}
														</Badge>
													)}
												</div>
											</Form.Group>

											<Form.Group className="mb-4">
												<Form.Label className="fw-bold text-dark mb-1">
													2. Kualitas Pembicara (Opsional)
												</Form.Label>
												<div className="d-flex gap-2 mt-2 flex-wrap">
													{[1, 2, 3, 4, 5].map((s) => (
														<Star
															key={s}
															size={26}
															onClick={() =>
																setSpeakerRating(
																	speakerRating === s ? 0 : s,
																)
															}
															onMouseEnter={() => setSpeakerHover(s)}
															onMouseLeave={() => setSpeakerHover(0)}
															fill={
																(speakerHover || speakerRating) >= s
																	? '#f59e0b'
																	: 'none'
															}
															color={
																(speakerHover || speakerRating) >= s
																	? '#f59e0b'
																	: '#ced4da'
															}
															style={{
																cursor: 'pointer',
																transition: 'all 0.15s ease',
															}}
														/>
													))}
												</div>
											</Form.Group>

											<Form.Group className="mb-4">
												<Form.Label className="fw-bold text-dark mb-1">
													3. Relevansi Materi (Opsional)
												</Form.Label>
												<div className="d-flex gap-2 mt-2 flex-wrap">
													{[1, 2, 3, 4, 5].map((s) => (
														<Star
															key={s}
															size={26}
															onClick={() =>
																setMaterialRating(
																	materialRating === s ? 0 : s,
																)
															}
															onMouseEnter={() => setMaterialHover(s)}
															onMouseLeave={() => setMaterialHover(0)}
															fill={
																(materialHover || materialRating) >=
																	s
																	? '#f59e0b'
																	: 'none'
															}
															color={
																(materialHover || materialRating) >=
																	s
																	? '#f59e0b'
																	: '#ced4da'
															}
															style={{
																cursor: 'pointer',
																transition: 'all 0.15s ease',
															}}
														/>
													))}
												</div>
											</Form.Group>

											<Form.Group className="mb-4">
												<Form.Label className="fw-bold text-dark mb-1">
													4. Kritik & Saran (Opsional)
												</Form.Label>
												<Form.Control
													as="textarea"
													rows={4}
													value={comments}
													onChange={(e) => setComments(e.target.value)}
													placeholder="Bagikan pengalaman Anda..."
													className="rounded-3"
													style={{ fontSize: '14px', resize: 'none' }}
												/>
											</Form.Group>

											<Button
												type="submit"
												className={`w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm ${
													isPreviewOnly ? 'opacity-75' : ''
												}`}
												style={{
													background: isPreviewOnly
														? 'linear-gradient(135deg, #6c757d, #adb5bd)'
														: 'linear-gradient(135deg,#3b82f6,#7c3aed)',
													border: 'none',
												}}
												disabled={submitting || isPreviewOnly}
											>
												{isPreviewOnly ? (
													<>
														<Lock size={16} /> Hanya Pratinjau
													</>
												) : submitting ? (
													<>
														<Spinner animation="border" size="sm" />{' '}
														Mengirim...
													</>
												) : (
													<>
														<Sparkles size={16} /> Kirim & Buka
														Sertifikat
													</>
												)}
											</Button>
										</Form>
									)}
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
