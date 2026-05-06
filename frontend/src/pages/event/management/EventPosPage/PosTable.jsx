import React from 'react';
import { Trash2, Search, Copy, RefreshCw, MapPin, Plus, Pencil } from 'lucide-react';
import Table from '@/components/table/Table';
import { Button } from 'react-bootstrap';

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
					flexShrink: 0,
					backgroundColor: isActive ? '#10b981' : '#f59e0b',
				}}
			/>
			{status}
		</span>
	);
};

/* ── Empty State (Huruf Kapital) ─────────────────────────────── */
const EmptyStateView = ({ setShowForm }) => {
	return (
		<div className="text-center py-4 bg-white border rounded-2">
			<div
				style={{
					width: 56,
					height: 56,
					borderRadius: '50%',
					margin: '0 auto 12px',
					backgroundColor: 'var(--bahama-blue-50)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}>
				<MapPin size={26} style={{ color: 'var(--bahama-blue-300)' }} />
			</div>
			<div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
				Belum ada pos
			</div>
			<div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
				Tambahkan pos pertama untuk memulai.
			</div>
			<div className="d-flex justify-content-center mt-4">
				<Button
					variant="primary"
					className="d-flex align-items-center gap-2 px-3 py-2 fw-semibold"
					onClick={() => setShowForm(true)}
					style={{ backgroundColor: '#000', border: 'none' }}>
					<Plus size={18} /> Tambah Pos Baru
				</Button>
			</div>
		</div>
	);
};

/* ── Pos Table Component ───────────────────────────────────── */
const PosTable = ({ posList, handleDelete, handleEdit, setShowForm }) => {
	const tableColumns = [
		{ label: 'NAMA POS', sortable: false },
		{ label: 'STATUS', sortable: false },
		{ label: 'TOTAL SCAN', sortable: false },
		{ label: 'AKSI', sortable: false },
	];

	// Gunakan huruf kapital di sini
	if (posList.length === 0) return <EmptyStateView setShowForm={setShowForm} />;

	return (
		<div className="table-card">
			{/* ── Table Toolbar ── */}
			<div className="table-toolbar w-100 d-flex flex-row justify-content-between align-items-center">
				<div className="search-box d-flex align-items-center gap-2 px-3 py-2 border rounded bg-white">
					<Search size={16} color="var(--text-muted)" />
					<input
						placeholder="Search name or email..."
						className="border-0 w-100"
						style={{ outline: 'none' }}
					/>
				</div>
				<Button
					variant="primary"
					className="d-flex align-items-center gap-2 px-3 py-2 fw-semibold"
					onClick={() => setShowForm(true)}
					style={{ backgroundColor: '#000', border: 'none' }}>
					<Plus size={18} /> Tambah Pos Baru
				</Button>
			</div>

			{/* ── Table ── */}
			<div
				className="p-0 table-responsive "
				style={{ backgroundColor: 'var(--color-white)' }}>
				<Table
					columns={tableColumns}
					data={posList}
					renderRow={(pos, idx) => (
						<tr key={pos.id} className="border-bottom">
							<td className="px-4 py-3 align-middle d-flex flex-column">
								<span className="fw-semibold text-dark">{pos.name}</span>
								<span className="text-muted">{pos.description}</span>
							</td>
							<td className="py-3 align-middle">
								<StatusBadge status={pos.status} />
							</td>

							<td className="py-3 align-middle">
								<span className="fw-medium text-dark">{pos.totalScan} tiket</span>
							</td>

							<td className="py-3 align-middle">
								<div className="d-flex align-items-center gap-2">
									{/* <button
										className="btn btn-sm btn-light border d-flex align-items-center justify-content-center p-1 bg-white"
										title="Refresh">
										<RefreshCw size={14} color="#555" />
									</button> */}

									<button
										className="btn btn-sm btn-light border d-flex align-items-center justify-content-center p-1 bg-white"
										onClick={() => handleEdit(pos)}
										title="Edit">
										<Pencil size={14} color="#555" />
									</button>

									<button
										className="btn btn-sm btn-light border d-flex align-items-center justify-content-center p-1 bg-white"
										onClick={() => handleDelete(pos.id)}
										title="Delete">
										<Trash2 size={14} color="#dc3545" />
									</button>
								</div>
							</td>
						</tr>
					)}
				/>
			</div>
		</div>
	);
};

export default PosTable;
