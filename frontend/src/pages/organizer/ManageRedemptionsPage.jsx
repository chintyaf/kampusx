import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Button, Badge, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import { ClipboardList, Check, X, ShieldAlert, Search, Filter, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/api/axios';
import { useLoading } from '@/context/LoadingContext';

export default function ManageRedemptionsPage() {
	const { eventId } = useParams();
	const { setIsPageLoading } = useLoading();
	const [redemptions, setRedemptions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	
	// Modals state
	const [showCancelModal, setShowCancelModal] = useState(false);
	const [selectedRedemption, setSelectedRedemption] = useState(null);
	const [cancellationReason, setCancellationReason] = useState('');

	const [showDeliverModal, setShowDeliverModal] = useState(false);
	const [digitalVoucherCode, setDigitalVoucherCode] = useState('');

	useEffect(() => {
		if (eventId) {
			fetchRedemptions();
		}
	}, [eventId]);

	const fetchRedemptions = () => {
		setLoading(true);
		setIsPageLoading(true);
		api.get(`/event-dashboard/${eventId}/redemptions`)
			.then(res => {
				if (res.data.status === 'success') {
					setRedemptions(res.data.data);
				}
			})
			.catch(err => {
				console.error(err);
				toast.error('Gagal mengambil data penukaran.');
			})
			.finally(() => {
				setLoading(false);
				setIsPageLoading(false);
			});
	};

	const handleOpenCancelModal = (redemption) => {
		setSelectedRedemption(redemption);
		setCancellationReason('');
		setShowCancelModal(true);
	};

	const handleOpenDeliverModal = (redemption) => {
		setSelectedRedemption(redemption);
		setDigitalVoucherCode('');
		setShowDeliverModal(true);
	};

	const handleApprovePhysical = (id) => {
		api.patch(`/event-dashboard/${eventId}/redemptions/${id}/status`, { status: 'claimed' })
			.then(res => {
				if (res.data.status === 'success') {
					setRedemptions(redemptions.map(r => r.id === id ? res.data.data : r));
					toast.success('Status berhasil diubah menjadi Diambil (Claimed)');
				}
			})
			.catch(err => {
				toast.error(err.response?.data?.message || 'Gagal mengubah status penukaran.');
			});
	};

	const handleConfirmDeliverDigital = (e) => {
		e.preventDefault();
		if (!digitalVoucherCode.trim()) {
			toast.error('Masukkan kode voucher terlebih dahulu!');
			return;
		}

		const currentNotes = selectedRedemption.notes || '';
		const newNotes = (currentNotes ? currentNotes + ' | ' : '') + `Kode Voucher: ${digitalVoucherCode}`;

		api.patch(`/event-dashboard/${eventId}/redemptions/${selectedRedemption.id}/status`, { 
			status: 'delivered',
			notes: newNotes
		})
			.then(res => {
				if (res.data.status === 'success') {
					setRedemptions(redemptions.map(r => r.id === selectedRedemption.id ? res.data.data : r));
					toast.success('Voucher digital berhasil dikirim!');
					setShowDeliverModal(false);
				}
			})
			.catch(err => {
				toast.error(err.response?.data?.message || 'Gagal mengirim voucher digital.');
			});
	};

	const handleConfirmCancel = (e) => {
		e.preventDefault();
		if (!cancellationReason.trim()) {
			toast.error('Harap masukkan alasan pembatalan!');
			return;
		}

		api.patch(`/event-dashboard/${eventId}/redemptions/${selectedRedemption.id}/status`, { 
			status: 'cancelled',
			cancellation_reason: cancellationReason 
		})
			.then(res => {
				if (res.data.status === 'success') {
					setRedemptions(redemptions.map(r => r.id === selectedRedemption.id ? res.data.data : r));
					toast.success('Penukaran dibatalkan, poin dikembalikan ke peserta.');
					setShowCancelModal(false);
				}
			})
			.catch(err => {
				toast.error(err.response?.data?.message || 'Gagal membatalkan penukaran.');
			});
	};

	// Filters logic
	const filteredRedemptions = redemptions.filter(r => {
		const memberName = r.user?.name || '';
		const memberEmail = r.user?.email || '';
		const rewardTitle = r.reward?.title || '';

		const matchesSearch = 
			memberName.toLowerCase().includes(searchTerm.toLowerCase()) || 
			memberEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
			rewardTitle.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
		
		return matchesSearch && matchesStatus;
	});

	const getStatusBadge = (status) => {
		switch (status) {
			case 'pending':
				return <Badge bg="warning" className="px-2.5 py-1">🕒 Menunggu</Badge>;
			case 'claimed':
				return <Badge bg="success" className="px-2.5 py-1">🤝 Diambil (Fisik)</Badge>;
			case 'delivered':
				return <Badge bg="success" className="px-2.5 py-1">📩 Terkirim (Digital)</Badge>;
			case 'cancelled':
				return <Badge bg="danger" className="px-2.5 py-1">❌ Dibatalkan</Badge>;
			default:
				return <Badge bg="secondary" className="px-2.5 py-1">{status}</Badge>;
		}
	};

	return (
		<div className="fade-in">
			{/* Header */}
			<div className="mb-4">
				<h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
					<ClipboardList className="text-primary" size={26} />
					<span>Log Penukaran Reward Member</span>
				</h4>
				<p className="text-muted mb-0 small">
					Kelola penyerahan hadiah fisik atau pengiriman voucher digital, serta tolak/batalkan penukaran dengan pengembalian poin otomatis.
				</p>
			</div>

			{/* Filter Cards */}
			<Card className="border shadow-none rounded-4 mb-4">
				<Card.Body className="p-3.5">
					<Row className="g-3 align-items-center">
						<Col xs={12} md={5}>
							<div className="d-flex align-items-center gap-2 bg-light border rounded-3 px-3 py-2">
								<Search size={18} className="text-muted" />
								<input 
									type="text" 
									placeholder="Cari nama, email, atau hadiah..." 
									className="bg-transparent border-0 w-100 outline-none"
									style={{ fontSize: '0.88rem' }}
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
								/>
							</div>
						</Col>
						<Col xs={12} md={4}>
							<div className="d-flex align-items-center gap-2">
								<Filter size={16} className="text-secondary" />
								<Form.Select 
									value={statusFilter} 
									onChange={e => setStatusFilter(e.target.value)}
									style={{ fontSize: '0.88rem' }}
									className="py-2"
								>
									<option value="all">Semua Status</option>
									<option value="pending">🕒 Menunggu (Pending)</option>
									<option value="claimed">🤝 Diambil (Physical Claimed)</option>
									<option value="delivered">📩 Terkirim (Digital Delivered)</option>
									<option value="cancelled">❌ Dibatalkan (Cancelled)</option>
								</Form.Select>
							</div>
						</Col>
					</Row>
				</Card.Body>
			</Card>

			{/* Logs Table */}
			<Card className="border shadow-none rounded-4 overflow-hidden">
				{loading ? (
					<div className="d-flex align-items-center justify-content-center py-5 text-muted" style={{ minHeight: '200px' }}>
						<Spinner animation="border" variant="primary" style={{ width: 28, height: 28 }} />
						<span className="ms-2 text-muted" style={{ fontSize: '0.88rem' }}>Memuat data…</span>
					</div>
				) : (
					<div className="table-responsive">
						<Table hover className="align-middle mb-0 custom-table">
							<thead className="bg-light">
								<tr className="text-secondary" style={{ fontSize: '0.82rem' }}>
									<th className="px-4 py-3">Nama & Kontak Peserta</th>
									<th className="py-3">Hadiah yang Ditukar</th>
									<th className="py-3 text-center" style={{ width: '100px' }}>Poin spent</th>
									<th className="py-3" style={{ width: '160px' }}>Waktu Penukaran</th>
									<th className="py-3">Status</th>
									<th className="py-3">Catatan / Alasan</th>
									<th className="px-4 py-3 text-end" style={{ width: '200px' }}>Tindakan</th>
								</tr>
							</thead>
							<tbody>
								{filteredRedemptions.length === 0 ? (
									<tr>
										<td colSpan="7" className="text-center py-5 text-muted">
											<ClipboardList size={40} className="opacity-25 mb-2 mx-auto" />
											<p className="mb-0 fw-semibold">Tidak Ada Riwayat Penukaran</p>
										</td>
									</tr>
								) : (
									filteredRedemptions.map((log) => (
										<tr key={log.id}>
											<td className="px-4 py-3.5">
												<div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{log.user?.name}</div>
												<div className="text-muted small" style={{ fontSize: '0.78rem' }}>{log.user?.email}</div>
											</td>
											<td className="py-3.5">
												<div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{log.reward?.title}</div>
												<Badge bg="light" className="text-secondary border text-xxs font-normal">
													{log.reward?.reward_type === 'physical' ? '🎁 Fisik' : '💻 Digital'}
												</Badge>
											</td>
											<td className="py-3.5 text-center fw-bold text-secondary" style={{ fontSize: '0.92rem' }}>
												{log.points_spent}
											</td>
											<td className="py-3.5 small text-secondary" style={{ fontSize: '0.8rem' }}>
												{new Date(log.redeemed_at || log.created_at).toLocaleString('id-ID', {
													day: 'numeric',
													month: 'short',
													year: 'numeric',
													hour: '2-digit',
													minute: '2-digit'
												})}
											</td>
											<td className="py-3.5">
												{getStatusBadge(log.status)}
											</td>
											<td className="py-3.5">
												<div className="small text-secondary" style={{ fontSize: '0.78rem', maxHeight: '60px', overflowY: 'auto', maxWidth: '220px' }}>
													{log.status === 'cancelled' ? (
														<span className="text-danger fw-semibold">Alasan: {log.cancellation_reason}</span>
													) : (
														log.notes || '-'
													)}
												</div>
											</td>
											<td className="px-4 py-3.5 text-end">
												{log.status === 'pending' ? (
													<div className="d-flex justify-content-end gap-1.5">
														{(log.reward?.reward_type || 'physical') === 'physical' ? (
															<Button 
																variant="success" 
																size="sm" 
																className="rounded-pill px-3 py-1.5 text-xs fw-semibold d-flex align-items-center gap-1 shadow-sm text-white"
																onClick={() => handleApprovePhysical(log.id)}
															>
																<Check size={12} /> Claim
															</Button>
														) : (
															<Button 
																variant="success" 
																size="sm" 
																className="rounded-pill px-3 py-1.5 text-xs fw-semibold d-flex align-items-center gap-1 shadow-sm text-white"
																onClick={() => handleOpenDeliverModal(log)}
															>
																<Check size={12} /> Deliver
															</Button>
														)}
														<Button 
															variant="outline-danger" 
															size="sm" 
															className="rounded-pill px-3 py-1.5 text-xs fw-semibold d-flex align-items-center gap-1 border"
															onClick={() => handleOpenCancelModal(log)}
														>
															<X size={12} /> Cancel
														</Button>
													</div>
												) : (
													<span className="text-muted small italic">Selesai</span>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</Table>
					</div>
				)}
			</Card>

			{/* Modal Cancel & Refund */}
			<Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
				<Modal.Header closeButton className="border-0 pb-0">
					<Modal.Title className="fw-bold text-danger d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
						<ShieldAlert size={22} />
						Batalkan Penukaran Reward?
					</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleConfirmCancel}>
					<Modal.Body className="pt-2">
						<p className="text-muted small mb-3">
							Membatalkan penukaran ini akan **mengembalikan {selectedRedemption?.points_spent} poin secara otomatis** ke saldo akun **{selectedRedemption?.user?.name}**.
						</p>
						<Form.Group>
							<Form.Label className="fw-bold small text-secondary">Alasan Pembatalan *</Form.Label>
							<Form.Control 
								as="textarea"
								rows={3}
								required
								placeholder="e.g. Stok ukuran kaos tidak tersedia atau informasi kontak salah..."
								value={cancellationReason}
								onChange={e => setCancellationReason(e.target.value)}
							/>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer className="border-0 pt-0">
						<Button variant="outline-secondary" className="rounded-pill px-3.5" onClick={() => setShowCancelModal(false)}>
							Kembali
						</Button>
						<Button variant="danger" type="submit" className="rounded-pill px-3.5 text-white">
							Batalkan & Refund
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{/* Modal Deliver Digital Voucher */}
			<Modal show={showDeliverModal} onHide={() => setShowDeliverModal(false)} centered>
				<Modal.Header closeButton className="border-0 pb-0">
					<Modal.Title className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>
						Kirim Voucher Digital
					</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleConfirmDeliverDigital}>
					<Modal.Body className="pt-2">
						<p className="text-muted small mb-3">
							Masukkan kode voucher belanja atau link redeem voucher untuk dikirimkan ke **{selectedRedemption?.user?.name}**.
						</p>
						<Form.Group>
							<Form.Label className="fw-bold small text-secondary">Kode Voucher / Link E-Wallet *</Form.Label>
							<Form.Control 
								type="text"
								required
								placeholder="e.g. GP-50K-XYZ987654321"
								value={digitalVoucherCode}
								onChange={e => setDigitalVoucherCode(e.target.value)}
							/>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer className="border-0 pt-0">
						<Button variant="outline-secondary" className="rounded-pill px-3.5" onClick={() => setShowDeliverModal(false)}>
							Batal
						</Button>
						<Button variant="success" type="submit" className="rounded-pill px-3.5 text-white">
							Kirim Voucher
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</div>
	);
}
