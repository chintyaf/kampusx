import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
	Container,
	Form,
	Button,
	Row,
	Col,
	Alert,
	Spinner,
	Modal,
	Collapse,
} from 'react-bootstrap';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const MOCK_LEARNING_PATH = {
	title: 'Full-Stack Web Development with REST API',
	category: 'Software Engineering',
	level: 'Intermediate',
	description:
		'Pelajari cara merancang, membangun, dan mengamankan RESTful API modern untuk aplikasi web skala produksi.',
};

const INITIAL_MOCK_MODULES = [
	{
		id: 'mod-1',
		title: 'Modul 1: Prinsip Dasar RESTful API & HTTP Methods',
		description:
			'Memahami arsitektur REST, konvensi penamaan endpoint, serta karakteristik metode HTTP dalam komunikasi client-server.',
		lessons: [
			{
				id: 'mod-1-les-1',
				title: '1.1 Anatomi HTTP Request, Headers, & Idempotensi',
				learningObjectives:
					'Mahasiswa mampu menjelaskan struktur HTTP Request dan membedakan metode yang bersifat idempoten.',
				content:
					'Metode HTTP GET, PUT, dan DELETE harus bersifat idempoten — mengeksekusi request yang sama beberapa kali menghasilkan state yang sama pada server.\n\nSelain itu, penggunaan header seperti Content-Type dan Authorization sangat penting untuk memastikan pertukaran data berjalan aman dan terstandarisasi.',
				summary:
					'Memahami komponen HTTP Request/Response dan pentingnya idempotensi pada metode GET, PUT, dan DELETE.',
			},
			{
				id: 'mod-1-les-2',
				title: '1.2 Desain Endpoint Semantik & Versioning API',
				learningObjectives:
					'Mahasiswa mampu merancang URI endpoint yang bersih, konsisten, dan mendukung versioning.',
				content:
					'Gunakan kata benda jamak untuk koleksi sumber daya (misalnya /api/v1/students) dan hindari kata kerja di dalam URI.\n\nVersioning seperti /api/v1/ membantu menjaga kompatibilitas mundur saat terjadi perubahan kontrak API di masa depan.',
				summary:
					'Praktik terbaik penamaan endpoint berbasis resource dan penerapan API versioning.',
			},
		],
		quiz: {
			passingScore: 75,
			questions: [
				{
					id: 'mod-1-q-1',
					question:
						'Manakah kelompok metode HTTP yang diwajibkan bersifat idempoten menurut standar RFC 7231?',
					options: [
						'GET, PUT, dan DELETE',
						'POST dan PATCH saja',
						'Hanya POST',
						'Hanya CONNECT dan TRACE',
					],
					correctAnswer: 0,
					explanation:
						'GET, PUT, dan DELETE bersifat idempoten karena pemanggilan berulang tidak mengubah hasil akhir state resource di server.',
				},
				{
					id: 'mod-1-q-2',
					question:
						'Contoh penulisan endpoint RESTful yang sesuai dengan konvensi semantik adalah...',
					options: [
						'POST /api/v1/createStudent',
						'GET /api/v1/students',
						'DELETE /api/v1/remove-all-students-now',
						'GET /api/v1/getStudentList',
					],
					correctAnswer: 1,
					explanation:
						'Endpoint RESTful menggunakan kata benda jamak (students) dan mengandalkan HTTP method (GET) untuk menyatakan aksi.',
				},
			],
		},
	},
	{
		id: 'mod-2',
		title: 'Modul 2: Keamanan API, Validasi Input, & Autentikasi JWT',
		description:
			'Membahas implementasi autentikasi stateless menggunakan JSON Web Token (JWT), validasi request, dan mitigasi celah keamanan umum.',
		lessons: [
			{
				id: 'mod-2-les-1',
				title: '2.1 Implementasi Stateless Token Bearer & Signing Algoritma',
				learningObjectives:
					'Mahasiswa mampu menjelaskan struktur JWT (Header, Payload, Signature) dan cara verifikasinya.',
				content:
					'JSON Web Token (JWT) terdiri dari tiga bagian utama: Header, Payload, dan Signature.\n\nKunci rahasia HMAC-SHA256 atau pasangan kunci asimetris RSA harus disimpan di Environment Variable yang aman dan tidak pernah diekspos ke sisi klien.',
				summary:
					'Struktur dasar JWT dan praktik aman dalam pengelolaan secret key pada backend.',
			},
			{
				id: 'mod-2-les-2',
				title: '2.2 Validasi Payload & Pencegahan SQL Injection',
				learningObjectives:
					'Mahasiswa mampu menerapkan validasi input dan parameterized query untuk mencegah serangan injeksi.',
				content:
					'Seluruh input dari client harus dianggap tidak tepercaya. Gunakan schema validation di layer controller/middleware sebelum data diproses.\n\nSelalu gunakan prepared statements atau ORM query builder untuk menghindari celah SQL Injection.',
				summary:
					'Pentingnya validasi skema input dan penggunaan parameterized query pada akses basis data.',
			},
		],
		quiz: {
			passingScore: 75,
			questions: [
				{
					id: 'mod-2-q-1',
					question:
						'Bagian manakah dari JSON Web Token (JWT) yang mencegah terjadinya manipulasi data di sisi client?',
					options: [
						'Cryptographic Signature yang ditandatangani dengan secret/private key',
						'Base64 Encoded Header',
						'Payload Claim Set',
						'Client LocalStorage Cache',
					],
					correctAnswer: 0,
					explanation:
						'Signature memastikan integritas token; setiap perubahan pada Header atau Payload akan membuat verifikasi signature gagal.',
				},
				{
					id: 'mod-2-q-2',
					question:
						'Cara paling efektif untuk mencegah serangan SQL Injection pada API adalah...',
					options: [
						'Menyembunyikan pesan error database di frontend saja',
						'Menggunakan prepared statements / parameterized queries',
						'Menggabungkan string input user langsung ke query SQL',
						'Membatasi panjang password menjadi maksimal 8 karakter',
					],
					correctAnswer: 1,
					explanation:
						'Prepared statements memisahkan struktur perintah SQL dengan data input pengguna sehingga input tidak dapat dieksekusi sebagai kode SQL.',
				},
			],
		},
	},
];

