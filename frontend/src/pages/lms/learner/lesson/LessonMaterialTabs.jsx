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

const LessonMaterialTabs = () => {
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
		<div className="lesson-material-card">
			<div className="lesson-tabs-nav">
				<Nav
					variant="tabs"
					activeKey={activeTab}
					onSelect={(k) => setActiveTab(k)}
					className="border-0"
				>
					<Nav.Item>
						<Nav.Link eventKey="video" className="lesson-tab-button">
							<PlayCircle size={16} />
							<span>Rangkuman Materi</span>
						</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link eventKey="summary" className="lesson-tab-button">
							<Code size={16} />
							<span>Contoh Kode & Payload</span>
						</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link eventKey="notes" className="lesson-tab-button">
							<FileText size={16} />
							<span>Catatan Pribadi ({notesList.length})</span>
						</Nav.Link>
					</Nav.Item>
				</Nav>
			</div>

			<div className="lesson-material-padding">
				{activeTab === 'video' && (
					<div>
						<h5 className="fw-bold mb-2 text-dark" style={{ fontSize: '1.08rem' }}>
							Pokok Bahasan Unit {currentLesson.number}: {currentLesson.title}
						</h5>
						<p
							className="text-muted mb-3"
							style={{ fontSize: '0.88rem', lineHeight: 1.6 }}
						>
							{currentLesson.summary}
						</p>

						{/* Key Concept Highlights inside srl-box-card */}
						<div className="srl-box-card">
							<h6
								className="fw-bold text-dark small mb-2 d-flex align-items-center gap-2"
								style={{ fontSize: '0.85rem' }}
							>
								<Sparkles size={15} style={{ color: '#028090' }} />
								<span>Prinsip Kunci yang Dipelajari:</span>
							</h6>
							<ul
								className="text-muted small mb-0 ps-3 d-flex flex-column gap-2"
								style={{ fontSize: '0.84rem' }}
							>
								<li>
									<strong>Idempotency:</strong> Permintaan berulang dengan
									parameter identik harus menghasilkan state server yang sama
									tanpa efek samping ganda.
								</li>
								<li>
									<strong>Rate Limiting:</strong> Algoritma Sliding Window counter
									dan Token Bucket memastikan sistem tidak kolaps dari burst
									traffic atau brute-force attack.
								</li>
								<li>
									<strong>Distributed Cache:</strong> Gunakan Redis TTL
									(Time-To-Live) pada idempotency key (misal 24 jam) untuk
									efisiensi penyimpanan memori.
								</li>
							</ul>
						</div>
					</div>
				)}

				{activeTab === 'summary' && (
					<div>
						<div className="d-flex align-items-center justify-content-between mb-2">
							<span
								className="fw-bold text-dark small"
								style={{ fontSize: '0.875rem' }}
							>
								Contoh Implementasi REST Endpoint:
							</span>
							<Button
								variant="light"
								size="sm"
								className="border px-3 py-1 d-inline-flex align-items-center gap-1 small text-secondary"
								onClick={handleCopyCode}
							>
								{copiedCode ? (
									<Check size={13} className="text-success" />
								) : (
									<Copy size={13} />
								)}
								<span style={{ fontSize: '0.78rem' }}>
									{copiedCode ? 'Tersalin' : 'Salin Kode'}
								</span>
							</Button>
						</div>

						<pre
							className="p-3 rounded-3 text-white font-monospace overflow-x-auto mb-0"
							style={{
								backgroundColor: '#0F172A',
								fontSize: '0.82rem',
								lineHeight: 1.5,
								borderRadius: '10px',
							}}
						>
							{currentLesson.codeSnippet}
						</pre>
					</div>
				)}

				{activeTab === 'notes' && (
					<div>
						<Form onSubmit={handleAddNote} className="mb-3">
							<div className="d-flex gap-2">
								<Form.Control
									type="text"
									placeholder="Ketik catatan penting pada menit ini..."
									value={newNoteInput}
									onChange={(e) => setNewNoteInput(e.target.value)}
									className="rounded-3 shadow-none border"
									style={{ fontSize: '0.875rem' }}
								/>
								<Button
									type="submit"
									variant="primary"
									className="px-3 rounded-3 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap"
									style={{
										backgroundColor: '#028090',
										borderColor: '#028090',
									}}
								>
									<Send size={14} />
									<span className="d-none d-sm-inline">Simpan Catatan</span>
								</Button>
							</div>
						</Form>

						<div className="d-flex flex-column gap-2">
							{notesList.map((n) => (
								<div
									key={n.id}
									className="p-2 rounded-3 border bg-light d-flex align-items-start gap-2"
								>
									<span
										className="badge bg-secondary font-monospace"
										style={{ fontSize: '0.72rem' }}
									>
										{n.time}
									</span>
									<span
										className="text-dark small flex-grow-1"
										style={{
											fontSize: '0.84rem',
											lineHeight: 1.45,
										}}
									>
										{n.text}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default LessonMaterialTabs;
