import React, { useState, useEffect, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import EventLayout from '@/layouts/EventLayout';
import Step1_TypeSelection from './sections/event-location/Step1_TypeSelection';
import Step2_DetailLocation from './sections/event-location/Step2_DetailLocation';
import api from '@/api/axios';
import { notify } from '@/utils/notify';
import useEventMeta from '@/hooks/useEventMeta';
import { MousePointerClick } from 'lucide-react';

// 1. Ekstraksi State Awal ke Luar Komponen
const INITIAL_FORM_DATA = {
	type: '',
	platform: '',
	meeting_link: '',
	online_instruction: '',
	location_name: '',
	location_detail: '',
	maps_url: '',
	offline_instruction: '',
	latitude: '',
	longitude: '',
	country: '',
	province: '',
	city: '',
	district: '',
	address_detail: '',
	is_online_quota_unlimited: false,
	is_offline_quota_unlimited: false,
	online_quota: 0,
	offline_quota: 0,
};

// 2. Helper untuk Memetakan Payload API Berdasarkan Tipe
const createPayload = (type, data) => {
	const payload = {
		type,
		is_online_quota_unlimited: data.is_online_quota_unlimited,
		is_offline_quota_unlimited: data.is_offline_quota_unlimited,
		online_quota: data.online_quota,
		offline_quota: data.offline_quota,
	};

	if (type === 'online' || type === 'hybrid') {
		payload.platform = data.platform;
		payload.meeting_link = data.meeting_link?.trim() || null;
		payload.online_instruction = data.online_instruction?.trim() || null;
	}

	if (type === 'offline' || type === 'hybrid') {
		payload.location_name = data.location_name;
		payload.location_detail = data.location_detail;
		payload.maps_url = data.maps_url?.trim() || null;
		payload.offline_instruction = data.offline_instruction?.trim() || null;
		payload.latitude = data.latitude || null;
		payload.longitude = data.longitude || null;
		payload.country = data.country;
		payload.province = data.province;
		payload.city = data.city;
		payload.district = data.district;
		payload.address_detail = data.address_detail;
	}

	return payload;
};

const EventLocation = () => {
	const { eventId } = useParams();
	const { setIsPageLoading } = useOutletContext() || {};

	const [errors, setErrors] = useState({});
	const [touched, setTouched] = useState({});
	const [selectedType, setSelectedType] = useState(null);
	const [formData, setFormData] = useState(INITIAL_FORM_DATA);

	const { eventStatus, hasParticipants } = useEventMeta(eventId);
	const hasFetched = useRef(false);

	useEffect(() => {
		if (hasFetched.current || !eventId) return;

		const fetchLocationData = async () => {
			if (setIsPageLoading) setIsPageLoading(true);
			try {
				const response = await api.get(`event-dashboard/${eventId}/info-utama/location`);
				const result = response.data;

				if (result.status === 'success' && result.data) {
					const d = result.data;
					setSelectedType(d.type);

					setFormData({
						type: d.type ?? '',
						platform: d.platform ?? '',
						meeting_link: d.meeting_link ?? '',
						online_instruction: d.online_instruction ?? '',
						location_name: d.location_name ?? '',
						location_detail: d.location_detail ?? '',
						maps_url: d.maps_url ?? '',
						offline_instruction: d.offline_instruction ?? '',
						latitude: d.latitude ?? '',
						longitude: d.longitude ?? '',
						country: d.country ?? '',
						province: d.province ?? '',
						city: d.city ?? '',
						district: d.district ?? '',
						address_detail: d.address_detail ?? '',
						is_online_quota_unlimited: d.online_quota === null,
						is_offline_quota_unlimited: d.offline_quota === null,
						online_quota: d.online_quota ?? 0,
						offline_quota: d.offline_quota ?? 0,
					});

					hasFetched.current = true;
				}
			} catch (error) {
				console.error('Gagal mengambil data event:', error);
			} finally {
				if (setIsPageLoading) setIsPageLoading(false);
			}
		};

		fetchLocationData();
	}, [eventId, setIsPageLoading]);

	const handleChange = (e) => {
		const { name, type: inputType, checked, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: inputType === 'checkbox' ? checked : value,
		}));
	};

	const handleBlur = (field) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
	};

	const handleSave = async (shouldNotify = false) => {
		setTouched({
			platform: true,
			meeting_link: true,
			location_name: true,
			province: true,
			city: true,
			address_detail: true,
			maps_url: true,
		});
		setErrors({});

		const payload = createPayload(selectedType, formData);

		try {
			const response = await api.post(
				`event-dashboard/${eventId}/info-utama/location`,
				payload,
				{
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
				},
			);

			if (response.data?.notified_participants || shouldNotify) {
				notify(
					'success',
					'Berhasil!',
					'Perubahan tempat acara telah disimpan. Peserta terdaftar telah dikirimi notifikasi perubahan.',
				);
			} else {
				notify('success', 'Berhasil!', 'Perubahan informasi utama telah disimpan.');
			}
		} catch (error) {
			if (error.response?.status === 422) {
				setErrors(error.response.data.errors);
			} else {
				const errorMsg = error.response?.data?.message || error.message;
				notify('error', 'Sistem Error!', errorMsg);
			}
			throw error;
		}
	};

	// 3. Logika Validasi Tunggal
	const getValidationErrors = () => {
		const errorsList = [];
		if (!selectedType) return ['Pilih tipe kehadiran terlebih dahulu.'];

		const isOnline = selectedType === 'online' || selectedType === 'hybrid';
		const isOffline = selectedType === 'offline' || selectedType === 'hybrid';

		if (isOnline && !formData.platform?.trim()) {
			errorsList.push('Platform wajib diisi.');
		}

		if (isOffline) {
			if (!formData.location_name?.trim())
				errorsList.push('Ringkasan Lokasi (Gedung/Tempat) wajib diisi.');
			if (!formData.province?.trim() || !formData.city?.trim())
				errorsList.push('Provinsi dan Kota wajib ditentukan.');
			if (!formData.address_detail?.trim()) errorsList.push('Alamat lengkap wajib diisi.');

			const hasCoords = formData.latitude && formData.longitude;
			const hasMaps = formData.maps_url?.trim() || hasCoords;
			if (!hasMaps) {
				errorsList.push(
					'Lokasi offline harus menyertakan Link Google Maps atau Titik Koordinat Peta.',
				);
			}
		}

		return errorsList;
	};

	const validationErrors = getValidationErrors();
	const isCurrentStepCompleted = selectedType ? validationErrors.length === 0 : false;

	return (
		<EventLayout
			title="Konfigurasi Teknis & Jadwal Event"
			description="Atur mode kehadiran, lokasi, dan detail sesi acara dalam satu tempat."
			nextPath="sesi"
			prevPath="info"
			onSave={handleSave}
			eventStatus={eventStatus}
			hasParticipants={hasParticipants}
			isCurrentStepCompleted={isCurrentStepCompleted}
		>
			<Step1_TypeSelection selectedType={selectedType} onSelectType={setSelectedType} />

			{selectedType ? (
				<>
					<Step2_DetailLocation
						selectedType={selectedType}
						formData={formData}
						onChange={handleChange}
						errors={errors}
						touched={touched}
						handleBlur={handleBlur}
					/>

					{!isCurrentStepCompleted && (
						<div
							style={{
								padding: '16px 20px',
								background: '#fff5f5',
								border: '1.5px solid #feb2b2',
								borderRadius: '12px',
								marginTop: '24px',
							}}
						>
							<h6
								style={{
									color: '#c53030',
									fontWeight: '700',
									marginBottom: '8px',
									fontSize: '0.9rem',
								}}
							>
								⚠️ Mohon lengkapi data tempat pelaksanaan berikut:
							</h6>
							<ul
								style={{
									margin: 0,
									paddingLeft: '20px',
									color: '#9b2c2c',
									fontSize: '0.85rem',
									lineHeight: '1.6',
								}}
							>
								{validationErrors.map((err, i) => (
									<li key={i}>{err}</li>
								))}
							</ul>
						</div>
					)}
				</>
			) : (
				<div className="d-flex align-items-center justify-content-center w-100">
					<div
						className="d-flex flex-column align-items-center justify-content-center p-5 w-100 text-center"
						style={{
							backgroundColor: '#F8F9FA',
							border: '2px dashed var(--color-border)',
							borderRadius: '12px',
							boxShadow: 'none',
						}}
					>
						{/* Ikon */}
						<div
							className="d-flex align-items-center justify-content-center mb-3"
							style={{
								backgroundColor: '#E9ECEF',
								border: '2px dashed var(--color-border)',
								borderRadius: '8px',
								width: '56px',
								height: '56px',
							}}
						>
							<MousePointerClick size={28} color="#6C757D" strokeWidth={2.5} />
						</div>

						{/* Teks Utama */}
						<h2 className="fs-4 fw-bold text-dark m-0 mb-2">
							Belum Ada Tipe Kehadiran
						</h2>

						{/* Sub-teks Penjelasan */}
						<p
							className="text-secondary m-0 fs-5"
						>
							Silakan pilih tipe kehadiran di atas terlebih dahulu untuk menampilkan
							detail form dan melanjutkan proses.
						</p>
					</div>
				</div>
			)}
		</EventLayout>
	);
};

export default EventLocation;