// =====================================================
// STYLE TOKENS (memakai CSS variable dari index.css)
// =====================================================

const cardStyle = {
	background: 'var(--card)',
	border: '1px solid var(--border)',
	borderRadius: 'var(--radius-lg)',
};

const inputStyle = {
	borderColor: 'var(--border-md)',
	borderRadius: 'var(--radius-md)',
	color: 'var(--text)',
};

const labelStyle = { color: 'var(--text)' };
const mutedStyle = { color: 'var(--text-muted)' };
const dividerStyle = { borderTop: '1px solid var(--border)' };

const linkBtnStyle = (color = 'var(--text-muted)') => ({
	color,
	textDecoration: 'none',
	padding: '2px 8px',
});

// =====================================================
// SMALL PRESENTATIONAL HELPERS
// =====================================================

const Pill = ({ children, bg, color, border }) => (
	<span
		className="fs-5 fw-semibold d-inline-flex align-items-center px-2 py-1"
		style={{
			background: bg,
			color,
			border: `1px solid ${border}`,
			borderRadius: 'var(--radius-full)',
			whiteSpace: 'nowrap',
		}}
	>
		{children}
	</span>
);

const NeutralPill = ({ children }) => (
	<Pill bg="var(--neutral-bg)" color="var(--neutral-text)" border="var(--neutral-border)">
		{children}
	</Pill>
);

const InfoPill = ({ children }) => (
	<Pill bg="var(--info-bg)" color="var(--info-text)" border="var(--info-border-color)">
		{children}
	</Pill>
);

const SuccessPill = ({ children }) => (
	<Pill bg="var(--success-bg)" color="var(--success-text)" border="var(--success-border-color)">
		{children}
	</Pill>
);

const FieldLabel = ({ children }) => (
	<Form.Label className="fs-4 fw-semibold mb-1" style={labelStyle}>
		{children}
	</Form.Label>
);

// =====================================================
// PAGE
// =====================================================

