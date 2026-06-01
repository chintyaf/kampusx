import React, { useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, Plus, Trash2 } from 'lucide-react';

import api from '@/api/axios';
import PosTable from './PosTable';
import PosForm from './PosForm';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';

// Sub-components extracted for clean code structure
import OnlineAttendanceTool from './OnlineAttendanceTool';
import AttendanceWindowInfo from './AttendanceWindowInfo';
import PosStats from './PosStats';

/**
 * Page Component: EventPosPage
 * Main entry point for Organizer POS and Scanner Station management.
 * Displays statistics, active attendance windows, online attendance tools,
 * and allows CRUD operations for POS scanner stations.
 */
const EventPosPage = () => {
	const { eventId } = useParams();
	const [posList, setPosList] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [selectedPos, setSelectedPos] = useState(null);
	const [posPin, setPosPin] = useState('-');
	const [event, setEvent] = useState(null);

	// States for deleting POS station
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [posToDelete, setPosToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Fetch active POS stations and general event details
	const fetchPosList = async () => {
		try {
			const response = await api.get(`/event-dashboard/${eventId}/stations`);
			if (response.data.pos_pin) {
				setPosPin(response.data.pos_pin);
			}
			if (response.data.event) {
				setEvent(response.data.event);
			}
			const mappedData = response.data.data.map((station) => ({
				id: station.id,
				name: station.name,
				description: station.description,
				photo_url: station.photo_url,
				status: station.is_active ? 'Aktif' : 'Tidak Aktif',
				totalScan: 0, // Placeholder for total scans computed or loaded
			}));
			setPosList(mappedData);
		} catch (error) {
			console.error('Failed to fetch stations:', error);
			toast.error('Gagal mengambil daftar pos.');
		}
	};

	// Refetch data whenever page mounts or form modal closes
	useEffect(() => {
		fetchPosList();
	}, [eventId, showForm]);

	// Open deletion confirmation modal
	const handleDeleteClick = (id) => {
		setPosToDelete(id);
		setShowDeleteModal(true);
	};

	// Sends delete request to backend and updates list state
	const executeDelete = async () => {
		if (!posToDelete) return;
		setIsDeleting(true);
		try {
			await api.delete(`/event-dashboard/${eventId}/stations/${posToDelete}`);
			setPosList((prev) => prev.filter((p) => p.id !== posToDelete));
			toast.success('Pos berhasil dihapus');
		} catch (error) {
			console.error('Failed to delete station:', error);
			toast.error('Gagal menghapus pos');
		} finally {
			setIsDeleting(false);
			setShowDeleteModal(false);
			setPosToDelete(null);
		}
	};

	// Triggers editing form modal
	const handleEdit = (pos) => {
		setSelectedPos(pos);
		setShowForm(true);
	};

	// Triggers adding form modal
	const handleAdd = () => {
		setSelectedPos(null);
		setShowForm(true);
	};

	return (
		<div className="d-flex flex-column gap-4">
			{/* ── 1. Page Header ── */}
			<div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
				<div>
					<h4 className="fw-bold text-dark mb-1" style={{ fontSize: '1.25rem' }}>
						Manajemen Pos Scanner
					</h4>
					<p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
						Kelola akses dan peran tim panitia Anda di sini.
					</p>
				</div>
			</div>

			{/* ── 2. Link Presensi Online (Magic Link Tool) ── */}
			<OnlineAttendanceTool />

			{/* ── 3. Rongga Waktu Presensi (Attendance Window Info) ── */}
			<AttendanceWindowInfo event={event} />

			{/* ── 4. Stat Cards Row ── */}
			<PosStats posList={posList} />

			{/* ── 5. POS Stations Management Table ── */}
			<div className="d-flex flex-column gap-3">
				{posList.length === 0 ? (
					/* Empty State */
					<div className="text-center py-5 bg-white border rounded-4 shadow-none">
						<div
							style={{
								width: 56,
								height: 56,
								borderRadius: '50%',
								backgroundColor: '#f8f9fa',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								margin: '0 auto 16px',
							}}
						>
							<MapPin size={24} className="text-muted" />
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
							onClick={handleAdd}
						>
							<Plus size={16} /> Tambah Pos Baru
						</Button>
					</div>
				) : (
					/* Station Table */
					<PosTable
						posList={posList}
						handleDelete={handleDeleteClick}
						handleEdit={handleEdit}
						setShowForm={handleAdd}
						posPin={posPin}
					/>
				)}
			</div>

			{/* ── 6. Form Modal (Add/Edit POS Station) ── */}
			<PosForm
				show={showForm}
				posData={selectedPos}
				onHide={() => {
					setShowForm(false);
					setSelectedPos(null);
				}}
			/>

			{/* ── 7. Confirmation Modal (Delete POS Station) ── */}
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
					iconColor: '#dc3545',
					iconBg: '#f8d7da',
					iconBorder: '#f5c2c7',
					btnVariant: 'danger',
				}}
			/>
		</div>
	);
};

export default EventPosPage;
