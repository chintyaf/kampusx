import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
	Container,
	Row,
	Col,
	Card,
	Button,
	Badge,
	Offcanvas,
	ProgressBar,
	Form,
	Nav,
	Alert,
	Modal,
} from 'react-bootstrap';
import {
	ChevronLeft,
	ChevronRight,
	Play,
	PlayCircle,
	Pause,
	RotateCcw,
	Volume2,
	VolumeX,
	Maximize2,
	FileText,
	CheckCircle2,
	CheckSquare,
	Square,
	Bookmark,
	Share2,
	Sparkles,
	HelpCircle,
	Menu,
	X,
	Brain,
	ThumbsUp,
	AlertCircle,
	Star,
	Copy,
	Check,
	Send,
	Clock,
	BookOpen,
	Award,
	Layers,
	Code,
	Flame,
	ArrowRight,
	Zap,
	Lock,
	XCircle,
} from 'lucide-react';
import { MODULE_LESSONS_DATA, mockLessonMicroQuizzes } from '@/pages/lms/mock-data/mockData';

const QuizModal = () => {
	const { moduleId = 'mod-arch-101', lessonId = 'les-4' } = useParams();
	const navigate = useNavigate();

	// Find active lesson
	const activeLessonIndex = MODULE_LESSONS_DATA.findIndex((l) => l.id === lessonId);
	const currentLessonIndex = activeLessonIndex !== -1 ? activeLessonIndex : 3;
	const currentLesson = MODULE_LESSONS_DATA[currentLessonIndex];

	// Track completed lessons set
	const [completedLessonIds, setCompletedLessonIds] = useState(
		new Set(['les-1', 'les-2', 'les-3']),
	);

	// Micro-Quiz data for current lesson
	const activeQuizList = currentLesson?.microQuiz?.length
		? currentLesson.microQuiz
		: mockLessonMicroQuizzes[currentLesson.id] || mockLessonMicroQuizzes['les-4'] || [];

	// Micro-Quiz interactive state: simultaneous batch evaluation (Pilih Semua Soal -> Konfirmasi Bersamaan)
	const [showQuizModal, setShowQuizModal] = useState(false);
	const [selectedAnswers, setSelectedAnswers] = useState({}); // { [q.id]: optionIndex }
	const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
	const [isMicroQuizCompleted, setIsMicroQuizCompleted] = useState(false);
	const [xpToast, setXpToast] = useState({ show: false, xp: 0, text: '' });
	const [awardedXpQuestions, setAwardedXpQuestions] = useState(new Set());

	// Check completion on mount or lesson change
	useEffect(() => {
		const isDone =
			getLessonMicroQuizStatus(currentLesson.id) || completedLessonIds.has(currentLesson.id);
		setIsMicroQuizCompleted(isDone);

		if (isDone) {
			const initial = {};
			activeQuizList.forEach((q) => {
				initial[q.id] = q.correctAnswer;
			});
			setSelectedAnswers(initial);
			setIsQuizSubmitted(true);
		} else {
			setSelectedAnswers({});
			setIsQuizSubmitted(false);
		}
		setShowQuizModal(false);
	}, [currentLesson.id]);

	// Tahap 1: Pilih Opsi Jawaban (bebas memilih per soal sebelum evaluasi serentak)
	const handleSelectOption = (qId, optionIdx) => {
		if (isQuizSubmitted) return; // opsi terkunci saat evaluasi hasil sudah disubmit
		setSelectedAnswers((prev) => ({
			...prev,
			[qId]: optionIdx,
		}));
	};

	// Validasi apakah seluruh soal sudah dijawab
	const totalQuestions = activeQuizList.length;
	const isAllAnswered =
		totalQuestions > 0 &&
		activeQuizList.every(
			(q) => selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== null,
		);

	// Validasi apakah seluruh jawaban benar
	const isQuizAllCorrect =
		isAllAnswered && activeQuizList.every((q) => selectedAnswers[q.id] === q.correctAnswer);

	const isQuizFullyPassed = isMicroQuizCompleted || (isQuizSubmitted && isQuizAllCorrect);

	// Tahap 2: Konfirmasi & Periksa Semua Jawaban Bersamaan (isSubmitted = true)
	const handleConfirmAll = () => {
		if (!isAllAnswered) return;
		setIsQuizSubmitted(true);

		if (isQuizAllCorrect) {
			setIsMicroQuizCompleted(true);
			setLessonMicroQuizCompleted(currentLesson.id);
			setCompletedLessonIds((prev) => new Set([...prev, currentLesson.id]));

			// Hitung total reward XP kuis
			const totalXp = activeQuizList.reduce((acc, q) => acc + (q.xpReward || 15), 0);

			// Tampilkan toast selebrasi perolehan XP jika belum pernah diperoleh
			const anyUnawarded = activeQuizList.some((q) => !awardedXpQuestions.has(q.id));
			if (anyUnawarded) {
				addLearnerXp(totalXp);
				setAwardedXpQuestions((prev) => {
					const next = new Set(prev);
					activeQuizList.forEach((q) => next.add(q.id));
					return next;
				});
				setXpToast({
					show: true,
					xp: totalXp,
					text: `+${totalXp} XP Diperoleh!`,
				});
				setTimeout(() => {
					setXpToast((prev) => ({ ...prev, show: false }));
				}, 2800);
			}
		}
	};

	// Reset saat Coba Lagi / Ulangi Kuis (Meriset state pilihan jawaban)
	const handleRetryQuiz = () => {
		setSelectedAnswers({});
		setIsQuizSubmitted(false);
	};

	// Drawer state for mobile
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	// Player states
	const [isPlaying, setIsPlaying] = useState(false);
	const [playbackSpeed, setPlaybackSpeed] = useState('1x');
	const [isMuted, setIsMuted] = useState(false);
	const [videoProgress, setVideoProgress] = useState(45);
	const [activeTab, setActiveTab] = useState('video'); // 'video' | 'summary' | 'notes'

	const [showCelebration, setShowCelebration] = useState(false);

	// Notes state
	const [notesList, setNotesList] = useState([
		{
			id: 1,
			time: '02:40',
			text: 'Idempotency Key wajib dikirim pada header POST request untuk mencegah duplicate billing.',
		},
		{
			id: 2,
			time: '05:15',
			text: 'Redis setnx atau atomicity key sangat efektif sebagai distributed lock sebelum transaksi dijalankan.',
		},
	]);
	const [newNoteInput, setNewNoteInput] = useState('');
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [copiedCode, setCopiedCode] = useState(false);

	// Check if current lesson is last in module
	const isLastLesson = currentLessonIndex === MODULE_LESSONS_DATA.length - 1;
	const isUnlocked = isQuizFullyPassed || completedLessonIds.has(currentLesson.id);

	// Jump freely to any lesson
	const handleSelectLesson = (id) => {
		setIsSidebarOpen(false);
		navigate(`/learner/modules/${moduleId}/lesson/${id}`);
	};

	// Navigate to Next Lesson or Module Quiz if last
	const handleNextLesson = () => {
		setShowQuizModal(false);
		if (!isUnlocked) return;
		if (currentLessonIndex < MODULE_LESSONS_DATA.length - 1) {
			const nextId = MODULE_LESSONS_DATA[currentLessonIndex + 1].id;
			navigate(`/learner/modules/${moduleId}/lesson/${nextId}`);
		} else {
			navigate(`/learner/modules/${moduleId}/quiz`);
		}
	};

	// Navigate to Prev Lesson
	const handlePrevLesson = () => {
		if (currentLessonIndex > 0) {
			const prevId = MODULE_LESSONS_DATA[currentLessonIndex - 1].id;
			navigate(`/learner/modules/${moduleId}/lesson/${prevId}`);
		}
	};

	// Complete and advance
	const handleMarkCompleteAndNext = () => {
		if (!isUnlocked) return;
		setCompletedLessonIds((prev) => new Set([...prev, currentLesson.id]));
		setLessonMicroQuizCompleted(currentLesson.id);
		setShowCelebration(true);

		setTimeout(() => {
			setShowCelebration(false);
			if (currentLessonIndex < MODULE_LESSONS_DATA.length - 1) {
				const nextId = MODULE_LESSONS_DATA[currentLessonIndex + 1].id;
				navigate(`/learner/modules/${moduleId}/lesson/${nextId}`);
			} else {
				navigate(`/learner/modules/${moduleId}/quiz`);
			}
		}, 1200);
	};

	// Save personal note
	const handleAddNote = (e) => {
		e.preventDefault();
		if (!newNoteInput.trim()) return;
		const newNote = {
			id: Date.now(),
			time: '04:15',
			text: newNoteInput.trim(),
		};
		setNotesList((prev) => [newNote, ...prev]);
		setNewNoteInput('');
	};

	const handleCopyCode = () => {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(currentLesson.codeSnippet);
			setCopiedCode(true);
			setTimeout(() => setCopiedCode(false), 2000);
		}
	};

	// Reading progress percentage
	const readingProgressPercent = Math.min(
		100,
		Math.round(
			((currentLessonIndex + (completedLessonIds.has(currentLesson.id) ? 1 : 0.5)) /
				MODULE_LESSONS_DATA.length) *
				100,
		),
	);
	return (
		<Modal
			show={showQuizModal}
			onHide={() => setShowQuizModal(false)}
			size="lg"
			centered
			backdrop="static"
			keyboard={false}
			animation={false}
			contentClassName="border-0 shadow-lg rounded-3 overflow-hidden"
		>
			{/* Header Modal */}
			<Modal.Header closeButton className="border-bottom px-4 py-3 bg-light">
				<div>
					<div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
						<span
							className="badge px-3 py-1 rounded-pill fw-bold text-uppercase"
							style={{
								backgroundColor: '#E0F2FE',
								color: '#028090',
								fontSize: '0.72rem',
							}}
						>
							MICRO-QUIZ CHECKPOINT
						</span>
						<span
							className="badge px-3 py-1 rounded-pill fw-bold"
							style={{
								backgroundColor: '#FEF3C7',
								color: '#D97706',
								fontSize: '0.72rem',
							}}
						>
							<Zap size={12} className="me-1" fill="currentColor" />
							+15 XP per Soal
						</span>
						{isQuizFullyPassed && (
							<span
								className="badge bg-success-subtle text-success fw-bold px-3 py-1 rounded-pill border border-success-subtle d-inline-flex align-items-center gap-1"
								style={{ fontSize: '0.72rem' }}
							>
								<CheckCircle2 size={13} />
								Lulus Checkpoint
							</span>
						)}
					</div>
					<Modal.Title className="fw-bold text-dark fs-5 mb-0">
						Cek Pemahaman Cepat Unit {currentLesson.number}
					</Modal.Title>
				</div>
			</Modal.Header>

			{/* Body Modal */}
			<Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
				<div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
					<p
						className="text-muted small mb-0"
						style={{ fontSize: '0.86rem', lineHeight: 1.5 }}
					>
						Pilih jawaban untuk semua pertanyaan di bawah, lalu klik konfirmasi untuk
						evaluasi serentak.
					</p>
					<span
						className="badge px-3 py-1 rounded-pill fw-semibold text-muted border bg-white"
						style={{ fontSize: '0.75rem' }}
					>
						{Object.keys(selectedAnswers).length} / {totalQuestions} Soal Terpilih
					</span>
				</div>

				{/* Questions List */}
				<div className="d-flex flex-column gap-3">
					{activeQuizList.map((q, qIndex) => {
						const selected = selectedAnswers[q.id];
						const isQCorrect = isQuizSubmitted && selected === q.correctAnswer;

						// Container styling based on submission state
						let containerBg = '#F8FAFC';
						let containerBorder = '#E2E8F0';

						if (isQuizSubmitted) {
							if (isQCorrect) {
								containerBg = '#F0FDF4';
								containerBorder = '#86EFAC';
							} else {
								containerBg = '#FEF2F2';
								containerBorder = '#FECACA';
							}
						}

						return (
							<div
								key={q.id || qIndex}
								className="p-3 rounded-3 border"
								style={{
									backgroundColor: containerBg,
									borderColor: containerBorder,
									transition: 'all 0.2s ease',
								}}
							>
								{/* Question Text & Number Indicator */}
								<div className="d-flex align-items-start gap-2 mb-3">
									<span
										className="badge rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
										style={{
											width: 24,
											height: 24,
											backgroundColor:
												isQuizSubmitted && isQCorrect
													? '#16A34A'
													: isQuizSubmitted && !isQCorrect
														? '#EF4444'
														: '#0F172A',
											color: '#FFFFFF',
											fontSize: '0.75rem',
										}}
									>
										{isQuizSubmitted && isQCorrect ? (
											<Check size={14} />
										) : isQuizSubmitted && !isQCorrect ? (
											<X size={14} />
										) : (
											qIndex + 1
										)}
									</span>
									<div
										className="fw-bold text-dark"
										style={{
											fontSize: '0.92rem',
											lineHeight: 1.45,
										}}
									>
										{q.question}
									</div>
								</div>

								{/* Options List */}
								<div className="d-flex flex-column gap-2">
									{q.options.map((opt, optIndex) => {
										const isSelected = selected === optIndex;
										const letterLabels = ['A', 'B', 'C', 'D'];

										// Default option styling (neutral)
										let optBg = '#FFFFFF';
										let optBorder = '1px solid #E2E8F0';
										let optColor = '#334155';
										let optFontWeight = 400;
										let badgeBg = '#F1F5F9';
										let badgeColor = '#475569';
										let rightIcon = null;

										// TAHAP 1: Pemilihan Jawaban Bebas (isSubmitted = false)
										if (!isQuizSubmitted) {
											if (isSelected) {
												optBg = '#F0F9FF';
												optBorder = '2px solid #028090';
												optColor = '#0369A1';
												optFontWeight = 600;
												badgeBg = '#028090';
												badgeColor = '#FFFFFF';
											}
										}
										// TAHAP 2: Hasil & Evaluasi Serentak (isSubmitted = true)
										else {
											if (optIndex === q.correctAnswer) {
												// Opsi Benar: Latar/border Hijau + badge 'Kunci Jawaban' / ikon centang
												if (isSelected) {
													optBg = '#DCFCE7';
													optBorder = '2px solid #16A34A';
													optColor = '#15803D';
													optFontWeight = 700;
													badgeBg = '#16A34A';
													badgeColor = '#FFFFFF';
													rightIcon = (
														<div className="d-flex align-items-center gap-2 flex-shrink-0">
															<span
																className="badge bg-success text-white py-1 px-2 small fw-bold"
																style={{
																	fontSize: '0.7rem',
																}}
															>
																Kunci Jawaban
															</span>
															<CheckCircle2
																size={18}
																className="text-success"
															/>
														</div>
													);
												} else {
													optBg = '#F0FDF4';
													optBorder = '2px dashed #16A34A';
													optColor = '#15803D';
													optFontWeight = 600;
													badgeBg = '#16A34A';
													badgeColor = '#FFFFFF';
													rightIcon = (
														<div className="d-flex align-items-center gap-2 flex-shrink-0">
															<span
																className="badge bg-success-subtle text-success border border-success-subtle py-1 px-2 small fw-bold"
																style={{
																	fontSize: '0.7rem',
																}}
															>
																Kunci Jawaban
															</span>
															<CheckCircle2
																size={16}
																className="text-success"
															/>
														</div>
													);
												}
											} else if (isSelected) {
												// Opsi Salah yang dipilih pengguna: Latar/border Merah + ikon silang (X)
												optBg = '#FEE2E2';
												optBorder = '2px solid #EF4444';
												optColor = '#B91C1C';
												optFontWeight = 600;
												badgeBg = '#EF4444';
												badgeColor = '#FFFFFF';
												rightIcon = (
													<XCircle
														size={18}
														className="text-danger flex-shrink-0"
													/>
												);
											} else {
												optBg = '#F8FAFC';
												optBorder = '1px solid #E2E8F0';
												optColor = '#94A3B8';
												badgeBg = '#F1F5F9';
												badgeColor = '#94A3B8';
											}
										}

										return (
											<div
												key={optIndex}
												onClick={() =>
													!isQuizSubmitted &&
													handleSelectOption(q.id, optIndex)
												}
												className="p-2 px-3 rounded-3 d-flex align-items-center gap-2"
												style={{
													backgroundColor: optBg,
													border: optBorder,
													color: optColor,
													fontWeight: optFontWeight,
													cursor: isQuizSubmitted ? 'default' : 'pointer',
													fontSize: '0.86rem',
													lineHeight: 1.4,
													transition: 'all 0.15s ease',
												}}
											>
												<span
													className="badge rounded-pill fw-bold flex-shrink-0"
													style={{
														backgroundColor: badgeBg,
														color: badgeColor,
														fontSize: '0.72rem',
														width: 22,
														height: 22,
														display: 'inline-flex',
														alignItems: 'center',
														justifyContent: 'center',
													}}
												>
													{letterLabels[optIndex] || optIndex + 1}
												</span>
												<span className="flex-grow-1">{opt}</span>
												{rightIcon}
											</div>
										);
									})}
								</div>

								{/* Kotak Penjelasan (Explanation Box) - Muncul serentak setelah dikonfirmasi */}
								{isQuizSubmitted && (
									<div className="mt-3">
										{isQCorrect ? (
											<div className="p-3 rounded-3 bg-white border border-success-subtle text-success small d-flex align-items-start gap-2 shadow-sm">
												<CheckCircle2
													size={20}
													className="text-success flex-shrink-0 mt-1"
												/>
												<div className="flex-grow-1">
													<div className="d-flex align-items-center gap-2 mb-1">
														<strong
															className="text-success"
															style={{
																fontSize: '0.88rem',
															}}
														>
															Sangat Tepat!
														</strong>
														<span
															className="badge bg-success text-white fw-bold px-2 py-1 rounded-pill"
															style={{
																fontSize: '0.68rem',
															}}
														>
															+{q.xpReward || 15} XP
														</span>
													</div>
													<p
														className="text-dark mb-0"
														style={{
															fontSize: '0.84rem',
															lineHeight: 1.5,
															color: '#334155',
														}}
													>
														{q.explanation}
													</p>
												</div>
											</div>
										) : (
											<div className="p-3 rounded-3 bg-white border border-danger-subtle small d-flex align-items-start gap-2 shadow-sm">
												<XCircle
													size={20}
													className="text-danger flex-shrink-0 mt-1"
												/>
												<div className="flex-grow-1">
													<strong
														className="d-block mb-1 text-danger"
														style={{
															fontSize: '0.88rem',
														}}
													>
														Belum Tepat
													</strong>
													<p
														className="text-muted mb-0"
														style={{
															fontSize: '0.84rem',
															lineHeight: 1.5,
															color: '#475569',
														}}
													>
														{q.explanation}
													</p>
												</div>
											</div>
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>

				{/* Micro-Quiz Completion Banner inside Modal */}
				{isQuizSubmitted && isQuizAllCorrect && (
					<div
						className="p-3 mt-3 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
						style={{
							backgroundColor: '#ECFDF5',
							border: '1.5px solid #A7F3D0',
						}}
					>
						<div className="d-flex align-items-center gap-2">
							<Sparkles size={18} className="text-success" />
							<span className="fw-bold small text-success">
								Luar biasa! Semua jawaban benar. Akses ke materi berikutnya telah
								dibuka.
							</span>
						</div>
						<span className="badge bg-success text-white px-3 py-1 rounded-pill small fw-bold">
							Lulus Checkpoint
						</span>
					</div>
				)}

				{/* Banner saat ada jawaban salah */}
				{isQuizSubmitted && !isQuizAllCorrect && (
					<div
						className="p-3 mt-3 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
						style={{
							backgroundColor: '#FEF2F2',
							border: '1.5px solid #FECACA',
						}}
					>
						<div className="d-flex align-items-center gap-2">
							<AlertCircle size={18} className="text-danger" />
							<span className="fw-bold small text-danger">
								Ada jawaban yang belum tepat. Silakan ulangi kuis untuk melanjutkan
								ke materi berikutnya.
							</span>
						</div>
						<Button
							variant="outline-danger"
							size="sm"
							className="fw-bold px-3 py-1 rounded-pill d-inline-flex align-items-center gap-1"
							style={{ fontSize: '0.78rem' }}
							onClick={handleRetryQuiz}
						>
							<RotateCcw size={13} />
							Ulangi Kuis
						</Button>
					</div>
				)}
			</Modal.Body>

			{/* Footer Modal */}
			<Modal.Footer className="border-top px-4 py-3 bg-light d-flex align-items-center justify-content-between">
				<Button
					variant="outline-secondary"
					size="sm"
					className="rounded-3 px-3 py-1 fw-semibold"
					style={{ fontSize: '0.84rem' }}
					onClick={() => setShowQuizModal(false)}
				>
					Tutup
				</Button>

				<div>
					{!isQuizSubmitted ? (
						// TAHAP 1: Belum Disubmit
						!isAllAnswered ? (
							<Button
								variant="secondary"
								disabled
								className="fw-semibold px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2 opacity-75 text-white"
								style={{
									backgroundColor: '#94A3B8',
									borderColor: '#94A3B8',
									fontSize: '0.86rem',
									cursor: 'not-allowed',
								}}
							>
								<Lock size={15} />
								<span>Jawab Semua Kuis untuk Melanjutkan</span>
							</Button>
						) : (
							<Button
								variant="primary"
								className="fw-bold px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2 text-white shadow-sm"
								style={{
									backgroundColor: '#028090',
									borderColor: '#028090',
									fontSize: '0.88rem',
								}}
								onClick={handleConfirmAll}
							>
								<CheckCircle2 size={16} />
								<span>Konfirmasi & Periksa Semua Jawaban</span>
							</Button>
						)
					) : // TAHAP 2: Pasca-Konfirmasi (isQuizSubmitted = true)
					isQuizAllCorrect ? (
						isLastLesson ? (
							<Button
								variant="primary"
								className="fw-bold px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2 text-white shadow-sm"
								style={{
									backgroundColor: '#028090',
									borderColor: '#028090',
									fontSize: '0.88rem',
								}}
								onClick={() => {
									setShowQuizModal(false);
									navigate(`/learner/modules/${moduleId}/quiz`);
								}}
							>
								<span>Selesai Modul & Ke Evaluasi Modul</span>
								<Award size={16} />
							</Button>
						) : (
							<Button
								variant="primary"
								className="fw-bold px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2 text-white shadow-sm"
								style={{
									backgroundColor: '#028090',
									borderColor: '#028090',
									fontSize: '0.88rem',
								}}
								onClick={() => {
									setShowQuizModal(false);
									handleNextLesson();
								}}
							>
								<span>Lanjut ke Lesson Berikutnya</span>
								<ArrowRight size={16} />
							</Button>
						)
					) : (
						<Button
							variant="warning"
							className="fw-bold px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2 text-white shadow-sm"
							style={{
								backgroundColor: '#D97706',
								borderColor: '#D97706',
								fontSize: '0.88rem',
							}}
							onClick={handleRetryQuiz}
						>
							<RotateCcw size={15} />
							<span>Coba Lagi / Ulangi Kuis</span>
						</Button>
					)}
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default QuizModal;


