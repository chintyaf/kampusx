import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { Gift, Coins, Image as ImageIcon, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import api from '@/api/axios';
import { notify } from '@/utils/notify';

const getImageUrl = (path) => {
	if (!path) return null;
	const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';
	const cleanPath = path.replace('storage/', '');
	return `${baseUrl}/${cleanPath}`;
};

const GlobalRewardCatalog = () => {
	const [rewards, setRewards] = useState([]);
	const [balance, setBalance] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// Modal States
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [selectedReward, setSelectedReward] = useState(null);
	const [notes, setNotes] = useState('');
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setIsLoading(true);
			setError(null);
			await Promise.all([fetchBalance(), fetchRewards()]);
		} catch (err) {
			console.error('Gagal memuat data katalog:', err);
			setError('Terjadi kesalahan saat memuat data. Silakan coba lagi.');
		} finally {
			setIsLoading(false);
		}
	};

	const fetchBalance = async () => {
		try {
			const response = await api.get('/profile/ledger');
			if (response.data?.success) {
				setBalance(response.data.data.global_balance);
			}
		} catch (err) {
			console.error('Gagal memuat saldo poin:', err);
		}
	};

	const fetchRewards = async () => {
		try {
			const response = await api.get('/global-rewards');
			if (response.data?.success) {
				setRewards(response.data.data);
			}
		} catch (err) {
			console.error('Gagal memuat rewards:', err);
			throw err;
		}
	};

	const handleOpenConfirmModal = (reward) => {
		setSelectedReward(reward);
		setNotes('');
		setShowConfirmModal(true);
	};

	const handleRedeem = async () => {
		if (!selectedReward) return;
		try {
			setSubmitting(true);
			const response = await api.post('/global-rewards/redeem', {
				reward_id: selectedReward.id,
				notes: notes,
			});

			if (response.data?.success) {
				notify('success', 'Sukses', 'Reward global berhasil ditukarkan!');
				setShowConfirmModal(false);
				// Refresh saldo & katalog setelah sukses
				fetchBalance();
				fetchRewards();
			}
		} catch (err) {
			console.error('Gagal menukarkan reward:', err);
			notify('error', 'Gagal', err.response?.data?.message || 'Gagal memproses penukaran reward.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Container className="py-4 py-md-5">
			{/* Saldo Section */}
			<div 
				className="mb-5 p-4 text-white d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 shadow-lg"
				style={{ 
					background: 'linear-gradient(135deg, #00699E 0%, #004d73 100%)', 
					borderRadius: '16px',
					border: '1px solid rgba(255, 255, 255, 0.1)'
				}}
			>
				<div className="d-flex align-items-center gap-3">
					<div 
						className="p-3 bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
						style={{ backdropFilter: 'blur(4px)' }}
					>
						<Coins size={32} className="text-warning" />
					</div>
					<div>
						<h6 className="mb-1 text-white-50 fw-semibold text-uppercase tracking-wider" style={{ fontSize: '12px' }}>Saldo Global Point Anda</h6>
						<h2 className="mb-0 fw-bold fs-1 tracking-tight">{balance.toLocaleString()} <span className="fs-5 fw-normal text-white-50">Points</span></h2>
					</div>
				</div>
				<Button 
					variant="light" 
					className="px-4 py-2 fw-bold text-primary border-0 shadow-sm transition-all hover-scale"
					onClick={loadData}
					disabled={isLoading}
					style={{ borderRadius: '10px', fontSize: '13px' }}
				>
					Refresh Katalog
				</Button>
			</div>

			<div className="d-flex justify-content-between align-items-center mb-4">
				<div>
					<h3 className="fw-bold text-dark mb-1">Katalog Global Reward</h3>
					<p className="text-muted mb-0 small">Tukarkan poin global yang telah Anda kumpulkan dengan berbagai merchandise menarik</p>
				</div>
			</div>

			{error && (
				<Alert variant="danger" className="d-flex align-items-center gap-2 border-0 rounded-3 shadow-sm mb-4">
					<AlertCircle size={18} />
					<span>{error}</span>
				</Alert>
			)}

			{isLoading ? (
				<div className="text-center py-5">
					<Spinner animation="border" variant="primary" role="status" className="mb-2">
						<span className="visually-hidden">Loading...</span>
					</Spinner>
					<div className="text-muted small">Memuat katalog hadiah...</div>
				</div>
			) : rewards.length === 0 ? (
				<div className="text-center py-5 text-muted border rounded-3 bg-light d-flex flex-column align-items-center justify-content-center">
					<Gift size={48} className="text-muted mb-3 opacity-50" />
					<h6 className="fw-bold">Belum Ada Reward Tersedia</h6>
					<p className="small mb-0">Silakan kembali lagi nanti untuk melihat katalog hadiah terbaru.</p>
				</div>
			) : (
				<Row className="g-4">
					{rewards.map((reward) => {
						const isOutOfStock = reward.stock !== null && reward.stock <= 0;
						const isInsufficientBalance = balance < reward.points_cost;
						const imageUrl = getImageUrl(reward.image_path);

						return (
							<Col key={reward.id} xs={12} sm={6} md={4} lg={3}>
								<Card className="h-100 shadow-sm border-0 transition-all hover-lift" style={{ borderRadius: '14px', overflow: 'hidden' }}>
									<div 
										className="position-relative bg-light d-flex align-items-center justify-content-center"
										style={{ height: '180px' }}
									>
										{imageUrl ? (
											<Card.Img 
												variant="top" 
												src={imageUrl} 
												className="w-100 h-100 object-fit-cover" 
												onError={(e) => {
													e.target.style.display = 'none';
													e.target.parentNode.innerHTML = '<div class="text-muted d-flex flex-column align-items-center"><i class="ti ti-image fs-1 mb-1"></i><span class="fs-8">Gagal Memuat Gambar</span></div>';
												}}
											/>
										) : (
											<div className="text-muted text-center d-flex flex-column align-items-center">
												<ImageIcon size={36} className="opacity-50 mb-1" />
												<span style={{ fontSize: '11px' }}>Tanpa Gambar</span>
											</div>
										)}
										<div className="position-absolute top-0 end-0 m-2">
											<span className={`badge ${reward.reward_type === 'digital' ? 'bg-info' : 'bg-secondary'}`}>
												{reward.reward_type === 'digital' ? 'Digital' : 'Fisik'}
											</span>
										</div>
									</div>

									<Card.Body className="d-flex flex-column p-3">
										<div className="d-flex justify-content-between align-items-start gap-2 mb-2">
											<Card.Title className="fw-bold text-dark text-truncate mb-0 fs-6" title={reward.title}>
												{reward.title}
											</Card.Title>
											<span className="badge bg-warning-subtle text-warning-emphasis fw-bold" style={{ borderRadius: '6px', fontSize: '12px' }}>
												{reward.points_cost} Pts
											</span>
										</div>

										<Card.Text 
											className="text-muted flex-grow-1 mb-3" 
											style={{ 
												fontSize: '12px',
												display: '-webkit-box', 
												WebkitLineClamp: 3, 
												WebkitBoxOrient: 'vertical', 
												overflow: 'hidden',
												minHeight: '54px'
											}}
										>
											{reward.description || 'Tidak ada deskripsi.'}
										</Card.Text>

										<div className="border-top pt-3 mt-auto">
											<div className="d-flex justify-content-between align-items-center text-muted mb-3" style={{ fontSize: '11px' }}>
												<span>Stok: <strong className="text-dark">{reward.stock !== null ? reward.stock : '∞'}</strong></span>
												<span>Batas: <strong className="text-dark">{reward.limit_per_user !== null ? `${reward.limit_per_user}x` : '∞'}</strong></span>
											</div>

											<Button 
												variant={isOutOfStock || isInsufficientBalance ? 'secondary' : 'primary'}
												className="w-100 fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
												style={{ borderRadius: '8px', fontSize: '13px' }}
												disabled={isOutOfStock || isInsufficientBalance}
												onClick={() => handleOpenConfirmModal(reward)}
											>
												<ShoppingBag size={14} />
												{isOutOfStock ? 'Stok Habis' : isInsufficientBalance ? 'Poin Tidak Cukup' : 'Tukar Reward'}
											</Button>
										</div>
									</Card.Body>
								</Card>
							</Col>
						);
					})}
				</Row>
			)}

			{/* Modal Konfirmasi Penukaran */}
			<Modal 
				show={showConfirmModal} 
				onHide={() => !submitting && setShowConfirmModal(false)}
				centered
				style={{ zIndex: 1060 }}
			>
				<Modal.Header closeButton={!submitting} className="border-bottom-0 pb-0">
					<Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2 text-dark">
						<Gift size={20} className="text-primary" />
						<span>Konfirmasi Penukaran</span>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="pt-3">
					{selectedReward && (
						<>
							<p className="text-muted small mb-3">
								Apakah Anda yakin ingin menukarkan <strong>{selectedReward.title}</strong>? Poin Anda akan dipotong langsung sebesar <strong>{selectedReward.points_cost} poin</strong>.
							</p>
							
							<div className="p-3 bg-light rounded-3 mb-3 border text-dark">
								<div className="d-flex justify-content-between small mb-1">
									<span>Saldo Poin Anda:</span>
									<span className="fw-bold">{balance.toLocaleString()} Pts</span>
								</div>
								<div className="d-flex justify-content-between small mb-1 text-danger">
									<span>Poin Dibutuhkan:</span>
									<span className="fw-bold">-{selectedReward.points_cost} Pts</span>
								</div>
								<hr className="my-2" />
								<div className="d-flex justify-content-between small fw-bold text-success">
									<span>Sisa Saldo Anda:</span>
									<span>{(balance - selectedReward.points_cost).toLocaleString()} Pts</span>
								</div>
							</div>

							<Form.Group className="mb-2">
								<Form.Label className="fw-semibold text-dark small">Catatan Tambahan (Opsional)</Form.Label>
								<Form.Control 
									as="textarea" 
									rows={3} 
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									disabled={submitting}
									placeholder="Contoh: Ukuran baju (L), warna (hitam), atau alamat pengiriman..."
									style={{ fontSize: '13px', borderRadius: '8px' }}
								/>
							</Form.Group>
						</>
					)}
				</Modal.Body>
				<Modal.Footer className="border-top-0 pt-0">
					<Button 
						variant="light" 
						className="border px-4"
						onClick={() => setShowConfirmModal(false)}
						disabled={submitting}
						style={{ borderRadius: '8px', fontSize: '13px' }}
					>
						Batal
					</Button>
					<Button 
						variant="primary" 
						className="px-4 fw-bold"
						onClick={handleRedeem}
						disabled={submitting}
						style={{ borderRadius: '8px', fontSize: '13px' }}
					>
						{submitting ? (
							<>
								<Spinner animation="border" size="sm" className="me-2" />
								Memproses...
							</>
						) : 'Konfirmasi & Tukar'}
					</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	);
};

export default GlobalRewardCatalog;
