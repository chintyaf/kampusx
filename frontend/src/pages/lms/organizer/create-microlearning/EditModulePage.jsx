import React, { useState, useMemo, useEffect } from 'react';
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
	Dropdown,
	Toast,
	ToastContainer,
	Modal,
} from 'react-bootstrap';
import {
	ChevronDown,
	ChevronUp,
	Pencil,
	Trash2,
	GripVertical,
	BookOpen,
	Cpu,
	HelpCircle,
	Brain,
	Plus,
	Check,
	ArrowUp,
	ArrowDown,
	Clock,
	Award,
	ChevronLeft,
	FolderPlus,
} from 'lucide-react';

// Konfigurasi Tipe Unit Pembelajaran
const UNIT_TYPES = {
	ARTICLE: {
		id: 'ARTICLE',
		label: '📄 Artikel',
		name: 'Artikel',
		icon: BookOpen,
		bgClass: 'bg-primary-subtle',
		textClass: 'text-primary',
	},
	MICROLEARNING: {
		id: 'MICROLEARNING',
		label: '📹 Video Microlearning',
		name: 'Microlearning Unit',
		icon: Cpu,
		bgClass: 'bg-info-subtle',
		textClass: 'text-info',
	},
	QUIZ: {
		id: 'QUIZ',
		label: '❓ Kuis Refleksi',
		name: 'Diagnostic Quiz',
		icon: HelpCircle,
		bgClass: 'bg-warning-subtle',
		textClass: 'text-warning',
	},
	SRL_REFLECTION: {
		id: 'SRL_REFLECTION',
		label: '🧘 Refleksi SRL',
		name: 'Refleksi SRL & Metakognisi',
		icon: Brain,
		bgClass: 'purple-box',
		textClass: 'purple-text',
	},
};

