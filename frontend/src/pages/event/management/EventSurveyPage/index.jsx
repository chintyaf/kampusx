import React, { useState, useEffect, useCallback } from 'react';
import {
	Container, Row, Col, Card, Button, Form, Badge,
	Spinner, Alert, Tabs, Tab,
} from 'react-bootstrap';
import {
	Plus, Trash2, GripVertical, BarChart3, Settings, Star,
	Users, TrendingUp, MessageSquare, Award, CheckCircle2,
	AlertCircle, ToggleLeft, ToggleRight, Save, Eye, EyeOff,
	RefreshCw, ChevronDown, ChevronUp, PenLine, Sparkles,
	ClipboardList,
} from 'lucide-react';
import {
	BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
	ResponsiveContainer, Cell,
} from 'recharts';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';

const QUESTION_TYPES = [
	{ value: 'rating', label: '⭐ Rating Bintang', color: '#f59e0b' },
	{ value: 'text', label: '📝 Teks Pendek', color: '#3b82f6' },
	{ value: 'textarea', label: '📄 Teks Panjang', color: '#8b5cf6' },
	{ value: 'radio', label: '⚪ Pilihan Ganda', color: '#10b981' },
	{ value: 'checkbox', label: '☑️ Checkbox', color: '#ec4899' },
];

const STAR_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#10b981'];