const UploadPage = () => {
	const { learningId } = useParams();
	const navigate = useNavigate();

	const fileInputRef = useRef(null);

	// ---------- Generation state ----------
	const [pdfFile, setPdfFile] = useState(null);
	const [learningObjectives, setLearningObjectives] = useState(
		'Mahasiswa mampu memahami konsep inti materi, menerapkannya dalam studi kasus nyata, dan menyelesaikan evaluasi dengan baik.',
	);
	const [moduleCount, setModuleCount] = useState(2);
	const [lessonsPerModule, setLessonsPerModule] = useState(2);
	const [quizQuestionsPerModule, setQuizQuestionsPerModule] = useState(2);
	const [passingScore, setPassingScore] = useState(75);

	const [isGenerating, setIsGenerating] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [statusAlert, setStatusAlert] = useState(null);
	const [configOpen, setConfigOpen] = useState(true);

	// ---------- Review state ----------
	const [modules, setModules] = useState([]);
	const [expandedIds, setExpandedIds] = useState([]);
	const [selected, setSelected] = useState({ moduleId: null, lessonId: null });

	const [moduleModal, setModuleModal] = useState({ show: false, moduleId: null });
	const [moduleForm, setModuleForm] = useState({ title: '', description: '' });

	const [lessonModal, setLessonModal] = useState({
		show: false,
		mode: 'add',
		moduleId: null,
		lessonId: null,
	});
	const [lessonForm, setLessonForm] = useState({
		title: '',
		content: '',
		summary: '',
		learningObjectives: '',
	});

	const [quizModal, setQuizModal] = useState({
		show: false,
		moduleId: null,
		questionId: null,
	});
	const [quizForm, setQuizForm] = useState({
		question: '',
		options: ['', '', '', ''],
		correctAnswer: 0,
		explanation: '',
	});

	const [showPublishModal, setShowPublishModal] = useState(false);

	// ---------- Derived ----------
	const hasContent = modules.length > 0;
	const totalModules = modules.length;
	const totalLessons = modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
	const totalQuizQuestions = modules.reduce(
		(sum, mod) => sum + (mod.quiz?.questions?.length || 0),
		0,
	);

	const selectedModule = modules.find((mod) => mod.id === selected.moduleId) || null;
	const selectedLesson =
		selectedModule?.lessons.find((lesson) => lesson.id === selected.lessonId) || null;

	const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

	// =====================================================
	// GENERATION HANDLERS
	// =====================================================

	const clearFile = () => {
		setPdfFile(null);
		setErrorMsg('');
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	const handleFileChange = (e) => {
		const file = e.target.files?.[0];

		setErrorMsg('');
		setStatusAlert(null);

		if (!file) {
			setPdfFile(null);
			return;
		}

		if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
			setErrorMsg('Format file harus berupa PDF (.pdf).');
			setPdfFile(null);
			e.target.value = '';
			return;
		}

		setPdfFile(file);
	};

	const handleGenerateContent = async (e) => {
		e.preventDefault();

		setErrorMsg('');
		setStatusAlert(null);

		if (!pdfFile) {
			setErrorMsg('Silakan upload PDF materi terlebih dahulu.');
			return;
		}

		if (!learningObjectives.trim()) {
			setErrorMsg('Learning Objectives wajib diisi.');
			return;
		}

		if (
			moduleCount < 1 ||
			lessonsPerModule < 1 ||
			quizQuestionsPerModule < 1 ||
			passingScore < 0 ||
			passingScore > 100
		) {
			setErrorMsg('Periksa kembali konfigurasi parameter generation.');
			return;
		}

		if (
			hasContent &&
			!window.confirm(
				'Generate ulang akan menimpa hasil review yang ada, termasuk perubahan manual. Lanjutkan?',
			)
		) {
			return;
		}

		setIsGenerating(true);

		try {
			/*
			 * SIMULASI GENERATION
			 *
			 * Ganti bagian ini dengan request API Laravel
			 * yang meneruskan PDF ke layanan GenAI + RAG.
			 */
			await new Promise((resolve) => setTimeout(resolve, 1200));

			const generatedModules = INITIAL_MOCK_MODULES.map((mod) => ({
				...mod,
				lessons: mod.lessons.map((lesson) => ({ ...lesson })),
				quiz: {
					...mod.quiz,
					passingScore: Number(passingScore),
					questions: mod.quiz.questions.map((question) => ({
						...question,
						options: [...question.options],
					})),
				},
			}));

			setModules(generatedModules);
			setExpandedIds(generatedModules.map((mod) => mod.id));
			setSelected({
				moduleId: generatedModules[0]?.id ?? null,
				lessonId: generatedModules[0]?.lessons[0]?.id ?? null,
			});
			setConfigOpen(false);

			setStatusAlert({
				variant: 'success',
				message:
					'Konten berhasil dihasilkan. Silakan periksa dan validasi hasil generation.',
			});
		} catch (error) {
			setErrorMsg('Terjadi kesalahan saat menghasilkan konten. Silakan coba kembali.');
		} finally {
			setIsGenerating(false);
		}
	};

	// =====================================================
	// NAVIGATION HANDLERS
	// =====================================================

	const toggleModule = (moduleId) =>
		setExpandedIds((prev) =>
			prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId],
		);

	const selectLesson = (moduleId, lessonId) => setSelected({ moduleId, lessonId });

	// =====================================================
	// MODULE HANDLERS
	// =====================================================

	const openEditModuleModal = (mod) => {
		setModuleForm({ title: mod.title, description: mod.description });
		setModuleModal({ show: true, moduleId: mod.id });
	};

	const closeModuleModal = () => setModuleModal({ show: false, moduleId: null });

	const handleSaveModule = (e) => {
		e.preventDefault();

		if (!moduleForm.title.trim()) return;

		setModules((prev) =>
			prev.map((mod) =>
				mod.id === moduleModal.moduleId
					? {
							...mod,
							title: moduleForm.title.trim(),
							description: moduleForm.description,
						}
					: mod,
			),
		);

		closeModuleModal();
	};

	// =====================================================
	// LESSON HANDLERS
	// =====================================================

	const openAddLessonModal = (moduleId) => {
		setLessonForm({ title: '', content: '', summary: '', learningObjectives: '' });
		setLessonModal({ show: true, mode: 'add', moduleId, lessonId: null });
	};

	const openEditLessonModal = (moduleId, lesson) => {
		setLessonForm({
			title: lesson.title,
			content: lesson.content,
			summary: lesson.summary,
			learningObjectives: lesson.learningObjectives,
		});
		setLessonModal({ show: true, mode: 'edit', moduleId, lessonId: lesson.id });
	};

	const closeLessonModal = () =>
		setLessonModal({ show: false, mode: 'add', moduleId: null, lessonId: null });

	const handleSaveLesson = (e) => {
		e.preventDefault();

		const { mode, moduleId, lessonId } = lessonModal;

		if (!lessonForm.title.trim() || !lessonForm.content.trim()) return;

		if (mode === 'add') {
			const newLesson = {
				id: `les-manual-${Date.now()}`,
				title: lessonForm.title.trim(),
				content: lessonForm.content,
				summary: lessonForm.summary,
				learningObjectives: lessonForm.learningObjectives,
			};

			setModules((prev) =>
				prev.map((mod) =>
					mod.id === moduleId ? { ...mod, lessons: [...mod.lessons, newLesson] } : mod,
				),
			);

			setExpandedIds((prev) => (prev.includes(moduleId) ? prev : [...prev, moduleId]));
			setSelected({ moduleId, lessonId: newLesson.id });
		} else {
			setModules((prev) =>
				prev.map((mod) =>
					mod.id === moduleId
						? {
								...mod,
								lessons: mod.lessons.map((lesson) =>
									lesson.id === lessonId
										? {
												...lesson,
												title: lessonForm.title.trim(),
												content: lessonForm.content,
												summary: lessonForm.summary,
												learningObjectives: lessonForm.learningObjectives,
											}
										: lesson,
								),
							}
						: mod,
				),
			);
		}

		closeLessonModal();
	};

	const handleDeleteLesson = (moduleId, lessonId) => {
		if (!window.confirm('Apakah Anda yakin ingin menghapus lesson ini?')) return;

		const targetModule = modules.find((mod) => mod.id === moduleId);
		const remaining = (targetModule?.lessons || []).filter((lesson) => lesson.id !== lessonId);

		setModules((prev) =>
			prev.map((mod) => (mod.id === moduleId ? { ...mod, lessons: remaining } : mod)),
		);

		if (selected.lessonId === lessonId) {
			setSelected({ moduleId, lessonId: remaining[0]?.id ?? null });
		}
	};

	// =====================================================
	// QUIZ HANDLERS
	// =====================================================

	const openEditQuizModal = (moduleId, question) => {
		setQuizForm({
			question: question.question,
			options: [...question.options],
			correctAnswer: Number(question.correctAnswer),
			explanation: question.explanation,
		});
		setQuizModal({ show: true, moduleId, questionId: question.id });
	};

	const closeQuizModal = () => setQuizModal({ show: false, moduleId: null, questionId: null });

	const handleOptionChange = (index, value) => {
		setQuizForm((prev) => {
			const nextOptions = [...prev.options];
			nextOptions[index] = value;
			return { ...prev, options: nextOptions };
		});
	};

	const handleSaveQuiz = (e) => {
		e.preventDefault();

		const { moduleId, questionId } = quizModal;

		if (!quizForm.question.trim() || quizForm.options.some((option) => !option.trim())) {
			return;
		}

		setModules((prev) =>
			prev.map((mod) =>
				mod.id === moduleId
					? {
							...mod,
							quiz: {
								...mod.quiz,
								questions: mod.quiz.questions.map((question) =>
									question.id === questionId
										? {
												...question,
												question: quizForm.question.trim(),
												options: [...quizForm.options],
												correctAnswer: Number(quizForm.correctAnswer),
												explanation: quizForm.explanation,
											}
										: question,
								),
							},
						}
					: mod,
			),
		);

		closeQuizModal();
	};

	const handleDeleteQuizQuestion = (moduleId, questionId) => {
		if (!window.confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) return;

		setModules((prev) =>
			prev.map((mod) =>
				mod.id === moduleId
					? {
							...mod,
							quiz: {
								...mod.quiz,
								questions: mod.quiz.questions.filter(
									(question) => question.id !== questionId,
								),
							},
						}
					: mod,
			),
		);
	};

	// =====================================================
	// SAVE & PUBLISH HANDLERS
	// =====================================================

	const handleSaveDraft = () => {
		/*
		 * TODO:
		 * POST /api/organizer/learning-paths/{learningId}/draft
		 *
		 * Kirim modules ke Laravel backend.
		 */
		setStatusAlert({
			variant: 'info',
			message: 'Draft berhasil disimpan sementara (simulasi state).',
		});
		scrollToTop();
	};

	const handleConfirmPublish = () => {
		/*
		 * TODO:
		 * POST /api/organizer/learning-paths/{learningId}/publish
		 *
		 * Kirim data modules yang sudah divalidasi.
		 */
		setShowPublishModal(false);
		setStatusAlert({
			variant: 'success',
			message: 'Konten berhasil disetujui dan dipublikasikan ke Learning Path!',
		});
		scrollToTop();
	};

	// =====================================================
	// RENDER: LEFT COLUMN
	// =====================================================

	const renderConfigCard = () => (
		<div className="mb-3" style={cardStyle}>
			<button
				type="button"
				className="w-100 d-flex justify-content-between align-items-center border-0 bg-transparent text-start p-3"
				onClick={() => setConfigOpen((open) => !open)}
				aria-expanded={configOpen}
				disabled={!hasContent}
				style={{ cursor: hasContent ? 'pointer' : 'default' }}
			>
				<div>
					<div className="fs-3 fw-semibold" style={{ color: 'var(--text)' }}>
						Konfigurasi generation
					</div>
					{pdfFile && !configOpen && (
						<div
							className="fs-5 mt-1"
							style={{ ...mutedStyle, wordBreak: 'break-all' }}
						>
							{pdfFile.name}
						</div>
					)}
				</div>

				{hasContent && (
					<span className="fs-4" style={{ color: 'var(--primary)' }}>
						{configOpen ? 'Tutup' : 'Ubah'}
					</span>
				)}
			</button>

			<Collapse in={configOpen}>
				<div>
					<Form
						onSubmit={handleGenerateContent}
						className="px-3 pb-3"
						style={dividerStyle}
					>
						{/* PDF UPLOAD */}
						<Form.Group className="mt-3 mb-3" controlId="pdfUpload">
							<FieldLabel>PDF materi</FieldLabel>

							<Form.Control
								ref={fileInputRef}
								type="file"
								accept=".pdf,application/pdf"
								onChange={handleFileChange}
								disabled={isGenerating}
								className="d-none"
							/>

							<label
								htmlFor="pdfUpload"
								className="d-flex flex-column align-items-center justify-content-center text-center w-100 px-3 py-3 mb-0"
								style={{
									border: '1.5px dashed var(--border-md)',
									borderRadius: 'var(--radius-md)',
									background: pdfFile
										? 'var(--primary-light)'
										: 'var(--color-bg-light)',
									cursor: isGenerating ? 'not-allowed' : 'pointer',
									opacity: isGenerating ? 0.6 : 1,
								}}
							>
								{pdfFile ? (
									<>
										<span
											className="fs-4 fw-semibold"
											style={{
												color: 'var(--primary)',
												wordBreak: 'break-all',
											}}
										>
											{pdfFile.name}
										</span>
										<span className="fs-5" style={mutedStyle}>
											{(pdfFile.size / 1024).toFixed(1)} KB, klik untuk
											mengganti
										</span>
									</>
								) : (
									<>
										<span
											className="fs-4 fw-semibold"
											style={{ color: 'var(--text)' }}
										>
											Pilih file PDF
										</span>
										<span className="fs-5" style={mutedStyle}>
											Diproses menjadi module, lesson, dan quiz.
										</span>
									</>
								)}
							</label>

							{pdfFile && (
								<div className="d-flex justify-content-end mt-1">
									<Button
										variant="link"
										size="sm"
										className="fs-5"
										style={linkBtnStyle('var(--error-text)')}
										onClick={clearFile}
										disabled={isGenerating}
									>
										Hapus file
									</Button>
								</div>
							)}
						</Form.Group>

						{/* LEARNING OBJECTIVES */}
						<Form.Group className="mb-3" controlId="learningObjectives">
							<FieldLabel>Learning objectives</FieldLabel>
							<Form.Control
								as="textarea"
								rows={3}
								value={learningObjectives}
								onChange={(e) => setLearningObjectives(e.target.value)}
								placeholder="Tuliskan tujuan pembelajaran yang ingin dicapai..."
								disabled={isGenerating}
								style={inputStyle}
								className="fs-4"
								required
							/>
						</Form.Group>

						{/* PARAMETERS */}
						<Row className="g-2 mb-3">
							<Col xs={6}>
								<Form.Group controlId="moduleCount">
									<Form.Label className="fs-5 mb-1" style={mutedStyle}>
										Jumlah module
									</Form.Label>
									<Form.Control
										type="number"
										min={1}
										max={10}
										value={moduleCount}
										onChange={(e) => setModuleCount(Number(e.target.value))}
										disabled={isGenerating}
										style={inputStyle}
										required
									/>
								</Form.Group>
							</Col>

							<Col xs={6}>
								<Form.Group controlId="lessonsPerModule">
									<Form.Label className="fs-5 mb-1" style={mutedStyle}>
										Lesson per module
									</Form.Label>
									<Form.Control
										type="number"
										min={1}
										max={10}
										value={lessonsPerModule}
										onChange={(e) =>
											setLessonsPerModule(Number(e.target.value))
										}
										disabled={isGenerating}
										style={inputStyle}
										required
									/>
								</Form.Group>
							</Col>

							<Col xs={6}>
								<Form.Group controlId="quizQuestionsPerModule">
									<Form.Label className="fs-5 mb-1" style={mutedStyle}>
										Soal per module
									</Form.Label>
									<Form.Control
										type="number"
										min={1}
										max={20}
										value={quizQuestionsPerModule}
										onChange={(e) =>
											setQuizQuestionsPerModule(Number(e.target.value))
										}
										disabled={isGenerating}
										style={inputStyle}
										required
									/>
								</Form.Group>
							</Col>
						</Row>

						<Button
							type="submit"
							variant="primary"
							className="w-100"
							disabled={isGenerating}
						>
							{isGenerating ? (
								<>
									<Spinner
										as="span"
										animation="border"
										size="sm"
										className="me-2"
									/>
									Generating...
								</>
							) : hasContent ? (
								'Generate ulang'
							) : (
								'Generate content'
							)}
						</Button>
					</Form>
				</div>
			</Collapse>
		</div>
	);

	const renderStructureCard = () => (
		<div style={cardStyle}>
			<div className="d-flex justify-content-between align-items-center flex-wrap gap-2 p-3">
				<div className="fs-3 fw-semibold" style={{ color: 'var(--text)' }}>
					Struktur konten
				</div>

				{hasContent && (
					<div className="d-flex flex-wrap gap-1">
						<NeutralPill>{totalModules} module</NeutralPill>
						<NeutralPill>{totalLessons} lesson</NeutralPill>
						<NeutralPill>{totalQuizQuestions} soal</NeutralPill>
					</div>
				)}
			</div>

			{!hasContent ? (
				<div className="px-3 pb-4 pt-3" style={dividerStyle}>
					<p className="fs-4 mb-0" style={mutedStyle}>
						Belum ada konten. Upload PDF lalu klik Generate content untuk melihat module
						dan lesson di sini.
					</p>
				</div>
			) : (
				modules.map((mod) => {
					const isExpanded = expandedIds.includes(mod.id);

					return (
						<div key={mod.id} style={dividerStyle}>
							<button
								type="button"
								className="w-100 d-flex align-items-start gap-2 text-start border-0 bg-transparent px-3 py-3"
								onClick={() => toggleModule(mod.id)}
								aria-expanded={isExpanded}
							>
								<span
									className="fs-3"
									style={{
										color: 'var(--text-muted)',
										display: 'inline-block',
										width: '12px',
										transform: isExpanded ? 'rotate(90deg)' : 'none',
										transition: 'transform 0.15s ease',
										lineHeight: 1.3,
									}}
								>
									›
								</span>

								<span style={{ flex: 1 }}>
									<span
										className="d-block fs-4 fw-semibold"
										style={{ color: 'var(--text)' }}
									>
										{mod.title}
									</span>
									<span className="d-block fs-5 mt-1" style={mutedStyle}>
										{mod.lessons.length} lesson,{' '}
										{mod.quiz?.questions?.length || 0} soal
									</span>
								</span>
							</button>

							<Collapse in={isExpanded}>
								<div>
									<div className="pb-2">
										{mod.lessons.length === 0 && (
											<p
												className="fs-5 mb-1"
												style={{
													...mutedStyle,
													padding: '4px 16px 4px 38px',
												}}
											>
												Belum ada lesson.
											</p>
										)}

										{mod.lessons.map((lesson) => {
											const isActive =
												selected.moduleId === mod.id &&
												selected.lessonId === lesson.id;

											return (
												<button
													key={lesson.id}
													type="button"
													className="d-block w-100 text-start border-0 fs-4"
													onClick={() => selectLesson(mod.id, lesson.id)}
													style={{
														background: isActive
															? 'var(--primary-light)'
															: 'transparent',
														color: isActive
															? 'var(--primary)'
															: 'var(--text)',
														fontWeight: isActive ? 600 : 400,
														padding: '8px 16px 8px 38px',
														borderLeft: `3px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
													}}
												>
													{lesson.title}
												</button>
											);
										})}

										<div
											className="d-flex gap-1 mt-1"
											style={{ paddingLeft: '30px' }}
										>
											<Button
												variant="link"
												size="sm"
												className="fs-5"
												style={linkBtnStyle('var(--primary)')}
												onClick={() => openAddLessonModal(mod.id)}
											>
												Tambah lesson
											</Button>
											<Button
												variant="link"
												size="sm"
												className="fs-5"
												style={linkBtnStyle()}
												onClick={() => openEditModuleModal(mod)}
											>
												Edit module
											</Button>
										</div>
									</div>
								</div>
							</Collapse>
						</div>
					);
				})
			)}
		</div>
	);

	// =====================================================
	// RENDER: RIGHT COLUMN
	// =====================================================

	const renderLessonCard = () => (
		<div className="p-4 mb-3" style={cardStyle}>
			{selectedLesson ? (
				<>
					<div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
						<div style={{ flex: 1, minWidth: '220px' }}>
							<div className="mb-2">
								<InfoPill>{selectedModule.title}</InfoPill>
							</div>
							<h3 className="fs-1 fw-semibold mb-0" style={{ color: 'var(--text)' }}>
								{selectedLesson.title}
							</h3>
						</div>

						<div className="d-flex gap-1">
							<Button
								variant="link"
								size="sm"
								className="fs-4"
								style={linkBtnStyle()}
								onClick={() =>
									openEditLessonModal(selectedModule.id, selectedLesson)
								}
							>
								Edit
							</Button>
							<Button
								variant="link"
								size="sm"
								className="fs-4"
								style={linkBtnStyle('var(--error-text)')}
								onClick={() =>
									handleDeleteLesson(selectedModule.id, selectedLesson.id)
								}
							>
								Hapus
							</Button>
						</div>
					</div>

					<div className="pt-3 mb-4" style={dividerStyle}>
						<div className="fs-4 fw-semibold mb-1" style={labelStyle}>
							Learning objectives
						</div>
						<p className="fs-4" style={mutedStyle}>
							{selectedLesson.learningObjectives || '-'}
						</p>
					</div>

					<div className="mb-4">
						<div className="fs-4 fw-semibold mb-1" style={labelStyle}>
							Konten
						</div>
						<div
							className="fs-3"
							style={{
								whiteSpace: 'pre-line',
								lineHeight: 1.7,
								color: 'var(--text)',
								maxWidth: '72ch',
							}}
						>
							{selectedLesson.content}
						</div>
					</div>

					<div
						className="p-3"
						style={{
							background: 'var(--neutral-bg)',
							borderRadius: 'var(--radius-md)',
						}}
					>
						<div className="fs-4 fw-semibold mb-1" style={labelStyle}>
							Ringkasan
						</div>
						<p className="fs-4" style={mutedStyle}>
							{selectedLesson.summary || '-'}
						</p>
					</div>
				</>
			) : (
				<div className="text-center py-4">
					<div className="fs-3 fw-semibold mb-1" style={{ color: 'var(--text)' }}>
						Belum ada lesson dipilih
					</div>
					<p className="fs-4 mb-3" style={mutedStyle}>
						Module ini belum punya lesson. Tambahkan lesson untuk mulai menyusun materi.
					</p>
					<Button
						size="sm"
						variant="outline-primary"
						onClick={() => openAddLessonModal(selectedModule.id)}
					>
						Tambah lesson
					</Button>
				</div>
			)}
		</div>
	);

	const renderQuizCard = () => {
		const questions = selectedModule.quiz?.questions || [];

		return (
			<div className="p-4" style={cardStyle}>
				<div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-1">
					<div>
						<h4 className="fs-2 fw-semibold mb-0" style={{ color: 'var(--text)' }}>
							Kuis modul
						</h4>
						<div className="fs-5 mt-1" style={mutedStyle}>
							{selectedModule.title}
						</div>
					</div>

					<NeutralPill>
						Passing score {selectedModule.quiz?.passingScore ?? 75}%
					</NeutralPill>
				</div>

				{questions.length === 0 ? (
					<p className="fs-4 pt-3 mb-0 mt-3" style={{ ...mutedStyle, ...dividerStyle }}>
						Tidak ada pertanyaan kuis pada module ini.
					</p>
				) : (
					<div className="mt-3">
						{questions.map((question, qIdx) => (
							<div key={question.id} className="py-3" style={dividerStyle}>
								<div className="d-flex justify-content-between align-items-start gap-2 mb-2">
									<div
										className="fs-3 fw-semibold"
										style={{ color: 'var(--text)' }}
									>
										{qIdx + 1}. {question.question}
									</div>

									<div className="d-flex gap-1 flex-shrink-0">
										<Button
											variant="link"
											size="sm"
											className="fs-4"
											style={linkBtnStyle()}
											onClick={() =>
												openEditQuizModal(selectedModule.id, question)
											}
										>
											Edit
										</Button>
										<Button
											variant="link"
											size="sm"
											className="fs-4"
											style={linkBtnStyle('var(--error-text)')}
											onClick={() =>
												handleDeleteQuizQuestion(
													selectedModule.id,
													question.id,
												)
											}
										>
											Hapus
										</Button>
									</div>
								</div>

								<ul className="list-unstyled mb-3">
									{question.options.map((option, optIdx) => {
										const isCorrect = Number(question.correctAnswer) === optIdx;

										return (
											<li
												key={optIdx}
												className="fs-4 d-flex align-items-center flex-wrap gap-2 mb-1"
												style={{
													color: isCorrect
														? 'var(--success-text)'
														: 'var(--text-muted)',
													fontWeight: isCorrect ? 600 : 400,
												}}
											>
												<span>
													{OPTION_LABELS[optIdx]}. {option}
												</span>
												{isCorrect && (
													<SuccessPill>Jawaban benar</SuccessPill>
												)}
											</li>
										);
									})}
								</ul>

								<div
									className="fs-5 p-3"
									style={{
										background: 'var(--neutral-bg)',
										borderRadius: 'var(--radius-md)',
										color: 'var(--text-muted)',
									}}
								>
									<strong style={{ color: 'var(--text)' }}>Penjelasan</strong>
									<div className="mt-1">{question.explanation}</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		);
	};

	const renderRightColumn = () => {
		if (!hasContent || !selectedModule) {
			return (
				<div
					className="text-center px-3 py-5"
					style={{
						border: '1.5px dashed var(--border-md)',
						borderRadius: 'var(--radius-lg)',
					}}
				>
					<div className="fs-3 fw-semibold mb-1" style={{ color: 'var(--text)' }}>
						{hasContent ? 'Pilih lesson' : 'Belum ada konten'}
					</div>
					<p className="fs-4 mb-0" style={mutedStyle}>
						{hasContent
							? 'Pilih lesson pada daftar di kiri untuk melihat isi materi dan kuis terkaitnya.'
							: 'Hasil generation akan tampil di sini setelah Anda menjalankan Generate content.'}
					</p>
				</div>
			);
		}

		return (
			<>
				{renderLessonCard()}
				{renderQuizCard()}
			</>
		);
	};

	// =====================================================
	// RENDER
	// =====================================================

	return (
		<Container fluid className="px-5 py-4 my-2">
			{/* HEADER */}
			<div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
				<div>
					<h2 className="fs-1 fw-semibold mb-1" style={{ color: 'var(--text)' }}>
						AI Learning Content Generator
					</h2>
					<p className="fs-4 mb-0" style={mutedStyle}>
						Upload materi, biarkan AI menyusun konten, lalu periksa sebelum
						dipublikasikan.
					</p>
				</div>

				<div className="d-flex flex-wrap gap-2">
					<Button
						variant="outline-secondary"
						size="sm"
						onClick={() => navigate(`/organizer/learning-path/${learningId}`)}
						disabled={isGenerating}
					>
						Kembali ke Learning Path
					</Button>

					{hasContent && (
						<>
							<Button variant="outline-primary" size="sm" onClick={handleSaveDraft}>
								Simpan draft
							</Button>
							<Button
								variant="primary"
								size="sm"
								onClick={() => setShowPublishModal(true)}
							>
								Approve & publish
							</Button>
						</>
					)}
				</div>
			</div>

			{/* LEARNING PATH INFO */}
			<div className="p-3 px-4 mb-4" style={cardStyle}>
				<div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
					<div style={{ flex: 1, minWidth: '240px' }}>
						<div className="fs-3 fw-semibold mb-1" style={{ color: 'var(--text)' }}>
							{MOCK_LEARNING_PATH.title}
						</div>
						<p className="fs-4" style={mutedStyle}>
							{MOCK_LEARNING_PATH.description}
						</p>
					</div>

					<div className="d-flex flex-wrap gap-2">
						<NeutralPill>ID {learningId || '1'}</NeutralPill>
						<InfoPill>{MOCK_LEARNING_PATH.category}</InfoPill>
						<InfoPill>{MOCK_LEARNING_PATH.level}</InfoPill>
					</div>
				</div>
			</div>

			{/* ALERTS */}
			{errorMsg && (
				<Alert
					dismissible
					onClose={() => setErrorMsg('')}
					className="fs-4"
					style={{
						background: 'var(--error-bg)',
						border: '1px solid var(--error-border)',
						color: 'var(--error-heading)',
						borderRadius: 'var(--radius)',
					}}
				>
					{errorMsg}
				</Alert>
			)}

			{statusAlert && (
				<Alert
					dismissible
					onClose={() => setStatusAlert(null)}
					className="fs-4"
					style={{
						background:
							statusAlert.variant === 'success'
								? 'var(--success-bg)'
								: 'var(--info-bg)',
						border: `1px solid ${
							statusAlert.variant === 'success'
								? 'var(--success-border-color)'
								: 'var(--info-border-color)'
						}`,
						color:
							statusAlert.variant === 'success'
								? 'var(--success-text)'
								: 'var(--info-text)',
						borderRadius: 'var(--radius)',
					}}
				>
					{statusAlert.message}
				</Alert>
			)}

			{/* TWO COLUMNS */}
			<Row className="g-4 align-items-start">
				<Col lg={4}>
					{renderConfigCard()}
					{renderStructureCard()}
				</Col>

				<Col lg={8}>{renderRightColumn()}</Col>
			</Row>

			{/* ============================================= */}
			{/* MODAL: EDIT MODULE */}
			{/* ============================================= */}

			<Modal show={moduleModal.show} onHide={closeModuleModal} centered>
				<Form onSubmit={handleSaveModule}>
					<Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
						<Modal.Title className="fs-2 fw-semibold">Edit module</Modal.Title>
					</Modal.Header>

					<Modal.Body className="p-4">
						<Form.Group className="mb-3">
							<FieldLabel>Judul module</FieldLabel>
							<Form.Control
								type="text"
								value={moduleForm.title}
								onChange={(e) =>
									setModuleForm({ ...moduleForm, title: e.target.value })
								}
								style={inputStyle}
								required
							/>
						</Form.Group>

						<Form.Group>
							<FieldLabel>Deskripsi module</FieldLabel>
							<Form.Control
								as="textarea"
								rows={3}
								value={moduleForm.description}
								onChange={(e) =>
									setModuleForm({ ...moduleForm, description: e.target.value })
								}
								style={inputStyle}
							/>
						</Form.Group>
					</Modal.Body>

					<Modal.Footer style={{ borderTop: '1px solid var(--border)' }}>
						<Button variant="outline-secondary" onClick={closeModuleModal}>
							Batal
						</Button>
						<Button type="submit" variant="primary">
							Simpan module
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{/* ============================================= */}
			{/* MODAL: ADD / EDIT LESSON */}
			{/* ============================================= */}

			<Modal show={lessonModal.show} onHide={closeLessonModal} size="lg" centered>
				<Form onSubmit={handleSaveLesson}>
					<Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
						<Modal.Title className="fs-2 fw-semibold">
							{lessonModal.mode === 'add' ? 'Tambah lesson' : 'Edit lesson'}
						</Modal.Title>
					</Modal.Header>

					<Modal.Body className="p-4">
						<Form.Group className="mb-3">
							<FieldLabel>Judul lesson</FieldLabel>
							<Form.Control
								type="text"
								value={lessonForm.title}
								onChange={(e) =>
									setLessonForm({ ...lessonForm, title: e.target.value })
								}
								placeholder="Masukkan judul lesson"
								style={inputStyle}
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<FieldLabel>Learning objectives</FieldLabel>
							<Form.Control
								as="textarea"
								rows={2}
								value={lessonForm.learningObjectives}
								onChange={(e) =>
									setLessonForm({
										...lessonForm,
										learningObjectives: e.target.value,
									})
								}
								placeholder="Tujuan pembelajaran lesson..."
								style={inputStyle}
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<FieldLabel>Konten</FieldLabel>
							<Form.Control
								as="textarea"
								rows={6}
								value={lessonForm.content}
								onChange={(e) =>
									setLessonForm({ ...lessonForm, content: e.target.value })
								}
								placeholder="Masukkan isi materi lesson..."
								style={inputStyle}
								required
							/>
						</Form.Group>

						<Form.Group className="mb-0">
							<FieldLabel>Ringkasan</FieldLabel>
							<Form.Control
								as="textarea"
								rows={2}
								value={lessonForm.summary}
								onChange={(e) =>
									setLessonForm({ ...lessonForm, summary: e.target.value })
								}
								placeholder="Ringkasan lesson..."
								style={inputStyle}
							/>
						</Form.Group>
					</Modal.Body>

					<Modal.Footer style={{ borderTop: '1px solid var(--border)' }}>
						<Button variant="outline-secondary" onClick={closeLessonModal}>
							Batal
						</Button>
						<Button type="submit" variant="primary">
							Simpan lesson
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{/* ============================================= */}
			{/* MODAL: EDIT QUIZ */}
			{/* ============================================= */}

			<Modal show={quizModal.show} onHide={closeQuizModal} size="lg" centered>
				<Form onSubmit={handleSaveQuiz}>
					<Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
						<Modal.Title className="fs-2 fw-semibold">Edit pertanyaan quiz</Modal.Title>
					</Modal.Header>

					<Modal.Body className="p-4">
						<Form.Group className="mb-3">
							<FieldLabel>Pertanyaan</FieldLabel>
							<Form.Control
								as="textarea"
								rows={3}
								value={quizForm.question}
								onChange={(e) =>
									setQuizForm({ ...quizForm, question: e.target.value })
								}
								style={inputStyle}
								required
							/>
						</Form.Group>

						<FieldLabel>Pilihan jawaban</FieldLabel>

						{quizForm.options.map((option, idx) => (
							<Form.Group key={idx} className="mb-2 d-flex align-items-center gap-2">
								<span
									className="fs-4 fw-semibold"
									style={{ width: '24px', color: 'var(--text-muted)' }}
								>
									{OPTION_LABELS[idx]}.
								</span>

								<Form.Control
									type="text"
									value={option}
									onChange={(e) => handleOptionChange(idx, e.target.value)}
									style={inputStyle}
									required
								/>
							</Form.Group>
						))}

						<Form.Group className="mt-3 mb-3">
							<FieldLabel>Jawaban benar</FieldLabel>
							<Form.Select
								value={quizForm.correctAnswer}
								onChange={(e) =>
									setQuizForm({
										...quizForm,
										correctAnswer: Number(e.target.value),
									})
								}
								style={inputStyle}
							>
								{OPTION_LABELS.map((label, idx) => (
									<option key={label} value={idx}>
										Opsi {label}
									</option>
								))}
							</Form.Select>
						</Form.Group>

						<Form.Group>
							<FieldLabel>Penjelasan</FieldLabel>
							<Form.Control
								as="textarea"
								rows={3}
								value={quizForm.explanation}
								onChange={(e) =>
									setQuizForm({ ...quizForm, explanation: e.target.value })
								}
								placeholder="Penjelasan jawaban yang benar..."
								style={inputStyle}
							/>
						</Form.Group>
					</Modal.Body>

					<Modal.Footer style={{ borderTop: '1px solid var(--border)' }}>
						<Button variant="outline-secondary" onClick={closeQuizModal}>
							Batal
						</Button>
						<Button type="submit" variant="primary">
							Simpan pertanyaan
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{/* ============================================= */}
			{/* MODAL: APPROVE & PUBLISH */}
			{/* ============================================= */}

			<Modal show={showPublishModal} onHide={() => setShowPublishModal(false)} centered>
				<Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
					<Modal.Title className="fs-2 fw-semibold">Approve & publish</Modal.Title>
				</Modal.Header>

				<Modal.Body className="p-4">
					<p className="fs-4 mb-2" style={mutedStyle}>
						Konten hasil generasi AI akan dipublikasikan ke:
					</p>

					<div className="fs-3 fw-semibold" style={{ color: 'var(--text)' }}>
						{MOCK_LEARNING_PATH.title}
					</div>

					<div
						className="fs-4 mt-3 pt-3"
						style={{ ...dividerStyle, color: 'var(--text-muted)' }}
					>
						<div className="d-flex justify-content-between mb-2">
							<span>Module</span>
							<strong style={{ color: 'var(--text)' }}>{totalModules}</strong>
						</div>
						<div className="d-flex justify-content-between mb-2">
							<span>Lesson</span>
							<strong style={{ color: 'var(--text)' }}>{totalLessons}</strong>
						</div>
						<div className="d-flex justify-content-between">
							<span>Soal quiz</span>
							<strong style={{ color: 'var(--text)' }}>{totalQuizQuestions}</strong>
						</div>
					</div>

					<div
						className="fs-5 mt-3 p-3"
						style={{
							background: 'var(--warning-bg)',
							border: '1px solid var(--warning-border)',
							color: 'var(--warning-heading)',
							borderRadius: 'var(--radius-md)',
						}}
					>
						Pastikan seluruh module, lesson, dan quiz sudah diperiksa sebelum
						dipublikasikan.
					</div>
				</Modal.Body>

				<Modal.Footer style={{ borderTop: '1px solid var(--border)' }}>
					<Button variant="outline-secondary" onClick={() => setShowPublishModal(false)}>
						Batal
					</Button>
					<Button variant="primary" onClick={handleConfirmPublish}>
						Approve & publish
					</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	);
};

export default UploadPage;