const EditModulePage = () => {
	// Ambil Parameter dari URL Path
	const { learningId = '1', moduleId = '1', lessonId } = useParams();
	const navigate = useNavigate();

	// State Daftar Modul (Mendukung Multi-Modul)
	const [modules, setModules] = useState([
		{
			id: '1',
			title: 'Module 1: Fundamentals of Python',
			difficulty: 'Pemula',
			description:
				'Modul pembelajaran modular microlearning untuk mempercepat akselerasi keahlian teknis secara mandiri...',
			isExpanded: true,
			units: [
				{
					id: '1',
					type: 'ARTICLE',
					title: 'Lesson 1.1 Introduction to Variables',
					duration: 5,
					xp: 25,
					content: 'Materi pengenalan dasar variabel pada Python.',
					questionsCount: 0,
					passScore: 80,
					isGraded: false,
				},
				{
					id: '2',
					type: 'MICROLEARNING',
					title: 'Lesson 1.2 Data Structures Overview',
					duration: 8,
					xp: 30,
					content: 'https://youtube.com/watch?v=demo',
					questionsCount: 0,
					passScore: 80,
					isGraded: false,
				},
				{
					id: '3',
					type: 'QUIZ',
					title: 'Quiz 1.1 Reflection Quiz: Python Basics',
					duration: 10,
					xp: 40,
					questionsCount: 5,
					passScore: 80,
					isGraded: true,
				},
				{
					id: '4',
					type: 'SRL_REFLECTION',
					title: 'Refleksi Diri SRL & Metakognisi Belajar',
					duration: 7,
					xp: 25,
					content: 'Refleksi mandiri mengenai strategi belajar bab ini.',
					questionsCount: 0,
					passScore: 80,
					isGraded: false,
				},
			],
		},
	]);

	// State Notifikasi Toast
	const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
	const triggerToast = (message, variant = 'success') => {
		setToast({ show: true, message, variant });
	};

	// State Modal Modul Baru
	const [showModuleModal, setShowModuleModal] = useState(false);
	const [newModuleForm, setNewModuleForm] = useState({
		title: '',
		difficulty: 'Pemula',
		description: '',
	});

	// State Modal Lesson (Tambah / Edit)
	const [showLessonModal, setShowLessonModal] = useState(false);
	const [targetModuleId, setTargetModuleId] = useState(moduleId);
	const [lessonForm, setLessonForm] = useState({
		id: null,
		type: 'ARTICLE',
		title: '',
		duration: 10,
		xp: 20,
		content: '',
		questionsCount: 5,
		passScore: 80,
	});

	// Effect untuk Menangani Direct Link / Akses Langsung URL :lessonId
	useEffect(() => {
		if (lessonId) {
			setTargetModuleId(moduleId);
			if (lessonId === 'new') {
				// Akses Mode Tambah Lesson Baru via URL
				setLessonForm({
					id: null,
					type: 'ARTICLE',
					title: '',
					duration: 10,
					xp: 20,
					content: '',
					questionsCount: 5,
					passScore: 80,
				});
				setShowLessonModal(true);
			} else {
				// Akses Mode Edit Lesson Spesifik via URL
				const currentModule = modules.find((m) => String(m.id) === String(moduleId));
				if (currentModule) {
					const targetLesson = currentModule.units.find(
						(u) => String(u.id) === String(lessonId),
					);
					if (targetLesson) {
						setLessonForm({ ...targetLesson });
						setShowLessonModal(true);
					} else {
						triggerToast('Lesson tidak ditemukan', 'danger');
					}
				}
			}
		} else {
			setShowLessonModal(false);
		}
	}, [lessonId, moduleId, modules]);

	// Handler Navigasi & URL Sync saat Buka Modal Lesson
	const handleOpenAddLesson = (modId) => {
		setTargetModuleId(modId);
		navigate(`/organizer/learning-path/${learningId}/edit-module/${modId}/new`);
	};

	const handleOpenEditLesson = (modId, lesson) => {
		setTargetModuleId(modId);
		navigate(`/organizer/learning-path/${learningId}/edit-module/${modId}/${lesson.id}`);
	};

	const handleCloseLessonModal = () => {
		setShowLessonModal(false);
		// Kembalikan URL ke Route Modul saja
		navigate(`/organizer/learning-path/${learningId}/edit-module/${targetModuleId}`);
	};

	// Handler CRUD Modul
	const handleCreateModule = (e) => {
		e.preventDefault();
		if (!newModuleForm.title.trim()) return;

		const newId = String(Date.now());
		const newMod = {
			id: newId,
			title: newModuleForm.title,
			difficulty: newModuleForm.difficulty,
			description: newModuleForm.description,
			isExpanded: true,
			units: [],
		};

		setModules([...modules, newMod]);
		setNewModuleForm({ title: '', difficulty: 'Pemula', description: '' });
		setShowModuleModal(false);
		triggerToast('Modul baru berhasil ditambahkan!');
	};

	const handleUpdateModuleMeta = (modId, field, value) => {
		setModules(modules.map((m) => (m.id === modId ? { ...m, [field]: value } : m)));
	};

	const toggleExpandModule = (modId) => {
		setModules(modules.map((m) => (m.id === modId ? { ...m, isExpanded: !m.isExpanded } : m)));
	};

	const handleDeleteModule = (modId) => {
		if (modules.length === 1) {
			triggerToast('Minimal harus ada satu modul!', 'warning');
			return;
		}
		setModules(modules.filter((m) => m.id !== modId));
		triggerToast('Modul berhasil dihapus', 'danger');
	};

	// Handler CRUD Lesson / Unit
	const handleSaveLesson = (e) => {
		e.preventDefault();
		if (!lessonForm.title.trim()) return;

		setModules(
			modules.map((m) => {
				if (String(m.id) === String(targetModuleId)) {
					let updatedUnits = [...m.units];
					if (lessonForm.id) {
						// Update Lesson Eksisting
						updatedUnits = updatedUnits.map((u) =>
							String(u.id) === String(lessonForm.id) ? { ...lessonForm } : u,
						);
					} else {
						// Tambah Lesson Baru
						const newLessonObj = {
							...lessonForm,
							id: String(Date.now()),
							isGraded: lessonForm.type === 'QUIZ',
						};
						updatedUnits.push(newLessonObj);
					}
					return { ...m, units: updatedUnits };
				}
				return m;
			}),
		);

		triggerToast(
			lessonForm.id
				? 'Unit lesson berhasil diperbarui!'
				: 'Unit lesson baru berhasil ditambahkan!',
		);
		handleCloseLessonModal();
	};

	const handleDeleteUnit = (modId, unitId) => {
		setModules(
			modules.map((m) => {
				if (m.id === modId) {
					return { ...m, units: m.units.filter((u) => u.id !== unitId) };
				}
				return m;
			}),
		);
		triggerToast('Unit berhasil dihapus', 'danger');
	};

	const moveUnit = (modId, index, direction) => {
		setModules(
			modules.map((m) => {
				if (m.id === modId) {
					const newUnits = [...m.units];
					const targetIndex = direction === 'up' ? index - 1 : index + 1;
					if (targetIndex < 0 || targetIndex >= newUnits.length) return m;

					const [movedItem] = newUnits.splice(index, 1);
					newUnits.splice(targetIndex, 0, movedItem);
					return { ...m, units: newUnits };
				}
				return m;
			}),
		);
	};

	// Render Box Ikon Berwarna untuk Tipe Lesson
	const renderIconBox = (typeKey) => {
		const config = UNIT_TYPES[typeKey] || UNIT_TYPES.ARTICLE;
		const IconComp = config.icon;
		const isPurple = typeKey === 'SRL_REFLECTION';

		const boxStyle = isPurple
			? { backgroundColor: '#f3e8ff', color: '#8936d6', borderRadius: '8px', padding: '10px' }
			: { borderRadius: '8px', padding: '10px' };

		const classNames = isPurple
			? 'd-flex align-items-center justify-content-center me-3'
			: `d-flex align-items-center justify-content-center me-3 ${config.bgClass} ${config.textClass}`;

		return (
			<div className={classNames} style={boxStyle}>
				<IconComp size={20} />
			</div>
		);
	};

	return (
		<div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '90px' }}>
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
				{/* Header & Navigasi Atas */}
				<div className="d-flex align-items-center justify-content-between mb-4">
					<Breadcrumb className="mb-0">
						<Breadcrumb.Item
							onClick={() => navigate(`/organizer/learning-path/${learningId}`)}
							className="text-decoration-none"
							style={{ cursor: 'pointer' }}
						>
							<ChevronLeft size={16} className="me-1" />
							Kembali ke Learning Path
						</Breadcrumb.Item>
						<Breadcrumb.Item active className="fw-semibold text-dark">
							Pengaturan Modul & Content Builder
						</Breadcrumb.Item>
					</Breadcrumb>

					{/* Tombol Tambah Modul Baru */}
					<Button
						variant="success"
						className="fw-semibold d-flex align-items-center gap-1 shadow-sm"
						onClick={() => setShowModuleModal(true)}
					>
						<FolderPlus size={18} /> Tambah Modul Baru
					</Button>
				</div>

				{/* Loop Daftar Modul */}
				{modules.map((moduleMeta, modIdx) => {
					const totalDuration = moduleMeta.units.reduce(
						(acc, curr) => acc + Number(curr.duration || 0),
						0,
					);
					const totalXP = moduleMeta.units.reduce(
						(acc, curr) => acc + Number(curr.xp || 0),
						0,
					);

					return (
						<div key={moduleMeta.id} className="mb-5">
							{/* Kartu Informasi Utama Modul */}
							<Card className="shadow-sm border-0 rounded-3 mb-3 p-2 bg-white">
								<Card.Body>
									<Row className="g-3">
										<Col md={8}>
											<Form.Group className="mb-3">
												<Form.Label className="fw-bold text-secondary small mb-1">
													JUDUL MODUL {modIdx + 1}
												</Form.Label>
												<Form.Control
													type="text"
													size="lg"
													className="fw-bold fs-4 text-primary"
													value={moduleMeta.title}
													onChange={(e) =>
														handleUpdateModuleMeta(
															moduleMeta.id,
															'title',
															e.target.value,
														)
													}
												/>
											</Form.Group>
										</Col>
										<Col md={4}>
											<Form.Group className="mb-3">
												<Form.Label className="fw-bold text-secondary small mb-1">
													TINGKAT KESULITAN
												</Form.Label>
												<Form.Select
													value={moduleMeta.difficulty}
													onChange={(e) =>
														handleUpdateModuleMeta(
															moduleMeta.id,
															'difficulty',
															e.target.value,
														)
													}
													className="fw-semibold"
												>
													<option value="Pemula">Pemula</option>
													<option value="Menengah">Menengah</option>
													<option value="Tingkat Lanjut">
														Tingkat Lanjut
													</option>
												</Form.Select>
											</Form.Group>
										</Col>
									</Row>

									<Form.Group className="mb-3">
										<Form.Label className="fw-bold text-secondary small mb-1">
											DESKRIPSI MODUL
										</Form.Label>
										<Form.Control
											as="textarea"
											rows={2}
											value={moduleMeta.description}
											onChange={(e) =>
												handleUpdateModuleMeta(
													moduleMeta.id,
													'description',
													e.target.value,
												)
											}
										/>
									</Form.Group>

									{/* Row Metadata Summary Modul */}
									<div className="d-flex flex-wrap align-items-center gap-3 pt-2 border-top">
										<Badge
											bg="light"
											className="text-dark border p-2 d-flex align-items-center gap-1 fw-normal"
										>
											<Clock size={15} className="text-primary" />
											<span>
												<strong>{totalDuration} Menit</strong> Estimasi
											</span>
										</Badge>
										<Badge
											bg="light"
											className="text-dark border p-2 d-flex align-items-center gap-1 fw-normal"
										>
											<Award size={15} className="text-warning" />
											<span>
												<strong>+{totalXP} XP</strong> Reward
											</span>
										</Badge>
										<Badge bg="primary" className="p-2 fw-semibold">
											{moduleMeta.units.length} Lesson Units
										</Badge>
									</div>
								</Card.Body>
							</Card>

							{/* Area Editor List Unit Pembelajaran Modul */}
							<Card className="shadow-sm border-0 rounded-3 p-3 bg-white">
								<div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
									<div className="d-flex align-items-center gap-2">
										<Button
											variant="light"
											size="sm"
											className="p-1 border-0"
											onClick={() => toggleExpandModule(moduleMeta.id)}
										>
											{moduleMeta.isExpanded ? (
												<ChevronUp size={20} />
											) : (
												<ChevronDown size={20} />
											)}
										</Button>
										<span
											className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold"
											style={{
												width: '28px',
												height: '28px',
												fontSize: '14px',
											}}
										>
											{modIdx + 1}
										</span>
										<h5 className="mb-0 fw-bold">{moduleMeta.title}</h5>
										<Badge
											bg="secondary"
											className="bg-opacity-10 text-secondary border border-secondary-subtle"
										>
											{moduleMeta.units.length} Items
										</Badge>
									</div>
									<div>
										<Button
											variant="link"
											className="text-danger text-decoration-none p-1 btn-sm"
											onClick={() => handleDeleteModule(moduleMeta.id)}
										>
											<Trash2 size={16} className="me-1" /> Hapus Modul
										</Button>
									</div>
								</div>

								{/* Daftar Unit Pembelajaran Modul */}
								{moduleMeta.isExpanded && (
									<div>
										{moduleMeta.units.map((unit, index) => {
											const isQuiz = unit.type === 'QUIZ';
											const isSRL = unit.type === 'SRL_REFLECTION';

											return (
												<Card
													key={unit.id}
													className="border rounded-3 mb-3 p-3 bg-white shadow-xs"
												>
													<div className="d-flex align-items-center justify-content-between">
														<div className="d-flex align-items-center flex-grow-1">
															{/* Drag Handle & Tombol Urutan */}
															<div className="d-flex flex-column align-items-center me-2 text-muted">
																<GripVertical
																	size={18}
																	style={{ cursor: 'grab' }}
																/>
																<div className="d-flex gap-1 mt-1">
																	<Button
																		variant="light"
																		size="sm"
																		className="p-0 border-0 text-muted"
																		disabled={index === 0}
																		onClick={() =>
																			moveUnit(
																				moduleMeta.id,
																				index,
																				'up',
																			)
																		}
																	>
																		<ArrowUp size={12} />
																	</Button>
																	<Button
																		variant="light"
																		size="sm"
																		className="p-0 border-0 text-muted"
																		disabled={
																			index ===
																			moduleMeta.units
																				.length -
																				1
																		}
																		onClick={() =>
																			moveUnit(
																				moduleMeta.id,
																				index,
																				'down',
																			)
																		}
																	>
																		<ArrowDown size={12} />
																	</Button>
																</div>
															</div>

															{/* Box Ikon Warna */}
															{renderIconBox(unit.type)}

															{/* Judul & Metadata */}
															<div>
																<div className="fw-bold text-dark mb-1">
																	{unit.title}
																</div>
																<div className="text-muted small d-flex align-items-center gap-2 flex-wrap">
																	{isQuiz ? (
																		<>
																			<span>
																				{unit.questionsCount ||
																					5}{' '}
																				Questions
																			</span>
																			<span>•</span>
																			<span>
																				Pass score:{' '}
																				{unit.passScore ||
																					80}
																				%
																			</span>
																		</>
																	) : (
																		<>
																			<span>
																				{
																					UNIT_TYPES[
																						unit.type
																					]?.name
																				}
																			</span>
																			<span>•</span>
																			<span>
																				{unit.duration} mins
																			</span>
																			<span>•</span>
																			<span className="text-success fw-medium">
																				+{unit.xp} XP
																			</span>
																		</>
																	)}

																	{/* Badge Status */}
																	{isQuiz && (
																		<Badge
																			bg="warning"
																			className="text-dark ms-2"
																		>
																			Graded
																		</Badge>
																	)}
																	{isSRL && (
																		<Badge
																			style={{
																				backgroundColor:
																					'#8936d6',
																				color: '#fff',
																			}}
																			className="ms-2"
																		>
																			Refleksi SRL
																		</Badge>
																	)}
																</div>
															</div>
														</div>

														{/* Menu Dropdown Per Unit */}
														<Dropdown align="end">
															<Dropdown.Toggle
																variant="light"
																size="sm"
																className="border-0 bg-transparent text-muted fw-bold"
															>
																•••
															</Dropdown.Toggle>
															<Dropdown.Menu>
																<Dropdown.Item
																	onClick={() =>
																		handleOpenEditLesson(
																			moduleMeta.id,
																			unit,
																		)
																	}
																>
																	<Pencil
																		size={14}
																		className="me-2"
																	/>{' '}
																	Edit Unit
																</Dropdown.Item>
																<Dropdown.Item
																	className="text-danger"
																	onClick={() =>
																		handleDeleteUnit(
																			moduleMeta.id,
																			unit.id,
																		)
																	}
																>
																	<Trash2
																		size={14}
																		className="me-2"
																	/>{' '}
																	Hapus Unit
																</Dropdown.Item>
															</Dropdown.Menu>
														</Dropdown>
													</div>
												</Card>
											);
										})}

										{/* Dotted Border Box Tombol Tambah Lesson */}
										<div
											onClick={() => handleOpenAddLesson(moduleMeta.id)}
											style={{
												border: '2px dashed #0d6efd',
												backgroundColor: '#f8f9fa',
												borderRadius: '8px',
												padding: '16px',
												cursor: 'pointer',
												textAlign: 'center',
											}}
										>
											<Button
												variant="link"
												className="text-primary text-decoration-none fw-bold p-0"
											>
												<Plus size={18} className="me-1" /> Add Lesson /
												Quiz to {moduleMeta.title}
											</Button>
										</div>
									</div>
								)}
							</Card>
						</div>
					);
				})}
			</Container>

			{/* MODAL 1: TAMBAH MODUL BARU */}
			<Modal show={showModuleModal} onHide={() => setShowModuleModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title className="fw-bold fs-5">Tambah Modul Baru</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleCreateModule}>
					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label className="fw-semibold">Judul Modul</Form.Label>
							<Form.Control
								type="text"
								placeholder="Contoh: Module 2: Advanced Data Analysis"
								required
								value={newModuleForm.title}
								onChange={(e) =>
									setNewModuleForm({ ...newModuleForm, title: e.target.value })
								}
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label className="fw-semibold">Tingkat Kesulitan</Form.Label>
							<Form.Select
								value={newModuleForm.difficulty}
								onChange={(e) =>
									setNewModuleForm({
										...newModuleForm,
										difficulty: e.target.value,
									})
								}
							>
								<option value="Pemula">Pemula</option>
								<option value="Menengah">Menengah</option>
								<option value="Tingkat Lanjut">Tingkat Lanjut</option>
							</Form.Select>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label className="fw-semibold">Deskripsi Modul</Form.Label>
							<Form.Control
								as="textarea"
								rows={3}
								placeholder="Deskripsi singkat mengenai isi modul ini..."
								value={newModuleForm.description}
								onChange={(e) =>
									setNewModuleForm({
										...newModuleForm,
										description: e.target.value,
									})
								}
							/>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => setShowModuleModal(false)}>
							Batal
						</Button>
						<Button variant="primary" type="submit">
							Tambah Modul
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{/* MODAL 2: TAMBAH / EDIT LESSON (SINKRON DENGAN ROUTE :lessonId) */}
			<Modal show={showLessonModal} onHide={handleCloseLessonModal} size="lg" centered>
				<Modal.Header closeButton>
					<Modal.Title className="fw-bold fs-5">
						{lessonForm.id ? 'Edit Lesson / Unit' : 'Tambah Lesson / Unit Baru'}
					</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSaveLesson}>
					<Modal.Body>
						<Row className="g-3">
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label className="fw-semibold">
										Tipe Unit Pembelajaran
									</Form.Label>
									<Form.Select
										value={lessonForm.type}
										onChange={(e) =>
											setLessonForm({ ...lessonForm, type: e.target.value })
										}
									>
										{Object.values(UNIT_TYPES).map((t) => (
											<option key={t.id} value={t.id}>
												{t.label}
											</option>
										))}
									</Form.Select>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label className="fw-semibold">
										Judul Lesson / Unit
									</Form.Label>
									<Form.Control
										type="text"
										required
										placeholder="Contoh: Lesson 1.3 Control Flow"
										value={lessonForm.title}
										onChange={(e) =>
											setLessonForm({ ...lessonForm, title: e.target.value })
										}
									/>
								</Form.Group>
							</Col>
						</Row>

						{lessonForm.type === 'QUIZ' ? (
							<Row className="g-3">
								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label className="fw-semibold">
											Jumlah Pertanyaan
										</Form.Label>
										<Form.Control
											type="number"
											value={lessonForm.questionsCount}
											onChange={(e) =>
												setLessonForm({
													...lessonForm,
													questionsCount: Number(e.target.value),
												})
											}
										/>
									</Form.Group>
								</Col>
								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label className="fw-semibold">
											Nilai Kelulusan (Pass Score %)
										</Form.Label>
										<Form.Control
											type="number"
											value={lessonForm.passScore}
											onChange={(e) =>
												setLessonForm({
													...lessonForm,
													passScore: Number(e.target.value),
												})
											}
										/>
									</Form.Group>
								</Col>
							</Row>
						) : (
							<Row className="g-3">
								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label className="fw-semibold">
											Estimasi Durasi (Menit)
										</Form.Label>
										<Form.Control
											type="number"
											value={lessonForm.duration}
											onChange={(e) =>
												setLessonForm({
													...lessonForm,
													duration: Number(e.target.value),
												})
											}
										/>
									</Form.Group>
								</Col>
								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label className="fw-semibold">Reward XP</Form.Label>
										<Form.Control
											type="number"
											value={lessonForm.xp}
											onChange={(e) =>
												setLessonForm({
													...lessonForm,
													xp: Number(e.target.value),
												})
											}
										/>
									</Form.Group>
								</Col>
							</Row>
						)}

						<Form.Group className="mb-3">
							<Form.Label className="fw-semibold">
								{lessonForm.type === 'MICROLEARNING'
									? 'URL Video YouTube'
									: 'Konten / Instruksi Unit'}
							</Form.Label>
							<Form.Control
								as={lessonForm.type === 'MICROLEARNING' ? 'input' : 'textarea'}
								rows={3}
								placeholder={
									lessonForm.type === 'MICROLEARNING'
										? 'https://youtube.com/watch?v=...'
										: 'Tulis ringkasan atau instruksi materi di sini...'
								}
								value={lessonForm.content || ''}
								onChange={(e) =>
									setLessonForm({ ...lessonForm, content: e.target.value })
								}
							/>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={handleCloseLessonModal}>
							Batal
						</Button>
						<Button variant="primary" type="submit">
							Simpan Lesson
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{/* Footer Navigation Bar */}
			<div
				className="fixed-bottom bg-white border-top py-3 shadow-lg"
				style={{ zIndex: 1020 }}
			>
				<Container className="d-flex align-items-center justify-content-between">
					<Button
						variant="outline-secondary"
						className="px-4"
						onClick={() => navigate(-1)}
					>
						Batal
					</Button>
					<Button
						variant="primary"
						className="px-4"
						onClick={() => triggerToast('Seluruh perubahan modul berhasil disimpan!')}
					>
						<Check size={18} className="me-1" /> Simpan Semua Perubahan
					</Button>
				</Container>
			</div>
		</div>
	);
};

export default EditModulePage;
