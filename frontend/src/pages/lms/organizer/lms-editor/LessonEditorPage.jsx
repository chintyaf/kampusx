import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Form, Button, Card, Row, Col, Spinner, Nav, Badge } from 'react-bootstrap';
import { Save, Trash2, BookOpen, ListChecks } from 'lucide-react';
import LessonQuizForm from './components/lesson/LessonQuizForm';
import LessonContentForm from './components/lesson/LessonContentForm';
import api from '@/api/axios';
import { notify } from '@/utils/notify';

const createQuestion = () => ({
	question_text: '',
	bloom_level: '',
	explanation: '',
	options: ['A', 'B', 'C', 'D'].map((label, index) => ({
		option_label: label,
		option_text: '',
		is_correct: index === 0,
		order_index: index + 1,
	})),
});

const defaultQuizState = () => ({
	id: null,
	title: '',
	description: '',
	bloom_level: '',
	time_limit_minutes: '',
	passing_score: 70,
	questions: [createQuestion()],
});

const LessonEditorPage = () => {
	const { learningId, moduleId, lessonId } = useParams();
	const navigate = useNavigate();
	const { refreshModule } = useOutletContext() || {};

	const [activeTab, setActiveTab] = useState('lesson'); // 'lesson' | 'quiz'
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const [lesson, setLesson] = useState({
		title: '',
		type: 'article',
		content: '',
		summary: '',
		order_index: 1,
		duration_minutes: 10,
		xp: 0,
		video_url: '',
		attachments: [],
		status: 'draft',
	});

	const [quiz, setQuiz] = useState(defaultQuizState());

	useEffect(() => {
		const fetchLessonData = async () => {
			if (!lessonId) return;
			try {
				setLoading(true);
				const res = await api.get(`/organizer/lms/lessons/${lessonId}`);
				if (res.data?.success && res.data?.data) {
					const data = res.data.data;
					setLesson({
						title: data.title || '',
						type: data.type || 'article',
						content: data.content || '',
						summary: data.summary || '',
						order_index: data.order_index || 1,
						duration_minutes: data.duration_minutes ?? 10,
						xp: data.xp ?? 0,
						video_url: data.video_url || '',
						attachments: data.attachments || [],
						status: data.status || 'draft',
					});

					// Populate Quiz if available
					if (data.quiz) {
						const q = data.quiz;
						setQuiz({
							id: q.id,
							title: q.title || '',
							description: q.description || '',
							bloom_level: q.bloom_level || '',
							time_limit_minutes: q.time_limit_minutes ?? '',
							passing_score: q.passing_score ?? 70,
							questions:
								q.questions && q.questions.length > 0
									? q.questions.map((quest) => ({
											id: quest.id,
											question_text: quest.question_text || '',
											bloom_level: quest.bloom_level || '',
											explanation: quest.explanation || '',
											options:
												quest.options && quest.options.length > 0
													? quest.options.map((opt, optIdx) => ({
															id: opt.id,
															option_label:
																opt.option_label ||
																String.fromCharCode(65 + optIdx),
															option_text: opt.option_text || '',
															is_correct: Boolean(opt.is_correct),
															order_index:
																opt.order_index || optIdx + 1,
														}))
													: ['A', 'B', 'C', 'D'].map((label, idx) => ({
															option_label: label,
															option_text: '',
															is_correct: idx === 0,
															order_index: idx + 1,
														})),
										}))
									: [createQuestion()],
						});
					} else {
						setQuiz({
							...defaultQuizState(),
							title: data.title ? `Kuis: ${data.title}` : '',
						});
					}
				}
			} catch (error) {
				console.error('Error fetching lesson:', error);
				notify(
					'error',
					'Gagal Memuat Lesson',
					error.response?.data?.message || 'Tidak dapat memuat data lesson.',
				);
			} finally {
				setLoading(false);
			}
		};

		fetchLessonData();
	}, [lessonId]);

	const handleLessonChange = (e) => {
		const { name, value } = e.target;

		setLesson((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Field "required" di tab yang tidak tampil tidak ikut divalidasi browser,
		// jadi judul dicek manual di sini.
		if (!lesson.title.trim()) {
			setActiveTab('lesson');
			notify('error', 'Judul Kosong', 'Judul lesson wajib diisi.');
			return;
		}

		try {
			setSaving(true);

			// 1. Simpan Lesson
			const lessonPayload = {
				module_id: Number(moduleId),
				title: lesson.title,
				type: lesson.type,
				content: lesson.content,
				summary: lesson.summary,
				order_index: Number(lesson.order_index),
				duration_minutes: Number(lesson.duration_minutes),
				xp: Number(lesson.xp),
				video_url: lesson.video_url,
				status: lesson.status,
			};

			await api.put(`/organizer/lms/lessons/${lessonId}`, lessonPayload);

			// 2. Simpan Quiz jika ada pertanyaan atau judul kuis
			const validQuestions = quiz.questions.filter((q) => q.question_text.trim() !== '');
			const shouldSaveQuiz =
				validQuestions.length > 0 || (quiz.title && quiz.title.trim() !== '');

			if (shouldSaveQuiz) {
				const quizPayload = {
					module_id: Number(moduleId),
					lesson_id: Number(lessonId),
					title: quiz.title.trim() || `Kuis: ${lesson.title}`,
					description: quiz.description || null,
					bloom_level: quiz.bloom_level || null,
					time_limit_minutes: quiz.time_limit_minutes
						? Number(quiz.time_limit_minutes)
						: null,
					passing_score: quiz.passing_score !== '' ? Number(quiz.passing_score) : 70,
					questions: validQuestions.map((question, index) => ({
						question_text: question.question_text,
						bloom_level: question.bloom_level || null,
						explanation: question.explanation || null,
						order_index: index + 1,
						options: question.options.map((option, i) => ({
							option_label: option.option_label || String.fromCharCode(65 + i),
							option_text: option.option_text || '',
							is_correct: Boolean(option.is_correct),
							order_index: i + 1,
						})),
					})),
				};

				if (quiz.id) {
					await api.put(`/organizer/lms/quiz/${quiz.id}`, quizPayload);
				} else {
					const resQuiz = await api.post('/organizer/lms/quiz', quizPayload);
					if (resQuiz.data?.data?.id) {
						setQuiz((prev) => ({ ...prev, id: resQuiz.data.data.id }));
					}
				}
			}

			notify('success', 'Berhasil', 'Lesson dan kuis berhasil disimpan.');

			if (refreshModule) {
				refreshModule();
			}
		} catch (error) {
			console.error('Error saving lesson:', error);
			notify(
				'error',
				'Gagal Menyimpan',
				error.response?.data?.message || 'Terjadi kesalahan saat menyimpan lesson.',
			);
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteLesson = async () => {
		if (!window.confirm(`Yakin ingin menghapus lesson "${lesson.title}"?`)) return;

		try {
			setDeleting(true);
			await api.delete(`/organizer/lms/lessons/${lessonId}`);
			notify('success', 'Berhasil', 'Lesson berhasil dihapus.');
			if (refreshModule) {
				await refreshModule();
			}
			navigate(`/organizer/learning-path/${learningId}/modules/${moduleId}/info`);
		} catch (error) {
			console.error('Error deleting lesson:', error);
			notify(
				'error',
				'Gagal Menghapus',
				error.response?.data?.message || 'Gagal menghapus lesson.',
			);
		} finally {
			setDeleting(false);
		}
	};

	if (loading) {
		return (
			<div
				className="d-flex justify-content-center align-items-center"
				style={{ minHeight: '300px' }}
			>
				<Spinner animation="border" variant="primary" />
			</div>
		);
	}

	const questionCount = quiz.questions.filter((q) => q.question_text.trim() !== '').length;

	return (
		<div>
			<div className="d-flex justify-content-between align-items-center mb-4">
				<div>
					<h4 className="mb-1">Edit Lesson</h4>
					<p className="text-secondary mb-0">
						Kelola materi pembelajaran dan evaluasi lesson.
					</p>
				</div>
				<Button
					variant="outline-danger"
					size="sm"
					onClick={handleDeleteLesson}
					disabled={deleting || saving}
				>
					{deleting ? (
						<Spinner animation="border" size="sm" className="me-1" />
					) : (
						<Trash2 size={16} className="me-1" />
					)}
					Hapus Lesson
				</Button>
			</div>

			{/* Tabs */}
			<Nav
				variant="tabs"
				className="mb-4"
				activeKey={activeTab}
				onSelect={(key) => key && setActiveTab(key)}
			>
				<Nav.Item>
					<Nav.Link eventKey="lesson" className="d-flex align-items-center gap-2">
						<BookOpen size={16} />
						Lesson
					</Nav.Link>
				</Nav.Item>
				<Nav.Item>
					<Nav.Link eventKey="quiz" className="d-flex align-items-center gap-2">
						<ListChecks size={16} />
						Kuis
						{questionCount > 0 && (
							<Badge bg={activeTab === 'quiz' ? 'primary' : 'secondary'} pill>
								{questionCount}
							</Badge>
						)}
					</Nav.Link>
				</Nav.Item>
			</Nav>

			<Form onSubmit={handleSubmit}>
				{activeTab === 'lesson' && (
					<>
						{/* Informasi Lesson */}
						<Card className="border-0 shadow-sm mb-4">
							<Card.Body className="p-4">
								<h5 className="mb-3">Informasi Lesson</h5>

								<Form.Group className="mb-3">
									<Form.Label>Judul Lesson</Form.Label>
									<Form.Control
										name="title"
										value={lesson.title}
										onChange={handleLessonChange}
										maxLength={200}
										placeholder="Masukkan judul lesson..."
										required
									/>
								</Form.Group>

								<Row>
									<Col md={6}>
										<Form.Group className="mb-3">
											<Form.Label>Tipe Materi</Form.Label>
											<Form.Select
												name="type"
												value={lesson.type}
												onChange={handleLessonChange}
											>
												<option value="article">Artikel</option>
												<option value="video">Video</option>
												<option value="microlearning">Microlearning</option>
											</Form.Select>
										</Form.Group>
									</Col>

									<Col md={6}>
										<Form.Group className="mb-3">
											<Form.Label>Durasi (Menit)</Form.Label>
											<Form.Control
												type="number"
												min={0}
												name="duration_minutes"
												value={lesson.duration_minutes}
												onChange={handleLessonChange}
											/>
										</Form.Group>
									</Col>

									<Col md={4}>
										<Form.Group className="mb-3">
											<Form.Label>Urutan</Form.Label>
											<Form.Control
												type="number"
												min={1}
												name="order_index"
												value={lesson.order_index}
												onChange={handleLessonChange}
											/>
										</Form.Group>
									</Col>

									<Col md={4}>
										<Form.Group className="mb-3">
											<Form.Label>XP</Form.Label>
											<Form.Control
												type="number"
												min={0}
												name="xp"
												value={lesson.xp}
												onChange={handleLessonChange}
											/>
										</Form.Group>
									</Col>

									<Col md={4}>
										<Form.Group className="mb-3">
											<Form.Label>Status</Form.Label>
											<Form.Select
												name="status"
												value={lesson.status}
												onChange={handleLessonChange}
											>
												<option value="draft">Draft</option>
												<option value="published">Published</option>
											</Form.Select>
										</Form.Group>
									</Col>
								</Row>
							</Card.Body>
						</Card>

						{/* Konten Pembelajaran */}
						<LessonContentForm lesson={lesson} onChange={handleLessonChange} />
					</>
				)}

				{activeTab === 'quiz' && <LessonQuizForm quiz={quiz} setQuiz={setQuiz} />}

				{/* Tombol simpan tampil di kedua tab */}
				<div className="d-flex justify-content-end mb-4">
					<Button type="submit" disabled={saving}>
						{saving ? (
							<Spinner animation="border" size="sm" className="me-2" />
						) : (
							<Save size={16} className="me-2" />
						)}
						{saving ? 'Menyimpan...' : 'Simpan Lesson'}
					</Button>
				</div>
			</Form>
		</div>
	);
};

export default LessonEditorPage;
