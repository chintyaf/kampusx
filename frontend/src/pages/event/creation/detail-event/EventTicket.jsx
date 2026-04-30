import { useState, useCallback } from 'react';
import { Row, Col, Card, Button, Alert, Form } from 'react-bootstrap';
import { MapPin, Globe, Star, PlusCircle, CheckCircle } from 'lucide-react';
import EventLayout from '@/layouts/EventLayout';

import {
	PLATFORM_FEE,
	FORMAT_OPTIONS,
	makeTier,
	initTiers,
} from './sections/event-ticket/constants';
import TechTag from './sections/event-ticket/TechTag';
import SectionHeader from './sections/event-ticket/SectionHeader';
import TierRow from './sections/event-ticket/TierRow';
import FormHeading from '@/components/dashboard/FormHeading';

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function EventTicket() {
	const [format, setFormat] = useState('offline');
	const [hybridTab, setHybridTab] = useState('offline');
	const [tiersOff, setTiersOff] = useState(initTiers(false));
	const [tiersOn, setTiersOn] = useState(initTiers(true));
	const [waitlist, setWaitlist] = useState(true);
	const [published, setPublished] = useState(false);
	const [idCounter, setIdCounter] = useState(10);

	/* helpers */
	const nextId = useCallback(() => {
		const id = idCounter + 1;
		setIdCounter(id);
		return id;
	}, [idCounter]);

	const isOnlineTab = format === 'online' || (format === 'hybrid' && hybridTab === 'online');

	const activeTiers = isOnlineTab ? tiersOn : tiersOff;
	const setActiveTiers = isOnlineTab ? setTiersOn : setTiersOff;

	const updateTier = (id, patch) =>
		setActiveTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
	const deleteTier = (id) => setActiveTiers((prev) => prev.filter((t) => t.id !== id));
	const addTier = () => {
		const id = nextId();
		setActiveTiers((prev) => [...prev, makeTier(id, isOnlineTab)]);
	};

	/* financial */
	const calcFinancial = () => {
		let cap = 0,
			gross = 0;
		const process = (arr) =>
			arr.forEach((t) => {
				cap += Number(t.capacity) || 0;
				gross += (Number(t.capacity) || 0) * (Number(t.price) || 0);
			});
		if (format !== 'online') process(tiersOff);
		if (format !== 'offline') process(tiersOn);
		return { cap, gross, net: gross * (1 - PLATFORM_FEE) };
	};
	const { cap, gross, net } = calcFinancial();

	const fmtConfig = FORMAT_OPTIONS.find((f) => f.key === format);

	/* all tiers for summary */
	const allTiers = [
		...(format !== 'online' ? tiersOff.map((t) => ({ ...t, isOnline: false })) : []),
		...(format !== 'offline' ? tiersOn.map((t) => ({ ...t, isOnline: true })) : []),
	];

	const handlePublish = () => {
		setPublished(true);
		setTimeout(() => setPublished(false), 3000);
	};

	/* ── RENDER ── */
	return (
		<EventLayout
			heading="Harga & Tipe Tiket"
			subheading="Konfigurasikan skema tiket, kapasitas, dan jadwal penjualan acara Anda."
			onSave={handlePublish}
			isFormDirty={false}>
			{published && (
				<Alert
					variant="success"
					className="d-flex align-items-center gap-2 mb-4"
					style={{ borderRadius: 10, fontSize: 13 }}>
					<CheckCircle size={15} />
					Tiket berhasil disimpan ke database (Schema `event_tickets`).
				</Alert>
			)}

			<Form>
				<FormHeading heading="Tipe Kehadiran" subheading="asdasd" className="mb-3" />
				<div>
					{activeTiers.map((tier) => (
						<TierRow
							key={tier.id}
							tier={tier}
							isOnline={isOnlineTab}
							onUpdate={updateTier}
							onDelete={deleteTier}
							canDelete={activeTiers.length > 1}
						/>
					))}
				</div>

				{/* <Button
					variant="outline-secondary"
					className="w-100 d-flex align-items-center justify-content-center gap-2"
					style={{
						borderRadius: 10,
						fontSize: 13,
						borderStyle: 'dashed',
						padding: '10px',
						color: '#888',
					}}
					onClick={addTier}>
					<PlusCircle size={15} />
					Tambah Tiket Baru
				</Button> */}
			</Form>
		</EventLayout>
	);
}
