import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table } from 'react-bootstrap';
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as RechartsTooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';
import {
	Eye,
	MousePointerClick,
	Users,
	TrendingUp,
	Crown,
	Layers,
	ChevronLeft,
	Calendar,
	Download,
	ArrowUpRight,
	CheckCircle2,
	Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─── Mock data ─── */
const generateDailyData = (days) => {
	const result = [];
	const now = new Date(2026, 4, 1); // May 1 2026
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(now);
		d.setDate(d.getDate() - i);
		const label = d.toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'short',
		});
		result.push({
			date: label,
			impresi: Math.floor(350 + Math.random() * 600 + (days - i) * 8),
			klik: Math.floor(20 + Math.random() * 80 + (days - i) * 1.5),
			konversi: Math.floor(2 + Math.random() * 15),
		});
	}
	return result;
};

const dailyData30 = generateDailyData(30);
const dailyData7 = dailyData30.slice(-7);
const dailyData14 = dailyData30.slice(-14);

const perEventData = [
	{ event: 'Tech Summit 2026', impresi: 12458, klik: 1020, konversi: 66, pendaftaran: 246 },
	{ event: 'Hackathon Cup', impresi: 4230, klik: 380, konversi: 22, pendaftaran: 89 },
	{ event: 'Startup Pitch', impresi: 2810, klik: 210, konversi: 14, pendaftaran: 42 },
	{ event: 'UI/UX Workshop', impresi: 1540, klik: 105, konversi: 8, pendaftaran: 28 },
];

const funnelData = [
	{ name: 'Impresi Banner', value: 12458, fill: '#6366f1' },
	{ name: 'Klik Banner', value: 1020, fill: '#818cf8' },
	{ name: 'Kunjungan Halaman', value: 730, fill: '#a5b4fc' },
	{ name: 'Daftar', value: 66, fill: '#c7d2fe' },
];

const promoHistory = [
	{
		id: 1,
		event: 'Tech Summit 2026',
		package: 'bundle',
		packageLabel: 'Bundle',
		status: 'active',
		start: '1 Mei 2026',
		end: '15 Mei 2026',
		impresi: 12458,
		klik: 1020,
		konversi: 66,
		biaya: 'Rp 640.000',
	},
	{
		id: 2,
		event: 'Hackathon Campus Cup',
		package: 'boost',
		packageLabel: 'Event Boost',
		status: 'pending',
		start: '–',
		end: '–',
		impresi: 0,
		klik: 0,
		konversi: 0,
		biaya: 'Rp 300.000',
	},
	{
		id: 3,
		event: 'Tech Summit 2025',
		package: 'featured',
		packageLabel: 'Featured Banner',
		status: 'active',
		start: '10 Apr 2026',
		end: '24 Apr 2026',
		impresi: 8320,
		klik: 672,
		konversi: 41,
		biaya: 'Rp 500.000',
	},
];

const pkgColors = {
	bundle: { text: '#4f46e5', bg: '#e0e7ff' }, // indigo
	boost: { text: '#059669', bg: '#d1fae5' }, // emerald
	featured: { text: '#7c3aed', bg: '#ede9fe' }, // purple
};

const pkgIcons = {
	bundle: Layers,
	boost: TrendingUp,
	featured: Crown,
};

const rangeMap = {
	'7d': dailyData7,
	'14d': dailyData14,
	'30d': dailyData30,
};

const statCardsConfig = [
	{
		label: 'Total Impresi',
		value: '20,038',
		change: '+18.4%',
		icon: Eye,
		color: '#2563eb', // blue-600
		bg: '#eff6ff', // blue-50
		borderColor: '#dbeafe', // blue-100
	},
	{
		label: 'Total Klik',
		value: '1,715',
		change: '+12.3%',
		icon: MousePointerClick,
		color: '#4f46e5', // indigo-600
		bg: '#e0e7ff', // indigo-50
		borderColor: '#c7d2fe', // indigo-100
	},
	{
		label: 'Rata-rata CTR',
		value: '8.56%',
		change: '+2.1%',
		icon: TrendingUp,
		color: '#059669', // emerald-600
		bg: '#d1fae5', // emerald-50
		borderColor: '#a7f3d0', // emerald-100
	},
	{
		label: 'Total Konversi',
		value: '150',
		change: '+9.7%',
		icon: Users,
		color: '#7c3aed', // purple-600
		bg: '#ede9fe', // purple-50
		borderColor: '#ddd6fe', // purple-100
	},
];

