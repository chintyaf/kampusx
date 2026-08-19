import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { Cpu, Users, Plus, X, HelpCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const AVAILABLE_PROGRAMS = [
	'Teknik Informatika',
	'Sistem Informasi',
	'Teknik Elektro',
	'Teknik Industri',
	'Manajemen',
	'Akuntansi',
	'Psikologi',
	'Ilmu Komunikasi',
	'Hukum',
	'Kedokteran',
	'Desain Komunikasi Visual (DKV)',
	'Hubungan Internasional',
	'Sastra Inggris'
];

const POPULAR_COURSES = [
	'Kalkulus I',
	'Kalkulus II',
	'Aljabar Linear',
	'Struktur Data',
	'Algoritma Pemrograman',
	'Pengantar Basis Data',
	'Sistem Operasi',
	'Jaringan Komputer',
	'Kecerdasan Buatan Dasar',
	'Interaksi Manusia & Komputer',
	'Metode Penelitian',
	'Fisika Dasar',
	'Dasar Manajemen',
	'Akuntansi Pengantar',
	'Psikologi Sosial',
	'Teori Komunikasi'
];

// Custom Combobox / Searchable Dropdown Component
const SearchableDropdown = ({ value, onChange, options, placeholder, optionLabelKey = 'name', optionValueKey = 'id' }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const containerRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const getLabel = (opt) => {
		if (typeof opt === 'string') return opt;
		return opt[optionLabelKey] || '';
	};

	const getValue = (opt) => {
		if (typeof opt === 'string') return opt;
		return opt[optionValueKey];
	};

	const filteredOptions = options.filter(opt => {
		const label = getLabel(opt);
		return label.toLowerCase().includes(searchQuery.toLowerCase());
	});

	// Find selected label for display
	const selectedOpt = options.find(opt => getValue(opt) === value);
	const displayValue = selectedOpt ? getLabel(selectedOpt) : (typeof value === 'string' ? value : '');

	return (
		<div className="position-relative" ref={containerRef}>
			<Form.Control 
				type="text" 
				placeholder={placeholder}
				value={isOpen ? searchQuery : displayValue}
				onChange={(e) => {
					if (!isOpen) setIsOpen(true);
					setSearchQuery(e.target.value);
				}}
				onFocus={() => {
					setIsOpen(true);
					setSearchQuery('');
				}}
				style={{ borderRadius: '8px', cursor: 'pointer', paddingRight: '30px' }}
				className="bg-white border shadow-sm"
			/>
			<span 
				className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted pointer-events-none" 
				style={{ 
					pointerEvents: 'none', 
					borderTop: '4px solid #64748B', 
					borderRight: '4px solid transparent', 
					borderLeft: '4px solid transparent', 
					width: 0, 
					height: 0 
				}}
			/>
			{isOpen && (
				<div 
					className="position-absolute w-100 bg-white border rounded-3 shadow-lg mt-1 overflow-hidden" 
					style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
				>
					{filteredOptions.length > 0 ? (
						filteredOptions.map(opt => (
							<div 
								key={getValue(opt)}
								className="px-3 py-2 cursor-pointer hover-bg-light"
								style={{ cursor: 'pointer', fontSize: '13px' }}
								onClick={() => {
									onChange(getValue(opt));
									setSearchQuery('');
									setIsOpen(false);
								}}
							>
								{getLabel(opt)}
							</div>
						))
					) : (
						<div className="px-3 py-2 text-muted small">Tidak ditemukan hasil</div>
					)}
				</div>
			)}
		</div>
	);
};

const PreferencesSection = ({ profileData, setProfileData, allCategories, institutions, backendSaveStatus }) => {
	const [studyProgram, setStudyProgram] = useState('');
	const [learningHistory, setLearningHistory] = useState([]);
	const [customTopics, setCustomTopics] = useState([]);
	
	const [historyInput, setHistoryInput] = useState('');
	const [showSuggestions, setShowSuggestions] = useState(false);
	const suggestionRef = useRef(null);

	const [customTopicInput, setCustomTopicInput] = useState('');
	const [showCustomTopicForm, setShowCustomTopicForm] = useState(false);

	const [showAIInfo, setShowAIInfo] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);
	const [localStorageSaveStatus, setLocalStorageSaveStatus] = useState('saved'); // 'saved' | 'saving'

	// Load local states from localStorage on mount
	useEffect(() => {
		const storedProgram = localStorage.getItem('learn_study_program') || '';
		
		let storedHistory = [];
		try {
			storedHistory = JSON.parse(localStorage.getItem('learn_history')) || [];
		} catch (e) {
			storedHistory = [];
		}

		let storedCustomTopics = [];
		try {
			storedCustomTopics = JSON.parse(localStorage.getItem('learn_custom_topics')) || [];
		} catch (e) {
			storedCustomTopics = [];
		}

		setStudyProgram(storedProgram);
		setLearningHistory(storedHistory);
		setCustomTopics(storedCustomTopics);
		setIsLoaded(true);
	}, []);

	// Auto-save local states to localStorage
	useEffect(() => {
		if (!isLoaded) return;
		
		setLocalStorageSaveStatus('saving');
		const timer = setTimeout(() => {
			localStorage.setItem('learn_study_program', studyProgram);
			localStorage.setItem('learn_history', JSON.stringify(learningHistory));
			localStorage.setItem('learn_custom_topics', JSON.stringify(customTopics));
			setLocalStorageSaveStatus('saved');
		}, 800);

		return () => clearTimeout(timer);
	}, [studyProgram, learningHistory, customTopics, isLoaded]);

	// Suggestions for learning history search
	const filteredSuggestions = POPULAR_COURSES.filter(course => 
		course.toLowerCase().includes(historyInput.toLowerCase()) &&
		!learningHistory.includes(course)
	);

	// Click outside suggestions list to close it
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
				setShowSuggestions(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleAddHistory = (courseName) => {
		const trimmed = courseName.trim();
		if (!trimmed) return;
		if (learningHistory.includes(trimmed)) {
			toast.error('Materi/kursus sudah terdaftar di riwayat.');
			return;
		}
		setLearningHistory([...learningHistory, trimmed]);
		setHistoryInput('');
		setShowSuggestions(false);
	};

	const handleRemoveHistory = (item) => {
		setLearningHistory(learningHistory.filter(h => h !== item));
	};

	const toggleTopic = (catId) => {
		const isSelected = profileData.categories.some(c => c.id === catId);
		let newCategories;
		if (isSelected) {
			newCategories = profileData.categories.filter(c => c.id !== catId);
		} else {
			const catToAdd = allCategories.find(c => c.id === catId);
			newCategories = [...profileData.categories, catToAdd];
		}
		setProfileData({ ...profileData, categories: newCategories });
	};

	const toggleCustomTopic = (topicName) => {
		if (customTopics.includes(topicName)) {
			setCustomTopics(customTopics.filter(t => t !== topicName));
		} else {
			setCustomTopics([...customTopics, topicName]);
		}
	};

	const handleAddCustomTopic = (e) => {
		e.preventDefault();
		const trimmed = customTopicInput.trim();
		if (!trimmed) return;

		// Check if already exists in categories or custom topics
		const existsInCategories = allCategories.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
		const existsInCustom = customTopics.some(t => t.toLowerCase() === trimmed.toLowerCase());

		if (existsInCategories || existsInCustom) {
			toast.error('Topik sudah terdaftar.');
			return;
		}

		setCustomTopics([...customTopics, trimmed]);
		setCustomTopicInput('');
		setShowCustomTopicForm(false);
	};

	// Determine unified save status
	const isSaving = backendSaveStatus === 'saving' || localStorageSaveStatus === 'saving';

	return (
		<div>
			{/* Top Header & Status */}
			<div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
				<div className="d-flex align-items-center gap-2">
					<h5 className="fw-bold mb-0" style={{ color: '#0F172A' }}>Preferensi Saya</h5>
					<Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill animate-fade-in" style={{ fontSize: '10.5px' }}>
						✓ Personalisasi Aktif
					</Badge>
				</div>
				
				{/* Auto-Save status indicator */}
				<div className="d-flex align-items-center gap-1.5 small text-muted">
					{isSaving ? (
						<>
							<Spinner animation="border" size="sm" variant="secondary" className="me-1" style={{ width: '12px', height: '12px', borderWidth: '1.5px' }} />
							<span style={{ fontSize: '12.5px' }}>Menyimpan otomatis...</span>
						</>
					) : (
						<>
							<Check size={14} className="text-success" />
							<span style={{ fontSize: '12.5px' }}>Tersimpan otomatis</span>
						</>
					)}
				</div>
			</div>
			
			<p className="text-muted small mb-3" style={{ maxWidth: '640px' }}>
				Atur minat dan latar belakang Anda agar KampusX dapat menyajikan rekomendasi event, modul, dan materi yang paling sesuai.
			</p>

			{/* Collapsible AI info explainer */}
			<div className="mb-4">
				<button 
					type="button"
					className="btn btn-link p-0 text-decoration-none small d-flex align-items-center gap-1.5"
					style={{ color: '#0284C7', fontSize: '12.5px', fontWeight: 500 }}
					onClick={() => setShowAIInfo(!showAIInfo)}
				>
					<HelpCircle size={15} />
					{showAIInfo ? 'Sembunyikan penjelasan AI' : 'Bagaimana data ini melatih AI rekomendasi?'}
				</button>

				{showAIInfo && (
					<Row className="g-3 mt-1 animated fadeIn">
						<Col md={6}>
							<Card className="h-100 border-0" style={{ backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '12px' }}>
								<Card.Body className="p-3.5">
									<div className="d-flex align-items-center gap-2 mb-2 text-primary">
										<Cpu size={18} />
										<h6 className="fw-bold mb-0" style={{ fontSize: '13px' }}>Content-Based Filtering</h6>
									</div>
									<p className="mb-0 text-secondary" style={{ fontSize: '12px', lineHeight: '1.5' }}>
										AI menganalisis <strong>Topik Minat</strong> dan <strong>Riwayat Belajar</strong> Anda untuk menyarankan modul pembelajaran dengan materi serupa.
									</p>
								</Card.Body>
							</Card>
						</Col>
						<Col md={6}>
							<Card className="h-100 border-0" style={{ backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '12px' }}>
								<Card.Body className="p-3.5">
									<div className="d-flex align-items-center gap-2 mb-2" style={{ color: '#7C3AED' }}>
										<Users size={18} />
										<h6 className="fw-bold mb-0" style={{ fontSize: '13px' }}>Collaborative Filtering</h6>
									</div>
									<p className="mb-0 text-secondary" style={{ fontSize: '12px', lineHeight: '1.5' }}>
										AI memetakan preferensi rekan sejurusan dari <strong>Program Studi</strong> dan <strong>Lokasi Kampus</strong> yang sama untuk merekomendasikan event tren lokal.
									</p>
								</Card.Body>
							</Card>
						</Col>
					</Row>
				)}
			</div>

			<div className="border-top pt-4" style={{ borderColor: '#E2E8F0' }}>
				{/* Block 1: Latar Belakang Akademis */}
				<div className="mb-4 pb-2">
					<h6 className="fw-bold mb-3" style={{ color: '#334155', fontSize: '14px', letterSpacing: '0.3px' }}>
						1. LATAR BELAKANG AKADEMIS
					</h6>
					<Row>
						<Form.Group as={Col} md="6" className="mb-3 mb-md-0">
							<Form.Label className="fw-semibold small text-secondary">Program Studi</Form.Label>
							<SearchableDropdown 
								value={studyProgram}
								onChange={setStudyProgram}
								options={AVAILABLE_PROGRAMS}
								placeholder="Cari & Pilih Program Studi..."
							/>
						</Form.Group>
						
						<Form.Group as={Col} md="6">
							<Form.Label className="fw-semibold small text-secondary">Lokasi Kampus / Universitas</Form.Label>
							<SearchableDropdown 
								value={profileData.university_id}
								onChange={(val) => setProfileData({ ...profileData, university_id: val })}
								options={institutions}
								placeholder="Cari & Pilih Lokasi Kampus..."
								optionLabelKey="name"
								optionValueKey="id"
							/>
						</Form.Group>
					</Row>
				</div>

				{/* Block 2: Topik & Kategori Minat */}
				<div className="mb-4 pb-2 border-top pt-4" style={{ borderColor: '#F1F5F9' }}>
					<h6 className="fw-bold mb-1" style={{ color: '#334155', fontSize: '14px', letterSpacing: '0.3px' }}>
						2. TOPIK & KATEGORI MINAT
					</h6>
					<p className="text-muted mb-3" style={{ fontSize: '12px' }}>
						Pilih topik yang ingin Anda ikuti (untuk Event & Modul Belajar):
					</p>

					<div className="d-flex flex-wrap gap-2 align-items-center mt-1">
						{/* Database Event Categories */}
						{allCategories.map(cat => {
							const isSelected = profileData.categories.some(c => c.id === cat.id);
							return (
								<Button
									key={cat.id}
									variant="none"
									onClick={() => toggleTopic(cat.id)}
									style={{
										fontSize: '12px',
										padding: '6px 14px',
										borderRadius: '100px',
										fontWeight: 500,
										backgroundColor: isSelected ? '#EFF6FF' : '#F1F5F9',
										color: isSelected ? '#1D4ED8' : '#475569',
										border: isSelected ? '1px solid #93C5FD' : '1px solid #E2E8F0',
										transition: 'all 0.15s ease',
										boxShadow: isSelected ? 'none' : '0 1px 2px rgba(0,0,0,0.02)'
									}}
								>
									{isSelected ? '✓ ' : '+ '} {cat.name}
								</Button>
							);
						})}
						{/* Custom added topics */}
						{customTopics.map(topic => (
							<Button
								key={topic}
								variant="none"
								onClick={() => toggleCustomTopic(topic)}
								style={{
									fontSize: '12px',
									padding: '6px 14px',
									borderRadius: '100px',
									fontWeight: 500,
									backgroundColor: '#EFF6FF',
									color: '#1D4ED8',
									border: '1px solid #93C5FD',
									transition: 'all 0.15s ease'
								}}
							>
								✓ {topic}
							</Button>
						))}

						{/* Custom topic form inside inline pill */}
						{!showCustomTopicForm ? (
							<Button
								variant="none"
								onClick={() => setShowCustomTopicForm(true)}
								style={{
									fontSize: '12px',
									padding: '5px 14px',
									borderRadius: '100px',
									fontWeight: 500,
									backgroundColor: '#FFFFFF',
									color: '#0284C7',
									border: '1px dashed #0284C7',
									transition: 'all 0.15s ease'
								}}
							>
								+ Tambah Topik
							</Button>
						) : (
							<div className="d-flex gap-1.5 align-items-center" style={{ maxWidth: '280px' }}>
								<Form.Control 
									type="text"
									placeholder="Topik kustom..."
									size="sm"
									value={customTopicInput}
									onChange={(e) => setCustomTopicInput(e.target.value)}
									style={{ borderRadius: '100px', fontSize: '12px', padding: '4px 12px', width: '130px' }}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											handleAddCustomTopic(e);
										}
									}}
								/>
								<Button 
									variant="primary" 
									size="sm" 
									onClick={handleAddCustomTopic}
									style={{ borderRadius: '100px', fontSize: '11px', padding: '3px 10px' }}
								>
									Tambah
								</Button>
								<Button 
									variant="outline-secondary" 
									size="sm"
									onClick={() => setShowCustomTopicForm(false)}
									style={{ borderRadius: '100px', fontSize: '11px', padding: '3px 10px' }}
								>
									Batal
								</Button>
							</div>
						)}
					</div>
				</div>

				{/* Block 3: Riwayat & Fokus Belajar */}
				<div className="mb-4 pb-2 border-top pt-4" style={{ borderColor: '#F1F5F9' }}>
					<div className="d-flex align-items-center gap-2 mb-1">
						<h6 className="fw-bold mb-0" style={{ color: '#334155', fontSize: '14px', letterSpacing: '0.3px' }}>
							3. RIWAYAT & FOKUS BELAJAR
						</h6>
						<Badge bg="secondary" className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-0.5 rounded-pill" style={{ fontSize: '10px', fontWeight: 500 }}>
							Opsional
						</Badge>
					</div>
					<p className="text-muted mb-3" style={{ fontSize: '12px' }}>
						Mata kuliah atau pelatihan yang pernah/sedang Anda ambil:
					</p>
					
					{/* Auto-complete / Search Input */}
					<div className="d-flex gap-2 mb-2" ref={suggestionRef}>
						<div className="position-relative flex-grow-1">
							<Form.Control 
								type="text" 
								placeholder="Cari atau ketik judul mata kuliah/kursus... (e.g. Kalkulus I)" 
								value={historyInput}
								onChange={(e) => {
									setHistoryInput(e.target.value);
									setShowSuggestions(true);
								}}
								onFocus={() => setShowSuggestions(true)}
								style={{ borderRadius: '8px' }}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleAddHistory(historyInput);
									}
								}}
							/>
							{/* Suggestions Dropdown list */}
							{showSuggestions && historyInput.trim().length > 0 && filteredSuggestions.length > 0 && (
								<div 
									className="position-absolute w-100 bg-white border rounded-3 shadow-lg mt-1 overflow-hidden" 
									style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
								>
									{filteredSuggestions.map(course => (
										<div 
											key={course}
											className="px-3 py-2 cursor-pointer hover-bg-light"
											style={{ cursor: 'pointer', fontSize: '13px' }}
											onClick={() => handleAddHistory(course)}
										>
											{course}
										</div>
									))}
								</div>
							)}
						</div>
						<Button 
							variant="outline-primary" 
							onClick={() => handleAddHistory(historyInput)}
							className="d-flex align-items-center justify-content-center px-3"
							style={{ borderRadius: '8px' }}
						>
							<Plus size={18} />
						</Button>
					</div>
					
					{/* Helper text below input */}
					<div className="text-muted mb-3" style={{ fontSize: '11px' }}>
						*Ketik judul mata kuliah/kursus lalu tekan Enter atau tombol (+) untuk menyimpan di riwayat.
					</div>

					{/* Tag Gallery */}
					{learningHistory.length > 0 && (
						<div 
							className="p-3 rounded-3 d-flex flex-wrap gap-2 border"
							style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
						>
							{learningHistory.map(item => (
								<Badge 
									key={item} 
									bg="white" 
									text="dark"
									className="px-3 py-2 border rounded-pill d-inline-flex align-items-center gap-2 fw-normal shadow-xs"
									style={{ borderColor: '#CBD5E1', color: '#334155' }}
								>
									<span>{item}</span>
									<X 
										size={14} 
										className="text-muted cursor-pointer hover-text-danger" 
										onClick={() => handleRemoveHistory(item)}
										style={{ cursor: 'pointer' }}
									/>
								</Badge>
							))}
						</div>
					)}
				</div>
			</div>

			<style>{`
				.hover-bg-light:hover {
					background-color: #F8FAFC !important;
					color: #0284C7 !important;
				}
				.hover-text-danger:hover {
					color: #EF4444 !important;
				}
				.animated {
					animation-duration: 0.25s;
					animation-fill-mode: both;
				}
				@keyframes fadeIn {
					from { opacity: 0; transform: translateY(-5px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.fadeIn {
					animation-name: fadeIn;
				}
			`}</style>
		</div>
	);
};

export default PreferencesSection;
