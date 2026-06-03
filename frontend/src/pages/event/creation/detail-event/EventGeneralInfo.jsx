import { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import EventLayout from '@/layouts/EventLayout';
import api from '@/api/axios';
import { notify } from '@/utils/notify';
import useEventMeta from '@/hooks/useEventMeta';
import EventForm from './sections/event-info/EventForm';

const EventGeneralInfo = () => {
	const { eventId } = useParams();
	const { eventStatus, hasParticipants } = useEventMeta(eventId);
	const { setIsPageLoading } = useOutletContext() || {};

	const [formData, setFormData] = useState({
		title: '',
		description: '',
		banner: null,
		kategori: [],
		eventType: [],
		timezone: 'Asia/Jakarta',
		checkin_window_start: 30,
		checkin_window_end: 0,
	});
	const [touched, setTouched] = useState({});

	const handleBlur = (field) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
	};

	const handleTextChange = (e) => {
		const { name, value } = e.target;
		const formattedValue =
			name === 'title' ? value.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()) : value;
		setFormData((prev) => ({ ...prev, [name]: formattedValue }));
	};

	useEffect(() => {
		if (formData.banner) {
			setTouched((prev) => ({ ...prev, banner: true }));
		}
	}, [formData.banner]);

	// AMBIL DATA EVENT UTAMA SAAT MOUNT
	useEffect(() => {
		const fetchEventData = async () => {
			if (setIsPageLoading) setIsPageLoading(true);

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
						checkin_window_start: data.checkin_window_start ?? 30,
						checkin_window_end: data.checkin_window_end ?? 0,
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

	// SUBMIT DATA
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
		submitData.append('checkin_window_start', formData.checkin_window_start);
		submitData.append('checkin_window_end', formData.checkin_window_end);

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
		>
			<EventForm
				formData={formData}
				setFormData={setFormData}
				touched={touched}
				handleBlur={handleBlur}
				handleTextChange={handleTextChange}
			/>
		</EventLayout>
	);
};

export default EventGeneralInfo;
