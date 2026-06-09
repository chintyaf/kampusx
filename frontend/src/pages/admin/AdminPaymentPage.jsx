import { useState, useEffect } from 'react';
import { Row, Col, Card, Form, InputGroup, Button, Table, Badge, Spinner } from 'react-bootstrap';
import {
	Search,
	CreditCard,
	TrendingUp,
	Clock,
	Activity,
	RefreshCw,
	CheckCircle2,
	XCircle,
	AlertTriangle,
	ExternalLink,
} from 'lucide-react';
import api from '@/api/axios';
import { getPaymentUrl } from '@/api/config';
import FormHeading from '@/components/dashboard/FormHeading';
import StatCard from '@/features/users/components/StatCard';
import Pagination from '@/features/users/components/Pagination';

const AdminPaymentPage = () => {
	const [transactions, setTransactions] = useState([]);
	const [metrics, setMetrics] = useState({
		total_volume: 0,
		success_rate: 0,
		pending_count: 0,
		total_count: 0,
	});
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [loading, setLoading] = useState(true);
	const [perPage, setPerPage] = useState(10);
	const [currentPage, setPage] = useState(1);

	const fetchTransactions = async () => {
		setLoading(true);
		try {
			const response = await api.get('/admin/payment');
			setTransactions(response.data.transactions || []);
			setMetrics(
				response.data.metrics || {
					total_volume: 0,
					success_rate: 0,
					pending_count: 0,
					total_count: 0,
				},
			);
		} catch (error) {
			console.error('Failed to load simulated payments:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTransactions();
	}, []);

	// Client-side filtering & search
	const filtered = transactions.filter((t) => {
		const matchQ =
			t.token.toLowerCase().includes(search.toLowerCase()) ||
			t.order_id.toLowerCase().includes(search.toLowerCase()) ||
			t.customer_name.toLowerCase().includes(search.toLowerCase());
		const matchStatus = !statusFilter || t.status === statusFilter;
		return matchQ && matchStatus;
	});

	// Pagination
	const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
	const safePage = Math.min(currentPage, totalPages);
	const pageData = filtered.slice((safePage - 1) * perPage, safePage * perPage);

	const handleSearch = (v) => {
		setSearch(v);
		setPage(1);
	};

	const handleStatusFilter = (v) => {
		setStatusFilter(v);
		setPage(1);
	};

	const handlePerPage = (v) => {
		setPerPage(Number(v));
		setPage(1);
	};

	const stats = [
		{
			label: 'Total Volume',
			value: `Rp ${new Intl.NumberFormat('id-ID').format(metrics.total_volume)}`,
			icon: (c) => <CreditCard size={20} color={c} />,
			iconBg: '#eff6ff', // blue-50
			iconColor: '#2563eb', // blue-600
		},
		{
			label: 'Success Rate',
			value: `${metrics.success_rate.toFixed(1)}%`,
			icon: (c) => <TrendingUp size={20} color={c} />,
			iconBg: '#f0fdf4', // green-50
			iconColor: '#16a34a', // green-600
		},
		{
			label: 'Pending Checkout',
			value: metrics.pending_count,
			icon: (c) => <Clock size={20} color={c} />,
			iconBg: '#fefce8', // yellow-50
			iconColor: '#ca8a04', // yellow-600
		},
		{
			label: 'Total Sessions',
			value: metrics.total_count,
			icon: (c) => <Activity size={20} color={c} />,
			iconBg: '#f8fafc', // slate-50
			iconColor: '#475569', // slate-600
		},
	];

	return (
		<div
			className="py-4 px-3 px-md-4"
			style={{ backgroundColor: 'var(--color-bg, #f8fafc)', minHeight: '100vh' }}
		>
			{/* Header Section */}
			<div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
				<FormHeading
					heading="Payment Simulator Logs"
					subheading="Pantau dan audit riwayat simulasi transaksi pembayaran secara real-time"
				/>
				<Button
					variant="white"
					onClick={fetchTransactions}
					disabled={loading}
					className="d-flex align-items-center justify-content-center gap-2 border shadow-sm rounded-pill fw-medium bg-white"
					style={{ padding: '8px 20px', color: 'var(--color-text)' }}
				>
					<RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
					<span>Refresh Data</span>
				</Button>
			</div>

			{/* Statistics Cards */}
			<Row className="g-3 mb-4">
				{stats.map((s, index) => (
					<Col xs={12} sm={6} lg={3} key={index}>
						<StatCard {...s} />
					</Col>
				))}
			</Row>

			{/* Main Content Card */}
			<Card className="border-0 shadow-sm rounded-4 overflow-hidden">
				<Card.Body className="p-0">
					{/* Toolbar (Search & Filter) */}
					<div className="bg-white p-3 p-md-4 border-bottom">
						<Row className="g-3 align-items-center">
							{/* Search Input */}
							<Col xs={12} md={5} lg={4}>
								<InputGroup>
									<InputGroup.Text className="bg-light border-end-0">
										<Search size={16} className="text-muted" />
									</InputGroup.Text>
									<Form.Control
										type="text"
										placeholder="Cari token, order ID, nama..."
										value={search}
										onChange={(e) => handleSearch(e.target.value)}
										className="bg-light border-start-0 ps-0 shadow-none"
										style={{ fontSize: '0.875rem' }}
									/>
								</InputGroup>
							</Col>

							<Col
								xs={12}
								md={7}
								lg={8}
								className="d-flex flex-wrap flex-md-nowrap justify-content-md-end gap-2 gap-md-3"
							>
								{/* Status Filter */}
								<Form.Select
									value={statusFilter}
									onChange={(e) => handleStatusFilter(e.target.value)}
									className="shadow-none border text-muted"
									style={{
										fontSize: '0.875rem',
										minWidth: '140px',
										flex: '1 1 auto',
										maxWidth: '200px',
									}}
								>
									<option value="">Semua Status</option>
									<option value="pending">Pending</option>
									<option value="success">Success</option>
									<option value="failed">Failed</option>
									<option value="expired">Expired</option>
								</Form.Select>

								{/* Per Page Filter */}
								<div className="d-flex align-items-center gap-2">
									<span className="text-muted small d-none d-sm-inline">
										Tampilkan:
									</span>
									<Form.Select
										value={perPage}
										onChange={(e) => handlePerPage(e.target.value)}
										className="shadow-none border"
										style={{ fontSize: '0.875rem', width: 'auto' }}
									>
										<option value={5}>5 baris</option>
										<option value={10}>10 baris</option>
										<option value={25}>25 baris</option>
									</Form.Select>
								</div>
							</Col>
						</Row>
					</div>

					{/* Data Table */}
					{loading ? (
						<div className="d-flex flex-column justify-content-center align-items-center py-5">
							<Spinner animation="border" variant="primary" className="mb-3" />
							<span className="text-muted small fw-medium">
								Memuat data transaksi...
							</span>
						</div>
					) : (
						<div className="table-responsive">
							<Table
								hover
								className="align-middle mb-0"
								style={{ fontSize: '0.875rem', minWidth: '900px' }}
							>
								<thead className="bg-light text-muted">
									<tr>
										<th className="fw-semibold py-3 px-4 border-0">
											Token / Order ID
										</th>
										<th className="fw-semibold py-3 border-0">Customer</th>
										<th className="fw-semibold py-3 border-0">Item</th>
										<th className="fw-semibold py-3 border-0">Jumlah</th>
										<th className="fw-semibold py-3 border-0">Status</th>
										<th className="fw-semibold py-3 border-0">Waktu Dibuat</th>
										<th className="fw-semibold py-3 px-4 border-0 text-center">
											Aksi
										</th>
									</tr>
								</thead>
								<tbody>
									{pageData.map((t) => (
										<tr key={t.id}>
											<td className="px-4">
												<div className="fw-bold text-primary font-monospace mb-1">
													{t.token}
												</div>
												<Badge
													bg="light"
													text="dark"
													className="border fw-normal font-monospace"
												>
													{t.order_id}
												</Badge>
											</td>
											<td>
												<div className="fw-bold text-dark">
													{t.customer_name}
												</div>
												<div className="text-muted small">
													{t.customer_email}
												</div>
											</td>
											<td
												className="text-truncate text-secondary"
												style={{ maxWidth: '180px' }}
											>
												{t.item_name}
											</td>
											<td className="fw-bold text-dark">
												Rp {new Intl.NumberFormat('id-ID').format(t.amount)}
											</td>
											<td>
												{t.status === 'success' && (
													<Badge
														bg="success"
														className="bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill fw-medium d-inline-flex align-items-center gap-1"
													>
														<CheckCircle2 size={12} /> Success
													</Badge>
												)}
												{t.status === 'pending' && (
													<Badge
														bg="warning"
														className="bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-1 rounded-pill fw-medium d-inline-flex align-items-center gap-1"
													>
														<Clock size={12} /> Pending
													</Badge>
												)}
												{t.status === 'failed' && (
													<Badge
														bg="danger"
														className="bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 rounded-pill fw-medium d-inline-flex align-items-center gap-1"
													>
														<XCircle size={12} /> Failed
													</Badge>
												)}
												{t.status === 'expired' && (
													<Badge
														bg="secondary"
														className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill fw-medium d-inline-flex align-items-center gap-1"
													>
														<AlertTriangle size={12} /> Expired
													</Badge>
												)}
											</td>
											<td className="text-muted small">
												{new Date(t.created_at).toLocaleString('id-ID', {
													day: 'numeric',
													month: 'short',
													year: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
												})}
											</td>
											<td className="px-4 text-center">
												<Button
													variant="outline-primary"
													size="sm"
													href={getPaymentUrl(t.token)}
													target="_blank"
													rel="noopener noreferrer"
													className="rounded-pill px-3 fw-medium d-inline-flex align-items-center gap-1"
												>
													Buka <ExternalLink size={12} />
												</Button>
											</td>
										</tr>
									))}
									{filtered.length === 0 && (
										<tr>
											<td colSpan="7" className="text-center py-5">
												<div className="text-muted d-flex flex-column align-items-center gap-2">
													<Search size={32} className="opacity-50" />
													<span className="fw-medium">
														Belum ada data transaksi yang sesuai filter.
													</span>
												</div>
											</td>
										</tr>
									)}
								</tbody>
							</Table>
						</div>
					)}

					{/* Pagination Footer */}
					{!loading && filtered.length > 0 && (
						<div className="bg-light p-3 border-top d-flex justify-content-center">
							<Pagination
								currentPage={safePage}
								totalPages={totalPages}
								totalCount={filtered.length}
								perPage={perPage}
								onPageChange={setPage}
							/>
						</div>
					)}
				</Card.Body>
			</Card>
		</div>
	);
};

export default AdminPaymentPage;
