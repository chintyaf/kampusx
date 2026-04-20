import { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import EventLayout from '../../../layouts/EventLayout';
import api from '../../../api/axios';
import { STORAGE_URL } from '../../../api/storage';
import { notify } from '../../../utils/notify';
// ICON
import { Image } from 'lucide-react';

const EventGeneralInfo = () => {
	const { eventId } = useParams();
	const { setIsPageLoading } = useOutletContext() || {};

	const [formData, setFormData] = useState({
		title: '',
		description: '',
		banner: null,
		kategori: [],
		eventType: [],
	});

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

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			file.preview = URL.createObjectURL(file);
			setFormData((prev) => ({ ...prev, banner: file }));
		}
	};

	// Bersihkan URL object saat komponen unmount untuk mencegah memory leak dari preview image
	useEffect(() => {
		return () => {
			if (formData.banner && formData.banner.preview) {
				URL.revokeObjectURL(formData.banner.preview);
			}
		};
	}, [formData.banner]);

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
			if (setIsPageLoading) setIsPageLoading(true);

			try {
				const response = await api.get(`event-dashboard/${eventId}/info-utama`);
				const result = response.data;

				if (result.status === 'success') {
					const data = result.data;
					setFormData((prev) => ({
						...prev,
						title: data.title || '',
						description: data.description || '',
						banner: data.banner || null,
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
				if (setIsPageLoading) setIsPageLoading(false);
			}
		};

		if (eventId) {
			fetchEventData();
		}
	}, [eventId, setIsPageLoading]);

	// ==========================================
	// SUBMIT DATA
	// ==========================================
	const handleUpdate = async () => {
		const submitData = new FormData();

		submitData.append('title', formData.title);
		submitData.append('description', formData.description);

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

			notify('success', 'Berhasil!', 'Perubahan informasi utama telah disimpan.');
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
			heading="Informasi Utama"
			subheading="Lengkapi detail dasar event untuk mempermudah calon peserta menemukan event-mu."
			nextPath="tempat"
			onSave={handleUpdate}>
			<Form>
				<Form.Group className="mb-4" controlId="formTitle">
					<Form.Label>Nama Event</Form.Label>
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
					<Form.Label>Deskripsi Lengkap</Form.Label>
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
					<Form.Label>Tipe Event</Form.Label>
					<Select
						isMulti
						value={formData.eventType}
						options={eventTypeOptions}
						isLoading={isEventTypeLoading}
						onMenuOpen={fetchEventTypes}
						placeholder="Pilih Tipe Event (Bisa lebih dari satu)..."
						className="basic-multi-select"
						classNamePrefix="select test"
						onChange={(selected) => handleSelectChange('eventType', selected)}
					/>
				</Form.Group>

				<Form.Group className="mb-4">
					<Form.Label>Kategori Event</Form.Label>
					<Select
						isMulti
						value={formData.kategori}
						options={kategoriOptions}
						isLoading={isKategoriLoading}
						onMenuOpen={fetchCategories}
						placeholder="Pilih kategori (Bisa lebih dari satu)..."
						className="basic-multi-select"
						classNamePrefix="select form-select"
						onChange={(selected) => handleSelectChange('kategori', selected)}
					/>
				</Form.Group>

				<Form.Group className="mb-4">
					<Form.Label>Banner Event</Form.Label>
					<div className="upload-box-wrapper">
						<input
							type="file"
							id="bannerUpload"
							className="hidden-input"
							accept="image/*"
							onChange={handleFileChange}
						/>
						<label htmlFor="bannerUpload" className="upload-box-label">
							<div className="text-center">
								<Image size={32} color="#a1a1a1" />
								<p className="mb-0 text-muted mt-2">
									{formData.banner
										? formData.banner.name || formData.banner.split('/').pop()
										: 'Klik untuk unggah banner (Rekomendasi 1280×720 px, Max 2MB)'}
								</p>
							</div>
						</label>
					</div>
				</Form.Group>

				<div>
					{formData.banner && (
						<div
							className="w-100 border mt-3"
							style={{
								height: '200px',
								overflow: 'hidden',
								borderRadius: '8px',
							}}>
							<img
								src={
									formData.banner instanceof File
										? formData.banner.preview
										: formData.banner
								}
								alt="Banner Preview"
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
								}}
							/>
						</div>
					)}
				</div>
			</Form>
		</EventLayout>
	);
};

export default EventGeneralInfo;
