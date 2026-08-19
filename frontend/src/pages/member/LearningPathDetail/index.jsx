import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Button, Modal, Form, Badge, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, BarChart, Award, Lock, Unlock, Play, CheckCircle, Calendar, Sparkles, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PATHS_DETAIL_DATA = {
	'mastering-frontend-web-development': {
		title: 'Mastering Frontend Web Development',
		description: 'Kuasai pembuatan antarmuka modern yang cepat, interaktif, dan responsif. Jalur ini membimbing Anda dari nol hingga siap berkarir sebagai Frontend Engineer profesional.',
		modulesCount: 12,
		durationHours: 24,
		level: 'Pemula',
		badgeIcon: 'Award',
		imageBg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
		skills: [
			{ name: 'HTML & CSS Layouts', value: 95 },
			{ name: 'JavaScript ES6+', value: 90 },
			{ name: 'React.js Component Architecture', value: 85 },
			{ name: 'State Management (Redux)', value: 80 },
			{ name: 'Web Performance Optimization', value: 75 },
			{ name: 'Responsive Web Design', value: 90 }
		],
		modules: [
			{
				id: 1,
				title: 'Modul 1: Fondasi HTML5 & CSS3 Modern',
				status: 'completed',
				description: 'Memahami semantik HTML5, CSS Flexbox & Grid, serta responsivitas layout dasar.',
				lessons: [
					'Artikel: Pengenalan Arsitektur World Wide Web',
					'Video: Struktur Dokumen Semantik HTML5',
					'Artikel: CSS Layouting dengan Flexbox & Grid'
				],
				quiz: 'Quiz Readiness 1: Struktur & Layouting Web (Lulus)',
				badgeName: 'HTML5 & CSS3 Guru'
			},
			{
				id: 2,
				title: 'Modul 2: JavaScript Modern & Asynchronous Programming',
				status: 'in_progress',
				description: 'Belajar variabel ES6+, Array Methods, Promises, Async/Await, dan interaksi DOM.',
				lessons: [
					'Video: Variabel Let, Const & Arrow Functions',
					'Artikel: Array Methods (Map, Filter, Reduce)',
					'Video: Melakukan Fetching Data dengan Async/Await'
				],
				quiz: 'Readiness Quiz 2: Logika & Async JavaScript (Belum Dikerjakan)',
				badgeName: 'JS Ninja'
			},
			{
				id: 3,
				title: 'Modul 3: React.js & Component Architecture',
				status: 'locked',
				prereq: 'Selesaikan Modul 2 untuk membuka modul ini',
				description: 'Membuat reusable components, memahami Hooks (useState, useEffect), dan props passing.',
				lessons: [
					'Video: Pengenalan JSX & Virtual DOM',
					'Artikel: Lifecycle & Hooks Terpopuler di React',
					'Video: Props Drilling vs Context API'
				],
				quiz: 'Readiness Quiz 3: Konsep Framework React (Terkunci)',
				badgeName: 'React Apprentice'
			},
			{
				id: 4,
				title: 'Modul 4: State Management & Routing',
				status: 'locked',
				prereq: 'Selesaikan Modul 3 untuk membuka modul ini',
				description: 'Mengatur state global aplikasi skala besar dengan Redux Toolkit atau Zustand dan navigasi React Router.',
				lessons: [
					'Artikel: Mengapa Membutuhkan Global State Store?',
					'Video: Setup Redux Toolkit di React App',
					'Video: Client-Side Routing dengan React Router DOM v6'
				],
				quiz: 'Readiness Quiz 4: Skalabilitas React Apps (Terkunci)',
				badgeName: 'State Wizard'
			}
		],
		events: [
			{ id: 1, title: 'Webinar: Tren Frontend Framework 2026', date: '18 Agustus 2026', type: 'Online (Zoom)', organizer: 'KampusX Academics' },
			{ id: 2, title: 'Workshop Offline: Membangun Portofolio React Menarik', date: '25 Agustus 2026', type: 'Kampus Jakarta (Offline)', organizer: 'Himpunan Mahasiswa TI' }
		]
	},
	'introduction-to-artificial-intelligence': {
		title: 'Introduction to Artificial Intelligence',
		description: 'Pahami dasar machine learning, neural networks, dan cara mengintegrasikan AI ke dalam aplikasi bisnis.',
		modulesCount: 8,
		durationHours: 16,
		level: 'Menengah',
		badgeIcon: 'Sparkles',
		imageBg: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
		skills: [
			{ name: 'Python programming', value: 90 },
			{ name: 'Data Preprocessing', value: 85 },
			{ name: 'Supervised Learning', value: 80 },
			{ name: 'Neural Networks', value: 70 },
			{ name: 'Generative AI Concepts', value: 80 },
			{ name: 'Model Evaluation', value: 75 }
		],
		modules: [
			{
				id: 1,
				title: 'Modul 1: Algoritma Python Dasar untuk AI',
				status: 'completed',
				description: 'Memahami library NumPy, Pandas, dan Matplotlib untuk manipulasi dataset.',
				lessons: [
					'Artikel: Pengenalan Bahasa Python untuk Data Science',
					'Video: Manipulasi Array dengan NumPy',
					'Artikel: Visualisasi Data Dasar'
				],
				quiz: 'Quiz Readiness 1: Python Data Science (Lulus)',
				badgeName: 'Python AI Starter'
			},
			{
				id: 2,
				title: 'Modul 2: Machine Learning Klasifikasi & Regresi',
				status: 'in_progress',
				description: 'Penerapan K-Nearest Neighbors, Decision Trees, dan Linear Regression menggunakan Scikit-Learn.',
				lessons: [
					'Video: Konsep Supervised vs Unsupervised Learning',
					'Artikel: Klasifikasi Gambar Menggunakan Decision Tree',
					'Video: Evaluasi Akurasi Model'
				],
				quiz: 'Readiness Quiz 2: Algoritma ML Klasik (Belum Dikerjakan)',
				badgeName: 'ML Practitioner'
			},
			{
				id: 3,
				title: 'Modul 3: Pengantar Deep Learning & Neural Networks',
				status: 'locked',
				prereq: 'Selesaikan Modul 2 untuk membuka modul ini',
				description: 'Dasar multi-layer perceptrons dan fungsi aktivasi sigmoid/relu.',
				lessons: [
					'Video: Apa itu Artificial Neural Network?',
					'Artikel: Memahami Fungsi Aktivasi & Backpropagation'
				],
				quiz: 'Readiness Quiz 3: Neural Nets (Terkunci)',
				badgeName: 'Neural Cadet'
			}
		],
		events: [
			{ id: 1, title: 'Webinar: Integrasi LLM API untuk Pemula', date: '20 Agustus 2026', type: 'Online', organizer: 'KampusX Academics' }
		]
	}
};

