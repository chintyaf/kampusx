import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Plus, Trash2, ChevronDown, Tag, Users, Calendar, DollarSign, Ticket } from 'lucide-react';
import {
	Container,
	Row,
	Col,
	Card,
	Form,
	Button,
	Badge,
	InputGroup,
	ProgressBar,
	Collapse,
} from 'react-bootstrap';
import EventLayout from '@/layouts/EventLayout';
import FormHeading from '@/components/dashboard/FormHeading';
import TicketCard from '@/pages/event/creation/detail-event/sections/event-ticket/TicketCard';
import TicketSummary from '@/pages/event/creation/detail-event/sections/event-ticket/TicketSummary';
import api from '@/api/axios';
import { notify } from '@/utils/notify';
import useEventMeta from '@/hooks/useEventMeta';

function formatRp(val) {
	if (!val) return '';
	const n = parseInt(String(val).replace(/\D/g, ''), 10);
	if (isNaN(n)) return '';
	return n.toLocaleString('id-ID');
}

function parsePriceNum(val) {
	if (!val) return 0;
	return parseInt(String(val).replace(/\D/g, ''), 10) || 0;
}

export default function EventTicket() {
	const [tickets, setTickets] = useState([]);
	const [eventStartDate, setEventStartDate] = useState('');
	const [locationType, setLocationType] = useState('offline'); // KEMBALIKAN STATE INI
	const [saved, setSaved] = useState(true);
	const { eventId } = useParams();
	const { eventStatus, hasParticipants, participantCount } = useEventMeta(eventId);

	const update = (id, patch) => {
		setTickets((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
		setSaved(false);
	};

	// KEMBALIKAN FUNGSI HAPUS TIKET
	const remove = (id) => {
		setTickets((ts) => ts.filter((t) => t.id !== id));
		setSaved(false);
	};

	// KEMBALIKAN FUNGSI TAMBAH TIKET (Penting agar ada temporary ID)
	const addTicket = () => {
		const tempId = `new-${Date.now()}`;
		setTickets((ts) => [
			...ts,
			{
				id: tempId,
				name: '',
				type: locationType === 'online' ? 'online' : 'offline',
				isFree: false,
				price: 0,
				capacity: null,
				unlimited: true,
				sale_start: null,
				sale_end: null,
				description: null,
			},
		]);
		setSaved(false);
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await api.get(`/event-dashboard/${eventId}/info-utama/tickets`);
				const result = response.data;
				const formattedFromApi = (result.data || []).map((t) => ({
					...t,
					unlimited: t.unlimited ?? (t.capacity === null || t.capacity === undefined),
				}));
				setTickets(formattedFromApi);
				setEventStartDate(result.event_start_date || '');
				setLocationType(result.location_type || 'offline'); // SIMPAN LOCATION TYPE DARI API
			} catch (err) {
				console.error('Error saving tickets:', err);
			}
		};

		if (tickets.length === 0) {
			fetchData();
		}
	}, [tickets.length, eventId]);

	const handleUpdate = async (shouldNotify = false) => {
		// Validasi kelengkapan data di frontend
		for (let i = 0; i < tickets.length; i++) {
			const t = tickets[i];
			const ticketLabel = t.name || `Tiket ke-${i + 1}`;

			if (!t.name || t.name.trim() === '') {
				notify('error', 'Gagal!', 'Nama tiket wajib diisi.');
				return;
			}

			if (!t.isFree && (!t.price || parsePriceNum(t.price) <= 0)) {
				notify(
					'error',
					'Gagal!',
					`Harga untuk "${ticketLabel}" harus lebih dari 0 atau centang opsi Gratis.`,
				);
				return;
			}

			if (!t.unlimited && (!t.capacity || parseInt(t.capacity) <= 0)) {
				notify(
					'error',
					'Gagal!',
					`Kapasitas untuk "${ticketLabel}" harus lebih dari 0 atau centang opsi Tak terbatas.`,
				);
				return;
			}

			if (!t.sale_start && !t.saleStart) {
				notify(
					'error',
					'Gagal!',
					`Waktu Mulai Pendaftaran untuk "${ticketLabel}" wajib ditentukan.`,
				);
				return;
			}

			if (!t.sale_end && !t.saleEnd) {
				notify(
					'error',
					'Gagal!',
					`Waktu Akhir Pendaftaran untuk "${ticketLabel}" wajib ditentukan.`,
				);
				return;
			}

			// Validasi Tanggal
			const saleStartStr = t.sale_start || t.saleStart;
			const saleEndStr = t.sale_end || t.saleEnd;
			const now = new Date();
			const tzoffset = now.getTimezoneOffset() * 60000;
			const todayStr = new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
			const maxStr = eventStartDate
				? new Date(new Date(eventStartDate).getTime() - tzoffset).toISOString().slice(0, 16)
				: '';

			if (saleStartStr) {
				const sVal = saleStartStr.slice(0, 16);
				if (sVal < todayStr) {
					notify(
						'error',
						'Gagal!',
						`Mulai Pendaftaran untuk "${ticketLabel}" tidak bisa kurang dari hari ini.`,
					);
					return;
				}
				if (maxStr && sVal >= maxStr) {
					notify(
						'error',
						'Gagal!',
						`Mulai Pendaftaran untuk "${ticketLabel}" tidak bisa melebihi atau sama dengan hari H acara.`,
					);
					return;
				}
				if (saleEndStr) {
					const eVal = saleEndStr.slice(0, 16);
					if (sVal >= eVal) {
						notify(
							'error',
							'Gagal!',
							`Mulai Pendaftaran untuk "${ticketLabel}" tidak bisa melebihi atau sama dengan Akhir Pendaftaran.`,
						);
						return;
					}
				}
			}

			if (saleEndStr) {
				const eVal = saleEndStr.slice(0, 16);
				if (eVal < todayStr) {
					notify(
						'error',
						'Gagal!',
						`Akhir Pendaftaran untuk "${ticketLabel}" tidak bisa kurang dari hari ini.`,
					);
					return;
				}
				if (maxStr && eVal > maxStr) {
					notify(
						'error',
						'Gagal!',
						`Akhir Pendaftaran untuk "${ticketLabel}" tidak bisa melebihi hari H acara.`,
					);
					return;
				}
				if (saleStartStr) {
					const sVal = saleStartStr.slice(0, 16);
					if (eVal <= sVal) {
						notify(
							'error',
							'Gagal!',
							`Akhir Pendaftaran untuk "${ticketLabel}" tidak bisa kurang dari atau sama dengan Mulai Pendaftaran.`,
						);
						return;
					}
				}
			}
		}

		// 1. Format ulang data agar sesuai dengan validasi Laravel (snake_case)
		const formattedTickets = tickets.map((t) => {
			// Tangani kapasitas: Jika unlimited, kirim null secara eksplisit.
			// Jika tidak, parsing sebagai Integer. Jika gagal di-parsing, kirim null.
			let finalCapacity = null;
			if (!t.unlimited) {
				const parsedCap = parseInt(t.capacity, 10);
				finalCapacity = !isNaN(parsedCap) && parsedCap > 0 ? parsedCap : null;
			}

			return {
				id: String(t.id).startsWith('new-') ? null : t.id,
				name: t.name,
				type: t.type || 'offline',
				is_free: t.isFree ?? t.is_free,
				price: (t.isFree ?? t.is_free) ? 0 : t.price ? parsePriceNum(t.price) : 0,
				capacity: finalCapacity, // <--- PERBAIKAN DI SINI
				sale_start: t.saleStart ?? t.sale_start ?? null,
				sale_end: t.saleEnd ?? t.sale_end ?? null,
				description: t.description || null,
			};
		});

		const payload = {
			tickets: formattedTickets,
		};

		try {
			const response = await api.post(
				`event-dashboard/${eventId}/info-utama/tickets`,
				payload,
			);
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
		}
	};

	const isCurrentStepCompleted =
		tickets.length > 0 &&
		tickets.every((t) => {
			const hasName = t.name && t.name.trim() !== '';
			const hasPrice = t.isFree || (t.price && parsePriceNum(t.price) > 0);
			const hasCapacity = t.unlimited || (t.capacity && parseInt(t.capacity) > 0);
			const hasSaleStart = t.sale_start || t.saleStart;
			const hasSaleEnd = t.sale_end || t.saleEnd;

			if (!hasName || !hasPrice || !hasCapacity || !hasSaleStart || !hasSaleEnd) {
				return false;
			}

			const startVal = t.sale_start || t.saleStart;
			const endVal = t.sale_end || t.saleEnd;
			const now = new Date();
			const tzoffset = now.getTimezoneOffset() * 60000;
			const todayStr = new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
			const maxStr = eventStartDate
				? new Date(new Date(eventStartDate).getTime() - tzoffset).toISOString().slice(0, 16)
				: '';

			if (startVal) {
				const sVal = startVal.slice(0, 16);
				if (sVal < todayStr) return false;
				if (maxStr && sVal >= maxStr) return false;
				if (endVal) {
					const eVal = endVal.slice(0, 16);
					if (sVal >= eVal) return false;
				}
			}

			if (endVal) {
				const eVal = endVal.slice(0, 16);
				if (eVal < todayStr) return false;
				if (maxStr && eVal > maxStr) return false;
				if (startVal) {
					const sVal = startVal.slice(0, 16);
					if (eVal <= sVal) return false;
				}
			}

			return true;
		});

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
							style={{
								margin: 0,
								fontWeight: 700,
								fontSize: '0.88rem',
								color: '#92400e',
							}}
						>
							Harga tiket tidak bisa diubah
						</p>
						<p
							style={{
								margin: 0,
								fontSize: '0.82rem',
								color: '#78350f',
								marginTop: 3,
								lineHeight: 1.5,
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
					{tickets &&
						tickets.map((t, idx) => (
							<TicketCard
								key={t.id}
								ticket={t}
								index={idx}
								onChange={(patch) => update(t.id, patch)}
								onDelete={() => remove(t.id)}
								canDelete={tickets.length > 1}
								priceLocked={hasParticipants}
								eventStartDate={eventStartDate}
								locationType={locationType} // PASS PROPS INI AGAR DROPDOWN MUNCUL
							/>
						))}
				</div>

				<Button
					className="btn-add d-flex align-items-center gap-1 p-3 "
					onClick={addTicket} // GUNAKAN FUNGSI YANG SUDAH DIPERBAIKI
				>
					<Plus size={18} />
					Tambah Tiket
				</Button>
			</div>
		</EventLayout>
	);
}
