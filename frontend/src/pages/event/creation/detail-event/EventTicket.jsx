import React, { useState } from 'react';
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

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED = [
	{
		id: 't1',
		name: 'Online',
		isFree: false,
		price: '75000',
		capacity: '300',
		unlimited: false,
		saleStart: '2026-06-01T08:00',
		saleEnd: '2026-07-19T23:59',
		description: '',
		sold: 225,
	},
	{
		id: 't2',
		name: 'Offline',
		isFree: false,
		price: '150000',
		capacity: '200',
		unlimited: false,
		saleStart: '2026-06-01T08:00',
		saleEnd: '2026-07-10T23:59',
		description: '',
		sold: 94,
	},
];

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

// ── Main ──────────────────────────────────────────────────────────────────────

export default function EventTicket() {
	const [tickets, setTickets] = useState(SEED);
	const [saved, setSaved] = useState(true);

	const update = (id, patch) => {
		setTickets((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
		setSaved(false);
	};

	const addTicket = () => {
		const newT = {
			id: `t${Date.now()}`,
			name: '',
			isFree: false,
			price: '',
			capacity: '',
			unlimited: false,
			saleStart: '',
			saleEnd: '',
			description: '',
			sold: 0,
		};
		setTickets((ts) => [...ts, newT]);
		setSaved(false);
	};

	const remove = (id) => {
		setTickets((ts) => ts.filter((t) => t.id !== id));
		setSaved(false);
	};

	// Summary stats
	const totalCap = tickets.reduce((s, t) => s + (t.unlimited ? 0 : parseInt(t.capacity) || 0), 0);
	const hasUnlimited = tickets.some((t) => t.unlimited);
	const totalSold = tickets.reduce((s, t) => s + t.sold, 0);
	const revenue = tickets.reduce(
		(s, t) => s + (t.isFree ? 0 : parsePriceNum(t.price) * t.sold),
		0,
	);

	return (
		<EventLayout
			heading="Harga & Tipe Tiket"
			subheading="Konfigurasikan skema tiket, kapasitas, dan jadwal penjualan."
			sidebar={
				<TicketSummary
					tickets={tickets}
					hasUnlimited={hasUnlimited}
					totalCap={totalCap}
					totalSold={totalSold}
					revenue={revenue}
				/>
			}>
			{/* Ticket cards */}
			<div className="d-flex flex-column gap-3 w-100">
				{tickets.map((t, idx) => (
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

			{/* <div className="flex-grow-1 overflow-auto">
					<div style={{ maxWidth: '680px' }}>
						{/* Section label */}
			{/* <p
							className="text-uppercase text-muted fw-bold mb-3"
							style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
							Tipe Kehadiran
						</p> */}

			{/* Ticket cards */}
			<div className="d-flex flex-column gap-2">
				{tickets.map((t, idx) => (
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

			{/* Add ticket */}
			{/* <Button
							variant="outline-secondary"
							onClick={addTicket}
							className="w-100 mt-3 d-flex align-items-center justify-content-center gap-2"
							style={{ borderStyle: 'dashed' }}>
							<Plus size={16} /> Tambah tipe tiket
						</Button> */}

			{/* Save bar */}
			{/* <div className="d-flex justify-content-end gap-2 mt-2 pt-3 border-top">
							<Button variant="light" className="border text-muted">
								Batal
							</Button>
							<Button variant="dark" onClick={() => setSaved(true)}>
								Simpan
							</Button>
						</div> */}
			{/* </div>
				</div>
			</div> */}

			{/* ── Right: Summary ── */}
			{/* <TicketSummary
				tickets={tickets}
				hasUnlimited={hasUnlimited}
				totalCap={totalCap}
				totalSold={totalSold}
				revenue={revenue}
			/> */}
		</EventLayout>
	);
}
