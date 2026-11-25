import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Award,
	CheckCircle,
	Sparkles,
	ArrowRight,
	Share2,
	Download,
	ExternalLink,
	ShieldCheck,
	ChevronLeft,
	Zap,
	Clock,
	Brain,
	Check,
	Copy,
	GraduationCap,
	BookOpen,
	RotateCcw,
	Sliders,
} from 'lucide-react';
import { getModuleData } from '@/pages/lms/mock-data/mockData';
import { getLearningPath } from '@/pages/lms/mock-data/learningPathData';

const ModuleCompletionPage = () => {
	const { moduleId = 'mod-arch-101' } = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	// Ambil data modul & learning path
	const moduleData = getModuleData(moduleId);
	const pathId = moduleData.learningPathId || 'lp-1';
	const learningPath = getLearningPath(pathId);

	// State hasil quiz / refleksi (fallback jika navigasi langsung)
	const resultState = location.state || {};
	const finalScore = resultState.score || 92;
	const earnedXp = moduleData.xpReward || 150;
	const durationStr = resultState.duration || '32m 45s';
	const readinessLevel = resultState.readiness || 'SIAP';

	// Switcher untuk menguji kondisi:
	// A: Masih ada modul berikutnya (misal Modul 2 dari 6 selesai)
	// B: Semua modul dalam kurikulum telah selesai (100% COMPLETE -> DAPAT SERTIFIKAT!)
	const [isAllCompleted, setIsAllCompleted] = useState(() => {
		// Default jika ini modul terakhir atau diset via state
		if (location.state?.isAllCompleted !== undefined) {
			return location.state.isAllCompleted;
		}
		// Cek apakah modul ini adalah modul terakhir di learning path
		const totalModules = learningPath?.modules?.length || 3;
		const currentModuleIdx = learningPath?.modules?.findIndex(
			(m) => m.id === moduleId || m.number === 3,
		);
		return currentModuleIdx === totalModules - 1;
	});

	const [copied, setCopied] = useState(false);
	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [downloadSuccess, setDownloadSuccess] = useState(false);

	const badgeInfo = moduleData.badgeEarned || {
		title: 'API Architect Apprentice',
		description: 'Menyelesaikan modul Web Application Architecture & REST API Design dengan predikat sangat baik.',
	};

	const credentialId = `KX-BDG-2026-${String(moduleId).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)}`;
	const earnedDate = new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(new Date());

	const handleCopyShareLink = () => {
		const shareUrl = `${window.location.origin}/learner/modules/${moduleId}/completed`;
		navigator.clipboard.writeText(shareUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2500);
	};

	const handleDownloadBadge = () => {
		setDownloadSuccess(true);
		setTimeout(() => setDownloadSuccess(false), 3000);
	};

	// Cari info modul berikutnya jika ada
	const currentModIdx = learningPath?.modules?.findIndex(
		(m) => m.id === moduleId || m.number === 3,
	);
	const nextModule =
		currentModIdx >= 0 && currentModIdx < (learningPath?.modules?.length || 0) - 1
			? learningPath.modules[currentModIdx + 1]
			: null;

	return (
		<div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 100 }}>
			{/* Top Navbar Bar */}
			<div className="bg-white border-bottom py-3 mb-4 shadow-2xs">
				<Container>
					<div className="d-flex align-items-center justify-content-between">
						<div className="d-flex align-items-center gap-3">
							<Button
								variant="light"
								className="rounded-circle p-2 border"
								onClick={() => navigate(`/learner/modules/${moduleId}`)}
							>
								<ChevronLeft size={20} />
							</Button>
							<div>
								<div className="d-flex align-items-center gap-2">
									<span className="badge bg-success-subtle text-success px-2 py-1 rounded-pill small fw-semibold">
										Modul Selesai ✓
									</span>
									<span className="text-muted small">• {learningPath.title}</span>
								</div>
								<h1 className="h6 fw-bold mb-0 text-dark">{moduleData.title}</h1>
							</div>
						</div>

						<Button
							variant="outline-secondary"
							size="sm"
							className="rounded-pill px-3 d-none d-md-flex align-items-center gap-1.5"
							onClick={() => navigate('/learner/badges')}
						>
							<Award size={16} />
							Koleksi Lencana
						</Button>
					</div>
				</Container>
			</div>

			<Container>
				<Row className="justify-content-center">
					<Col lg={9} xl={8}>
						{/* HERO CELEBRATION HEADER */}
						<motion.div
							initial={{ opacity: 0, y: 25 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-center mb-4"
						>
							<div
								className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-3 shadow-2xs"
								style={{
									background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
									border: '1px solid #FCD34D',
									color: '#92400E',
									fontSize: '0.85rem',
									fontWeight: 700,
								}}
							>
								<Sparkles size={16} className="text-amber-600 animate-spin" />
								SELAMAT! PENCAPAIAN BARU TERBUKA
							</div>

							<h2 className="display-6 fw-extrabold text-slate-900 mb-2" style={{ fontWeight: 800 }}>
								Kamu Menyelesaikan Modul Ini! 🎉
							</h2>
							<p className="text-muted mx-auto" style={{ maxWidth: 580, fontSize: '0.98rem' }}>
								Kerja luar biasa! Kamu telah menuntaskan seluruh materi, latihan refleksi SRL, dan evaluasi sumatif dengan hasil yang membanggakan.
							</p>
						</motion.div>

						{/* BADGE SHOWCASE CARD (GOLDEN GLOW) */}
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.15 }}
						>
							<Card
								className="border-0 shadow-lg rounded-4 overflow-hidden mb-4"
								style={{
									background: 'radial-gradient(ellipse at top, #1E293B 0%, #0F172A 100%)',
									color: '#FFF',
									position: 'relative',
								}}
							>
								{/* Background Ambient Glow */}
								<div
									style={{
										position: 'absolute',
										top: '-20%',
										left: '50%',
										transform: 'translateX(-50%)',
										width: 320,
										height: 280,
										background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0) 70%)',
										filter: 'blur(35px)',
										pointerEvents: 'none',
									}}
								/>

								<Card.Body className="p-4 p-md-5 text-center position-relative">
									<div className="d-flex justify-content-between align-items-center mb-3">
										<span className="badge rounded-pill px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
											VERIFIED MICRO-CREDENTIAL
										</span>
										<span className="font-monospace text-warning small opacity-90">
											ID: {credentialId}
										</span>
									</div>

									{/* 3D BADGE MEDALLION WITH ROTATING AURA */}
									<div className="my-4 position-relative d-inline-block">
										<motion.div
											animate={{ rotate: 360 }}
											transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
											style={{
												position: 'absolute',
												inset: -16,
												borderRadius: '50%',
												border: '2px dashed rgba(245, 158, 11, 0.45)',
											}}
										/>
										<div
											className="rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-2xl"
											style={{
												width: 130,
												height: 130,
												background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
												border: '5px solid #FEF3C7',
												boxShadow: '0 0 45px rgba(245, 158, 11, 0.55), inset 0 2px 10px rgba(255,255,255,0.4)',
											}}
										>
											<Award size={64} className="text-white drop-shadow-md" />
										</div>

										<div
											style={{
												position: 'absolute',
												bottom: -4,
												right: -4,
												background: '#10B981',
												color: '#FFF',
												borderRadius: '50%',
												padding: 6,
												border: '3px solid #0F172A',
											}}
										>
											<CheckCircle size={18} />
										</div>
									</div>

									<h3 className="fw-bold text-white mb-2" style={{ fontSize: '1.65rem' }}>
										{badgeInfo.title}
									</h3>
									<p
										className="text-slate-300 mx-auto mb-4"
										style={{ maxWidth: 520, fontSize: '0.92rem', lineHeight: 1.6 }}
									>
										{badgeInfo.description}
									</p>

									<div className="d-flex flex-wrap align-items-center justify-content-center gap-2 mb-4">
										<span className="badge px-3 py-2 rounded-pill" style={{ background: 'rgba(255,255,255,0.08)', color: '#CBD5E1', fontSize: '0.78rem' }}>
											🗓️ Diperoleh: {earnedDate}
										</span>
										<span className="badge px-3 py-2 rounded-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FCD34D', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.78rem' }}>
											⚡ +{earnedXp} XP Points
										</span>
										<span className="badge px-3 py-2 rounded-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6EE7B7', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.78rem' }}>
											🛡️ Smart Contract Secured
										</span>
									</div>

									{/* ACTION BUTTONS UNTUK BADGE */}
									<div className="d-flex flex-wrap align-items-center justify-content-center gap-2 pt-2 border-top border-slate-800">
										<Button
											variant="warning"
											className="fw-bold px-4 py-2 rounded-pill d-inline-flex align-items-center gap-2 shadow-sm text-slate-900"
											onClick={handleDownloadBadge}
										>
											<Download size={16} />
											{downloadSuccess ? 'Lencana Disimpan! ✓' : 'Unduh Kartu Badge'}
										</Button>

										<Button
											variant="outline-light"
											className="px-4 py-2 rounded-pill d-inline-flex align-items-center gap-2"
											onClick={() => setShareModalOpen(true)}
										>
											<Share2 size={16} />
											Bagikan Pencapaian
										</Button>

										<Button
											variant="link"
											className="text-slate-400 text-decoration-none px-3"
											onClick={() => navigate('/learner/badges')}
										>
											Lihat Semua Badge ➔
										</Button>
									</div>
								</Card.Body>
							</Card>
						</motion.div>

						{/* SUMMARY STATS GRID */}
						<Row className="g-3 mb-4">
							<Col xs={6} md={3}>
								<div className="bg-white p-3 rounded-4 border shadow-2xs text-center h-100">
									<div className="text-muted small mb-1 fw-semibold">Skor Kuis Akhir</div>
									<div className="h4 fw-bold text-slate-900 mb-0">{finalScore}%</div>
									<span className="text-success small fw-semibold">Lulus Memuaskan</span>
								</div>
							</Col>
							<Col xs={6} md={3}>
								<div className="bg-white p-3 rounded-4 border shadow-2xs text-center h-100">
									<div className="text-muted small mb-1 fw-semibold">Poin Pengalaman</div>
									<div className="h4 fw-bold text-amber-600 mb-0">+{earnedXp} XP</div>
									<span className="text-muted small">Level Up Progress</span>
								</div>
							</Col>
							<Col xs={6} md={3}>
								<div className="bg-white p-3 rounded-4 border shadow-2xs text-center h-100">
									<div className="text-muted small mb-1 fw-semibold">Durasi Belajar</div>
									<div className="h4 fw-bold text-slate-900 mb-0">{durationStr}</div>
									<span className="text-muted small">Fokus Efektif</span>
								</div>
							</Col>
							<Col xs={6} md={3}>
								<div className="bg-white p-3 rounded-4 border shadow-2xs text-center h-100">
									<div className="text-muted small mb-1 fw-semibold">SRL Readiness</div>
									<div className="h4 fw-bold text-emerald-600 mb-0">{readinessLevel}</div>
									<span className="text-success small fw-semibold">Metakognisi Siap</span>
								</div>
							</Col>
						</Row>

						{/* ================================================================= */}
						{/* KONDISI A: JIKA SEMUA MODUL SELESAI -> DAPAT SERTIFIKAT!         */}
						{/* ================================================================= */}
						{isAllCompleted ? (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
								className="mb-4"
							>
								<Card
									className="border-0 shadow-lg rounded-4 overflow-hidden position-relative"
									style={{
										background: 'linear-gradient(135deg, #0B2545 0%, #134E5E 50%, #1E3A8A 100%)',
										color: '#FFF',
										border: '2px solid #F59E0B',
									}}
								>
									{/* Decorative Ribbon Seal */}
									<div
										style={{
											position: 'absolute',
											right: 24,
											top: 0,
											background: '#F59E0B',
											color: '#0F172A',
											padding: '8px 16px',
											borderBottomLeftRadius: 12,
											borderBottomRightRadius: 12,
											fontWeight: 800,
											fontSize: '0.78rem',
											letterSpacing: '0.05em',
											boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
										}}
									>
										🎓 SERTIFIKAT SIAP DIKLAIM
									</div>

									<Card.Body className="p-4 p-md-5">
										<Row className="align-items-center g-4">
											<Col md={8}>
												<div className="d-flex align-items-center gap-2 mb-2">
													<span className="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold small">
														KURIKULUM TUNTAS 100%
													</span>
													<span className="text-cyan-200 small">
														Semua modul berhasil diselesaikan
													</span>
												</div>
												<h3 className="fw-bold text-white mb-2" style={{ fontSize: '1.5rem' }}>
													Selamat! Kamu Resmi Lulus dari {learningPath.title}
												</h3>
												<p className="text-cyan-100 small mb-4 leading-relaxed" style={{ maxWidth: 520 }}>
													Seluruh unit materi, checkpoint refleksi, dan evaluasi sumatif telah kamu selesaikan dengan predikat membanggakan. Sertifikat kelulusan resmi dengan verifikasi Smart Contract telah diterbitkan atas namamu.
												</p>

												<div className="d-flex flex-wrap align-items-center gap-3">
													<Button
														variant="warning"
														size="lg"
														className="fw-extrabold px-4 py-2.5 rounded-pill shadow-lg d-inline-flex align-items-center gap-2 text-slate-950"
														onClick={() =>
															navigate(`/learner/learning-paths/${pathId}/certificate`)
														}
													>
														<GraduationCap size={20} />
														Buka & Klaim Sertifikat Kelulusan
													</Button>

													<Button
														variant="outline-light"
														className="px-4 py-2.5 rounded-pill"
														onClick={() => navigate('/learning')}
													>
														Ke Dashboard Belajar
													</Button>
												</div>
											</Col>

											<Col md={4} className="text-center">
												<div
													className="bg-white/10 backdrop-blur-md p-4 rounded-3 border border-white/20 text-center mx-auto shadow-inner"
													style={{ maxWidth: 220 }}
												>
													<div className="mx-auto rounded-circle bg-amber-400 text-slate-900 p-3 d-inline-flex mb-3 shadow-md">
														<GraduationCap size={36} />
													</div>
													<div className="fw-bold text-white small">CERTIFICATE OF COMPLETION</div>
													<div className="text-cyan-200 font-monospace text-xs mt-1">
														KampusX Institute
													</div>
													<div className="badge bg-emerald-500 text-white mt-2 px-2.5 py-1 text-xs">
														Siap Diunduh PDF
													</div>
												</div>
											</Col>
										</Row>
									</Card.Body>
								</Card>
							</motion.div>
						) : (
							/* ================================================================= */
							/* KONDISI B: MASIH ADA MODUL SELANJUTNYA                            */
							/* ================================================================= */
							<Card className="border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
								<div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
									<div>
										<span className="text-primary text-uppercase fw-bold small">
											Langkah Selanjutnya di Kurikulum
										</span>
										<h4 className="h6 fw-bold text-dark mb-0">
											Lanjutkan ke Modul Berikutnya
										</h4>
									</div>
									<span className="badge bg-light text-muted border px-3 py-1.5 rounded-pill small">
										Modul {currentModIdx + 1} dari {learningPath?.modules?.length || 6}
									</span>
								</div>

								{nextModule ? (
									<div
										className="p-3 rounded-3 border d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3"
										style={{ background: '#F8FAFC' }}
									>
										<div className="d-flex align-items-center gap-3">
											<div
												className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
												style={{
													width: 44,
													height: 44,
													background: '#E0F2FE',
													color: '#0284C7',
													fontWeight: 800,
												}}
											>
												{nextModule.number || currentModIdx + 2}
											</div>
											<div>
												<h5 className="h6 fw-bold text-dark mb-1">{nextModule.title}</h5>
												<p className="text-muted small mb-0 line-clamp-1">
													{nextModule.description}
												</p>
												<span className="text-muted small">
													⏱️ Estimasi {nextModule.duration || '50 Menit'} • {nextModule.lessonCount || 4} Lessons
												</span>
											</div>
										</div>

										<Button
											variant="primary"
											className="px-4 py-2 rounded-pill fw-semibold text-nowrap d-inline-flex align-items-center gap-2 align-self-start align-self-md-center"
											onClick={() =>
												navigate(`/learner/modules/${nextModule.id || 'mod-2'}`)
											}
										>
											<span>Mulai Modul Ini</span>
											<ArrowRight size={16} />
										</Button>
									</div>
								) : null}

								<div className="d-flex align-items-center justify-content-between pt-2 border-top text-muted small">
									<span>
										Selesaikan seluruh kurikulum untuk membuka <strong>Sertifikat Resmi KampusX</strong>.
									</span>
									<Button
										variant="link"
										className="p-0 text-decoration-none fw-semibold text-primary"
										onClick={() => navigate(`/learner/learning-paths/${pathId}`)}
									>
										Lihat Roadmap Kurikulum ➔
									</Button>
								</div>
							</Card>
						)}

						{/* BOTTOM ACTION BUTTONS */}
						<div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4">
							<Button
								variant="outline-secondary"
								className="rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
								onClick={() => navigate(`/learner/learning-paths/${pathId}`)}
							>
								<BookOpen size={16} />
								Kembali ke Roadmap Learning Path
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
					</Col>
				</Row>
			</Container>

			{/* ================================================================= */}
			{/* MODAL BAGIKAN PENCAPAIAN KE SOSMED & LINK                         */}
			{/* ================================================================= */}
			<Modal show={shareModalOpen} onHide={() => setShareModalOpen(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title className="h6 fw-bold">
						Bagikan Lencana & Prestasi Belajar
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="p-4">
					<div className="text-center mb-4">
						<div
							className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-2"
							style={{ background: '#FEF3C7', color: '#D97706' }}
						>
							<Award size={36} />
						</div>
						<h5 className="fw-bold mb-1">{badgeInfo.title}</h5>
						<p className="text-muted small mb-0">
							Verifikasi Kredensial Digital KampusX • ID: {credentialId}
						</p>
					</div>

					<div className="mb-3">
						<label className="form-label small fw-bold text-dark">
							Salin Link Bukti Pencapaian:
						</label>
						<div className="input-group">
							<input
								type="text"
								readOnly
								className="form-control font-monospace small"
								value={`${window.location.origin}/learner/modules/${moduleId}/completed`}
							/>
							<Button
								variant={copied ? 'success' : 'primary'}
								onClick={handleCopyShareLink}
								className="d-inline-flex align-items-center gap-1.5"
							>
								{copied ? <Check size={16} /> : <Copy size={16} />}
								{copied ? 'Tersalin!' : 'Salin'}
							</Button>
						</div>
					</div>

					<div className="pt-2">
						<div className="text-muted small mb-2 text-center">Atau bagikan langsung ke:</div>
						<div className="d-flex justify-content-center gap-2">
							<Button
								variant="outline-primary"
								size="sm"
								className="rounded-pill px-3"
								onClick={() => {
									const text = encodeURIComponent(
										`Saya baru saja menyelesaikan modul ${moduleData.title} dan mendapatkan lencana "${badgeInfo.title}" di KampusX! 🎓✨`,
									);
									window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
								}}
							>
								Twitter / X
							</Button>
							<Button
								variant="outline-primary"
								size="sm"
								className="rounded-pill px-3"
								onClick={() => {
									const url = encodeURIComponent(
										`${window.location.origin}/learner/modules/${moduleId}/completed`,
									);
									window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
								}}
							>
								LinkedIn
							</Button>
							<Button
								variant="outline-success"
								size="sm"
								className="rounded-pill px-3"
								onClick={() => {
									const text = encodeURIComponent(
										`Halo! Saya baru saja menyelesaikan modul ${moduleData.title} di KampusX. Cek lencana saya: ${window.location.origin}/learner/modules/${moduleId}/completed`,
									);
									window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
								}}
							>
								WhatsApp
							</Button>
						</div>
					</div>
				</Modal.Body>
			</Modal>

			{/* ================================================================= */}
			{/* FLOATING ACTION SWITCHER UNTUK PENGUJIAN DEMO                     */}
			{/* ================================================================= */}
			<div
				style={{
					position: 'fixed',
					bottom: 24,
					left: 24,
					zIndex: 1000,
					background: '#0F172A',
					color: '#FFF',
					padding: '12px 16px',
					borderRadius: '12px',
					boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.35)',
				}}
			>
				<div className="d-flex align-items-center gap-2 mb-2">
					<Sliders size={16} />
					<span className="fw-bold small">Demo Status Switcher</span>
				</div>
				<div className="btn-group btn-group-sm" role="group">
					<button
						type="button"
						className={`btn ${!isAllCompleted ? 'btn-primary' : 'btn-outline-light'}`}
						onClick={() => setIsAllCompleted(false)}
					>
						Modul Biasa (Belum Semua)
					</button>
					<button
						type="button"
						className={`btn ${isAllCompleted ? 'btn-warning text-dark fw-bold' : 'btn-outline-light'}`}
						onClick={() => setIsAllCompleted(true)}
					>
						Semua Modul Selesai (Dapat Sertifikat) 🎓
					</button>
				</div>
			</div>
		</div>
	);
};

export default ModuleCompletionPage;
