import React from 'react';
import { Button } from 'react-bootstrap';
import { Trash2, Users, Plus, Search } from 'lucide-react';

// Pastikan path import ini sesuai dengan lokasi Table.jsx Anda
import Table from '@/components/table/Table';

/* ── Role Badge ──────────────────────────────────────────────── */
const ROLE_STYLE = {
	Koordinator: { bg: 'var(--bahama-blue-700)', color: '#fff' },
	Administrasi: {
		bg: 'var(--bahama-blue-100)',
		color: 'var(--bahama-blue-800)',
	},
	Dokumentasi: {
		bg: 'var(--bahama-blue-50)',
		color: 'var(--bahama-blue-700)',
	},
	Keamanan: { bg: 'var(--bahama-blue-950)', color: '#fff' },
};

const RoleBadge = ({ role }) => {
	const s = ROLE_STYLE[role] ?? {
		bg: 'var(--bahama-blue-100)',
		color: 'var(--bahama-blue-900)',
	};
	return (
		<span
			style={{
				backgroundColor: s.bg,
				color: s.color,
				fontSize: 'var(--font-xs)',
				padding: '5px 12px',
				borderRadius: 8,
				fontWeight: 600,
				display: 'inline-block',
			}}>
			{role}
		</span>
	);
};

/* ── Status Badge ────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
	const isActive = status === 'Aktif';
	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 6,
				fontSize: 'var(--font-xs)',
				padding: '5px 12px',
				borderRadius: 8,
				fontWeight: 600,
				backgroundColor: isActive ? '#ecfdf5' : '#fefce8',
				color: isActive ? '#065f46' : '#854d0e',
				border: `1px solid ${isActive ? '#a7f3d0' : '#fde68a'}`,
			}}>
			<span
				style={{
					width: 6,
					height: 6,
					borderRadius: '50%',
					backgroundColor: isActive ? '#10b981' : '#f59e0b',
					flexShrink: 0,
				}}
			/>
			{status}
		</span>
	);
};

// 2. Konfigurasi Tampilan Kosong (Empty State)
const emptyStateView = (
	<div className="text-center py-5">
		<div
			style={{
				width: 56,
				height: 56,
				borderRadius: '50%',
				backgroundColor: 'var(--bahama-blue-50)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				margin: '0 auto 12px',
			}}>
			<Users
				size={26}
				style={{
					color: 'var(--bahama-blue-300)',
				}}
			/>
		</div>
		<div
			style={{
				fontWeight: 600,
				color: 'var(--color-text)',
				marginBottom: 4,
			}}>
			Belum ada staf
		</div>
		<div
			style={{
				fontSize: 'var(--font-sm)',
				color: 'var(--color-text-muted)',
			}}>
			Tambahkan staf pertama untuk memulai.
		</div>
	</div>
);

/* ── Staff Table Component ───────────────────────────────────── */
const StaffTable = ({ staffList, handleDelete, onAddStaff }) => {
	const tableColumns = [
		{ label: 'Nama & Email', sortable: false },
		{ label: 'Status', sortable: false },
		{ label: 'Aksi', sortable: false },
	];

	return (
		<>
			{/* ── Table Card ── */}
			<div className="table-card">
				{/* Card Header */}
				<div className="table-toolbar d-flex justify-content-end w-100">
					<div className="search-box">
						<Search size={14} color="var(--text-muted)" />
						<input
							placeholder="Search name or email..."
							// value={search}
							// onChange={(e) => handleSearch(e.target.value)}
						/>
					</div>
					<div className="toolbar-spacer" />

					{/* 2. Tambahkan onClick pada tombol */}
					<button className="btn btn-primary" onClick={onAddStaff}>
						<Plus size={14} /> Add Staff
					</button>
				</div>

				{/* Table*/}
				<div
					className="p-0 table-responsive"
					style={{ backgroundColor: 'var(--color-white)' }}>
					<Table
						columns={tableColumns}
						data={staffList}
						emptyMessage={emptyStateView}
						renderRow={(staff, idx) => (
							<tr key={staff.id}>
								{/* Nama */}
								<td className="px-4 py-3">
									<p className="fw-semibold">{staff.name}</p>
									<p className="text-muted small">{staff.email}</p>
								</td>

								{/* Status */}
								<td className="py-3">
									<StatusBadge status={staff.status} />
								</td>

								{/* Aksi */}
								<td className="py-3 text-center">
									<button
										className="act-btn delete"
										onClick={() => handleDelete(staff.id)}
										title="Delete">
										<Trash2 size={13} />
									</button>
								</td>
							</tr>
						)}
					/>
				</div>
			</div>
		</>
	);
};

export default StaffTable;
