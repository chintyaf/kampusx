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
	const [isKategoriFetched, setIsKategoriFetched] = useState(false); // Flag agar tidak fetch berulang

	const [eventTypeOptions, setEventTypeOptions] = useState([]);
	const [isEventTypeLoading, setIsEventTypeLoading] = useState(false);
	const [isEventTypeFetched, setIsEventTypeFetched] = useState(false); // Flag agar tidak fetch berulang

	// ==========================================
	// HANDLER UNTUK UBAH STATE
	// ==========================================
	const handleTextChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (field, selectedOptions) => {
		setFormData(prev => ({ ...prev, [field]: selectedOptions || [] }));
	};

	const handleFileChange = e => {
		const file = e.target.files[0];
		if (file) {
			// Tambahkan properti preview ke dalam objek file secara temporary
			file.preview = URL.createObjectURL(file);
			setFormData(prev => ({ ...prev, banner: file }));
		}
	};

	// ==========================================
	// FETCH DATA ON DEMAND (SAAT DROPDOWN DIKLIK)
	// ==========================================
	const fetchEventTypes = async () => {
		// Jika data sudah pernah di-fetch, jangan hit API lagi
		if (isEventTypeFetched) return;

		setIsEventTypeLoading(true);
		try {
			const res = await api.get('/event-types');
			if (res.data.success) {
				setEventTypeOptions(
					res.data.data.map(type => ({
						value: type.id.toString(),
						label: type.name,
					})),
				);
				setIsEventTypeFetched(true); // Tandai sudah di-fetch
			}
		} catch (error) {
			console.error('Gagal mengambil opsi event type:', error);
		} finally {
			setIsEventTypeLoading(false);
		}
	};

	const fetchCategories = async () => {
		// Jika data sudah pernah di-fetch, jangan hit API lagi
		if (isKategoriFetched) return;

		setIsKategoriLoading(true);
		try {
			const res = await api.get('/categories');
			if (res.data.success) {
				setKategoriOptions(
					res.data.data.map(cat => ({
						value: cat.id.toString(),
						label: cat.name,
					})),
				);
				setIsKategoriFetched(true); // Tandai sudah di-fetch
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
		// PERHATIKAN: useEffect untuk fetchOptions (kategori & event-type) sudah dihapus dari sini.

		const fetchEventData = async () => {
			if (setIsPageLoading) setIsPageLoading(true);

			try {
				const response = await api.get(`event-dashboard/${eventId}/info-utama`);
				const result = response.data;
				// console.log("Data event yang di-fetch:", result); // Debug log

				if (result.status === 'success') {
					const data = result.data;
					setFormData(prev => ({
						...prev,
						title: data.title || '',
						description: data.description || '',
						banner: data.banner || null,
						kategori: data.tags_kategori
							? data.tags_kategori.map(cat => ({
									value: cat.id.toString(),
									label: cat.name,
								}))
							: [],
						eventType: data.event_types
							? data.event_types.map(type => ({
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

		formData.kategori.forEach(cat => submitData.append('kategori_ids[]', cat.value));

		formData.eventType.forEach(type => submitData.append('event_type_ids[]', type.value));

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
				{/* ... Input Judul & Deskripsi tetap sama ... */}
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
				</Form.Group>
				{/* Event Type (Multi Select) */}
				<Form.Group className="mb-4">
					<Form.Label>Tipe Event</Form.Label>
					<Select
						isMulti
						value={formData.eventType}
						options={eventTypeOptions}
						isLoading={isEventTypeLoading} // Menampilkan spinner saat fetch
						onMenuOpen={fetchEventTypes} // Trigger API saat dropdown diklik
						placeholder="Pilih Tipe Event (Bisa lebih dari satu)..."
						className="basic-multi-select"
						classNamePrefix="select test"
						onChange={selected => handleSelectChange('eventType', selected)}
					/>
				</Form.Group>
				{/* Kategori (Multi Select) */}
				<Form.Group className="mb-4">
					<Form.Label>Kategori Event</Form.Label>
					<Select
						isMulti
						value={formData.kategori}
						options={kategoriOptions}
						isLoading={isKategoriLoading} // Menampilkan spinner saat fetch
						onMenuOpen={fetchCategories} // Trigger API saat dropdown diklik
						placeholder="Pilih kategori (Bisa lebih dari satu)..."
						className="basic-multi-select"
						classNamePrefix="select form-select"
						onChange={selected => handleSelectChange('kategori', selected)}
					/>
				</Form.Group>
				{/* Media Banner tetap sama */}
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
										? // Cek apakah formData.banner adalah File Object (punya properti name)
											// Jika bukan (berarti string URL), ambil potongan terakhir dari URL tersebut
											formData.banner.name || formData.banner.split('/').pop()
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
										? formData.banner.preview // Jika file baru, gunakan URL blob temporary
										: formData.banner // Jika string (dari database), gunakan langsung
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
