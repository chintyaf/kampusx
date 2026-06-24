import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import EventLayout from '@/layouts/EventLayout';
import TicketCard from '@/pages/event/creation/detail-event/sections/event-ticket/TicketCard';
import TicketSummary from '@/pages/event/creation/detail-event/sections/event-ticket/TicketSummary';
import api from '@/api/axios';
import { notify } from '@/utils/notify';
import useEventMeta from '@/hooks/useEventMeta';
import TicketPrerequisitesWarning from './sections/event-location/TicketPrerequisitesWarning';

// Helper: Ekstrak logika parsing harga
const parsePriceNum = (val) => {
	if (val === undefined || val === null || val === '') return 0;
	const cleanVal = String(val).split('.')[0];
	return parseInt(cleanVal.replace(/\D/g, ''), 10) || 0;
};

// Helper: Dapatkan string ISO lokal (YYYY-MM-DDTHH:mm)
const getLocalIsoString = (date = new Date()) => {
	const tzoffset = date.getTimezoneOffset() * 60000;
	return new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
};

export default function EventTicket() {
	const { eventId } = useParams();
	const { setIsPageLoading } = useOutletContext() || {};
	const { eventStatus, hasParticipants, participantCount } = useEventMeta(eventId);

	const [tickets, setTickets] = useState([]);
	const [eventStartDate, setEventStartDate] = useState('');
	const [eventEndDate, setEventEndDate] = useState('');
	const [locationType, setLocationType] = useState('offline');
	const [saved, setSaved] = useState(true);
	const [error, setError] = useState(null);
	const hasFetched = useRef(false);

	const update = useCallback((id, patch) => {
		setTickets((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
		setSaved(false);
	}, []);

	const remove = useCallback((id) => {
		setTickets((ts) => ts.filter((t) => t.id !== id));
		setSaved(false);
	}, []);

	useEffect(() => {
		if (hasFetched.current || !eventId) return;

		const fetchData = async () => {
			if (setIsPageLoading) setIsPageLoading(true);
			try {
				const {
					data: { data: resultTickets = [], event_start_date, event_end_date, location_type },
				} = await api.get(`/event-dashboard/${eventId}/info-utama/tickets`);

				const formattedFromApi = resultTickets.map((t) => ({
					...t,
					unlimited: t.unlimited ?? (t.capacity === null || t.capacity === undefined),
				}));

				setTickets(formattedFromApi);
				setEventStartDate(event_start_date || '');
				setEventEndDate(event_end_date || '');
				setLocationType(location_type || 'offline');
				setError(null);
				hasFetched.current = true;
			} catch (err) {
				console.error('Error fetching tickets:', err);
				setError(
					err.response?.data || { message: 'Terjadi kesalahan saat memuat data tiket.' },
				);
			} finally {
				if (setIsPageLoading) setIsPageLoading(false);
			}
		};

		fetchData();
	}, [eventId, setIsPageLoading]);

	const handleUpdate = async (shouldNotify = false) => {
		const todayStr = getLocalIsoString();
		const maxStartStr = eventStartDate ? getLocalIsoString(new Date(eventStartDate)) : '';
		const maxEndStr = eventEndDate ? getLocalIsoString(new Date(eventEndDate)) : maxStartStr;

		// 1. Validasi Frontend
		for (let i = 0; i < tickets.length; i++) {
			const t = tickets[i];
			const label = t.name || `Tiket ke-${i + 1}`;
			const startVal = (t.sale_start || t.saleStart)?.slice(0, 16);
			const endVal = (t.sale_end || t.saleEnd)?.slice(0, 16);

			if (!t.name?.trim()) return notify('error', 'Gagal!', 'Nama tiket wajib diisi.');
			if (!t.isFree && parsePriceNum(t.price) <= 0)
				return notify(
					'error',
					'Gagal!',
					`Harga untuk "${label}" harus lebih dari 0 atau Gratis.`,
				);
			if (!t.unlimited && (!t.capacity || parseInt(t.capacity) <= 0))
				return notify(
					'error',
					'Gagal!',
					`Kapasitas untuk "${label}" harus lebih dari 0 atau Tak terbatas.`,
				);

			if (!startVal)
				return notify(
					'error',
					'Gagal!',
					`Waktu Mulai Pendaftaran "${label}" wajib ditentukan.`,
				);
			if (!endVal)
				return notify(
					'error',
					'Gagal!',
					`Waktu Akhir Pendaftaran "${label}" wajib ditentukan.`,
				);

			if (eventStatus === 'draft' && startVal < todayStr)
				return notify(
					'error',
					'Gagal!',
					`Mulai Pendaftaran "${label}" tidak bisa kurang dari hari ini.`,
				);
			if (maxStartStr && startVal >= maxStartStr)
				return notify(
					'error',
					'Gagal!',
					`Mulai Pendaftaran "${label}" tidak bisa melebihi atau sama dengan hari H.`,
				);
			if (eventStatus === 'draft' && endVal < todayStr)
				return notify(
					'error',
					'Gagal!',
					`Akhir Pendaftaran "${label}" tidak bisa kurang dari hari ini.`,
				);
			if (maxEndStr && endVal > maxEndStr)
				return notify(
					'error',
					'Gagal!',
					`Akhir Pendaftaran "${label}" tidak bisa melebihi hari H acara.`,
				);
			if (endVal <= startVal)
				return notify(
					'error',
					'Gagal!',
					`Akhir Pendaftaran "${label}" tidak bisa kurang dari atau sama dengan Mulai Pendaftaran.`,
				);
		}

		// 2. Format Payload
		const formattedTickets = tickets.map((t) => {
			const isUnlimited = t.unlimited;
			const parsedCap = parseInt(t.capacity, 10);
			const isFree = t.isFree ?? t.is_free;

			return {
				id: String(t.id).startsWith('new-') ? null : t.id,
				name: t.name,
				type: t.type || 'offline',
				is_free: isFree,
				price: isFree ? 0 : parsePriceNum(t.price),
				capacity: !isUnlimited && !isNaN(parsedCap) && parsedCap > 0 ? parsedCap : null,
				sale_start: t.saleStart ?? t.sale_start ?? null,
				sale_end: t.saleEnd ?? t.sale_end ?? null,
				description: t.description || null,
			};
		});

		// 3. Eksekusi API
		try {
			const response = await api.post(`event-dashboard/${eventId}/info-utama/tickets`, {
				tickets: formattedTickets,
			});
			setSaved(true);

			if (response.data?.notified_participants || shouldNotify) {
				notify(
					'success',
					'Berhasil!',
					'Data tiket berhasil disimpan. Peserta terdaftar telah dikirimi notifikasi perubahan.',
				);
			} else {
				notify('success', 'Berhasil!', 'Data tiket berhasil disimpan.');
			}
		} catch (error) {
			console.error('Gagal update data:', error.response?.data?.errors || error.message);
			const errMsg =
				error.response?.data?.message || 'Terjadi kesalahan saat menyimpan tiket.';
			notify('error', 'Gagal!', errMsg);
		}
	};

	const isCurrentStepCompleted = useMemo(() => {
		if (tickets.length === 0) return false;

		const todayStr = getLocalIsoString();
		const maxStartStr = eventStartDate ? getLocalIsoString(new Date(eventStartDate)) : '';
		const maxEndStr = eventEndDate ? getLocalIsoString(new Date(eventEndDate)) : maxStartStr;

		return tickets.every((t) => {
			const hasName = t.name?.trim();
			const hasPrice = t.isFree || parsePriceNum(t.price) > 0;
			const hasCapacity = t.unlimited || parseInt(t.capacity) > 0;
			const startVal = (t.sale_start || t.saleStart)?.slice(0, 16);
			const endVal = (t.sale_end || t.saleEnd)?.slice(0, 16);

			if (!hasName || !hasPrice || !hasCapacity || !startVal || !endVal) return false;

			if (eventStatus === 'draft') {
				if (startVal < todayStr || (maxStartStr && startVal >= maxStartStr)) return false;
				if (endVal < todayStr || (maxEndStr && endVal > maxEndStr)) return false;
			} else {
				if (maxStartStr && startVal >= maxStartStr) return false;
				if (maxEndStr && endVal > maxEndStr) return false;
			}
			if (endVal <= startVal) return false;

			return true;
		});
	}, [tickets, eventStartDate, eventEndDate, eventStatus]);

	if (error) {
		return (
			<TicketPrerequisitesWarning
				error={error}
				eventStatus={eventStatus}
				hasParticipants={hasParticipants}
			/>
		);
	}

	return (
		<EventLayout
			title="Harga & Tipe Tiket"
			description="Konfigurasikan skema tiket, kapasitas, dan jadwal penjualan."
			sidebar={<TicketSummary tickets={tickets} />}
			onSave={handleUpdate}
			prevPath="sesi"
			nextPath=""
			eventStatus={eventStatus}
			hasParticipants={hasParticipants}
			isCurrentStepCompleted={isCurrentStepCompleted}
			isSaveDisabled={!isCurrentStepCompleted}
		>
			{hasParticipants && (
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-start',
						gap: 12,
						padding: '14px 16px',
						background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
						border: '1.5px solid #f59e0b',
						borderRadius: 10,
					}}
				>
					<span style={{ fontSize: 20, lineHeight: 1, marginTop: 2 }}>⚠️</span>
					<div>
						<p
							className="mb-1 fs-4 fw-semibold"
							style={{
								color: '#92400e',
							}}
						>
							Harga tiket tidak bisa diubah
						</p>
						<p
							className="mb-0 fs-5 fw-medium "
							style={{
								color: '#78350f',
								marginTop: 3,
							}}
						>
							<strong>{participantCount} peserta</strong> telah mendaftar. Demi
							keadilan, harga dan tipe tiket tidak bisa diubah
						</p>
					</div>
				</div>
			)}

			<div>
				<div className="d-flex flex-column gap-2 mt-3">
					{tickets.map((t, idx) => (
						<TicketCard
							key={t.id}
							ticket={t}
							index={idx}
							onChange={(patch) => update(t.id, patch)}
							onDelete={() => remove(t.id)}
							canDelete={tickets.length > 1}
							priceLocked={hasParticipants}
							eventStartDate={eventStartDate}
							eventEndDate={eventEndDate}
							locationType={locationType}
							eventStatus={eventStatus}
						/>
					))}
				</div>
			</div>
		</EventLayout>
	);
}
