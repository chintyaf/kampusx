import { useState, useMemo } from 'react';
import { Search, Filter, Download, Plus, CheckCircle2, XCircle, Users } from 'lucide-react';

import FormHeading from '@/components/dashboard/FormHeading';

// Pastikan import path ini disesuaikan dengan struktur folder Anda
import Table from '@/components/table/Table';
import { USERS } from '@/features/users/data/mockUsers';
import StatCard from '@/features/users/components/StatCard';
import UserRow from '@/features/users/components/UserRow';
import Pagination from '@/features/users/components/Pagination';

const ManageUserPage = () => {
	const [search, setSearch] = useState('');
	const [roleFilter, setRole] = useState('');
	const [statusFilter, setStatus] = useState('');
	const [perPage, setPerPage] = useState(10);
	const [currentPage, setPage] = useState(1);

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return USERS.filter((u) => {
			const matchQ = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
			const matchRole = !roleFilter || u.role === roleFilter;
			const matchStatus = !statusFilter || u.status === statusFilter;
			return matchQ && matchRole && matchStatus;
		});
	}, [search, roleFilter, statusFilter]);

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

	const stats = [
		{
			label: 'Total Users',
			value: USERS.length,
			icon: (c) => <Users size={18} color={c} />,
			iconBg: 'var(--primary-light)',
			iconColor: 'var(--primary)',
		},
		{
			label: 'Active',
			value: USERS.filter((u) => u.status === 'active').length,
			icon: (c) => <CheckCircle2 size={18} color={c} />,
			iconBg: 'var(--success-bg)',
			iconColor: 'var(--success-text)',
		},
		{
			label: 'Suspended',
			value: USERS.filter((u) => u.status === 'suspended').length,
			icon: (c) => <XCircle size={18} color={c} />,
			iconBg: 'var(--warning-bg)',
			iconColor: 'var(--warning-text)',
		},
		{
			label: 'Banned',
			value: USERS.filter((u) => u.status === 'banned').length,
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

					<button className="btn btn-outline">
						<Filter size={14} /> Filter
					</button>
					<button className="btn btn-outline">
						<Download size={14} /> Export
					</button>
					<button className="btn btn-primary">
						<Plus size={14} /> Add User
					</button>
				</div>

				{/* Menggunakan Reusable Table Component */}
				<Table
					columns={tableColumns}
					data={pageData}
					emptyMessage="No users found matching your filters."
					renderRow={(u) => (
						<UserRow
							key={u.id}
							user={u}
							onEdit={(u) => alert(`Edit user: ${u.name}`)}
							onDelete={(u) => alert(`Delete user: ${u.name}`)}
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
		</div>
	);
};

export default ManageUserPage;
