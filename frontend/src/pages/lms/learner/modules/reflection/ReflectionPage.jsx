import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { ChevronLeft, Sliders, Award, Sparkles, ArrowRight } from 'lucide-react';
import ResultCard from './ResultCard';
import LessonReview from './LessonReview';
import Rekomendasi from './Rekomendasi';

const OUTCOME_DATA = {
	outcome1: {
		id: 'outcome1',
		sx: 0.48,
		score: 60,
		passingScore: 75,
		themeColor: '#EF4444',
		badgeText: 'BELUM SIAP',
		headline: 'Belum Mencapai Target. Mari Review Materi Ini!',
		feedback:
			'Nilai kamu 60 (Min. 75). Rekomendasi AI: Ambil sesi remedial atau pelajari ulang Lesson yang belum tuntas sebelum mencoba kembali.',
		ctaPrimaryText: 'Tinjau Materi',
		metrics: {
			correct: 3,
			wrong: 0,
			unanswered: 2,
			answeredStr: '3/5 Soal diisi',
		},
		duration: '08m 45s',
		remedialCount: 2,
	},
	outcome2: {
		id: 'outcome2',
		sx: 0.65,
		score: 78,
		passingScore: 75,
		themeColor: '#F59E0B',
		badgeText: 'CUKUP SIAP',
		headline: 'Kerja Bagus! Kamu Lulus, Namun Perlu Penguatan',
		feedback:
			'Nilai kamu 78 (Min. 75). Rekomendasi AI: Pelajari materi pendukung untuk memperjelas konsep yang masih kurang dikuasai.',
		ctaPrimaryText: 'Pelajari Materi Pendukung',
		metrics: {
			correct: 4,
			wrong: 1,
			unanswered: 0,
			answeredStr: '5/5 Soal diisi',
		},
		duration: '10m 15s',
		remedialCount: 1,
	},
	outcome3: {
		id: 'outcome3',
		sx: 0.88,
		score: 90,
		passingScore: 75,
		themeColor: '#10B981',
		badgeText: 'SIAP',
		headline: 'Luar Biasa! Kamu Sangat Menguasai Materi Ini',
		feedback:
			'Nilai kamu 90 (Min. 75). Kesiapan belajar kamu sangat tinggi. Kamu siap untuk melanjutkan ke Modul berikutnya!',
		ctaPrimaryText: 'Lanjut ke Modul Berikutnya',
		metrics: {
			correct: 5,
			wrong: 0,
			unanswered: 0,
			answeredStr: '5/5 Soal diisi',
		},
		duration: '06m 30s',
		remedialCount: 0,
	},
};

