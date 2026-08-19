import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Badge, InputGroup, Button } from 'react-bootstrap';
import { Search, Flame, Award, Clock, BookOpen, BarChart, MapPin, GraduationCap, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const LEARNING_PATHS_DATA = [
	{
		id: 1,
		slug: 'mastering-frontend-web-development',
		title: 'Mastering Frontend Web Development',
		description: 'Pelajari dasar HTML/CSS, JavaScript modern, hingga framework React untuk membangun aplikasi web interaktif.',
		modulesCount: 12,
		durationHours: 24,
		level: 'Pemula',
		badgeIcon: 'Award',
		matchPercentage: 98,
		matchReason: 'Sesuai dengan prodi Teknik Informatika & minat Pengembangan Web kamu.',
		prodi: 'Teknik Informatika',
		campus: 'Kampus Jakarta (Pusat)',
		category: 'Pengembangan Web',
		imageBg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
	},
	{
		id: 2,
		slug: 'introduction-to-artificial-intelligence',
		title: 'Introduction to Artificial Intelligence',
		description: 'Pahami dasar machine learning, neural networks, dan cara mengintegrasikan AI ke dalam aplikasi bisnis.',
		modulesCount: 8,
		durationHours: 16,
		level: 'Menengah',
		badgeIcon: 'Sparkles',
		matchPercentage: 95,
		matchReason: 'Sesuai dengan minat Kecerdasan Buatan / AI Anda.',
		prodi: 'Teknik Informatika',
		campus: 'Kampus Bandung (Regional)',
		category: 'Kecerdasan Buatan / AI',
		imageBg: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)'
	},
	{
		id: 3,
		slug: 'ui-ux-design-masterclass',
		title: 'UI/UX Design Masterclass',
		description: 'Kuasai user research, wireframing, prototyping di Figma, hingga usability testing untuk menciptakan desain premium.',
		modulesCount: 10,
		durationHours: 20,
		level: 'Pemula',
		badgeIcon: 'Award',
		matchPercentage: 92,
		matchReason: 'Sesuai dengan minat Desain UI/UX Anda.',
		prodi: 'Desain Komunikasi Visual (DKV)',
		campus: 'Kampus Jakarta (Pusat)',
		category: 'Desain UI/UX',
		imageBg: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)'
	},
	{
		id: 4,
		slug: 'cyber-security-fundamentals',
		title: 'Cyber Security Fundamentals',
		description: 'Pelajari konsep enkripsi, network security, penetration testing dasar, dan cara melindungi data digital.',
		modulesCount: 6,
		durationHours: 12,
		level: 'Mahir',
		badgeIcon: 'Award',
		matchPercentage: 88,
		matchReason: 'Mendukung kompetensi keamanan jaringan Anda.',
		prodi: 'Sistem Informasi',
		campus: 'Kampus Surabaya (Regional)',
		category: 'Cyber Security',
		imageBg: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)'
	}
];

