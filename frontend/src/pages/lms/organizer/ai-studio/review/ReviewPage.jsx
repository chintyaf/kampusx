import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
	Container,
	Card,
	Accordion,
	Button,
	Badge,
	Row,
	Col,
	Form,
	Modal,
	Alert,
	ListGroup,
} from 'react-bootstrap';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const MOCK_LEARNING_PATH = {
	title: 'Full-Stack Web Development with REST API',
	category: 'Software Engineering',
	level: 'Intermediate',
	description:
		'Pelajari cara merancang, membangun, dan mengamankan RESTful API modern untuk aplikasi web skala produksi.',
	sourceFile: 'Materi_REST_API_Modern.pdf',
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
					'Peserta mampu menjelaskan struktur HTTP Request dan membedakan metode yang bersifat idempoten.',
				content:
					'Metode HTTP GET, PUT, dan DELETE harus bersifat idempoten — mengeksekusi request yang sama beberapa kali menghasilkan state yang sama pada server.\n\nSelain itu, penggunaan header seperti Content-Type dan Authorization sangat penting untuk memastikan pertukaran data berjalan aman dan terstandarisasi.',
				summary:
					'Ringkasan: Memahami komponen HTTP Request/Response dan pentingnya idempotensi pada metode GET, PUT, dan DELETE.',
			},
			{
				id: 'mod-1-les-2',
				title: '1.2 Desain Endpoint Semantik & Versioning API',
				learningObjectives:
					'Peserta mampu merancang URI endpoint yang bersih, konsisten, dan mendukung versioning.',
				content:
					'Gunakan kata benda jamak untuk koleksi sumber daya (misalnya /api/v1/students) dan hindari kata kerja di dalam URI.\n\nVersioning seperti /api/v1/ membantu menjaga kompatibilitas mundur saat terjadi perubahan kontrak API di masa depan.',
				summary:
					'Ringkasan: Praktik terbaik penamaan endpoint berbasis resource dan penerapan API versioning.',
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
					'Peserta mampu menjelaskan struktur JWT (Header, Payload, Signature) dan cara verifikasinya.',
				content:
					'JSON Web Token (JWT) terdiri dari tiga bagian utama: Header, Payload, dan Signature.\n\nKunci rahasia HMAC-SHA256 atau pasangan kunci asimetris RSA harus disimpan di Environment Variable yang aman dan tidak pernah diekspos ke sisi klien.',
				summary:
					'Ringkasan: Struktur dasar JWT dan praktik aman dalam pengelolaan secret key pada backend.',
			},
			{
				id: 'mod-2-les-2',
				title: '2.2 Validasi Payload & Pencegahan SQL Injection',
				learningObjectives:
					'Peserta mampu menerapkan validasi input dan parameterized query untuk mencegah serangan injeksi.',
				content:
					'Seluruh input dari client harus dianggap tidak tepercaya. Gunakan schema validation di layer controller/middleware sebelum data diproses.\n\nSelalu gunakan prepared statements atau ORM query builder untuk menghindari celah SQL Injection.',
				summary:
					'Ringkasan: Pentingnya validasi skema input dan penggunaan parameterized query pada akses basis data.',
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
					question: 'Cara paling efektif untuk mencegah serangan SQL Injection pada API adalah...',
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

const ReviewPage = () => {
	const { learningId } = useParams();
	const navigate = useNavigate();

	const [modules, setModules] = useState(INITIAL_MOCK_MODULES);
	const [statusAlert, setStatusAlert] = useState(null);

	// Module edit state
	const [editingModuleId, setEditingModuleId] = useState(null);
	const [moduleForm, setModuleForm] = useState({ title: '', description: '' });

	// Lesson detail modal state
	const [viewingLesson, setViewingLesson] = useState(null);

	// Lesson add/edit modal state
	const [lessonModal, setLessonModal] = useState({
		show: false,
		mode: 'edit',
		moduleId: null,
		lessonId: null,
	});
	const [lessonForm, setLessonForm] = useState({
		title: '',
		content: '',
		summary: '',
		learningObjectives: '',
	});

	// Quiz edit modal state
	const [quizModal, setQuizModal] = useState({ show: false, moduleId: null, questionId: null });
	const [quizForm, setQuizForm] = useState({
		question: '',
		options: ['', '', '', ''],
		correctAnswer: 0,
		explanation: '',
	});

	// Approve & Publish confirmation modal
	const [showPublishModal, setShowPublishModal] = useState(false);

	// Summary counts
	const totalModules = modules.length;
	const totalLessons = modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
	const totalQuizQuestions = modules.reduce(
		(sum, mod) => sum + (mod.quiz?.questions?.length || 0),
		0
	);

	// Module handlers
	const startEditModule = (mod) => {
		setEditingModuleId(mod.id);
		setModuleForm({ title: mod.title, description: mod.description });
	};

	const saveModuleEdit = (moduleId) => {
		setModules((prev) =>
			prev.map((m) =>
				m.id === moduleId
					? {
							...m,
							title: moduleForm.title.trim() || m.title,
							description: moduleForm.description,
						}
					: m
			)
		);
		setEditingModuleId(null);
	};

	// Lesson handlers
	const openAddLessonModal = (moduleId) => {
		setLessonForm({
			title: '',
			content: '',
			summary: '',
			learningObjectives: '',
		});
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

	const handleSaveLesson = (e) => {
		e.preventDefault();
		const { mode, moduleId, lessonId } = lessonModal;

		if (mode === 'add') {
			const newLesson = {
				id: `les-manual-${Date.now()}`,
				title: lessonForm.title.trim() || 'New Lesson',
				content: lessonForm.content,
				summary: lessonForm.summary,
				learningObjectives: lessonForm.learningObjectives,
			};
			setModules((prev) =>
				prev.map((m) => (m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m))
			);
		} else {
			setModules((prev) =>
				prev.map((m) =>
					m.id === moduleId
						? {
								...m,
								lessons: m.lessons.map((l) =>
									l.id === lessonId
										? {
												...l,
												title: lessonForm.title.trim() || l.title,
												content: lessonForm.content,
												summary: lessonForm.summary,
												learningObjectives: lessonForm.learningObjectives,
											}
										: l
								),
							}
						: m
				)
			);
		}
		setLessonModal({ show: false, mode: 'edit', moduleId: null, lessonId: null });
	};

	const handleDeleteLesson = (moduleId, lessonId) => {
		setModules((prev) =>
			prev.map((m) =>
				m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m
			)
		);
	};

	// Quiz handlers
	const openEditQuizModal = (moduleId, q) => {
		setQuizForm({
			question: q.question,
			options: [...q.options],
			correctAnswer: Number(q.correctAnswer) || 0,
			explanation: q.explanation,
		});
		setQuizModal({ show: true, moduleId, questionId: q.id });
	};

	const handleOptionChange = (idx, value) => {
		setQuizForm((prev) => {
			const nextOptions = [...prev.options];
			nextOptions[idx] = value;
			return { ...prev, options: nextOptions };
		});
	};

	const handleSaveQuiz = (e) => {
		e.preventDefault();
		const { moduleId, questionId } = quizModal;
		setModules((prev) =>
			prev.map((m) =>
				m.id === moduleId
					? {
							...m,
							quiz: {
								...m.quiz,
								questions: m.quiz.questions.map((q) =>
									q.id === questionId
										? {
												...q,
												question: quizForm.question.trim() || q.question,
												options: quizForm.options,
												correctAnswer: Number(quizForm.correctAnswer),
												explanation: quizForm.explanation,
											}
										: q
								),
							},
						}
					: m
			)
		);
		setQuizModal({ show: false, moduleId: null, questionId: null });
	};

	const handleDeleteQuizQuestion = (moduleId, questionId) => {
		setModules((prev) =>
			prev.map((m) =>
				m.id === moduleId
					? {
							...m,
							quiz: {
								...m.quiz,
								questions: m.quiz.questions.filter((q) => q.id !== questionId),
							},
						}
					: m
			)
		);
	};

	// Action buttons
	const handleSaveDraft = () => {
		setStatusAlert({
			variant: 'info',
			message: 'Draft berhasil disimpan sementara (simulasi state).',
		});
	};

	const handleConfirmPublish = () => {
		setShowPublishModal(false);
		setStatusAlert({
			variant: 'success',
			message: 'Konten berhasil disetujui dan dipublikasikan ke Learning Path!',
		});
	};

	return (
		<Container className="py-4" style={{ maxWidth: '1000px' }}>
			{/* Header & Action Buttons */}
			<div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
				<div>
					<h2 className="mb-1">Review Generated Content</h2>
					<p className="text-muted mb-0">
						Periksa, ubah, atau lengkapi hasil generasi AI sebelum disimpan atau dipublikasikan.
					</p>
				</div>
				<div className="d-flex gap-2 flex-wrap">
					<Button
						variant="outline-secondary"
						onClick={() => navigate(`/organizer/learning-path/${learningId}/generate`)}
					>
						Back to Generation
					</Button>
					<Button variant="outline-primary" onClick={handleSaveDraft}>
						Save as Draft
					</Button>
					<Button variant="success" onClick={() => setShowPublishModal(true)}>
						Approve & Publish
					</Button>
				</div>
			</div>

			{statusAlert && (
				<Alert variant={statusAlert.variant} dismissible onClose={() => setStatusAlert(null)}>
					{statusAlert.message}
				</Alert>
			)}

			{/* Informasi Learning Path */}
			<Card className="mb-4">
				<Card.Header className="fw-semibold">Informasi Learning Path</Card.Header>
				<Card.Body>
					<div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
						<div>
							<h5 className="mb-1">{MOCK_LEARNING_PATH.title}</h5>
							<p className="text-muted mb-0">{MOCK_LEARNING_PATH.description}</p>
						</div>
						<div className="d-flex gap-2">
							<Badge bg="secondary">ID: {learningId || '1'}</Badge>
							<Badge bg="info" text="dark">
								{MOCK_LEARNING_PATH.category}
							</Badge>
							<Badge bg="light" text="dark" className="border">
								Sumber: {MOCK_LEARNING_PATH.sourceFile}
							</Badge>
						</div>
					</div>
				</Card.Body>
			</Card>

			{/* Ringkasan Jumlah */}
			<Row className="g-3 mb-4">
				<Col md={4}>
					<Card className="text-center">
						<Card.Body>
							<div className="text-muted small">Total Module</div>
							<h3 className="mb-0">{totalModules}</h3>
						</Card.Body>
					</Card>
				</Col>
				<Col md={4}>
					<Card className="text-center">
						<Card.Body>
							<div className="text-muted small">Total Lesson</div>
							<h3 className="mb-0">{totalLessons}</h3>
						</Card.Body>
					</Card>
				</Col>
				<Col md={4}>
					<Card className="text-center">
						<Card.Body>
							<div className="text-muted small">Total Quiz Questions</div>
							<h3 className="mb-0">{totalQuizQuestions}</h3>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			{/* Daftar Module dengan Bootstrap Accordion */}
			<Accordion defaultActiveKey="0">
				{modules.map((mod, modIndex) => (
					<Accordion.Item eventKey={String(modIndex)} key={mod.id} className="mb-3 border rounded">
						<Accordion.Header>
							<div className="d-flex justify-content-between align-items-center w-100 pe-3 flex-wrap gap-2">
								<span className="fw-semibold">{mod.title}</span>
								<div className="d-flex gap-2">
									<Badge bg="primary">{mod.lessons.length} Lesson</Badge>
									<Badge bg="warning" text="dark">
										{mod.quiz?.questions?.length || 0} Quiz
									</Badge>
								</div>
							</div>
						</Accordion.Header>

						<Accordion.Body>
							{/* Module Info & Edit */}
							<div className="mb-4 pb-3 border-bottom">
								{editingModuleId === mod.id ? (
									<Form>
										<Form.Group className="mb-2">
											<Form.Label className="fw-semibold small">Module Title</Form.Label>
											<Form.Control
												type="text"
												value={moduleForm.title}
												onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
											/>
										</Form.Group>
										<Form.Group className="mb-2">
											<Form.Label className="fw-semibold small">Module Description</Form.Label>
											<Form.Control
												as="textarea"
												rows={2}
												value={moduleForm.description}
												onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
											/>
										</Form.Group>
										<div className="d-flex gap-2">
											<Button size="sm" variant="primary" onClick={() => saveModuleEdit(mod.id)}>
												Simpan Module
											</Button>
											<Button
												size="sm"
												variant="outline-secondary"
												onClick={() => setEditingModuleId(null)}
											>
												Batal
											</Button>
										</div>
									</Form>
								) : (
									<div className="d-flex justify-content-between align-items-start gap-3">
										<div>
											<h6 className="mb-1">{mod.title}</h6>
											<p className="text-muted mb-0 small">{mod.description}</p>
										</div>
										<Button
											size="sm"
											variant="outline-secondary"
											onClick={() => startEditModule(mod)}
										>
											Edit Module
										</Button>
									</div>
								)}
							</div>

							{/* Daftar Lesson */}
							<div className="mb-4">
								<div className="d-flex justify-content-between align-items-center mb-2">
									<h6 className="mb-0">Daftar Lesson ({mod.lessons.length})</h6>
									<Button
										size="sm"
										variant="outline-primary"
										onClick={() => openAddLessonModal(mod.id)}
									>
										+ Tambah Lesson
									</Button>
								</div>

								{mod.lessons.length === 0 ? (
									<Alert variant="light" className="border text-muted small mb-0">
										Belum ada lesson pada modul ini. Klik &quot;+ Tambah Lesson&quot; untuk menambahkan.
									</Alert>
								) : (
									<ListGroup>
										{mod.lessons.map((lesson, idx) => (
											<ListGroup.Item
												key={lesson.id}
												className="d-flex justify-content-between align-items-center flex-wrap gap-2"
											>
												<div>
													<div className="fw-semibold">
														{idx + 1}. {lesson.title}
													</div>
													<div className="text-muted small">{lesson.summary}</div>
												</div>
												<div className="d-flex gap-2">
													<Button
														size="sm"
														variant="outline-info"
														onClick={() => setViewingLesson(lesson)}
													>
														Detail
													</Button>
													<Button
														size="sm"
														variant="outline-secondary"
														onClick={() => openEditLessonModal(mod.id, lesson)}
													>
														Edit
													</Button>
													<Button
														size="sm"
														variant="outline-danger"
														onClick={() => handleDeleteLesson(mod.id, lesson.id)}
													>
														Hapus
													</Button>
												</div>
											</ListGroup.Item>
										))}
									</ListGroup>
								)}
							</div>

							{/* Daftar Quiz */}
							<div>
								<div className="d-flex justify-content-between align-items-center mb-2">
									<h6 className="mb-0">
										Quiz Questions ({mod.quiz?.questions?.length || 0})
									</h6>
									<Badge bg="secondary">Passing Score: {mod.quiz?.passingScore ?? 75}%</Badge>
								</div>

								{!mod.quiz?.questions?.length ? (
									<Alert variant="light" className="border text-muted small mb-0">
										Tidak ada pertanyaan kuis pada modul ini.
									</Alert>
								) : (
									<ListGroup>
										{mod.quiz.questions.map((q, qIdx) => (
											<ListGroup.Item key={q.id}>
												<div className="d-flex justify-content-between align-items-start gap-2 mb-2">
													<div className="fw-semibold">
														Q{qIdx + 1}. {q.question}
													</div>
													<div className="d-flex gap-2 flex-shrink-0">
														<Button
															size="sm"
															variant="outline-secondary"
															onClick={() => openEditQuizModal(mod.id, q)}
														>
															Edit
														</Button>
														<Button
															size="sm"
															variant="outline-danger"
															onClick={() => handleDeleteQuizQuestion(mod.id, q.id)}
														>
															Hapus
														</Button>
													</div>
												</div>

												<ul className="list-unstyled mb-2 small">
													{q.options.map((opt, optIdx) => {
														const isCorrect = Number(q.correctAnswer) === optIdx;
														return (
															<li
																key={optIdx}
																className={isCorrect ? 'text-success fw-semibold' : 'text-muted'}
															>
																{OPTION_LABELS[optIdx]}. {opt}{' '}
																{isCorrect && (
																	<Badge bg="success" className="ms-1">
																		Jawaban Benar
																	</Badge>
																)}
															</li>
														);
													})}
												</ul>

												<div className="small text-muted bg-light p-2 rounded">
													<strong>Explanation:</strong> {q.explanation}
												</div>
											</ListGroup.Item>
										))}
									</ListGroup>
								)}
							</div>
						</Accordion.Body>
					</Accordion.Item>
				))}
			</Accordion>

			{/* Modal Detail Lesson */}
			<Modal show={Boolean(viewingLesson)} onHide={() => setViewingLesson(null)} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Detail Lesson</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{viewingLesson && (
						<>
							<h5 className="mb-3">{viewingLesson.title}</h5>
							<div className="mb-3">
								<strong>Learning Objectives:</strong>
								<p className="text-muted mb-0 mt-1">{viewingLesson.learningObjectives}</p>
							</div>
							<div className="mb-3">
								<strong>Content:</strong>
								<p className="mb-0 mt-1" style={{ whiteSpace: 'pre-line' }}>
									{viewingLesson.content}
								</p>
							</div>
							<div>
								<strong>Summary:</strong>
								<p className="text-muted mb-0 mt-1">{viewingLesson.summary}</p>
							</div>
						</>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setViewingLesson(null)}>
						Tutup
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Modal Tambah / Edit Lesson */}
			<Modal
				show={lessonModal.show}
				onHide={() =>
					setLessonModal({ show: false, mode: 'edit', moduleId: null, lessonId: null })
				}
				size="lg"
			>
				<Form onSubmit={handleSaveLesson}>
					<Modal.Header closeButton>
						<Modal.Title>
							{lessonModal.mode === 'add' ? 'Tambah Lesson Manual' : 'Edit Lesson'}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label className="fw-semibold">Lesson Title</Form.Label>
							<Form.Control
								type="text"
								value={lessonForm.title}
								onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
								required
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label className="fw-semibold">Learning Objectives</Form.Label>
							<Form.Control
								as="textarea"
								rows={2}
								value={lessonForm.learningObjectives}
								onChange={(e) =>
									setLessonForm({ ...lessonForm, learningObjectives: e.target.value })
								}
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label className="fw-semibold">Content</Form.Label>
							<Form.Control
								as="textarea"
								rows={5}
								value={lessonForm.content}
								onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
								required
							/>
						</Form.Group>
						<Form.Group className="mb-0">
							<Form.Label className="fw-semibold">Summary</Form.Label>
							<Form.Control
								as="textarea"
								rows={2}
								value={lessonForm.summary}
								onChange={(e) => setLessonForm({ ...lessonForm, summary: e.target.value })}
							/>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button
							variant="outline-secondary"
							onClick={() =>
								setLessonModal({ show: false, mode: 'edit', moduleId: null, lessonId: null })
							}
						>
							Batal
						</Button>
						<Button type="submit" variant="primary">
							Simpan Lesson
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{/* Modal Edit Quiz Question */}
			<Modal
				show={quizModal.show}
				onHide={() => setQuizModal({ show: false, moduleId: null, questionId: null })}
				size="lg"
			>
				<Form onSubmit={handleSaveQuiz}>
					<Modal.Header closeButton>
						<Modal.Title>Edit Quiz Question</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label className="fw-semibold">Question</Form.Label>
							<Form.Control
								as="textarea"
								rows={2}
								value={quizForm.question}
								onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
								required
							/>
						</Form.Group>

						<Form.Label className="fw-semibold">Options</Form.Label>
						{quizForm.options.map((opt, idx) => (
							<Form.Group key={idx} className="mb-2 d-flex align-items-center gap-2">
								<span className="fw-semibold" style={{ width: '24px' }}>
									{OPTION_LABELS[idx]}.
								</span>
								<Form.Control
									type="text"
									value={opt}
									onChange={(e) => handleOptionChange(idx, e.target.value)}
									required
								/>
							</Form.Group>
						))}

						<Form.Group className="mb-3 mt-3">
							<Form.Label className="fw-semibold">Correct Answer</Form.Label>
							<Form.Select
								value={quizForm.correctAnswer}
								onChange={(e) =>
									setQuizForm({ ...quizForm, correctAnswer: Number(e.target.value) })
								}
							>
								{OPTION_LABELS.map((label, idx) => (
									<option key={label} value={idx}>
										Option {label}
									</option>
								))}
							</Form.Select>
						</Form.Group>

						<Form.Group className="mb-0">
							<Form.Label className="fw-semibold">Explanation</Form.Label>
							<Form.Control
								as="textarea"
								rows={2}
								value={quizForm.explanation}
								onChange={(e) => setQuizForm({ ...quizForm, explanation: e.target.value })}
							/>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button
							variant="outline-secondary"
							onClick={() => setQuizModal({ show: false, moduleId: null, questionId: null })}
						>
							Batal
						</Button>
						<Button type="submit" variant="primary">
							Simpan Quiz
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{/* Modal Konfirmasi Approve & Publish */}
			<Modal show={showPublishModal} onHide={() => setShowPublishModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Konfirmasi Approve & Publish</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>
						Apakah Anda yakin ingin menyetujui dan mempublikasikan konten hasil generasi AI ini ke{' '}
						<strong>{MOCK_LEARNING_PATH.title}</strong>?
					</p>
					<ul className="mb-0 small text-muted">
						<li>Total Module: {totalModules}</li>
						<li>Total Lesson: {totalLessons}</li>
						<li>Total Quiz Questions: {totalQuizQuestions}</li>
					</ul>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-secondary" onClick={() => setShowPublishModal(false)}>
						Batal
					</Button>
					<Button variant="success" onClick={handleConfirmPublish}>
						Ya, Approve & Publish
					</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	);
};

export default ReviewPage;
