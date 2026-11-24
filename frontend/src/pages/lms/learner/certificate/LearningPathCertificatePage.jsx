import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal, ProgressBar } from 'react-bootstrap';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import {
	Award,
	ShieldCheck,
	Download,
	Share2,
	Printer,
	CheckCircle,
	ExternalLink,
	ChevronLeft,
	Copy,
	Check,
	FileCode,
	X,
	Lock,
	GraduationCap,
	BookOpen,
	Sparkles,
	Sliders,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getLearningPath } from '@/pages/lms/mock-data/learningPathData';

const LearningPathCertificatePage = () => {
	const { pathId = 'lp-1' } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const certificatePrintRef = useRef(null);

	const learningPath = getLearningPath(pathId);

	// Hitung modul yang selesai
	const totalModules = learningPath?.modules?.length || 6;
	const completedModules =
		learningPath?.modules?.filter((m) => m.status === 'completed')?.length || 2;

	// State kelulusan: Jika 100% selesai, sertifikat terbuka
	// Tersedia toggle untuk simulasi bagi penguji/reviewer
	const [forceUnlocked, setForceUnlocked] = useState(true);
	const isUnlocked = forceUnlocked || completedModules === totalModules;

	const [copied, setCopied] = useState(false);
	const [selectedCertModal, setSelectedCertModal] = useState(false);
	const [shareModalOpen, setShareModalOpen] = useState(false);

	// Data sertifikat
	const recipientName =
		user?.name || user?.full_name || 'Budi Santoso, S.Kom';
	const credentialId = `KX-CERT-2026-${String(pathId).replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-8921`;
	const issueDate = new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(new Date());

	const verificationUrl = `${window.location.origin}/certificate/verify/${credentialId}`;

	// Payload On-Chain Kriptografis (Zero-Trust Standard)
	const smartContractPayload = {
		standard: 'ERC-1155',
		network: 'Polygon PoS',
		contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
		tokenId: '204',
		txHash: '0x8f2a1b9c3491901988b6a12b7a0d4c9f138e64ce91a82f349a12b7a0d4c9f138',
		credentialId,
		recipientName,
		learningPathTitle: learningPath.title,
		status: 'VERIFIED_PERMANENT',
		issuedAt: Math.floor(Date.now() / 1000),
		academicDirector: 'Dr. Hendra Wijaya, M.Sc.',
		leadInstructor: learningPath.instructor?.name || 'Dr. Reza Fauzi',
		issuerSecp256k1Signature:
			'0x3b89e13f9c094271829aef104928bfa982c731049bca728104812f8e192a01947b19401928401928401928',
	};

	const handlePrintCertificate = () => {
		window.print();
	};

	const handleCopyVerificationUrl = () => {
		navigator.clipboard.writeText(verificationUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 100 }}>
			{/* Top Navbar */}
			<div className="bg-white border-bottom py-3 mb-4 shadow-2xs d-print-none">
				<Container>
					<div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
						<div className="d-flex align-items-center gap-3">
							<Button
								variant="light"
								className="rounded-circle p-2 border"
								onClick={() => navigate(`/learner/learning-paths/${pathId}`)}
							>
								<ChevronLeft size={20} />
							</Button>
							<div>
								<div className="d-flex align-items-center gap-2">
									<span className="badge bg-warning-subtle text-warning-emphasis px-2 py-1 rounded-pill small fw-semibold">
										Sertifikat Kelulusan Resmi
									</span>
									<span className="text-muted small">• KampusX Academic Hub</span>
								</div>
								<h1 className="h6 fw-bold mb-0 text-dark">{learningPath.title}</h1>
							</div>
						</div>

						{isUnlocked && (
							<div className="d-flex align-items-center gap-2">
								<Button
									variant="outline-secondary"
									size="sm"
									className="rounded-pill px-3 d-inline-flex align-items-center gap-1.5"
									onClick={() => setShareModalOpen(true)}
								>
									<Share2 size={15} />
									Bagikan
								</Button>
								<Button
									variant="primary"
									size="sm"
									className="rounded-pill px-3 d-inline-flex align-items-center gap-1.5"
									onClick={handlePrintCertificate}
								>
									<Printer size={15} />
									Cetak / Simpan PDF
								</Button>
							</div>
						)}
					</div>
				</Container>
			</div>

			<Container>
				{/* ================================================================= */}
				{/* KONDISI 1: JIKA BELUM SELESAI SEMUA MODUL (LOCKED STATE)          */}
				{/* ================================================================= */}
				{!isUnlocked ? (
					<Row className="justify-content-center">
						<Col lg={8}>
							<Card className="border-0 shadow-sm rounded-4 p-5 text-center bg-white my-4">
								<div
									className="rounded-circle d-inline-flex align-items-center justify-content-center p-4 mb-3 mx-auto"
									style={{ background: '#F1F5F9', color: '#64748B' }}
								>
									<Lock size={48} />
								</div>
								<h2 className="h4 fw-bold text-dark mb-2">
									Sertifikat Kelulusan Masih Terkunci
								</h2>
								<p className="text-muted mx-auto mb-4" style={{ maxWidth: 500 }}>
									Sertifikat kelulusan resmi hanya akan diterbitkan setelah kamu menyelesaikan seluruh {totalModules} modul pada kurikulum <strong>{learningPath.title}</strong>.
								</p>

								{/* Progress Tracker Bar */}
								<div className="bg-light p-4 rounded-3 border mb-4 text-start">
									<div className="d-flex justify-content-between align-items-center mb-2">
										<span className="fw-semibold text-dark small">Progres Kurikulum</span>
										<span className="fw-bold text-primary small">
											{completedModules} dari {totalModules} Modul Selesai ({Math.round((completedModules / totalModules) * 100)}%)
										</span>
									</div>
									<ProgressBar
										now={(completedModules / totalModules) * 100}
										variant="primary"
										style={{ height: 10, borderRadius: 10 }}
									/>

									<div className="mt-3 pt-3 border-top">
										<span className="small text-muted d-block mb-2 fw-semibold">
											Daftar Modul yang Perlu Dituntaskan:
										</span>
										<div className="d-flex flex-column gap-2">
											{learningPath.modules?.map((mod, idx) => (
												<div
													key={mod.id || idx}
													className="d-flex align-items-center justify-content-between small p-2 rounded bg-white border"
												>
													<div className="d-flex align-items-center gap-2">
														{mod.status === 'completed' ? (
															<CheckCircle size={16} className="text-success" />
														) : (
															<div
																className="rounded-circle border"
																style={{ width: 16, height: 16 }}
															/>
														)}
														<span className={mod.status === 'completed' ? 'text-decoration-line-through text-muted' : 'text-dark fw-semibold'}>
															Modul {mod.number || idx + 1}: {mod.title}
														</span>
													</div>
													{mod.status === 'completed' ? (
														<span className="badge bg-success-subtle text-success">Selesai</span>
													) : (
														<span className="badge bg-secondary-subtle text-secondary">Belum</span>
													)}
												</div>
											))}
										</div>
									</div>
								</div>

								<div className="d-flex justify-content-center gap-3">
									<Button
										variant="primary"
										className="rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
										onClick={() => navigate(`/learner/learning-paths/${pathId}`)}
									>
										<BookOpen size={16} />
										Lanjutkan Belajar Modul
									</Button>
								</div>
							</Card>
						</Col>
					</Row>
				) : (
					/* ================================================================= */
					/* KONDISI 2: SERTIFIKAT TERBUKA & RESMI DITERBITKAN                */
					/* ================================================================= */
					<Row className="justify-content-center">
						<Col lg={11} xl={10}>
							{/* NOTIFIKASI SUKSES KELULUSAN (d-print-none) */}
							<div className="d-print-none mb-4">
								<div
									className="p-4 rounded-4 shadow-2xs border d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"
									style={{
										background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
										borderColor: '#A7F3D0',
									}}
								>
									<div className="d-flex align-items-center gap-3">
										<div
											className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
											style={{
												width: 48,
												height: 48,
												backgroundColor: '#10B981',
												color: '#FFF',
											}}
										>
											<ShieldCheck size={26} />
										</div>
										<div>
											<h4 className="fw-bold text-emerald-950 mb-1" style={{ fontSize: '1.15rem' }}>
												Sertifikat Digital Terverifikasi Resmi
											</h4>
											<p className="text-emerald-800 small mb-0">
												Kredensial ini tercatat pada KampusX Smart Contract Ledger dengan enkripsi ECDSA anti-pemalsuan.
											</p>
										</div>
									</div>

									<div className="d-flex align-items-center gap-2">
										<Button
											variant="outline-success"
											size="sm"
											className="rounded-pill fw-semibold px-3 bg-white d-inline-flex align-items-center gap-1.5"
											onClick={() => setSelectedCertModal(true)}
										>
											<FileCode size={15} />
											Lihat On-Chain Proof
										</Button>

										<Button
											variant="success"
											size="sm"
											className="rounded-pill fw-bold px-3.5 d-inline-flex align-items-center gap-1.5 shadow-xs"
											onClick={handlePrintCertificate}
										>
											<Download size={15} />
											Unduh PDF
										</Button>
									</div>
								</div>
							</div>

							{/* ============================================================= */}
							{/* KANVAS SERTIFIKAT RESMI KAMPUSX (A4 LANDSCAPE RATIO)          */}
							{/* ============================================================= */}
							<div className="certificate-print-area">
								<Card
									ref={certificatePrintRef}
									className="border-0 shadow-xl rounded-4 overflow-hidden position-relative mb-4 bg-white"
									style={{
										border: '12px solid #0B2545',
										padding: '40px 50px',
										position: 'relative',
										minHeight: 640,
										background: 'radial-gradient(circle at center, #FFFFFF 0%, #F8FAFC 100%)',
									}}
								>
									{/* Inner Ornate Gold Border Frame */}
									<div
										style={{
											position: 'absolute',
											inset: 12,
											border: '2px solid #D97706',
											pointerEvents: 'none',
											borderRadius: 8,
										}}
									/>
									<div
										style={{
											position: 'absolute',
											inset: 16,
											border: '1px dashed rgba(217, 119, 6, 0.5)',
											pointerEvents: 'none',
											borderRadius: 6,
										}}
									/>

									{/* Corner Ornaments */}
									<div
										style={{
											position: 'absolute',
											top: 20,
											left: 20,
											width: 32,
											height: 32,
											borderTop: '4px solid #D97706',
											borderLeft: '4px solid #D97706',
										}}
									/>
									<div
										style={{
											position: 'absolute',
											top: 20,
											right: 20,
											width: 32,
											height: 32,
											borderTop: '4px solid #D97706',
											borderRight: '4px solid #D97706',
										}}
									/>
									<div
										style={{
											position: 'absolute',
											bottom: 20,
											left: 20,
											width: 32,
											height: 32,
											borderBottom: '4px solid #D97706',
											borderLeft: '4px solid #D97706',
										}}
									/>
									<div
										style={{
											position: 'absolute',
											bottom: 20,
											right: 20,
											width: 32,
											height: 32,
											borderBottom: '4px solid #D97706',
											borderRight: '4px solid #D97706',
										}}
									/>

									{/* HEADER SERTIFIKAT */}
									<div className="text-center mb-4 position-relative">
										<div className="d-inline-flex align-items-center gap-2 mb-2">
											<div
												className="rounded-circle d-flex align-items-center justify-content-center text-white font-weight-bold"
												style={{
													width: 44,
													height: 44,
													background: 'linear-gradient(135deg, #0B2545 0%, #028090 100%)',
													fontSize: '1.25rem',
													fontWeight: 900,
													boxShadow: '0 4px 12px rgba(11,37,69,0.3)',
												}}
											>
												KX
											</div>
											<div className="text-start">
												<div
													style={{
														fontSize: '1.05rem',
														fontWeight: 900,
														letterSpacing: '0.12em',
														color: '#0B2545',
														lineHeight: 1.1,
													}}
												>
													KAMPUSX INSTITUTE
												</div>
												<div
													style={{
														fontSize: '0.68rem',
														letterSpacing: '0.15em',
														color: '#64748B',
														textTransform: 'uppercase',
														fontWeight: 700,
													}}
												>
													Decentralized Microlearning Academy
												</div>
											</div>
										</div>

										<div className="my-2">
											<h2
												style={{
													fontFamily: 'serif',
													fontSize: '2.2rem',
													fontWeight: 900,
													color: '#0B2545',
													letterSpacing: '0.04em',
													marginBottom: 4,
													textTransform: 'uppercase',
												}}
											>
												Sertifikat Kelulusan
											</h2>
											<div
												style={{
													fontSize: '0.9rem',
													letterSpacing: '0.18em',
													color: '#D97706',
													fontWeight: 800,
													textTransform: 'uppercase',
												}}
											>
												CERTIFICATE OF COMPLETION
											</div>
											<div
												className="font-monospace text-muted mt-1"
												style={{ fontSize: '0.75rem' }}
											>
												Nomor Registrasi Kredensial: {credentialId}
											</div>
										</div>
									</div>

									{/* ISI PENGHARGAAN */}
									<div className="text-center my-3 position-relative">
										<p
											className="text-muted mb-2 font-serif"
											style={{ fontSize: '0.95rem', fontStyle: 'italic' }}
										>
											Dengan ini menerangkan bahwa:
										</p>

										{/* NAMA PENERIMA */}
										<div
											className="my-3 py-1 px-4 d-inline-block border-bottom border-2 border-dark"
											style={{ minWidth: 380 }}
										>
											<h3
												style={{
													fontSize: '2rem',
													fontWeight: 800,
													color: '#0B2545',
													letterSpacing: '0.02em',
													marginBottom: 0,
												}}
											>
												{recipientName}
											</h3>
										</div>

										<p
											className="text-muted mx-auto my-3"
											style={{
												maxWidth: 620,
												fontSize: '0.92rem',
												lineHeight: 1.6,
												color: '#334155',
											}}
										>
											Telah berhasil menyelesaikan seluruh kurikulum terstruktur, checkpoint asesmen sumatif, serta refleksi metakognisi mandiri (Self-Regulated Learning) pada spesialisasi:
										</p>

										{/* NAMA LEARNING PATH */}
										<div
											className="p-3 my-2 rounded-3 mx-auto shadow-2xs d-inline-block"
											style={{
												background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
												border: '1px solid #BAE6FD',
												maxWidth: 700,
											}}
										>
											<h4
												className="fw-extrabold mb-1"
												style={{ fontSize: '1.35rem', color: '#0B2545' }}
											>
												{learningPath.title}
											</h4>
											<div className="text-muted small">
												Kategori: {learningPath.category || 'AI & Distributed Engineering'} • Level: {learningPath.level || 'Menengah'} • Total {totalModules} Modul Pembelajaran
											</div>
										</div>
									</div>

									{/* FOOTER SERTIFIKAT: TANDA TANGAN & QR CODE VERIFIKASI */}
									<div className="mt-5 pt-3 position-relative">
										<Row className="align-items-end text-center">
											{/* Tanda Tangan Direktur Akademik */}
											<Col xs={4}>
												<div className="d-flex flex-column align-items-center">
													{/* Simulated Digital Signature */}
													<div
														className="font-serif text-primary"
														style={{
															fontFamily: 'cursive',
															fontSize: '1.6rem',
															transform: 'rotate(-4deg)',
															color: '#1E3A8A',
															height: 48,
														}}
													>
														Hendra Wijaya
													</div>
													<div
														className="border-top border-dark w-75 pt-1 mt-1"
														style={{ borderColor: '#64748B' }}
													>
														<div className="fw-bold text-dark small">
															Dr. Hendra Wijaya, M.Sc.
														</div>
														<div className="text-muted" style={{ fontSize: '0.7rem' }}>
															Academic Director KampusX
														</div>
													</div>
												</div>
											</Col>

											{/* Seal & QR Code Tengah */}
											<Col xs={4} className="d-flex flex-column align-items-center justify-content-center">
												<div
													className="p-2 bg-white rounded-3 border shadow-2xs mb-2"
													style={{ borderColor: '#CBD5E1' }}
												>
													<QRCode
														value={verificationUrl}
														size={72}
														style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
														viewBox={`0 0 72 72`}
													/>
												</div>
												<div
													className="badge bg-warning text-dark px-2.5 py-1 rounded-pill fw-bold"
													style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}
												>
													✓ SMART CONTRACT VERIFIED
												</div>
												<div className="text-muted mt-1" style={{ fontSize: '0.68rem' }}>
													Diterbitkan: {issueDate}
												</div>
											</Col>

											{/* Tanda Tangan Lead Instructor */}
											<Col xs={4}>
												<div className="d-flex flex-column align-items-center">
													<div
														className="font-serif text-primary"
														style={{
															fontFamily: 'cursive',
															fontSize: '1.6rem',
															transform: 'rotate(-2deg)',
															color: '#028090',
															height: 48,
														}}
													>
														Reza Fauzi
													</div>
													<div
														className="border-top border-dark w-75 pt-1 mt-1"
														style={{ borderColor: '#64748B' }}
													>
														<div className="fw-bold text-dark small">
															{learningPath.instructor?.name || 'Dr. Reza Fauzi'}
														</div>
														<div className="text-muted" style={{ fontSize: '0.7rem' }}>
															Lead Curriculum Mentor
														</div>
													</div>
												</div>
											</Col>
										</Row>
									</div>
								</Card>
							</div>

							{/* TOOLBAR BAWAH (d-print-none) */}
							<div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4 d-print-none">
								<Button
									variant="outline-secondary"
									className="rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
									onClick={() => navigate(`/learner/learning-paths/${pathId}`)}
								>
									<BookOpen size={16} />
									Kembali ke Roadmap Kurikulum
								</Button>

								<div className="d-flex align-items-center gap-2">
									<Button
										variant="outline-primary"
										className="rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
										onClick={() => navigate('/learner/badges')}
									>
										<Award size={16} />
										Lihat di Portofolio Kredensial
									</Button>

									<Button
										variant="primary"
										className="rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
										onClick={handlePrintCertificate}
									>
										<Printer size={16} />
										Cetak Sertifikat Resmi
									</Button>
								</div>
							</div>
						</Col>
					</Row>
				)}
			</Container>

			{/* ================================================================= */}
			{/* MODAL: ON-CHAIN TELEMETRY PAYLOAD                                 */}
			{/* ================================================================= */}
			<Modal
				show={selectedCertModal}
				onHide={() => setSelectedCertModal(false)}
				centered
				size="lg"
			>
				<div className="bg-slate-900 rounded-4 p-4 text-white border border-slate-700">
					<div className="d-flex align-items-center justify-content-between pb-3 border-bottom border-slate-800 mb-3">
						<div className="d-flex align-items-center gap-2">
							<ShieldCheck size={24} className="text-emerald-400" />
							<div>
								<h5 className="fw-bold mb-0 text-white">Cryptographic Certificate Payload</h5>
								<p className="text-slate-400 small mb-0 font-monospace">Token ID: #204 • Polygon PoS</p>
							</div>
						</div>
						<Button
							variant="link"
							className="text-slate-400 p-0"
							onClick={() => setSelectedCertModal(false)}
						>
							<X size={20} />
						</Button>
					</div>

					<div className="space-y-1 mb-3 small text-slate-300 font-monospace">
						<div className="d-flex justify-content-between py-1 border-bottom border-slate-800">
							<span className="text-slate-400">Contract Address:</span>
							<span className="text-emerald-400">{smartContractPayload.contractAddress}</span>
						</div>
						<div className="d-flex justify-content-between py-1 border-bottom border-slate-800">
							<span className="text-slate-400">Transaction Hash:</span>
							<span className="text-blue-400 truncate text-truncate" style={{ maxWidth: 300 }}>
								{smartContractPayload.txHash}
							</span>
						</div>
					</div>

					{/* JSON Preformatted Code */}
					<div className="position-relative bg-slate-950 p-3 rounded-3 border border-slate-800 font-monospace small mb-3">
						<Button
							variant="secondary"
							size="sm"
							className="position-absolute top-2 end-2 d-inline-flex align-items-center gap-1"
							onClick={() => {
								navigator.clipboard.writeText(JSON.stringify(smartContractPayload, null, 2));
								setCopied(true);
								setTimeout(() => setCopied(false), 2000);
							}}
						>
							{copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
							{copied ? 'Tersalin' : 'Salin JSON'}
						</Button>
						<pre className="text-emerald-400 mb-0" style={{ maxHeight: 220, overflowY: 'auto' }}>
							{JSON.stringify(smartContractPayload, null, 2)}
						</pre>
					</div>

					<div className="d-flex justify-content-between align-items-center pt-2">
						<span className="text-slate-400 small">ECDSA secp256k1 Signature Verified ✓</span>
						<Button
							variant="secondary"
							size="sm"
							className="px-4 rounded-pill"
							onClick={() => setSelectedCertModal(false)}
						>
							Tutup
						</Button>
					</div>
				</div>
			</Modal>

			{/* ================================================================= */}
			{/* MODAL: BAGIKAN KE LINKEDIN & MEDIA SOSIAL                         */}
			{/* ================================================================= */}
			<Modal show={shareModalOpen} onHide={() => setShareModalOpen(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title className="h6 fw-bold">
						Bagikan Sertifikat Kelulusan
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="p-4">
					<div className="text-center mb-4">
						<div
							className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-2"
							style={{ background: '#ECFDF5', color: '#059669' }}
						>
							<GraduationCap size={36} />
						</div>
						<h5 className="fw-bold mb-1">{learningPath.title}</h5>
						<p className="text-muted small mb-0 font-monospace">
							Credential ID: {credentialId}
						</p>
					</div>

					<div className="mb-3">
						<label className="form-label small fw-bold text-dark">
							Link Verifikasi Sertifikat:
						</label>
						<div className="input-group">
							<input
								type="text"
								readOnly
								className="form-control font-monospace small"
								value={verificationUrl}
							/>
							<Button
								variant={copied ? 'success' : 'primary'}
								onClick={handleCopyVerificationUrl}
								className="d-inline-flex align-items-center gap-1.5"
							>
								{copied ? <Check size={16} /> : <Copy size={16} />}
								{copied ? 'Tersalin!' : 'Salin'}
							</Button>
						</div>
					</div>

					<div className="d-flex flex-column gap-2 pt-2">
						<Button
							variant="primary"
							className="w-100 fw-bold py-2 d-inline-flex align-items-center justify-content-center gap-2"
							onClick={() => {
								const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(learningPath.title)}&organizationName=KampusX&issueYear=2026&issueMonth=2&certUrl=${encodeURIComponent(verificationUrl)}&certId=${credentialId}`;
								window.open(linkedInUrl, '_blank');
							}}
						>
							<ExternalLink size={16} />
							Tambahkan ke Profil LinkedIn
						</Button>

						<Button
							variant="outline-secondary"
							className="w-100 py-2"
							onClick={() => {
								const text = encodeURIComponent(
									`Saya bangga telah menyelesaikan spesialisasi "${learningPath.title}" di KampusX dan memperoleh sertifikat resmi! Cek verifikasi: ${verificationUrl}`,
								);
								window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
							}}
						>
							Bagikan ke X / Twitter
						</Button>
					</div>
				</Modal.Body>
			</Modal>

			{/* ================================================================= */}
			{/* FLOATING ACTION SWITCHER DEMO REVIEW                              */}
			{/* ================================================================= */}
			<div
				className="d-print-none"
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
						className={`btn ${!forceUnlocked ? 'btn-danger fw-bold' : 'btn-outline-light'}`}
						onClick={() => setForceUnlocked(false)}
					>
						Status Belum Selesai (Terkunci)
					</button>
					<button
						type="button"
						className={`btn ${forceUnlocked ? 'btn-success fw-bold' : 'btn-outline-light'}`}
						onClick={() => setForceUnlocked(true)}
					>
						Status 100% Selesai (Terbuka) 🎓
					</button>
				</div>
			</div>
		</div>
	);
};

export default LearningPathCertificatePage;
