import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Row, Col, Spinner, Button, Card } from 'react-bootstrap';
import Select from 'react-select';
import api from '../../../../api/axios';
import { notify } from '../../../../utils/notify';
import { CircleDot, CheckCircle2 } from 'lucide-react';

const CreateEvent = () => {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		title: '',
		description: '', // Tambahan state deskripsi
		kategori: [],
		eventType: [],
	});

	// State untuk mendeteksi apakah input deskripsi sudah pernah diklik/dilewati (untuk validasi error)
	const [touched, setTouched] = useState({
		description: false,
	});

	const [kategoriOptions, setKategoriOptions] = useState([]);
	const [eventTypeOptions, setEventTypeOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchOptions = async () => {
			try {
				const [kategoriRes, eventTypeRes] = await Promise.all([
					api.get('/categories'),
					api.get('/event-types'),
				]);

				if (kategoriRes.data.success) {
					setKategoriOptions(
						kategoriRes.data.data.map((cat) => ({
							value: cat.id.toString(),
							label: cat.name,
						})),
					);
				}

				if (eventTypeRes.data.success) {
					setEventTypeOptions(
						eventTypeRes.data.data.map((type) => ({
							value: type.id.toString(),
							label: type.name,
						})),
					);
				}
			} catch (error) {
				console.error('Gagal mengambil opsi data:', error);
				notify('error', 'Gagal', 'Tidak dapat memuat opsi kategori atau tipe event.');
			}
		};

		fetchOptions();
	}, []);

	const handleTextChange = (e) => {
		const { name, value } = e.target;
		// Hanya kapitalisasi untuk title, deskripsi dibiarkan normal
		const finalValue =
			name === 'title' ? value.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()) : value;

		setFormData((prev) => ({ ...prev, [name]: finalValue }));
	};

	const handleSelectChange = (field, selectedOptions) => {
		setFormData((prev) => ({ ...prev, [field]: selectedOptions || [] }));
	};

	const handleBlur = (field) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validasi Manual
		if (formData.eventType.length === 0 || formData.kategori.length === 0) {
			notify('warning', 'Perhatian', 'Tipe event dan kategori wajib diisi!');
			return;
		}

		if (formData.description.trim().length < 50) {
			notify('warning', 'Perhatian', 'Deskripsi event minimal 50 karakter!');
			setTouched((prev) => ({ ...prev, description: true }));
			return;
		}

		setIsLoading(true);
		try {
			const submitData = new FormData();
			submitData.append('title', formData.title);
			submitData.append('description', formData.description); // Append deskripsi
			formData.kategori.forEach((cat) => submitData.append('kategori_ids[]', cat.value));
			formData.eventType.forEach((type) => submitData.append('event_type_ids[]', type.value));

			const response = await api.post(`/events`, submitData);
			const newEventId = response.data.data.id;

			notify('success', 'Draft Dibuat!', 'Silakan lengkapi detail event Anda.');
			const link = `/organizer/${newEventId}/event-dashboard/info`;
			navigate(link);
		} catch (error) {
			console.error('Error submitting event:', error);
			notify('error', 'Gagal', 'Terjadi kesalahan saat menyimpan draft event.');
			setIsLoading(false);
		}
	};

	const customSelectStyles = {
		control: (base, state) => ({
			...base,
			minHeight: '48px',
			borderColor: state.isFocused ? '#0f172a' : '#cbd5e1',
			boxShadow: 'none',
			borderRadius: '4px',
			'&:hover': {
				borderColor: state.isFocused ? '#0f172a' : '#94a3b8',
			},
		}),
		valueContainer: (base) => ({
			...base,
			padding: '0 12px',
		}),
		placeholder: (base) => ({
			...base,
			color: '#94a3b8',
		}),
	};

	return (
		<div className="container">
			<Row className="justify-content-center">
				<Col xs={12} lg={9} xl={8}>
					<div className="mb-4 text-center">
						<h3 className="fw-bold text-dark mb-2">Buat Event Baru</h3>
						<p className="text-muted">
							Mulai perjalanan event Anda dengan mendaftarkan draft awal.
						</p>
					</div>

					<div className="border-0" style={{ borderRadius: '12px' }}>
						<div className="p-1 p-md-3">
							{/* Stepper Visual */}
							<div className="d-flex align-items-center mb-5 pb-2">
								<div
									className="d-flex flex-column align-items-center text-primary"
									style={{ width: '100px' }}
								>
									<CircleDot size={28} className="mb-2 bg-white" />
									<span className="fw-bold" style={{ fontSize: '13px' }}>
										1. Draft Awal
									</span>
								</div>

								<div
									className="flex-grow-1"
									style={{
										height: '2px',
										backgroundColor: '#e2e8f0',
										marginTop: '-24px',
										marginLeft: '10px',
										marginRight: '10px',
									}}
								></div>

								<div
									className="d-flex flex-column align-items-center text-muted opacity-50"
									style={{ width: '120px' }}
								>
									<CheckCircle2 size={28} className="mb-2 bg-white" />
									<span className="fw-semibold" style={{ fontSize: '13px' }}>
										2. Lengkapi Detail
									</span>
								</div>

								<div
									className="flex-grow-1"
									style={{
										height: '2px',
										backgroundColor: '#e2e8f0',
										marginTop: '-24px',
										marginLeft: '10px',
										marginRight: '10px',
									}}
								></div>

								<div
									className="d-flex flex-column align-items-center text-muted opacity-50"
									style={{ width: '100px' }}
								>
									<CheckCircle2 size={28} className="mb-2 bg-white" />
									<span className="fw-semibold" style={{ fontSize: '13px' }}>
										3. Publikasi
									</span>
								</div>
							</div>

							{/* Form Input */}
							<Form onSubmit={handleSubmit} className="form">
								<Row>
									<Col xs={12}>
										<Form.Group className="mb-4" controlId="formTitle">
											<Form.Label className="form-label required">
												Nama Event
											</Form.Label>
											<Form.Control
												required
												autoFocus
												type="text"
												name="title"
												value={formData.title}
												onChange={handleTextChange}
												placeholder="Masukan nama event (misal: Seminar Nasional Teknologi)"
												style={{
													minHeight: '48px',
													borderColor: '#cbd5e1',
													borderRadius: '4px',
													boxShadow: 'none',
												}}
												className="flat-input"
											/>
										</Form.Group>
									</Col>

									<Col xs={12}>
										<Form.Group className="mb-4" controlId="formDescription">
											<Form.Label className="form-label required">
												Deskripsi Lengkap{' '}
											</Form.Label>
											<Form.Control
												as="textarea"
												rows={5}
												name="description"
												value={formData.description}
												onChange={handleTextChange}
												onBlur={() => handleBlur('description')}
												maxLength={1000}
												placeholder="Jelaskan mengenai tujuan, agenda, dan informasi penting lainnya dari event ini."
												isInvalid={
													touched.description &&
													(formData.description.trim() === '' ||
														formData.description.trim().length < 50)
												}
												style={{
													borderColor: '#cbd5e1',
													borderRadius: '4px',
													boxShadow: 'none',
												}}
											/>
											<div className="d-flex justify-content-between align-items-start mt-1">
												<div>
													{touched.description &&
														(formData.description.trim() === '' ? (
															<div className="text-danger small">
																Deskripsi event wajib diisi.
															</div>
														) : formData.description.trim().length <
														  50 ? (
															<div className="text-danger small">
																Deskripsi minimal 50 karakter (saat
																ini{' '}
																{formData.description.trim().length}{' '}
																karakter).
															</div>
														) : null)}
												</div>
												<Form.Text className="text-muted small text-end">
													{formData.description.length} / 1000 karakter
													{formData.description.length < 50 &&
														' (Minimal 50 karakter)'}
												</Form.Text>
											</div>
										</Form.Group>
									</Col>

									<Col xs={12} md={6}>
										<Form.Group className="mb-4">
											<Form.Label className="form-label required">
												Tipe Event
											</Form.Label>
											<Select
												isMulti
												value={formData.eventType}
												options={eventTypeOptions}
												placeholder="Pilih Tipe Event..."
												onChange={(selected) =>
													handleSelectChange('eventType', selected)
												}
												styles={customSelectStyles}
											/>
										</Form.Group>
									</Col>

									<Col xs={12} md={6}>
										<Form.Group className="mb-4">
											<Form.Label className="form-label required">
												Kategori Event
											</Form.Label>
											<Select
												isMulti
												value={formData.kategori}
												options={kategoriOptions}
												placeholder="Pilih Kategori..."
												onChange={(selected) =>
													handleSelectChange('kategori', selected)
												}
												styles={customSelectStyles}
											/>
										</Form.Group>
									</Col>
								</Row>

								<div className="d-flex justify-content-end pt-4 mt-3 border-top">
									<Button
										type="submit"
										variant="primary"
										className="px-4 py-2"
										disabled={isLoading}
									>
										{isLoading ? (
											<>
												<Spinner
													as="span"
													animation="border"
													size="sm"
													role="status"
													aria-hidden="true"
													className="me-2"
												/>
												Memproses...
											</>
										) : (
											'Buat Draft & Lanjutkan'
										)}
									</Button>
								</div>
							</Form>
						</div>
					</div>
				</Col>
			</Row>
		</div>
	);
};

export default CreateEvent;
