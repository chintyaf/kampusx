import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ProgressBar, Button, Modal } from 'react-bootstrap';
import {
	ChevronLeft,
	ChevronRight,
	HelpCircle,
	Check,
	Clock,
	AlertTriangle,
	Bookmark,
	Send,
} from 'lucide-react';

// Data kuis dengan semua jawaban benar dipindahkan ke opsi A
const QUIZ_DATA = {
	title: 'Web Application Architecture & REST API Design',
	passingScore: 75,
	questions: [
		{
			id: 1,
			question: 'Apa fungsi utama dari REST API dalam arsitektur web modern?',
			options: [
				{
					key: 'A',
					text: 'Memungkinkan komunikasi antara server dan client menggunakan protokol HTTP',
				},
				{ key: 'B', text: 'Mengatur tampilan antarmuka pengguna (UI) secara otomatis' },
				{ key: 'C', text: 'Menyimpan data langsung ke database internal browser' },
				{ key: 'D', text: 'Menjalankan kode Python langsung di sisi browser' },
			],
			correct: 'A',
		},
		{
			id: 2,
			question:
				'HTTP Method manakah yang paling tepat digunakan untuk memperbarui seluruh data resource?',
			options: [
				{ key: 'A', text: 'PUT' },
				{ key: 'B', text: 'GET' },
				{ key: 'C', text: 'POST' },
				{ key: 'D', text: 'PATCH' },
			],
			correct: 'A',
		},
		{
			id: 3,
			question: 'Status code HTTP 404 menunjukkan bahwa...',
			options: [
				{ key: 'A', text: 'Resource yang diminta tidak ditemukan' },
				{ key: 'B', text: 'Server mengalami kesalahan internal' },
				{ key: 'C', text: 'Permintaan berhasil dilakukan' },
				{ key: 'D', text: 'Akses ditolak karena masalah otorisasi' },
			],
			correct: 'A',
		},
		{
			id: 4,
			question:
				'Manakah di bawah ini yang merupakan ciri khas dari arsitektur Stateless pada REST API?',
			options: [
				{
					key: 'A',
					text: 'Setiap request dari client harus berisi semua informasi yang dibutuhkan server',
				},
				{
					key: 'B',
					text: 'Server menyimpan state/session pengguna di dalam database server',
				},
				{ key: 'C', text: 'Client tidak diperbolehkan mengirimkan header Authorization' },
				{
					key: 'D',
					text: 'Server secara otomatis mengingat request sebelumnya dari IP yang sama',
				},
			],
			correct: 'A',
		},
		{
			id: 5,
			question:
				'Format data manakah yang paling umum digunakan untuk pertukaran data pada RESTful API?',
			options: [
				{ key: 'A', text: 'JSON' },
				{ key: 'B', text: 'XML' },
				{ key: 'C', text: 'YAML' },
				{ key: 'D', text: 'CSV' },
			],
			correct: 'A',
		},
	],
};

