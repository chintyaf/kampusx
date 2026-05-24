import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
	Container, 
	Row, 
	Col, 
	Card, 
	Button, 
	Badge, 
	Table, 
	Form, 
	InputGroup,
	Modal,
	Alert
} from 'react-bootstrap';
import { 
	LineChart, 
	Line, 
	BarChart, 
	Bar, 
	AreaChart,
	Area,
	PieChart, 
	Pie, 
	Cell, 
	XAxis, 
	YAxis, 
	CartesianGrid, 
	Tooltip, 
	Legend, 
	ResponsiveContainer 
} from 'recharts';
import { 
	TrendingUp, 
	Users, 
	ArrowUpRight, 
	DollarSign, 
	CornerUpLeft, 
	Activity,
	ChevronLeft, 
	Download, 
	Search, 
	Filter, 
	Calendar, 
	Percent,
	AlertCircle,
	CheckCircle
} from 'lucide-react';
import api from '@/api/axios';
import toast from 'react-hot-toast';

// Custom harmonious design styles
const cardStyle = {
	border: '1px solid var(--color-border)',
	borderRadius: '12px',
	boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
	backgroundColor: '#fff',
	overflow: 'hidden'
};

const formatRupiah = (number) => {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(number);
};

export default function EventAnalyticsPage() {
	const { eventId } = useParams();
	const [eventName, setEventName] = useState('Tech Summit 2026');
	const [loading, setLoading] = useState(false);
	const [timeRange, setTimeRange] = useState('30d');

	// KPI Metrics state (highly interactive)
	const [grossSales, setGrossSales] = useState(25500000);
	const [netRevenue, setNetRevenue] = useState(24750000);
	const [totalTickets, setTotalTickets] = useState(128);
	const [conversionRate, setConversionRate] = useState(14.2);
	const [refundCount, setRefundCount] = useState(3);
	const [refundAmount, setRefundAmount] = useState(750000);

	// Search & filters
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('All');

	// Refund Modal State
	const [showRefundModal, setShowRefundModal] = useState(false);
	const [selectedTx, setSelectedTx] = useState(null);
	const [refundReason, setRefundReason] = useState('');
	const [refundPercent, setRefundPercent] = useState('100');

	// Transactions mockup data
	const [transactions, setTransactions] = useState([
		{ code: 'TX-TCK-9901', name: 'Andi Wijaya', email: 'andi@gmail.com', tier: 'VIP Pass', qty: 1, total: 500000, status: 'Paid', date: '2026-05-23' },
		{ code: 'TX-TCK-9902', name: 'Budi Santoso', email: 'budi.s@yahoo.com', tier: 'Regular', qty: 2, total: 300000, status: 'Paid', date: '2026-05-23' },
		{ code: 'TX-TCK-9876', name: 'Chintya F', email: 'chintya@kampusx.id', tier: 'VIP Pass', qty: 1, total: 500000, status: 'Refunded', date: '2026-05-21' },
		{ code: 'TX-TCK-9712', name: 'Dedi Kurniawan', email: 'dedi@live.com', tier: 'Regular', qty: 1, total: 150000, status: 'Paid', date: '2026-05-20' },
		{ code: 'TX-TCK-9643', name: 'Elisa Putri', email: 'elisa.p@gmail.com', tier: 'VIP Pass', qty: 1, total: 500000, status: 'Paid', date: '2026-05-18' },
		{ code: 'TX-TCK-9521', name: 'Fahri Ahmad', email: 'fahri.ah@unpad.ac.id', tier: 'VIP Pass', qty: 1, total: 500000, status: 'Refunded', date: '2026-05-15' },
		{ code: 'TX-TCK-9432', name: 'Gita N', email: 'gita.n@outlook.com', tier: 'Regular', qty: 3, total: 450000, status: 'Paid', date: '2026-05-14' },
	]);

	// Charts Mock Data
	const salesTrend30d = [
		{ date: '01 Mei', sales: 450000, refunds: 0 },
		{ date: '05 Mei', sales: 1200000, refunds: 0 },
		{ date: '10 Mei', sales: 2500000, refunds: 0 },
		{ date: '15 Mei', sales: 3800000, refunds: 500000 },
		{ date: '20 Mei', sales: 4900000, refunds: 250000 },
		{ date: '23 Mei', sales: 6150000, refunds: 0 },
	];

	const funnelData = [
		{ name: 'Kunjungan Detail', value: 2450, percentage: 100, fill: 'var(--bahama-blue-800)' },
		{ name: 'Tambah ke Cart', value: 890, percentage: 36.3, fill: 'var(--bahama-blue-600)' },
		{ name: 'Mulai Pengisian', value: 412, percentage: 16.8, fill: 'var(--bahama-blue-400)' },
		{ name: 'Konfirmasi Bayar', value: 128, percentage: 5.2, fill: '#10b981' },
	];

	const tierData = [
		{ name: 'VIP Pass', value: 68, fill: '#0369a1' },
		{ name: 'Regular Tier', value: 42, fill: '#0ea5e9' },
		{ name: 'Early Bird', value: 18, fill: '#7dd3fc' },
	];

	// Load Event Data from overview if available
	useEffect(() => {
		const loadData = async () => {
			try {
				const res = await api.get(`/event-dashboard/${eventId}/overview`);
				if (res.data && res.data.status === 'success') {
					setEventName(res.data.data.title || 'Tech Summit 2026');
				}
			} catch (err) {
				console.error("Gagal memuat detail event untuk Analytics page:", err);
			}
		};
		loadData();
	}, [eventId]);

	// Filter transactions list
	const filteredTxs = transactions.filter(tx => {
		const matchesSearch = tx.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
							tx.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
							tx.email.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	// Trigger simulated refund processing
	const handleRefundSubmit = (e) => {
		e.preventDefault();
		if (!refundReason.trim()) {
			toast.error('Harap masukkan alasan pengajuan refund.');
			return;
		}

		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			const pctVal = parseFloat(refundPercent) / 100;
			const refundAmountVal = selectedTx.total * pctVal;

			// Update transaction status in memory
			setTransactions(prev => prev.map(item => {
				if (item.code === selectedTx.code) {
					return { ...item, status: 'Refunded' };
				}
				return item;
			}));

			// Recalculate KPIs
			setNetRevenue(prev => prev - refundAmountVal);
			setRefundCount(prev => prev + 1);
			setRefundAmount(prev => prev + refundAmountVal);

			setShowRefundModal(false);
			setRefundReason('');
			toast.success(`Refund sebesar ${formatRupiah(refundAmountVal)} (${refundPercent}%) berhasil diproses!`);
		}, 1000);
	};

	const openRefund = (tx) => {
		setSelectedTx(tx);
		setShowRefundModal(true);
	};

	return (
		<Container fluid className="py-4 px-lg-4 mx-auto" style={{ maxWidth: '1200px' }}>
			{/* Breadcrumbs */}
			<div className="d-flex align-items-center justify-content-between mb-4">
				<div className="d-flex align-items-center gap-2">
					<Link 
						to={`/organizer/${eventId}/event-dashboard`} 
						className="d-flex align-items-center text-muted text-decoration-none"
						style={{ fontSize: '14px' }}
					>
						<ChevronLeft size={16} className="me-1" />
						Dashboard Event
					</Link>
					<span className="text-muted">/</span>
					<span className="fw-medium" style={{ fontSize: '14px', color: '#111827' }}>
						Analisis & Laporan
					</span>
				</div>
				<span className="text-muted fs-5 fw-semibold px-2 py-1 rounded bg-light border">
					{eventName}
				</span>
			</div>

			{/* KPI Summary Cards Row */}
			<Row className="g-3 mb-4">
				{/* Net profit */}
				<Col xs={12} sm={6} lg={3}>
					<Card style={cardStyle} className="p-3">
						<div className="d-flex align-items-center justify-content-between mb-2">
							<span className="text-muted fs-5 fw-medium">Pendapatan Bersih</span>
							<div className="p-2 rounded bg-success bg-opacity-10 text-success">
								<DollarSign size={16} />
							</div>
						</div>
						<h4 className="fw-bold mb-1 text-dark">{formatRupiah(netRevenue)}</h4>
						<span className="text-muted fs-5">Kotor: {formatRupiah(grossSales)}</span>
					</Card>
				</Col>

				{/* Ticket Conversion */}
				<Col xs={12} sm={6} lg={3}>
					<Card style={cardStyle} className="p-3">
						<div className="d-flex align-items-center justify-content-between mb-2">
							<span className="text-muted fs-5 fw-medium">Rasio Konversi</span>
							<div className="p-2 rounded bg-primary bg-opacity-10 text-primary">
								<Percent size={16} />
							</div>
						</div>
						<h4 className="fw-bold mb-1 text-dark">{conversionRate}%</h4>
						<span className="text-success fs-5 fw-medium">↑ +2.4% vs Rata-rata</span>
					</Card>
				</Col>

				{/* Total Tickets */}
				<Col xs={12} sm={6} lg={3}>
					<Card style={cardStyle} className="p-3">
						<div className="d-flex align-items-center justify-content-between mb-2">
							<span className="text-muted fs-5 fw-medium">Tiket Terjual</span>
							<div className="p-2 rounded bg-info bg-opacity-10 text-info">
								<Users size={16} />
							</div>
						</div>
						<h4 className="fw-bold mb-1 text-dark">{totalTickets} Tiket</h4>
						<span className="text-muted fs-5">Dari kuota 200 kursi</span>
					</Card>
				</Col>

				{/* Refund Rate */}
				<Col xs={12} sm={6} lg={3}>
					<Card style={cardStyle} className="p-3">
						<div className="d-flex align-items-center justify-content-between mb-2">
							<span className="text-muted fs-5 fw-medium">Tingkat Refund</span>
							<div className="p-2 rounded bg-danger bg-opacity-10 text-danger">
								<CornerUpLeft size={16} />
							</div>
						</div>
						<h4 className="fw-bold mb-1 text-dark">
							{((refundAmount / grossSales) * 100).toFixed(1)}%
						</h4>
						<span className="text-muted fs-5">{refundCount} Tiket · {formatRupiah(refundAmount)}</span>
					</Card>
				</Col>
			</Row>

			{/* Main Analytical charts */}
			<Row className="g-4 mb-4">
				{/* Conversion Funnel */}
				<Col lg={4}>
					<Card style={cardStyle} className="p-4 h-100">
						<div className="mb-4">
							<h5 className="fw-bold mb-1" style={{ color: '#111827' }}>
								<Activity size={18} className="text-primary me-1" /> Funnel Konversi Penjualan
							</h5>
							<span className="text-muted fs-5">Visualisasi alur konversi dari kunjungan hingga pendaftaran sukses.</span>
						</div>

						<div className="d-flex flex-column gap-3">
							{funnelData.map((step, idx) => (
								<div key={step.name}>
									<div className="d-flex justify-content-between mb-1">
										<span className="fs-5 text-secondary">{step.name}</span>
										<span className="fw-bold text-dark fs-5">{step.value.toLocaleString('id-ID')}</span>
									</div>
									<div className="position-relative bg-light rounded-pill overflow-hidden" style={{ height: '24px' }}>
										<div 
											style={{
												height: '100%',
												width: `${step.percentage}%`,
												backgroundColor: step.fill,
												borderRadius: '50rem',
												transition: 'width 0.5s ease-in-out'
											}}
										/>
										<span 
											className="position-absolute fw-bold text-dark fs-6" 
											style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
										>
											{step.percentage}%
										</span>
									</div>
								</div>
							))}
						</div>

						<div className="mt-4 p-3 rounded border bg-light text-muted fs-5">
							<strong>Rekomendasi Analitik:</strong> Tingkat drop-off tertinggi berada pada proses pengisian form formulir (63.7%). Pertimbangkan mempersingkat pertanyaan pendaftaran.
						</div>
					</Card>
				</Col>

				{/* Sales Trend Chart */}
				<Col lg={8}>
					<Card style={cardStyle} className="p-4 h-100">
						<div className="d-flex justify-content-between align-items-start mb-4">
							<div>
								<h5 className="fw-bold mb-1" style={{ color: '#111827' }}>
									<TrendingUp size={18} className="text-primary me-1" /> Tren Penjualan & Refund Harian
								</h5>
								<span className="text-muted fs-5">Akumulasi tren pendapatan event berbanding nominal refund.</span>
							</div>
							<div className="d-flex gap-1 p-1 bg-light border rounded">
								{['7d', '30d'].map(r => (
									<Button 
										key={r}
										variant={timeRange === r ? 'white' : 'light'}
										size="sm" 
										className={`py-1 px-3 border-0 fs-5 ${timeRange === r ? 'shadow-sm fw-bold' : 'text-muted'}`}
										onClick={() => setTimeRange(r)}
									>
										{r === '7d' ? '7 Hari' : '30 Hari'}
									</Button>
								))}
							</div>
						</div>

						<div style={{ width: '100%', height: '250px' }}>
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={salesTrend30d} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
									<defs>
										<linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="var(--bahama-blue-600)" stopOpacity={0.2}/>
											<stop offset="95%" stopColor="var(--bahama-blue-600)" stopOpacity={0}/>
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
									<XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
									<YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
									<Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
									<Legend wrapperStyle={{ fontSize: '12px' }} />
									<Area type="monotone" name="Penjualan Bersih" dataKey="sales" stroke="var(--bahama-blue-600)" fillOpacity={1} fill="url(#salesGrad)" strokeWidth={2} />
									<Bar type="monotone" name="Refund Dana" dataKey="refunds" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</Card>
				</Col>
			</Row>

			{/* Breakdown and tables row */}
			<Row className="g-4">
				{/* Ticket Tiers Breakdown */}
				<Col lg={4}>
					<Card style={cardStyle} className="p-4">
						<h5 className="fw-bold mb-3" style={{ color: '#111827' }}>
							Distribusi Kategori Tiket
						</h5>
						<div className="d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={tierData}
										cx="50%"
										cy="50%"
										innerRadius={50}
										outerRadius={70}
										paddingAngle={4}
										dataKey="value"
									>
										{tierData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.fill} />
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
						</div>
						<div className="d-flex flex-column gap-2 mt-2">
							{tierData.map((item) => (
								<div key={item.name} className="d-flex align-items-center justify-content-between border-bottom pb-1 fs-5">
									<div className="d-flex align-items-center gap-2">
										<span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: item.fill }} />
										<span className="text-secondary">{item.name}</span>
									</div>
									<strong className="text-dark">{item.value} Tiket</strong>
								</div>
							))}
						</div>
					</Card>
				</Col>

				{/* Transactions list */}
				<Col lg={8}>
					<Card style={cardStyle} className="p-4">
						<div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
							<div>
								<h5 className="fw-bold mb-1" style={{ color: '#111827' }}>
									Catatan Transaksi Penjualan Tiket
								</h5>
								<span className="text-muted fs-5">Daftar transaksi terbaru hasil penjualan tiket event.</span>
							</div>
							<div className="d-flex align-items-center gap-2">
								<InputGroup size="sm" style={{ width: '180px' }}>
									<InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={14} /></InputGroup.Text>
									<Form.Control 
										placeholder="Cari nama..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="border-start-0 fs-5"
									/>
								</InputGroup>
								<Form.Select 
									size="sm" 
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
									style={{ width: '110px' }}
									className="fs-5"
								>
									<option value="All">Semua</option>
									<option value="Paid">Terbayar</option>
									<option value="Refunded">Refunded</option>
								</Form.Select>
							</div>
						</div>

						<div className="table-responsive">
							<Table hover className="align-middle mb-0" style={{ fontSize: '13px' }}>
								<thead>
									<tr className="text-muted">
										<th>Kode</th>
										<th>Peserta</th>
										<th>Kategori</th>
										<th>Tanggal</th>
										<th className="text-end">Total</th>
										<th className="text-center">Aksi</th>
									</tr>
								</thead>
								<tbody className="border-top-0">
									{filteredTxs.length === 0 ? (
										<tr>
											<td colSpan={6} className="text-center py-4 text-muted fs-4">Tidak ada data transaksi ditemukan</td>
										</tr>
									) : (
										filteredTxs.map((tx) => (
											<tr key={tx.code}>
												<td className="fw-bold text-dark">{tx.code}</td>
												<td>
													<span className="fw-semibold text-dark d-block">{tx.name}</span>
													<span className="text-muted fs-5">{tx.email}</span>
												</td>
												<td>{tx.tier} <Badge bg="light" className="text-muted fw-normal">x{tx.qty}</Badge></td>
												<td>{tx.date}</td>
												<td className="text-end fw-bold text-dark">{formatRupiah(tx.total)}</td>
												<td className="text-center">
													{tx.status === 'Paid' ? (
														<div className="d-flex align-items-center justify-content-center gap-2">
															<Badge bg="" className="bg-success bg-opacity-10 text-success rounded-pill px-2 py-1 fs-6">Terbayar</Badge>
															<Button 
																variant="outline-danger" 
																size="sm" 
																className="py-1 px-2 fs-6"
																onClick={() => openRefund(tx)}
															>
																Refund
															</Button>
														</div>
													) : (
														<Badge bg="" className="bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1 fs-6">Refunded</Badge>
													)}
												</td>
											</tr>
										))
									)}
								</tbody>
							</Table>
						</div>
					</Card>
				</Col>
			</Row>

			{/* Refund Trigger Modal */}
			<Modal show={showRefundModal} onHide={() => setShowRefundModal(false)} centered>
				<Modal.Header closeButton className="border-bottom-0 pb-0">
					<Modal.Title className="fw-bold fs-3 text-danger d-flex align-items-center gap-2">
						<AlertCircle size={20} /> Ajukan Pengembalian Dana (Refund)
					</Modal.Title>
				</Modal.Header>
				{selectedTx && (
					<Form onSubmit={handleRefundSubmit}>
						<Modal.Body className="pt-3">
							<Alert variant="danger" className="py-2 px-3 border border-danger border-opacity-30">
								<div className="fs-5 text-danger-text d-flex gap-2">
									<AlertCircle size={16} className="mt-1 flex-shrink-0" />
									<span>Tindakan ini bersifat final. Saldo transaksi akan langsung dikembalikan ke rekening pembeli tiket dan mengurangi pendapatan event Anda.</span>
								</div>
							</Alert>

							<div className="p-3 bg-light rounded border mb-3">
								<span className="text-muted fs-5 d-block">Detail Transaksi Target</span>
								<h5 className="fw-bold text-dark mb-1">{selectedTx.name} ({selectedTx.code})</h5>
								<span className="text-muted fs-5">{selectedTx.tier} · Nominal Asli: <strong>{formatRupiah(selectedTx.total)}</strong></span>
							</div>

							{/* Refund percentage selection */}
							<Form.Group className="mb-3">
								<Form.Label className="fw-bold text-dark fs-5">Nominal Pengembalian</Form.Label>
								<Form.Select 
									value={refundPercent}
									onChange={(e) => setRefundPercent(e.target.value)}
									className="fs-4"
								>
									<option value="100">100% Refund ({formatRupiah(selectedTx.total)})</option>
									<option value="50">50% Refund ({formatRupiah(selectedTx.total * 0.5)})</option>
									<option value="25">25% Refund ({formatRupiah(selectedTx.total * 0.25)})</option>
								</Form.Select>
							</Form.Group>

							{/* Reason input */}
							<Form.Group className="mb-3">
								<Form.Label className="fw-bold text-dark fs-5">Alasan Refund</Form.Label>
								<Form.Control 
									as="textarea"
									rows={3}
									placeholder="Tulis alasan refund secara lengkap..."
									required
									value={refundReason}
									onChange={(e) => setRefundReason(e.target.value)}
									className="fs-4"
								/>
							</Form.Group>
						</Modal.Body>
						<Modal.Footer className="border-top-0 pt-0">
							<Button variant="secondary" className="fs-4" onClick={() => setShowRefundModal(false)}>Batal</Button>
							<Button variant="danger" className="fs-4 px-4 fw-semibold" type="submit" disabled={loading}>
								{loading ? 'Memproses...' : 'Proses Refund'}
							</Button>
						</Modal.Footer>
					</Form>
				)}
			</Modal>
		</Container>
	);
}
