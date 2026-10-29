import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ProgressBar, Button, Modal } from 'react-bootstrap';
import {
	ChevronLeft,
	ChevronRight,
	HelpCircle,
	Check,
	ArrowRight,
	Clock,
	AlertTriangle,
	Bookmark,
	Send,
} from 'lucide-react';

// Import Mock Data
import { mockModulesData, mockModuleQuizzes, mockContinueLearning } from '@/data/learningMockData';

const QuizPage = () => {
	const { moduleId = 'mod-arch-101' } = useParams();
	const navigate = useNavigate();

	// Find module data or fallback to mod-arch-101
	const moduleData =
		mockModulesData[moduleId] ||
		(moduleId === 'mod-arch-101' ? mockContinueLearning : mockModulesData['mod-arch-101']) ||
		mockModulesData['1'];

	const moduleTitle = moduleData?.title || 'Web Application Architecture & REST API Design';
	const quizQuestions =
		moduleData?.moduleQuiz?.length > 0
			? moduleData.moduleQuiz
			: mockModuleQuizzes[moduleId] || mockModuleQuizzes['mod-arch-101'];

	const passingScore = moduleData?.passingScore || 75;

	// Active question index (0 to length - 1)
	const [currentQuestion, setCurrentQuestion] = useState(0);

	// User answers map: { [questionIndex]: optionKey }
	const [userAnswers, setUserAnswers] = useState({});

	// Marked for review map: { [questionIndex]: boolean }
	const [markedForReview, setMarkedForReview] = useState({});

	// Timer countdown: 10 minutes (600 seconds)
	const [timeLeft, setTimeLeft] = useState(600);
	const [isTimerRunning, setIsTimerRunning] = useState(true);

	// Modal confirmation
	const [showSubmitModal, setShowSubmitModal] = useState(false);

	// Countdown interval
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

	// Format time mm:ss
	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const currentQ = quizQuestions[currentQuestion] || quizQuestions[0];
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
			setCurrentQuestion(currentQuestion + 1);
		}
	};

	const handlePrev = () => {
		if (currentQuestion > 0) {
			setCurrentQuestion(currentQuestion - 1);
		}
	};

	// Submit quiz and calculate percentage score
	const handleSubmitQuiz = () => {
		setShowSubmitModal(false);
		setIsTimerRunning(false);

		let correctCount = 0;
		quizQuestions.forEach((q, idx) => {
			const userChoice = userAnswers[idx];
			const correctKey =
				q.correct ||
				(q.options && typeof q.correctAnswer === 'number'
					? q.options[q.correctAnswer]?.key
					: null);
			if (userChoice && userChoice === correctKey) {
				correctCount++;
			}
		});

		const scorePercentage = Math.round((correctCount / quizQuestions.length) * 100);
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
	const progressPercent = Math.round((answeredCount / quizQuestions.length) * 100);

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

						{/* Timer & Quick Actions */}
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
					{/* LEFT COLUMN: Progress & Question Navigation Matrix */}
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

								{/* Progress bar */}
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

								{/* Grid of Question Numbers */}
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
												{isAnswered && !isCurrent ? (
													<Check size={14} />
												) : (
													index + 1
												)}
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

								{/* Legend indicator */}
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

					{/* RIGHT COLUMN: Question Card & Interactive Options */}
					<Col lg={9}>
						{/* Top Question Meta Card */}
						<Card
							style={{
								borderRadius: 'var(--radius-lg)',
								border: 'var(--border-w-xs) solid var(--neutral-border)',
								backgroundColor: 'var(--card)',
								padding: 20,
								marginBottom: 16,
								boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
							}}
						>
							<div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
								<div className="d-flex align-items-center gap-2">
									<span
										className="badge border-0 px-3 py-2 fw-bold"
										style={{
											backgroundColor: 'var(--primary)',
											color: 'var(--color-white)',
											borderRadius: 'var(--radius-full)',
											fontSize: 'var(--font-xs)',
										}}
									>
										Soal No. {currentQuestion + 1}
									</span>
									<span
										style={{
											color: 'var(--muted)',
											fontSize: 'var(--font-sm)',
										}}
									>
										dari {quizQuestions.length} pertanyaan
									</span>
									<span
										className="badge border ms-1"
										style={{
											backgroundColor: 'var(--neutral-bg)',
											color: 'var(--muted)',
											borderColor: 'var(--neutral-border)',
											fontSize: 'var(--font-xs)',
										}}
									>
										Ambang Lulus: {passingScore}%
									</span>
								</div>

								<Button
									variant={isCurrentFlagged ? 'warning' : 'outline-secondary'}
									size="sm"
									className="px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap"
									style={{
										borderRadius: 'var(--radius-md)',
										fontSize: 'var(--font-xs)',
										backgroundColor: isCurrentFlagged
											? 'var(--warning-bg)'
											: 'transparent',
										borderColor: isCurrentFlagged
											? 'var(--warning-border)'
											: 'var(--neutral-border)',
										color: isCurrentFlagged
											? 'var(--warning-heading)'
											: 'var(--muted)',
									}}
									onClick={handleToggleFlag}
								>
									<Bookmark
										size={13}
										fill={isCurrentFlagged ? 'currentColor' : 'none'}
									/>
									<span>
										{isCurrentFlagged
											? 'Ditandai Ragu-Ragu'
											: 'Tandai Ragu-Ragu'}
									</span>
								</Button>
							</div>
						</Card>

						{/* Question Text Card */}
						<Card
							style={{
								borderRadius: 'var(--radius-lg)',
								border: 'var(--border-w-xs) solid var(--neutral-border)',
								backgroundColor: 'var(--card)',
								padding: 24,
								marginBottom: 16,
								boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
							}}
						>
							<div className="d-flex gap-3 align-items-start">
								<div
									className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
									style={{
										width: 34,
										height: 34,
										backgroundColor: 'var(--primary-light)',
										color: 'var(--primary)',
									}}
								>
									<HelpCircle size={18} />
								</div>
								<div className="flex-grow-1">
									<h4
										style={{
											fontSize: 'var(--font-md)',
											fontWeight: 700,
											color: 'var(--text)',
											lineHeight: 1.5,
											margin: 0,
										}}
									>
										{currentQ.q || currentQ.question}
									</h4>
								</div>
							</div>
						</Card>

						{/* Multiple Choice Options List */}
						<div className="d-flex flex-column gap-3 mb-3">
							{currentQ.options.map((option, idx) => {
								const optKey =
									typeof option === 'string'
										? String.fromCharCode(65 + idx)
										: option.key || String.fromCharCode(65 + idx);
								const optText = typeof option === 'string' ? option : option.text;
								const isSelected = selectedOption === optKey;

								return (
									<div
										key={optKey}
										onClick={() => handleOptionSelect(optKey)}
										className="p-3 d-flex align-items-center gap-3"
										style={{
											borderRadius: 'var(--radius-md)',
											border: `var(--border-w-xs) solid ${
												isSelected
													? 'var(--primary)'
													: 'var(--neutral-border)'
											}`,
											background: isSelected
												? 'var(--bahama-blue-50)'
												: 'var(--card)',
											cursor: 'pointer',
											boxShadow: isSelected
												? '0 4px 12px rgba(0, 105, 158, 0.08)'
												: 'none',
											transition: 'all 0.15s ease',
										}}
									>
										<div
											style={{
												width: 32,
												height: 32,
												borderRadius: 'var(--radius-full)',
												background: isSelected
													? 'var(--primary)'
													: 'var(--neutral-bg)',
												color: isSelected
													? 'var(--color-white)'
													: 'var(--muted)',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												fontWeight: 700,
												fontSize: 'var(--font-xs)',
												flexShrink: 0,
												transition: 'all 0.15s ease',
											}}
										>
											{optKey}
										</div>

										<span
											style={{
												fontSize: 'var(--font-sm)',
												fontWeight: isSelected ? 600 : 400,
												color: isSelected
													? 'var(--primary)'
													: 'var(--text)',
												lineHeight: 1.5,
											}}
										>
											{optText}
										</span>
									</div>
								);
							})}
						</div>

						{/* Navigation Bottom Action Bar */}
						<Card
							style={{
								borderRadius: 'var(--radius-lg)',
								border: 'var(--border-w-xs) solid var(--neutral-border)',
								backgroundColor: 'var(--card)',
								padding: 18,
								boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
							}}
						>
							<div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
								<Button
									variant="outline-secondary"
									disabled={currentQuestion === 0}
									onClick={handlePrev}
									className="px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2"
									style={{
										borderRadius: 'var(--radius-md)',
										fontSize: 'var(--font-sm)',
										borderColor: 'var(--neutral-border)',
										color: 'var(--muted)',
									}}
								>
									<ChevronLeft size={16} />
									<span>Sebelumnya</span>
								</Button>

								<div className="d-flex align-items-center gap-2">
									{currentQuestion < quizQuestions.length - 1 ? (
										<Button
											onClick={handleNext}
											className="px-4 py-2 fw-bold d-inline-flex align-items-center gap-2 border-0"
											style={{
												backgroundColor: 'var(--text)',
												color: 'var(--color-white)',
												borderRadius: 'var(--radius-md)',
												fontSize: 'var(--font-sm)',
											}}
										>
											<span>Selanjutnya</span>
											<ChevronRight size={16} />
										</Button>
									) : null}

									<Button
										onClick={() => setShowSubmitModal(true)}
										className="px-4 py-2 fw-bold d-inline-flex align-items-center gap-2 border-0 shadow-sm"
										style={{
											backgroundColor: 'var(--primary)',
											color: 'var(--color-white)',
											borderRadius: 'var(--radius-md)',
											fontSize: 'var(--font-sm)',
										}}
									>
										<span>Kirim Jawaban & Lanjut ke Refleksi</span>
										<ArrowRight size={16} />
									</Button>
								</div>
							</div>
						</Card>
					</Col>
				</Row>
			</Container>

			{/* Confirmation Modal */}
			<Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered>
				<Modal.Header closeButton style={{ borderColor: 'var(--neutral-border)' }}>
					<Modal.Title
						className="fw-bold"
						style={{ fontSize: 'var(--font-md)', color: 'var(--text)' }}
					>
						Konfirmasi Pengiriman Jawaban
					</Modal.Title>
				</Modal.Header>
				<Modal.Body style={{ backgroundColor: 'var(--card)' }}>
					<p
						className="mb-3"
						style={{ fontSize: 'var(--font-sm)', color: 'var(--muted)' }}
					>
						Apakah Anda yakin ingin menyelesaikan kuis evaluasi ini sekarang?
					</p>

					<div
						className="p-3 mb-3 border"
						style={{
							backgroundColor: 'var(--neutral-bg)',
							borderColor: 'var(--neutral-border)',
							borderRadius: 'var(--radius-md)',
						}}
					>
						<div
							className="d-flex justify-content-between mb-1"
							style={{ fontSize: 'var(--font-sm)' }}
						>
							<span style={{ color: 'var(--muted)' }}>Total Soal:</span>
							<strong style={{ color: 'var(--text)' }}>
								{quizQuestions.length} Soal
							</strong>
						</div>
						<div
							className="d-flex justify-content-between mb-1"
							style={{ fontSize: 'var(--font-sm)' }}
						>
							<span style={{ color: 'var(--muted)' }}>Soal Terjawab:</span>
							<strong style={{ color: 'var(--success-text)' }}>
								{answeredCount} Soal
							</strong>
						</div>
						{quizQuestions.length - answeredCount > 0 && (
							<div
								className="d-flex justify-content-between"
								style={{ fontSize: 'var(--font-sm)', color: 'var(--danger-text)' }}
							>
								<span>Belum Terjawab:</span>
								<strong>{quizQuestions.length - answeredCount} Soal</strong>
							</div>
						)}
					</div>

					{quizQuestions.length - answeredCount > 0 && (
						<div
							className="p-3 border d-flex align-items-start gap-2"
							style={{
								backgroundColor: 'var(--warning-bg)',
								borderColor: 'var(--warning-border)',
								borderRadius: 'var(--radius-md)',
								color: 'var(--warning-heading)',
								fontSize: 'var(--font-sm)',
							}}
						>
							<AlertTriangle
								size={18}
								className="flex-shrink-0 mt-1"
								style={{ color: 'var(--warning-text)' }}
							/>
							<span>
								Masih ada soal yang belum Anda jawab. Soal yang belum terjawab akan
								dihitung bernilai 0.
							</span>
						</div>
					)}
				</Modal.Body>
				<Modal.Footer style={{ borderColor: 'var(--neutral-border)' }}>
					<Button
						variant="outline-secondary"
						size="sm"
						onClick={() => setShowSubmitModal(false)}
						style={{
							borderRadius: 'var(--radius-sm)',
							fontSize: 'var(--font-xs)',
							borderColor: 'var(--neutral-border)',
							color: 'var(--muted)',
						}}
					>
						Periksa Kembali
					</Button>
					<Button
						size="sm"
						className="border-0"
						style={{
							backgroundColor: 'var(--primary)',
							color: 'var(--color-white)',
							borderRadius: 'var(--radius-sm)',
							fontSize: 'var(--font-xs)',
						}}
						onClick={handleSubmitQuiz}
					>
						Ya, Kirim Sekarang
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default QuizPage;
