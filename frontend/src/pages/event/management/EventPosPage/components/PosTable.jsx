import React from 'react';
import { Trash2, Search, Copy, MapPin, Plus, Pencil, ShieldCheck } from 'lucide-react';
import Table from '@/components/table/Table';
import { Button } from 'react-bootstrap';
import toast from 'react-hot-toast';

/* ── Status Badge ────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
	const isActive = status === 'Aktif';
	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 6,
				fontSize: '0.75rem',
				padding: '4px 10px',
				borderRadius: 6,
				fontWeight: 600,
				backgroundColor: isActive ? '#ecfdf5' : '#fefce8',
				color: isActive ? '#065f46' : '#854d0e',
				border: `1px solid ${isActive ? '#a7f3d0' : '#fde68a'}`,
			}}
		>
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

/* ── Empty State ─────────────────────────────────────────────── */
// Desain diubah agar menyatu dengan card tabel utama (tanpa border luar)
const EmptyStateView = ({ setShowForm }) => {
	return (
		<div className="text-center py-5 bg-white">
			<div
				style={{
					width: 56,
					height: 56,
					borderRadius: '50%',
					margin: '0 auto 16px',
					backgroundColor: '#f8f9fa',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<MapPin size={26} className="text-muted" />
			</div>
			<div style={{ fontWeight: 500, color: '#212529', marginBottom: 4 }}>
				Belum ada pos scanner
			</div>
			<div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: 20 }}>
				Tambahkan pos pertama agar panitia bisa mulai menugaskan lokasi scan.
			</div>
			<Button
				variant="dark"
				className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-none"
				onClick={() => setShowForm(true)}
			>
				<Plus size={16} /> Tambah Pos Baru
			</Button>
		</div>
	);
};

/* ── Pos Table Component ───────────────────────────────────── */
// Tambahkan posPin sebagai props
const PosTable = ({ posList, handleDelete, handleEdit, setShowForm, posPin }) => {
	const tableColumns = [
		{ label: 'NAMA POS', sortable: false },
		{ label: 'STATUS', sortable: false },
		{ label: 'TOTAL SCAN', sortable: false },
		{ label: 'AKSI', sortable: false },
	];

	const handleCopyPin = () => {
		if (posPin) {
			navigator.clipboard.writeText(posPin);
			toast.success('PIN disalin ke clipboard!');
		}
	};

	return (
		<div className="bg-white border rounded-3 shadow-none overflow-hidden">
			{/* ── Table Toolbar / Header ── */}
			<div className="p-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
				{/* Bagian Kiri: PIN Panitia terintegrasi di tabel */}
				<div className="d-flex align-items-center bg-light border rounded-2 px-3 py-2 gap-2 w-fit">
					<ShieldCheck size={16} className="text-warning" />
					<span className="text-muted fw-medium" style={{ fontSize: '0.85rem' }}>
						PIN Akses Panitia:
					</span>
					<span
						className="fw-bold text-dark font-monospace"
						style={{ fontSize: '0.95rem', letterSpacing: '2px' }}
					>
						{posPin || '-'}
					</span>
					<div className="vr mx-1 opacity-25" style={{ height: '16px' }}></div>
					<Button
						variant="link"
						className="p-0 border-0 text-muted d-flex align-items-center shadow-none text-decoration-none"
						onClick={handleCopyPin}
						title="Salin PIN"
					>
						<Copy size={14} />
					</Button>
					<div className="vr mx-1 opacity-25" style={{ height: '16px' }}></div>
					<Button
						variant="link"
						className="p-0 border-0 text-primary d-flex align-items-center gap-1 shadow-none text-decoration-none"
						style={{ fontSize: '0.85rem' }}
						onClick={() => {
							const url = `${window.location.origin}/staff/login?pin=${posPin}`;
							navigator.clipboard.writeText(url)
								.then(() => toast.success('Link Login Staf disalin!'))
								.catch(() => toast.error('Gagal menyalin link.'));
						}}
						title="Salin Link Login Staf"
					>
						Salin Link Staf
					</Button>
				</div>

				{/* Bagian Kanan: Search & Add Button */}
				<div className="d-flex flex-wrap align-items-center gap-2">
					{/* <div className="d-flex align-items-center gap-2 px-3 py-1 border rounded-2 bg-light">
						<Search size={14} className="text-muted" />
						<input
							placeholder="Cari pos..."
							className="border-0 bg-transparent text-sm"
							style={{ outline: 'none', fontSize: '0.85rem', width: '150px' }}
						/>
					</div> */}
					<Button
						variant="dark"
						className="d-flex align-items-center gap-2 px-3 py-1 shadow-none rounded-2"
						onClick={() => setShowForm(true)}
						style={{ fontSize: '0.85rem' }}
					>
						<Plus size={14} /> Tambah Pos
					</Button>
				</div>
			</div>

			{/* ── Table Body / Empty State ── */}
			{posList.length === 0 ? (
				<EmptyStateView setShowForm={setShowForm} />
			) : (
				<div className="table-responsive p-0 m-0">
					<Table
						columns={tableColumns}
						data={posList}
						renderRow={(pos, idx) => (
							<tr key={pos.id} className="border-bottom">
								<td className="px-4 py-3 align-middle">
									<div className="d-flex align-items-center gap-3">
										{pos.photo_url ? (
											<img
												src={pos.photo_url}
												alt={pos.name}
												style={{
													width: '42px',
													height: '42px',
													borderRadius: '8px',
													objectFit: 'cover',
													border: '1px solid #e0e0e0',
												}}
											/>
										) : (
											<div
												className="d-flex align-items-center justify-content-center bg-light text-muted fw-bold border rounded"
												style={{
													width: '42px',
													height: '42px',
													fontSize: '10px',
												}}
											>
												NO IMG
											</div>
										)}
										<div className="d-flex flex-column">
											<span
												className="fw-medium text-dark"
												style={{ fontSize: '0.95rem' }}
											>
												{pos.name}
											</span>
											<span
												className="text-muted"
												style={{ fontSize: '0.8rem' }}
											>
												{pos.description || '—'}
											</span>
										</div>
									</div>
								</td>
								<td className="py-3 align-middle">
									<StatusBadge status={pos.status} />
								</td>
								<td className="py-3 align-middle">
									<span
										className="fw-medium text-dark"
										style={{ fontSize: '0.9rem' }}
									>
										{pos.totalScan} tiket
									</span>
								</td>
								<td className="py-3 align-middle">
									<div className="d-flex align-items-center gap-2">
										<Button
											variant="light"
											size="sm"
											className="border d-flex align-items-center justify-content-center p-1 bg-white shadow-none"
											onClick={() => handleEdit(pos)}
											title="Edit"
										>
											<Pencil size={14} className="text-secondary" />
										</Button>
										<Button
											variant="light"
											size="sm"
											className="border d-flex align-items-center justify-content-center p-1 bg-white shadow-none"
											onClick={() => handleDelete(pos.id)}
											title="Delete"
										>
											<Trash2 size={14} className="text-danger" />
										</Button>
									</div>
								</td>
							</tr>
						)}
					/>
				</div>
			)}
		</div>
	);
};

export default PosTable;