/* ─── Sub Components ─── */

const StatCards = () => {
	return (
		<Row className="g-3 mb-4">
			{statCardsConfig.map((stat, idx) => (
				<Col xs={6} lg={3} key={idx}>
					<Card
						className="h-100"
						style={{
							borderColor: stat.borderColor,
							boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
							transition: 'box-shadow 0.2s',
						}}
					>
						<Card.Body className="p-3">
							<div className="d-flex align-items-center justify-content-between mb-3">
								<div
									style={{
										backgroundColor: stat.bg,
										padding: '8px',
										borderRadius: '8px',
										display: 'flex',
									}}
								>
									<stat.icon size={16} color={stat.color} />
								</div>
								<span
									style={{ color: '#059669', fontSize: '12px' }}
									className="d-flex align-items-center fw-medium"
								>
									<ArrowUpRight size={12} className="me-1" />
									{stat.change}
								</span>
							</div>
							<h4 className="fw-bold mb-1" style={{ color: '#111827' }}>
								{stat.value}
							</h4>
							<p className="mb-0 text-muted" style={{ fontSize: '12px' }}>
								{stat.label}
							</p>
						</Card.Body>
					</Card>
				</Col>
			))}
		</Row>
	);
};

const ImpressionChart = ({ data }) => {
	return (
		<Card className="h-100" style={{ borderColor: '#e2e8f0' }}>
			<Card.Body className="p-4">
				<div className="mb-4">
					<h6 className="fw-semibold mb-1" style={{ color: '#111827', fontSize: '14px' }}>
						Impresi & Klik Harian
					</h6>
					<p className="text-muted mb-0" style={{ fontSize: '12px' }}>
						Tren performa banner promosi
					</p>
				</div>
				<div style={{ width: '100%', height: 220 }}>
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={data} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
							<XAxis
								dataKey="date"
								tick={{ fontSize: 11, fill: '#94a3b8' }}
								interval={Math.floor(data.length / 6)}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								tick={{ fontSize: 11, fill: '#94a3b8' }}
								tickLine={false}
								axisLine={false}
							/>
							<RechartsTooltip
								contentStyle={{
									borderRadius: 8,
									border: '1px solid #e2e8f0',
									fontSize: 12,
									boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
								}}
							/>
							<Legend
								iconType="circle"
								iconSize={8}
								wrapperStyle={{ fontSize: 12 }}
							/>
							<Line
								type="monotone"
								dataKey="impresi"
								name="Impresi"
								stroke="#6366f1"
								strokeWidth={2}
								dot={false}
								activeDot={{ r: 4 }}
							/>
							<Line
								type="monotone"
								dataKey="klik"
								name="Klik"
								stroke="#10b981"
								strokeWidth={2}
								dot={false}
								activeDot={{ r: 4 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</Card.Body>
		</Card>
	);
};

const ConversionFunnel = () => {
	return (
		<Card className="h-100" style={{ borderColor: '#e2e8f0' }}>
			<Card.Body className="p-4">
				<div className="mb-4">
					<h6 className="fw-semibold mb-1" style={{ color: '#111827', fontSize: '14px' }}>
						Funnel Konversi
					</h6>
					<p className="text-muted mb-0" style={{ fontSize: '12px' }}>
						Tech Summit 2026
					</p>
				</div>
				<div className="d-flex flex-column gap-3">
					{funnelData.map((step, idx) => {
						const pct =
							idx === 0 ? 100 : Math.round((step.value / funnelData[0].value) * 100);
						return (
							<div key={step.name}>
								<div className="d-flex justify-content-between mb-1">
									<span style={{ fontSize: '12px', color: '#475569' }}>
										{step.name}
									</span>
									<span
										className="fw-medium"
										style={{ fontSize: '12px', color: '#111827' }}
									>
										{step.value.toLocaleString('id-ID')}
									</span>
								</div>
								<div
									className="position-relative overflow-hidden"
									style={{
										height: '24px',
										backgroundColor: '#f1f5f9',
										borderRadius: '8px',
									}}
								>
									<div
										style={{
											height: '100%',
											width: `${pct}%`,
											backgroundColor: step.fill,
											borderRadius: '8px',
											transition: 'width 0.3s ease',
										}}
									/>
									<span
										className="position-absolute fw-medium"
										style={{
											right: '8px',
											top: '50%',
											transform: 'translateY(-50%)',
											fontSize: '11px',
											color: '#334155',
										}}
									>
										{pct}%
									</span>
								</div>
							</div>
						);
					})}
				</div>
				<div className="mt-4 p-3 rounded" style={{ backgroundColor: '#eef2ff' }}>
					<p className="mb-0" style={{ fontSize: '12px', color: '#4338ca' }}>
						<strong>Conversion rate: 0.53%</strong> — banner ke pendaftaran. Lebih
						tinggi 35% vs rata-rata non-promosi.
					</p>
				</div>
			</Card.Body>
		</Card>
	);
};

const PerEventChart = () => {
	return (
		<Card className="mb-4" style={{ borderColor: '#e2e8f0' }}>
			<Card.Body className="p-4">
				<div className="mb-4">
					<h6 className="fw-semibold mb-1" style={{ color: '#111827', fontSize: '14px' }}>
						Performa per Event
					</h6>
					<p className="text-muted mb-0" style={{ fontSize: '12px' }}>
						Perbandingan impresi, klik, dan konversi antar event yang dipromosikan
					</p>
				</div>
				<div style={{ width: '100%', height: 220 }}>
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={perEventData}
							margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
							barSize={18}
							barGap={4}
						>
							<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
							<XAxis
								dataKey="event"
								tick={{ fontSize: 11, fill: '#94a3b8' }}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								tick={{ fontSize: 11, fill: '#94a3b8' }}
								tickLine={false}
								axisLine={false}
							/>
							<RechartsTooltip
								contentStyle={{
									borderRadius: 8,
									border: '1px solid #e2e8f0',
									fontSize: 12,
								}}
							/>
							<Legend
								iconType="square"
								iconSize={10}
								wrapperStyle={{ fontSize: 12 }}
							/>
							<Bar
								dataKey="impresi"
								name="Impresi"
								fill="#6366f1"
								radius={[4, 4, 0, 0]}
							/>
							<Bar dataKey="klik" name="Klik" fill="#10b981" radius={[4, 4, 0, 0]} />
							<Bar
								dataKey="konversi"
								name="Konversi"
								fill="#f59e0b"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</Card.Body>
		</Card>
	);
};

const PromoHistoryTable = () => {
	return (
		<Card className="mb-4 overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
			<div
				className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between"
				style={{ borderColor: '#f1f5f9' }}
			>
				<div>
					<h6 className="fw-semibold mb-1" style={{ color: '#111827', fontSize: '14px' }}>
						Riwayat Kampanye Promosi
					</h6>
					<p className="text-muted mb-0" style={{ fontSize: '12px' }}>
						Semua promosi yang pernah diajukan
					</p>
				</div>
				<Link
					to="/"
					style={{ fontSize: '12px', color: '#4f46e5', textDecoration: 'none' }}
					className="fw-medium"
				>
					+ Tambah promosi
				</Link>
			</div>
			<div className="table-responsive">
				<Table className="mb-0" style={{ fontSize: '13px' }} hover>
					<thead style={{ backgroundColor: '#f8fafc' }}>
						<tr>
							<th className="text-muted fw-semibold py-3 px-4 border-0">Event</th>
							<th className="text-muted fw-semibold py-3 px-3 border-0">Paket</th>
							<th className="text-muted fw-semibold py-3 px-3 border-0">Status</th>
							<th className="text-muted fw-semibold py-3 px-3 border-0">Periode</th>
							<th className="text-muted fw-semibold py-3 px-3 text-end border-0">
								Impresi
							</th>
							<th className="text-muted fw-semibold py-3 px-3 text-end border-0">
								Klik
							</th>
							<th className="text-muted fw-semibold py-3 px-3 text-end border-0">
								CTR
							</th>
							<th className="text-muted fw-semibold py-3 px-4 text-end border-0">
								Biaya
							</th>
						</tr>
					</thead>
					<tbody className="border-top-0">
						{promoHistory.map((row) => {
							const PkgIcon = pkgIcons[row.package];
							const pColor = pkgColors[row.package];
							const ctr =
								row.impresi > 0
									? ((row.klik / row.impresi) * 100).toFixed(1) + '%'
									: '–';

							return (
								<tr key={row.id}>
									<td
										className="px-4 py-3 fw-medium align-middle"
										style={{ color: '#111827' }}
									>
										{row.event}
									</td>
									<td className="px-3 py-3 align-middle">
										<div
											className="d-inline-flex align-items-center rounded-2 px-2 py-1"
											style={{
												backgroundColor: pColor.bg,
												color: pColor.text,
												fontSize: '12px',
												fontWeight: 500,
											}}
										>
											<PkgIcon size={12} className="me-1" />
											{row.packageLabel}
										</div>
									</td>
									<td className="px-3 py-3 align-middle">
										{row.status === 'active' ? (
											<Badge
												bg=""
												className="rounded-pill d-inline-flex align-items-center py-1 px-2 fw-medium"
												style={{
													backgroundColor: '#f0fdf4',
													color: '#15803d',
												}}
											>
												<CheckCircle2 size={12} className="me-1" /> Aktif
											</Badge>
										) : (
											<Badge
												bg=""
												className="rounded-pill d-inline-flex align-items-center py-1 px-2 fw-medium"
												style={{
													backgroundColor: '#fffbeb',
													color: '#b45309',
												}}
											>
												<Clock size={12} className="me-1" /> Dalam Review
											</Badge>
										)}
									</td>
									<td
										className="px-3 py-3 text-muted align-middle"
										style={{ fontSize: '12px' }}
									>
										{row.start === '–' ? (
											<span className="fst-italic text-secondary">
												Menunggu persetujuan
											</span>
										) : (
											`${row.start} – ${row.end}`
										)}
									</td>
									<td className="px-3 py-3 text-end fw-medium align-middle">
										{row.impresi > 0
											? row.impresi.toLocaleString('id-ID')
											: '–'}
									</td>
									<td className="px-3 py-3 text-end text-secondary align-middle">
										{row.klik > 0 ? row.klik.toLocaleString('id-ID') : '–'}
									</td>
									<td className="px-3 py-3 text-end align-middle">
										{row.impresi > 0 ? (
											<span style={{ color: '#4f46e5', fontWeight: 500 }}>
												{ctr}
											</span>
										) : (
											'–'
										)}
									</td>
									<td
										className="px-4 py-3 text-end fw-semibold align-middle"
										style={{ color: '#334155' }}
									>
										{row.biaya}
									</td>
								</tr>
							);
						})}
					</tbody>
					<tfoot style={{ backgroundColor: '#f8fafc' }}>
						<tr>
							<td colSpan={4} className="px-4 py-3 text-muted fw-semibold border-0">
								Total
							</td>
							<td
								className="px-3 py-3 text-end fw-bold border-0"
								style={{ color: '#111827' }}
							>
								20.778
							</td>
							<td
								className="px-3 py-3 text-end fw-bold border-0"
								style={{ color: '#111827' }}
							>
								1.692
							</td>
							<td
								className="px-3 py-3 text-end fw-medium border-0"
								style={{ color: '#4f46e5' }}
							>
								8.14%
							</td>
							<td
								className="px-4 py-3 text-end fw-bold border-0"
								style={{ color: '#111827' }}
							>
								Rp 1.440.000
							</td>
						</tr>
					</tfoot>
				</Table>
			</div>
		</Card>
	);
};

const ROIInsight = () => {
	return (
		<div
			className="p-4 rounded-3 border"
			style={{
				background: 'linear-gradient(to right, #eef2ff, #f5f3ff)',
				borderColor: '#c7d2fe',
			}}
		>
			<div className="d-flex align-items-start gap-3">
				<div className="rounded p-2 flex-shrink-0" style={{ backgroundColor: '#e0e7ff' }}>
					<TrendingUp size={20} color="#4f46e5" />
				</div>
				<div>
					<h6 className="fw-semibold mb-1" style={{ color: '#111827' }}>
						Insight Performa Promosi
					</h6>
					<p className="mb-0" style={{ color: '#475569', fontSize: '14px' }}>
						Event yang dipromosikan rata-rata mendapat{' '}
						<strong>3.2× lebih banyak impresi</strong> dibanding event tanpa promosi.
						Conversion rate <strong>8.14% CTR</strong> kamu berada di atas rata-rata
						platform (5.3%). Pertimbangkan untuk memperpanjang promosi Tech Summit 2026
						sebelum berakhir.
					</p>
				</div>
			</div>
		</div>
	);
};

/* ─── Main Page Component ─── */

const EventStatisticsPage = () => {
	const [dateRange, setDateRange] = useState('30d');
	const data = rangeMap[dateRange];

	const totalImpresi = data.reduce((s, d) => s + d.impresi, 0).toLocaleString('id-ID');
	const totalKlik = data.reduce((s, d) => s + d.klik, 0).toLocaleString('id-ID');

	return (
		<Container fluid className="py-4 px-lg-4 mx-auto" style={{ maxWidth: '1140px' }}>
			{/* Breadcrumb & Actions */}
			<div className="d-flex align-items-center justify-content-between mb-4">
				<div className="d-flex align-items-center gap-2">
					<Link
						to="/organizer/dashboard"
						className="d-flex align-items-center text-muted text-decoration-none"
						style={{ fontSize: '14px' }}
					>
						<ChevronLeft size={16} className="me-1" />
						Promosi
					</Link>
					<span className="text-muted">/</span>
					<span className="fw-medium" style={{ fontSize: '14px', color: '#111827' }}>
						Analitik
					</span>
				</div>
				<Button
					variant="outline-secondary"
					size="sm"
					className="d-flex align-items-center gap-2 bg-white"
				>
					<Download size={16} />
					Export CSV
				</Button>
			</div>

			{/* Date Range Filter */}
			<div className="d-flex align-items-center gap-2 mb-4">
				<Calendar size={16} className="text-muted" />
				<span className="text-muted" style={{ fontSize: '14px' }}>
					Periode:
				</span>
				<div
					className="d-flex gap-1 p-1 rounded bg-light border"
					style={{ borderColor: '#e2e8f0' }}
				>
					{['7d', '14d', '30d'].map((r) => (
						<button
							key={r}
							onClick={() => setDateRange(r)}
							className={`btn btn-sm ${
								dateRange === r ? 'btn-light shadow-sm bg-white' : 'text-muted'
							}`}
							style={{
								fontSize: '12px',
								fontWeight: 500,
								border: 'none',
								borderRadius: '4px',
							}}
						>
							{r === '7d' ? '7 Hari' : r === '14d' ? '14 Hari' : '30 Hari'}
						</button>
					))}
				</div>
				<span className="text-muted ms-2" style={{ fontSize: '12px' }}>
					{totalImpresi} impresi · {totalKlik} klik
				</span>
			</div>

			{/* Stats Cards Row */}
			<StatCards />

			{/* Charts Row */}
			<Row className="g-4 mb-4">
				<Col lg={8}>
					<ImpressionChart data={data} />
				</Col>
				<Col lg={4}>
					<ConversionFunnel />
				</Col>
			</Row>

			{/* Per-event Bar Chart */}
			<PerEventChart />

			{/* Promo History Table */}
			<PromoHistoryTable />

			{/* ROI Insight */}
			<ROIInsight />
		</Container>
	);
};

export default EventStatisticsPage;
