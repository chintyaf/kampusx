import { useState, useEffect, useCallback } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Form, Modal, Button } from 'react-bootstrap';
import Select from 'react-select';
import Cropper from 'react-easy-crop';
import EventLayout from '../../../../layouts/EventLayout';
import api from '../../../../api/axios';
import { STORAGE_URL } from '../../../../api/storage';
import { notify } from '../../../../utils/notify';
import useEventMeta from '../../../../hooks/useEventMeta';
// ICON
import { Image, Upload } from 'lucide-react';
import getCroppedImg from '@/utils/cropImage';
import UploadImage from './sections/event-info/UploadImage';
import EventPreview from './sections/event-info/EventPreview';

const EventGeneralInfo = () => {
	const { eventId } = useParams();
	const { eventStatus, hasParticipants } = useEventMeta(eventId);
	// const { setIsPageLoading } = useOutletContext() || {};

	const [formData, setFormData] = useState({
		title: '',
		description: '',
		banner: null,
		kategori: [],
		eventType: [],
		timezone: 'Asia/Jakarta',
	});
	const [touched, setTouched] = useState({});

	const handleBlur = (field) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
	};

	useEffect(() => {
		if (formData.banner) {
			setTouched((prev) => ({ ...prev, banner: true }));
		}
	}, [formData.banner]);

	// ==========================================
	// STATE UNTUK CROP GAMBAR
	// ==========================================
	const [showCropModal, setShowCropModal] = useState(false);
	const [imageSrc, setImageSrc] = useState(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

	// ==========================================
	// STATE UNTUK OPTIONS & LOADING DROPDOWN
	// ==========================================
	const [kategoriOptions, setKategoriOptions] = useState([]);
	const [isKategoriLoading, setIsKategoriLoading] = useState(false);
	const [isKategoriFetched, setIsKategoriFetched] = useState(false);

	const [eventTypeOptions, setEventTypeOptions] = useState([]);
	const [isEventTypeLoading, setIsEventTypeLoading] = useState(false);
	const [isEventTypeFetched, setIsEventTypeFetched] = useState(false);

	// ==========================================
	// HANDLER UNTUK UBAH STATE
	// ==========================================
	const handleTextChange = (e) => {
		const { name, value } = e.target;

		// Auto-kapitalisasi di setiap awal kata hanya untuk 'title'
		const formattedValue =
			name === 'title' ? value.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()) : value;

		setFormData((prev) => ({ ...prev, [name]: formattedValue }));
	};

	const handleSelectChange = (field, selectedOptions) => {
		setFormData((prev) => ({ ...prev, [field]: selectedOptions || [] }));
	};

	// ==========================================
	// HANDLER CROP & UPLOAD GAMBAR
	// ==========================================
	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			notify('error', 'Gagal!', 'File yang diunggah harus berupa gambar.');
			e.target.value = '';
			return;
		}

		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			setImageSrc(reader.result);
			setShowCropModal(true); // Buka modal crop
		};

		e.target.value = ''; // Reset input
	};

	const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
		setCroppedAreaPixels(croppedAreaPixels);
	}, []);

	const handleSaveCrop = async () => {
		try {
			const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);

			// Timpa banner lama dengan file hasil crop
			setFormData((prev) => ({ ...prev, banner: croppedFile }));
			setShowCropModal(false);
		} catch (e) {
			console.error('Error saat cropping:', e);
		}
	};

	// ==========================================
	// FETCH DATA ON DEMAND (SAAT DROPDOWN DIKLIK)
	// ==========================================
	const fetchEventTypes = async () => {
		if (isEventTypeFetched) return;

		setIsEventTypeLoading(true);
		try {
			const res = await api.get('/event-types');
			if (res.data.success) {
				setEventTypeOptions(
					res.data.data.map((type) => ({
						value: type.id.toString(),
						label: type.name,
					})),
				);
				setIsEventTypeFetched(true);
			}
		} catch (error) {
			console.error('Gagal mengambil opsi event type:', error);
		} finally {
			setIsEventTypeLoading(false);
		}
	};

	const fetchCategories = async () => {
		if (isKategoriFetched) return;

		setIsKategoriLoading(true);
		try {
			const res = await api.get('/categories');
			if (res.data.success) {
				setKategoriOptions(
					res.data.data.map((cat) => ({
						value: cat.id.toString(),
						label: cat.name,
					})),
				);
				setIsKategoriFetched(true);
			}
		} catch (error) {
			console.error('Gagal mengambil opsi kategori:', error);
		} finally {
			setIsKategoriLoading(false);
		}
	};

	// ==========================================
	// AMBIL DATA EVENT UTAMA SAAT MOUNT
	// ==========================================
	useEffect(() => {
		const fetchEventData = async () => {
			// if (setIsPageLoading) setIsPageLoading(true);

			try {
				const response = await api.get(`event-dashboard/${eventId}/info-utama`);
				const result = response.data;

				if (result.status === 'success') {
					const data = result.data;
					const mapToStandardTimezone = (tz) => {
						const mapping = {
							WIB: 'Asia/Jakarta',
							WITA: 'Asia/Makassar',
							WIT: 'Asia/Jayapura',
						};
						return mapping[tz] || tz;
					};
					setFormData((prev) => ({
						...prev,
						title: data.title || '',
						description: data.description || '',
						banner: data.banner || null,
						timezone: mapToStandardTimezone(data.timezone || 'Asia/Jakarta'),
						kategori: data.tags_kategori
							? data.tags_kategori.map((cat) => ({
								value: cat.id.toString(),
								label: cat.name,
							}))
							: [],
						eventType: data.event_types
							? data.event_types.map((type) => ({
								value: type.id.toString(),
								label: type.name,
							}))
							: [],
					}));
				}
			} catch (error) {
				console.error('Gagal mengambil data event:', error);
			} finally {
				// if (setIsPageLoading) setIsPageLoading(false);
			}
		};

		if (eventId) {
			fetchEventData();
		}
	}, [eventId]);

	// ==========================================
	// SUBMIT DATA
	// ==========================================
	const handleUpdate = async (shouldNotify = false) => {
		setTouched({
			title: true,
			description: true,
			kategori: true,
			eventType: true,
			timezone: true,
			banner: true,
		});

		const submitData = new FormData();

		submitData.append('title', formData.title);
		submitData.append('description', formData.description);
		submitData.append('timezone', formData.timezone);

		formData.kategori.forEach((cat) => submitData.append('kategori_ids[]', cat.value));
		formData.eventType.forEach((type) => submitData.append('event_type_ids[]', type.value));

		if (formData.banner instanceof File) {
			submitData.append('banner', formData.banner);
		}

		try {
			const response = await api.post(
				`event-dashboard/${eventId}/info-utama/update`,
				submitData,
				{
					headers: { 'Content-Type': 'multipart/form-data' },
				},
			);

			if (response.data?.notified_participants || shouldNotify) {
				notify(
					'success',
					'Berhasil!',
					'Perubahan informasi utama telah disimpan. Peserta terdaftar telah dikirimi notifikasi perubahan.',
				);
			} else {
				notify('success', 'Berhasil!', 'Perubahan informasi utama telah disimpan.');
			}
			return response;
		} catch (error) {
			console.error('Gagal update data:', error);
			notify(
				'error',
				'Gagal!',
				error.response?.data?.message || 'Terjadi kesalahan saat menyimpan perubahan.',
			);
			throw error;
		}
	};

	const isCurrentStepCompleted =
		formData.title?.trim() !== '' &&
		formData.description?.trim().length >= 50 &&
		formData.banner !== null &&
		formData.banner !== '' &&
		formData.kategori?.length > 0 &&
		formData.eventType?.length > 0 &&
		formData.timezone?.trim() !== '';

	return (
		<EventLayout
			title="Informasi Umum"
			description="Lengkapi detail dasar event untuk mempermudah calon peserta menemukan event-mu."
			nextPath="tempat"
			onSave={handleUpdate}
			eventStatus={eventStatus}
			hasParticipants={hasParticipants}
			isCurrentStepCompleted={isCurrentStepCompleted}
		// sidebar={<EventPreview />}
		>
			<Form className="form">
				{/* ========================================== */}
				{/* BAGIAN 1: INFORMASI UTAMA                  */}
				{/* ========================================== */}
				<div id="main-info" className="mb-5">
					<Form.Group className="mb-4" controlId="formTitle">
						<Form.Label className="required">Nama Event</Form.Label>
						<Form.Control
							required
							type="text"
							name="title"
							value={formData.title}
							onChange={handleTextChange}
							onBlur={() => handleBlur('title')}
							placeholder="Masukan nama event (misal: Seminar Nasional Teknologi)"
							isInvalid={touched.title && formData.title?.trim() === ''}
						/>
						<Form.Control.Feedback type="invalid">
							Nama event wajib diisi.
						</Form.Control.Feedback>
					</Form.Group>

					<Form.Group className="mb-4" controlId="formDescription">
						<Form.Label className="required">Deskripsi Lengkap</Form.Label>
						<Form.Control
							as="textarea"
							rows={5}
							name="description"
							value={formData.description}
							onChange={handleTextChange}
							onBlur={() => handleBlur('description')}
							placeholder="Jelaskan mengenai tujuan, agenda, dan informasi penting lainnya dari event ini."
							isInvalid={
								touched.description &&
								(formData.description?.trim() === '' ||
									formData.description?.trim().length < 50)
							}
						/>
						<div className="d-flex justify-content-between align-items-start mt-1">
							<div>
								{touched.description &&
									(formData.description?.trim() === '' ? (
										<div className="text-danger small">
											Deskripsi event wajib diisi.
										</div>
									) : (formData.description?.trim().length || 0) < 50 ? (
										<div className="text-danger small">
											Deskripsi minimal 50 karakter (saat ini{' '}
											{formData.description?.trim().length || 0} karakter).
										</div>
									) : null)}
							</div>
							<Form.Text className={'text-muted small text-end'}>
								{formData.description?.length || 0} / 500 karakter
								{(formData.description?.length || 0) < 50 &&
									' (Minimal 50 karakter)'}
							</Form.Text>
						</div>
					</Form.Group>

					<Form.Group className="mb-4">
						<Form.Label className="form-label required">Tipe Event</Form.Label>
						<Select
							isMulti
							value={formData.eventType}
							options={eventTypeOptions}
							isLoading={isEventTypeLoading}
							onMenuOpen={fetchEventTypes}
							placeholder="Pilih Tipe Event (Bisa lebih dari satu)..."
							className="react-select-container"
							classNamePrefix="react-select"
							onChange={(selected) => {
								handleSelectChange('eventType', selected);
								handleBlur('eventType');
							}}
							onBlur={() => handleBlur('eventType')}
							styles={{
								control: (baseStyles) => ({
									...baseStyles,
									borderColor:
										touched.eventType && formData.eventType?.length === 0
											? '#dc3545'
											: baseStyles.borderColor,
									'&:hover': {
										borderColor:
											touched.eventType && formData.eventType?.length === 0
												? '#dc3545'
												: baseStyles.borderColor,
									},
								}),
							}}
						/>
						{touched.eventType && formData.eventType?.length === 0 && (
							<div className="text-danger small mt-1">
								Pilih minimal satu tipe event.
							</div>
						)}
					</Form.Group>

					<Form.Group className="mb-4">
						<Form.Label className="required">Kategori Event</Form.Label>
						<Select
							isMulti
							value={formData.kategori}
							options={kategoriOptions}
							isLoading={isKategoriLoading}
							onMenuOpen={fetchCategories}
							placeholder="Pilih kategori (Bisa lebih dari satu)..."
							className="react-select-container"
							classNamePrefix="react-select"
							onChange={(selected) => {
								handleSelectChange('kategori', selected);
								handleBlur('kategori');
							}}
							onBlur={() => handleBlur('kategori')}
							styles={{
								control: (baseStyles) => ({
									...baseStyles,
									borderColor:
										touched.kategori && formData.kategori?.length === 0
											? '#dc3545'
											: baseStyles.borderColor,
									'&:hover': {
										borderColor:
											touched.kategori && formData.kategori?.length === 0
												? '#dc3545'
												: baseStyles.borderColor,
									},
								}),
							}}
						/>
						{touched.kategori && formData.kategori?.length === 0 && (
							<div className="text-danger small mt-1">
								Pilih minimal satu kategori event.
							</div>
						)}
					</Form.Group>
				</div>
			</Form>

			<Form className="form" id="additional-info">
				{/* ========================================== */}
				{/* BAGIAN 2: TAMBAHAN (ID: additional)        */}
				{/* ========================================== */}
				{/* Zona Waktu (Timezone) */}
				<Form.Group className="mb-4">
					<Form.Label className="required">Zona Waktu</Form.Label>
					<Form.Select
						name="timezone"
						value={formData.timezone}
						onChange={handleTextChange}
						onBlur={() => handleBlur('timezone')}
						className="form-select shadow-none"
						isInvalid={touched.timezone && formData.timezone?.trim() === ''}
						style={{
							border:
								touched.timezone && formData.timezone?.trim() === ''
									? '1.5px solid #dc3545'
									: '1.5px solid #cbd5e1',
							borderRadius: '8px',
							fontSize: '14px',
							padding: '10px 12px',
							backgroundColor: '#f8fafc',
						}}
					>
						<option value="Asia/Jakarta">Asia/Jakarta (WIB - GMT+7)</option>
						<option value="Asia/Makassar">Asia/Makassar (WITA - GMT+8)</option>
						<option value="Asia/Jayapura">Asia/Jayapura (WIT - GMT+9)</option>
						<option value="UTC">UTC (GMT+0)</option>
					</Form.Select>
					<Form.Control.Feedback type="invalid">
						Zona waktu wajib diisi.
					</Form.Control.Feedback>
				</Form.Group>

				<UploadImage formData={formData} setFormData={setFormData} />

				{touched.banner && !formData.banner && (
					<div className="text-danger small mt-2 text-center">
						Poster/gambar cover event wajib diunggah.
					</div>
				)}
			</Form>

			{/* ========================================== */}
			{/* MODAL CROP GAMBAR */}
			{/* ========================================== */}
			<Modal
				show={showCropModal}
				onHide={() => setShowCropModal(false)}
				size="lg"
				centered
				backdrop="static"
			>
				<Modal.Header closeButton>
					<Modal.Title>Sesuaikan Banner (Rasio 2:3)</Modal.Title>
				</Modal.Header>
				<Modal.Body
					style={{ position: 'relative', height: '400px', backgroundColor: '#333' }}
				>
					{imageSrc && (
						<Cropper
							image={imageSrc}
							crop={crop}
							zoom={zoom}
							aspect={3 / 2}
							onCropChange={setCrop}
							onCropComplete={onCropComplete}
							onZoomChange={setZoom}
						/>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowCropModal(false)}>
						Batal
					</Button>
					<Button variant="primary" onClick={handleSaveCrop}>
						Simpan Potongan
					</Button>
				</Modal.Footer>
			</Modal>
		</EventLayout>
	);
};

export default EventGeneralInfo;
