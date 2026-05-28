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
		kategori: [],
		eventType: [],
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
		const capitalizedValue = value.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
		setFormData((prev) => ({ ...prev, [name]: capitalizedValue }));
	};

	const handleSelectChange = (field, selectedOptions) => {
		setFormData((prev) => ({ ...prev, [field]: selectedOptions || [] }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (formData.eventType.length === 0 || formData.kategori.length === 0) {
			notify('warning', 'Perhatian', 'Tipe event dan kategori wajib diisi!');
			return;
		}

		setIsLoading(true);
		try {
			const submitData = new FormData();
			submitData.append('title', formData.title);
			formData.kategori.forEach((cat) => submitData.append('kategori_ids[]', cat.value));
			formData.eventType.forEach((type) => submitData.append('event_type_ids[]', type.value));

			const response = await api.post(`/events`, submitData);
			const newEventId = response.data.data.id;

			notify('success', 'Draft Dibuat!', 'Silakan lengkapi detail event Anda.');
			const link = `/organizer/${newEventId}/event-dashboard/detail/info`;
			navigate(link);
		} catch (error) {
			// ... (error handling yang sama)
			setIsLoading(false);
		}
	};

	// Custom Styling untuk React-Select agar flat dan senada dengan form Bootstrap
	const customSelectStyles = {
		control: (base, state) => ({
			...base,
			minHeight: '48px',
			borderColor: state.isFocused ? '#0f172a' : '#cbd5e1', // Border gelap saat fokus, bukan biru terang
			boxShadow: 'none', // Mematikan shadow/glow default
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
					{/* Header Area */}
					<div className="mb-4 text-center">
						<h3 className="fw-bold text-dark mb-2">Buat Event Baru</h3>
						<p className="text-muted">
							Mulai perjalanan event Anda dengan mendaftarkan draft awal.
						</p>
					</div>

					<div className="border-0" style={{ borderRadius: '12px' }}>
						<div className="p-1 p-md-3">
							{/* Stepper Visual yang Lebih Solid */}
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
										marginX: '10px',
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
										marginX: '10px',
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

							{/* Form Input (Tanpa Border Pembungkus Tambahan) */}
							<Form onSubmit={handleSubmit}>
								<Row>
									<Col xs={12}>
										<Form.Group className="mb-4" controlId="formTitle">
											<Form.Label
												className="fw-semibold text-dark"
												style={{ fontSize: '14px' }}
											>
												Nama Event <span className="text-danger">*</span>
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
													boxShadow: 'none', // Mematikan glow bawaan bootstrap
												}}
												// Menambahkan custom focus style via className atau inline style
												className="flat-input"
											/>
										</Form.Group>
									</Col>

									<Col xs={12} md={6}>
										<Form.Group className="mb-4">
											<Form.Label
												className="fw-semibold text-dark"
												style={{ fontSize: '14px' }}
											>
												Tipe Event <span className="text-danger">*</span>
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
											<Form.Label
												className="fw-semibold text-dark"
												style={{ fontSize: '14px' }}
											>
												Kategori Event{' '}
												<span className="text-danger">*</span>
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
