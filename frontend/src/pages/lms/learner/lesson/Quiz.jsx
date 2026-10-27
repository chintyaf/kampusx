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

const Quiz = () => {
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
		<div
			className="p-4 mb-4 rounded-3 bg-white border d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 shadow-sm"
			style={{
				borderColor: '#E2E8F0',
				borderRadius: '16px',
				background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDFA 100%)',
				borderLeft: '4.5px solid #028090',
			}}
		>
			<div className="d-flex align-items-start gap-3">
				<div
					className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
					style={{
						width: 46,
						height: 46,
						backgroundColor: isQuizFullyPassed ? '#DCFCE7' : '#E0F2FE',
						color: isQuizFullyPassed ? '#16A34A' : '#028090',
					}}
				>
					{isQuizFullyPassed ? <CheckCircle2 size={24} /> : <Brain size={24} />}
				</div>
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
							EVALUASI PEMAHAMAN UNIT
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
								className="badge bg-success-subtle text-success fw-bold px-2 py-1 rounded-pill border border-success-subtle d-inline-flex align-items-center gap-1"
								style={{ fontSize: '0.72rem' }}
							>
								<CheckCircle2 size={12} />
								Kuis Tuntas
							</span>
						)}
					</div>
					<h5 className="fw-bold mb-1 text-dark" style={{ fontSize: '1.08rem' }}>
						{isQuizFullyPassed
							? `Micro-Quiz Unit ${currentLesson.number} Telah Tuntas!`
							: `Selesai Membaca Materi Unit ${currentLesson.number}?`}
					</h5>
					<p
						className="text-muted small mb-0"
						style={{ fontSize: '0.86rem', lineHeight: 1.5 }}
					>
						{isQuizFullyPassed
							? 'Pemahaman materi telah teruji. Anda dapat meninjau kuis kembali atau melanjutkan ke langkah belajar selanjutnya.'
							: 'Uji pemahaman Anda lewat kuis singkat 1–2 pertanyaan interaktif untuk membuka akses materi berikutnya.'}
					</p>
				</div>
			</div>

			<Button
				variant="primary"
				className="fw-bold px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2 text-white shadow-sm flex-shrink-0"
				style={{
					backgroundColor: '#028090',
					borderColor: '#028090',
					fontSize: '0.92rem',
				}}
				onClick={() => setShowQuizModal(true)}
			>
				<Zap size={16} />
				<span>
					{isQuizFullyPassed ? 'Buka Ulang Micro-Quiz' : 'Selesai Baca & Cek Pemahaman'}
				</span>
			</Button>
		</div>
	);
};

export default Quiz;

// {/* --- MICRO-QUIZ MODAL POP-UP --- */}
// <Modal show={showQuizModal} onHide={() => setShowQuizModal(false)} centered size="lg">
// 	<Modal.Header closeButton className="border-bottom">
// 		<Modal.Title className="d-flex align-items-center gap-2 h6 mb-0 fw-bold">
// 			<Brain className="text-primary" size={20} />
// 			<span>Kuis Pemahaman: {currentLesson?.title || 'Evaluasi Lesson'}</span>
// 		</Modal.Title>
// 	</Modal.Header>

// 	<Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
// 		{activeQuizList.length === 0 ? (
// 			<p className="text-muted text-center py-3">
// 				Tidak ada kuis pemahaman untuk materi ini.
// 			</p>
// 		) : (
// 			activeQuizList.map((q, qIdx) => {
// 				const selectedOption = selectedAnswers[q.id];
// 				const isQuestionCorrect = selectedOption === q.correctAnswer;

// 				return (
// 					<Card key={q.id || qIdx} className="mb-4 border shadow-sm">
// 						<Card.Body className="p-3 p-md-4">
// 							<div className="d-flex align-items-start justify-content-between gap-2 mb-3">
// 								<h6
// 									className="fw-semibold mb-0"
// 									style={{ fontSize: '0.95rem' }}
// 								>
// 									<span className="text-primary fw-bold me-2">
// 										{qIdx + 1}.
// 									</span>
// 									{q.question || q.title || q.prompt}
// 								</h6>
// 								<Badge bg="light" text="dark" className="border">
// 									+{q.xpReward || 15} XP
// 								</Badge>
// 							</div>

// 							<div className="d-flex flex-column gap-2 mb-3">
// 								{(q.options || []).map((opt, optIdx) => {
// 									const isSelected = selectedOption === optIdx;
// 									const isCorrect = q.correctAnswer === optIdx;

