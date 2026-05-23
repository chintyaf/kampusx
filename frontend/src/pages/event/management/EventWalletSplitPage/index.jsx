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
	Modal, 
	Form, 
	InputGroup,
	ProgressBar,
	Alert
} from 'react-bootstrap';
import { 
	Wallet, 
	ArrowUpRight, 
	ArrowDownLeft,
	Sliders, 
	Users, 
	Percent, 
	Clock, 
	CheckCircle, 
	XCircle, 
	ChevronLeft, 
	Download,
	Info,
	Plus,
	Trash2,
	Building,
	UserCheck
} from 'lucide-react';
import api from '@/api/axios';
import toast from 'react-hot-toast';

// Styling utilities (following premium design aesthetics)
const cardStyle = {
	border: '1px solid var(--color-border)',
	borderRadius: '12px',
	boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
	backgroundColor: '#fff',
	overflow: 'hidden'
};

const gradientCardStyle = {
	background: 'linear-gradient(135deg, var(--bahama-blue-900) 0%, var(--bahama-blue-700) 100%)',
	color: '#fff',
	borderRadius: '12px',
	border: 'none',
	boxShadow: '0 10px 15px -3px rgba(2, 132, 199, 0.2)'
};

const formatRupiah = (number) => {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(number);
};

export default function EventWalletSplitPage() {
	const { eventId } = useParams();
	const [activeBalance, setActiveBalance] = useState(15750000); // Initial mockup balance (Rp 15.750.000)
	const [totalEarnings, setTotalEarnings] = useState(25500000);
	const [pendingWithdrawal, setPendingWithdrawal] = useState(3000000);
	const [eventName, setEventName] = useState('Tech Summit 2026');
	const [loading, setLoading] = useState(false);

	// Withdrawal Modal State
	const [showWithdrawModal, setShowWithdrawModal] = useState(false);
	const [withdrawAmount, setWithdrawAmount] = useState('');
	const [withdrawBank, setWithdrawBank] = useState('BCA');
	const [accountNum, setAccountNum] = useState('1234567890');
	const [accountName, setAccountName] = useState('BEM FT Unpad');
	const [withdrawError, setWithdrawError] = useState('');

	// Payout receipt modal
	const [showReceiptModal, setShowReceiptModal] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState(null);

	// Transactions log
	const [transactions, setTransactions] = useState([
		{ id: 'TX-WD-001', date: '2026-05-20', time: '14:32', bank: 'BCA', acc: '123456***', name: 'BEM FT Unpad', amount: 5000000, status: 'Success' },
		{ id: 'TX-WD-002', date: '2026-05-22', time: '09:15', bank: 'Mandiri', acc: '987654***', name: 'BEM FT Unpad', amount: 3000000, status: 'Pending' },
		{ id: 'TX-WD-003', date: '2026-04-18', time: '16:04', bank: 'BCA', acc: '123456***', name: 'BEM FT Unpad', amount: 1750000, status: 'Success' },
	]);

	// Revenue Split configuration states
	const [splits, setSplits] = useState([
		{ id: 'host', name: 'Organizer Utama (Host)', percentage: 70, type: 'fixed' },
		{ id: 'cohost', name: 'Co-Host / Partner', percentage: 20, type: 'variable' },
		{ id: 'speaker', name: 'Speaker (Honorarium)', percentage: 5, type: 'variable' },
		{ id: 'platform', name: 'Platform & Admin Fee', percentage: 5, type: 'system', locked: true },
	]);

	// Load Event Data from overview if available
	useEffect(() => {
		const loadData = async () => {
			try {
				const res = await api.get(`/event-dashboard/${eventId}/overview`);
				if (res.data && res.data.status === 'success') {
					setEventName(res.data.data.title || 'Tech Summit 2026');
				}
			} catch (err) {
				console.error("Gagal memuat detail event untuk Wallet page:", err);
			}
		};
		loadData();
	}, [eventId]);

	// Calculate current splits total percentage
	const totalSplitPct = splits.reduce((sum, item) => sum + item.percentage, 0);

	// Update individual split percentages
	const handleSplitChange = (id, newPct) => {
		const parsed = Math.max(0, Math.min(100, parseInt(newPct) || 0));
		setSplits(prev => prev.map(item => {
			if (item.id === id) {
				return { ...item, percentage: parsed };
			}
			return item;
		}));
	};

	// Save Revenue Split Configuration with validation
	const handleSaveSplits = () => {
		if (totalSplitPct !== 100) {
			toast.error(`Total pembagian hasil harus tepat 100%! Sekarang adalah ${totalSplitPct}%`);
			return;
		}

		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			toast.success('Konfigurasi Revenue Split berhasil disimpan!');
		}, 800);
	};

	// Validate & Trigger Withdrawal simulation
	const handleWithdrawSubmit = (e) => {
		e.preventDefault();
		const amount = parseFloat(withdrawAmount);

		if (!amount || isNaN(amount)) {
			setWithdrawError('Harap masukkan jumlah nominal transfer yang valid.');
			return;
		}
		if (amount < 50000) {
			setWithdrawError('Nominal penarikan minimal adalah Rp 50.000.');
			return;
		}
		if (amount > activeBalance) {
			setWithdrawError('Nominal melebihi saldo aktif Anda.');
			return;
		}

		setWithdrawError('');
		setLoading(true);

		// Simulate request execution
		setTimeout(() => {
			setLoading(false);
			const newTx = {
				id: `TX-WD-00${transactions.length + 1}`,
				date: new Date().toISOString().split('T')[0],
				time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
				bank: withdrawBank,
				acc: accountNum.substring(0, 4) + '***',
				name: accountName,
				amount: amount,
				status: 'Pending'
			};

			setTransactions([newTx, ...transactions]);
			setActiveBalance(prev => prev - amount);
			setPendingWithdrawal(prev => prev + amount);
			setShowWithdrawModal(false);
			setWithdrawAmount('');
			toast.success('Permintaan penarikan dana berhasil diajukan!');
		}, 1000);
	};

	const openReceipt = (tx) => {
		setSelectedTransaction(tx);
		setShowReceiptModal(true);
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
						Dompet & Bagi Hasil
					</span>
				</div>
				<span className="text-muted fs-5 fw-semibold px-2 py-1 rounded bg-light border">
					{eventName}
				</span>
			</div>

			{/* Main Metrics and Balance row */}
			<Row className="g-4 mb-4">
				{/* Main Balance Card */}
				<Col lg={6}>
					<Card className="h-100 p-4" style={gradientCardStyle}>
						<div className="d-flex justify-content-between align-items-start mb-4">
							<div>
								<span className="opacity-75 fs-4 fw-medium d-block mb-1">Saldo Dompet Aktif</span>
								<h1 className="fw-bold mb-0 text-white" style={{ fontSize: '32px' }}>
									{formatRupiah(activeBalance)}
								</h1>
							</div>
							<div className="rounded-circle bg-white bg-opacity-20 p-3">
								<Wallet size={24} className="text-white" />
							</div>
						</div>
						<div className="mt-auto d-flex justify-content-between align-items-end gap-3 flex-wrap">
							<div className="d-flex gap-3 text-white">
								<div>
									<span className="opacity-75 fs-5 d-block">Dana Diproses</span>
									<span className="fw-bold fs-3 text-white">{formatRupiah(pendingWithdrawal)}</span>
								</div>
								<div className="border-start border-white border-opacity-20 ps-3">
									<span className="opacity-75 fs-5 d-block">Total Pendapatan</span>
									<span className="fw-bold fs-3 text-white">{formatRupiah(totalEarnings)}</span>
								</div>
							</div>
							<Button 
								variant="light" 
								className="fw-bold px-4 py-2 text-primary" 
								onClick={() => setShowWithdrawModal(true)}
								style={{ borderRadius: '8px', border: 'none' }}
							>
								<ArrowUpRight size={16} className="me-1" /> Tarik Dana
							</Button>
						</div>
					</Card>
				</Col>

				{/* Info Card Platform Fee */}
				<Col lg={6}>
					<Card className="h-100 p-4" style={cardStyle}>
						<h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#111827' }}>
							<Info size={18} className="text-primary" /> Info Keamanan & Payout
						</h5>
						<p className="text-muted fs-4 mb-3" style={{ lineHeight: '1.6' }}>
							Dana hasil penjualan tiket event akan langsung disimpan ke saldo aktif Anda secara bertahap.
							Penarikan dana dapat diproses ke rekening bank terdaftar dengan waktu pencairan <strong>1x24 jam kerja</strong>.
						</p>
						<Row className="g-2 mt-2">
							<Col xs={6}>
								<div className="p-3 bg-light rounded border text-center">
									<span className="text-muted fs-5 d-block">Min. Penarikan</span>
									<span className="fw-bold text-dark fs-4">Rp 50.000</span>
								</div>
							</Col>
							<Col xs={6}>
								<div className="p-3 bg-light rounded border text-center">
									<span className="text-muted fs-5 d-block">Platform Fee</span>
									<span className="fw-bold text-primary fs-4">5% (Terkunci)</span>
								</div>
							</Col>
						</Row>
					</Card>
				</Col>
			</Row>

			{/* Revenue Split & Payout logs section */}
			<Row className="g-4">
				{/* Payout Split Configuration */}
				<Col lg={7}>
					<Card style={cardStyle} className="p-4">
						<div className="d-flex justify-content-between align-items-center mb-3">
							<div>
								<h5 className="fw-bold mb-1" style={{ color: '#111827' }}>
									<Sliders size={18} className="text-primary me-1" /> Revenue Split (Bagi Hasil)
								</h5>
								<span className="text-muted fs-5">Tentukan persen pembagian profit penjualan tiket untuk setiap panitia / pembicara.</span>
							</div>
						</div>

						{/* Split status progress bar */}
						<div className="my-4">
							<div className="d-flex justify-content-between mb-1">
								<span className="fw-medium fs-4">Total Alokasi Pembagian</span>
								<span className={`fw-bold fs-4 ${totalSplitPct === 100 ? 'text-success' : 'text-danger'}`}>
									{totalSplitPct}% / 100%
								</span>
							</div>
							<ProgressBar 
								now={Math.min(100, totalSplitPct)} 
								variant={totalSplitPct === 100 ? 'success' : totalSplitPct > 100 ? 'danger' : 'warning'} 
								style={{ height: '8px', borderRadius: '4px' }} 
							/>
							{totalSplitPct !== 100 && (
								<Alert variant="warning" className="mt-3 py-2 px-3 border border-warning border-opacity-50">
									<div className="d-flex align-items-center gap-2 fs-5 text-warning-text">
										<Info size={16} />
										<span>Total persentase pembagian hasil harus tepat 100% untuk menyimpan konfigurasi.</span>
									</div>
								</Alert>
							)}
						</div>

						{/* Split Items */}
						<div className="d-flex flex-column gap-3 mb-4">
							{splits.map((item) => (
								<div key={item.id} className="p-3 bg-light rounded border border-light d-flex align-items-center justify-content-between flex-wrap gap-3">
									<div className="d-flex align-items-center gap-2">
										<div className={`p-2 rounded bg-white border ${item.locked ? 'text-muted' : 'text-primary'}`}>
											{item.id === 'host' ? <UserCheck size={16} /> : item.id === 'platform' ? <Building size={16} /> : <Users size={16} />}
										</div>
										<div>
											<span className="fw-bold d-block fs-4 text-dark">{item.name}</span>
											<span className="text-muted fs-5">
												{item.locked ? 'Dikelola oleh sistem platform' : 'Bisa dikonfigurasi'}
											</span>
										</div>
									</div>

									<div className="d-flex align-items-center gap-3" style={{ minWidth: '220px' }}>
										{/* Percentage Input Slider */}
										{!item.locked ? (
											<Form.Range
												value={item.percentage}
												onChange={(e) => handleSplitChange(item.id, e.target.value)}
												className="flex-grow-1"
											/>
										) : (
											<div className="flex-grow-1 text-end text-muted fs-5 pe-3">LOCKED</div>
										)}
										<InputGroup style={{ width: '80px' }}>
											<Form.Control 
												type="number"
												size="sm"
												disabled={item.locked}
												value={item.percentage}
												onChange={(e) => handleSplitChange(item.id, e.target.value)}
												className="text-center fw-bold fs-4"
											/>
											<InputGroup.Text className="px-2 bg-white"><Percent size={12} /></InputGroup.Text>
										</InputGroup>
									</div>
								</div>
							))}
						</div>

						<Button 
							variant="primary" 
							className="w-100 fw-semibold py-2"
							onClick={handleSaveSplits}
							disabled={loading || totalSplitPct !== 100}
						>
							Simpan Pengaturan Bagi Hasil
						</Button>
					</Card>
				</Col>

				{/* Payout History Log */}
				<Col lg={5}>
					<Card style={cardStyle} className="p-4 h-100">
						<div className="d-flex justify-content-between align-items-center mb-4">
							<h5 className="fw-bold mb-0" style={{ color: '#111827' }}>
								<Clock size={18} className="text-primary me-1" /> Riwayat Pencairan Dana
							</h5>
						</div>

						<div className="table-responsive">
							<Table className="mb-0 align-middle" hover style={{ fontSize: '13px' }}>
								<thead>
									<tr className="text-muted">
										<th className="border-0">Tanggal</th>
										<th className="border-0 text-end">Jumlah</th>
										<th className="border-0 text-center">Status</th>
									</tr>
								</thead>
								<tbody className="border-top-0">
									{transactions.map((tx) => (
										<tr key={tx.id} onClick={() => openReceipt(tx)} className="cursor-pointer">
											<td className="py-3">
												<span className="fw-bold text-dark d-block">{tx.id}</span>
												<span className="text-muted fs-5">{tx.date} · {tx.time}</span>
											</td>
											<td className="py-3 text-end fw-bold text-dark">
												{formatRupiah(tx.amount)}
											</td>
											<td className="py-3 text-center">
												{tx.status === 'Success' ? (
													<Badge bg="" className="px-2 py-1 bg-success bg-opacity-10 text-success rounded-pill fw-semibold">
														<CheckCircle size={10} className="me-1" /> Sukses
													</Badge>
												) : (
													<Badge bg="" className="px-2 py-1 bg-warning bg-opacity-10 text-warning rounded-pill fw-semibold">
														<Clock size={10} className="me-1" /> Diproses
													</Badge>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						</div>
					</Card>
				</Col>
			</Row>

			{/* Tarik Dana Modal */}
			<Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)} centered>
				<Modal.Header closeButton className="border-bottom-0 pb-0">
					<Modal.Title className="fw-bold fs-3">Tarik Dana Ke Rekening</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleWithdrawSubmit}>
					<Modal.Body className="pt-3">
						{withdrawError && <Alert variant="danger" className="py-2 px-3 fs-5">{withdrawError}</Alert>}

						<div className="p-3 bg-light rounded border mb-3">
							<span className="text-muted fs-5 d-block">Saldo Aktif Yang Dapat Ditarik</span>
							<h3 className="fw-bold text-dark mb-0">{formatRupiah(activeBalance)}</h3>
						</div>

						{/* Nominal Penarikan */}
						<Form.Group className="mb-3">
							<Form.Label className="fw-bold text-dark fs-5">Nominal Penarikan (Rp)</Form.Label>
							<InputGroup>
								<InputGroup.Text className="bg-light fw-bold text-muted">Rp</InputGroup.Text>
								<Form.Control 
									placeholder="Masukkan nominal transfer..." 
									type="number"
									required
									value={withdrawAmount}
									onChange={(e) => setWithdrawAmount(e.target.value)}
									className="fw-bold fs-4"
								/>
							</InputGroup>
							<Form.Text className="text-muted">Minimal penarikan dana adalah Rp 50.000.</Form.Text>
						</Form.Group>

						{/* Bank selector */}
						<Form.Group className="mb-3">
							<Form.Label className="fw-bold text-dark fs-5">Bank Tujuan</Form.Label>
							<Form.Select 
								value={withdrawBank} 
								onChange={(e) => setWithdrawBank(e.target.value)}
								className="fs-4"
							>
								<option value="BCA">BCA (Bank Central Asia)</option>
								<option value="Mandiri">Bank Mandiri</option>
								<option value="BNI">BNI (Bank Negara Indonesia)</option>
								<option value="BRI">BRI (Bank Rakyat Indonesia)</option>
							</Form.Select>
						</Form.Group>

						{/* Rekening & Nama */}
						<Row className="g-2">
							<Col sm={6}>
								<Form.Group className="mb-3">
									<Form.Label className="fw-bold text-dark fs-5">Nomor Rekening</Form.Label>
									<Form.Control 
										type="text" 
										required 
										value={accountNum}
										onChange={(e) => setAccountNum(e.target.value)}
										className="fs-4"
									/>
								</Form.Group>
							</Col>
							<Col sm={6}>
								<Form.Group className="mb-3">
									<Form.Label className="fw-bold text-dark fs-5">Nama Pemilik Rekening</Form.Label>
									<Form.Control 
										type="text" 
										required 
										value={accountName}
										onChange={(e) => setAccountName(e.target.value)}
										className="fs-4"
									/>
								</Form.Group>
							</Col>
						</Row>
					</Modal.Body>
					<Modal.Footer className="border-top-0 pt-0">
						<Button variant="secondary" className="fs-4" onClick={() => setShowWithdrawModal(false)}>Batal</Button>
						<Button variant="primary" className="fs-4 px-4 fw-semibold" type="submit" disabled={loading}>
							{loading ? 'Memproses...' : 'Konfirmasi Tarik Dana'}
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{/* Detail Receipt Modal */}
			<Modal show={showReceiptModal} onHide={() => setShowReceiptModal(false)} centered>
				<Modal.Header closeButton className="border-bottom-0 pb-0">
					<Modal.Title className="fw-bold fs-3 text-center w-100">Kwitansi Transfer Penarikan</Modal.Title>
				</Modal.Header>
				{selectedTransaction && (
					<Modal.Body className="pt-2">
						<div className="border border-dashed p-4 rounded bg-light text-center mb-3">
							<span className="text-muted d-block fs-5">Jumlah Transfer</span>
							<h2 className="fw-bold text-primary mb-1">{formatRupiah(selectedTransaction.amount)}</h2>
							<Badge bg="" className={`px-2 py-1 rounded-pill ${selectedTransaction.status === 'Success' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
								{selectedTransaction.status === 'Success' ? 'TRANSFER SUKSES' : 'DALAM PROSES'}
							</Badge>
						</div>

						<div className="d-flex flex-column gap-2 border-bottom pb-3 mb-3">
							<div className="d-flex justify-content-between fs-4">
								<span className="text-muted">ID Transaksi</span>
								<strong className="text-dark">{selectedTransaction.id}</strong>
							</div>
							<div className="d-flex justify-content-between fs-4">
								<span className="text-muted">Tanggal & Waktu</span>
								<span className="text-dark">{selectedTransaction.date} {selectedTransaction.time}</span>
							</div>
						</div>

						<div className="d-flex flex-column gap-2 pb-2">
							<div className="d-flex justify-content-between fs-4">
								<span className="text-muted">Bank Penerima</span>
								<strong className="text-dark">{selectedTransaction.bank}</strong>
							</div>
							<div className="d-flex justify-content-between fs-4">
								<span className="text-muted">Nomor Rekening</span>
								<span className="text-dark">{selectedTransaction.acc}</span>
							</div>
							<div className="d-flex justify-content-between fs-4">
								<span className="text-muted">Nama Pemilik</span>
								<span className="text-dark">{selectedTransaction.name}</span>
							</div>
							<div className="d-flex justify-content-between fs-4">
								<span className="text-muted">Kategori Event</span>
								<span className="text-dark">{eventName}</span>
							</div>
						</div>
					</Modal.Body>
				)}
				<Modal.Footer className="border-top-0 pt-0">
					<Button variant="secondary" className="w-100 fs-4 fw-semibold" onClick={() => setShowReceiptModal(false)}>
						Tutup
					</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	);
}