const LearningPathsCatalog = () => {
	const { user: authUser } = useAuth();
	const navigate = useNavigate();

	// Search & Filter States
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedProdi, setSelectedProdi] = useState('');
	const [selectedCampus, setSelectedCampus] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('');
	const [selectedStatus, setSelectedStatus] = useState('');
	const [sortBy, setSortBy] = useState('recommended');
	const [showFilters, setShowFilters] = useState(false);

	// Enrollment states from localStorage
	const [enrolledPaths, setEnrolledPaths] = useState({});

	useEffect(() => {
		const storedEnrolled = {};
		LEARNING_PATHS_DATA.forEach(path => {
			const isEnrolled = localStorage.getItem(`enrolled_${path.slug}`) === 'true';
			if (isEnrolled) {
				const progress = localStorage.getItem(`progress_${path.slug}`) || '0';
				storedEnrolled[path.slug] = parseInt(progress, 10);
			}
		});
		setEnrolledPaths(storedEnrolled);
	}, []);

	// Filter & Sort Logic
	const filteredPaths = LEARNING_PATHS_DATA.filter(path => {
		const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
			path.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesProdi = !selectedProdi || path.prodi === selectedProdi;
		const matchesCampus = !selectedCampus || path.campus === selectedCampus;
		const matchesCategory = !selectedCategory || path.category === selectedCategory;
		
		const isEnrolled = enrolledPaths[path.slug] !== undefined;
		const isCompleted = enrolledPaths[path.slug] === 100;
		const matchesStatus = !selectedStatus || 
			(selectedStatus === 'enrolled' && isEnrolled && !isCompleted) ||
			(selectedStatus === 'completed' && isCompleted) ||
			(selectedStatus === 'not_enrolled' && !isEnrolled);

		return matchesSearch && matchesProdi && matchesCampus && matchesCategory && matchesStatus;
	}).sort((a, b) => {
		if (sortBy === 'recommended') return b.matchPercentage - a.matchPercentage;
		if (sortBy === 'duration') return b.durationHours - a.durationHours;
		if (sortBy === 'title') return a.title.localeCompare(b.title);
		return 0;
	});

	// AI recommended carousel filter (match percentage >= 90%)
	const aiRecommendedPaths = LEARNING_PATHS_DATA.filter(path => path.matchPercentage >= 90);

	return (
		<Container className="py-4 py-md-5 animate-fade-in">
			{/* Header & AI Greeting Banner */}
			<Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#F8FAFC' }}>
				<Card.Body className="p-4 p-md-5 position-relative overflow-hidden">
					{/* Decorative blur rings */}
					<div className="position-absolute rounded-circle bg-primary opacity-10 blur-3xl" style={{ width: '300px', height: '300px', top: '-100px', right: '-100px', filter: 'blur(80px)' }} />
					<div className="position-absolute rounded-circle bg-info opacity-10 blur-3xl" style={{ width: '200px', height: '200px', bottom: '-80px', left: '-80px', filter: 'blur(60px)' }} />
					
					<Row className="align-items-center position-relative" style={{ zIndex: 1 }}>
						<Col lg={7}>
							<div className="d-flex align-items-center gap-2 mb-2.5">
								<Sparkles size={16} className="text-warning animate-pulse" />
								<span className="small text-uppercase tracking-wider fw-bold text-info" style={{ letterSpacing: '1px' }}>
									Chintya AI Engine
								</span>
							</div>
							<h3 className="fw-bold mb-2 text-white">
								Halo, {authUser?.name || 'Member'}!
							</h3>
							<p className="mb-0 text-slate-300 small" style={{ maxWidth: '540px', color: '#94A3B8', fontSize: '13.5px', lineHeight: '1.6' }}>
								Berikut rekomendasi jalur belajar yang telah disesuaikan dengan program studi, lokasi kampus, dan minat topik Anda hari ini.
							</p>
						</Col>
						
						<Col lg={5} className="mt-4 mt-lg-0">
							<Row className="g-3">
								<Col xs={6}>
									<Card className="border-0 bg-white bg-opacity-10 text-white rounded-12 h-100">
										<Card.Body className="p-3 text-center">
											<Flame className="text-warning mb-2" size={24} />
											<h5 className="fw-bold mb-0">5 Hari</h5>
											<span className="text-muted small" style={{ fontSize: '11px', color: '#CBD5E1' }}>Learning Streak</span>
										</Card.Body>
									</Card>
								</Col>
								<Col xs={6}>
									<Card className="border-0 bg-white bg-opacity-10 text-white rounded-12 h-100">
										<Card.Body className="p-3 text-center">
											<Award className="text-info mb-2" size={24} />
											<h5 className="fw-bold mb-0">12</h5>
											<span className="text-muted small" style={{ fontSize: '11px', color: '#CBD5E1' }}>Badge Kompetensi</span>
										</Card.Body>
									</Card>
								</Col>
							</Row>
						</Col>
					</Row>
				</Card.Body>
			</Card>

			{/* Search & Filter Bar */}
			<div className="mb-4">
				<Row className="g-3 align-items-center">
					<Col md={8} lg={9}>
						<InputGroup className="shadow-sm border rounded-3 bg-white overflow-hidden">
							<InputGroup.Text className="bg-white border-0 ps-3">
								<Search size={18} className="text-muted" />
							</InputGroup.Text>
							<Form.Control 
								type="text" 
								placeholder="Cari Learning Path (e.g. Frontend, AI)..." 
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="border-0 shadow-none ps-1 py-2.5"
								style={{ fontSize: '14px' }}
							/>
							<Button 
								variant="none"
								className="border-0 text-muted px-3 d-flex align-items-center gap-1.5"
								onClick={() => setShowFilters(!showFilters)}
								style={{ borderLeft: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 500 }}
							>
								<SlidersHorizontal size={15} />
								Filter
							</Button>
						</InputGroup>
					</Col>
					<Col md={4} lg={3}>
						<Form.Select 
							value={sortBy} 
							onChange={(e) => setSortBy(e.target.value)}
							className="shadow-sm border py-2.5"
							style={{ borderRadius: '8px', fontSize: '13.5px', fontWeight: 500 }}
						>
							<option value="recommended">Direkomendasikan AI</option>
							<option value="duration">Total Jam Terbanyak</option>
							<option value="title">Abjad (A-Z)</option>
						</Form.Select>
					</Col>
				</Row>

				{/* Collapsible Filter Bar */}
				{showFilters && (
					<Card className="border-0 shadow-sm mt-3 animate-fade-in" style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}>
						<Card.Body className="p-3">
							<Row className="g-3">
								<Col sm={6} md={3}>
									<Form.Label className="fw-semibold small text-secondary">Program Studi</Form.Label>
									<Form.Select size="sm" value={selectedProdi} onChange={(e) => setSelectedProdi(e.target.value)}>
										<option value="">Semua Prodi</option>
										<option value="Teknik Informatika">Teknik Informatika</option>
										<option value="Sistem Informasi">Sistem Informasi</option>
										<option value="Desain Komunikasi Visual (DKV)">DKV</option>
									</Form.Select>
								</Col>
								<Col sm={6} md={3}>
									<Form.Label className="fw-semibold small text-secondary">Lokasi Kampus</Form.Label>
									<Form.Select size="sm" value={selectedCampus} onChange={(e) => setSelectedCampus(e.target.value)}>
										<option value="">Semua Kampus</option>
										<option value="Kampus Jakarta (Pusat)">Kampus Jakarta</option>
										<option value="Kampus Bandung (Regional)">Kampus Bandung</option>
										<option value="Kampus Surabaya (Regional)">Kampus Surabaya</option>
									</Form.Select>
								</Col>
								<Col sm={6} md={3}>
									<Form.Label className="fw-semibold small text-secondary">Kategori Minat</Form.Label>
									<Form.Select size="sm" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
										<option value="">Semua Minat</option>
										<option value="Pengembangan Web">Pengembangan Web</option>
										<option value="Kecerdasan Buatan / AI">Kecerdasan Buatan / AI</option>
										<option value="Desain UI/UX">Desain UI/UX</option>
										<option value="Cyber Security">Cyber Security</option>
									</Form.Select>
								</Col>
								<Col sm={6} md={3}>
									<Form.Label className="fw-semibold small text-secondary">Status Kelas</Form.Label>
									<Form.Select size="sm" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
										<option value="">Semua Status</option>
										<option value="not_enrolled">Belum Diikuti</option>
										<option value="enrolled">Sedang Diikuti</option>
										<option value="completed">Selesai</option>
									</Form.Select>
								</Col>
							</Row>
						</Card.Body>
					</Card>
				)}
			</div>

			{/* AI Recommended Section */}
			<div className="mb-5">
				<div className="d-flex align-items-center gap-2 mb-3">
					<Sparkles size={18} className="text-primary animate-pulse" />
					<h5 className="fw-bold mb-0 text-slate-800" style={{ letterSpacing: '-0.3px' }}>AI Recommended Paths</h5>
				</div>
				
				<div className="d-flex gap-3 overflow-auto pb-3 horizontal-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
					{aiRecommendedPaths.map(path => (
						<Card 
							key={path.id} 
							className="border-0 shadow-sm flex-shrink-0 cursor-pointer card-hover" 
							style={{ width: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}
							onClick={() => navigate(`/learning-paths/${path.slug}`)}
						>
							<div style={{ background: path.imageBg, height: '100px', padding: '15px' }} className="position-relative d-flex align-items-end">
								<Badge bg="success" className="position-absolute top-0 end-0 m-3 shadow-sm bg-opacity-95 rounded-pill px-2.5 py-1.5 fw-bold" style={{ fontSize: '11px' }}>
									{path.matchPercentage}% Match
								</Badge>
								<h6 className="fw-bold text-white mb-0 text-truncate" style={{ maxWidth: '200px' }}>{path.category}</h6>
							</div>
							<Card.Body className="p-3">
								<h6 className="fw-bold mb-1 text-slate-800 text-truncate" style={{ fontSize: '14px' }}>{path.title}</h6>
								<p className="text-muted small mb-2 text-truncate-2" style={{ fontSize: '11.5px', height: '34px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
									{path.matchReason}
								</p>
								<div className="d-flex align-items-center gap-3 text-muted small" style={{ fontSize: '11px' }}>
									<span className="d-flex align-items-center gap-1"><BookOpen size={13} /> {path.modulesCount} Modul</span>
									<span className="d-flex align-items-center gap-1"><Clock size={13} /> {path.durationHours} Jam</span>
								</div>
							</Card.Body>
						</Card>
					))}
				</div>
			</div>

			{/* Main Catalog Grid */}
			<div>
				<h5 className="fw-bold mb-3 text-slate-800" style={{ letterSpacing: '-0.3px' }}>Katalog Learning Path</h5>
				
				{filteredPaths.length > 0 ? (
					<Row className="g-4">
						{filteredPaths.map(path => {
							const progress = enrolledPaths[path.slug];
							const isEnrolled = progress !== undefined;
							
							return (
								<Col key={path.id} md={6} lg={4}>
									<Card 
										className="h-100 border-0 shadow-sm cursor-pointer card-hover" 
										style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}
										onClick={() => navigate(`/learning-paths/${path.slug}`)}
									>
										{/* Banner */}
										<div style={{ background: path.imageBg, height: '140px', padding: '20px' }} className="d-flex flex-column justify-content-between position-relative">
											<div className="d-flex justify-content-between align-items-start">
												<Badge bg="white" text="dark" className="px-2.5 py-1.5 shadow-xs rounded-8" style={{ fontSize: '10px', fontWeight: 600 }}>
													{path.level}
												</Badge>
												
												<Badge bg="primary" className="bg-opacity-95 shadow-sm rounded-pill px-2.5 py-1.5" style={{ fontSize: '10.5px' }}>
													{path.matchPercentage}% Match
												</Badge>
											</div>
											<div>
												<Badge bg="white" className="bg-opacity-10 text-white border border-white border-opacity-25 px-2 rounded-pill" style={{ fontSize: '9.5px', fontWeight: 500 }}>
													{path.category}
												</Badge>
											</div>
										</div>

										<Card.Body className="p-4 d-flex flex-column justify-content-between">
											<div>
												<h6 className="fw-bold mb-2 text-slate-800" style={{ fontSize: '15px', lineHeight: '1.4' }}>
													{path.title}
												</h6>
												<p className="text-muted small mb-3" style={{ fontSize: '12px', lineHeight: '1.6', height: '58px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
													{path.description}
												</p>

												{/* Tag Personal */}
												<div className="d-flex flex-wrap gap-1.5 mb-4">
													<Badge bg="light" text="dark" className="d-flex align-items-center gap-1 rounded-6 text-slate-600 px-2 py-1" style={{ fontSize: '10px', fontWeight: 500 }}>
														<GraduationCap size={12} className="text-muted" /> {path.prodi}
													</Badge>
													<Badge bg="light" text="dark" className="d-flex align-items-center gap-1 rounded-6 text-slate-600 px-2 py-1" style={{ fontSize: '10px', fontWeight: 500 }}>
														<MapPin size={12} className="text-muted" /> {path.campus.split(' ')[0] + ' ' + path.campus.split(' ')[1]}
													</Badge>
												</div>
											</div>

											{/* Bottom Meta & CTA */}
											<div className="border-top pt-3" style={{ borderColor: '#F1F5F9' }}>
												<div className="d-flex justify-content-between align-items-center mb-3">
													<div className="d-flex gap-3 text-muted small" style={{ fontSize: '11px' }}>
														<span className="d-flex align-items-center gap-1"><BookOpen size={13} /> {path.modulesCount} Modul</span>
														<span className="d-flex align-items-center gap-1"><Clock size={13} /> {path.durationHours} Jam</span>
													</div>
													
													{/* Badge preview placeholder */}
													<OverlayTriggerBadgePreview />
												</div>

												{isEnrolled ? (
													<div>
														<div className="d-flex justify-content-between align-items-center mb-1">
															<span className="small fw-semibold text-primary" style={{ fontSize: '11px' }}>Sedang Diikuti</span>
															<span className="small text-slate-700" style={{ fontSize: '11px', fontWeight: 600 }}>{progress}%</span>
														</div>
														<div className="progress" style={{ height: '6px', borderRadius: '100px', backgroundColor: '#E2E8F0' }}>
															<div 
																className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
																role="progressbar" 
																style={{ width: `${progress}%` }}
																aria-valuenow={progress} 
																aria-valuemin="0" 
																aria-valuemax="100"
															/>
														</div>
													</div>
												) : (
													<div className="d-grid">
														<Button 
															variant="outline-primary" 
															size="sm" 
															className="rounded-pill fw-bold"
															style={{ fontSize: '12px', padding: '6px 12px' }}
														>
															Lihat Detail
														</Button>
													</div>
												)}
											</div>
										</Card.Body>
									</Card>
								</Col>
							);
						})}
					</Row>
				) : (
					<div className="text-center py-5 border border-dashed rounded-3" style={{ backgroundColor: '#F9FAFB', borderColor: '#CBD5E1' }}>
						<span className="text-muted small">Tidak menemukan learning path yang cocok dengan kriteria pencarian Anda.</span>
					</div>
				)}
			</div>
			
			<style>{`
				.card-hover {
					transition: all 0.2s ease-in-out;
				}
				.card-hover:hover {
					transform: translateY(-4px);
					box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04) !important;
				}
				.text-truncate-2 {
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
				}
				.horizontal-scrollbar::-webkit-scrollbar {
					display: none;
				}
			`}</style>
		</Container>
	);
};

// Mini helper to display a tiny badge template preview
const OverlayTriggerBadgePreview = () => (
	<div className="d-flex align-items-center gap-1 text-slate-700 font-semibold" style={{ fontSize: '11px' }}>
		<Badge bg="info" className="bg-opacity-10 text-info border border-info border-opacity-25 p-1 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '18px', height: '18px' }}>
			<Award size={10} />
		</Badge>
		<span className="small text-muted" style={{ fontSize: '10px' }}>+Sertifikat</span>
	</div>
);

export default LearningPathsCatalog;
