import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
	Container, 
	Row, 
	Col, 
	Card, 
	Table, 
	Form, 
	InputGroup,
	Badge
} from 'react-bootstrap';
import { 
	DollarSign, 
	Users,
	ChevronLeft, 
	Search, 
	CreditCard
} from 'lucide-react';
import api from '@/api/axios';
import '../../../../assets/css/dashboard.css';

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
	const [eventName, setEventName] = useState('');
	const [loading, setLoading] = useState(false);

	// KPI Metrics state
	const [grossSales, setGrossSales] = useState(0);
	const [totalTickets, setTotalTickets] = useState(0);
	const [isFreeEvent, setIsFreeEvent] = useState(false);

	// Search & filters
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('All');

	// Transactions log
	const [transactions, setTransactions] = useState([]);

	// Load Event Data
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			try {
				const [overviewRes, analyticsRes] = await Promise.all([
					api.get(`/event-dashboard/${eventId}/overview`),
					api.get(`/event-dashboard/${eventId}/revenue-analytics`)
				]);

				if (overviewRes.data && overviewRes.data.status === 'success') {
					setEventName(overviewRes.data.data.name || overviewRes.data.data.title || 'Event Detail');
				}

				if (analyticsRes.data && analyticsRes.data.status === 'success') {
					const data = analyticsRes.data.data;
					setGrossSales(data.grossSales || 0);
					setTotalTickets(data.totalTickets || 0);
					setIsFreeEvent(!!data.isFreeEvent);
					setTransactions(data.transactions || []);
				}
			} catch (err) {
				console.error("Gagal memuat detail transaksi event:", err);
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [eventId]);

	// Filter transactions list
	const filteredTxs = transactions.filter(tx => {
		const matchesSearch = tx.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
							tx.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
							tx.email.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = statusFilter === 'All' || 
							(statusFilter === 'Paid' && tx.status === 'Paid') ||
							(statusFilter === 'Pending' && tx.status === 'Pending');
		return matchesSearch && matchesStatus;
	});

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
						Transaksi
					</span>
				</div>
				<span className="text-muted fs-5 fw-semibold px-2 py-1 rounded bg-light border">
					{eventName}
				</span>
			</div>

			{/* KPI Summary Cards Row */}
			<Row className="g-3 mb-4">
				{/* Total revenue */}
				{!isFreeEvent && (
					<Col xs={12} sm={6} lg={4}>
						<div className="card custom-stat-card h-100" style={{ padding: '16px 18px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
								<span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Total Pendapatan</span>
								<div style={{ width: 34, height: 34, borderRadius: 8, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
									<DollarSign size={18} color="#166534" strokeWidth={1.8} />
								</div>
							</div>
							<div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.5px' }}>
								{formatRupiah(grossSales)}
							</div>
							<div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
								Total pembayaran sukses masuk
							</div>
						</div>
					</Col>
				)}

				{/* Total Tickets */}
				<Col xs={12} sm={6} lg={isFreeEvent ? 6 : 4}>
					<div className="card custom-stat-card h-100" style={{ padding: '16px 18px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
							<span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Tiket Terjual</span>
							<div style={{ width: 34, height: 34, borderRadius: 8, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
								<Users size={18} color="#7c3aed" strokeWidth={1.8} />
							</div>
						</div>
						<div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.5px' }}>
							{totalTickets} Tiket
						</div>
						<div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Jumlah peserta yang terdaftar</div>
					</div>
				</Col>

				{/* Total Transactions */}
				<Col xs={12} sm={6} lg={isFreeEvent ? 6 : 4}>
					<div className="card custom-stat-card h-100" style={{ padding: '16px 18px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
							<span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Total Transaksi</span>
							<div style={{ width: 34, height: 34, borderRadius: 8, background: '#dff3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
								<CreditCard size={18} color="#00699e" strokeWidth={1.8} />
							</div>
						</div>
						<div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.5px' }}>
							{transactions.length} Transaksi
						</div>
						<div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Semua status transaksi (Paid & Pending)</div>
					</div>
				</Col>
			</Row>

			{/* Transactions list */}
			<Card className="custom-stat-card p-4" style={{ border: '1px solid var(--color-border)', borderRadius: '12px' }}>
				<div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
					<div>
						<h5 className="fw-bold mb-1" style={{ color: '#111827' }}>
							Catatan Transaksi Penjualan Tiket
						</h5>
						<span className="text-muted fs-5">Daftar lengkap transaksi peserta yang mendaftar event ini.</span>
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
							<option value="Pending">Pending</option>
						</Form.Select>
					</div>
				</div>

				<div className="table-responsive">
					<Table hover className="align-middle mb-0" style={{ fontSize: '13px' }}>
						<thead>
							<tr className="text-muted">
								<th>Kode Tiket</th>
								<th>Peserta</th>
								<th>Tanggal</th>
								<th className="text-end">{isFreeEvent ? 'Status' : 'Total Bayar'}</th>
								<th className="text-center">Status Transaksi</th>
							</tr>
						</thead>
						<tbody className="border-top-0">
							{loading ? (
								<tr>
									<td colSpan={5} className="text-center py-4 text-muted fs-4">Memuat data transaksi...</td>
								</tr>
							) : filteredTxs.length === 0 ? (
								<tr>
									<td colSpan={5} className="text-center py-4 text-muted fs-4">Tidak ada data transaksi ditemukan</td>
								</tr>
							) : (
								filteredTxs.map((tx) => (
									<tr key={tx.code}>
										<td className="fw-bold text-dark">{tx.code}</td>
										<td>
											<span className="fw-semibold text-dark d-block">{tx.name}</span>
											<span className="text-muted fs-5">{tx.email}</span>
										</td>
										<td>{tx.date}</td>
										<td className="text-end fw-medium">
											{isFreeEvent ? <span className="text-success">Gratis</span> : formatRupiah(tx.total)}
										</td>
										<td className="text-center">
											{tx.status === 'Paid' ? (
												<Badge bg="" className="bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 fs-6 font-semibold">Success</Badge>
											) : (
												<Badge bg="" className="bg-warning bg-opacity-10 text-warning rounded-pill px-2.5 py-1 fs-6 font-semibold">Pending</Badge>
											)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</Table>
				</div>
			</Card>
		</Container>
	);
}
