import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Form, Button, Card, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { Plus, Trash2, Save, FileText } from 'lucide-react';
import api from '@/api/axios';
import { notify } from '@/utils/notify';

// ── Helpers ──────────────────────────────────────────────────────────────────
const newOption = (label, index) => ({
	option_label: label,
	option_text: '',
	is_correct: index === 0,
	order_index: index + 1,
});

const newQuestion = () => ({
	_key: Date.now() + Math.random(),
	question_text: '',
	bloom_level: '',
	explanation: '',
	options: ['A', 'B', 'C', 'D'].map(newOption),
});

const QuizEditorPage = () => {
	const { moduleId } = useParams();
	const { refreshModule } = useOutletContext() || {};

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [lessons, setLessons] = useState([]);
	const [quizzes, setQuizzes] = useState([]);
	const [selectedQuizId, setSelectedQuizId] = useState(null);

	// ── Fetch quizzes & lessons milik module ini ──────────────────────────────
	useEffect(() => {
		const fetchData = async () => {
			try {
				const [quizRes, lessonRes] = await Promise.all([
					api.get('/organizer/lms/quiz', { params: { module_id: moduleId, per_page: 50 } }),
					api.get('/organizer/lms/lessons', { params: { module_id: moduleId, per_page: 100 } }),
				]);

				const fetchedQuizzes = Array.isArray(quizRes.data?.data)
					? quizRes.data.data
					: quizRes.data?.data?.data ?? [];
				const fetchedLessons = Array.isArray(lessonRes.data?.data)
					? lessonRes.data.data
					: lessonRes.data?.data?.data ?? [];

				setLessons(fetchedLessons);
				setQuizzes(fetchedQuizzes);

				if (fetchedQuizzes.length > 0) {
					setSelectedQuizId(fetchedQuizzes[0].id);
				}
			} catch (err) {
				notify('error', 'Gagal memuat', err?.response?.data?.message ?? 'Terjadi kesalahan.');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [moduleId]);

	// Fetch detail quiz (dengan questions & options) setiap kali selectedQuizId berubah
	useEffect(() => {
		if (!selectedQuizId) return;

		const fetchQuizDetail = async () => {
			try {
				const { data } = await api.get(`/organizer/lms/quiz/${selectedQuizId}`);
				const q = data.data;

				setQuizzes((prev) =>
					prev.map((quiz) =>
						quiz.id === selectedQuizId
							? {
									...quiz,
									...q,
									questions:
										Array.isArray(q.questions) && q.questions.length
											? q.questions.map((qs) => ({
													...qs,
													_key: qs.id || Date.now() + Math.random(),
													options:
														Array.isArray(qs.options) && qs.options.length
															? qs.options.map((opt, optIdx) => ({
																	...opt,
																	option_label:
																		opt.option_label || String.fromCharCode(65 + optIdx),
																	option_text: opt.option_text || '',
																	is_correct: Boolean(opt.is_correct),
																	order_index: opt.order_index || optIdx + 1,
																}))
															: ['A', 'B', 'C', 'D'].map(newOption),
												}))
											: [newQuestion()],
								}
							: quiz,
					),
				);
			} catch (err) {
				console.error('Error fetching quiz detail:', err);
				notify('error', 'Gagal', 'Gagal memuat detail kuis.');
			}
		};

		fetchQuizDetail();
	}, [selectedQuizId]);

	// ── Computed ──────────────────────────────────────────────────────────────
	const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);

	const updateQuiz = (changes) => {
		setQuizzes((prev) =>
			prev.map((quiz) =>
				quiz.id === selectedQuizId ? { ...quiz, ...changes } : quiz,
			),
		);
	};

	// ── Buat quiz baru via API ─────────────────────────────────────────────────
	const createQuiz = async () => {
		const payload = {
			module_id: Number(moduleId),
			title: 'Kuis Baru',
			description: '',
			passing_score: 70,
			questions: [
				{
					question_text: 'Pertanyaan pertama',
					order_index: 1,
					options: ['A', 'B', 'C', 'D'].map((label, idx) => ({
						option_label: label,
						option_text: `Pilihan ${label}`,
						is_correct: idx === 0,
						order_index: idx + 1,
					})),
				},
			],
		};

		try {
			setSaving(true);
			const { data } = await api.post('/organizer/lms/quiz', payload);
			const created = {
				...data.data,
				questions:
					Array.isArray(data.data.questions) && data.data.questions.length
						? data.data.questions.map((qs) => ({ ...qs, _key: qs.id }))
						: [newQuestion()],
			};
			setQuizzes((prev) => [...prev, created]);
			setSelectedQuizId(created.id);
			notify('success', 'Berhasil', 'Kuis baru berhasil dibuat.');
			if (refreshModule) refreshModule();
		} catch (err) {
			notify('error', 'Gagal', err?.response?.data?.message ?? 'Gagal membuat kuis.');
		} finally {
			setSaving(false);
		}
	};

	// ── Simpan (PUT) quiz terpilih ────────────────────────────────────────────
	const saveQuiz = async () => {
		if (!selectedQuiz) return;
		setSaving(true);

		const validQuestions = (selectedQuiz.questions || []).filter(
			(q) => (q.question_text || '').trim() !== '',
		);

		const payload = {
			module_id: Number(moduleId),
			lesson_id: selectedQuiz.lesson_id ? Number(selectedQuiz.lesson_id) : null,
			title: selectedQuiz.title,
			description: selectedQuiz.description || null,
			bloom_level: selectedQuiz.bloom_level || null,
			passing_score: Number(selectedQuiz.passing_score ?? 70),
			time_limit_minutes: selectedQuiz.time_limit_minutes
				? Number(selectedQuiz.time_limit_minutes)
				: null,
			questions: validQuestions.map((q, idx) => ({
				question_text: q.question_text,
				bloom_level: q.bloom_level || null,
				explanation: q.explanation || null,
				order_index: idx + 1,
				options: (q.options || []).map((opt, oIdx) => ({
					option_label: opt.option_label || String.fromCharCode(65 + oIdx),
					option_text: opt.option_text || '',
					is_correct: Boolean(opt.is_correct),
					order_index: oIdx + 1,
				})),
			})),
		};

		try {
			await api.put(`/organizer/lms/quiz/${selectedQuizId}`, payload);
			notify('success', 'Berhasil', 'Kuis dan soal berhasil disimpan.');
			if (refreshModule) refreshModule();
		} catch (err) {
			notify('error', 'Gagal', err?.response?.data?.message ?? 'Gagal menyimpan kuis.');
		} finally {
			setSaving(false);
		}
	};

	// ── Hapus quiz terpilih ───────────────────────────────────────────────────
	const deleteQuiz = async () => {
		if (!selectedQuizId) return;
		if (!window.confirm(`Yakin ingin menghapus kuis "${selectedQuiz.title}"?`)) return;

		try {
			setSaving(true);
			await api.delete(`/organizer/lms/quiz/${selectedQuizId}`);
			notify('success', 'Berhasil', 'Kuis berhasil dihapus.');
			const remaining = quizzes.filter((q) => q.id !== selectedQuizId);
			setQuizzes(remaining);
			setSelectedQuizId(remaining.length > 0 ? remaining[0].id : null);
			if (refreshModule) refreshModule();
		} catch (err) {
			notify('error', 'Gagal', err?.response?.data?.message ?? 'Gagal menghapus kuis.');
		} finally {
			setSaving(false);
		}
	};

	// ── Manipulasi questions ──────────────────────────────────────────────────
	const updateQuestion = (key, changes) => {
		updateQuiz({
			questions: selectedQuiz.questions.map((q) =>
				q._key === key ? { ...q, ...changes } : q,
			),
		});
	};

	const updateOption = (questionKey, optionIndex, value) => {
		const question = selectedQuiz.questions.find((q) => q._key === questionKey);
		const options = question.options.map((opt, i) =>
			i === optionIndex ? { ...opt, option_text: value } : opt,
		);
		updateQuestion(questionKey, { options });
	};

	const setCorrectOption = (questionKey, optionIndex) => {
		const question = selectedQuiz.questions.find((q) => q._key === questionKey);
		const options = question.options.map((opt, i) => ({
			...opt,
			is_correct: i === optionIndex,
		}));
		updateQuestion(questionKey, { options });
	};

	const addQuestion = () => {
		updateQuiz({ questions: [...(selectedQuiz.questions ?? []), newQuestion()] });
	};

	const removeQuestion = (key) => {
		updateQuiz({
			questions: selectedQuiz.questions.filter((q) => q._key !== key),
		});
	};

	// ── Render ────────────────────────────────────────────────────────────────
	if (loading) {
		return (
			<div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
				<Spinner animation="border" variant="primary" />
			</div>
		);
	}

	return (
		<div>
			{/* Header */}
			<div className="d-flex justify-content-between align-items-center mb-4">
				<div>
					<h4 className="mb-1">Manajemen Kuis</h4>
					<p className="text-muted mb-0">
						Kelola kuis dan hubungkan dengan materi pembelajaran.
					</p>
				</div>

				<Button onClick={createQuiz} disabled={saving}>
					<Plus size={16} className="me-2" />
					Buat Kuis Baru
				</Button>
			</div>

			{quizzes.length === 0 ? (
				<div className="text-center text-muted py-5 bg-white rounded border">
					<p className="mb-2">Belum ada kuis untuk module ini.</p>
					<Button variant="primary" size="sm" onClick={createQuiz} disabled={saving}>
						<Plus size={15} className="me-1" /> Buat Kuis Pertama
					</Button>
				</div>
			) : (
				<>
					{/* Quiz Selection */}
					<Card className="border-0 shadow-sm mb-4">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-center mb-2">
								<Form.Label className="fw-semibold mb-0">Pilih Kuis</Form.Label>
								<Button
									variant="outline-danger"
									size="sm"
									onClick={deleteQuiz}
									disabled={saving || !selectedQuiz}
								>
									<Trash2 size={14} className="me-1" />
									Hapus Kuis
								</Button>
							</div>

							<Form.Select
								value={selectedQuizId ?? ''}
								onChange={(e) => setSelectedQuizId(Number(e.target.value))}
							>
								{quizzes.map((quiz) => (
									<option key={quiz.id} value={quiz.id}>
										{quiz.title}
									</option>
								))}
							</Form.Select>

							{selectedQuiz && (
								<div className="d-flex gap-3 mt-3 text-muted small">
									<span>
										<FileText size={14} className="me-1" />
										{selectedQuiz.questions?.length ?? 0} Soal
									</span>
									<span>
										Tautkan:{' '}
										{selectedQuiz.lesson
											? selectedQuiz.lesson.title
											: selectedQuiz.lesson_id
												? `Lesson ID: ${selectedQuiz.lesson_id}`
												: 'Kuis Umum Module'}
									</span>
								</div>
							)}
						</Card.Body>
					</Card>

					{selectedQuiz && (
						<>
							{/* Quiz Information */}
							<Card className="border-0 shadow-sm mb-4">
								<Card.Body>
									<h6 className="fw-semibold mb-3">Informasi Kuis</h6>

									<Form.Group className="mb-3">
										<Form.Label>Nama Kuis</Form.Label>
										<Form.Control
											value={selectedQuiz.title ?? ''}
											onChange={(e) => updateQuiz({ title: e.target.value })}
											placeholder="Masukkan nama kuis"
										/>
									</Form.Group>

									<Row>
										<Col md={6}>
											<Form.Group className="mb-3">
												<Form.Label>Deskripsi</Form.Label>
												<Form.Control
													as="textarea"
													rows={2}
													value={selectedQuiz.description ?? ''}
													onChange={(e) => updateQuiz({ description: e.target.value })}
													placeholder="Deskripsi singkat kuis"
												/>
											</Form.Group>
										</Col>
										<Col md={3}>
											<Form.Group className="mb-3">
												<Form.Label>Passing Score (%)</Form.Label>
												<Form.Control
													type="number"
													min={0}
													max={100}
													value={selectedQuiz.passing_score ?? 70}
													onChange={(e) => updateQuiz({ passing_score: e.target.value })}
												/>
											</Form.Group>
										</Col>
										<Col md={3}>
											<Form.Group className="mb-3">
												<Form.Label>Waktu (Menit)</Form.Label>
												<Form.Control
													type="number"
													min={1}
													value={selectedQuiz.time_limit_minutes ?? ''}
													placeholder="Opsional"
													onChange={(e) =>
														updateQuiz({ time_limit_minutes: e.target.value })
													}
												/>
											</Form.Group>
										</Col>
									</Row>

									<Form.Group className="mb-1">
										<Form.Label>Hubungkan dengan Lesson</Form.Label>
										<Form.Select
											value={selectedQuiz.lesson_id ?? ''}
											onChange={(e) =>
												updateQuiz({
													lesson_id: e.target.value ? Number(e.target.value) : null,
												})
											}
										>
											<option value="">-- Kuis Umum Module (Semua Lesson) --</option>
											{lessons.map((lesson) => (
												<option key={lesson.id} value={lesson.id}>
													{lesson.title} ({lesson.type})
												</option>
											))}
										</Form.Select>
										<Form.Text className="text-muted">
											Pilih lesson spesifik jika kuis ini merupakan evaluasi akhir untuk suatu materi tertentu.
										</Form.Text>
									</Form.Group>
								</Card.Body>
							</Card>

							{/* Questions */}
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div>
									<h6 className="fw-semibold mb-1">Daftar Pertanyaan</h6>
									<p className="text-muted small mb-0">
										Pilih radio button untuk menentukan jawaban yang benar.
									</p>
								</div>
							</div>

							{(selectedQuiz.questions ?? []).map((question, index) => (
								<Card key={question._key ?? question.id} className="border-0 shadow-sm mb-3">
									<Card.Body>
										<div className="d-flex justify-content-between align-items-center mb-3">
											<strong>Soal {index + 1}</strong>

											<Button
												variant="outline-danger"
												size="sm"
												onClick={() => removeQuestion(question._key)}
												disabled={(selectedQuiz.questions?.length ?? 1) <= 1}
											>
												<Trash2 size={14} />
											</Button>
										</div>

										<Form.Control
											as="textarea"
											rows={2}
											className="mb-3"
											placeholder="Tulis pertanyaan..."
											value={question.question_text ?? ''}
											onChange={(e) =>
												updateQuestion(question._key, { question_text: e.target.value })
											}
										/>

										<Form.Label className="small fw-semibold">Pilihan Jawaban</Form.Label>

										{(question.options ?? []).map((option, optionIndex) => (
											<div key={optionIndex} className="d-flex align-items-center gap-2 mb-2">
												<Form.Check
													type="radio"
													name={`answer-${question._key}`}
													checked={option.is_correct === true}
													onChange={() => setCorrectOption(question._key, optionIndex)}
												/>
												<Badge bg="secondary" className="px-2">
													{option.option_label ?? String.fromCharCode(65 + optionIndex)}
												</Badge>
												<Form.Control
													placeholder={`Opsi ${optionIndex + 1}`}
													value={option.option_text ?? ''}
													onChange={(e) =>
														updateOption(question._key, optionIndex, e.target.value)
													}
												/>
											</div>
										))}

										<Form.Group className="mt-2">
											<Form.Label className="small">Penjelasan (Opsional)</Form.Label>
											<Form.Control
												as="textarea"
												rows={1}
												placeholder="Penjelasan jawaban benar..."
												value={question.explanation ?? ''}
												onChange={(e) =>
													updateQuestion(question._key, { explanation: e.target.value })
												}
											/>
										</Form.Group>
									</Card.Body>
								</Card>
							))}

							<div className="d-flex justify-content-between align-items-center mt-4">
								<Button variant="outline-primary" onClick={addQuestion}>
									<Plus size={16} className="me-2" />
									Tambah Soal
								</Button>

								<Button onClick={saveQuiz} disabled={saving}>
									{saving ? (
										<Spinner size="sm" className="me-2" />
									) : (
										<Save size={16} className="me-2" />
									)}
									{saving ? 'Menyimpan...' : 'Simpan Kuis'}
								</Button>
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default QuizEditorPage;
