import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, CheckCircle2, XCircle, Gift, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import FormHeading from '@/components/dashboard/FormHeading';
import StatCard from '@/features/users/components/StatCard';
import api from '@/api/axios';
import ModalBox from '@/components/dashboard/ModalBox';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';
import { notify } from '@/utils/notify';

const getImageUrl = (path) => {
	if (!path) return null;
	const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';
	const cleanPath = path.replace('storage/', '');
	return `${baseUrl}/${cleanPath}`;
};

const RewardCard = ({ reward, onEdit, onDelete }) => {
	const imageUrl = getImageUrl(reward.image_path);

	return (
		<div className="card h-100 shadow-sm border animate__animated animate__fadeIn" style={{ borderRadius: '12px', overflow: 'hidden' }}>
			<div className="position-relative" style={{ height: '160px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				{imageUrl ? (
					<img 
						src={imageUrl} 
						alt={reward.title} 
						className="w-100 h-100 object-fit-cover"
						onError={(e) => {
							e.target.style.display = 'none';
							e.target.parentNode.innerHTML = '<span class="text-muted"><i class="ti ti-image" style="font-size: 2rem;"></i></span>';
						}}
					/>
				) : (
					<div className="text-muted text-center d-flex flex-column align-items-center">
						<ImageIcon size={32} className="mb-1" />
						<span style={{ fontSize: '11px' }}>Tanpa Gambar</span>
					</div>
				)}
				<div className="position-absolute top-0 end-0 m-2 d-flex gap-1">
					<span className={`badge ${reward.reward_type === 'digital' ? 'bg-info' : 'bg-secondary'}`}>
						{reward.reward_type === 'digital' ? 'Digital' : 'Fisik'}
					</span>
					<span className={`badge ${reward.is_active ? 'bg-success' : 'bg-warning'}`}>
						{reward.is_active ? 'Aktif' : 'Nonaktif'}
					</span>
				</div>
			</div>
			
			<div className="card-body d-flex flex-column">
				<div className="d-flex justify-content-between align-items-start mb-2">
					<h5 className="card-title fw-bold text-dark text-truncate mb-0" title={reward.title} style={{ fontSize: '10px' }}>
						{reward.title}
					</h5>
					<span className="badge bg-primary-subtle text-primary fw-semibold fs-7" style={{ padding: '4px 8px', borderRadius: '6px' }}>
						{reward.points_cost} Poin
					</span>
				</div>
				
				<p className="card-text text-muted small flex-grow-1 text-clamp mb-3" style={{ 
					display: '-webkit-box', 
					WebkitLineClamp: 3, 
					WebkitBoxOrient: 'vertical', 
					overflow: 'hidden',
					minHeight: '48px',
					fontSize: '12px'
				}}>
					{reward.description || 'Tidak ada deskripsi.'}
				</p>

				<div className="border-top pt-3 mt-auto">
					<div className="d-flex justify-content-between align-items-center text-muted small mb-3" style={{ fontSize: '11px' }}>
						<div>
							Stok: <span className="fw-semibold text-dark">{reward.stock !== null ? reward.stock : '∞'}</span>
						</div>
						<div>
							Batas Penukaran: <span className="fw-semibold text-dark">{reward.limit_per_user !== null ? `${reward.limit_per_user}x` : '∞'}</span>
						</div>
					</div>

					<div className="d-flex gap-2">
						<button 
							className="btn btn-sm btn-outline-primary w-50 d-flex align-items-center justify-content-center gap-1"
							style={{ fontSize: '12px', borderRadius: '6px' }}
							onClick={() => onEdit(reward)}
						>
							<Pencil size={12} /> Edit
						</button>
						<button 
							className="btn btn-sm btn-outline-danger w-50 d-flex align-items-center justify-content-center gap-1"
							style={{ fontSize: '12px', borderRadius: '6px' }}
							onClick={() => onDelete(reward)}
						>
							<Trash2 size={12} /> Hapus
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

const ManageGlobalRewards = () => {
	const [rewards, setRewards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const fileInputRef = useRef(null);

	// Modal States
	const [showFormModal, setShowFormModal] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [currentReward, setCurrentReward] = useState(null);
	const [actionType, setActionType] = useState('add'); // 'add' | 'edit'
	const [submitting, setSubmitting] = useState(false);

	// Form States
	const [formState, setFormState] = useState({
		title: '',
		description: '',
		points_cost: '',
		stock: '',
		limit_per_user: '',
		reward_type: 'physical',
		is_active: true,
	});
	const [selectedImage, setSelectedImage] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);

	useEffect(() => {
		fetchRewards();
	}, []);

	const fetchRewards = async () => {
		try {
			setLoading(true);
			const response = await api.get('/admin/global-rewards');
			setRewards(response.data.data || []);
		} catch (error) {
			console.error('Gagal mengambil data rewards:', error);
			notify('error', 'Gagal', 'Terjadi kesalahan saat memuat katalog reward.');
		} finally {
			setLoading(false);
		}
	};

	const filteredRewards = useMemo(() => {
		const q = search.toLowerCase();
		return rewards.filter((r) => r.title.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q)));
	}, [search, rewards]);

	const handleAddClick = () => {
		setActionType('add');
		setFormState({
			title: '',
			description: '',
			points_cost: '',
			stock: '',
			limit_per_user: '',
			reward_type: 'physical',
			is_active: true,
		});
		setSelectedImage(null);
		setImagePreview(null);
		setShowFormModal(true);
	};

	const handleEditClick = (r) => {
		setActionType('edit');
		setCurrentReward(r);
		setFormState({
			title: r.title,
			description: r.description || '',
			points_cost: r.points_cost,
			stock: r.stock !== null ? r.stock : '',
			limit_per_user: r.limit_per_user !== null ? r.limit_per_user : '',
			reward_type: r.reward_type,
			is_active: !!r.is_active,
		});
		setSelectedImage(null);
		setImagePreview(getImageUrl(r.image_path));
		setShowFormModal(true);
	};

	const handleDeleteClick = (r) => {
		setCurrentReward(r);
		setShowConfirmModal(true);
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setSelectedImage(file);
			setImagePreview(URL.createObjectURL(file));
		}
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		try {
			setSubmitting(true);

			const formData = new FormData();
			formData.append('title', formState.title);
			formData.append('description', formState.description || '');
			formData.append('points_cost', parseInt(formState.points_cost));
			formData.append('stock', formState.stock !== '' ? parseInt(formState.stock) : '');
			formData.append('limit_per_user', formState.limit_per_user !== '' ? parseInt(formState.limit_per_user) : '');
			formData.append('reward_type', formState.reward_type);
			formData.append('is_active', formState.is_active ? '1' : '0');

			if (selectedImage) {
				formData.append('image', selectedImage);
			}

			if (actionType === 'add') {
				await api.post('/admin/global-rewards', formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
				notify('success', 'Berhasil', 'Reward global baru berhasil dibuat.');
			} else {
				// Gunakan POST dengan override _method PUT karena PHP/Laravel tidak mem-parsing form-data multipart pada request PUT asli
				formData.append('_method', 'PUT');
				await api.post(`/admin/global-rewards/${currentReward.id}`, formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
				notify('success', 'Berhasil', 'Reward global berhasil diperbarui.');
			}

			setShowFormModal(false);
			fetchRewards();
		} catch (error) {
			console.error('Gagal menyimpan reward:', error);
			notify('error', 'Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
		} finally {
			setSubmitting(false);
		}
	};

	const handleConfirmDelete = async () => {
		try {
			setSubmitting(true);
			await api.delete(`/admin/global-rewards/${currentReward.id}`);
			notify('success', 'Berhasil', 'Reward global berhasil dihapus.');
			setShowConfirmModal(false);
			fetchRewards();
		} catch (error) {
			console.error('Gagal menghapus reward:', error);
			notify('error', 'Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menghapus reward.');
		} finally {
			setSubmitting(false);
		}
	};

	const stats = [
		{
			label: 'Total Reward Global',
			value: rewards.length,
			icon: (color) => <Gift size={18} color={color} />,
			iconBg: 'var(--primary-light)',
			iconColor: 'var(--primary)',
		},
		{
			label: 'Tipe Fisik',
			value: rewards.filter((r) => r.reward_type === 'physical').length,
			icon: (color) => <CheckCircle2 size={18} color={color} />,
			iconBg: 'var(--success-bg)',
			iconColor: 'var(--success-text)',
		},
		{
			label: 'Tipe Digital',
			value: rewards.filter((r) => r.reward_type === 'digital').length,
			icon: (color) => <CheckCircle2 size={18} color={color} />,
			iconBg: 'var(--success-bg)',
			iconColor: 'var(--success-text)',
		},
	];

	return (
		<div className="page-content">
			<FormHeading
				heading="Katalog Reward Global"
				subheading="Kelola hadiah fisik maupun digital yang dapat ditukar secara global menggunakan platform poin"
			/>

			<div className="stats-row">
				{stats.map((s) => (
					<StatCard key={s.label} {...s} />
				))}
			</div>

			<div className="table-card p-4">
				<div className="d-flex flex-column flex-sm-row justify-content-between gap-3 mb-4">
					<div className="search-box" style={{ maxWidth: '320px' }}>
						<Search size={14} color="var(--text-muted)" />
						<input
							placeholder="Cari katalog reward..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<button className="btn btn-primary align-self-start" onClick={handleAddClick} disabled={loading}>
						<Plus size={14} /> Tambah Reward
					</button>
				</div>

				{loading ? (
					<div className="text-center py-5">
						<div className="spinner-border text-primary" role="status">
							<span className="visually-hidden">Memuat...</span>
						</div>
					</div>
				) : filteredRewards.length === 0 ? (
					<div className="text-center py-5 text-muted small border rounded-3 bg-light">
						Belum ada katalog reward global. Silakan tambahkan katalog baru.
					</div>
				) : (
					<div className="row g-4">
						{filteredRewards.map((reward) => (
							<div className="col-12 col-md-6 col-lg-4 col-xl-3" key={reward.id}>
								<RewardCard
									reward={reward}
									onEdit={handleEditClick}
									onDelete={handleDeleteClick}
								/>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Modal Form */}
			<ModalBox
				show={showFormModal}
				onHide={() => setShowFormModal(false)}
				title={actionType === 'add' ? 'Tambah Reward' : 'Edit Reward'}
				subtitle={actionType === 'add' ? 'Buat katalog hadiah global baru' : 'Modifikasi detail katalog hadiah'}
			>
				<form onSubmit={handleFormSubmit}>
					<div className="mb-3">
						<label className="form-label fw-semibold text-dark small">Nama Hadiah / Reward</label>
						<input
							type="text"
							className="form-control"
							style={{ borderRadius: 8, fontSize: 13 }}
							required
							value={formState.title}
							onChange={(e) => setFormState({ ...formState, title: e.target.value })}
							placeholder="Contoh: T-Shirt Resmi KampusX"
						/>
					</div>

					<div className="mb-3">
						<label className="form-label fw-semibold text-dark small">Deskripsi Lengkap</label>
						<textarea
							className="form-control"
							style={{ borderRadius: 8, fontSize: 13 }}
							rows={3}
							value={formState.description}
							onChange={(e) => setFormState({ ...formState, description: e.target.value })}
							placeholder="Jelaskan detail hadiah secara mendalam..."
						/>
					</div>

					<div className="row">
						<div className="col-md-6 mb-3">
							<label className="form-label fw-semibold text-dark small">Harga Poin</label>
							<input
								type="number"
								className="form-control"
								style={{ borderRadius: 8, fontSize: 13 }}
								required
								min="0"
								value={formState.points_cost}
								onChange={(e) => setFormState({ ...formState, points_cost: e.target.value })}
								placeholder="Harga penukaran"
							/>
						</div>
						<div className="col-md-6 mb-3">
							<label className="form-label fw-semibold text-dark small">Tipe Reward</label>
							<select
								className="form-select"
								style={{ borderRadius: 8, fontSize: 13 }}
								value={formState.reward_type}
								onChange={(e) => setFormState({ ...formState, reward_type: e.target.value })}
							>
								<option value="physical">Fisik (Dikirim / Diambil)</option>
								<option value="digital">Digital (Kupon / Kode / PDF)</option>
							</select>
						</div>
					</div>

					<div className="row">
						<div className="col-md-6 mb-3">
							<label className="form-label fw-semibold text-dark small">Stok Awal</label>
							<input
								type="number"
								className="form-control"
								style={{ borderRadius: 8, fontSize: 13 }}
								min="0"
								value={formState.stock}
								onChange={(e) => setFormState({ ...formState, stock: e.target.value })}
								placeholder="Biarkan kosong jika tak terbatas"
							/>
						</div>
						<div className="col-md-6 mb-3">
							<label className="form-label fw-semibold text-dark small">Batas Penukaran Per User</label>
							<input
								type="number"
								className="form-control"
								style={{ borderRadius: 8, fontSize: 13 }}
								min="0"
								value={formState.limit_per_user}
								onChange={(e) => setFormState({ ...formState, limit_per_user: e.target.value })}
								placeholder="Biarkan kosong jika bebas"
							/>
						</div>
					</div>

					<div className="mb-3">
						<label className="form-label fw-semibold text-dark small">Gambar Poster / Preview Hadiah</label>
						<input
							type="file"
							className="form-control"
							style={{ borderRadius: 8, fontSize: 13 }}
							ref={fileInputRef}
							accept="image/*"
							onChange={handleImageChange}
						/>
						{imagePreview && (
							<div className="mt-3 text-center border p-2 rounded" style={{ backgroundColor: '#f9fafb' }}>
								<img 
									src={imagePreview} 
									alt="Preview" 
									className="img-fluid rounded" 
									style={{ maxHeight: '140px', objectFit: 'contain' }} 
								/>
								<div className="mt-1 small text-muted">Preview Gambar</div>
							</div>
						)}
					</div>

					<div className="mb-4">
						<div className="form-check">
							<input
								type="checkbox"
								className="form-check-input"
								id="isActiveCheckbox"
								checked={formState.is_active}
								onChange={(e) => setFormState({ ...formState, is_active: e.target.checked })}
							/>
							<label className="form-check-label fw-semibold text-dark small" htmlFor="isActiveCheckbox">
								Tampilkan di Katalog Aktif
							</label>
						</div>
					</div>

					<div className="d-flex justify-content-end gap-2 border-top pt-3 mt-4">
						<button
							type="button"
							className="btn btn-light border px-4"
							style={{ borderRadius: 9, fontSize: 13 }}
							onClick={() => setShowFormModal(false)}
							disabled={submitting}
						>
							Batal
						</button>
						<button
							type="submit"
							className="btn btn-primary px-4 fw-semibold"
							style={{ borderRadius: 9, fontSize: 13 }}
							disabled={submitting}
						>
							{submitting ? 'Menyimpan...' : 'Simpan Reward'}
						</button>
					</div>
				</form>
			</ModalBox>

			{/* Modal Hapus */}
			<ConfirmationModal
				show={showConfirmModal}
				onHide={() => setShowConfirmModal(false)}
				onConfirm={handleConfirmDelete}
				loading={submitting}
				config={{
					title: 'Hapus Reward',
					desc: `Apakah Anda yakin ingin menghapus reward "${currentReward?.title}" dari katalog global? Gambar yang di-upload juga akan dihapus.`,
					icon: Trash2,
					iconColor: 'var(--danger-text)',
					iconBg: 'var(--danger-bg)',
					iconBorder: 'var(--danger-border)',
					btnVariant: 'danger',
				}}
			/>
		</div>
	);
};

export default ManageGlobalRewards;
