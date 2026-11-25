import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Container, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
	ChevronLeft,
	GraduationCap,
	Award,
	ArrowRight,
	CheckCircle,
	Share2,
	Check,
	Copy,
	BookOpen,
} from 'lucide-react';
import api from '@/api/axios';
import ResultCard from './modules/reflection/ResultCard';
import LessonReview from './modules/reflection/LessonReview';
import Rekomendasi from './modules/reflection/Rekomendasi';

const ReflectionPage = () => {
	const { slug, moduleId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();

	const attemptId =
		location.state?.attemptId ||
		location.state?.result?.id ||
		searchParams.get('attempt_id') ||
		null;

	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Badge & sertifikat
	const [badge, setBadge] = useState(null);
	const [isAllCompleted, setIsAllCompleted] = useState(false);
	const [sharePanelOpen, setSharePanelOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const awardRequestedRef = useRef(false);
	const certificateRef = useRef(null);

	const baseModulePath = `/learner/learning-paths/${slug}/modules/${moduleId}`;
	const learningPathPath = `/learner/learning-paths/${slug}`;
	const certificatePath = `/learner/learning-paths/${slug}/certificate`;

	// ---------------- Fetch hasil refleksi ----------------
	const fetchReflection = useCallback(async () => {
		if (!moduleId) return;
		setLoading(true);
		setError(null);

		try {
			const response = await api.get(`/lms/member/modules/${moduleId}/reflection`, {
				params: attemptId ? { attempt_id: attemptId } : {},
			});
			setData(response.data?.data || null);
		} catch (err) {
			setError(
				err?.response?.data?.message ||
					'Belum ada hasil kuis yang tersedia untuk modul ini.',
			);
		} finally {
			setLoading(false);
		}
	}, [moduleId, attemptId]);

	useEffect(() => {
		fetchReflection();
	}, [fetchReflection]);

	// ---------------- Derived ----------------
	const moduleTitle =
		data?.moduleTitle || location.state?.moduleTitle || 'Evaluasi & Refleksi Modul';
	const currentOutcome = data?.outcome || null;
	const remedialLessons = Array.isArray(data?.remedialLessons) ? data.remedialLessons : [];
	const recommendations = Array.isArray(data?.recommendations) ? data.recommendations : [];
	const nextModule = data?.nextModule || null;
	const totalModules = data?.totalModules || 0;
	const moduleNumber = data?.moduleNumber || 0;

	const hasPassed =
		!!currentOutcome &&
		(currentOutcome.isPassed ?? currentOutcome.score >= currentOutcome.passingScore);

	// ---------------- Award badge otomatis saat lulus ----------------
	useEffect(() => {
		if (!hasPassed || !currentOutcome || awardRequestedRef.current) return;
		awardRequestedRef.current = true;

		const awardBadge = async () => {
			try {
				const res = await api.post(`/lms/member/modules/${moduleId}/badges/award`, {
					score: currentOutcome.score,
				});
				const resData = res.data?.data;

				if (resData?.badge) {
					setBadge({
						title: resData.badge.name || 'Lencana Modul',
						description:
							resData.badge.description ||
							`Menyelesaikan modul ${moduleTitle} dengan baik.`,
						credentialId: resData.badge.credentialId || null,
						newlyAwarded: !!resData.newlyAwarded,
					});
				}
				if (resData?.isAllCompleted) setIsAllCompleted(true);
			} catch (err) {
				console.log('Badge award error:', err?.message);
			}
		};

		awardBadge();
	}, [hasPassed, currentOutcome, moduleId, moduleTitle]);

	const earnedDate = new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(new Date());

	const credentialId =
		badge?.credentialId ||
		`KX-BDG-${new Date().getFullYear()}-${String(moduleId).toUpperCase()}`;

	const shareUrl = `${window.location.origin}${baseModulePath}/reflection`;

	// ---------------- Handlers ----------------
	const handleBack = () => (slug && moduleId ? navigate(baseModulePath) : navigate(-1));

	const handlePrimaryAction = () => {
		if (!currentOutcome) return;

		if (!hasPassed) {
			navigate(baseModulePath);
			return;
		}
		if (isAllCompleted) {
			certificateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			return;
		}
		if (nextModule) {
			navigate(`/learner/learning-paths/${slug}/modules/${nextModule.id}`);
			return;
		}
		navigate(learningPathPath);
	};

	const handleSelectLesson = (lesson) => {
		const targetLessonId = lesson.lessonId || lesson.id;
		if (!targetLessonId) return;
		navigate(`${baseModulePath}/lessons/${targetLessonId}`);
	};

	const handleStartNextModule = () => {
		if (!nextModule) return;
		navigate(`/learner/learning-paths/${slug}/modules/${nextModule.id}`);
	};

	const handleCopyShareLink = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2500);
		} catch (err) {
			console.log('Copy failed:', err?.message);
		}
	};

	const openShare = (url) => window.open(url, '_blank', 'noopener,noreferrer');

	// ---------------- Render ----------------
	return (
		<div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 80 }}>
			{/* Top Bar */}
			<div
				className="py-3 mb-4"
				style={{
					background: 'var(--card)',
					borderBottom: '1px solid var(--color-border)',
				}}
			>
				<Container>
					<div className="d-flex align-items-center justify-content-between">
						<div className="d-flex align-items-center gap-3">
							<Button
								variant="light"
								className="rounded-circle p-2 border"
								onClick={handleBack}
							>
								<ChevronLeft size={20} />
							</Button>
							<div>
								<span className="fs-5 d-block" style={{ color: 'var(--muted)' }}>
									Hasil Refleksi & Evaluasi
								</span>
								<h1 className="fs-2 fw-bold mb-0" style={{ color: 'var(--text)' }}>
									{moduleTitle}
								</h1>
							</div>
						</div>

						{hasPassed && (
							<Button
								variant="outline-primary"
								size="sm"
								className="rounded-pill px-3 d-none d-md-inline-flex align-items-center gap-2"
								onClick={() => navigate('/learner/badges')}
							>
								<Award size={16} />
								Koleksi Lencana
							</Button>
						)}
					</div>
				</Container>
			</div>

			<Container style={{ paddingTop: 16 }}>
				<Row className="justify-content-center">
					<Col lg={10}>
						{loading ? (
							<Card
								className="text-center p-5 border-0"
								style={{ borderRadius: 'var(--radius-xl)' }}
							>
								<div className="d-flex flex-column align-items-center gap-3">
									<Spinner animation="border" variant="primary" />
									<span className="fs-4" style={{ color: 'var(--muted)' }}>
										Memuat hasil evaluasi & refleksi kuis...
									</span>
								</div>
							</Card>
						) : error || !currentOutcome ? (
							<Card
								className="text-center p-5 border-0"
								style={{ borderRadius: 'var(--radius-xl)' }}
							>
								<h5 className="fw-bold mb-2" style={{ color: 'var(--text)' }}>
									Data Evaluasi Belum Tersedia
								</h5>
								<p className="fs-4 mb-4" style={{ color: 'var(--muted)' }}>
									{error ||
										'Selesaikan kuis pada modul ini terlebih dahulu untuk melihat hasil refleksi dan rekomendasi belajarmu.'}
								</p>
								<div className="d-flex justify-content-center gap-2">
									<Button
										variant="primary"
										onClick={() => navigate(`${baseModulePath}/quiz`)}
									>
										Mulai Kuis Modul
									</Button>
								</div>
							</Card>
						) : (
							<>
								{/* 1. Hasil Kuis */}
								<ResultCard
									currentOutcome={currentOutcome}
									onAction={handlePrimaryAction}
								/>

								{/* 2. Badge yang didapat (inline) */}
								{hasPassed && badge && (
									<motion.div
										initial={{ opacity: 0, y: 16 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.45 }}
									>
										<Card
											className="mb-4"
											style={{
												borderRadius: 'var(--radius-xl)',
												background:
													'linear-gradient(135deg, var(--bahama-blue-50) 0%, var(--primary-light) 100%)',
												border: '1px solid var(--primary-border)',
												overflow: 'hidden',
											}}
										>
											<Card.Body className="p-4">
												<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
													<span
														className="fs-5 fw-bold px-3 py-2"
														style={{
															background: badge.newlyAwarded
																? 'var(--success-bg)'
																: 'var(--info-bg)',
															color: badge.newlyAwarded
																? 'var(--success-text)'
																: 'var(--info-text)',
															border: `1px solid ${
																badge.newlyAwarded
																	? 'var(--success-border-color)'
																	: 'var(--info-border-color)'
															}`,
															borderRadius: 'var(--radius-full)',
															letterSpacing: '0.05em',
														}}
													>
														{badge.newlyAwarded
															? '✨ LENCANA BARU DIDAPAT'
															: '🏅 LENCANA MODUL INI'}
													</span>
													<span
														className="font-monospace fs-5"
														style={{ color: 'var(--muted)' }}
													>
														ID: {credentialId}
													</span>
												</div>

												<div className="d-flex flex-column flex-md-row align-items-center gap-4">
													<div className="position-relative flex-shrink-0">
														<motion.div
															animate={{ rotate: 360 }}
															transition={{
																repeat: Infinity,
																duration: 25,
																ease: 'linear',
															}}
															style={{
																position: 'absolute',
																inset: -12,
																borderRadius: '50%',
																border: '2px dashed var(--bahama-blue-300)',
															}}
														/>
														<div
															className="rounded-circle d-flex align-items-center justify-content-center"
															style={{
																width: 110,
																height: 110,
																background:
																	'linear-gradient(135deg, var(--bahama-blue-400) 0%, var(--bahama-blue-600) 60%, var(--bahama-blue-800) 100%)',
																border: '4px solid var(--card)',
																boxShadow:
																	'0 8px 24px rgba(0, 105, 158, 0.3)',
															}}
														>
															<Award size={54} color="#fff" />
														</div>
														<div
															style={{
																position: 'absolute',
																bottom: -2,
																right: -2,
																background: 'var(--success-text)',
																color: '#fff',
																borderRadius: '50%',
																padding: 5,
																border: '3px solid var(--card)',
															}}
														>
															<CheckCircle size={16} />
														</div>
													</div>

													<div className="text-center text-md-start flex-grow-1">
														<h3
															className="fw-bold mb-1"
															style={{
																fontSize: 'var(--font-xl)',
																color: 'var(--bahama-blue-900)',
															}}
														>
															{badge.title}
														</h3>
														<p
															className="fs-4 mb-3"
															style={{ color: 'var(--muted)' }}
														>
															{badge.description}
														</p>
														<div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2 mb-3">
															<span
																className="fs-5 px-3 py-2"
																style={{
																	background: 'var(--neutral-bg)',
																	color: 'var(--neutral-text)',
																	border: '1px solid var(--neutral-border)',
																	borderRadius:
																		'var(--radius-full)',
																}}
															>
																🗓️ {earnedDate}
															</span>
															<span
																className="fs-5 px-3 py-2"
																style={{
																	background: 'var(--info-bg)',
																	color: 'var(--info-text)',
																	border: '1px solid var(--info-border-color)',
																	borderRadius:
																		'var(--radius-full)',
																}}
															>
																🛡️ Smart Contract Secured
															</span>
														</div>
														<div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
															<Button
																variant="primary"
																size="sm"
																className="px-3 rounded-pill d-inline-flex align-items-center gap-2"
																onClick={() =>
																	navigate('/learner/badges')
																}
															>
																<Award size={15} />
																Lihat Koleksi Badge
															</Button>
															<Button
																variant="outline-primary"
																size="sm"
																className="px-3 rounded-pill d-inline-flex align-items-center gap-2"
																onClick={() =>
																	setSharePanelOpen((v) => !v)
																}
															>
																<Share2 size={15} />
																{sharePanelOpen
																	? 'Tutup'
																	: 'Bagikan'}
															</Button>
														</div>
													</div>
												</div>

												{/* Panel bagikan (inline) */}
												<AnimatePresence initial={false}>
													{sharePanelOpen && (
														<motion.div
															initial={{ height: 0, opacity: 0 }}
															animate={{ height: 'auto', opacity: 1 }}
															exit={{ height: 0, opacity: 0 }}
															transition={{ duration: 0.25 }}
															style={{ overflow: 'hidden' }}
														>
															<div
																className="mt-4 pt-3"
																style={{
																	borderTop:
																		'1px solid var(--primary-border)',
																}}
															>
																<label
																	className="fs-4 fw-bold mb-2 d-block"
																	style={{
																		color: 'var(--text)',
																	}}
																>
																	Salin Link Pencapaian
																</label>
																<div className="input-group mb-3">
																	<input
																		type="text"
																		readOnly
																		className="form-control font-monospace fs-4"
																		value={shareUrl}
																	/>
																	<Button
																		variant={
																			copied
																				? 'success'
																				: 'primary'
																		}
																		onClick={
																			handleCopyShareLink
																		}
																		className="d-inline-flex align-items-center gap-2"
																	>
																		{copied ? (
																			<Check size={16} />
																		) : (
																			<Copy size={16} />
																		)}
																		{copied
																			? 'Tersalin!'
																			: 'Salin'}
																	</Button>
																</div>

																<div
																	className="fs-4 mb-2"
																	style={{
																		color: 'var(--muted)',
																	}}
																>
																	Atau bagikan langsung ke:
																</div>
																<div className="d-flex flex-wrap gap-2">
																	<Button
																		variant="outline-primary"
																		size="sm"
																		className="rounded-pill px-3"
																		onClick={() =>
																			openShare(
																				`https://twitter.com/intent/tweet?text=${encodeURIComponent(
																					`Saya baru saja menyelesaikan modul ${moduleTitle} dan mendapatkan lencana "${badge.title}" di KampusX! 🎓✨`,
																				)}`,
																			)
																		}
																	>
																		Twitter / X
																	</Button>
																	<Button
																		variant="outline-primary"
																		size="sm"
																		className="rounded-pill px-3"
																		onClick={() =>
																			openShare(
																				`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
																			)
																		}
																	>
																		LinkedIn
																	</Button>
																	<Button
																		variant="outline-primary"
																		size="sm"
																		className="rounded-pill px-3"
																		onClick={() =>
																			openShare(
																				`https://api.whatsapp.com/send?text=${encodeURIComponent(
																					`Halo! Saya baru saja menyelesaikan modul ${moduleTitle} di KampusX. Cek lencana saya: ${shareUrl}`,
																				)}`,
																			)
																		}
																	>
																		WhatsApp
																	</Button>
																</div>
															</div>
														</motion.div>
													)}
												</AnimatePresence>
											</Card.Body>
										</Card>
									</motion.div>
								)}

								{/* 3. Sertifikat (semua modul tuntas) */}
								{hasPassed && isAllCompleted && (
									<motion.div
										ref={certificateRef}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.5 }}
										className="mb-4"
									>
										<Card
											className="border-0 overflow-hidden"
											style={{
												borderRadius: 'var(--radius-xl)',
												background:
													'linear-gradient(135deg, var(--bahama-blue-950) 0%, var(--bahama-blue-800) 60%, var(--bahama-blue-600) 100%)',
												color: '#fff',
											}}
										>
											<Card.Body className="p-4 p-md-5">
												<Row className="align-items-center g-4">
													<Col md={8}>
														<span
															className="fs-5 fw-bold px-3 py-2 d-inline-block mb-3"
															style={{
																background: 'var(--warning-bg)',
																color: 'var(--warning-heading)',
																borderRadius: 'var(--radius-full)',
																letterSpacing: '0.04em',
															}}
														>
															🎓 KURIKULUM TUNTAS 100%
														</span>
														<h3
															className="fw-bold mb-2"
															style={{ fontSize: 'var(--font-xl)' }}
														>
															Selamat! Sertifikat Kelulusanmu Siap
															Diklaim
														</h3>
														<p
															className="fs-4 mb-4"
															style={{
																color: 'var(--bahama-blue-200)',
																maxWidth: 520,
															}}
														>
															Seluruh modul telah kamu selesaikan.
															Sertifikat resmi dengan verifikasi Smart
															Contract siap dibuka dan diunduh.
														</p>
														<Button
															size="lg"
															className="fw-bold px-4 rounded-pill d-inline-flex align-items-center gap-2 border-0"
															style={{
																background: '#fff',
																color: 'var(--primary)',
															}}
															onClick={() =>
																navigate(certificatePath)
															}
														>
															<GraduationCap size={20} />
															Buka & Klaim Sertifikat
														</Button>
													</Col>
													<Col md={4} className="text-center">
														<div
															className="p-4 mx-auto"
															style={{
																maxWidth: 220,
																background: 'rgba(255,255,255,0.1)',
																border: '1px solid rgba(255,255,255,0.25)',
																borderRadius: 'var(--radius-lg)',
															}}
														>
															<div
																className="mx-auto rounded-circle d-inline-flex p-3 mb-3"
																style={{
																	background:
																		'var(--bahama-blue-100)',
																	color: 'var(--primary)',
																}}
															>
																<GraduationCap size={36} />
															</div>
															<div className="fs-4 fw-bold">
																CERTIFICATE OF COMPLETION
															</div>
															<div
																className="font-monospace fs-5 mt-1"
																style={{
																	color: 'var(--bahama-blue-200)',
																}}
															>
																KampusX Institute
															</div>
														</div>
													</Col>
												</Row>
											</Card.Body>
										</Card>
									</motion.div>
								)}

								{/* 4. Lesson Review */}
								<LessonReview
									currentOutcome={currentOutcome}
									remedialLessons={remedialLessons}
									onSelectLesson={handleSelectLesson}
								/>

								{/* 5. Rekomendasi */}
								<Rekomendasi recommendations={recommendations} />

								{/* 6. Modul berikutnya (belum semua tuntas) */}
								{hasPassed && !isAllCompleted && nextModule && (
									<Card
										className="p-4 mt-4"
										style={{
											borderRadius: 'var(--radius-xl)',
											background: 'var(--card)',
											border: '1px solid var(--color-border)',
										}}
									>
										<div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
											<div>
												<span className="text-primary text-uppercase fw-bold fs-5">
													Langkah Selanjutnya di Kurikulum
												</span>
												<h4
													className="fs-3 fw-bold mb-0"
													style={{ color: 'var(--text)' }}
												>
													Lanjutkan ke Modul Berikutnya
												</h4>
											</div>
											<span
												className="fs-5 px-3 py-2"
												style={{
													background: 'var(--neutral-bg)',
													color: 'var(--neutral-text)',
													border: '1px solid var(--neutral-border)',
													borderRadius: 'var(--radius-full)',
												}}
											>
												Modul {moduleNumber} dari {totalModules}
											</span>
										</div>

										<div
											className="p-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3"
											style={{
												background: 'var(--bahama-blue-50)',
												border: '1px solid var(--primary-border)',
												borderRadius: 'var(--radius-lg)',
											}}
										>
											<div className="d-flex align-items-center gap-3">
												<div
													className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
													style={{
														width: 44,
														height: 44,
														background: 'var(--primary-light)',
														color: 'var(--primary)',
													}}
												>
													{nextModule.number}
												</div>
												<div>
													<h5
														className="fs-3 fw-bold mb-1"
														style={{ color: 'var(--text)' }}
													>
														{nextModule.title}
													</h5>
													{nextModule.description && (
														<p
															className="fs-4 mb-1"
															style={{ color: 'var(--muted)' }}
														>
															{nextModule.description}
														</p>
													)}
													<span
														className="fs-4"
														style={{ color: 'var(--muted)' }}
													>
														⏱️ Estimasi {nextModule.duration || '-'} •{' '}
														{nextModule.lessonCount} Lessons
													</span>
												</div>
											</div>

											<Button
												variant="primary"
												className="px-4 py-2 rounded-pill fw-semibold text-nowrap d-inline-flex align-items-center gap-2 align-self-start align-self-md-center"
												onClick={handleStartNextModule}
											>
												<span>Mulai Modul Ini</span>
												<ArrowRight size={16} />
											</Button>
										</div>

										<div
											className="pt-2 fs-4"
											style={{
												color: 'var(--muted)',
												borderTop: '1px solid var(--neutral-border)',
											}}
										>
											Selesaikan seluruh kurikulum untuk membuka{' '}
											<strong>Sertifikat Resmi KampusX</strong>.
										</div>
									</Card>
								)}

								{/* 7. Footer */}
								<div
									className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4 pt-4"
									style={{ borderTop: '1px solid var(--color-border)' }}
								>
									<Button
										variant="outline-secondary"
										className="rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
										onClick={() => navigate(learningPathPath)}
									>
										<BookOpen size={16} />
										Kembali ke Learning Path
									</Button>

									<Button
										variant="primary"
										className="rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
										onClick={() => navigate('/learning')}
									>
										Ke Learning Dashboard
										<ArrowRight size={16} />
									</Button>
								</div>
							</>
						)}
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default ReflectionPage;
