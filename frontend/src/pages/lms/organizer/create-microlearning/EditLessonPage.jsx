import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	Container,
	Row,
	Col,
	Card,
	Form,
	Button,
	Badge,
	Breadcrumb,
	Toast,
	ToastContainer,
	InputGroup,
} from 'react-bootstrap';
import {
	ChevronLeft,
	Save,
	Video,
	HelpCircle,
	Clock,
	Award,
	Plus,
	Trash2,
	Paperclip,
	Tag as TagIcon,
	FileText,
	X,
	CheckCircle,
} from 'lucide-react';

const EditLessonPage = () => {
	// Ambil Parameter dari Route
	const { learningId, moduleId, lessonId } = useParams();
	const navigate = useNavigate();

	// Toast Notification State
	const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

	const triggerToast = (message, variant = 'success') => {
		setToast({ show: true, message, variant });
	};

	// State Utama Lesson Data
	const [lessonData, setLessonData] = useState({
		title: 'Lesson 1.1 Introduction to Variables',
		duration: 10,
		xp: 25,
		isPrerequisite: false,
		contentSummary:
			'Materi pengenalan dasar konsep variabel, tipe data dasar, dan memori pada Python.',
		// Form Artikel
		articleBody:
			'### Pengenalan Variabel\n\nVariabel adalah lokasi penyimpanan bernama di memori komputer yang digunakan untuk menyimpan nilai data...',
		attachments: [{ id: 1, name: 'Cheatsheet_Python_Variables.pdf', size: '1.2 MB' }],
		// Form Video
		videoUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
		videoNotes:
			'Pastikan menyimak poin penting pada menit 03:15 mengenai mutable & immutable types.',
		// Form Kuis
		quizPassingScore: 80,
		quizMaxAttempts: 3,
		isGraded: true,
		questions: [
			{
				id: 1,
				questionText: 'Manakah penulisan nama variabel yang VALID di Python?',
				options: ['123_variable', '_user_name', 'user-name', 'class'],
				correctOption: 1,
				explanation:
					'Nama variabel di Python dapat diawali dengan garis bawah (_) atau huruf.',
			},
		],
		// Skill Tags
		tags: ['Python', 'Variables', 'Data Types'],
	});

	const [newTagInput, setNewTagInput] = useState('');

	// Handle Tambah Tag Skill
	const handleAddTag = () => {
		if (newTagInput.trim() && !lessonData.tags.includes(newTagInput.trim())) {
			setLessonData({
				...lessonData,
				tags: [...lessonData.tags, newTagInput.trim()],
			});
			setNewTagInput('');
		}
	};

	// Handle Hapus Tag
	const handleRemoveTag = (tagToRemove) => {
		setLessonData({
			...lessonData,
			tags: lessonData.tags.filter((t) => t !== tagToRemove),
		});
	};

	// Handle Tambah Soal Kuis
	const handleAddQuestion = () => {
		const newQ = {
			id: Date.now(),
			questionText: '',
			options: ['', '', '', ''],
			correctOption: 0,
			explanation: '',
		};
		setLessonData({
			...lessonData,
			questions: [...lessonData.questions, newQ],
		});
	};

	// Handle Hapus Soal Kuis
	const handleRemoveQuestion = (qId) => {
		setLessonData({
			...lessonData,
			questions: lessonData.questions.filter((q) => q.id !== qId),
		});
	};

	// Submit Handler
	const handleSaveLesson = (e) => {
		e?.preventDefault();
		triggerToast('Lesson berhasil disimpan!');
	};

	return (
		<div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '100px' }}>
			{/* Toast Notification */}
			<ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
				<Toast
					onClose={() => setToast({ ...toast, show: false })}
					show={toast.show}
					delay={3000}
					autohide
					bg={toast.variant}
				>
					<Toast.Body className="text-white fw-semibold">{toast.message}</Toast.Body>
				</Toast>
			</ToastContainer>

			<Container className="py-4">
				{/* Navigasi Atas / Breadcrumb */}
				<Breadcrumb className="mb-3">
					<Breadcrumb.Item
						onClick={() =>
							navigate(
								`/organizer/learning-path/${learningId || 1}/edit-module/${moduleId || 1}`,
							)
						}
						className="text-decoration-none cursor-pointer"
					>
						<ChevronLeft size={16} className="me-1" /> Kembali ke Edit Modul
					</Breadcrumb.Item>
					<Breadcrumb.Item active className="fw-semibold text-dark">
						Edit Lesson (ID: {lessonId || 'NEW'})
					</Breadcrumb.Item>
				</Breadcrumb>

				{/* Header Title */}
				<div className="d-flex align-items-center justify-content-between mb-4">
					<div>
						<h3 className="fw-bold mb-1">Editor Unit Pembelajaran / Lesson</h3>
						<p className="text-muted small mb-0">
							Kelola materi, media video, kuis evaluasi, atribut gamifikasi, dan tag
							skill dalam satu halaman.
						</p>
					</div>
					<Badge bg="primary" className="px-3 py-2 fs-6 fw-normal">
						Modul ID: {moduleId || '1'}
					</Badge>
				</div>

				{/* SINGLE COLUMN LAYOUT */}
				<Row className="justify-content-center">
					<Col lg={9} xl={8}>
						{/* 1. JUDUL -> RINGKASAN / DESKRIPSI */}
						<Card className="shadow-sm border-0 rounded-3 p-3 bg-white mb-4">
							<Card.Header className="bg-transparent border-0 pb-0">
								<div className="d-flex align-items-center gap-2">
									<FileText className="text-primary" size={20} />
									<h5 className="fw-bold mb-0">1. Informasi Utama & Ringkasan</h5>
								</div>
							</Card.Header>
							<Card.Body className="pt-3">
								<Form.Group className="mb-3">
									<Form.Label className="fw-bold small text-secondary">
										JUDUL LESSON / UNIT
									</Form.Label>
									<Form.Control
										type="text"
										size="lg"
										className="fw-bold fs-5 text-dark"
										value={lessonData.title}
										onChange={(e) =>
											setLessonData({ ...lessonData, title: e.target.value })
										}
										placeholder="Masukkan judul lesson..."
									/>
								</Form.Group>

								<Form.Group className="mb-0">
									<Form.Label className="fw-bold small text-secondary">
										RINGKASAN & DESKRIPSI LESSON
									</Form.Label>
									<Form.Control
										as="textarea"
										rows={3}
										value={lessonData.contentSummary}
										onChange={(e) =>
											setLessonData({
												...lessonData,
												contentSummary: e.target.value,
											})
										}
										placeholder="Tuliskan gambaran singkat mengenai topik ini..."
									/>
								</Form.Group>
							</Card.Body>
						</Card>

						{/* 2. VIDEO (KALAU ADA) */}
						<Card className="shadow-sm border-0 rounded-3 p-3 bg-white mb-4">
							<Card.Header className="bg-transparent border-0 pb-0">
								<div className="d-flex align-items-center gap-2">
									<Video className="text-primary" size={20} />
									<h5 className="fw-bold mb-0">2. Media Video (Opsional)</h5>
								</div>
							</Card.Header>
							<Card.Body className="pt-3">
								<Form.Group className="mb-3">
									<Form.Label className="fw-bold small text-secondary">
										URL VIDEO (YOUTUBE / VIMEO / MP4)
									</Form.Label>
									<InputGroup>
										<InputGroup.Text className="bg-light">
											<Video size={18} />
										</InputGroup.Text>
										<Form.Control
											type="text"
											placeholder="https://www.youtube.com/watch?v=..."
											value={lessonData.videoUrl}
											onChange={(e) =>
												setLessonData({
													...lessonData,
													videoUrl: e.target.value,
												})
											}
										/>
									</InputGroup>
								</Form.Group>

								{/* Preview Video Box */}
								{lessonData.videoUrl && (
									<div className="ratio ratio-16x9 bg-black rounded mb-3 d-flex align-items-center justify-content-center text-white">
										<div className="text-center p-4">
											<Video size={48} className="mb-2 text-primary" />
											<p className="mb-0 small text-muted">
												Preview Video Embed: {lessonData.videoUrl}
											</p>
										</div>
									</div>
								)}

								<Form.Group className="mb-0">
									<Form.Label className="fw-bold small text-secondary">
										CATATAN & INSTRUKSI TAMPILAN VIDEO
									</Form.Label>
									<Form.Control
										as="textarea"
										rows={2}
										value={lessonData.videoNotes}
										onChange={(e) =>
											setLessonData({
												...lessonData,
												videoNotes: e.target.value,
											})
										}
										placeholder="Contoh: Perhatikan bagian simulasi kode pada menit 04:20..."
									/>
								</Form.Group>
							</Card.Body>
						</Card>

						{/* 3. EDITOR MATERIAL ARTIKEL / ISI MATERI */}
						<Card className="shadow-sm border-0 rounded-3 p-3 bg-white mb-4">
							<Card.Header className="bg-transparent border-0 pb-0">
								<div className="d-flex align-items-center gap-2">
									<FileText className="text-primary" size={20} />
									<h5 className="fw-bold mb-0">3. Material Artikel & Lampiran</h5>
								</div>
							</Card.Header>
							<Card.Body className="pt-3">
								<Form.Group className="mb-4">
									<Form.Label className="fw-bold small text-secondary">
										ISI MATERI (MARKDOWN / TEKS)
									</Form.Label>
									<Form.Control
										as="textarea"
										rows={8}
										value={lessonData.articleBody}
										onChange={(e) =>
											setLessonData({
												...lessonData,
												articleBody: e.target.value,
											})
										}
										className="font-monospace fs-6"
										placeholder="Tuliskan materi pembelajaran di sini..."
									/>
								</Form.Group>

								{/* File Attachments */}
								<div>
									<Form.Label className="fw-bold small text-secondary">
										LAMPIRAN & BERKAS PENDUKUNG
									</Form.Label>
									<div className="border rounded p-3 bg-light">
										{lessonData.attachments.map((file) => (
											<div
												key={file.id}
												className="d-flex align-items-center justify-content-between p-2 bg-white rounded border mb-2"
											>
												<div className="d-flex align-items-center gap-2">
													<Paperclip size={16} className="text-primary" />
													<span className="fw-semibold text-dark small">
														{file.name}
													</span>
													<span className="text-muted extra-small">
														({file.size})
													</span>
												</div>
												<Button
													variant="link"
													className="text-danger p-0 border-0"
													onClick={() =>
														setLessonData({
															...lessonData,
															attachments:
																lessonData.attachments.filter(
																	(a) => a.id !== file.id,
																),
														})
													}
												>
													<Trash2 size={16} />
												</Button>
											</div>
										))}
										<Button
											variant="outline-primary"
											size="sm"
											className="w-100 mt-1"
										>
											<Plus size={16} className="me-1" /> Unggah Berkas Baru
											(PDF/ZIP/Slides)
										</Button>
									</div>
								</div>
							</Card.Body>
						</Card>

						{/* 4. BUAT KUIS (DIKAITKAN DENGAN LESSON) */}
						<Card className="shadow-sm border-0 rounded-3 p-3 bg-white mb-4">
							<Card.Header className="bg-transparent border-0 pb-0">
								<div className="d-flex align-items-center gap-2">
									<HelpCircle className="text-primary" size={20} />
									<h5 className="fw-bold mb-0">4. Kuis Evaluasi Lesson</h5>
								</div>
							</Card.Header>
							<Card.Body className="pt-3">
								{/* Setting Kuis */}
								<Row className="g-3 mb-4 p-3 bg-light rounded border">
									<Col md={4}>
										<Form.Group>
											<Form.Label className="fw-bold small">
												Passing Grade (%)
											</Form.Label>
											<Form.Control
												type="number"
												value={lessonData.quizPassingScore}
												onChange={(e) =>
													setLessonData({
														...lessonData,
														quizPassingScore: Number(e.target.value),
													})
												}
											/>
										</Form.Group>
									</Col>
									<Col md={4}>
										<Form.Group>
											<Form.Label className="fw-bold small">
												Maksimal Percobaan
											</Form.Label>
											<Form.Control
												type="number"
												value={lessonData.quizMaxAttempts}
												onChange={(e) =>
													setLessonData({
														...lessonData,
														quizMaxAttempts: Number(e.target.value),
													})
												}
											/>
										</Form.Group>
									</Col>
									<Col md={4} className="d-flex align-items-end">
										<Form.Check
											type="switch"
											id="graded-check"
											label="Diisikan Nilai (Graded)"
											checked={lessonData.isGraded}
											onChange={(e) =>
												setLessonData({
													...lessonData,
													isGraded: e.target.checked,
												})
											}
											className="fw-bold small mb-2"
										/>
									</Col>
								</Row>

								{/* Daftar Soal */}
								<div className="d-flex align-items-center justify-content-between mb-3">
									<h6 className="fw-bold mb-0">
										Daftar Soal Kuis ({lessonData.questions.length})
									</h6>
									<Button
										variant="outline-primary"
										size="sm"
										onClick={handleAddQuestion}
									>
										<Plus size={16} className="me-1" /> Tambah Soal
									</Button>
								</div>

								{lessonData.questions.map((q, qIndex) => (
									<Card key={q.id} className="border rounded-3 mb-3 p-3 bg-white">
										<div className="d-flex justify-content-between align-items-center mb-2">
											<Badge bg="warning" className="text-dark">
												Soal #{qIndex + 1}
											</Badge>
											<Button
												variant="link"
												className="text-danger p-0"
												onClick={() => handleRemoveQuestion(q.id)}
											>
												<Trash2 size={16} />
											</Button>
										</div>

										<Form.Group className="mb-3">
											<Form.Control
												type="text"
												placeholder="Tuliskan pertanyaan kuis..."
												value={q.questionText}
												onChange={(e) => {
													const updated = [...lessonData.questions];
													updated[qIndex].questionText = e.target.value;
													setLessonData({
														...lessonData,
														questions: updated,
													});
												}}
											/>
										</Form.Group>

										{/* Options */}
										<div className="mb-3 ps-2">
											<Form.Label className="fw-bold small text-muted">
												Pilihan Jawaban (Tandai Radio untuk Jawaban Benar):
											</Form.Label>
											{q.options.map((opt, optIndex) => (
												<InputGroup key={optIndex} className="mb-2">
													<InputGroup.Radio
														name={`correct-${q.id}`}
														checked={q.correctOption === optIndex}
														onChange={() => {
															const updated = [
																...lessonData.questions,
															];
															updated[qIndex].correctOption =
																optIndex;
															setLessonData({
																...lessonData,
																questions: updated,
															});
														}}
													/>
													<Form.Control
														type="text"
														placeholder={`Pilihan ${String.fromCharCode(65 + optIndex)}`}
														value={opt}
														onChange={(e) => {
															const updated = [
																...lessonData.questions,
															];
															updated[qIndex].options[optIndex] =
																e.target.value;
															setLessonData({
																...lessonData,
																questions: updated,
															});
														}}
													/>
												</InputGroup>
											))}
										</div>

										<Form.Group>
											<Form.Control
												type="text"
												size="sm"
												placeholder="Penjelasan / Pembahasan Jawaban (Opsional)"
												value={q.explanation}
												onChange={(e) => {
													const updated = [...lessonData.questions];
													updated[qIndex].explanation = e.target.value;
													setLessonData({
														...lessonData,
														questions: updated,
													});
												}}
											/>
										</Form.Group>
									</Card>
								))}
							</Card.Body>
						</Card>

						{/* 5. ATRIBUT & GAMIFIKASI */}
						<Card className="shadow-sm border-0 rounded-3 p-3 bg-white mb-4">
							<Card.Header className="bg-transparent border-0 pb-0">
								<div className="d-flex align-items-center gap-2">
									<Award className="text-warning" size={20} />
									<h5 className="fw-bold mb-0">5. Atribut & Gamifikasi</h5>
								</div>
							</Card.Header>
							<Card.Body className="pt-3">
								<Row className="g-3 mb-3">
									<Col md={6}>
										<Form.Group>
											<Form.Label className="fw-bold small text-secondary d-flex align-items-center gap-1">
												<Clock size={15} /> ESTIMASI DURASI (MENIT)
											</Form.Label>
											<Form.Control
												type="number"
												min="1"
												value={lessonData.duration}
												onChange={(e) =>
													setLessonData({
														...lessonData,
														duration: Number(e.target.value),
													})
												}
											/>
										</Form.Group>
									</Col>

									<Col md={6}>
										<Form.Group>
											<Form.Label className="fw-bold small text-secondary d-flex align-items-center gap-1">
												<Award size={15} className="text-warning" /> REWARD
												XP
											</Form.Label>
											<Form.Control
												type="number"
												min="0"
												value={lessonData.xp}
												onChange={(e) =>
													setLessonData({
														...lessonData,
														xp: Number(e.target.value),
													})
												}
											/>
										</Form.Group>
									</Col>
								</Row>

								<hr />

								<Form.Group className="mb-0">
									<Form.Check
										type="switch"
										id="prereq-switch"
										label="Jadikan Unit Prasyarat Wajib"
										checked={lessonData.isPrerequisite}
										onChange={(e) =>
											setLessonData({
												...lessonData,
												isPrerequisite: e.target.checked,
											})
										}
										className="fw-bold small"
									/>
									<Form.Text className="text-muted extra-small">
										Mahasiswa harus menyelesaikan unit ini sebelum membuka unit
										selanjutnya.
									</Form.Text>
								</Form.Group>
							</Card.Body>
						</Card>

						{/* 6. TAG KEAHLIAN / SKILL */}
						<Card className="shadow-sm border-0 rounded-3 p-3 bg-white mb-4">
							<Card.Header className="bg-transparent border-0 pb-0">
								<div className="d-flex align-items-center gap-2">
									<TagIcon size={20} className="text-primary" />
									<h5 className="fw-bold mb-0">6. Tag Keahlian & Skill</h5>
								</div>
							</Card.Header>
							<Card.Body className="pt-3">
								<div className="d-flex flex-wrap gap-2 mb-3">
									{lessonData.tags.map((tag) => (
										<Badge
											key={tag}
											bg="light"
											className="text-dark border p-2 d-flex align-items-center gap-1 fs-6 fw-normal"
										>
											<span>{tag}</span>
											<Button
												variant="link"
												className="text-danger p-0 ms-1 d-inline-flex align-items-center"
												onClick={() => handleRemoveTag(tag)}
												style={{ textDecoration: 'none' }}
											>
												<X size={14} />
											</Button>
										</Badge>
									))}
								</div>

								<InputGroup style={{ maxWidth: '400px' }}>
									<Form.Control
										type="text"
										placeholder="Tambah tag baru..."
										value={newTagInput}
										onChange={(e) => setNewTagInput(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												handleAddTag();
											}
										}}
									/>
									<Button variant="outline-primary" onClick={handleAddTag}>
										<Plus size={16} className="me-1" /> Tambah
									</Button>
								</InputGroup>
							</Card.Body>
						</Card>

						{/* BUTTON ACTION SIMPAN */}
						<div className="d-flex justify-content-end gap-2 mb-5">
							<Button
								variant="outline-secondary"
								size="lg"
								onClick={() => navigate(-1)}
							>
								Batal
							</Button>
							<Button
								variant="primary"
								size="lg"
								className="d-flex align-items-center gap-2 px-4"
								onClick={handleSaveLesson}
							>
								<Save size={18} /> Simpan Lesson
							</Button>
						</div>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default EditLessonPage;