// 									let btnVariant = 'outline-secondary';
// 									if (isQuizSubmitted) {
// 										if (isCorrect) btnVariant = 'success';
// 										else if (isSelected && !isCorrect)
// 											btnVariant = 'danger';
// 									} else if (isSelected) {
// 										btnVariant = 'primary';
// 									}

// 									return (
// 										<Button
// 											key={optIdx}
// 											variant={btnVariant}
// 											className="d-flex align-items-center justify-content-between p-2 px-3 text-start rounded-3"
// 											style={{ fontSize: '0.88rem' }}
// 											onClick={() =>
// 												handleSelectOption(q.id, optIdx)
// 											}
// 											disabled={isQuizSubmitted}
// 										>
// 											<span className="d-flex align-items-center gap-2">
// 												{isSelected ? (
// 													<CheckSquare size={16} />
// 												) : (
// 													<Square size={16} />
// 												)}
// 												<span>{opt}</span>
// 											</span>
// 											{isQuizSubmitted && isCorrect && (
// 												<CheckCircle2
// 													size={16}
// 													className="text-white ms-2"
// 												/>
// 											)}
// 											{isQuizSubmitted &&
// 												isSelected &&
// 												!isCorrect && (
// 													<XCircle
// 														size={16}
// 														className="text-white ms-2"
// 													/>
// 												)}
// 										</Button>
// 									);
// 								})}
// 							</div>

// 							{isQuizSubmitted && q.explanation && (
// 								<Alert
// 									variant={isQuestionCorrect ? 'success' : 'danger'}
// 									className="mb-0 p-2 px-3 small"
// 								>
// 									<div className="d-flex align-items-center gap-2 fw-semibold mb-1">
// 										{isQuestionCorrect ? (
// 											<CheckCircle2 size={16} />
// 										) : (
// 											<AlertCircle size={16} />
// 										)}
// 										<span>
// 											{isQuestionCorrect
// 												? 'Jawaban Tepat!'
// 												: 'Jawaban Kurang Tepat'}
// 										</span>
// 									</div>
// 									<div>{q.explanation}</div>
// 								</Alert>
// 							)}
// 						</Card.Body>
// 					</Card>
// 				);
// 			})
// 		)}
// 	</Modal.Body>

// 	<Modal.Footer className="border-top d-flex align-items-center justify-content-between">
// 		<Button variant="outline-secondary" onClick={() => setShowQuizModal(false)}>
// 			Tutup
// 		</Button>

// 		{!isQuizSubmitted ? (
// 			<Button
// 				variant="primary"
// 				disabled={!isAllAnswered}
// 				onClick={handleConfirmAll}
// 				className="d-inline-flex align-items-center gap-2"
// 			>
// 				<Sparkles size={16} />
// 				<span>Konfirmasi & Periksa Jawaban</span>
// 			</Button>
// 		) : isQuizAllCorrect ? (
// 			<Button
// 				variant="success"
// 				onClick={handleNextLesson}
// 				className="d-inline-flex align-items-center gap-2"
// 			>
// 				<span>Selesai & Lanjut</span>
// 				<ArrowRight size={16} />
// 			</Button>
// 		) : (
// 			<Button
// 				variant="warning"
// 				onClick={handleRetryQuiz}
// 				className="d-inline-flex align-items-center gap-2"
// 			>
// 				<RotateCcw size={16} />
// 				<span>Coba Lagi</span>
// 			</Button>
// 		)}
// 	</Modal.Footer>
// </Modal>

// {/* --- XP TOAST NOTIFICATION --- */}
// {xpToast.show && (
// 	<div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
// 		<Alert
// 			variant="warning"
// 			className="d-flex align-items-center gap-2 shadow-lg mb-0 py-2 px-3 fw-bold"
// 		>
// 			<Zap size={20} className="text-warning fill-warning" />
// 			<span>{xpToast.text}</span>
// 		</Alert>
// 	</div>
// )}

// {/* --- CELEBRATION TOAST --- */}
// {showCelebration && (
// 	<div
// 		className="position-fixed top-0 start-50 translate-middle-x p-3"
// 		style={{ zIndex: 1080 }}
// 	>
// 		<Alert
// 			variant="success"
// 			className="d-flex align-items-center gap-2 shadow-lg mb-0 py-2 px-4 fw-bold"
// 		>
// 			<Award size={20} />
// 			<span>Pelajaran Selesai! Mengalihkan ke materi berikutnya...</span>
// 		</Alert>
// 	</div>
// )}
