import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Button, Badge, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import { Gift, Plus, Edit2, Trash2, Shield, Eye, EyeOff, Search, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/api/axios';
import { useLoading } from '@/context/LoadingContext';
import FormHeading from '@/components/dashboard/FormHeading';
import '@/assets/css/participant-list.css';

export default function ManageRewardsPage() {
	const { eventId } = useParams();
	const { setIsPageLoading } = useLoading();
	const [rewards, setRewards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	
	// Modal states
	const [showModal, setShowModal] = useState(false);
	const [editingReward, setEditingReward] = useState(null);
	
	// Form states
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [pointsCost, setPointsCost] = useState(50);
	const [stock, setStock] = useState('');
	const [limitPerUser, setLimitPerUser] = useState('');
	const [rewardType, setRewardType] = useState('physical');
	const [isOnlineWarning, setIsOnlineWarning] = useState(false);
	const [imageUrl, setImageUrl] = useState('');
	const [imagePath, setImagePath] = useState('');
	const [imageFile, setImageFile] = useState(null);
	const [isActive, setIsActive] = useState(true);

	const getRewardImage = (reward) => {
		if (!reward) return '';
		return reward.image_url || reward.image_path || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300';
	};

	useEffect(() => {
		if (eventId) {
			fetchRewards();
		}
	}, [eventId]);

	const fetchRewards = () => {
		setLoading(true);
		setIsPageLoading(true);
		api.get(`/event-dashboard/${eventId}/rewards`)
			.then(res => {
				if (res.data.status === 'success') {
					setRewards(res.data.data);
				}
			})
			.catch(err => {
				console.error(err);
				toast.error('Gagal mengambil data reward.');
			})
			.finally(() => {
				setLoading(false);
				setIsPageLoading(false);
			});
	};

	const handleOpenCreateModal = () => {
		setEditingReward(null);
		setTitle('');
		setDescription('');
		setPointsCost(50);
		setStock('');
		setLimitPerUser('');
		setRewardType('physical');
		setImageUrl('');
		setImagePath('');
		setImageFile(null);
		setIsActive(true);
		setShowModal(true);
	};

	const handleOpenEditModal = (reward) => {
		setEditingReward(reward);
		setTitle(reward.title);
		setDescription(reward.description || '');
		setPointsCost(reward.points_cost);
		setStock(reward.stock !== null && reward.stock !== undefined ? reward.stock : '');
		setLimitPerUser(reward.limit_per_user !== null && reward.limit_per_user !== undefined ? reward.limit_per_user : '');
		setRewardType(reward.reward_type);
		setImageUrl(reward.image_url || reward.image_path || '');
		setImagePath(reward.image_path || '');
		setImageFile(null);
		setIsActive(reward.is_active === 1 || reward.is_active === true);
		setShowModal(true);
	};

	const handleSave = (e) => {
		e.preventDefault();
		if (!title.trim() || pointsCost <= 0) {
			toast.error('Nama reward dan biaya poin harus valid!');
			return;
		}

		const formData = new FormData();
		formData.append('title', title);
		formData.append('description', description || '');
		formData.append('points_cost', String(parseInt(pointsCost)));
		if (stock !== '') {
			formData.append('stock', String(parseInt(stock)));
		}
		if (limitPerUser !== '') {
			formData.append('limit_per_user', String(parseInt(limitPerUser)));
		}
		formData.append('reward_type', rewardType);
		formData.append('is_active', isActive ? '1' : '0');

		if (imageFile) {
			formData.append('image_path', imageFile);
		} else if (imagePath) {
			formData.append('image_path', imagePath);
		}

		const config = {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		};

		if (editingReward) {
			// Spoof PUT method for Laravel file upload support
			formData.append('_method', 'PUT');
			// Update
			api.post(`/event-dashboard/${eventId}/rewards/${editingReward.id}`, formData, config)
				.then(res => {
					if (res.data.status === 'success') {
						setRewards(rewards.map(r => r.id === editingReward.id ? res.data.data : r));
						toast.success('Reward berhasil diperbarui!');
						setShowModal(false);
					}
				})
				.catch(err => {
					toast.error(err.response?.data?.message || 'Gagal memperbarui reward.');
				});
		} else {
			// Create
			api.post(`/event-dashboard/${eventId}/rewards`, formData, config)
				.then(res => {
					if (res.data.status === 'success') {
						setRewards([res.data.data, ...rewards]);
						toast.success('Reward baru berhasil ditambahkan!');
						setShowModal(false);
					}
				})
				.catch(err => {
					toast.error(err.response?.data?.message || 'Gagal membuat reward baru.');
				});
		}
	};

	const handleDelete = (id) => {
		if (window.confirm('Apakah Anda yakin ingin menghapus reward ini?')) {
			api.delete(`/event-dashboard/${eventId}/rewards/${id}`)
				.then(res => {
					if (res.data.status === 'success') {
						setRewards(rewards.filter(r => r.id !== id));
						toast.success('Reward berhasil dihapus!');
					}
				})
				.catch(err => {
					toast.error('Gagal menghapus reward.');
				});
		}
	};

	const toggleActiveStatus = (reward) => {
		const nextStatus = !(reward.is_active === 1 || reward.is_active === true);
		const payload = {
			title: reward.title,
			description: reward.description,
			points_cost: reward.points_cost,
			stock: reward.stock,
			limit_per_user: reward.limit_per_user,
			reward_type: reward.reward_type,
			image_path: reward.image_path,
			is_active: nextStatus
		};

		api.put(`/event-dashboard/${eventId}/rewards/${reward.id}`, payload)
			.then(res => {
				if (res.data.status === 'success') {
					setRewards(rewards.map(r => r.id === reward.id ? res.data.data : r));
					toast.success(`Reward "${reward.title}" sekarang ${nextStatus ? 'Aktif' : 'Non-aktif'}`);
				}
			})
			.catch(err => {
				toast.error('Gagal mengubah status keaktifan reward.');
			});
	};

	const filteredRewards = rewards.filter(r => 
		r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
		(r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	return (
		<div className="container-fluid p-0 fade-in">
			{/* Header */}
			<div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
				<FormHeading
					title="Manajemen Reward Lokal"
					description="Atur dan kelola inventaris hadiah/reward yang dapat ditukarkan menggunakan poin lokal oleh peserta event ini."
				/>
				<Button 
					variant="primary" 
					className="rounded-3 px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm border-0 text-white"
					style={{ backgroundColor: 'var(--primary)' }}
					onClick={handleOpenCreateModal}
				>
					<Plus size={18} /> Tambah Reward
				</Button>
			</div>

			{/* Filter & Search */}
			<Card className="border shadow-sm rounded-4 mb-4 bg-white">
				<Card.Body className="p-3.5">
					<div className="position-relative d-flex align-items-center" style={{ maxWidth: '400px' }}>
						<Search size={16} className="position-absolute start-0 ms-3 text-muted" style={{ pointerEvents: 'none' }} />
						<Form.Control 
							type="text" 
							placeholder="Cari nama atau deskripsi..." 
							style={{
								paddingLeft: '2.5rem',
								fontSize: '0.85rem',
								borderRadius: '10px',
								border: '1.5px solid var(--border)',
								backgroundColor: '#fafbfc',
								outline: 'none',
								boxShadow: 'none',
							}}
							className="py-2 text-dark"
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
						/>
					</div>
				</Card.Body>
			</Card>

			{/* List Reward */}
			<Card className="border shadow-sm rounded-4 overflow-hidden bg-white mb-4">
				{loading ? (
					<div className="d-flex align-items-center justify-content-center py-5 text-muted" style={{ minHeight: '200px' }}>
						<Spinner animation="border" variant="primary" style={{ width: 28, height: 28 }} />
						<span className="ms-2 text-muted" style={{ fontSize: '0.88rem' }}>Memuat data…</span>
					</div>
				) : (
					<div className="table-responsive">
						<Table hover className="align-middle mb-0 custom-table">
							<thead>
								<tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
									<th className="px-4 py-3 text-muted fw-bold text-uppercase" style={{ width: '80px', fontSize: '0.72rem', letterSpacing: '0.04em' }}>Foto</th>
									<th className="py-3 text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>Nama & Deskripsi</th>
									<th className="py-3 text-muted fw-bold text-uppercase" style={{ width: '120px', fontSize: '0.72rem', letterSpacing: '0.04em' }}>Tipe</th>
									<th className="py-3 text-center text-muted fw-bold text-uppercase" style={{ width: '120px', fontSize: '0.72rem', letterSpacing: '0.04em' }}>Biaya Poin</th>
									<th className="py-3 text-center text-muted fw-bold text-uppercase" style={{ width: '120px', fontSize: '0.72rem', letterSpacing: '0.04em' }}>Stok</th>
									<th className="py-3 text-center text-muted fw-bold text-uppercase" style={{ width: '120px', fontSize: '0.72rem', letterSpacing: '0.04em' }}>Status</th>
									<th className="px-4 py-3 text-end text-muted fw-bold text-uppercase" style={{ width: '150px', fontSize: '0.72rem', letterSpacing: '0.04em' }}>Aksi</th>
								</tr>
							</thead>
							<tbody>
								{filteredRewards.length === 0 ? (
									<tr>
										<td colSpan="7" className="text-center py-5 text-muted">
											<Gift size={40} className="opacity-25 mb-2 mx-auto" />
											<p className="mb-0 fw-semibold">Tidak Ada Reward Ditemukan</p>
											<p className="small text-muted mb-0">Klik tombol "Tambah Reward" untuk membuat reward baru.</p>
										</td>
									</tr>
								) : (
									filteredRewards.map((reward) => (
										<tr key={reward.id}>
											<td className="px-4 py-3.5">
												<div className="rounded-3 overflow-hidden border bg-light animate-pulse" style={{ width: '56px', height: '56px' }}>
													<img src={getRewardImage(reward)} alt={reward.title} className="w-100 h-100 object-fit-cover" />
												</div>
											</td>
											<td className="py-3.5">
												<div className="fw-bold text-dark" style={{ fontSize: '0.92rem' }}>{reward.title}</div>
												<div className="text-muted text-truncate" style={{ fontSize: '0.78rem', maxWidth: '350px' }}>
													{reward.description || 'Tidak ada deskripsi.'}
												</div>
												{reward.limit_per_user && (
													<Badge bg="light" className="text-secondary border mt-1 font-normal text-xs">
														Batas: {reward.limit_per_user}x / user
													</Badge>
												)}
											</td>
											<td className="py-3.5">
												{reward.reward_type === 'physical' ? (
													<span 
														className="px-2.5 py-1 rounded-3 fw-semibold d-inline-flex align-items-center gap-1.5"
														style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info-text)', border: '1px solid var(--info-border-color)', fontSize: '0.75rem' }}
													>
														<span>🎁</span>
														<span>Fisik</span>
													</span>
												) : (
													<span 
														className="px-2.5 py-1 rounded-3 fw-semibold d-inline-flex align-items-center gap-1.5"
														style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-border-color)', fontSize: '0.75rem' }}
													>
														<span>💻</span>
														<span>Digital</span>
													</span>
												)}
											</td>
											<td className="py-3.5 text-center fw-bold text-primary" style={{ fontSize: '0.95rem' }}>
												{reward.points_cost} Pts
											</td>
											<td className="py-3.5 text-center">
												{reward.stock !== null ? (
													<span className={reward.stock <= 5 ? "text-danger fw-bold" : "text-dark"}>
														{reward.stock} Pcs
													</span>
												) : (
													<span className="text-muted">∞ (Tak Terbatas)</span>
												)}
											</td>
											<td className="py-3.5 text-center">
												<div className="d-flex flex-column align-items-center gap-1.5">
													<label className="show-all-toggle mb-0">
														<div
															className={`toggle-track${(reward.is_active === 1 || reward.is_active === true) ? ' toggle-track--on' : ''}`}
															onClick={() => toggleActiveStatus(reward)}
														>
															<div className="toggle-thumb" />
														</div>
													</label>
													<span style={{ fontSize: '0.68rem', fontWeight: '700' }} className={(reward.is_active === 1 || reward.is_active === true) ? 'text-success' : 'text-muted'}>
														{(reward.is_active === 1 || reward.is_active === true) ? 'Aktif' : 'Non-aktif'}
													</span>
												</div>
											</td>
											<td className="px-4 py-3.5 text-end">
												<div className="d-flex justify-content-end gap-2">
													<Button 
														variant="light" 
														size="sm" 
														className="border d-flex align-items-center justify-content-center p-2 bg-white shadow-sm rounded-3"
														onClick={() => handleOpenEditModal(reward)}
														title="Edit"
													>
														<Edit2 size={13} className="text-secondary" />
													</Button>
													<Button 
														variant="light" 
														size="sm" 
														className="border d-flex align-items-center justify-content-center p-2 bg-white shadow-sm rounded-3"
														onClick={() => handleDelete(reward.id)}
														title="Hapus"
													>
														<Trash2 size={13} className="text-danger" />
													</Button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</Table>
					</div>
				)}
			</Card>

			{/* Modal Dialog Form */}
			<Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
				<Modal.Header closeButton className="border-bottom px-4 py-3">
					<Modal.Title className="fw-bold" style={{ fontSize: '1.15rem' }}>
						{editingReward ? 'Edit Detail Reward' : 'Tambah Reward Baru'}
					</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSave}>
					<Modal.Body className="p-4">
						<Row className="g-3">
							<Col xs={12}>
								<Form.Group>
									<Form.Label className="fw-bold small text-secondary">Nama Reward *</Form.Label>
									<Form.Control 
										type="text" 
										placeholder="e.g. Kaos Eksklusif KampusX"
										required 
										style={{
											borderRadius: '10px',
											border: '1.5px solid var(--border)',
											fontSize: '0.88rem',
											outline: 'none',
											boxShadow: 'none'
										}}
										className="p-2.5 text-dark"
										value={title}
										onChange={e => setTitle(e.target.value)}
									/>
								</Form.Group>
							</Col>

							<Col xs={12}>
								<Form.Group>
									<Form.Label className="fw-bold small text-secondary">Deskripsi Singkat</Form.Label>
									<Form.Control 
										as="textarea" 
										rows={3} 
										placeholder="Deskripsikan detail fisik, ukuran, cara klaim, atau kode voucher..."
										style={{
											borderRadius: '10px',
											border: '1.5px solid var(--border)',
											fontSize: '0.88rem',
											outline: 'none',
											boxShadow: 'none'
										}}
										className="p-2.5 text-dark"
										value={description}
										onChange={e => setDescription(e.target.value)}
									/>
								</Form.Group>
							</Col>

							<Col xs={12} sm={6}>
								<Form.Group>
									<Form.Label className="fw-bold small text-secondary">Biaya Poin Penukaran *</Form.Label>
									<Form.Control 
										type="number" 
										required 
										min="1"
										style={{
											borderRadius: '10px',
											border: '1.5px solid var(--border)',
											fontSize: '0.88rem',
											outline: 'none',
											boxShadow: 'none'
										}}
										className="p-2.5 text-dark"
										value={pointsCost}
										onChange={e => setPointsCost(e.target.value)}
									/>
								</Form.Group>
							</Col>

							<Col xs={12} sm={6}>
								<Form.Group>
									<Form.Label className="fw-bold small text-secondary">Tipe Reward</Form.Label>
									<Form.Select 
										value={rewardType}
										style={{
											borderRadius: '10px',
											border: '1.5px solid var(--border)',
											fontSize: '0.88rem',
											outline: 'none',
											boxShadow: 'none'
										}}
										className="p-2.5 text-secondary fw-semibold"
										onChange={e => setRewardType(e.target.value)}
									>
										<option value="physical">Physical (Fisik)</option>
										<option value="digital">Digital (E-Voucher/Code)</option>
									</Form.Select>
								</Form.Group>
							</Col>

							<Col xs={12} sm={6}>
								<Form.Group>
									<Form.Label className="fw-bold small text-secondary">Stok Awal (Kosongkan jika tak terbatas)</Form.Label>
									<Form.Control 
										type="number" 
										min="0"
										style={{
											borderRadius: '10px',
											border: '1.5px solid var(--border)',
											fontSize: '0.88rem',
											outline: 'none',
											boxShadow: 'none'
										}}
										className="p-2.5 text-dark"
										placeholder="e.g. 50"
										value={stock}
										onChange={e => setStock(e.target.value)}
									/>
								</Form.Group>
							</Col>

							<Col xs={12} sm={6}>
								<Form.Group>
									<Form.Label className="fw-bold small text-secondary">Batas Tukar per User (Kosongkan jika bebas)</Form.Label>
									<Form.Control 
										type="number" 
										min="1"
										style={{
											borderRadius: '10px',
											border: '1.5px solid var(--border)',
											fontSize: '0.88rem',
											outline: 'none',
											boxShadow: 'none'
										}}
										className="p-2.5 text-dark"
										placeholder="e.g. 1"
										value={limitPerUser}
										onChange={e => setLimitPerUser(e.target.value)}
									/>
								</Form.Group>
							</Col>

							<Col xs={12}>
								<Form.Group>
									<Form.Label className="fw-bold small text-secondary">Gambar Reward</Form.Label>
									{imageUrl && (
										<div className="mb-3 position-relative rounded-3 overflow-hidden border shadow-sm bg-light" style={{ width: '120px', height: '120px' }}>
											<img 
												src={imageUrl} 
												alt="Preview" 
												className="w-100 h-100 object-fit-cover" 
											/>
											<button
												type="button"
												className="rounded-circle position-absolute top-0 end-0 m-1.5 d-flex align-items-center justify-content-center shadow-sm border-0 text-white"
												style={{ width: '22px', height: '22px', backgroundColor: 'var(--error-text)', cursor: 'pointer' }}
												onClick={() => {
													setImageUrl('');
													setImagePath('');
													setImageFile(null);
												}}
											>
												<Trash2 size={12} />
											</button>
										</div>
									)}
									<Form.Control 
										type="file" 
										accept="image/*"
										style={{
											borderRadius: '10px',
											border: '1.5px solid var(--border)',
											fontSize: '0.88rem',
											outline: 'none',
											boxShadow: 'none'
										}}
										className="p-2.5 text-dark"
										onChange={e => {
											const file = e.target.files[0];
											if (file) {
												setImageFile(file);
												setImageUrl(URL.createObjectURL(file));
											}
										}}
									/>
									<Form.Text className="text-muted small">
										Format yang didukung: JPG, PNG, GIF, WebP. Maksimal 2MB.
									</Form.Text>
								</Form.Group>
							</Col>

							<Col xs={12}>
								<div className="d-flex align-items-center gap-2 mt-2">
									<label className="show-all-toggle mb-0">
										<div
											className={`toggle-track${isActive ? ' toggle-track--on' : ''}`}
											onClick={() => setIsActive(v => !v)}
										>
											<div className="toggle-thumb" />
										</div>
									</label>
									<span className="fw-semibold text-secondary" style={{ fontSize: '0.88rem' }}>
										Tampilkan reward ini langsung di katalog halaman peserta
									</span>
								</div>
							</Col>
						</Row>
					</Modal.Body>
					<Modal.Footer className="border-top px-4 py-3">
						<Button variant="outline-secondary" className="rounded-3 px-4 py-2 fw-semibold" onClick={() => setShowModal(false)}>
							Batal
						</Button>
						<Button variant="primary" type="submit" className="rounded-3 px-4 py-2 fw-semibold border-0 text-white" style={{ backgroundColor: 'var(--primary)' }}>
							{editingReward ? 'Simpan Perubahan' : 'Buat Reward'}
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</div>
	);
}
