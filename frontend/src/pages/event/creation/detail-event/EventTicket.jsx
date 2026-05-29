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
	const [saved, setSaved] = useState(true);
	const { eventId } = useParams();
	const { eventStatus, hasParticipants, participantCount } = useEventMeta(eventId);

	const update = (id, patch) => {
		setTickets((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
		setSaved(false);
	};

	useEffect(() => {
		// Auto-save logic (debounced)
		const fetchData = async () => {
			try {
				const response = await api.get(`/event-dashboard/${eventId}/info-utama/tickets`);
				const result = response.data;
				setTickets(result.data || []);
				setEventStartDate(result.event_start_date || '');
				// console.log(result.data);
			} catch (err) {
				console.error('Error saving tickets:', err);
			}
		};

		if (tickets.length === 0) {
			fetchData();
		}
	}, [tickets, eventId]);

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
				notify('error', 'Gagal!', `Harga untuk "${ticketLabel}" harus lebih dari 0 atau centang opsi Gratis.`);
				return;
			}

			if (!t.unlimited && (!t.capacity || parseInt(t.capacity) <= 0)) {
				notify('error', 'Gagal!', `Kapasitas untuk "${ticketLabel}" harus lebih dari 0 atau centang opsi Tak terbatas.`);
				return;
			}

			if (!t.sale_start && !t.saleStart) {
				notify('error', 'Gagal!', `Waktu Mulai Pendaftaran untuk "${ticketLabel}" wajib ditentukan.`);
				return;
			}

			if (!t.sale_end && !t.saleEnd) {
				notify('error', 'Gagal!', `Waktu Akhir Pendaftaran untuk "${ticketLabel}" wajib ditentukan.`);
				return;
			}

			// Validasi Tanggal
			const saleStartStr = t.sale_start || t.saleStart;
			const saleEndStr = t.sale_end || t.saleEnd;
			const now = new Date();
			const tzoffset = now.getTimezoneOffset() * 60000;
			const todayStr = new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
			const maxStr = eventStartDate ? new Date(new Date(eventStartDate).getTime() - tzoffset).toISOString().slice(0, 16) : '';

			if (saleStartStr) {
				const sVal = saleStartStr.slice(0, 16);
				if (sVal < todayStr) {
					notify('error', 'Gagal!', `Mulai Pendaftaran untuk "${ticketLabel}" tidak bisa kurang dari hari ini.`);
					return;
				}
				if (maxStr && sVal >= maxStr) {
					notify('error', 'Gagal!', `Mulai Pendaftaran untuk "${ticketLabel}" tidak bisa melebihi atau sama dengan hari H acara.`);
					return;
				}
				if (saleEndStr) {
					const eVal = saleEndStr.slice(0, 16);
					if (sVal >= eVal) {
						notify('error', 'Gagal!', `Mulai Pendaftaran untuk "${ticketLabel}" tidak bisa melebihi atau sama dengan Akhir Pendaftaran.`);
						return;
					}
				}
			}

			if (saleEndStr) {
				const eVal = saleEndStr.slice(0, 16);
				if (eVal < todayStr) {
					notify('error', 'Gagal!', `Akhir Pendaftaran untuk "${ticketLabel}" tidak bisa kurang dari hari ini.`);
					return;
				}
				if (maxStr && eVal > maxStr) {
					notify('error', 'Gagal!', `Akhir Pendaftaran untuk "${ticketLabel}" tidak bisa melebihi hari H acara.`);
					return;
				}
				if (saleStartStr) {
					const sVal = saleStartStr.slice(0, 16);
					if (eVal <= sVal) {
						notify('error', 'Gagal!', `Akhir Pendaftaran untuk "${ticketLabel}" tidak bisa kurang dari atau sama dengan Mulai Pendaftaran.`);
						return;
					}
				}
			}
		}

		// 1. Format ulang data agar sesuai dengan validasi Laravel (snake_case)
		const formattedTickets = tickets.map((t) => ({
			id: t.id,
			name: t.name,
			type: t.type || 'offline', // Pastikan type tidak kosong
			is_free: t.isFree ?? t.is_free, // Handle properti isFree
			price: t.price ? parsePriceNum(t.price) : 0, // Bersihkan format "Rp 100.000" menjadi angka murni
			capacity: t.unlimited ? null : parseInt(t.capacity) || null,
			sale_start: t.saleStart ?? t.sale_start ?? null,
			sale_end: t.saleEnd ?? t.sale_end ?? null,
			description: t.description || null,
		}));

		// 2. Bungkus array ke dalam object dengan key 'tickets'
		const payload = {
			tickets: formattedTickets,
		};

		console.log('Payload yang dikirim:', payload);

		try {
			const response = await api.post(
				`event-dashboard/${eventId}/info-utama/tickets`,
				payload,
			);
			console.log('Sukses update:', response.data);
			setSaved(true);
			if (response.data?.notified_participants || shouldNotify) {
				notify('success', 'Berhasil!', 'Data tiket berhasil disimpan. Peserta terdaftar telah dikirimi notifikasi perubahan.');
			} else {
				notify('success', 'Berhasil!', 'Data tiket berhasil disimpan.');
			}
		} catch (error) {
			// Log error dari response Laravel agar tahu persis kolom mana yang gagal validasi
			console.error('Gagal update data:', error.response?.data?.errors || error.message);
		}
	};

	const isCurrentStepCompleted = tickets.length > 0 && tickets.every(t => {
		const hasName = t.name && t.name.trim() !== '';
		const hasPrice = t.isFree || (t.price && parsePriceNum(t.price) > 0);
		const hasCapacity = t.unlimited || (t.capacity && parseInt(t.capacity) > 0);
		const hasSaleStart = t.sale_start || t.saleStart;
		const hasSaleEnd = t.sale_end || t.saleEnd;
		
		if (!hasName || !hasPrice || !hasCapacity || !hasSaleStart || !hasSaleEnd) {
			return false;
		}

		// Validasi Tanggal Tiket (Kurang dari hari ini, hari H, atau salah urutan)
		const startVal = t.sale_start || t.saleStart;
		const endVal = t.sale_end || t.saleEnd;
		const now = new Date();
		const tzoffset = now.getTimezoneOffset() * 60000;
		const todayStr = new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
		const maxStr = eventStartDate ? new Date(new Date(eventStartDate).getTime() - tzoffset).toISOString().slice(0, 16) : '';

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
			eventStatus={eventStatus}
			hasParticipants={hasParticipants}
			isCurrentStepCompleted={isCurrentStepCompleted}
			isSaveDisabled={!isCurrentStepCompleted}
		>
			{/* Banner peringatan harga terkunci */}
			{hasParticipants && (
				<div style={{
					display: 'flex',
					alignItems: 'flex-start',
					gap: 12,
					padding: '14px 16px',
					background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
					border: '1.5px solid #f59e0b',
					borderRadius: 10,
					marginBottom: 16,
				}}>
					<span style={{ fontSize: 20, lineHeight: 1, marginTop: 2 }}>⚠️</span>
					<div>
						<p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#92400e' }}>
							Harga tiket tidak dapat diubah
						</p>
						<p style={{ margin: 0, fontSize: '0.82rem', color: '#78350f', marginTop: 3, lineHeight: 1.5 }}>
							Sudah ada <strong>{participantCount} peserta</strong> yang mendaftar dengan harga yang berlaku saat ini.
							Untuk menjaga keadilan, harga dan status gratis/berbayar tidak bisa dimodifikasi.
							Kamu masih bisa mengubah kapasitas, deskripsi, dan periode penjualan.
						</p>
					</div>
				</div>
			)}

			{/* Ticket cards */}
			<div className="d-flex flex-column gap-2">
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
						/>
					))}
			</div>
		</EventLayout>
	);
}
