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

const LessonMediaPlayer = () => {
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
		<div className="lesson-video-card">
			<div
				className="position-relative ratio ratio-16x9"
				style={{ backgroundColor: '#0B2545' }}
			>
				<img
					src={currentLesson.videoUrl}
					alt={currentLesson.title}
					style={{
						objectFit: 'cover',
						width: '100%',
						height: '100%',
						opacity: isPlaying ? 0.95 : 0.8,
						filter: isPlaying ? 'none' : 'brightness(0.85)',
					}}
				/>

				{/* Big Center Play / Pause Overlay Button */}
				<div
					className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center"
					style={{ zIndex: 10, cursor: 'pointer' }}
					onClick={() => setIsPlaying(!isPlaying)}
				>
					<div
						className="rounded-circle d-flex align-items-center justify-content-center shadow-lg"
						style={{
							width: '64px',
							height: '64px',
							backgroundColor: 'rgba(2, 128, 144, 0.92)',
							color: '#FFFFFF',
							backdropFilter: 'blur(8px)',
							border: '2px solid rgba(255, 255, 255, 0.35)',
							transition: 'transform 0.2s ease',
						}}
					>
						{isPlaying ? (
							<Pause size={28} />
						) : (
							<Play size={28} className="ms-1" fill="currentColor" />
						)}
					</div>
				</div>

				{/* Interactive Player Controls Bar (Bottom of Video) */}
				<div
					className="position-absolute bottom-0 start-0 end-0 p-3 d-flex flex-column gap-2"
					style={{
						background:
							'linear-gradient(to top, rgba(11, 37, 69, 0.92) 0%, transparent 100%)',
						zIndex: 11,
					}}
				>
					{/* Timeline Scrubbing Bar */}
					<div
						className="position-relative w-100"
						style={{
							height: '5px',
							backgroundColor: 'rgba(255, 255, 255, 0.3)',
							borderRadius: '999px',
							cursor: 'pointer',
						}}
						onClick={(e) => {
							const rect = e.currentTarget.getBoundingClientRect();
							const clickX = e.clientX - rect.left;
							const newPercent = Math.min(
								100,
								Math.max(0, (clickX / rect.width) * 100),
							);
							setVideoProgress(newPercent);
						}}
					>
						<div
							style={{
								height: '100%',
								width: `${videoProgress}%`,
								backgroundColor: '#028090',
								borderRadius: '999px',
							}}
						/>
					</div>

					{/* Player Controls Row */}
					<div className="d-flex align-items-center justify-content-between text-white small">
						<div className="d-flex align-items-center gap-2 gap-sm-3">
							<button
								type="button"
								className="btn btn-link text-white p-0 text-decoration-none"
								onClick={() => setIsPlaying(!isPlaying)}
							>
								{isPlaying ? (
									<Pause size={18} />
								) : (
									<Play size={18} fill="currentColor" />
								)}
							</button>

							<button
								type="button"
								className="btn btn-link text-white p-0 text-decoration-none"
								onClick={() => setIsMuted(!isMuted)}
							>
								{isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
							</button>

							<span style={{ fontSize: '0.8rem', color: '#E2E8F0' }}>
								04:15 / {currentLesson.videoDuration}
							</span>
						</div>

						<div className="d-flex align-items-center gap-2">
							<button
								type="button"
								className="btn btn-sm btn-dark text-white border-0 py-1 px-2 rounded-2 fw-semibold"
								style={{
									fontSize: '0.75rem',
									backgroundColor: 'rgba(255, 255, 255, 0.2)',
								}}
								onClick={() => {
									const speeds = ['1x', '1.25x', '1.5x'];
									const nextIdx =
										(speeds.indexOf(playbackSpeed) + 1) % speeds.length;
									setPlaybackSpeed(speeds[nextIdx]);
								}}
							>
								{playbackSpeed}
							</button>

							<button
								type="button"
								className="btn btn-link text-white p-0 text-decoration-none"
								onClick={() => alert('Mode layar penuh diaktifkan.')}
							>
								<Maximize2 size={16} />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LessonMediaPlayer;