const QuizPage = () => {
	const { moduleId = 'mod-arch-101' } = useParams();
	const navigate = useNavigate();

	const moduleTitle = QUIZ_DATA.title;
	const quizQuestions = QUIZ_DATA.questions;
	const passingScore = QUIZ_DATA.passingScore;

	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [userAnswers, setUserAnswers] = useState({});
	const [markedForReview, setMarkedForReview] = useState({});
	const [timeLeft, setTimeLeft] = useState(600);
	const [isTimerRunning, setIsTimerRunning] = useState(true);
	const [showSubmitModal, setShowSubmitModal] = useState(false);

	useEffect(() => {
		if (!isTimerRunning) return;
		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					setIsTimerRunning(false);
					handleSubmitQuiz();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [isTimerRunning]);

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const currentQ = quizQuestions[currentQuestion] || {};
	const selectedOption = userAnswers[currentQuestion] || null;
	const isCurrentFlagged = markedForReview[currentQuestion] || false;

	const handleOptionSelect = (key) => {
		setUserAnswers((prev) => ({
			...prev,
			[currentQuestion]: key,
		}));
	};

	const handleToggleFlag = () => {
		setMarkedForReview((prev) => ({
			...prev,
			[currentQuestion]: !prev[currentQuestion],
		}));
	};

	const handleNext = () => {
		if (currentQuestion < quizQuestions.length - 1) {
			setCurrentQuestion((prev) => prev + 1);
		}
	};

	const handlePrev = () => {
		if (currentQuestion > 0) {
			setCurrentQuestion((prev) => prev - 1);
		}
	};

	const handleSubmitQuiz = () => {
		setShowSubmitModal(false);
		setIsTimerRunning(false);

		let correctCount = 0;
		quizQuestions.forEach((q, idx) => {
			if (userAnswers[idx] === q.correct) {
				correctCount++;
			}
		});

		const scorePercentage =
			quizQuestions.length > 0 ? Math.round((correctCount / quizQuestions.length) * 100) : 0;
		const isPassed = scorePercentage >= passingScore;

		const quizResult = {
			moduleId,
			moduleTitle,
			score: scorePercentage,
			correctCount,
			totalQuestions: quizQuestions.length,
			passingScore,
			isPassed,
			userAnswers,
			completedAt: new Date().toISOString(),
		};

		try {
			localStorage.setItem(`kampusx_quiz_result_${moduleId}`, JSON.stringify(quizResult));
		} catch (e) {
			console.error('Error saving quiz result', e);
		}

		navigate(`/learner/modules/${moduleId}/reflection`, {
			state: quizResult,
		});
	};

	const answeredCount = Object.keys(userAnswers).length;
	const progressPercent =
		quizQuestions.length > 0 ? Math.round((answeredCount / quizQuestions.length) * 100) : 0;

	return (
		<div
			style={{
				backgroundColor: 'var(--color-bg)',
				fontFamily: 'var(--font)',
				minHeight: '100vh',
				paddingBottom: 64,
			}}
		>
			{/* Top Navbar */}
			<div
				style={{
					backgroundColor: 'var(--card)',
					borderBottom: 'var(--border-w-xs) solid var(--neutral-border)',
					padding: '16px 0',
					position: 'sticky',
					top: 0,
					zIndex: 1020,
				}}
			>
				<Container>
					<div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
						<div className="d-flex align-items-center gap-3">
							<button
								onClick={() => navigate(`/learner/modules/${moduleId}`)}
								style={{
									background: 'none',
									border: 'none',
									display: 'flex',
									alignItems: 'center',
									color: 'var(--muted)',
									fontSize: 'var(--font-sm)',
									fontWeight: 600,
									padding: 0,
									cursor: 'pointer',
								}}
							>
								<ChevronLeft size={18} /> Silabus
							</button>
							<div
								style={{
									width: 1,
									height: 20,
									backgroundColor: 'var(--neutral-border)',
								}}
							/>
							<div>
								<span
									className="badge fw-bold text-uppercase me-2"
									style={{
										backgroundColor: 'var(--primary-light)',
										color: 'var(--primary)',
										fontSize: 'var(--font-xs)',
									}}
								>
									Summative Quiz
								</span>
								<span
									style={{
										fontSize: 'var(--font-sm)',
										fontWeight: 700,
										color: 'var(--text)',
									}}
								>
									{moduleTitle}
								</span>
							</div>
						</div>

						<div className="d-flex align-items-center gap-3">
							<div
								className="d-flex align-items-center gap-2 px-3 py-2 border fw-bold font-monospace"
								style={{
									backgroundColor:
										timeLeft <= 120 ? 'var(--danger-bg)' : 'var(--neutral-bg)',
									borderColor:
										timeLeft <= 120
											? 'var(--danger-border-color)'
											: 'var(--neutral-border)',
									color: timeLeft <= 120 ? 'var(--danger-text)' : 'var(--text)',
									borderRadius: 'var(--radius-full)',
									fontSize: 'var(--font-sm)',
								}}
								title="Waktu Tersisa"
							>
								<Clock
									size={16}
									style={{
										color:
											timeLeft <= 120
												? 'var(--danger-text)'
												: 'var(--primary)',
									}}
								/>
								<span>{formatTime(timeLeft)}</span>
							</div>

							<Button
								size="sm"
								className="px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 shadow-sm border-0"
								style={{
									backgroundColor: 'var(--primary)',
									color: 'var(--color-white)',
									borderRadius: 'var(--radius-md)',
									fontSize: 'var(--font-sm)',
								}}
								onClick={() => setShowSubmitModal(true)}
							>
								<Send size={14} />
								<span>Kirim Jawaban</span>
							</Button>
						</div>
					</div>
				</Container>
			</div>

			<Container style={{ paddingTop: 28 }}>
				<Row className="g-4">
					<Col lg={3}>
						<div
							className="d-flex flex-column gap-3 position-sticky"
							style={{ top: 88 }}
						>
							<Card
								style={{
									borderRadius: 'var(--radius-lg)',
									border: 'var(--border-w-xs) solid var(--neutral-border)',
									backgroundColor: 'var(--card)',
									padding: 20,
									boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
								}}
							>
								<div className="d-flex align-items-center justify-content-between mb-2">
									<h6
										style={{
											fontWeight: 800,
											fontSize: 'var(--font-xs)',
											color: 'var(--muted)',
											textTransform: 'uppercase',
											letterSpacing: '0.05em',
											margin: 0,
										}}
									>
										Navigasi Soal
									</h6>
									<span
										className="badge border fw-bold"
										style={{
											backgroundColor: 'var(--neutral-bg)',
											color: 'var(--text)',
											borderRadius: 'var(--radius-full)',
											fontSize: 'var(--font-xs)',
										}}
									>
										{answeredCount} / {quizQuestions.length}
									</span>
								</div>

								<ProgressBar
									now={progressPercent}
									className="mb-3"
									style={{
										height: 6,
										borderRadius: 'var(--radius-full)',
										backgroundColor: 'var(--neutral-bg)',
									}}
									variant="success"
								/>

								<div
									style={{
										display: 'grid',
										gridTemplateColumns: 'repeat(4, 1fr)',
										gap: 8,
									}}
								>
									{quizQuestions.map((_, index) => {
										const isAnswered = userAnswers[index] !== undefined;
										const isCurrent = currentQuestion === index;
										const isFlagged = markedForReview[index] === true;

										let bg = 'var(--card)';
										let borderColor = 'var(--neutral-border)';
										let color = 'var(--muted)';

										if (isCurrent) {
											borderColor = 'var(--primary)';
											bg = 'var(--primary-light)';
											color = 'var(--primary)';
										} else if (isFlagged) {
											bg = 'var(--warning-bg)';
											borderColor = 'var(--warning-border)';
											color = 'var(--warning-text)';
										} else if (isAnswered) {
											bg = 'var(--success-bg)';
											borderColor = 'var(--success-border-color)';
											color = 'var(--success-text)';
										}

										return (
											<button
												key={index}
												onClick={() => setCurrentQuestion(index)}
												style={{
													height: 38,
													borderRadius: 'var(--radius-md)',
													border: `${isCurrent ? 'var(--border-w-sm)' : 'var(--border-w-xs)'} solid ${borderColor}`,
													background: bg,
													color: color,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													fontWeight: 700,
													fontSize: 'var(--font-xs)',
													cursor: 'pointer',
													transition: 'all 0.15s ease',
													position: 'relative',
												}}
												title={`Soal ${index + 1}`}
											>
												{isAnswered && !isCurrent ? index + 1 : index + 1}
												{isFlagged && (
													<span
														style={{
															position: 'absolute',
															top: 4,
															right: 4,
															width: 6,
															height: 6,
															borderRadius: 'var(--radius-full)',
															backgroundColor: 'var(--warning-text)',
														}}
													/>
												)}
											</button>
										);
									})}
								</div>

								<div
									className="mt-3 pt-3 border-top d-flex flex-column gap-2"
									style={{
										fontSize: 'var(--font-xs)',
										color: 'var(--muted)',
										borderColor: 'var(--neutral-border)',
									}}
								>
									<div className="d-flex align-items-center gap-2">
										<span
											style={{
												width: 10,
												height: 10,
												borderRadius: 'var(--radius-xs)',
												backgroundColor: 'var(--success-bg)',
												border: 'var(--border-w-xs) solid var(--success-border-color)',
											}}
										/>
										<span>Sudah Dijawab</span>
									</div>
									<div className="d-flex align-items-center gap-2">
										<span
											style={{
												width: 10,
												height: 10,
												borderRadius: 'var(--radius-xs)',
												backgroundColor: 'var(--primary-light)',
												border: 'var(--border-w-xs) solid var(--primary)',
											}}
										/>
										<span>Sedang Dibuka</span>
									</div>
									<div className="d-flex align-items-center gap-2">
										<span
											style={{
												width: 10,
												height: 10,
												borderRadius: 'var(--radius-xs)',
												backgroundColor: 'var(--warning-bg)',
												border: 'var(--border-w-xs) solid var(--warning-border)',
											}}
										/>
										<span>Ragu-Ragu / Review</span>
									</div>
								</div>
							</Card>
						</div>
					</Col>

					<Col lg={9}>
						<Card
							style={{
								borderRadius: '16px',
								border: '1px solid var(--neutral-border, #E2E8F0)',
								backgroundColor: 'var(--card, #FFFFFF)',
								boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
								overflow: 'hidden',
							}}
						>
							{/* Header Info Soal & Ambang Lulus */}
							<div
								className="px-4 py-3 d-flex align-items-center justify-content-between border-bottom"
								style={{ borderColor: 'var(--neutral-border, #F1F5F9)' }}
							>
								<span
									style={{
										fontSize: 'var(--font-xs, 0.85rem)',
										fontWeight: 800,
										color: 'var(--text, #1E293B)',
										letterSpacing: '0.05em',
										textTransform: 'uppercase',
									}}
								>
									SOAL {currentQuestion + 1} DARI {quizQuestions.length}
								</span>
								<span
									className="px-3 py-1 fw-semibold"
									style={{
										fontSize: 'var(--font-xs, 0.8rem)',
										color: 'var(--muted, #475569)',
										backgroundColor: 'var(--card, #FFFFFF)',
										border: '1px solid var(--neutral-border, #CBD5E1)',
										borderRadius: '50px',
									}}
								>
									Ambang lulus {passingScore}%
								</span>
							</div>

							{/* Isi Pertanyaan & Opsi */}
							<div className="p-4">
								{/* Blok Pertanyaan */}
								<div className="d-flex gap-3 align-items-start mb-4">
									<div
										className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
										style={{
											width: 44,
											height: 44,
											backgroundColor: 'var(--primary-light, #E0F2FE)',
											color: 'var(--primary, #0284C7)',
										}}
									>
										<HelpCircle size={22} />
									</div>
									<div>
										<span
											className="d-block fw-bold text-uppercase mb-1"
											style={{
												fontSize: '0.75rem',
												color: 'var(--muted, #64748B)',
												letterSpacing: '0.05em',
											}}
										>
											PERTANYAAN
										</span>
										<h4
											style={{
												fontSize: '1.25rem',
												fontWeight: 700,
												color: 'var(--text, #0F172A)',
												lineHeight: 1.5,
												margin: 0,
											}}
										>
											{currentQ.question}
										</h4>
									</div>
								</div>

								{/* Daftar Opsi Jawaban */}
								<div className="d-flex flex-column gap-3 mb-4">
									{currentQ.options?.map((option) => {
										const optKey = option.key;
										const optText = option.text;
										const isSelected = selectedOption === optKey;

										return (
											<div
												key={optKey}
												onClick={() => handleOptionSelect(optKey)}
												className="p-3 d-flex align-items-center justify-content-between gap-3"
												style={{
													borderRadius: '12px',
													border: `1.5px solid ${
														isSelected
															? 'var(--primary, #0284C7)'
															: 'var(--neutral-border, #E2E8F0)'
													}`,
													backgroundColor: isSelected
														? 'var(--bahama-blue-50, #F0F9FF)'
														: 'var(--card, #FFFFFF)',
													cursor: 'pointer',
													transition: 'all 0.15s ease-in-out',
												}}
											>
												<div className="d-flex align-items-center gap-3">
													<div
														style={{
															width: 36,
															height: 36,
															borderRadius: '50%',
															backgroundColor: isSelected
																? 'var(--primary, #0284C7)'
																: 'var(--neutral-bg, #F1F5F9)',
															color: isSelected
																? '#FFFFFF'
																: 'var(--muted, #64748B)',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															fontWeight: 700,
															fontSize: '0.875rem',
															flexShrink: 0,
														}}
													>
														{optKey}
													</div>
													<span
														style={{
															fontSize: '0.95rem',
															fontWeight: isSelected ? 600 : 400,
															color: isSelected
																? 'var(--text, #0F172A)'
																: 'var(--text, #1E293B)',
															lineHeight: 1.4,
														}}
													>
														{optText}
													</span>
												</div>

												{/* Indikator Pilihan (Kanan) */}
												<div>
													{isSelected ? (
														<div
															className="rounded-circle d-flex align-items-center justify-content-center"
															style={{
																width: 28,
																height: 28,
																backgroundColor:
																	'var(--primary, #0284C7)',
																color: '#FFFFFF',
															}}
														>
															<Check size={16} strokeWidth={2.5} />
														</div>
													) : (
														<div
															className="rounded-circle"
															style={{
																width: 28,
																height: 28,
																border: '2px solid var(--neutral-border, #CBD5E1)',
																backgroundColor: 'transparent',
															}}
														/>
													)}
												</div>
											</div>
										);
									})}
								</div>

								{/* Tombol Tandai Ragu-ragu */}
								<div className="d-flex justify-content-end mb-2">
									<button
										type="button"
										onClick={handleToggleFlag}
										className="btn btn-link text-decoration-none d-inline-flex align-items-center gap-2 p-0"
										style={{
											color: isCurrentFlagged
												? 'var(--warning-text, #D97706)'
												: 'var(--muted, #64748B)',
											fontWeight: 600,
											fontSize: '0.875rem',
										}}
									>
										<Bookmark
											size={18}
											fill={isCurrentFlagged ? 'currentColor' : 'none'}
										/>
										<span>
											{isCurrentFlagged
												? 'Ditandai ragu-ragu'
												: 'Tandai ragu-ragu'}
										</span>
									</button>
								</div>
							</div>

							{/* Navigasi Bawah */}
							<div
								className="p-4 d-flex align-items-center justify-content-between border-top"
								style={{
									borderColor: 'var(--neutral-border, #F1F5F9)',
									backgroundColor: 'var(--card, #FFFFFF)',
								}}
							>
								<Button
									variant="light"
									onClick={handlePrev}
									disabled={currentQuestion === 0}
									className="d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold"
									style={{
										borderRadius: '10px',
										backgroundColor: '#FFFFFF',
										border: '1px solid var(--neutral-border, #CBD5E1)',
										color: 'var(--text, #334155)',
										fontSize: '0.875rem',
										opacity: currentQuestion === 0 ? 0.5 : 1,
									}}
								>
									<ChevronLeft size={18} /> Soal sebelumnya
								</Button>

								{currentQuestion < quizQuestions.length - 1 ? (
									<Button
										onClick={handleNext}
										className="d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold border-0"
										style={{
											backgroundColor: 'var(--primary, #0284C7)',
											color: '#FFFFFF',
											borderRadius: '10px',
											fontSize: '0.875rem',
										}}
									>
										Soal selanjutnya <ChevronRight size={18} />
									</Button>
								) : (
									<Button
										onClick={() => setShowSubmitModal(true)}
										className="d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold border-0"
										style={{
											backgroundColor: 'var(--primary, #0284C7)',
											color: '#FFFFFF',
											borderRadius: '10px',
											fontSize: '0.875rem',
										}}
									>
										Kirim Jawaban <Send size={18} />
									</Button>
								)}
							</div>
						</Card>
					</Col>
				</Row>
			</Container>

			<Modal
				show={showSubmitModal}
				onHide={() => setShowSubmitModal(false)}
				centered
				contentClassName="border-0 shadow-lg"
				style={{ borderRadius: '16px', overflow: 'hidden' }}
			>
				{/* Header Modal */}
				<Modal.Header closeButton className="px-4 pt-4 pb-2 border-bottom-0">
					<Modal.Title
						style={{
							fontSize: '1.125rem',
							fontWeight: 700,
							color: 'var(--text, #0F172A)',
						}}
					>
						Konfirmasi Pengiriman Quiz
					</Modal.Title>
				</Modal.Header>

				{/* Body Modal */}
				<Modal.Body className="px-4 py-2">
					{/* Kartu Peringatan Utama */}
					<div
						className="d-flex align-items-center gap-3 mb-3 p-3"
						style={{
							backgroundColor: 'var(--neutral-bg, #F8FAFC)',
							border: '1px solid var(--neutral-border, #E2E8F0)',
							borderRadius: '12px',
						}}
					>
						<div
							className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
							style={{
								width: 44,
								height: 44,
								backgroundColor:
									quizQuestions.length - answeredCount > 0
										? '#FEF3C7'
										: '#E0F2FE',
								color:
									quizQuestions.length - answeredCount > 0
										? '#D97706'
										: '#0284C7',
							}}
						>
							<AlertTriangle size={22} />
						</div>
						<div>
							<h6
								className="mb-1 fw-bold"
								style={{ fontSize: '0.95rem', color: 'var(--text, #0F172A)' }}
							>
								Apakah Anda yakin ingin menyelesaikan quiz ini?
							</h6>
							<p className="mb-0 text-muted" style={{ fontSize: '0.825rem' }}>
								Jawaban Anda akan dikirim dan disimulasikan untuk penilaian akhir.
							</p>
						</div>
					</div>

					{/* Grid Status Ringkasan Jawaban */}
					<div className="row g-2 mb-2">
						<div className="col-6">
							<div
								className="p-3 text-center"
								style={{
									backgroundColor: 'var(--success-bg, #F0FDF4)',
									border: '1px solid var(--success-border, #DCFCE7)',
									borderRadius: '10px',
								}}
							>
								<span
									className="d-block text-muted mb-1"
									style={{
										fontSize: '0.725rem',
										fontWeight: 700,
										letterSpacing: '0.05em',
										textTransform: 'uppercase',
									}}
								>
									Sudah Dijawab
								</span>
								<span
									className="fw-bold fs-5"
									style={{ color: 'var(--success-text, #16A34A)' }}
								>
									{answeredCount}{' '}
									<small className="text-muted fs-6" style={{ fontWeight: 500 }}>
										/ {quizQuestions.length}
									</small>
								</span>
							</div>
						</div>
						<div className="col-6">
							<div
								className="p-3 text-center"
								style={{
									backgroundColor:
										quizQuestions.length - answeredCount > 0
											? 'var(--warning-bg, #FFFBEB)'
											: 'var(--neutral-bg, #F8FAFC)',
									border: `1px solid ${quizQuestions.length - answeredCount > 0 ? 'var(--warning-border, #FEF3C7)' : 'var(--neutral-border, #E2E8F0)'}`,
									borderRadius: '10px',
								}}
							>
								<span
									className="d-block text-muted mb-1"
									style={{
										fontSize: '0.725rem',
										fontWeight: 700,
										letterSpacing: '0.05em',
										textTransform: 'uppercase',
									}}
								>
									Belum Dijawab
								</span>
								<span
									className="fw-bold fs-5"
									style={{
										color:
											quizQuestions.length - answeredCount > 0
												? 'var(--warning-text, #D97706)'
												: 'var(--muted, #64748B)',
									}}
								>
									{quizQuestions.length - answeredCount}
								</span>
							</div>
						</div>
					</div>

					{/* Banner Peringatan Tambahan jika masih ada soal tersisa */}
					{quizQuestions.length - answeredCount > 0 && (
						<div
							className="p-2.5 px-3 mt-3 d-flex align-items-center gap-2"
							style={{
								backgroundColor: '#FEF2F2',
								border: '1px solid #FEE2E2',
								color: '#991B1B',
								fontSize: '0.825rem',
								borderRadius: '8px',
							}}
						>
							<AlertTriangle size={15} className="flex-shrink-0" />
							<span>
								Perhatian: Masih ada{' '}
								<strong>{quizQuestions.length - answeredCount} soal</strong> yang
								belum diisi!
							</span>
						</div>
					)}
				</Modal.Body>

				{/* Footer Actions */}
				<Modal.Footer className="px-4 pb-4 pt-3 border-top-0 d-flex justify-content-end gap-2">
					<Button
						variant="light"
						onClick={() => setShowSubmitModal(false)}
						className="px-4 py-2 fw-semibold"
						style={{
							borderRadius: '10px',
							backgroundColor: '#FFFFFF',
							border: '1px solid var(--neutral-border, #CBD5E1)',
							color: 'var(--text, #334155)',
							fontSize: '0.875rem',
						}}
					>
						Batal
					</Button>
					<Button
						onClick={handleSubmitQuiz}
						className="px-4 py-2 fw-semibold border-0 d-inline-flex align-items-center gap-2"
						style={{
							backgroundColor: 'var(--primary, #0284C7)',
							color: '#FFFFFF',
							borderRadius: '10px',
							fontSize: '0.875rem',
						}}
					>
						Ya, Kirim Jawaban
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default QuizPage;
