import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, CheckCircle2, XCircle, Activity, Pencil, Trash2 } from 'lucide-react';
import FormHeading from '@/components/dashboard/FormHeading';
import Table from '@/components/table/Table';
import StatCard from '@/features/users/components/StatCard';
import Pagination from '@/features/users/components/Pagination';
import api from '@/api/axios';
import ModalBox from '@/components/dashboard/ModalBox';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';
import { notify } from '@/utils/notify';

const ActivityRow = ({ activity, onEdit, onToggleActive, onDelete }) => {
	return (
		<tr>
			<td>
				<div className="user-cell">
					<div className="user-avatar" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
						<Activity size={18} />
					</div>
					<div>
						<div className="user-name">{activity.name}</div>
						<div className="user-email text-truncate" style={{ maxWidth: '280px' }}>
							{activity.description || 'Tidak ada deskripsi'}
						</div>
					</div>
				</div>
			</td>
			<td>
				<code>{activity.slug}</code>
			</td>
			<td className="fw-semibold text-primary">
				{activity.points_rewarded} Pts
			</td>
			<td>
				<span className={`status-pill ${activity.type === 'global' ? 's-boost' : 's-active'}`}>
					{activity.type.toUpperCase()}
				</span>
			</td>
			<td>
				{activity.is_active ? (
					<span className="status-pill s-active">Aktif</span>
				) : (
					<span className="status-pill s-suspended">Nonaktif</span>
				)}
			</td>
			<td>
				<div className="action-wrap">
					<button className="act-btn edit" onClick={() => onEdit(activity)} title="Edit">
						<Pencil size={13} />
					</button>
					<button 
						className="act-btn" 
						onClick={() => onToggleActive(activity)} 
						title={activity.is_active ? 'Nonaktifkan' : 'Aktifkan'}
						style={{ 
							color: activity.is_active ? '#eab308' : '#10b981', 
							backgroundColor: activity.is_active ? '#fef9c3' : '#d1fae5',
							border: 'none',
							padding: '4px',
							borderRadius: '4px',
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer'
						}}
					>
						{activity.is_active ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
					</button>
					<button className="act-btn delete" onClick={() => onDelete(activity)} title="Hapus">
						<Trash2 size={13} />
					</button>
				</div>
			</td>
		</tr>
	);
};

const ManageActivities = () => {
	const [activities, setActivities] = useState([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState('');
	const [typeFilter, setTypeFilter] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [perPage, setPerPage] = useState(10);
	const [currentPage, setPage] = useState(1);

	// Modal States
	const [showFormModal, setShowFormModal] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [currentActivity, setCurrentActivity] = useState(null);
	const [actionType, setActionType] = useState('add'); // 'add' | 'edit'
	const [submitting, setSubmitting] = useState(false);

	// Form States
	const [formState, setFormState] = useState({
		name: '',
		slug: '',
		points_rewarded: '',
		type: 'global',
		description: '',
		is_active: true,
	});

	useEffect(() => {
		fetchActivities();
	}, []);

	const fetchActivities = async () => {
		try {
			setLoading(true);
			const response = await api.get('/admin/activities');
			setActivities(response.data.data || []);
		} catch (error) {
			console.error('Gagal mengambil data aktivitas:', error);
			notify('error', 'Gagal', 'Terjadi kesalahan saat memuat data aktivitas.');
		} finally {
			setLoading(false);
		}
	};

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return activities.filter((act) => {
			const matchQ = act.name.toLowerCase().includes(q) || act.slug.toLowerCase().includes(q);
			const matchType = !typeFilter || act.type === typeFilter;
			const matchStatus = 
				statusFilter === '' || 
				(statusFilter === 'active' && act.is_active) || 
				(statusFilter === 'inactive' && !act.is_active);
			return matchQ && matchType && matchStatus;
		});
	}, [search, typeFilter, statusFilter, activities]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
	const safePage = Math.min(currentPage, totalPages);
	const pageData = filtered.slice((safePage - 1) * perPage, safePage * perPage);

	const handleSearch = (v) => {
		setSearch(v);
		setPage(1);
	};
	const handleTypeFilter = (v) => {
		setTypeFilter(v);
		setPage(1);
	};
	const handleStatusFilter = (v) => {
		setStatusFilter(v);
		setPage(1);
	};
	const handlePer = (v) => {
		setPerPage(Number(v));
		setPage(1);
	};

	const handleAddClick = () => {
		setActionType('add');
		setFormState({
			name: '',
			slug: '',
			points_rewarded: '',
			type: 'global',
			description: '',
			is_active: true,
		});
		setShowFormModal(true);
	};

	const handleEditClick = (act) => {
		setActionType('edit');
		setCurrentActivity(act);
		setFormState({
			name: act.name,
			slug: act.slug,
			points_rewarded: act.points_rewarded,
			type: act.type,
			description: act.description || '',
			is_active: !!act.is_active,
		});
		setShowFormModal(true);
	};

	const handleDeleteClick = (act) => {
		setCurrentActivity(act);
		setShowConfirmModal(true);
	};

	const handleNameChange = (e) => {
		const name = e.target.value;
		setFormState((prev) => {
			const updated = { ...prev, name };
			if (actionType === 'add') {
				updated.slug = name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, '_')
					.replace(/(^_+|_+$)/g, '');
			}
			return updated;
		});
	};

	const handleToggleActive = async (activity) => {
		try {
			await api.put(`/admin/activities/${activity.id}`, {
				name: activity.name,
				slug: activity.slug,
				points_rewarded: activity.points_rewarded,
				type: activity.type,
				description: activity.description,
				is_active: !activity.is_active,
			});
			notify('success', 'Berhasil', `Status aktivitas berhasil diubah.`);
			fetchActivities();
		} catch (error) {
			console.error('Gagal mengubah status aktivitas:', error);
			notify('error', 'Gagal', 'Gagal mengubah status aktivitas.');
		}
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		try {
			setSubmitting(true);
			const payload = {
				name: formState.name,
				slug: formState.slug,
				points_rewarded: parseInt(formState.points_rewarded),
				type: formState.type,
				description: formState.description || null,
				is_active: formState.is_active ? 1 : 0,
			};

			if (actionType === 'add') {
				await api.post('/admin/activities', payload);
				notify('success', 'Berhasil', 'Aktivitas baru berhasil ditambahkan.');
			} else {
				await api.put(`/admin/activities/${currentActivity.id}`, payload);
				notify('success', 'Berhasil', 'Aktivitas berhasil diperbarui.');
			}

			setShowFormModal(false);
			fetchActivities();
		} catch (error) {
			console.error('Gagal menyimpan aktivitas:', error);
			notify('error', 'Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
		} finally {
			setSubmitting(false);
		}
	};

	const handleConfirmDelete = async () => {
		try {
			setSubmitting(true);
			await api.delete(`/admin/activities/${currentActivity.id}`);
			notify('success', 'Berhasil', 'Aktivitas berhasil dihapus.');
			setShowConfirmModal(false);
			fetchActivities();
		} catch (error) {
			console.error('Gagal menghapus aktivitas:', error);
			notify('error', 'Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menghapus aktivitas.');
		} finally {
			setSubmitting(false);
		}
	};

	const stats = [
		{
			label: 'Total Aktivitas',
			value: activities.length,
			icon: (color) => <Activity size={18} color={color} />,
			iconBg: 'var(--primary-light)',
			iconColor: 'var(--primary)',
		},
		{
			label: 'Tipe Global',
			value: activities.filter((a) => a.type === 'global').length,
			icon: (color) => <CheckCircle2 size={18} color={color} />,
			iconBg: 'var(--success-bg)',
			iconColor: 'var(--success-text)',
		},
		{
			label: 'Aktivitas Aktif',
			value: activities.filter((a) => a.is_active).length,
			icon: (color) => <CheckCircle2 size={18} color={color} />,
			iconBg: 'var(--success-bg)',
			iconColor: 'var(--success-text)',
		},
	];

	const tableColumns = [
		{ label: 'Aktivitas', sortable: true },
		{ label: 'Slug', sortable: true },
		{ label: 'Poin Diberikan', sortable: true },
		{ label: 'Tipe Poin', sortable: true },
		{ label: 'Status', sortable: true },
		{ label: 'Aksi', sortable: false },
	];

	return (
		<div className="page-content">
			<FormHeading
				heading="Kelola Aktivitas Berpoin"
				subheading="Kelola daftar master aktivitas untuk pengumpulan poin peserta"
			/>

			<div className="stats-row">
				{stats.map((s) => (
					<StatCard key={s.label} {...s} />
				))}
			</div>

			<div className="table-card">
				<div className="table-toolbar">
					<div className="search-box">
						<Search size={14} color="var(--text-muted)" />
						<input
							placeholder="Cari nama atau slug..."
							value={search}
							onChange={(e) => handleSearch(e.target.value)}
						/>
					</div>
					<span className="show-label">
						Tampilkan
						<select
							className="show-select"
							value={perPage}
							onChange={(e) => handlePer(e.target.value)}
						>
							<option value={5}>5</option>
							<option value={10}>10</option>
							<option value={25}>25</option>
						</select>
					</span>

					<select
						className="filter-select"
						value={typeFilter}
						onChange={(e) => handleTypeFilter(e.target.value)}
					>
						<option value="">Semua Tipe</option>
						<option value="global">Global</option>
						<option value="local">Local</option>
					</select>

					<select
						className="filter-select"
						value={statusFilter}
						onChange={(e) => handleStatusFilter(e.target.value)}
					>
						<option value="">Semua Status</option>
						<option value="active">Aktif</option>
						<option value="inactive">Nonaktif</option>
					</select>

					<div className="toolbar-spacer" />

					<button className="btn btn-primary" onClick={handleAddClick} disabled={loading}>
						<Plus size={14} /> Tambah Aktivitas
					</button>
				</div>

				<Table
					columns={tableColumns}
					data={pageData}
					emptyMessage={loading ? 'Memuat data aktivitas...' : 'Tidak ada aktivitas ditemukan.'}
					renderRow={(act) => (
						<ActivityRow
							key={act.id}
							activity={act}
							onEdit={handleEditClick}
							onToggleActive={handleToggleActive}
							onDelete={handleDeleteClick}
						/>
					)}
				/>

				<Pagination
					currentPage={safePage}
					totalPages={totalPages}
					totalCount={filtered.length}
					perPage={perPage}
					onPageChange={setPage}
				/>
			</div>

			{/* Modal Form */}
			<ModalBox
				show={showFormModal}
				onHide={() => setShowFormModal(false)}
				title={actionType === 'add' ? 'Tambah Aktivitas' : 'Edit Aktivitas'}
				subtitle={actionType === 'add' ? 'Definisikan aktivitas berpoin baru' : 'Sesuaikan konfigurasi aktivitas'}
			>
				<form onSubmit={handleFormSubmit}>
					<div className="mb-3">
						<label className="form-label fw-semibold text-dark small">Nama Aktivitas</label>
						<input
							type="text"
							className="form-control"
							style={{ borderRadius: 8, fontSize: 13 }}
							required
							value={formState.name}
							onChange={handleNameChange}
							placeholder="Contoh: Kehadiran Sesi Pertama"
						/>
					</div>

					<div className="mb-3">
						<label className="form-label fw-semibold text-dark small">Slug / Kode Unik</label>
						<input
							type="text"
							className="form-control"
							style={{ borderRadius: 8, fontSize: 13 }}
							required
							value={formState.slug}
							onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
							placeholder="Contoh: kehadiran_sesi_1"
						/>
					</div>

					<div className="row">
						<div className="col-md-6 mb-3">
							<label className="form-label fw-semibold text-dark small">Poin Hadiah</label>
							<input
								type="number"
								className="form-control"
								style={{ borderRadius: 8, fontSize: 13 }}
								required
								value={formState.points_rewarded}
								onChange={(e) => setFormState({ ...formState, points_rewarded: e.target.value })}
								placeholder="Poin yang didapatkan"
							/>
						</div>
						<div className="col-md-6 mb-3">
							<label className="form-label fw-semibold text-dark small">Tipe Poin</label>
							<select
								className="form-select"
								style={{ borderRadius: 8, fontSize: 13 }}
								value={formState.type}
								onChange={(e) => setFormState({ ...formState, type: e.target.value })}
							>
								<option value="global">Global (Platform)</option>
								<option value="local">Local (Khusus Event)</option>
							</select>
						</div>
					</div>

					<div className="mb-3">
						<label className="form-label fw-semibold text-dark small">Deskripsi</label>
						<textarea
							className="form-control"
							style={{ borderRadius: 8, fontSize: 13 }}
							rows={3}
							value={formState.description}
							onChange={(e) => setFormState({ ...formState, description: e.target.value })}
							placeholder="Jelaskan bagaimana poin ini diklaim..."
						/>
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
								Aktivitas Aktif (Dapat digunakan untuk perolehan poin)
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
							{submitting ? 'Menyimpan...' : 'Simpan Aktivitas'}
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
					title: 'Hapus Aktivitas',
					desc: `Apakah Anda yakin ingin menghapus master aktivitas "${currentActivity?.name}"? Tindakan ini tidak dapat dibatalkan.`,
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

export default ManageActivities;
