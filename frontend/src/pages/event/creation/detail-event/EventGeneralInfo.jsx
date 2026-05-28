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

	return (
		<EventLayout
			title="Informasi Utama"
			description="Lengkapi detail dasar event untuk mempermudah calon peserta menemukan event-mu."
			nextPath="tempat"
			onSave={handleUpdate}
			eventStatus={eventStatus}
			hasParticipants={hasParticipants}
			// sidebar={<EventPreview />}
		>
			<Form>
				<Form.Group className="mb-4" controlId="formTitle">
					<Form.Label className="required">Nama Event</Form.Label>
					<Form.Control
						required
						type="text"
						name="title"
						value={formData.title}
						onChange={handleTextChange}
						placeholder="Masukan nama event (misal: Seminar Nasional Teknologi)"
					/>
				</Form.Group>

				<Form.Group className="mb-4" controlId="formDescription">
					<Form.Label className="required">Deskripsi Lengkap</Form.Label>
					<Form.Control
						as="textarea"
						rows={5}
						name="description"
						value={formData.description}
						onChange={handleTextChange}
						placeholder="Jelaskan mengenai tujuan, agenda, dan informasi penting lainnya dari event ini."
					/>
					<Form.Text className={'text-muted small d-block mt-1 text-end'}>
						{formData.description?.length || 0} / 500 karakter
						{(formData.description?.length || 0) < 50 && ' (Minimal 50 karakter)'}
					</Form.Text>
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
						onChange={(selected) => handleSelectChange('eventType', selected)}
					/>
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
						onChange={(selected) => handleSelectChange('kategori', selected)}
					/>
				</Form.Group>

				{/* Zona Waktu (Timezone) */}
				<Form.Group className="mb-4">
					<Form.Label className="required">Zona Waktu</Form.Label>
					<Form.Select
						name="timezone"
						value={formData.timezone}
						onChange={handleTextChange}
						className="form-select shadow-none"
						style={{
							border: '1.5px solid #cbd5e1',
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
				</Form.Group>

				<UploadImage formData={formData} setFormData={setFormData} />
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
