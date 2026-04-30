import { useState, useCallback } from 'react';
import {
	Row,
	Col,
	Card,
	Form,
	Button,
	Badge,
	InputGroup,
	ProgressBar,
	Alert,
} from 'react-bootstrap';
import {
	MapPin,
	Globe,
	Shuffle,
	Star,
	Users,
	PlusCircle,
	Trash2,
	Info,
	CheckCircle,
	Zap,
} from 'lucide-react';
import EventLayout from '@/layouts/EventLayout';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const PLATFORM_FEE = 0.05;

const FORMAT_OPTIONS = [
	{
		key: 'offline',
		label: 'Offline (Luring)',
		desc: 'Tiket fisik + Geofencing & QR Onsite',
		icon: MapPin,
		color: '#c2185b',
		bg: '#fce4ec',
		techTags: ['Geofencing GPS', 'Dynamic QR Onsite', 'Strict 1-to-1'],
	},
	{
		key: 'online',
		label: 'Online (Daring)',
		desc: 'Akses virtual + Zoom/Streaming otomatis',
		icon: Globe,
		color: '#00796b',
		bg: '#e0f2f1',
		techTags: ['Zoom/Streaming Auto', 'Pop-up Checkpoint', 'Strict 1-to-1'],
	},
	{
		key: 'hybrid',
		label: 'Hybrid',
		desc: 'Tiket fisik & virtual dalam satu acara',
		icon: Shuffle,
		color: '#5e35b1',
		bg: '#ede7f6',
		techTags: [
			'Geofencing (Offline)',
			'Zoom/Streaming (Online)',
			'Dynamic QR',
			'Strict 1-to-1',
		],
	},
];

// Helper untuk membuat struktur awal tiket menyesuaikan migration
const makeTier = (id, isOnline = false) => ({
	id,
	name: 'General Admission',
	type: isOnline ? 'online' : 'offline',
	is_free: false,
	price: isOnline ? 65000 : 150000,
	capacity: 100,
	sale_start: '',
	sale_end: '',
});

const initTiers = (isOnline = false) => [
	{
		id: 1,
		name: 'Early Bird',
		type: isOnline ? 'online' : 'offline',
		is_free: false,
		price: isOnline ? 35000 : 75000,
		capacity: 50,
		sale_start: '',
		sale_end: '',
	},
	{
		id: 2,
		name: 'General Admission',
		type: isOnline ? 'online' : 'offline',
		is_free: false,
		price: isOnline ? 65000 : 150000,
		capacity: 200,
		sale_start: '',
		sale_end: '',
	},
];

/* ─────────────────────────────────────────────
   TECH TAG PILL
───────────────────────────────────────────── */
function TechTag({ label }) {
	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 5,
				fontSize: 11,
				fontWeight: 500,
				background: '#ede7f6',
				color: '#4527a0',
				border: '0.5px solid #b39ddb',
				borderRadius: 20,
				padding: '3px 10px',
			}}>
			<Zap size={10} />
			{label}
		</span>
	);
}

