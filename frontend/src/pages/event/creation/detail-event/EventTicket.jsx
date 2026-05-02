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
// ── Seed data ─────────────────────────────────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────────

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
	const [saved, setSaved] = useState(true);
	const { eventId } = useParams();

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
			} catch (err) {
				console.error('Error saving tickets:', err);
			}
		};

		if (tickets.length === 0) {
			fetchData();
		}
	}, [tickets, eventId]);

	const handleUpdate = async () => {
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
		} catch (error) {
			// Log error dari response Laravel agar tahu persis kolom mana yang gagal validasi
			console.error('Gagal update data:', error.response?.data?.errors || error.message);
		}
	};

	return (
		<EventLayout
			heading="Harga & Tipe Tiket"
			subheading="Konfigurasikan skema tiket, kapasitas, dan jadwal penjualan."
			sidebar={<TicketSummary tickets={tickets} />}
			onSave={handleUpdate}>
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
						/>
					))}
			</div>
		</EventLayout>
	);
}
