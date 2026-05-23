import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Download, Plus, CheckCircle2, XCircle, Users, Trash2 } from 'lucide-react';

import FormHeading from '@/components/dashboard/FormHeading';

// Pastikan import path ini disesuaikan dengan struktur folder Anda
import Table from '@/components/table/Table';
import StatCard from '@/features/users/components/StatCard';
import UserRow from '@/features/users/components/UserRow';
import Pagination from '@/features/users/components/Pagination';
import api from '@/api/axios';
import ModalBox from '@/components/dashboard/ModalBox';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';

const ManageUserPage = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState('');
	const [roleFilter, setRole] = useState('');
	const [statusFilter, setStatus] = useState('');
	const [perPage, setPerPage] = useState(10);
	const [currentPage, setPage] = useState(1);

	// Modal States
	const [showFormModal, setShowFormModal] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [currentUser, setCurrentUser] = useState(null);
	const [actionType, setActionType] = useState('add'); // 'add' | 'edit'
	const [submitting, setSubmitting] = useState(false);

	// Form States
	const [formState, setFormState] = useState({
		name: '',
		email: '',
		phone: '',
		password: '',
		role: 'participant',
		status: 'active',
		verified: true,
	});

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await api.get('/admin/users');
			const mappedData = response.data.data.map((u) => ({
				id: u.id,
				name: u.name,
				email: u.email,
				phone: u.phone,
				role: u.role,
				status: u.status,
				verified: !!u.is_verified,
				joined: u.created_at ? u.created_at.split('T')[0] : '',
			}));
			setUsers(mappedData);
		} catch (error) {
			console.error('Gagal mengambil data user:', error);
		} finally {
			setLoading(false);
		}
	};

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return users.filter((u) => {
			const matchQ = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
			const matchRole = !roleFilter || u.role === roleFilter;
			const matchStatus = !statusFilter || u.status === statusFilter;
			return matchQ && matchRole && matchStatus;
		});
	}, [search, roleFilter, statusFilter, users]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
	const safePage = Math.min(currentPage, totalPages);
	const pageData = filtered.slice((safePage - 1) * perPage, safePage * perPage);

	const handleSearch = (v) => {
		setSearch(v);
		setPage(1);
	};
	const handleRole = (v) => {
		setRole(v);
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
			email: '',
			phone: '',
			password: '',
			role: 'participant',
			status: 'active',
			verified: true,
		});
		setShowFormModal(true);
	};

	const handleEditClick = (u) => {
		setActionType('edit');
		setCurrentUser(u);
		setFormState({
			name: u.name || '',
			email: u.email || '',
			phone: u.phone || '',
			password: '',
			role: u.role || 'participant',
			status: u.status || 'active',
			verified: !!u.verified,
		});
		setShowFormModal(true);
	};

	const handleDeleteClick = (u) => {
		setCurrentUser(u);
		setShowConfirmModal(true);
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		try {
			setSubmitting(true);
			const payload = {
				name: formState.name,
				email: formState.email,
				phone: formState.phone || null,
				role: formState.role,
				status: formState.status,
				is_verified: formState.verified ? 1 : 0,
			};

			if (formState.password) {
				payload.password = formState.password;
			}

			if (actionType === 'add') {
				await api.post('/admin/users', payload);
			} else {
				await api.put(`/admin/users/${currentUser.id}`, payload);
			}

			setShowFormModal(false);
			fetchUsers();
		} catch (error) {
			console.error('Gagal menyimpan data user:', error);
			alert(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
		} finally {
			setSubmitting(false);
		}
	};

	const handleConfirmDelete = async () => {
		try {
			setSubmitting(true);
			await api.delete(`/admin/users/${currentUser.id}`);
			setShowConfirmModal(false);
			fetchUsers();
		} catch (error) {
			console.error('Gagal menghapus user:', error);
			alert(error.response?.data?.message || 'Terjadi kesalahan saat menghapus user.');
		} finally {
			setSubmitting(false);
		}
	};

	const stats = [
		{
			label: 'Total Users',
			value: users.length,
			icon: (c) => <Users size={18} color={c} />,
			iconBg: 'var(--primary-light)',
			iconColor: 'var(--primary)',
		},
		{
			label: 'Active',
			value: users.filter((u) => u.status === 'active').length,
			icon: (c) => <CheckCircle2 size={18} color={c} />,
			iconBg: 'var(--success-bg)',
			iconColor: 'var(--success-text)',
		},
		{
			label: 'Suspended',
			value: users.filter((u) => u.status === 'suspended').length,
			icon: (c) => <XCircle size={18} color={c} />,
			iconBg: 'var(--warning-bg)',
			iconColor: 'var(--warning-text)',
		},
		{
			label: 'Banned',
			value: users.filter((u) => u.status === 'banned').length,
			icon: (c) => <XCircle size={18} color={c} />,
			iconBg: 'var(--danger-bg)',
			iconColor: 'var(--danger-text)',
		},
	];

	// Konfigurasi Kolom untuk Reusable Table
	const tableColumns = [
		{ label: 'Name', sortable: true },
		{ label: 'Phone', sortable: false },
		{ label: 'Role', sortable: true },
		{ label: 'Status', sortable: true },
		{ label: 'Verified', sortable: false },
		{ label: 'Joined', sortable: true },
		{ label: 'Action', sortable: false },
	];

	return (
		<div className="page-content">
			{/* Header */}
			<FormHeading
				heading="Manage Users"
				subheading="Manage and view all users in the system"
			/>
			{/* Stats */}
			<div className="stats-row">
				{stats.map((s) => (
					<StatCard key={s.label} {...s} />
				))}
			</div>

			{/* Table Card */}
			<div className="table-card">
				{/* Toolbar */}
				<div className="table-toolbar">
					<div className="search-box">
						<Search size={14} color="var(--text-muted)" />
						<input
							placeholder="Search name or email..."
							value={search}
							onChange={(e) => handleSearch(e.target.value)}
						/>
					</div>
					<span className="show-label">
						Showing
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
						value={roleFilter}
						onChange={(e) => handleRole(e.target.value)}>
						<option value="">All Roles</option>
						<option value="admin">Admin</option>
						<option value="organizer">Organizer</option>
						<option value="committee">Committee</option>
						<option value="participant">Participant</option>
					</select>

					<select
						className="filter-select"
						value={statusFilter}
						onChange={(e) => handleStatus(e.target.value)}>
						<option value="">All Status</option>
						<option value="active">Active</option>
						<option value="suspended">Suspended</option>
						<option value="banned">Banned</option>
					</select>

					<div className="toolbar-spacer" />

					<button className="btn btn-outline" disabled={loading}>
						<Filter size={14} /> Filter
					</button>
					<button className="btn btn-outline" disabled={loading}>
						<Download size={14} /> Export
					</button>
					<button className="btn btn-primary" onClick={handleAddClick} disabled={loading}>
						<Plus size={14} /> Add User
					</button>
				</div>

				{/* Menggunakan Reusable Table Component */}
				<Table
					columns={tableColumns}
					data={pageData}
					emptyMessage={loading ? "Loading users data..." : "No users found matching your filters."}
					renderRow={(u) => (
						<UserRow
							key={u.id}
							user={u}
							onEdit={handleEditClick}
							onDelete={handleDeleteClick}
						/>
					)}
				/>

				{/* Pagination */}
				<Pagination
					currentPage={safePage}
					totalPages={totalPages}
					totalCount={filtered.length}
					perPage={perPage}
					onPageChange={setPage}
				/>
			</div>

			{/* Form Modal (Add / Edit) */}
			<ModalBox
				show={showFormModal}
				onHide={() => setShowFormModal(false)}
				title={actionType === 'add' ? 'Add User' : 'Edit User'}
				subtitle={actionType === 'add' ? 'Create a brand new system user' : 'Modify existing user details'}
			>
				<form onSubmit={handleFormSubmit}>
					<div className="mb-3">
						<label className="form-label fw-semibold text-dark small">Name</label>
						<input
							type="text"
							className="form-control"
							style={{ borderRadius: 8, fontSize: 13 }}
							required
							value={formState.name}
							onChange={(e) => setFormState({ ...formState, name: e.target.value })}
							placeholder="John Doe"
						/>
					</div>
					<div className="mb-3">
						<label className="form-label fw-semibold text-dark small">Email</label>
						<input
							type="email"
							className="form-control"
							style={{ borderRadius: 8, fontSize: 13 }}
							required
							value={formState.email}
							onChange={(e) => setFormState({ ...formState, email: e.target.value })}
							placeholder="john@example.com"
						/>
					</div>
					<div className="mb-3">
						<label className="form-label fw-semibold text-dark small">Phone</label>
						<input
							type="text"
							className="form-control"
							style={{ borderRadius: 8, fontSize: 13 }}
							value={formState.phone}
							onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
							placeholder="e.g. 08123456789"
						/>
					</div>
					<div className="mb-3">
						<label className="form-label fw-semibold text-dark small">
							Password {actionType === 'edit' && <span className="text-muted fw-normal">(Leave blank to keep current)</span>}
						</label>
						<input
							type="password"
							className="form-control"
							style={{ borderRadius: 8, fontSize: 13 }}
							required={actionType === 'add'}
							value={formState.password}
							onChange={(e) => setFormState({ ...formState, password: e.target.value })}
							placeholder="Min. 8 characters"
						/>
					</div>
					<div className="row">
						<div className="col-md-6 mb-3">
							<label className="form-label fw-semibold text-dark small">Role</label>
							<select
								className="form-select"
								style={{ borderRadius: 8, fontSize: 13 }}
								value={formState.role}
								onChange={(e) => setFormState({ ...formState, role: e.target.value })}
							>
								<option value="participant">Participant</option>
								<option value="committee">Committee</option>
								<option value="organizer">Organizer</option>
								<option value="admin">Admin</option>
							</select>
						</div>
						<div className="col-md-6 mb-3">
							<label className="form-label fw-semibold text-dark small">Status</label>
							<select
								className="form-select"
								style={{ borderRadius: 8, fontSize: 13 }}
								value={formState.status}
								onChange={(e) => setFormState({ ...formState, status: e.target.value })}
							>
								<option value="active">Active</option>
								<option value="suspended">Suspended</option>
								<option value="banned">Banned</option>
							</select>
						</div>
					</div>
					<div className="mb-4">
						<div className="form-check">
							<input
								type="checkbox"
								className="form-check-input"
								id="isVerifiedCheckbox"
								checked={formState.verified}
								onChange={(e) => setFormState({ ...formState, verified: e.target.checked })}
							/>
							<label className="form-check-label fw-semibold text-dark small" htmlFor="isVerifiedCheckbox">
								Verified Account
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
							Cancel
						</button>
						<button
							type="submit"
							className="btn btn-primary px-4 fw-semibold"
							style={{ borderRadius: 9, fontSize: 13 }}
							disabled={submitting}
						>
							{submitting ? 'Saving...' : 'Save User'}
						</button>
					</div>
				</form>
			</ModalBox>

			{/* Deletion Confirmation Modal */}
			<ConfirmationModal
				show={showConfirmModal}
				onHide={() => setShowConfirmModal(false)}
				onConfirm={handleConfirmDelete}
				loading={submitting}
				config={{
					title: 'Delete User',
					desc: `Are you sure you want to delete user "${currentUser?.name}"? This action is permanent and cannot be undone.`,
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

export default ManageUserPage;

