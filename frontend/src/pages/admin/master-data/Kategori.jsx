import { useState, useMemo, useEffect } from 'react';
import { Search, Download, Plus, CheckCircle2, XCircle, Grid, Pencil, Trash2 } from 'lucide-react';

import FormHeading from '@/components/dashboard/FormHeading';
import Table from '@/components/table/Table';
import StatCard from '@/features/users/components/StatCard';
import Pagination from '@/features/users/components/Pagination';
import api from '@/api/axios';
import ModalBox from '@/components/dashboard/ModalBox';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';

const CategoryRow = ({ category, onEdit, onDelete }) => {
	return (
		<tr>
			<td>
				<div className="user-cell">
					<div className="user-avatar" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
						<Grid size={18} />
					</div>
					<div>
						<div className="user-name">{category.name}</div>
						<div className="user-email">{category.slug || '-'}</div>
					</div>
				</div>
			</td>
			<td style={{ color: 'var(--text-muted)' }}>{category.eventsCount} Acara</td>
			<td>
				{category.status === 'active' ? (
					<span
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 4,
							color: 'var(--success-text)',
							backgroundColor: 'var(--success-bg)',
							padding: '4px 8px',
							borderRadius: '12px',
							fontWeight: 600,
							fontSize: 12,
						}}>
						<CheckCircle2 size={13} /> Aktif
					</span>
				) : (
					<span
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 4,
							color: 'var(--danger-text)',
							backgroundColor: 'var(--danger-bg)',
							padding: '4px 8px',
							borderRadius: '12px',
							fontSize: 12,
						}}>
						<XCircle size={13} /> Nonaktif
					</span>
				)}
			</td>
			<td style={{ color: 'var(--text-muted)' }}>{category.createdAt || '-'}</td>
			<td>
				<div className="action-wrap">
					<button className="act-btn edit" onClick={() => onEdit(category)} title="Edit">
						<Pencil size={13} />
					</button>
					<button className="act-btn delete" onClick={() => onDelete(category)} title="Delete">
						<Trash2 size={13} />
					</button>
				</div>
			</td>
		</tr>
	);
};