const LearningPathDetail = () => {
	const { slug } = useParams();
	const navigate = useNavigate();

	// Fallback to mastering-frontend-web-development if path details are missing
	const pathData = PATHS_DETAIL_DATA[slug] || PATHS_DETAIL_DATA['mastering-frontend-web-development'];

	const [activeTab, setActiveTab] = useState('roadmap');
	const [enrolled, setEnrolled] = useState(false);
	const [progress, setProgress] = useState(0);

	// Forethought Modal States
	const [showEnrollModal, setShowEnrollModal] = useState(false);
	const [studyGoal, setStudyGoal] = useState('2 modul per minggu');
	const [customGoal, setCustomGoal] = useState('');
	const [timeCommitment, setTimeCommitment] = useState('30 menit / hari');
	const [customCommitment, setCustomCommitment] = useState('');

	useEffect(() => {
		const isEnrolled = localStorage.getItem(`enrolled_${slug}`) === 'true';
		if (isEnrolled) {
			setEnrolled(true);
			const savedProgress = localStorage.getItem(`progress_${slug}`) || '0';
			setProgress(parseInt(savedProgress, 10));
		}
	}, [slug]);

	const handleEnrollClick = () => {
		setShowEnrollModal(true);
	};

	const handleConfirmEnroll = (e) => {
		e.preventDefault();
		const finalGoal = studyGoal === 'custom' ? customGoal : studyGoal;
		const finalCommitment = timeCommitment === 'custom' ? customCommitment : timeCommitment;

		if (!finalGoal.trim() || !finalCommitment.trim()) {
			toast.error('Mohon isi target dan komitmen belajar Anda.');
			return;
		}

		// Save targets to localStorage
		localStorage.setItem(`enrolled_${slug}`, 'true');
		localStorage.setItem(`progress_${slug}`, '0');
		localStorage.setItem(`target_goals_${slug}`, JSON.stringify({
			goal: finalGoal,
			commitment: finalCommitment
		}));

		setEnrolled(true);
		setProgress(0);
		setShowEnrollModal(false);
		toast.success('Pendaftaran Berhasil! Target belajar pribadi Anda telah disimpan.');
	};

	// SVG Radar Skills Renderer
	const renderRadarChart = (skills) => {
		const width = 300;
		const height = 300;
		const cx = width / 2;
		const cy = height / 2;
		const r = 90;
		const angleStep = (2 * Math.PI) / skills.length;

		// Calculate skill points coordinate
		const points = skills.map((skill, index) => {
			const valueRatio = skill.value / 100;
			const currentAngle = angleStep * index - Math.PI / 2;
			const px = cx + r * valueRatio * Math.cos(currentAngle);
			const py = cy + r * valueRatio * Math.sin(currentAngle);
			return `${px},${py}`;
		}).join(' ');

		// Calculate grid polygon coordinates
		const gridPolygons = [0.2, 0.4, 0.6, 0.8, 1.0].map((ratio) => {
			return skills.map((_, index) => {
				const currentAngle = angleStep * index - Math.PI / 2;
				const px = cx + r * ratio * Math.cos(currentAngle);
				const py = cy + r * ratio * Math.sin(currentAngle);
				return `${px},${py}`;
			}).join(' ');
		});

		return (
			<svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxHeight: '300px' }}>
				{/* Background grids */}
				{gridPolygons.map((poly, idx) => (
					<polygon key={idx} points={poly} fill="none" stroke="#E2E8F0" strokeWidth="1" />
				))}
				{/* Axis lines */}
				{skills.map((_, index) => {
					const currentAngle = angleStep * index - Math.PI / 2;
					const px = cx + r * Math.cos(currentAngle);
					const py = cy + r * Math.sin(currentAngle);
					return <line key={index} x1={cx} y1={cy} x2={px} y2={py} stroke="#E2E8F0" strokeWidth="1" />;
				})}
				{/* Data polygon */}
				<polygon points={points} fill="rgba(59, 130, 246, 0.15)" stroke="#3B82F6" strokeWidth="2.5" />
				{/* Labels */}
				{skills.map((skill, index) => {
					const currentAngle = angleStep * index - Math.PI / 2;
					const labelRadius = r + 24;
					const px = cx + labelRadius * Math.cos(currentAngle);
					const py = cy + labelRadius * Math.sin(currentAngle);
					
					let textAnchor = 'middle';
					if (Math.cos(currentAngle) > 0.1) textAnchor = 'start';
					else if (Math.cos(currentAngle) < -0.1) textAnchor = 'end';

					return (
						<text 
							key={index} 
							x={px} 
							y={py + 4} 
							textAnchor={textAnchor} 
							fontSize="10" 
							fontWeight="600" 
							fill="#475569"
						>
							{skill.name} ({skill.value}%)
						</text>
					);
				})}
			</svg>
		);
	};

	return (
		<Container className="py-4 py-md-5 animate-fade-in">
			{/* Back Button */}
			<button 
				onClick={() => navigate('/learning-paths')}
				className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-1 text-slate-600 mb-4"
				style={{ fontSize: '13.5px', fontWeight: 500 }}
			>
				<ArrowLeft size={16} />
				Kembali ke Katalog
			</button>

			{/* Hero Banner */}
			<Card className="border-0 shadow-sm mb-4 text-white overflow-hidden" style={{ borderRadius: '16px', background: pathData.imageBg }}>
				<Card.Body className="p-4 p-md-5 position-relative">
					{/* Decorative AI Sparkle */}
					<div className="position-absolute top-0 end-0 m-4 d-flex align-items-center gap-1.5 text-warning bg-white bg-opacity-10 px-3 py-1.5 rounded-pill border border-white border-opacity-15">
						<Sparkles size={16} />
						<span className="small fw-semibold">98% Match</span>
					</div>

					<div style={{ maxWidth: '640px' }} className="position-relative z-1">
						<Badge bg="white" text="dark" className="px-2.5 py-1.5 mb-3 rounded-8 shadow-xs" style={{ fontSize: '10px', fontWeight: 600 }}>
							{pathData.level}
						</Badge>
						<h3 className="fw-bold mb-3 text-white" style={{ letterSpacing: '-0.5px' }}>{pathData.title}</h3>
						<p className="small mb-4 text-white text-opacity-90" style={{ lineHeight: '1.6', fontSize: '13.5px' }}>
							{pathData.description}
						</p>

						{/* Quick Stats */}
						<div className="d-flex flex-wrap gap-4 mb-4 text-white text-opacity-90 small">
							<span className="d-flex align-items-center gap-1.5"><BookOpen size={16} /> {pathData.modulesCount} Modul Materi</span>
							<span className="d-flex align-items-center gap-1.5"><Clock size={16} /> {pathData.durationHours} Jam Pembelajaran</span>
							<span className="d-flex align-items-center gap-1.5"><Award size={16} /> Sertifikat Kompetensi</span>
						</div>

						{/* Action Button */}
						{enrolled ? (
							<div className="d-flex align-items-center gap-3 flex-wrap">
								<Button 
									variant="light" 
									className="rounded-pill px-4 py-2 fw-bold text-primary"
									onClick={() => toast.success('Mengembangkan navigasi Performance Phase ke Modul teraktif...')}
									style={{ fontSize: '13px' }}
								>
									<Play size={14} className="me-1.5 fill-current" /> Lanjutkan Belajar
								</Button>
								<div className="d-flex align-items-center gap-2">
									<div className="progress bg-white bg-opacity-20" style={{ width: '120px', height: '6px', borderRadius: '100px' }}>
										<div className="progress-bar bg-white" role="progressbar" style={{ width: `${progress}%` }} />
									</div>
									<span className="small fw-bold">{progress}% Selesai</span>
								</div>
							</div>
						) : (
							<Button 
								variant="light" 
								className="rounded-pill px-4 py-2.5 fw-bold text-primary"
								onClick={handleEnrollClick}
								style={{ fontSize: '13.5px' }}
							>
								Daftar Sekarang (Enroll)
							</Button>
						)}
					</div>
				</Card.Body>
			</Card>

			{/* Content Tabs Navigation */}
			<Nav className="nav-tabs custom-tabs mb-4">
				<Nav.Item>
					<Nav.Link active={activeTab === 'roadmap'} onClick={() => setActiveTab('roadmap')} className="fw-semibold px-4 py-2.5">
						Alur & Kurikulum
					</Nav.Link>
				</Nav.Item>
				<Nav.Item>
					<Nav.Link active={activeTab === 'events'} onClick={() => setActiveTab('events')} className="fw-semibold px-4 py-2.5">
						Event Terkait
					</Nav.Link>
				</Nav.Item>
				<Nav.Item>
					<Nav.Link active={activeTab === 'certifications'} onClick={() => setActiveTab('certifications')} className="fw-semibold px-4 py-2.5">
						Sertifikasi & Output
					</Nav.Link>
				</Nav.Item>
			</Nav>

			{/* Tab Content Panels */}
			<div>
				{/* TAB: ROADMAP (Alur & Kurikulum) */}
				{activeTab === 'roadmap' && (
					<div className="ps-3 border-start py-2 position-relative" style={{ borderColor: '#E2E8F0', marginLeft: '12px' }}>
						{pathData.modules.map((mod, idx) => {
							const isLocked = mod.status === 'locked';
							const isCompleted = mod.status === 'completed';
							const isCurrent = mod.status === 'in_progress';

							return (
								<div key={mod.id} className="position-relative mb-5" style={{ paddingLeft: '28px' }}>
									{/* Timeline Node Icon Indicator */}
									<div 
										className="position-absolute d-flex align-items-center justify-content-center rounded-circle border"
										style={{ 
											left: '-14px', 
											top: '0', 
											width: '28px', 
											height: '28px', 
											backgroundColor: isCompleted ? '#EFF6FF' : (isCurrent ? '#EFF6FF' : '#F1F5F9'),
											borderColor: isCompleted ? '#3B82F6' : (isCurrent ? '#3B82F6' : '#CBD5E1')
										}}
									>
										{isCompleted && <CheckCircle size={15} className="text-primary" />}
										{isCurrent && <Unlock size={14} className="text-primary" />}
										{isLocked && <Lock size={14} className="text-slate-400" />}
									</div>

									<Card className="border-0 shadow-xs" style={{ borderRadius: '12px', border: isCurrent ? '1px solid #BFDBFE' : '1px solid #E2E8F0' }}>
										<Card.Body className="p-3.5">
											<div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
												<h6 className="fw-bold mb-0 text-slate-800" style={{ fontSize: '14.5px' }}>{mod.title}</h6>
												{isLocked && (
													<OverlayTrigger placement="top" overlay={<Tooltip id={`locked-tooltip-${mod.id}`}>{mod.prereq}</Tooltip>}>
														<Badge bg="warning" className="bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-2.5 py-1 d-flex align-items-center gap-1" style={{ fontSize: '10px', cursor: 'help' }}>
															<Lock size={10} /> Terkunci
														</Badge>
													</OverlayTrigger>
												)}
												{isCompleted && (
													<Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2.5 py-1" style={{ fontSize: '10px' }}>
														Selesai
													</Badge>
												)}
												{isCurrent && (
													<Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2.5 py-1" style={{ fontSize: '10px' }}>
														Sedang Dipelajari
													</Badge>
												)}
											</div>
											<p className="text-muted small mb-3" style={{ fontSize: '12px', lineHeight: '1.6' }}>{mod.description}</p>

											{/* Lessons and activities inside Modul */}
											{!isLocked && (
												<div className="p-3 bg-light rounded-3 mb-2" style={{ backgroundColor: '#F8FAFC' }}>
													<h6 className="fw-bold text-slate-700 mb-2" style={{ fontSize: '12px' }}>Daftar Lesson (Micro-Learning)</h6>
													<div className="d-flex flex-column gap-2">
														{mod.lessons.map((lesson, lIdx) => (
															<div key={lIdx} className="d-flex align-items-center gap-2 text-slate-600" style={{ fontSize: '11.5px' }}>
																<BookOpen size={13} className="text-muted" />
																<span>{lesson}</span>
															</div>
														))}
													</div>
													
													<div className="border-top mt-3 pt-2.5 d-flex justify-content-between align-items-center flex-wrap gap-2">
														<div className="small text-slate-700 fw-medium" style={{ fontSize: '11.5px' }}>
															🎯 {mod.quiz}
														</div>
														<div className="d-flex align-items-center gap-1.5 text-info" style={{ fontSize: '11px', fontWeight: 600 }}>
															<Award size={13} /> Badge: {mod.badgeName}
														</div>
													</div>
												</div>
											)}
										</Card.Body>
									</Card>
								</div>
							);
						})}
					</div>
				)}

				{/* TAB: EVENTS (Event Terkait) */}
				{activeTab === 'events' && (
					<div>
						<h6 className="fw-bold mb-3 text-slate-800" style={{ fontSize: '14px' }}>Event Pengayaan Terintegrasi</h6>
						<p className="text-muted small mb-4" style={{ maxWidth: '640px' }}>
							Kami merekomendasikan event atau pelatihan tambahan dari kampus ini untuk memperkuat pemahaman taktis Anda.
						</p>

						<Row className="g-3">
							{pathData.events.map(event => (
								<Col key={event.id} md={6}>
									<Card className="border-0 shadow-xs h-100" style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}>
										<Card.Body className="p-3.5">
											<div className="d-flex align-items-center justify-content-between mb-2">
												<Badge bg="info" className="bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1 rounded-8" style={{ fontSize: '10px' }}>
													{event.type}
												</Badge>
												<span className="small text-muted" style={{ fontSize: '11px' }}>{event.date}</span>
											</div>
											<h6 className="fw-bold mb-1 text-slate-800" style={{ fontSize: '14px' }}>{event.title}</h6>
											<p className="text-slate-600 mb-3 small" style={{ fontSize: '12px' }}>Penyelenggara: {event.organizer}</p>
											<Button variant="outline-primary" size="sm" className="rounded-pill px-3" style={{ fontSize: '11.5px', fontWeight: 600 }}>
												Daftar Event
											</Button>
										</Card.Body>
									</Card>
								</Col>
							))}
						</Row>
					</div>
				)}

				{/* TAB: CERTIFICATIONS (Sertifikasi & Output) */}
				{activeTab === 'certifications' && (
					<Row className="g-4 align-items-center">
						<Col lg={6}>
							<h6 className="fw-bold mb-1 text-slate-800" style={{ fontSize: '14px' }}>Pemetaan Skill Radar</h6>
							<p className="text-muted small mb-4">
								Berikut perkiraan pemetaan kompetensi akhir yang akan Anda peroleh setelah lulus seluruh modul:
							</p>
							
							{/* Custom SVG Radar Chart */}
							<div className="d-flex justify-content-center p-3 rounded-4 bg-light border border-opacity-75" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
								{renderRadarChart(pathData.skills)}
							</div>
						</Col>

						<Col lg={6}>
							<h6 className="fw-bold mb-1 text-slate-800" style={{ fontSize: '14px' }}>Sertifikat Kelulusan Utama</h6>
							<p className="text-muted small mb-4">
								Setelah lulus kuis akhir dari seluruh modul pembelajaran, Anda akan berhak mengklaim sertifikat kelulusan utama:
							</p>

							{/* Certificate Template Preview */}
							<Card className="border-0 shadow-sm p-4 text-center bg-white border rounded-4" style={{ borderColor: '#E2E8F0', position: 'relative' }}>
								{/* Decorative frame border */}
								<div className="border border-double p-4" style={{ border: '4px double #CBD5E1', borderRadius: '8px' }}>
									<div className="d-flex justify-content-center gap-1.5 mb-3.5 text-primary align-items-center">
										<Award size={20} />
										<span className="small tracking-wider fw-bold text-uppercase" style={{ fontSize: '10.5px' }}>KampusX Certificate Of Excellence</span>
									</div>
									<h6 className="fw-bold mb-1 text-slate-800 text-uppercase" style={{ fontSize: '14px', letterSpacing: '0.5px' }}>
										Sertifikat Kelulusan Resmi
									</h6>
									<p className="text-muted mb-4" style={{ fontSize: '10px' }}>Diberikan secara resmi kepada:</p>
									<h5 className="fw-bold text-primary mb-1 text-decoration-underline" style={{ fontFamily: 'Georgia, serif' }}>
										[Nama Anda]
									</h5>
									<p className="text-slate-600 mb-4 small" style={{ fontSize: '11px', lineHeight: '1.5' }}>
										Telah berhasil menyelesaikan jalur kurikulum pembelajaran terakreditasi:<br />
										<strong className="text-slate-800">{pathData.title}</strong>
									</p>
									<div className="d-flex justify-content-between align-items-end mt-4">
										<div className="text-start" style={{ fontSize: '9px', color: '#64748B' }}>
											ID Verifikasi: CX-LP-VERIFY-99X<br />
											RAG/LLM Terverifikasi oleh Chintya AI
										</div>
										{/* Mock verification QR code */}
										<div className="bg-light border p-1 rounded-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: '#F8FAFC' }}>
											<div style={{ width: '38px', height: '38px', background: 'repeating-conic-gradient(#0F172A 0% 25%, transparent 0% 50%) 50% / 4px 4px' }} />
										</div>
									</div>
								</div>
							</Card>
						</Col>
					</Row>
				)}
			</div>

			{/* Interactive Forethought Phase Modal */}
			<Modal show={showEnrollModal} onHide={() => setShowEnrollModal(false)} centered style={{ borderRadius: '16px' }}>
				<Modal.Header closeButton className="border-0 pb-0">
					<Modal.Title className="d-flex align-items-center gap-2 fw-bold" style={{ fontSize: '16px', color: '#0F172A' }}>
						<Sparkles className="text-primary" size={18} />
						Rencana Belajar Anda (Forethought Phase)
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="pt-2">
					<p className="text-muted small mb-4" style={{ lineHeight: '1.6' }}>
						Sebelum memulai belajar, mari tetapkan target dan komitmen waktu Anda untuk mengoptimalkan penyerapan materi berbasis metode **Self-Regulated Learning (SRL)**.
					</p>

					<Form onSubmit={handleConfirmEnroll}>
						{/* Target Belajar */}
						<Form.Group className="mb-3.5">
							<Form.Label className="fw-semibold small text-secondary">1. Target Belajar Pribadi (Target Modul)</Form.Label>
							<div className="d-flex flex-column gap-2">
								{['Menyelesaikan 1 modul per minggu', 'Menyelesaikan 2 modul per minggu', 'Menyelesaikan 3 modul per minggu'].map(opt => (
									<Form.Check 
										key={opt}
										type="radio"
										id={`goal-${opt}`}
										name="studyGoal"
										label={opt}
										checked={studyGoal === opt}
										onChange={() => setStudyGoal(opt)}
										className="small text-slate-700"
										style={{ fontSize: '13px' }}
									/>
								))}
								<Form.Check 
									type="radio"
									id="goal-custom"
									name="studyGoal"
									label="Tentukan target sendiri..."
									checked={studyGoal === 'custom'}
									onChange={() => setStudyGoal('custom')}
									className="small text-slate-700"
									style={{ fontSize: '13px' }}
								/>
								{studyGoal === 'custom' && (
									<Form.Control 
										type="text" 
										placeholder="e.g. Menyelesaikan seluruh kurikulum dalam 1 bulan" 
										size="sm"
										className="mt-1"
										value={customGoal}
										onChange={(e) => setCustomGoal(e.target.value)}
										style={{ borderRadius: '8px' }}
									/>
								)}
							</div>
						</Form.Group>

						{/* Komitmen Waktu */}
						<Form.Group className="mb-4">
							<Form.Label className="fw-semibold small text-secondary">2. Komitmen Waktu Harian</Form.Label>
							<div className="d-flex flex-column gap-2">
								{['15 menit / hari', '30 menit / hari', '60 menit / hari'].map(opt => (
									<Form.Check 
										key={opt}
										type="radio"
										id={`time-${opt}`}
										name="timeCommitment"
										label={opt}
										checked={timeCommitment === opt}
										onChange={() => setTimeCommitment(opt)}
										className="small text-slate-700"
										style={{ fontSize: '13px' }}
									/>
								))}
								<Form.Check 
									type="radio"
									id="time-custom"
									name="timeCommitment"
									label="Tentukan waktu sendiri..."
									checked={timeCommitment === 'custom'}
									onChange={() => setTimeCommitment('custom')}
									className="small text-slate-700"
									style={{ fontSize: '13px' }}
								/>
								{timeCommitment === 'custom' && (
									<Form.Control 
										type="text" 
										placeholder="e.g. 45 menit / hari di malam hari" 
										size="sm"
										className="mt-1"
										value={customCommitment}
										onChange={(e) => setCustomCommitment(e.target.value)}
										style={{ borderRadius: '8px' }}
									/>
								)}
							</div>
						</Form.Group>

						{/* Action buttons */}
						<div className="d-flex justify-content-end gap-2 border-top pt-3">
							<Button variant="outline-secondary" size="sm" className="rounded-pill px-3" onClick={() => setShowEnrollModal(false)}>
								Batal
							</Button>
							<Button variant="primary" size="sm" className="rounded-pill px-4 fw-bold" type="submit">
								Mulai Belajar
							</Button>
						</div>
					</Form>
				</Modal.Body>
			</Modal>

			<style>{`
				.custom-tabs .nav-link {
					border: 0;
					color: #64748B;
					border-bottom: 2px solid transparent;
					transition: all 0.2s;
				}
				.custom-tabs .nav-link:hover {
					color: #0F172A;
					border-bottom: 2px solid #CBD5E1;
				}
				.custom-tabs .nav-link.active {
					color: #3B82F6;
					border-bottom: 2px solid #3B82F6;
				}
				.shadow-xs {
					box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
				}
				.animated {
					animation-duration: 0.3s;
					animation-fill-mode: both;
				}
				@keyframes fadeIn {
					from { opacity: 0; transform: translateY(4px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.fadeIn {
					animation-name: fadeIn;
				}
			`}</style>
		</Container>
	);
};

export default LearningPathDetail;