/* ─────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, subtitle }) {
	return (
		<div className="mb-3">
			<h6
				className="d-flex align-items-center gap-2 mb-1"
				style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
				<div
					style={{
						width: 28,
						height: 28,
						borderRadius: 8,
						background: '#ede7f6',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}>
					<Icon size={14} color="#5e35b1" />
				</div>
				{title}
			</h6>
			{subtitle && (
				<p style={{ fontSize: 12, color: '#999', margin: 0, paddingLeft: 36 }}>
					{subtitle}
				</p>
			)}
		</div>
	);
}

/* ─────────────────────────────────────────────
   TIER ROW (Sesuai Migration)
───────────────────────────────────────────── */
function TierRow({ tier, isOnline, onUpdate, onDelete, canDelete }) {
	const isFree = tier.is_free;

	return (
		<Card
			className="mb-3"
			style={{
				border: '0.5px solid rgba(0,0,0,.12)',
				borderRadius: 12,
				background: '#fafafa',
				boxShadow: 'none',
			}}>
			<Card.Body className="p-3">
				{/* Header Row */}
				<div className="d-flex align-items-center justify-content-between mb-3">
					<div className="d-flex align-items-center gap-2">
						<h6 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
							{tier.name || 'Nama Tiket'}
						</h6>
						<Badge
							bg={isOnline ? 'success' : 'danger'}
							style={{ fontSize: 10, fontWeight: 500, borderRadius: 20 }}>
							{isOnline ? 'Online' : 'Offline'}
						</Badge>
						{isFree && (
							<Badge
								bg="primary"
								style={{ fontSize: 10, fontWeight: 500, borderRadius: 20 }}>
								Gratis
							</Badge>
						)}
					</div>
					<Button
						variant="link"
						size="sm"
						disabled={!canDelete}
						onClick={() => onDelete(tier.id)}
						style={{ color: canDelete ? '#e53935' : '#ccc', padding: 4 }}>
						<Trash2 size={15} />
					</Button>
				</div>

				{/* Fields */}
				<Row className="g-3">
					{/* Name */}
					<Col xs={12} sm={6} lg={4}>
						<Form.Label style={{ fontSize: 11, color: '#777', marginBottom: 3 }}>
							Nama Tiket <span className="text-danger">*</span>
						</Form.Label>
						<Form.Control
							size="sm"
							value={tier.name}
							placeholder='Misal: "Early Bird", "VIP"'
							style={{ borderRadius: 8, fontSize: 13 }}
							onChange={(e) => onUpdate(tier.id, { name: e.target.value })}
						/>
					</Col>

					{/* Price & Free Toggle */}
					<Col xs={12} sm={6} lg={4}>
						<div className="d-flex justify-content-between align-items-end mb-1">
							<Form.Label style={{ fontSize: 11, color: '#777', marginBottom: 0 }}>
								Harga (Rp)
							</Form.Label>
							<Form.Check
								type="switch"
								id={`free-switch-${tier.id}`}
								label="Gratis?"
								checked={isFree}
								onChange={(e) => {
									const val = e.target.checked;
									onUpdate(tier.id, {
										is_free: val,
										price: val ? 0 : tier.price,
									});
								}}
								style={{ fontSize: 11, color: '#555' }}
							/>
						</div>
						<InputGroup size="sm">
							<InputGroup.Text style={{ fontSize: 12, borderRadius: '8px 0 0 8px' }}>
								Rp
							</InputGroup.Text>
							<Form.Control
								type="number"
								min={0}
								step={5000}
								value={tier.price}
								disabled={isFree}
								style={{
									borderRadius: '0 8px 8px 0',
									fontSize: 13,
									backgroundColor: isFree ? '#e9ecef' : '#fff',
								}}
								onChange={(e) =>
									onUpdate(tier.id, { price: Number(e.target.value) })
								}
							/>
						</InputGroup>
					</Col>

					{/* Capacity */}
					<Col xs={12} sm={6} lg={4}>
						<Form.Label style={{ fontSize: 11, color: '#777', marginBottom: 3 }}>
							Kapasitas (Kuota)
						</Form.Label>
						<InputGroup size="sm">
							<Form.Control
								type="number"
								min={1}
								step={10}
								value={tier.capacity}
								style={{ borderRadius: '8px 0 0 8px', fontSize: 13 }}
								onChange={(e) =>
									onUpdate(tier.id, { capacity: Number(e.target.value) })
								}
							/>
							<InputGroup.Text style={{ fontSize: 11, borderRadius: '0 8px 8px 0' }}>
								<Users size={11} className="me-1" />
								peserta
							</InputGroup.Text>
						</InputGroup>
					</Col>

					{/* Sale Start */}
					<Col xs={12} sm={6}>
						<Form.Label style={{ fontSize: 11, color: '#777', marginBottom: 3 }}>
							Mulai Penjualan
						</Form.Label>
						<Form.Control
							type="datetime-local"
							size="sm"
							value={tier.sale_start || ''}
							style={{ borderRadius: 8, fontSize: 13 }}
							onChange={(e) => onUpdate(tier.id, { sale_start: e.target.value })}
						/>
					</Col>

					{/* Sale End */}
					<Col xs={12} sm={6}>
						<Form.Label style={{ fontSize: 11, color: '#777', marginBottom: 3 }}>
							Akhir Penjualan
						</Form.Label>
						<Form.Control
							type="datetime-local"
							size="sm"
							value={tier.sale_end || ''}
							style={{ borderRadius: 8, fontSize: 13 }}
							onChange={(e) => onUpdate(tier.id, { sale_end: e.target.value })}
						/>
					</Col>
				</Row>
			</Card.Body>
		</Card>
	);
}

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

			<Row className="g-4">
				<Col xs={12} lg={12}>
					{/* ── 2. TIER & HARGA ── */}
					<Card
						className="mb-4"
						style={{
							border: '0.5px solid rgba(0,0,0,.1)',
							borderRadius: 14,
							boxShadow: 'none',
						}}>
						<Card.Body className="p-4">
							<SectionHeader icon={Star} title="Penjadwalan & Harga Tiket" />

							{/* Hybrid tab switcher */}
							{format === 'hybrid' && (
								<div className="mb-3">
									<div
										className="d-inline-flex"
										style={{
											background: '#f0edf8',
											borderRadius: 10,
											padding: 4,
											gap: 4,
										}}>
										{[
											{
												key: 'offline',
												icon: MapPin,
												label: 'Offline',
											},
											{ key: 'online', icon: Globe, label: 'Online' },
										].map((tab) => {
											const TIcon = tab.icon;
											const active = hybridTab === tab.key;
											return (
												<button
													key={tab.key}
													onClick={() => setHybridTab(tab.key)}
													style={{
														border: 'none',
														borderRadius: 8,
														padding: '6px 18px',
														fontSize: 12,
														fontWeight: 500,
														cursor: 'pointer',
														transition: 'all .15s',
														background: active
															? '#5e35b1'
															: 'transparent',
														color: active ? '#fff' : '#888',
														display: 'flex',
														alignItems: 'center',
														gap: 5,
													}}>
													<TIcon size={11} />
													{tab.label}
												</button>
											);
										})}
									</div>
								</div>
							)}

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

							<Button
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
							</Button>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</EventLayout>
	);
}