const ReflectionPage = () => {
	const { moduleId = 'mod-arch-101' } = useParams();
	const navigate = useNavigate();

	const [selectedOutcomeKey, setSelectedOutcomeKey] = useState('outcome1');
	const [keyTakeaway, setKeyTakeaway] = useState('');
	const [strategyImprovement, setStrategyImprovement] = useState('');
	const [confidenceLevel, setConfidenceLevel] = useState(4);
	const [isReflectionSaved, setIsReflectionSaved] = useState(false);
	const currentOutcome = OUTCOME_DATA[selectedOutcomeKey];

	const moduleTitle = 'Web Application Architecture & REST API Design';

	return (
		<div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 80 }}>
			{/* Top Bar Navigation */}
			<div className="bg-white border-bottom py-3 mb-4 shadow-sm">
				<Container>
					<div className="d-flex align-items-center gap-3">
						<Button
							variant="light"
							className="rounded-circle p-2 border"
							onClick={() => navigate(-1)}
						>
							<ChevronLeft size={20} />
						</Button>
						<div>
							<span className="text-muted small d-block">
								Hasil Refleksi & Evaluasi
							</span>
							<h1 className="h5 fw-bold mb-0 text-dark">{moduleTitle}</h1>
						</div>
					</div>
				</Container>
			</div>

			{/* Main Content Area */}
			<Container style={{ paddingTop: 16 }}>
				<Row className="justify-content-center ">
					<Col lg={10} className='gap-3'>
						{/* 1. Hasil Evaluasi Quiz Card */}
						<ResultCard
							currentOutcome={currentOutcome}
							onAction={() => {
								if (currentOutcome.score >= currentOutcome.passingScore) {
									navigate(`/learner/modules/${moduleId}/completed`, {
										state: {
											score: currentOutcome.score,
											readiness: currentOutcome.badgeText,
											duration: currentOutcome.duration,
										},
									});
								} else {
									// Tinjau materi
									navigate(`/learner/modules/${moduleId}`);
								}
							}}
						/>

						{/* 2. Review Lesson Terkait */}
						<LessonReview currentOutcome={currentOutcome} />

						{/* Form Refleksi Metakognitif Diri (SRL Fase 3) */}
						<div className="bg-white p-4 rounded-3 border shadow-sm my-4">
							<div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
								<div>
									<h2 className="h6 fw-bold text-dark mb-1">
										Jurnal Refleksi Mandiri (Self-Reflection Form)
									</h2>
									<p className="text-muted small mb-0">
										Evaluasi proses belajarmu untuk memperkuat retensi memori jangka panjang dan metakognisi.
									</p>
								</div>
								{isReflectionSaved && (
									<span className="badge bg-success-subtle text-success px-3 py-2 fw-semibold">
										Refleksi Tersimpan ✓
									</span>
								)}
							</div>

							<div className="mb-3">
								<label className="form-label small fw-bold text-dark">
									1. Apa konsep utama yang paling kamu kuasai dari modul ini?
								</label>
								<textarea
									rows={2}
									className="form-control form-control-sm"
									placeholder="Contoh: Perbedaan metode PUT vs PATCH serta penerapan idempotensi pada REST API..."
									value={keyTakeaway}
									onChange={(e) => setKeyTakeaway(e.target.value)}
								/>
							</div>

							<div className="mb-3">
								<label className="form-label small fw-bold text-dark">
									2. Apa kendala yang dihadapi dan strategi apa yang akan kamu perbaiki di modul selanjutnya?
								</label>
								<textarea
									rows={2}
									className="form-control form-control-sm"
									placeholder="Contoh: Perlu mengalokasikan waktu 5 menit lebih banyak untuk membaca dokumentasi RFC sebelum kuis..."
									value={strategyImprovement}
									onChange={(e) => setStrategyImprovement(e.target.value)}
								/>
							</div>

							<div className="d-flex align-items-center justify-content-between pt-2 flex-wrap gap-2">
								<div className="d-flex align-items-center gap-2">
									<span className="small text-muted fw-semibold">Tingkat Keyakinan Diri:</span>
									{[1, 2, 3, 4, 5].map((lvl) => (
										<button
											key={lvl}
											type="button"
											onClick={() => setConfidenceLevel(lvl)}
											className={`btn btn-sm ${
												confidenceLevel === lvl ? 'btn-primary' : 'btn-outline-secondary'
											}`}
											style={{ width: 32, height: 32, padding: 0 }}
										>
											{lvl}
										</button>
									))}
								</div>

								<div className="d-flex align-items-center gap-2">
									<button
										type="button"
										onClick={() => {
											setIsReflectionSaved(true);
											setTimeout(() => setIsReflectionSaved(false), 3000);
										}}
										className="btn btn-outline-primary btn-sm px-3 fw-semibold"
									>
										Simpan Refleksi SRL
									</button>

									<button
										type="button"
										onClick={() => {
											navigate(`/learner/modules/${moduleId}/completed`, {
												state: {
													score: currentOutcome.score,
													readiness: currentOutcome.badgeText,
													duration: currentOutcome.duration,
												},
											});
										}}
										className="btn btn-warning text-dark btn-sm px-3.5 fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
									>
										<Award size={16} />
										Selesaikan Modul & Klaim Badge
										<ArrowRight size={14} />
									</button>
								</div>
							</div>
						</div>

						{/* 3. Rekomendasi Section */}
						<Rekomendasi currentOutcome={currentOutcome} />
					</Col>
				</Row>
			</Container>

			{/* Floating Action Switcher untuk preview 3 outcome */}
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
					boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
				}}
			>
				<div className="d-flex align-items-center gap-2 mb-2">
					<Sliders size={16} />
					<span className="fw-bold small">Outcome Preview Switcher</span>
				</div>
				<div className="btn-group btn-group-sm" role="group">
					{Object.keys(OUTCOME_DATA).map((key) => (
						<button
							key={key}
							type="button"
							className={`btn ${selectedOutcomeKey === key ? 'btn-primary' : 'btn-outline-light'}`}
							onClick={() => setSelectedOutcomeKey(key)}
						>
							{key.toUpperCase()}
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default ReflectionPage;
