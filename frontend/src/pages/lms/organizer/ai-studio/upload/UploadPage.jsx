
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
	Container,
	Card,
	Form,
	Button,
	Row,
	Col,
	Alert,
	Spinner,
	Badge,
	Accordion,
	Modal,
	ListGroup,
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

const UploadPage = () => {
	const { learningId } = useParams();
	const navigate = useNavigate();

	// =====================================================
	// GENERATION STATE
	// =====================================================

	const [activeStep, setActiveStep] = useState('generate');

	const [pdfFile, setPdfFile] = useState(null);

	const [learningObjectives, setLearningObjectives] = useState(
		'Mahasiswa mampu memahami konsep inti materi, menerapkannya dalam studi kasus nyata, dan menyelesaikan evaluasi dengan baik.'
	);

	const [moduleCount, setModuleCount] = useState(2);
	const [lessonsPerModule, setLessonsPerModule] = useState(2);
	const [quizQuestionsPerModule, setQuizQuestionsPerModule] = useState(2);
	const [passingScore, setPassingScore] = useState(75);

	const [isGenerating, setIsGenerating] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [statusAlert, setStatusAlert] = useState(null);

	// =====================================================
	// REVIEW STATE
	// =====================================================

	const [modules, setModules] = useState([]);

	const [editingModuleId, setEditingModuleId] = useState(null);
	const [moduleForm, setModuleForm] = useState({
		title: '',
		description: '',
	});

	const [viewingLesson, setViewingLesson] = useState(null);

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

	// =====================================================
	// SUMMARY
	// =====================================================

	const totalModules = modules.length;

	const totalLessons = modules.reduce(
		(sum, mod) => sum + mod.lessons.length,
		0
	);

	const totalQuizQuestions = modules.reduce(
		(sum, mod) => sum + (mod.quiz?.questions?.length || 0),
		0
	);

	// =====================================================
	// GENERATION HANDLERS
	// =====================================================

	const handleFileChange = (e) => {
		const file = e.target.files?.[0];

		setErrorMsg('');
		setStatusAlert(null);

		if (!file) {
			setPdfFile(null);
			return;
		}

		if (
			file.type !== 'application/pdf' &&
			!file.name.toLowerCase().endsWith('.pdf')
		) {
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
			setEditingModuleId(null);
			setActiveStep('review');

			setStatusAlert({
				variant: 'success',
				message:
					'Konten berhasil dihasilkan. Silakan periksa dan validasi hasil generation.',
			});
		} catch (error) {
			setErrorMsg(
				'Terjadi kesalahan saat menghasilkan konten. Silakan coba kembali.'
			);
		} finally {
			setIsGenerating(false);
		}
	};

	// =====================================================
	// MODULE HANDLERS
	// =====================================================

	const startEditModule = (mod) => {
		setEditingModuleId(mod.id);

		setModuleForm({
			title: mod.title,
			description: mod.description,
		});
	};

	const saveModuleEdit = (moduleId) => {
		if (!moduleForm.title.trim()) {
			return;
		}

		setModules((prev) =>
			prev.map((mod) =>
				mod.id === moduleId
					? {
						...mod,
						title: moduleForm.title.trim(),
						description: moduleForm.description,
					}
					: mod
			)
		);

		setEditingModuleId(null);
	};

	// =====================================================
	// LESSON HANDLERS
	// =====================================================

	const openAddLessonModal = (moduleId) => {
		setLessonForm({
			title: '',
			content: '',
			summary: '',
			learningObjectives: '',
		});

		setLessonModal({
			show: true,
			mode: 'add',
			moduleId,
			lessonId: null,
		});
	};

	const openEditLessonModal = (moduleId, lesson) => {
		setLessonForm({
			title: lesson.title,
			content: lesson.content,
			summary: lesson.summary,
			learningObjectives: lesson.learningObjectives,
		});

		setLessonModal({
			show: true,
			mode: 'edit',
			moduleId,
			lessonId: lesson.id,
		});
	};

	const closeLessonModal = () => {
		setLessonModal({
			show: false,
			mode: 'add',
			moduleId: null,
			lessonId: null,
		});
	};

	const handleSaveLesson = (e) => {
		e.preventDefault();

		const { mode, moduleId, lessonId } = lessonModal;

		if (!lessonForm.title.trim() || !lessonForm.content.trim()) {
			return;
		}

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
					mod.id === moduleId
						? {
							...mod,
							lessons: [...mod.lessons, newLesson],
						}
						: mod
				)
			);
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
										learningObjectives:
											lessonForm.learningObjectives,
									}
									: lesson
							),
						}
						: mod
				)
			);
		}

		closeLessonModal();
	};

	const handleDeleteLesson = (moduleId, lessonId) => {
		const confirmed = window.confirm(
			'Apakah Anda yakin ingin menghapus lesson ini?'
		);

		if (!confirmed) return;

		setModules((prev) =>
			prev.map((mod) =>
				mod.id === moduleId
					? {
						...mod,
						lessons: mod.lessons.filter(
							(lesson) => lesson.id !== lessonId
						),
					}
					: mod
			)
		);
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

		setQuizModal({
			show: true,
			moduleId,
			questionId: question.id,
		});
	};

	const closeQuizModal = () => {
		setQuizModal({
			show: false,
			moduleId: null,
			questionId: null,
		});
	};

	const handleOptionChange = (index, value) => {
		setQuizForm((prev) => {
			const nextOptions = [...prev.options];
			nextOptions[index] = value;

			return {
				...prev,
				options: nextOptions,
			};
		});
	};

	const handleSaveQuiz = (e) => {
		e.preventDefault();

		const { moduleId, questionId } = quizModal;

		if (
			!quizForm.question.trim() ||
			quizForm.options.some((option) => !option.trim())
		) {
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
										correctAnswer: Number(
											quizForm.correctAnswer
										),
										explanation: quizForm.explanation,
									}
									: question
							),
						},
					}
					: mod
			)
		);

		closeQuizModal();
	};

	const handleDeleteQuizQuestion = (moduleId, questionId) => {
		const confirmed = window.confirm(
			'Apakah Anda yakin ingin menghapus pertanyaan ini?'
		);

		if (!confirmed) return;

		setModules((prev) =>
			prev.map((mod) =>
				mod.id === moduleId
					? {
						...mod,
						quiz: {
							...mod.quiz,
							questions: mod.quiz.questions.filter(
								(question) => question.id !== questionId
							),
						},
					}
					: mod
			)
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

		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
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
			message:
				'Konten berhasil disetujui dan dipublikasikan ke Learning Path!',
		});

		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	};

	// =====================================================
	// RENDER
	// =====================================================

	return (
		<Container className="py-4" style={{ maxWidth: '1100px' }}>

			{/* ============================================= */}
			{/* HEADER */}
			{/* ============================================= */}

			<div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
				<div>
					<h2 className="mb-1">AI Learning Content Generator</h2>

					<p className="text-muted mb-0">
						Generate, review, dan publikasikan konten pembelajaran
						menggunakan Generative AI.
					</p>
				</div>

				<Button
					variant="outline-secondary"
					size="sm"
					onClick={() =>
						navigate(
							`/organizer/learning-path/${learningId}`
						)
					}
					disabled={isGenerating}
				>
					Kembali ke Learning Path
				</Button>
			</div>

			{/* ============================================= */}
			{/* LEARNING PATH INFORMATION */}
			{/* ============================================= */}

			<Card className="mb-4">
				<Card.Header className="fw-semibold">
					Informasi Learning Path
				</Card.Header>

				<Card.Body>
					<div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
						<div style={{ flex: 1, minWidth: '250px' }}>
							<h5 className="mb-1">
								{MOCK_LEARNING_PATH.title}
							</h5>

							<p className="text-muted mb-0">
								{MOCK_LEARNING_PATH.description}
							</p>
						</div>

						<div className="d-flex flex-wrap gap-2">
							<Badge bg="secondary">
								ID: {learningId || '1'}
							</Badge>

							<Badge bg="info" text="dark">
								{MOCK_LEARNING_PATH.category}
							</Badge>

							<Badge bg="primary">
								{MOCK_LEARNING_PATH.level}
							</Badge>

							{pdfFile && (
								<Badge bg="success">
									PDF Uploaded
								</Badge>
							)}
						</div>
					</div>
				</Card.Body>
			</Card>

			{/* ============================================= */}
			{/* STEP NAVIGATION */}
			{/* ============================================= */}

			<Card className="mb-4">
				<Card.Body>
					<Row className="g-3 align-items-center">
						<Col md={6}>
							<Button
								block
								className="w-100"
								variant={
									activeStep === 'generate'
										? 'primary'
										: 'outline-primary'
								}
								onClick={() => setActiveStep('generate')}
								disabled={isGenerating}
							>
								<span className="fw-semibold">
									01. Generate Content
								</span>
								<div className="small fw-normal">
									Upload materi dan konfigurasi AI
								</div>
							</Button>
						</Col>

						<Col md={6}>
							<Button
								className="w-100"
								variant={
									activeStep === 'review'
										? 'primary'
										: 'outline-primary'
								}
								disabled={modules.length === 0}
								onClick={() => setActiveStep('review')}
							>
								<span className="fw-semibold">
									02. Review Content
								</span>
								<div className="small fw-normal">
									Periksa dan validasi hasil generation
								</div>
							</Button>
						</Col>
					</Row>
				</Card.Body>
			</Card>

			{/* ============================================= */}
			{/* ALERTS */}
			{/* ============================================= */}

			{errorMsg && (
				<Alert
					variant="danger"
					dismissible
					onClose={() => setErrorMsg('')}
				>
					{errorMsg}
				</Alert>
			)}

			{statusAlert && (
				<Alert
					variant={statusAlert.variant}
					dismissible
					onClose={() => setStatusAlert(null)}
				>
					{statusAlert.message}
				</Alert>
			)}

			{/* ============================================= */}
			{/* GENERATE SECTION */}
			{/* ============================================= */}

			{activeStep === 'generate' && (
				<Card>
					<Card.Header className="fw-semibold">
						Konfigurasi AI Content Generation
					</Card.Header>

					<Card.Body>
						<Form onSubmit={handleGenerateContent}>

							{/* PDF UPLOAD */}

							<Form.Group
								className="mb-4"
								controlId="pdfUpload"
							>
								<Form.Label className="fw-semibold">
									Upload PDF Materi Pembelajaran
								</Form.Label>

								<Form.Control
									type="file"
									accept=".pdf,application/pdf"
									onChange={handleFileChange}
									disabled={isGenerating}
								/>

								{pdfFile ? (
									<div className="mt-2 p-3 rounded border bg-light">
										<div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
											<div>
												<div className="fw-semibold">
													{pdfFile.name}
												</div>

												<small className="text-muted">
													{(pdfFile.size / 1024).toFixed(1)} KB
												</small>
											</div>

											<Button
												size="sm"
												variant="outline-danger"
												onClick={() => {
													setPdfFile(null);
													setErrorMsg('');
												}}
												disabled={isGenerating}
											>
												Hapus File
											</Button>
										</div>
									</div>
								) : (
									<Form.Text className="text-muted">
										Pilih file PDF materi referensi
										untuk diproses menjadi konten
										pembelajaran.
									</Form.Text>
								)}
							</Form.Group>

							{/* LEARNING OBJECTIVES */}

							<Form.Group
								className="mb-4"
								controlId="learningObjectives"
							>
								<Form.Label className="fw-semibold">
									Learning Objectives
								</Form.Label>

								<Form.Control
									as="textarea"
									rows={3}
									value={learningObjectives}
									onChange={(e) =>
										setLearningObjectives(e.target.value)
									}
									placeholder="Tuliskan tujuan pembelajaran yang ingin dicapai..."
									disabled={isGenerating}
									required
								/>

								<Form.Text className="text-muted">
									Tujuan pembelajaran digunakan sebagai
									arahan bagi AI dalam menyusun materi,
									lesson, dan evaluasi.
								</Form.Text>
							</Form.Group>

							{/* GENERATION CONFIGURATION */}

							<h6 className="fw-semibold mb-3">
								Generation Parameters
							</h6>

							<Row className="g-3 mb-4">
								<Col md={6} lg={3}>
									<Form.Group controlId="moduleCount">
										<Form.Label className="fw-semibold">
											Jumlah Module
										</Form.Label>

										<Form.Control
											type="number"
											min={1}
											max={10}
											value={moduleCount}
											onChange={(e) =>
												setModuleCount(
													Number(e.target.value)
												)
											}
											disabled={isGenerating}
											required
										/>
									</Form.Group>
								</Col>

								<Col md={6} lg={3}>
									<Form.Group controlId="lessonsPerModule">
										<Form.Label className="fw-semibold">
											Lesson per Module
										</Form.Label>

										<Form.Control
											type="number"
											min={1}
											max={10}
											value={lessonsPerModule}
											onChange={(e) =>
												setLessonsPerModule(
													Number(e.target.value)
												)
											}
											disabled={isGenerating}
											required
										/>
									</Form.Group>
								</Col>

								<Col md={6} lg={3}>
									<Form.Group controlId="quizQuestionsPerModule">
										<Form.Label className="fw-semibold">
											Quiz Questions / Module
										</Form.Label>

										<Form.Control
											type="number"
											min={1}
											max={20}
											value={quizQuestionsPerModule}
											onChange={(e) =>
												setQuizQuestionsPerModule(
													Number(e.target.value)
												)
											}
											disabled={isGenerating}
											required
										/>
									</Form.Group>
								</Col>

								<Col md={6} lg={3}>
									<Form.Group controlId="passingScore">
										<Form.Label className="fw-semibold">
											Passing Score (%)
										</Form.Label>

										<Form.Control
											type="number"
											min={0}
											max={100}
											value={passingScore}
											onChange={(e) =>
												setPassingScore(
													Number(e.target.value)
												)
											}
											disabled={isGenerating}
											required
										/>
									</Form.Group>
								</Col>
							</Row>

							{/* GENERATE BUTTON */}

							<div className="d-flex justify-content-end">
								<Button
									type="submit"
									variant="primary"
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
											Generating Content...
										</>
									) : (
										'Generate Content'
									)}
								</Button>
							</div>
						</Form>
					</Card.Body>
				</Card>
			)}

			{/* ============================================= */}
			{/* REVIEW SECTION */}
			{/* ============================================= */}

			{activeStep === 'review' && (
				<>
					{/* SUMMARY */}

					<div className="mb-4">
						<div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
							<div>
								<h5 className="mb-1">
									Review Generated Content
								</h5>

								<p className="text-muted small mb-0">
									Periksa dan sesuaikan konten sebelum
									dipublikasikan.
								</p>
							</div>

							<Badge bg="success">
								Generated Content
							</Badge>
						</div>

						<Row className="g-3">
							<Col md={4}>
								<Card className="text-center h-100">
									<Card.Body>
										<div className="text-muted small">
											Total Modules
										</div>

										<h3 className="mb-0">
											{totalModules}
										</h3>
									</Card.Body>
								</Card>
							</Col>

							<Col md={4}>
								<Card className="text-center h-100">
									<Card.Body>
										<div className="text-muted small">
											Total Lessons
										</div>

										<h3 className="mb-0">
											{totalLessons}
										</h3>
									</Card.Body>
								</Card>
							</Col>

							<Col md={4}>
								<Card className="text-center h-100">
									<Card.Body>
										<div className="text-muted small">
											Total Quiz Questions
										</div>

										<h3 className="mb-0">
											{totalQuizQuestions}
										</h3>
									</Card.Body>
								</Card>
							</Col>
						</Row>
					</div>

					{/* MODULE ACCORDION */}

					<Accordion defaultActiveKey="0">
						{modules.map((mod, modIndex) => (
							<Accordion.Item
								eventKey={String(modIndex)}
								key={mod.id}
								className="mb-3 border rounded"
							>
								<Accordion.Header>
									<div className="d-flex justify-content-between align-items-center w-100 pe-3 flex-wrap gap-2">
										<span className="fw-semibold">
											{mod.title}
										</span>

										<div className="d-flex gap-2">
											<Badge bg="primary">
												{mod.lessons.length} Lesson
											</Badge>

											<Badge bg="warning" text="dark">
												{mod.quiz?.questions?.length || 0} Quiz
											</Badge>
										</div>
									</div>
								</Accordion.Header>

								<Accordion.Body>

									{/* MODULE INFORMATION */}

									<div className="mb-4 pb-3 border-bottom">
										{editingModuleId === mod.id ? (
											<Form>
												<Form.Group className="mb-3">
													<Form.Label className="fw-semibold">
														Module Title
													</Form.Label>

													<Form.Control
														type="text"
														value={moduleForm.title}
														onChange={(e) =>
															setModuleForm({
																...moduleForm,
																title: e.target.value,
															})
														}
														required
													/>
												</Form.Group>

												<Form.Group className="mb-3">
													<Form.Label className="fw-semibold">
														Module Description
													</Form.Label>

													<Form.Control
														as="textarea"
														rows={2}
														value={moduleForm.description}
														onChange={(e) =>
															setModuleForm({
																...moduleForm,
																description: e.target.value,
															})
														}
													/>
												</Form.Group>

												<div className="d-flex gap-2">
													<Button
														size="sm"
														variant="primary"
														onClick={() =>
															saveModuleEdit(mod.id)
														}
														disabled={!moduleForm.title.trim()}
													>
														Simpan Module
													</Button>

													<Button
														size="sm"
														variant="outline-secondary"
														onClick={() =>
															setEditingModuleId(null)
														}
													>
														Batal
													</Button>
												</div>
											</Form>
										) : (
											<div className="d-flex justify-content-between align-items-start gap-3">
												<div>
													<h6 className="mb-1">
														{mod.title}
													</h6>

													<p className="text-muted mb-0 small">
														{mod.description}
													</p>
												</div>

												<Button
													size="sm"
													variant="outline-secondary"
													onClick={() =>
														startEditModule(mod)
													}
												>
													Edit Module
												</Button>
											</div>
										)}
									</div>

									{/* LESSON LIST */}

									<div className="mb-4">
										<div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
											<h6 className="mb-0">
												Daftar Lesson ({mod.lessons.length})
											</h6>

											<Button
												size="sm"
												variant="outline-primary"
												onClick={() =>
													openAddLessonModal(mod.id)
												}
											>
												+ Tambah Lesson
											</Button>
										</div>

										{mod.lessons.length === 0 ? (
											<Alert
												variant="light"
												className="border text-muted small mb-0"
											>
												Belum ada lesson pada modul ini.
												Klik Tambah Lesson untuk
												menambahkan materi.
											</Alert>
										) : (
											<ListGroup>
												{mod.lessons.map((lesson, idx) => (
													<ListGroup.Item
														key={lesson.id}
														className="d-flex justify-content-between align-items-center flex-wrap gap-3"
													>
														<div style={{ flex: 1, minWidth: '200px' }}>
															<div className="fw-semibold">
																{idx + 1}. {lesson.title}
															</div>

															<div className="text-muted small mt-1">
																{lesson.summary}
															</div>
														</div>

														<div className="d-flex gap-2 flex-wrap">
															<Button
																size="sm"
																variant="outline-info"
																onClick={() =>
																	setViewingLesson({
																		...lesson,
																		moduleTitle: mod.title,
																	})
																}
															>
																Detail
															</Button>

															<Button
																size="sm"
																variant="outline-secondary"
																onClick={() =>
																	openEditLessonModal(
																		mod.id,
																		lesson
																	)
																}
															>
																Edit
															</Button>

															<Button
																size="sm"
																variant="outline-danger"
																onClick={() =>
																	handleDeleteLesson(
																		mod.id,
																		lesson.id
																	)
																}
															>
																Hapus
															</Button>
														</div>
													</ListGroup.Item>
												))}
											</ListGroup>
										)}
									</div>

									{/* QUIZ LIST */}

									<div>
										<div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
											<h6 className="mb-0">
												Quiz Questions (
												{mod.quiz?.questions?.length || 0})
											</h6>

											<Badge bg="secondary">
												Passing Score:{' '}
												{mod.quiz?.passingScore ?? 75}%
											</Badge>
										</div>

										{!mod.quiz?.questions?.length ? (
											<Alert
												variant="light"
												className="border text-muted small mb-0"
											>
												Tidak ada pertanyaan kuis
												pada modul ini.
											</Alert>
										) : (
											<ListGroup>
												{mod.quiz.questions.map(
													(question, qIdx) => (
														<ListGroup.Item
															key={question.id}
														>
															<div className="d-flex justify-content-between align-items-start gap-2 mb-3">
																<div className="fw-semibold">
																	Q{qIdx + 1}.{' '}
																	{question.question}
																</div>

																<div className="d-flex gap-2 flex-shrink-0">
																	<Button
																		size="sm"
																		variant="outline-secondary"
																		onClick={() =>
																			openEditQuizModal(
																				mod.id,
																				question
																			)
																		}
																	>
																		Edit
																	</Button>

																	<Button
																		size="sm"
																		variant="outline-danger"
																		onClick={() =>
																			handleDeleteQuizQuestion(
																				mod.id,
																				question.id
																			)
																		}
																	>
																		Hapus
																	</Button>
																</div>
															</div>

															<ul className="list-unstyled mb-3 small">
																{question.options.map(
																	(option, optIdx) => {
																		const isCorrect =
																			Number(
																				question.correctAnswer
																			) === optIdx;

																		return (
																			<li
																				key={optIdx}
																				className={`mb-1 ${isCorrect
																						? 'text-success fw-semibold'
																						: 'text-muted'
																					}`}
																			>
																				{OPTION_LABELS[optIdx]}.{' '}
																				{option}

																				{isCorrect && (
																					<Badge
																						bg="success"
																						className="ms-2"
																					>
																						Jawaban Benar
																					</Badge>
																				)}
																			</li>
																		);
																	}
																)}
															</ul>

															<div className="small text-muted bg-light p-3 rounded">
																<strong>
																	Explanation:
																</strong>

																<div className="mt-1">
																	{question.explanation}
																</div>
															</div>
														</ListGroup.Item>
													)
												)}
											</ListGroup>
										)}
									</div>
								</Accordion.Body>
							</Accordion.Item>
						))}
					</Accordion>

					{/* REVIEW ACTIONS */}

					<div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4">
						<Button
							variant="outline-secondary"
							onClick={() => setActiveStep('generate')}
						>
							Back to Generation
						</Button>

						<div className="d-flex gap-2 flex-wrap">
							<Button
								variant="outline-primary"
								onClick={handleSaveDraft}
							>
								Save as Draft
							</Button>

							<Button
								variant="success"
								onClick={() => setShowPublishModal(true)}
							>
								Approve & Publish
							</Button>
						</div>
					</div>
				</>
			)}

			{/* ============================================= */}
			{/* MODAL: LESSON DETAIL */}
			{/* ============================================= */}

			<Modal
				show={Boolean(viewingLesson)}
				onHide={() => setViewingLesson(null)}
				size="lg"
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title>Detail Lesson</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					{viewingLesson && (
						<>
							<Badge bg="info" text="dark" className="mb-2">
								{viewingLesson.moduleTitle}
							</Badge>

							<h5 className="mb-3">
								{viewingLesson.title}
							</h5>

							<div className="mb-3">
								<strong>Learning Objectives</strong>

								<p className="text-muted mb-0 mt-1">
									{viewingLesson.learningObjectives || '-'}
								</p>
							</div>

							<div className="mb-3">
								<strong>Content</strong>

								<div
									className="mt-2"
									style={{
										whiteSpace: 'pre-line',
										lineHeight: 1.7,
									}}
								>
									{viewingLesson.content}
								</div>
							</div>

							<div>
								<strong>Summary</strong>

								<p className="text-muted mb-0 mt-1">
									{viewingLesson.summary || '-'}
								</p>
							</div>
						</>
					)}
				</Modal.Body>

				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={() => setViewingLesson(null)}
					>
						Tutup
					</Button>
				</Modal.Footer>
			</Modal>

			{/* ============================================= */}
			{/* MODAL: ADD / EDIT LESSON */}
			{/* ============================================= */}

			<Modal
				show={lessonModal.show}
				onHide={closeLessonModal}
				size="lg"
				centered
			>
				<Form onSubmit={handleSaveLesson}>
					<Modal.Header closeButton>
						<Modal.Title>
							{lessonModal.mode === 'add'
								? 'Tambah Lesson Manual'
								: 'Edit Lesson'}
						</Modal.Title>
					</Modal.Header>

					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label className="fw-semibold">
								Lesson Title
							</Form.Label>

							<Form.Control
								type="text"
								value={lessonForm.title}
								onChange={(e) =>
									setLessonForm({
										...lessonForm,
										title: e.target.value,
									})
								}
								placeholder="Masukkan judul lesson"
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label className="fw-semibold">
								Learning Objectives
							</Form.Label>

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
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label className="fw-semibold">
								Content
							</Form.Label>

							<Form.Control
								as="textarea"
								rows={6}
								value={lessonForm.content}
								onChange={(e) =>
									setLessonForm({
										...lessonForm,
										content: e.target.value,
									})
								}
								placeholder="Masukkan isi materi lesson..."
								required
							/>
						</Form.Group>

						<Form.Group className="mb-0">
							<Form.Label className="fw-semibold">
								Summary
							</Form.Label>

							<Form.Control
								as="textarea"
								rows={2}
								value={lessonForm.summary}
								onChange={(e) =>
									setLessonForm({
										...lessonForm,
										summary: e.target.value,
									})
								}
								placeholder="Ringkasan lesson..."
							/>
						</Form.Group>
					</Modal.Body>

					<Modal.Footer>
						<Button
							variant="outline-secondary"
							onClick={closeLessonModal}
						>
							Batal
						</Button>

						<Button type="submit" variant="primary">
							Simpan Lesson
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{/* ============================================= */}
			{/* MODAL: EDIT QUIZ */}
			{/* ============================================= */}

			<Modal
				show={quizModal.show}
				onHide={closeQuizModal}
				size="lg"
				centered
			>
				<Form onSubmit={handleSaveQuiz}>
					<Modal.Header closeButton>
						<Modal.Title>
							Edit Quiz Question
						</Modal.Title>
					</Modal.Header>

					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label className="fw-semibold">
								Question
							</Form.Label>

							<Form.Control
								as="textarea"
								rows={3}
								value={quizForm.question}
								onChange={(e) =>
									setQuizForm({
										...quizForm,
										question: e.target.value,
									})
								}
								required
							/>
						</Form.Group>

						<Form.Label className="fw-semibold">
							Answer Options
						</Form.Label>

						{quizForm.options.map((option, idx) => (
							<Form.Group
								key={idx}
								className="mb-2 d-flex align-items-center gap-2"
							>
								<span
									className="fw-semibold"
									style={{ width: '24px' }}
								>
									{OPTION_LABELS[idx]}.
								</span>

								<Form.Control
									type="text"
									value={option}
									onChange={(e) =>
										handleOptionChange(
											idx,
											e.target.value
										)
									}
									required
								/>
							</Form.Group>
						))}

						<Form.Group className="mt-3 mb-3">
							<Form.Label className="fw-semibold">
								Correct Answer
							</Form.Label>

							<Form.Select
								value={quizForm.correctAnswer}
								onChange={(e) =>
									setQuizForm({
										...quizForm,
										correctAnswer: Number(e.target.value),
									})
								}
							>
								{OPTION_LABELS.map((label, idx) => (
									<option key={label} value={idx}>
										Option {label}
									</option>
								))}
							</Form.Select>
						</Form.Group>

						<Form.Group>
							<Form.Label className="fw-semibold">
								Explanation
							</Form.Label>

							<Form.Control
								as="textarea"
								rows={3}
								value={quizForm.explanation}
								onChange={(e) =>
									setQuizForm({
										...quizForm,
										explanation: e.target.value,
									})
								}
								placeholder="Penjelasan jawaban yang benar..."
							/>
						</Form.Group>
					</Modal.Body>

					<Modal.Footer>
						<Button
							variant="outline-secondary"
							onClick={closeQuizModal}
						>
							Batal
						</Button>

						<Button type="submit" variant="primary">
							Simpan Quiz
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{/* ============================================= */}
			{/* MODAL: APPROVE & PUBLISH */}
			{/* ============================================= */}

			<Modal
				show={showPublishModal}
				onHide={() => setShowPublishModal(false)}
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title>
						Konfirmasi Approve & Publish
					</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<p>
						Apakah Anda yakin ingin menyetujui dan
						mempublikasikan konten hasil generasi AI ini ke:
					</p>

					<strong>
						{MOCK_LEARNING_PATH.title}
					</strong>

					<hr />

					<div className="small text-muted">
						<div className="d-flex justify-content-between mb-2">
							<span>Total Modules</span>
							<strong>{totalModules}</strong>
						</div>

						<div className="d-flex justify-content-between mb-2">
							<span>Total Lessons</span>
							<strong>{totalLessons}</strong>
						</div>

						<div className="d-flex justify-content-between">
							<span>Total Quiz Questions</span>
							<strong>{totalQuizQuestions}</strong>
						</div>
					</div>

					<Alert variant="warning" className="mt-3 mb-0 small">
						Pastikan seluruh Module, Lesson, dan Quiz telah
						diperiksa sebelum dipublikasikan.
					</Alert>
				</Modal.Body>

				<Modal.Footer>
					<Button
						variant="outline-secondary"
						onClick={() => setShowPublishModal(false)}
					>
						Batal
					</Button>

					<Button
						variant="success"
						onClick={handleConfirmPublish}
					>
						Ya, Approve & Publish
					</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	);
};

export default UploadPage;
