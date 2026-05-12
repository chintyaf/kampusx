import React, { useState, useEffect } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';
import FormHeading from '../../../../components/dashboard/FormHeading';
import StatCard from '@/components/dashboard/StatCard';
import PosTable from './PosTable';
import PosForm from './PosForm';
// Import Trash2 untuk icon modal, dan pastikan path ConfirmationModal sesuai dengan struktur folder Anda
import { Users, CheckCircle2, Box, Ticket, Plus, MapPin, Trash2 } from 'lucide-react';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';
import PosPinHeader from './PosPinHeader';
/* ── Main ────────────────────────────────────────────────────── */
const EventPosPage = () => {
	const { eventId } = useParams();
	const [posList, setPosList] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [selectedPos, setSelectedPos] = useState(null);
	const [posPin, setPosPin] = useState('-');

	// State untuk Modal Delete
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [posToDelete, setPosToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const fetchPosList = async () => {
		try {
			const response = await api.get(`/event-dashboard/${eventId}/stations`);
			console.log('Response Data:', response.data.data);
			if (response.data.pos_pin) {
				setPosPin(response.data.pos_pin);
			}
			const mappedData = response.data.data.map((station) => ({
				id: station.id,
				name: station.name,
				description: station.description,
				status: station.is_active ? 'Aktif' : 'Tidak Aktif',
				totalScan: 0, // Placeholder
			}));
			setPosList(mappedData);
		} catch (error) {
			console.error('Failed to fetch stations:', error);
		}
	};

	useEffect(() => {
		fetchPosList();
	}, [eventId, showForm]);

	// Perhitungan statistik
	const activeCount = posList.filter((p) => p.status === 'Aktif').length;
	const unusedCount = posList.filter((p) => p.status === 'Tidak Aktif').length;
	const totalScanCount = posList.reduce((acc, curr) => acc + curr.totalScan, 0);

	// 1. Fungsi saat tombol tong sampah diklik (buka modal)
	const handleDeleteClick = (id) => {
		setPosToDelete(id);
		setShowDeleteModal(true);
	};

	// 2. Fungsi saat tombol konfirmasi di dalam modal diklik (eksekusi hapus)
	const executeDelete = async () => {
		if (!posToDelete) return;

		setIsDeleting(true);
		try {
			await api.delete(`/event-dashboard/${eventId}/stations/${posToDelete}`);
			setPosList((prev) => prev.filter((p) => p.id !== posToDelete));
		} catch (error) {
			console.error('Failed to delete station:', error);
			alert('Gagal menghapus pos');
		} finally {
			setIsDeleting(false);
			setShowDeleteModal(false);
			setPosToDelete(null);
		}
	};

	const handleEdit = (pos) => {
		setSelectedPos(pos);
		setShowForm(true);
	};

	const handleAdd = () => {
		setSelectedPos(null);
		setShowForm(true);
	};

	return (
		<div className="d-flex flex-column gap-3">
			{/* ── Header & Action Button ── */}
			<div className="d-flex justify-content-between align-items-start">
				<FormHeading
					heading="Manajemen Pos Scanner"
					subheading="Kelola akses dan peran tim panitia Anda di sini."
				/>
			</div>

			<PosPinHeader pin={posPin} />

			{/* ── Stat Cards ── */}
			<Row className="g-3">
				<Col xs={12} md={6} lg={3}>
					<StatCard Icon={Users} label="Total Pos" value={`${posList.length}`} />
				</Col>
				<Col xs={12} md={6} lg={3}>
					<StatCard
						Icon={CheckCircle2}
						label="Pos Aktif"
						value={`${activeCount}`}
						type="green"
					/>
				</Col>
				<Col xs={12} md={6} lg={3}>
					<StatCard
						Icon={Box}
						label="Belum Digunakan"
						value={`${unusedCount}`}
						type="yellow"
					/>
				</Col>
				<Col xs={12} md={6} lg={3}>
					<StatCard
						Icon={Ticket}
						label="Total Scan"
						value={`${totalScanCount}`}
						type="purple"
					/>
				</Col>
			</Row>

			{/* ── Konten Utama ── */}
			{posList.length === 0 ? (
				<div className="text-center py-4 bg-white border rounded-2">
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
						<MapPin size={26} style={{ color: 'var(--bahama-blue-300)' }} />
					</div>
					<div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
						Belum ada pos
					</div>
					<div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
						Tambahkan pos pertama untuk memulai.
					</div>
					<div className="d-flex justify-content-center mt-3">
						<Button
							variant="primary"
							className="d-flex align-items-center gap-2 px-3 py-2 fw-semibold"
							onClick={handleAdd}
							style={{ backgroundColor: '#000', border: 'none' }}>
							<Plus size={18} /> Tambah Pos Baru
						</Button>
					</div>
				</div>
			) : (
				<PosTable
					posList={posList}
					handleDelete={handleDeleteClick} // Oper fungsi buka modal ke sini
					handleEdit={handleEdit}
					setShowForm={handleAdd}
				/>
			)}

			{/* ── Form Modal (Add/Edit) ── */}
			<PosForm
				show={showForm}
				posData={selectedPos}
				onHide={() => {
					setShowForm(false);
					setSelectedPos(null);
				}}
				// onSave={}
			/>

			{/* ── Confirmation Modal (Delete) ── */}
			<ConfirmationModal
				show={showDeleteModal}
				onHide={() => {
					setShowDeleteModal(false);
					setPosToDelete(null);
				}}
				onConfirm={executeDelete}
				loading={isDeleting}
				config={{
					title: 'Hapus Pos?',
					desc: 'Apakah Anda yakin ingin menghapus pos ini? Tindakan ini tidak dapat dibatalkan.',
					icon: Trash2,
					iconColor: '#dc3545', // Merah
					iconBg: '#f8d7da', // Merah muda (bg)
					iconBorder: '#f5c2c7', // Merah muda (border)
					btnVariant: 'danger',
				}}
			/>
		</div>
	);
};

export default EventPosPage;
