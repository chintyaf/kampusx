import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Badge, Spinner } from 'react-bootstrap';
import {
	Plus,
	Trash2,
	GripVertical,
	ArrowLeft,
	Eye,
	Save,
	ToggleLeft,
	ToggleRight,
	Star,
} from 'lucide-react';
import api from '@/api/axios';
import { notify } from '@/utils/notify';

// --- CONSTANTS ---
const questionTypeOptions = [
	{ value: 'text', label: 'Text Pendek' },
	{ value: 'textarea', label: 'Text Panjang' },
	{ value: 'select', label: 'Dropdown' },
	{ value: 'radio', label: 'Pilihan Ganda' },
	{ value: 'checkbox', label: 'Checkbox' },
	{ value: 'rating', label: 'Rating Bintang' },
];

// --- SUB-COMPONENT: Question Item ---
// Memisahkan rendering pertanyaan agar lebih mudah dikelola dan tidak menumpuk
const QuestionItem = ({ q, index, updateQuestion, deleteQuestion, isSaving }) => {
	// Memindahkan state lokal untuk opsi ke dalam komponen masing-masing
	// agar tidak membebani state global dan mencegah re-render berlebih.
	const [localOptions, setLocalOptions] = useState(q.options?.join('\n') || '');

	const handleOptionChange = (e) => {
		const text = e.target.value;
		setLocalOptions(text);
		updateQuestion(q.id, {
			options: text.split('\n').filter((o) => o.trim()),
		});
	};

	return (
		<div className="p-4 border-bottom bg-white">
			<div className="d-flex align-items-start gap-3">
				<div
					className="text-secondary mt-2"
					style={{ cursor: 'grab' }}
					title="Tarik untuk mengurutkan"
				>
					<GripVertical size={20} />
				</div>

				<div className="flex-grow-1">
					{/* Controls Row */}
					<div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
						<Badge bg="light" text="secondary" className="border rounded-pill">
							#{index + 1}
						</Badge>

						<Form.Select
							value={q.type}
							onChange={(e) => {
								const newType = e.target.value;
								const needsOptions = ['radio', 'checkbox', 'select'].includes(
									newType,
								);
								updateQuestion(q.id, {
									type: newType,
									options: needsOptions ? q.options || ['Opsi 1'] : [],
								});
							}}
							className="w-auto rounded-pill border text-muted shadow-none py-1"
							size="sm"
							disabled={isSaving}
						>
							{questionTypeOptions.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</Form.Select>

						<Form.Check
							type="switch"
							id={`required-switch-${q.id}`}
							label="Wajib"
							checked={q.required}
							onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
							className="ms-auto text-muted small mb-0"
							disabled={isSaving}
						/>

						<Button
							variant="outline-danger"
							size="sm"
							onClick={() => deleteQuestion(q.id)}
							className="border-0 d-flex align-items-center justify-content-center p-2 rounded-circle"
							title="Hapus Pertanyaan"
							disabled={isSaving}
						>
							<Trash2 size={16} />
						</Button>
					</div>

					{/* Question Label Input */}
					<Form.Control
						type="text"
						value={q.label}
						onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
						placeholder="Tulis pertanyaan di sini..."
						className="border-0 border-bottom border-2 rounded-0 px-1 shadow-none fw-medium text-dark bg-transparent mb-3 fs-3"
						disabled={isSaving}
					/>

					{/* Preview Area berdasarkan tipe pertanyaan */}
					{q.type === 'rating' && (
						<div className="mt-2 d-flex align-items-center gap-2">
							<div className="d-flex gap-1">
								{[1, 2, 3, 4, 5].map((star) => (
									<div
										key={star}
										className="bg-warning-subtle rounded text-warning d-flex align-items-center justify-content-center"
										style={{ width: '36px', height: '36px' }}
									>
										<Star size={20} className="fill-warning" />
									</div>
								))}
							</div>
							<span className="small text-muted ms-2">Skala 1 – 5 bintang</span>
						</div>
					)}

					{['select', 'radio', 'checkbox'].includes(q.type) && (
						<div className="mt-2">
							<div className="small text-muted mb-2">
								Tulis setiap opsi di baris baru:
							</div>
							<Form.Control
								as="textarea"
								value={localOptions}
								onChange={handleOptionChange}
								placeholder={'Opsi 1\nOpsi 2\nOpsi 3'}
								rows={4}
								className="rounded-3 shadow-none border bg-light"
								disabled={isSaving}
							/>
						</div>
					)}

					{['text', 'textarea'].includes(q.type) && (
						<div
							className={`mt-2 border rounded-3 d-flex align-items-center px-3 small text-muted bg-light ${q.type === 'textarea' ? 'py-4' : 'py-2'
								}`}
							style={{ borderStyle: 'dashed' }}
						>
							{q.type === 'text'
								? 'Input teks singkat...'
								: 'Input teks panjang (paragraf)...'}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

// --- MAIN COMPONENT ---
export default function SurveyDetailPage({ surveyId, eventId, initialSurvey, onBack }) {
	const isNew = !surveyId;

	// State Kuesioner
	const [status, setStatus] = useState(initialSurvey?.is_active ? 'aktif' : 'draft');
	const [session, setSession] = useState(initialSurvey?.session || '');
	const [title, setTitle] = useState(
		initialSurvey?.title || 'Kuesioner Evaluasi & Masukan Acara',
	);
	const [description, setDescription] = useState(
		initialSurvey?.description ||
		'Silakan berikan masukan Anda untuk membantu meningkatkan kualitas acara.',
	);
	const [isSaving, setIsSaving] = useState(false);
	const [sessions, setSessions] = useState([]);

	// State Pertanyaan
	const [questions, setQuestions] = useState(() => {
		if (initialSurvey?.questions?.length > 0) {
			return initialSurvey.questions.map((q) => ({
				id: q.id.toString(),
				type: q.type,
				label: q.label,
				required: !!q.is_required,
				options: q.options || [],
			}));
		}
		return isNew ? [{ id: '1', type: 'rating', label: '', required: true }] : [];
	});

	useEffect(() => {
		const fetchSessions = async () => {
			try {
				const res = await api.get(`/event-dashboard/${eventId}/info-utama/session`);
				if (res.data && res.data.session) {
					setSessions(res.data.session);
				}
			} catch (err) {
				console.error('Error fetching sessions:', err);
			}
		};
		if (eventId) {
			fetchSessions();
		}
	}, [eventId]);

	// Helper Functions
	const addQuestion = () => {
		setQuestions([
			...questions,
			{ id: Date.now().toString(), type: 'text', label: '', required: false },
		]);
	};

	const deleteQuestion = (id) => setQuestions(questions.filter((q) => q.id !== id));

	const updateQuestion = (id, updates) => {
		setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
	};

	const handlePreview = () => {
		window.open(`/event-space/${eventId}/survey`, '_blank');
	};

	// Validasi & Simpan
	const handleSave = async () => {
		if (!title?.trim()) return notify('error', 'Validasi Gagal', 'Judul wajib diisi.');
		if (questions.length === 0)
			return notify('error', 'Validasi Gagal', 'Minimal satu pertanyaan.');

		for (let i = 0; i < questions.length; i++) {
			const q = questions[i];
			if (!q.label?.trim()) {
				return notify('error', 'Validasi Gagal', `Teks pertanyaan #${i + 1} wajib diisi.`);
			}
			if (['radio', 'checkbox', 'select'].includes(q.type)) {
				if (!q.options || q.options.filter((o) => o.trim()).length === 0) {
					return notify(
						'error',
						'Validasi Gagal',
						`Pertanyaan #${i + 1} memerlukan opsi pilihan.`,
					);
				}
			}
		}

		setIsSaving(true);
		try {
			let activeSurveyId = surveyId;
			const surveyPayload = {
				title: title.trim(),
				description: description.trim() || null,
				session: session || null,
				is_active: status === 'aktif',
			};

			if (isNew) {
				const res = await api.post(
					`/event-dashboard/${eventId}/survey-form`,
					surveyPayload,
				);
				activeSurveyId = res.data.data.id;
			} else {
				await api.put(`/event-dashboard/${eventId}/survey-form/${surveyId}`, surveyPayload);
			}

			const questionsPayload = questions.map((q) => ({
				type: q.type,
				label: q.label.trim(),
				options: ['radio', 'checkbox', 'select'].includes(q.type) ? q.options : null,
				is_required: !!q.required,
			}));

			await api.put(`/event-dashboard/${eventId}/survey-form/${activeSurveyId}/questions`, {
				questions: questionsPayload,
			});

			notify('success', 'Berhasil', 'Survei kustom berhasil disimpan!');
			onBack();
		} catch (error) {
			console.error('Error saving survey:', error);
			notify('error', 'Gagal', error.response?.data?.message || 'Gagal menyimpan survei.');
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Container
			fluid
			className="py-4"
			style={{ minHeight: '100vh', opacity: isSaving ? 0.7 : 1 }}
		>
			{/* Header Actions */}
			<div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
				<div className="d-flex align-items-center gap-3">
					<Button
						variant="link"
						onClick={onBack}
						className="text-muted text-decoration-none d-flex align-items-center gap-2 p-0"
						disabled={isSaving}
					>
						<ArrowLeft size={18} /> Kembali
					</Button>
					<div className="border-start border-2 h-50 mx-1"></div>
					<h1 className="fw-bold text-dark m-0 fs-2">
						{isNew ? 'Buat Survei Baru' : 'Detail Survei'}
					</h1>
				</div>
				<div className="d-flex align-items-center gap-2">
					<Button
						variant={status === 'aktif' ? 'success' : 'light'}
						onClick={() => setStatus(status === 'aktif' ? 'draft' : 'aktif')}
						className={`d-flex align-items-center gap-2 rounded-3 border ${status === 'aktif'
								? 'bg-success-subtle text-success border-success-subtle'
								: 'text-muted border-secondary-subtle'
							}`}
						disabled={isSaving}
					>
						{status === 'aktif' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
						{status === 'aktif' ? 'Aktif' : 'Draft'}
					</Button>
					<Button
						variant="outline-secondary"
						className="d-flex align-items-center gap-2 rounded-3 bg-white"
						onClick={handlePreview}
						disabled={isSaving}
					>
						<Eye size={18} /> Preview
					</Button>
					<Button
						variant="primary"
						className="d-flex align-items-center gap-2 rounded-3"
						onClick={handleSave}
						disabled={isSaving}
					>
						{isSaving ? <Spinner animation="border" size="sm" /> : <Save size={18} />}{' '}
						Simpan
					</Button>
				</div>
			</div>

			{/* Metadata Card */}
			<Card className="border rounded-4 mb-4 shadow-sm">
				<Card.Body className="p-4">
					<Form.Group className="mb-3">
						<Form.Label className="form-label required">Judul Kuesioner</Form.Label>
						<Form.Control
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Contoh: Kuesioner Evaluasi & Masukan Acara"
							className="rounded-3 shadow-none border bg-light py-2 fw-medium text-dark fs-3"
							required
							disabled={isSaving}
						/>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label className="form-label required">
							Deskripsi / Panduan Kuesioner
						</Form.Label>
						<Form.Control
							as="textarea"
							rows={2}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Tulis panduan atau instruksi pengisian untuk peserta..."
							className="rounded-3 shadow-none border bg-light py-2 text-dark fs-4"
							style={{ resize: 'none' }}
							disabled={isSaving}
						/>
					</Form.Group>
					<Form.Group>
						<Form.Label className="form-label required">Sesi Terkait</Form.Label>
						<Form.Select
							value={session}
							onChange={(e) => setSession(e.target.value)}
							className="rounded-2 shadow-none text-dark bg-light border-0 py-2 fs-4"
							disabled={isSaving}
						>
							<option value="">Semua Sesi / Berlaku untuk seluruh acara</option>
							{sessions.map((sess) => (
								<option key={sess.id} value={sess.title}>
									{sess.title}
								</option>
							))}
						</Form.Select>
					</Form.Group>
				</Card.Body>
			</Card>

			{/* Questions List Card */}
			<Card className="border rounded-4 mb-4 shadow-sm overflow-hidden">
				<div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
					<div>
						<div
							className="small text-muted text-uppercase fw-bold mb-1"
							style={{ letterSpacing: '0.5px' }}
						>
							Daftar Pertanyaan
						</div>
						<div className="small text-muted">
							{questions.length} pertanyaan ·{' '}
							{questions.filter((q) => q.required).length} wajib
						</div>
					</div>
				</div>

				<div className="d-flex flex-column">
					{questions.map((q, index) => (
						<QuestionItem
							key={q.id}
							q={q}
							index={index}
							updateQuestion={updateQuestion}
							deleteQuestion={deleteQuestion}
							isSaving={isSaving}
						/>
					))}
				</div>

				<div className="p-4 bg-white border-top">
					<Button
						variant="outline-primary"
						onClick={addQuestion}
						className="w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-medium"
						style={{ borderStyle: 'dashed', borderWidth: '2px' }}
						disabled={isSaving}
					>
						<Plus size={18} /> Tambah Pertanyaan
					</Button>
				</div>
			</Card>

			{/* Bottom Actions */}
			<div className="d-flex align-items-center justify-content-between py-2 mb-5">
				<Button
					variant="link"
					onClick={onBack}
					className="text-muted text-decoration-none p-0 fw-medium"
					disabled={isSaving}
				>
					Batal
				</Button>
				<div className="d-flex align-items-center gap-3">
					<Button
						variant="outline-secondary"
						className="d-flex align-items-center gap-2 rounded-3 bg-white shadow-sm"
						onClick={handlePreview}
						disabled={isSaving}
					>
						<Eye size={18} /> Preview Survei
					</Button>
					<Button
						variant="primary"
						className="d-flex align-items-center gap-2 rounded-3 shadow-sm"
						onClick={handleSave}
						disabled={isSaving}
					>
						{isSaving ? <Spinner animation="border" size="sm" /> : <Save size={18} />}{' '}
						{isNew ? 'Buat Survei' : 'Simpan Perubahan'}
					</Button>
				</div>
			</div>

		</Container>
	);
}