const Kategori = () => {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState('');
	const [statusFilter, setStatus] = useState('');
	const [perPage, setPerPage] = useState(10);
	const [currentPage, setPage] = useState(1);

	// Modal States
	const [showFormModal, setShowFormModal] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [currentCategory, setCurrentCategory] = useState(null);
	const [actionType, setActionType] = useState('add'); // 'add' | 'edit'
	const [categoryName, setCategoryName] = useState('');
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		fetchCategories();
	}, []);

	const fetchCategories = async () => {
		try {
			setLoading(true);
			const response = await api.get('/categories');
			
			// Mapping data dari backend karena endpoint saat ini hanya me-return id dan name
			// Kita tambahkan mock untuk field yang belum ada di backend agar UI tetap berjalan sesuai request
			const mappedData = response.data.data.map(item => ({
				id: item.id,
				name: item.name,
				slug: item.name.toLowerCase().replace(/ /g, '-'),
				eventsCount: 0,
				status: 'active',
				createdAt: new Date().toISOString().split('T')[0]
			}));
			
			setCategories(mappedData);
		} catch (error) {
			console.error("Gagal mengambil data kategori:", error);
		} finally {
			setLoading(false);
		}
	};

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return categories.filter((c) => {
			const matchQ = c.name.toLowerCase().includes(q) || (c.slug && c.slug.toLowerCase().includes(q));
			const matchStatus = !statusFilter || c.status === statusFilter;
			return matchQ && matchStatus;
		});
	}, [search, statusFilter, categories]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
	const safePage = Math.min(currentPage, totalPages);
	const pageData = filtered.slice((safePage - 1) * perPage, safePage * perPage);

	const handleSearch = (v) => {
		setSearch(v);
		setPage(1);
	};
	const handleStatus = (v) => {
		setStatus(v);
		setPage(1);
	};
	const handlePer = (v) => {
		setPerPage(Number(v));
		setPage(1);
	};

	// Modal handlers
	const handleAddClick = () => {
		setActionType('add');
		setCategoryName('');
		setShowFormModal(true);
	};

	const handleEditClick = (c) => {
		setActionType('edit');
		setCurrentCategory(c);
		setCategoryName(c.name || '');
		setShowFormModal(true);
	};

	const handleDeleteClick = (c) => {
		setCurrentCategory(c);
		setShowConfirmModal(true);
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		try {
			setSubmitting(true);
			const payload = {
				name: categoryName,
			};

			if (actionType === 'add') {
				await api.post('/admin/categories', payload);
			} else {
				await api.put(`/admin/categories/${currentCategory.id}`, payload);
			}

			setShowFormModal(false);
			fetchCategories();
		} catch (error) {
			console.error('Gagal menyimpan kategori:', error);
			alert(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
		} finally {
			setSubmitting(false);
		}
	};

	const handleConfirmDelete = async () => {
		try {
			setSubmitting(true);
			await api.delete(`/admin/categories/${currentCategory.id}`);
			setShowConfirmModal(false);
			fetchCategories();
		} catch (error) {
			console.error('Gagal menghapus kategori:', error);
			alert(error.response?.data?.message || 'Terjadi kesalahan saat menghapus kategori.');
		} finally {
			setSubmitting(false);
		}
	};

	const stats = [
		{
			label: 'Total Kategori',
			value: categories.length,
			icon: (c) => <Grid size={18} color={c} />,
			iconBg: 'var(--primary-light)',
			iconColor: 'var(--primary)',
		},
		{
			label: 'Kategori Aktif',
			value: categories.filter((c) => c.status === 'active').length,
			icon: (c) => <CheckCircle2 size={18} color={c} />,
			iconBg: 'var(--success-bg)',
			iconColor: 'var(--success-text)',
		},
		{
			label: 'Kategori Nonaktif',
			value: categories.filter((c) => c.status === 'inactive').length,
			icon: (c) => <XCircle size={18} color={c} />,
			iconBg: 'var(--danger-bg)',
			iconColor: 'var(--danger-text)',
		},
	];

	const tableColumns = [
		{ label: 'Nama Kategori', sortable: true },
		{ label: 'Jumlah Acara', sortable: true },
		{ label: 'Status', sortable: true },
		{ label: 'Dibuat Pada', sortable: true },
		{ label: 'Aksi', sortable: false },
	];

	return (
		<div className="page-content">
			<FormHeading
				heading="Kelola Kategori"
				subheading="Kelola kategori acara yang tersedia di sistem"
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
							onChange={(e) => handlePer(e.target.value)}>
							<option value={5}>5</option>
							<option value={10}>10</option>
							<option value={25}>25</option>
						</select>
					</span>

					<select
						className="filter-select"
						value={statusFilter}
						onChange={(e) => handleStatus(e.target.value)}>
						<option value="">Semua Status</option>
						<option value="active">Aktif</option>
						<option value="inactive">Nonaktif</option>
					</select>

					<div className="toolbar-spacer" />

					<button className="btn btn-outline" disabled={loading}>
						<Download size={14} /> Export
					</button>
					<button className="btn btn-primary" onClick={handleAddClick} disabled={loading}>
						<Plus size={14} /> Tambah Kategori
					</button>
				</div>

				<Table
					columns={tableColumns}
					data={pageData}
					emptyMessage={loading ? "Memuat data kategori..." : "Tidak ada kategori yang ditemukan."}
					renderRow={(c) => (
						<CategoryRow
							key={c.id}
							category={c}
							onEdit={handleEditClick}
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
					itemName="kategori"
				/>
			</div>

			{/* Modal Form (Tambah / Edit Kategori) */}
			<ModalBox
				show={showFormModal}
				onHide={() => setShowFormModal(false)}
				title={actionType === 'add' ? 'Tambah Kategori' : 'Edit Kategori'}
				subtitle={actionType === 'add' ? 'Buat kategori baru untuk dikelompokkan pada acara' : 'Perbarui nama kategori yang dipilih'}
			>
				<form onSubmit={handleFormSubmit}>
					<div className="mb-4">
						<label className="form-label fw-semibold text-dark small">Nama Kategori</label>
						<input
							type="text"
							className="form-control"
							style={{ borderRadius: 8, fontSize: 13 }}
							required
							value={categoryName}
							onChange={(e) => setCategoryName(e.target.value)}
							placeholder="Masukkan nama kategori (contoh: Seminar, Teknologi)"
						/>
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
							{submitting ? 'Menyimpan...' : 'Simpan Kategori'}
						</button>
					</div>
				</form>
			</ModalBox>

			{/* Modal Konfirmasi Hapus */}
			<ConfirmationModal
				show={showConfirmModal}
				onHide={() => setShowConfirmModal(false)}
				onConfirm={handleConfirmDelete}
				loading={submitting}
				config={{
					title: 'Hapus Kategori',
					desc: `Apakah Anda yakin ingin menghapus kategori "${currentCategory?.name}"? Tindakan ini permanen dan tidak dapat dibatalkan.`,
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

export default Kategori;
