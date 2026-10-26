import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Badge, Alert } from 'react-bootstrap';
import { Save, CheckCircle, ImageIcon, Upload, X, ChevronDown } from 'lucide-react';

const CreateLearningPage = () => {
	const navigate = useNavigate();
	// State Data Draf Learning Path
	const [title, setTitle] = useState('AI Engineering & RAG Masterclass');
	const [description, setDescription] = useState(
		'Kurikulum end-to-end terstruktur untuk merancang, mengoptimalkan, dan mengoperasikan sistem Generative AI berbasis Retrieval-Augmented Generation (RAG) kelas enterprise dari nol hingga production deployment.',
	);

	// Kategori / Tags Multi-Select
	const [categories, setCategories] = useState([
		'Artificial Intelligence',
		'Machine Learning',
		'Software Engineering',
	]);
	const [newCategory, setNewCategory] = useState('');

	// Target Modul, Durasi, Sertifikat
	const [targetModules, setTargetModules] = useState(6);
	const [totalHours, setTotalHours] = useState(4.0);
	const [certificateCount, setCertificateCount] = useState(7);
	const [enableBlockchain, setEnableBlockchain] = useState(true);
	const [isAIRecommended, setIsAIRecommended] = useState(true);

	// Gambar Sampul
	const [imageCover, setImageCover] = useState(null);

	// Status & Notifikasi
	const [status, setStatus] = useState('Draft');
	const [isSaved, setIsSaved] = useState(false);

	// Custom Inline Style Sesuai Gambar
	const fieldStyle = {
		backgroundColor: '#f8fafc',
		borderColor: '#e2e8f0',
		borderRadius: '10px',
		fontSize: '14px',
		padding: '10px 14px',
		color: '#1e293b',
	};

	const cardStyle = {
		backgroundColor: '#ffffff',
		borderColor: '#eaecf0',
		borderRadius: '16px',
	};

	// Handlers
	const handleRemoveCategory = (catToRemove) => {
		setCategories(categories.filter((c) => c !== catToRemove));
	};

	const handleAddCategory = (e) => {
		if (e.key === 'Enter' && newCategory.trim()) {
			e.preventDefault();
			if (!categories.includes(newCategory.trim())) {
				setCategories([...categories, newCategory.trim()]);
			}
			setNewCategory('');
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setImageCover(URL.createObjectURL(file));
		}
	};

	const handleSaveDraft = (e) => {
		if (e) e.preventDefault();
		setStatus('Draft');
		setIsSaved(true);

		// Contoh ID dummy (bisa diganti dengan ID asli yang didapat dari respon API backend)
		const learningId = '123';

		setTimeout(() => {
			setIsSaved(false);
			// Navigasi ke halaman Manage Learning Path
			navigate(`/organizer/learning-path/${learningId}`);
		}, 1200);
	};
	return (
		<Container className="" style={{ padding: '48px 48px' }}>
			{/* Header Halaman */}
			<div className="d-flex align-items-center justify-between mb-4 border-bottom pb-3">
				<div>
					<div className="d-flex align-items-center gap-2">
						<h4 className="fw-bold text-dark mb-0">Buat Draf Learning Path</h4>
						<Badge
							bg="warning-subtle"
							className="text-warning-emphasis border border-warning-subtle px-2 py-1 fw-normal"
						>
							{status}
						</Badge>
					</div>
					<p className="text-muted small mb-0 mt-1">
						Lengkapi detail dasar Learning Path untuk mempermudah calon peserta
						menemukan program belajar ini.
					</p>
				</div>
			</div>

			{/* Alert Notifikasi */}
			{isSaved && (
				<Alert
					variant="success"
					dismissible
					onClose={() => setIsSaved(false)}
					className="p-3 small mb-4"
				>
					<CheckCircle size={16} className="me-1" /> Data draf Learning Path berhasil
					disimpan!
				</Alert>
			)}

			<Row className="g-4">
				{/* Formulir Utama */}
				<Col lg={12}>
					<Card className="shadow-xs p-4" style={cardStyle}>
						<div className="mb-4">
							<h5 className="fw-bold text-dark mb-1">Informasi Umum</h5>
							<p className="text-muted small mb-0">
								Lengkapi detail dasar Learning Path untuk mempermudah calon peserta
								menemukan kurikulum ini.
							</p>
						</div>

						<Form onSubmit={handleSaveDraft}>
							{/* Judul Learning Path */}
							<Form.Group className="mb-4" controlId="formTitle">
								<Form.Label className="small fw-bold text-dark mb-2">
									Judul Learning Path <span className="text-danger">*</span>
								</Form.Label>
								<Form.Control
									type="text"
									style={fieldStyle}
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Contoh: AI Engineering & RAG Masterclass"
									required
								/>
							</Form.Group>

							{/* Deskripsi Lengkap + Character Count */}
							<Form.Group className="mb-4" controlId="formDescription">
								<Form.Label className="small fw-bold text-dark mb-2">
									Deskripsi Lengkap <span className="text-danger">*</span>
								</Form.Label>
								<Form.Control
									as="textarea"
									rows={4}
									style={fieldStyle}
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									maxLength={1000}
									placeholder="Tuliskan deskripsi lengkap kurikulum..."
									required
								/>
								<div
									className="text-end text-muted small mt-1"
									style={{ fontSize: '12px' }}
								>
									{description.length} / 1000 karakter
								</div>
							</Form.Group>

							{/* Gambar Sampul / Banner */}
							<Form.Group className="mb-4">
								<div className="d-flex align-items-center justify-content-between mb-2">
									<Form.Label className="small fw-bold text-dark mb-0 d-flex align-items-center gap-1">
										<ImageIcon size={15} className="text-primary" /> Gambar
										Sampul / Banner Path <span className="text-danger">*</span>
									</Form.Label>
									<span
										className="text-muted extra-small"
										style={{ fontSize: '12px' }}
									>
										1280x720px · Maks. 2MB
									</span>
								</div>

								{!imageCover ? (
									<div
										className="border border-2 border-dashed rounded-3 p-4 text-center"
										style={{
											backgroundColor: '#f8fafc',
											borderColor: '#e2e8f0',
										}}
									>
										<Form.Control
											type="file"
											id="upload-cover-input"
											className="d-none"
											accept="image/*"
											onChange={handleImageChange}
										/>
										<Form.Label
											htmlFor="upload-cover-input"
											className="w-100 mb-0"
											style={{ cursor: 'pointer' }}
										>
											<div className="text-primary mb-1">
												<Upload size={22} />
											</div>
											<p className="fw-semibold mb-0 small text-dark">
												Klik untuk unggah gambar banner
											</p>
											<p
												className="text-muted mb-0"
												style={{ fontSize: '11px' }}
											>
												PNG, JPG, WEBP (Maksimal 2MB, rasio 16:9)
											</p>
										</Form.Label>
									</div>
								) : (
									<div className="d-flex justify-content-center p-2">
										<div
											className="position-relative rounded-4 overflow-hidden border shadow-sm"
											style={{ maxWidth: '420px' }}
										>
											<img
												src={imageCover}
												alt="Cover Preview"
												className="w-100 object-fit-cover"
												style={{ maxHeight: '220px' }}
											/>
											<Button
												variant="danger"
												size="sm"
												className="position-absolute top-0 end-0 m-2 p-1 rounded-circle shadow"
												onClick={() => setImageCover(null)}
											>
												<X size={14} />
											</Button>
										</div>
									</div>
								)}
							</Form.Group>

							{/* Kategori Learning Path */}
							<Form.Group className="mb-4">
								<Form.Label className="small fw-bold text-dark mb-2">
									Kategori Learning Path <span className="text-danger">*</span>
								</Form.Label>
								<div
									className="d-flex align-items-center justify-content-between flex-wrap gap-2"
									style={{ ...fieldStyle, minHeight: '46px', cursor: 'text' }}
								>
									<div className="d-flex flex-wrap gap-2 align-items-center flex-grow-1">
										{categories.map((cat, idx) => (
											<span
												key={idx}
												className="badge bg-white border text-dark d-inline-flex align-items-center gap-2 px-3 py-1 rounded-3 small fw-medium shadow-sm"
												style={{ fontSize: '13px', borderColor: '#cbd5e1' }}
											>
												{cat}
												<X
													size={13}
													className="text-muted cursor-pointer"
													style={{ cursor: 'pointer' }}
													onClick={() => handleRemoveCategory(cat)}
												/>
											</span>
										))}
										<input
											type="text"
											className="border-0 bg-transparent text-dark small flex-grow-1 outline-none"
											style={{ minWidth: '120px', outline: 'none' }}
											placeholder={
												categories.length === 0
													? 'Ketik kategori & tekan Enter...'
													: 'Tambah...'
											}
											value={newCategory}
											onChange={(e) => setNewCategory(e.target.value)}
											onKeyDown={handleAddCategory}
										/>
									</div>

									<div className="d-flex align-items-center gap-2 text-muted ms-2">
										{categories.length > 0 && (
											<X
												size={15}
												className="cursor-pointer"
												style={{ cursor: 'pointer' }}
												onClick={() => setCategories([])}
											/>
										)}
										<span
											className="border-start h-100 mx-1"
											style={{ height: '16px', borderColor: '#cbd5e1' }}
										></span>
										<ChevronDown size={16} />
									</div>
								</div>
							</Form.Group>
						</Form>
					</Card>
				</Col>
			</Row>

			{/* Tombol Simpan di Bagian Kanan Bawah */}
			<div className="d-flex justify-content-end mt-4">
				<Button
					variant="primary"
					className="px-4 py-2 fw-semibold rounded-3 shadow-sm d-flex align-items-center gap-2"
					onClick={handleSaveDraft}
					style={{ backgroundColor: '#006699', borderColor: '#006699' }}
				>
					<Save size={16} /> Simpan Learning Path
				</Button>
			</div>
		</Container>
	);
};

export default CreateLearningPage;
