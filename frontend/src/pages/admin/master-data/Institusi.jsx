import { useState, useMemo, useEffect } from 'react';
import { Search, Download, Plus, CheckCircle2, XCircle, Building2, Pencil, Trash2 } from 'lucide-react';

import FormHeading from '@/components/dashboard/FormHeading';
import Table from '@/components/table/Table';
import StatCard from '@/features/users/components/StatCard';
import Pagination from '@/features/users/components/Pagination';
import api from '@/api/axios';
import ModalBox from '@/components/dashboard/ModalBox';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';

const InstitutionRow = ({ institution, onEdit, onDelete }) => {
	const getTypeLabel = (type) => {
		switch (type) {
			case 'university': return 'Universitas';
			case 'company': return 'Perusahaan';
			case 'student_org': return 'Organisasi Mahasiswa';
			case 'community': return 'Komunitas';
			default: return type;
		}
	};

	return (
		<tr>
			<td>
				<div className="user-cell">
					<div className="user-avatar" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
						<Building2 size={18} />
					</div>
					<div>
						<div className="user-name">{institution.name}</div>
						<div className="user-email">{getTypeLabel(institution.type)}</div>
					</div>
				</div>
			</td>
			<td style={{ color: 'var(--text-muted)' }}>{institution.eventsCount} Acara</td>
			<td>
				{institution.status === 'active' ? (
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
			<td style={{ color: 'var(--text-muted)' }}>{institution.joinedAt || '-'}</td>
			<td>
				<div className="action-wrap">
					<button className="act-btn edit" onClick={() => onEdit(institution)} title="Edit">
						<Pencil size={13} />
					</button>
					<button className="act-btn delete" onClick={() => onDelete(institution)} title="Delete">
						<Trash2 size={13} />
					</button>
				</div>
			</td>
		</tr>
	);
};

const Institusi = () => {
	const [institutions, setInstitutions] = useState([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState('');
	const [statusFilter, setStatus] = useState('');
	const [perPage, setPerPage] = useState(10);
	const [currentPage, setPage] = useState(1);

	// Modal States
	const [showFormModal, setShowFormModal] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [currentInstitution, setCurrentInstitution] = useState(null);
	const [actionType, setActionType] = useState('add'); // 'add' | 'edit'
	const [submitting, setSubmitting] = useState(false);

	// Form States
	const [formState, setFormState] = useState({
		name: '',
		type: 'university',
		description: '',
		ownerEmail: '',
	});

	useEffect(() => {
		fetchInstitutions();
	}, []);

	const fetchInstitutions = async () => {
		try {
			setLoading(true);
			const response = await api.get('/admin/institutions');
			
			// Mapping data dari backend
			const mappedData = response.data.data.map(item => ({
				id: item.id,
				name: item.name,
				type: item.type,
				description: item.description,
				eventsCount: 0,
				status: 'active',
				joinedAt: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
			}));
			
			setInstitutions(mappedData);
		} catch (error) {
			console.error("Gagal mengambil data institusi:", error);
		} finally {
			setLoading(false);
		}
	};

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return institutions.filter((i) => {
			const matchQ = i.name.toLowerCase().includes(q) || (i.type && i.type.toLowerCase().includes(q));
			const matchStatus = !statusFilter || i.status === statusFilter;
			return matchQ && matchStatus;
		});
	}, [search, statusFilter, institutions]);

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
		setFormState({
			name: '',
			type: 'university',
			description: '',
			ownerEmail: '',
		});
		setShowFormModal(true);
	};

	const handleEditClick = (i) => {
		setActionType('edit');
		setCurrentInstitution(i);
		setFormState({
			name: i.name || '',
			type: i.type || 'university',
			description: i.description || '',
			ownerEmail: '',
		});
		setShowFormModal(true);
	};

	const handleDeleteClick = (i) => {
		setCurrentInstitution(i);
		setShowConfirmModal(true);
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		try {
			setSubmitting(true);
			const payload = {
				name: formState.name,
				type: formState.type,
				description: formState.description || null,
			};

			if (actionType === 'add') {
				payload.owner_email = formState.ownerEmail;
				await api.post('/admin/institutions', payload);
			} else {
				await api.put(`/admin/institutions/${currentInstitution.id}`, payload);
			}

			setShowFormModal(false);
			fetchInstitutions();
		} catch (error) {
			console.error('Gagal menyimpan institusi:', error);
			alert(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
		} finally {
			setSubmitting(false);
		}
	};

	const handleConfirmDelete = async () => {
		try {
			setSubmitting(true);
			await api.delete(`/admin/institutions/${currentInstitution.id}`);
			setShowConfirmModal(false);
			fetchInstitutions();
		} catch (error) {
			console.error('Gagal menghapus institusi:', error);
			alert(error.response?.data?.message || 'Terjadi kesalahan saat menghapus institusi.');
		} finally {
			setSubmitting(false);
		}
	};

	const stats = [
		{
			label: 'Total Institusi',
			value: institutions.length,
			icon: (c) => <Building2 size={18} color={c} />,
			iconBg: 'var(--primary-light)',
			iconColor: 'var(--primary)',
		},
		{
			label: 'Mitra Aktif',
			value: institutions.filter((i) => i.status === 'active').length,
			icon: (c) => <CheckCircle2 size={18} color={c} />,
			iconBg: 'var(--success-bg)',
			iconColor: 'var(--success-text)',
		},
		{
			label: 'Mitra Nonaktif',
			value: institutions.filter((i) => i.status === 'inactive').length,
			icon: (c) => <XCircle size={18} color={c} />,
			iconBg: 'var(--danger-bg)',
			iconColor: 'var(--danger-text)',
		},
	];

	const tableColumns = [
		{ label: 'Nama Institusi', sortable: true },
		{ label: 'Jumlah Acara', sortable: true },
		{ label: 'Status', sortable: true },
		{ label: 'Bergabung Sejak', sortable: true },
		{ label: 'Aksi', sortable: false },
	];

	return (
		<div className="page-content">
			<FormHeading
				heading="Kelola Institusi"
				subheading="Kelola institusi mitra atau penyelenggara yang bekerja sama di sistem"
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
							placeholder="Cari nama atau tipe institusi..."
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
						<Plus size={14} /> Tambah Institusi
					</button>
				</div>

				<Table
					columns={tableColumns}
					data={pageData}
					emptyMessage={loading ? "Memuat data institusi..." : "Tidak ada institusi yang ditemukan."}
					renderRow={(i) => (
						<InstitutionRow
							key={i.id}
							institution={i}
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
					itemName="institusi"
				/>
			</div>

			{/* Modal Form (Tambah / Edit Institusi) */}
			<ModalBox
				show={showFormModal}
				onHide={() => setShowFormModal(false)}
				title={actionType === 'add' ? 'Tambah Institusi' : 'Edit Institusi'}
				subtitle={actionType === 'add' ? 'Hubungkan institusi mitra penyelenggara baru ke sistem' : 'Perbarui profil institusi mitra terpilih'}
			>
				<form onSubmit={handleFormSubmit}>
					<div className="mb-3">
						<label className="form-label fw-semibold text-dark small">Nama Institusi</label>
						<input
							type="text"
							className="form-control"
							style={{ borderRadius: 8, fontSize: 13 }}
							required
							value={formState.name}
							onChange={(e) => setFormState({ ...formState, name: e.target.value })}
							placeholder="Masukkan nama institusi penyelenggara"
						/>
					</div>
					
					<div className="mb-3">
						<label className="form-label fw-semibold text-dark small">Tipe Institusi</label>
						<select
							className="form-select"
							style={{ borderRadius: 8, fontSize: 13 }}
							value={formState.type}
							onChange={(e) => setFormState({ ...formState, type: e.target.value })}
						>
							<option value="university">Universitas / Sekolah</option>
							<option value="company">Perusahaan / Korporat</option>
							<option value="student_org">Organisasi Mahasiswa</option>
							<option value="community">Komunitas Umum</option>
						</select>
					</div>

					<div className="mb-3">
						<label className="form-label fw-semibold text-dark small">Deskripsi Institusi</label>
						<textarea
							className="form-control"
							rows={3}
							style={{ borderRadius: 8, fontSize: 13 }}
							value={formState.description}
							onChange={(e) => setFormState({ ...formState, description: e.target.value })}
							placeholder="Jelaskan mengenai institusi ini (opsional)"
						/>
					</div>

					{actionType === 'add' && (
						<div className="mb-3">
							<label className="form-label fw-semibold text-dark small">Email Penanggung Jawab (Owner)</label>
							<input
								type="email"
								className="form-control"
								style={{ borderRadius: 8, fontSize: 13 }}
								required
								value={formState.ownerEmail}
								onChange={(e) => setFormState({ ...formState, ownerEmail: e.target.value })}
								placeholder="Email user yang terdaftar untuk dijadikan owner"
							/>
							<div className="form-text text-secondary" style={{ fontSize: 11 }}>
								*User dengan email ini otomatis diangkat menjadi penanggung jawab (owner) institusi dan berpangkat **Organizer**.
							</div>
						</div>
					)}

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
							{submitting ? 'Menyimpan...' : 'Simpan Institusi'}
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
					title: 'Hapus Institusi',
					desc: `Apakah Anda yakin ingin menghapus institusi "${currentInstitution?.name}"? Hubungan data acara yang terikat dapat terpengaruh.`,
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

export default Institusi;