export default function OrganizerSurveyPage() {
	const { eventId } = useParams();
	const [activeTab, setActiveTab] = useState('builder');

	// ─── Form Builder State ───
	const [survey, setSurvey] = useState(null);         // null = no survey yet
	const [surveyTitle, setSurveyTitle] = useState('Survei Kepuasan Peserta');
	const [surveyDesc, setSurveyDesc] = useState('');
	const [isActive, setIsActive] = useState(false);
	const [questions, setQuestions] = useState([]);
	const [editingOptions, setEditingOptions] = useState({});
	const [saving, setSaving] = useState(false);
	const [saveMsg, setSaveMsg] = useState(null);
	const [builderError, setBuilderError] = useState(null);
	const [loadingBuilder, setLoadingBuilder] = useState(true);

	// ─── Analytics State ───
	const [analytics, setAnalytics] = useState(null);
	const [loadingAnalytics, setLoadingAnalytics] = useState(false);
	const [analyticsError, setAnalyticsError] = useState(null);
	const [expandedRow, setExpandedRow] = useState(null);

	// ─── Load existing survey ───
	useEffect(() => {
		fetchSurvey();
	}, [eventId]);

	const fetchSurvey = async () => {
		setLoadingBuilder(true);
		setBuilderError(null);
		try {
			const res = await api.get(`/event-dashboard/${eventId}/survey-form`);
			if (res.data.success && res.data.data) {
				const s = res.data.data;
				setSurvey(s);
				setSurveyTitle(s.title);
				setSurveyDesc(s.description || '');
				setIsActive(s.is_active);
				setQuestions(
					(s.questions || []).map((q) => ({
						...q,
						_options_text: (q.options || []).join('\n'),
					}))
				);
			}
		} catch (err) {
			setBuilderError(err.response?.data?.message || 'Gagal memuat data survei.');
		} finally {
			setLoadingBuilder(false);
		}
	};

	const fetchAnalytics = useCallback(async () => {
		setLoadingAnalytics(true);
		setAnalyticsError(null);
		try {
			const res = await api.get(`/event-dashboard/${eventId}/survey-analytics`);
			if (res.data.success) setAnalytics(res.data.data);
		} catch (err) {
			setAnalyticsError(err.response?.data?.message || 'Gagal memuat analitik.');
		} finally {
			setLoadingAnalytics(false);
		}
	}, [eventId]);

	useEffect(() => {
		if (activeTab === 'analytics') fetchAnalytics();
	}, [activeTab, fetchAnalytics]);

	// ─── Questions Helpers ───
	const addQuestion = () => {
		setQuestions([...questions, {
			id: `new_${Date.now()}`,
			type: 'rating',
			label: '',
			options: [],
			_options_text: '',
			is_required: true,
		}]);
	};

	const removeQuestion = (id) => setQuestions(questions.filter((q) => q.id !== id));

	const updateQuestion = (id, updates) =>
		setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));

	const updateOptionsText = (id, text) => {
		updateQuestion(id, {
			_options_text: text,
			options: text.split('\n').map((o) => o.trim()).filter(Boolean),
		});
	};

	// ─── Save Handler ───
	const handleSave = async () => {
		if (!surveyTitle.trim()) {
			setSaveMsg({ type: 'danger', text: 'Judul survei tidak boleh kosong.' });
			return;
		}

		setSaving(true);
		setSaveMsg(null);

		try {
			let savedSurvey = survey;

			// 1. Create or update survey metadata
			if (!survey) {
				const res = await api.post(`/event-dashboard/${eventId}/survey-form`, {
					title: surveyTitle,
					description: surveyDesc || null,
					is_active: isActive,
				});
				savedSurvey = res.data.data;
				setSurvey(savedSurvey);
			} else {
				const res = await api.put(`/event-dashboard/${eventId}/survey-form/${survey.id}`, {
					title: surveyTitle,
					description: surveyDesc || null,
					is_active: isActive,
				});
				savedSurvey = res.data.data;
				setSurvey(savedSurvey);
			}

			// 2. Sync questions
			const questionsPayload = questions.map((q, idx) => ({
				type: q.type,
				label: q.label,
				options: ['radio', 'checkbox'].includes(q.type) ? (q.options || []) : null,
				is_required: q.is_required ?? false,
				sort_order: idx,
			}));

			const qRes = await api.put(
				`/event-dashboard/${eventId}/survey-form/${savedSurvey.id}/questions`,
				{ questions: questionsPayload }
			);

			// Refresh state from server response
			const updatedSurvey = qRes.data.data;
			setSurvey(updatedSurvey);
			setQuestions(
				(updatedSurvey.questions || []).map((q) => ({
					...q,
					_options_text: (q.options || []).join('\n'),
				}))
			);

			setSaveMsg({ type: 'success', text: '✓ Survei berhasil disimpan!' });
		} catch (err) {
			setSaveMsg({
				type: 'danger',
				text: err.response?.data?.message || err.response?.data?.errors
					? JSON.stringify(err.response.data.errors)
					: 'Gagal menyimpan survei.',
			});
		} finally {
			setSaving(false);
			setTimeout(() => setSaveMsg(null), 4000);
		}
	};

	const handleToggleActive = async () => {
		if (!survey) { setIsActive(!isActive); return; }
		try {
			const res = await api.put(`/event-dashboard/${eventId}/survey-form/${survey.id}`, {
				is_active: !isActive,
			});
			setIsActive(res.data.data.is_active);
			setSurvey(res.data.data);
		} catch {
			/* ignore */
		}
	};

	const handleDeleteSurvey = async () => {
		if (!survey) return;
		if (!window.confirm('Hapus survei ini? Semua pertanyaan dan data respons yang terkait akan ikut terhapus.')) return;
		try {
			await api.delete(`/event-dashboard/${eventId}/survey-form/${survey.id}`);
			setSurvey(null);
			setSurveyTitle('Survei Kepuasan Peserta');
			setSurveyDesc('');
			setIsActive(false);
			setQuestions([]);
		} catch (err) {
			alert(err.response?.data?.message || 'Gagal menghapus survei.');
		}
	};

	// ─── Render ───
	return (
		<Container fluid className="py-4 px-lg-4 bg-light" style={{ minHeight: '100vh' }}>
			{/* Header */}
			<div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
				<div className="d-flex align-items-center gap-3">
					<div
						className="p-3 rounded-4 text-white shadow-sm"
						style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
					>
						<ClipboardList size={24} />
					</div>
					<div>
						<h4 className="fw-bold mb-0">Survey Form Management</h4>
						<p className="text-muted small mb-0">Buat & kelola formulir evaluasi peserta</p>
					</div>
				</div>

				{/* Tab switcher */}
				<div className="bg-white border rounded-pill p-1 d-flex gap-1 shadow-sm">
					{[
						{ key: 'builder', label: 'Form Builder', Icon: PenLine },
						{ key: 'analytics', label: 'Analitik', Icon: BarChart3 },
					].map(({ key, label, Icon }) => (
						<Button
							key={key}
							variant={activeTab === key ? 'primary' : 'light'}
							className={`rounded-pill d-flex align-items-center gap-2 px-3 py-2 border-0 small fw-semibold ${activeTab === key ? 'shadow-sm' : 'text-muted bg-white'}`}
							style={{ background: activeTab === key ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : undefined }}
							onClick={() => setActiveTab(key)}
						>
							<Icon size={15} /> {label}
						</Button>
					))}
				</div>
			</div>

			{/* ═══════════════════════════════════════ FORM BUILDER TAB */}
			{activeTab === 'builder' && (
				<>
					{loadingBuilder ? (
						<div className="text-center py-5">
							<Spinner animation="border" variant="primary" />
							<p className="text-muted mt-3 small">Memuat data survei...</p>
						</div>
					) : builderError ? (
						<Alert variant="danger" className="rounded-4 border-0 shadow-sm">
							<AlertCircle size={20} className="me-2" /> {builderError}
						</Alert>
					) : (
						<Row className="g-4">
							{/* ── LEFT: Form Config ── */}
							<Col lg={4}>
								<div className="d-flex flex-column gap-3 sticky-top" style={{ top: '80px' }}>
									{/* Survei Config Card */}
									<Card className="border-0 shadow-sm rounded-4 overflow-hidden">
										<div className="px-4 py-3 border-bottom" style={{ background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)' }}>
											<h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
												<Settings size={16} className="text-muted" /> Pengaturan Survei
											</h6>
										</div>
										<Card.Body className="p-4">
											<Form.Group className="mb-3">
												<Form.Label className="small fw-semibold text-dark mb-1">Judul Survei</Form.Label>
												<Form.Control
													value={surveyTitle}
													onChange={(e) => setSurveyTitle(e.target.value)}
													placeholder="Contoh: Evaluasi Kepuasan Peserta"
													className="rounded-3 border"
												/>
											</Form.Group>

											<Form.Group className="mb-4">
												<Form.Label className="small fw-semibold text-dark mb-1">Deskripsi (Opsional)</Form.Label>
												<Form.Control
													as="textarea"
													rows={3}
													value={surveyDesc}
													onChange={(e) => setSurveyDesc(e.target.value)}
													placeholder="Jelaskan tujuan survei kepada peserta..."
													className="rounded-3 border"
													style={{ resize: 'none', fontSize: '14px' }}
												/>
											</Form.Group>

											{/* Active toggle */}
											<div className={`p-3 rounded-3 d-flex align-items-center justify-content-between ${isActive ? 'bg-success-subtle' : 'bg-light'}`}>
												<div>
													<div className={`fw-semibold small ${isActive ? 'text-success' : 'text-muted'}`}>
														{isActive ? '🟢 Survei Aktif' : '⚪ Survei Nonaktif'}
													</div>
													<div className="small text-muted mt-1" style={{ fontSize: '12px' }}>
														{isActive ? 'Peserta dapat mengisi survei ini' : 'Survei belum ditampilkan ke peserta'}
													</div>
												</div>
												<Button
													variant="link"
													className={`p-0 ${isActive ? 'text-success' : 'text-muted'}`}
													onClick={handleToggleActive}
												>
													{isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
												</Button>
											</div>
										</Card.Body>
									</Card>

									{/* Save + Delete buttons */}
									<Button
										variant="primary"
										className="w-100 py-3 rounded-4 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
										style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', border: 'none' }}
										onClick={handleSave}
										disabled={saving}
									>
										{saving ? (
											<><Spinner animation="border" size="sm" /> Menyimpan...</>
										) : (
											<><Save size={18} /> Simpan Survei</>
										)}
									</Button>

									{saveMsg && (
										<Alert variant={saveMsg.type} className="rounded-3 border-0 py-2 px-3 small mb-0">
											{saveMsg.text}
										</Alert>
									)}

									{survey && (
										<Button
											variant="outline-danger"
											className="w-100 rounded-4 py-2 small fw-semibold"
											onClick={handleDeleteSurvey}
										>
											<Trash2 size={14} className="me-2" /> Hapus Survei Ini
										</Button>
									)}

									{/* Info box */}
									{isActive && (
										<div className="bg-primary-subtle rounded-4 p-3 border border-primary border-opacity-25">
											<div className="d-flex gap-2">
												<Award size={16} className="text-primary mt-1 flex-shrink-0" />
												<p className="small mb-0 text-primary">
													<strong>Sertifikat terkunci</strong> — Peserta harus mengisi survei ini untuk mendapatkan sertifikat kelulusan.
												</p>
											</div>
										</div>
									)}
								</div>
							</Col>

							{/* ── RIGHT: Question Builder ── */}
							<Col lg={8}>
								{/* Judul preview */}
								<Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
									<div
										className="p-4 text-white position-relative overflow-hidden"
										style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
									>
										<div className="position-absolute rounded-circle" style={{ width: '200px', height: '200px', background: 'rgba(255,255,255,0.07)', top: '-60px', right: '-60px' }} />
										<h5 className="fw-bold mb-1 position-relative">{surveyTitle || 'Judul Survei'}</h5>
										{surveyDesc && <p className="small mb-0 opacity-75 position-relative">{surveyDesc}</p>}
										<div className="mt-3 d-flex align-items-center gap-2 position-relative">
											<Badge bg={isActive ? 'success' : 'secondary'} className="rounded-pill px-3 py-1 small">
												{isActive ? '● Aktif' : '● Draft'}
											</Badge>
											<span className="small opacity-75">{questions.length} pertanyaan</span>
										</div>
									</div>
								</Card>

								{/* Empty state */}
								{questions.length === 0 && (
									<Card className="border-0 shadow-sm rounded-4 mb-4">
										<Card.Body className="py-5 text-center">
											<div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
												<MessageSquare size={36} className="text-muted opacity-50" />
											</div>
											<h6 className="fw-bold text-muted">Belum Ada Pertanyaan</h6>
											<p className="small text-muted mb-3">Tambahkan pertanyaan pertama untuk survei Anda.</p>
											<Button
												variant="primary"
												className="rounded-pill px-4 py-2 fw-semibold shadow-sm"
												style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', border: 'none' }}
												onClick={addQuestion}
											>
												<Plus size={16} className="me-2" /> Tambah Pertanyaan
											</Button>
										</Card.Body>
									</Card>
								)}

								{/* Question list */}
								<div className="d-flex flex-column gap-3">
									{questions.map((q, index) => (
										<QuestionCard
											key={q.id}
											question={q}
											index={index}
											onUpdate={(updates) => updateQuestion(q.id, updates)}
											onDelete={() => removeQuestion(q.id)}
											onOptionsTextChange={(text) => updateOptionsText(q.id, text)}
										/>
									))}
								</div>

								{/* Add question button */}
								{questions.length > 0 && (
									<Button
										variant="light"
										className="w-100 mt-3 py-3 rounded-4 border-2 text-muted d-flex align-items-center justify-content-center gap-2 bg-white"
										style={{ borderStyle: 'dashed', borderColor: '#cbd5e1' }}
										onClick={addQuestion}
									>
										<Plus size={18} /> Tambah Pertanyaan
									</Button>
								)}
							</Col>
						</Row>
					)}
				</>
			)}

			{/* ═══════════════════════════════════════ ANALYTICS TAB */}
			{activeTab === 'analytics' && (
				<AnalyticsView
					analytics={analytics}
					loading={loadingAnalytics}
					error={analyticsError}
					onRefresh={fetchAnalytics}
					expandedRow={expandedRow}
					setExpandedRow={setExpandedRow}
				/>
			)}
		</Container>
	);
}

// ─── QuestionCard component ───────────────────────────────────────────────────
function QuestionCard({ question, index, onUpdate, onDelete, onOptionsTextChange }) {
	const typeInfo = QUESTION_TYPES.find((t) => t.value === question.type) || QUESTION_TYPES[0];

	return (
		<Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ transition: 'box-shadow 0.2s' }}>
			{/* Card header */}
			<div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between bg-white">
				<div className="d-flex align-items-center gap-3">
					<span className="text-muted" style={{ cursor: 'grab' }}><GripVertical size={18} /></span>
					<Badge
						className="rounded-pill px-3 py-1 small fw-semibold"
						style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}
					>
						{typeInfo.label.split(' ').slice(0, 2).join(' ')}
					</Badge>
					<span className="small text-muted">Pertanyaan #{index + 1}</span>
				</div>
				<div className="d-flex align-items-center gap-2">
					<div className="d-flex align-items-center gap-2 small text-muted">
						<Form.Check
							type="switch"
							id={`req-${question.id}`}
							checked={question.is_required}
							onChange={(e) => onUpdate({ is_required: e.target.checked })}
							label={<span className="small">{question.is_required ? '🔒 Wajib' : 'Opsional'}</span>}
							className="mb-0"
						/>
					</div>
					<Button
						variant="link"
						className="text-muted p-1"
						onMouseEnter={(e) => e.currentTarget.classList.add('text-danger')}
						onMouseLeave={(e) => e.currentTarget.classList.remove('text-danger')}
						onClick={onDelete}
					>
						<Trash2 size={16} />
					</Button>
				</div>
			</div>

			<Card.Body className="p-4">
				{/* Type selector */}
				<Form.Select
					value={question.type}
					onChange={(e) => onUpdate({ type: e.target.value, options: [], _options_text: '' })}
					className="w-auto rounded-pill border mb-3 small pe-4"
					style={{ fontSize: '13px' }}
				>
					{QUESTION_TYPES.map((t) => (
						<option key={t.value} value={t.value}>{t.label}</option>
					))}
				</Form.Select>

				{/* Label input */}
				<Form.Control
					type="text"
					value={question.label}
					onChange={(e) => onUpdate({ label: e.target.value })}
					placeholder="Tulis pertanyaan di sini..."
					className="border-0 border-bottom rounded-0 px-0 shadow-none fw-medium bg-transparent"
					style={{ fontSize: '1rem', paddingBottom: '8px' }}
				/>

				{/* Preview / options per type */}
				<div className="mt-3">
					{question.type === 'rating' && (
						<div className="d-flex gap-2 align-items-center">
							{[1, 2, 3, 4, 5].map((s) => (
								<div key={s} className="bg-warning-subtle rounded d-flex align-items-center justify-content-center" style={{ width: '34px', height: '34px' }}>
									<Star size={18} className="text-warning" fill="#ffc107" />
								</div>
							))}
							<span className="text-muted small ms-2">Skala 1 – 5 bintang</span>
						</div>
					)}

					{(question.type === 'text') && (
						<div className="border rounded-3 px-3 py-2 small text-muted bg-light" style={{ borderStyle: 'dashed' }}>
							Input teks singkat...
						</div>
					)}

					{question.type === 'textarea' && (
						<div className="border rounded-3 px-3 py-4 small text-muted bg-light" style={{ borderStyle: 'dashed' }}>
							Input teks panjang (paragraf)...
						</div>
					)}

					{(question.type === 'radio' || question.type === 'checkbox') && (
						<div>
							<p className="small text-muted mb-2">Tulis setiap opsi pilihan di baris baru:</p>
							<Form.Control
								as="textarea"
								rows={4}
								value={question._options_text || ''}
								onChange={(e) => onOptionsTextChange(e.target.value)}
								placeholder={'Opsi 1\nOpsi 2\nOpsi 3'}
								className="rounded-3 bg-light border small"
								style={{ resize: 'none', fontSize: '13px' }}
							/>
							{/* Preview opsi */}
							{(question.options || []).length > 0 && (
								<div className="mt-3 d-flex flex-column gap-2">
									{question.options.map((opt, i) => (
										<div key={i} className="d-flex align-items-center gap-2 small text-dark">
											<div className={`border rounded-${question.type === 'radio' ? 'circle' : '2'} flex-shrink-0`} style={{ width: '16px', height: '16px', borderColor: '#9ca3af' }} />
											{opt}
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			</Card.Body>
		</Card>
	);
}

// ─── AnalyticsView component ──────────────────────────────────────────────────
function AnalyticsView({ analytics, loading, error, onRefresh, expandedRow, setExpandedRow }) {
	if (loading) return (
		<div className="text-center py-5">
			<Spinner animation="border" variant="primary" />
			<p className="text-muted mt-3 small">Memuat data analitik survei...</p>
		</div>
	);

	if (error) return (
		<Alert variant="danger" className="rounded-4 border-0 shadow-sm d-flex align-items-center gap-3">
			<AlertCircle size={22} className="flex-shrink-0" />
			<div>{error} <Button variant="link" className="p-0 ms-2 text-danger fw-semibold small" onClick={onRefresh}><RefreshCw size={13} className="me-1" />Coba lagi</Button></div>
		</Alert>
	);

	if (!analytics) return null;

	const starData = (analytics.distribution || []).map((d) => ({
		name: `${d.star}★`, count: d.count, fill: STAR_COLORS[d.star - 1],
	}));

	return (
		<>
			{/* Stat Cards */}
			<Row className="g-3 mb-4">
				{[
					{ Icon: Users, label: 'Total Respons', value: analytics.total_responses, bg: '#3b82f6' },
					{ Icon: Star, label: 'Rata-rata Rating', value: `${analytics.avg_rating} / 5`, bg: '#f59e0b' },
					{ Icon: TrendingUp, label: 'Tingkat Kepuasan', value: `${analytics.satisfaction_rate}%`, bg: '#10b981' },
					{ Icon: Award, label: 'Rating Pembicara', value: `${analytics.avg_speaker_rating} / 5`, bg: '#8b5cf6' },
				].map(({ Icon, label, value, bg }) => (
					<Col md={3} key={label}>
						<Card className="border-0 shadow-sm rounded-4 h-100 text-white p-4" style={{ background: `linear-gradient(135deg,${bg},${bg}cc)` }}>
							<div className="d-flex justify-content-between mb-3">
								<Icon size={22} />
								<span className="small opacity-75">{label}</span>
							</div>
							<h3 className="mb-0 fw-bold">{value}</h3>
						</Card>
					</Col>
				))}
			</Row>

			{/* Chart row */}
			{analytics.total_responses > 0 && (
				<Row className="g-4 mb-4">
					<Col lg={8}>
						<Card className="border-0 shadow-sm rounded-4">
							<Card.Body className="p-4">
								<h6 className="fw-bold mb-4">Distribusi Rating</h6>
								<ResponsiveContainer width="100%" height={200}>
									<BarChart data={starData} barSize={36}>
										<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
										<XAxis dataKey="name" axisLine={false} tickLine={false} />
										<YAxis allowDecimals={false} axisLine={false} tickLine={false} />
										<Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} formatter={(v) => [`${v} respons`]} />
										<Bar dataKey="count" radius={[6, 6, 0, 0]}>
											{starData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</Card.Body>
						</Card>
					</Col>
					<Col lg={4}>
						<Card className="border-0 shadow-sm rounded-4 h-100">
							<Card.Body className="p-4">
								<h6 className="fw-bold mb-4">Rata-rata Kategori</h6>
								{[
									{ label: 'Kepuasan Acara', value: analytics.avg_rating, color: '#3b82f6' },
									{ label: 'Pembicara', value: analytics.avg_speaker_rating, color: '#7c3aed' },
									{ label: 'Materi', value: analytics.avg_material_rating, color: '#10b981' },
								].map((item) => (
									<div className="mb-3" key={item.label}>
										<div className="d-flex justify-content-between mb-1">
											<span className="small fw-medium">{item.label}</span>
											<span className="small fw-bold" style={{ color: item.color }}>{item.value > 0 ? `${item.value}/5` : 'N/A'}</span>
										</div>
										<div className="rounded-pill overflow-hidden bg-light" style={{ height: '8px' }}>
											<div style={{ width: `${(item.value / 5) * 100}%`, background: item.color, height: '100%', borderRadius: '8px', transition: 'width 0.6s ease' }} />
										</div>
									</div>
								))}
								<div className="mt-4 p-3 rounded-3 text-center" style={{ background: analytics.satisfaction_rate >= 75 ? '#f0fdf4' : '#fef2f2' }}>
									<div className="fw-bold" style={{ fontSize: '1.8rem', color: analytics.satisfaction_rate >= 75 ? '#16a34a' : '#dc2626' }}>
										{analytics.satisfaction_rate}%
									</div>
									<p className="mb-0 small text-muted">Peserta puas (≥4★)</p>
								</div>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			)}

			{/* Responses table */}
			<Card className="border-0 shadow-sm rounded-4">
				<Card.Body className="p-0">
					<div className="p-4 border-bottom d-flex align-items-center justify-content-between">
						<div>
							<h6 className="fw-bold mb-0">Daftar Respons Peserta</h6>
							<p className="text-muted small mb-0">{analytics.total_responses} respons terkumpul</p>
						</div>
						<Badge bg="primary-subtle" text="primary" className="px-3 py-2 rounded-pill">{analytics.total_responses}</Badge>
					</div>

					{analytics.responses.length === 0 ? (
						<div className="text-center py-5 text-muted">
							<MessageSquare size={36} className="mb-3 opacity-40" />
							<p className="mb-0">Belum ada peserta mengisi survei.</p>
						</div>
					) : (
						<div className="table-responsive">
							<table className="table table-hover mb-0" style={{ fontSize: '14px' }}>
								<thead className="bg-light">
									<tr>
										<th className="ps-4 py-3 text-muted fw-semibold border-0 small">PESERTA</th>
										<th className="py-3 text-muted fw-semibold border-0 small text-center">RATING</th>
										<th className="py-3 text-muted fw-semibold border-0 small">TANGGAL</th>
										<th className="py-3 pe-4 border-0 small" />
									</tr>
								</thead>
								<tbody>
									{analytics.responses.map((resp) => (
										<React.Fragment key={resp.id}>
											<tr style={{ cursor: 'pointer' }} onClick={() => setExpandedRow(expandedRow === resp.id ? null : resp.id)}>
												<td className="ps-4 py-3 align-middle">
													<div className="fw-semibold">{resp.user?.name || 'Anonim'}</div>
													<div className="text-muted small">{resp.user?.email}</div>
												</td>
												<td className="py-3 align-middle text-center">
													{resp.rating ? (
														<div className="d-flex justify-content-center gap-1">
															{[1,2,3,4,5].map((s) => (
																<Star key={s} size={14} fill={s <= resp.rating ? '#ffc107' : 'none'} color={s <= resp.rating ? '#ffc107' : '#ced4da'} />
															))}
														</div>
													) : <span className="text-muted small">Custom</span>}
												</td>
												<td className="py-3 align-middle">
													<span className="text-muted small">{new Date(resp.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
												</td>
												<td className="py-3 pe-4 align-middle">
													<Button variant="light" size="sm" className="rounded-circle p-1 border-0 text-muted">
														{expandedRow === resp.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
													</Button>
												</td>
											</tr>
											{expandedRow === resp.id && (
												<tr>
													<td colSpan={4} className="px-4 pb-4 pt-0 bg-light border-0">
														<div className="bg-white rounded-3 p-4 border shadow-sm">
															{resp.comments ? (
																<>
																	<p className="small fw-semibold text-muted text-uppercase mb-1" style={{ letterSpacing: '1px' }}>Komentar</p>
																	<p className="mb-0">"{resp.comments}"</p>
																</>
															) : resp.answers && resp.answers.length > 0 ? (
																<div className="d-flex flex-column gap-3">
																	{resp.answers.map((ans) => (
																		<div key={ans.id}>
																			<p className="small fw-semibold mb-1 text-muted">{ans.question?.label}</p>
																			<p className="mb-0 text-dark">{ans.value || '—'}</p>
																		</div>
																	))}
																</div>
															) : (
																<p className="mb-0 text-muted fst-italic small">Tidak ada komentar tambahan.</p>
															)}
														</div>
													</td>
												</tr>
											)}
										</React.Fragment>
									))}
								</tbody>
							</table>
						</div>
					)}
				</Card.Body>
			</Card>
		</>
	);
}
