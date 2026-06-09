import React, { useState, useEffect } from 'react';
import { Button, Spinner, Row, Col, Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, Plus, Trash2, BookOpen, ShieldCheck, Copy, Link2 } from 'lucide-react';
import FormHeading from '@/components/dashboard/FormHeading';

import ConfirmationModal from '@/components/dashboard/ConfirmationModal';
import api from '@/api/axios';

import {
	PosPinHeader,
	PosStats,
	PosTable,
	PosForm,
	PosGuideCard,
	MultiSessionAttendanceTool,
} from './components';

import { useLoading } from '@/context/LoadingContext';

/**
 * Page Component: EventPosPage
 * Main entry point for Organizer POS and Scanner Station management.
 * Displays statistics, active attendance windows, online attendance tools,
 * and allows CRUD operations for POS scanner stations.
 */
const EventPosPage = () => {
	const { eventId } = useParams();
	const { setIsPageLoading } = useLoading();
	const [posList, setPosList] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [selectedPos, setSelectedPos] = useState(null);
	const [posPin, setPosPin] = useState('-');
	const [event, setEvent] = useState(null);
	const [activeMethod, setActiveMethod] = useState('qr'); // 'qr' | 'online'
	const [showGuideModal, setShowGuideModal] = useState(false);

	// States for deleting POS station
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [posToDelete, setPosToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Fetch active POS stations and general event details
	const fetchPosList = async () => {
		try {
			setIsPageLoading(true);
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
		} finally {
			setIsPageLoading(false);
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
		<div className="container-fluid p-0 d-flex flex-column gap-4 fade-in">
			{/* ── 1. Page Header ── */}
			<div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
				<FormHeading
					title="Manajemen Kehadiran"
					description="Kelola metode absensi peserta, buat stasiun scanner QR, atau bagikan link presensi mandiri."
				/>
				<Button
					variant="outline-secondary"
					size="sm"
					className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-none fw-semibold border"
					onClick={() => setShowGuideModal(true)}
				>
					<BookOpen size={15} />
					<span>Panduan Presensi</span>
				</Button>
			</div>

			{/* ── Guidance on How Staff Can Login & Record Attendance ── */}
			<div
				style={{
					background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
					border: '1.5px solid #bbf7d0',
					borderRadius: '12px',
					padding: '20px',
				}}
				className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 shadow-sm"
			>
				<div className="d-flex align-items-start gap-3">
					<div
						style={{
							width: '44px',
							height: '44px',
							borderRadius: '12px',
							backgroundColor: '#22c55e',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: '#ffffff',
							flexShrink: 0,
						}}
					>
						<ShieldCheck size={22} />
					</div>
					<div>
						{/* Teks Judul Diperpendek */}
						<h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '0.95rem' }}>
							Cara Login Staf / Panitia
						</h6>
						{/* Teks Deskripsi Diperpendek */}
						<p
							className="mb-0 text-muted"
							style={{ fontSize: '0.82rem', lineHeight: '1.5' }}
						>
							Bagikan <strong>Link Login Staf</strong> ke panitia. PIN{' '}
							<strong>{posPin}</strong> akan terisi otomatis, sehingga staf bisa
							langsung scan QR tiket atau check-in manual.
						</p>
					</div>
				</div>

				<div className="d-flex flex-wrap align-items-center gap-2 flex-shrink-0">
					<Button
						variant="light"
						size="sm"
						className="border px-3 py-2 rounded-3 shadow-none fw-bold bg-white d-flex align-items-center gap-1.5"
						onClick={() => {
							navigator.clipboard.writeText(posPin);
							toast.success('PIN disalin!');
						}}
					>
						<Copy size={14} />
						<span>PIN: {posPin}</span>
					</Button>
					<Button
						variant="dark"
						size="sm"
						className="px-3 py-2 rounded-3 shadow-none fw-bold text-white border-0 d-flex align-items-center gap-1.5"
						onClick={() => {
							const url = `${window.location.origin}/staff/login?pin=${posPin}`;
							navigator.clipboard
								.writeText(url)
								.then(() => toast.success('Link Login Staf disalin!'))
								.catch(() => toast.error('Gagal menyalin link.'));
						}}
					>
						<Link2 size={14} />
						<span>Salin Link Login Staf</span>
					</Button>
				</div>
			</div>

			{/* ── 2. Dua Kolom Layout Responsive ── */}
			{(() => {
				const isOffline = event?.location_type === 'offline';
				const qrTabLabel = isOffline
					? 'Scanner QR (Check-in / Masuk)'
					: 'Pos Scanner QR (Offline)';
				const onlineTabLabel = isOffline ? 'Link Checkout (Online)' : 'Magic Link (Online)';

				return (
					<Row className="g-4">
						{/* Kolom Utama: Full Width (12 bagian) */}
						<Col lg={12} className="d-flex flex-column gap-4">
							{/* Rongga Waktu Presensi (Rentang Waktu Presensi Aktif) */}
							{/* <AttendanceWindowInfo event={event} /> */}

							{/* Custom Method Toggle (Tab modern dengan garis bawah) */}
							<div className="d-flex border-bottom" style={{ gap: '24px' }}>
								<button
									onClick={() => setActiveMethod('qr')}
									className="pb-2 fw-bold bg-transparent border-0 transition-all position-relative"
									style={{
										fontSize: '0.9rem',
										cursor: 'pointer',
										color:
											activeMethod === 'qr'
												? 'var(--primary)'
												: 'var(--text-muted)',
										padding: '8px 4px',
										transition: 'all 0.2s ease',
										outline: 'none',
										boxShadow: 'none',
									}}
									onMouseEnter={(e) => {
										if (activeMethod !== 'qr')
											e.target.style.color = 'var(--primary-mid)';
									}}
									onMouseLeave={(e) => {
										if (activeMethod !== 'qr')
											e.target.style.color = 'var(--text-muted)';
									}}
								>
									{qrTabLabel}
									{activeMethod === 'qr' && (
										<div
											className="position-absolute bottom-0 start-0 end-0"
											style={{
												height: '3px',
												borderRadius: '3px 3px 0 0',
												backgroundColor: 'var(--primary)',
											}}
										/>
									)}
								</button>
								<button
									onClick={() => setActiveMethod('online')}
									className="pb-2 fw-bold bg-transparent border-0 transition-all position-relative"
									style={{
										fontSize: '0.9rem',
										cursor: 'pointer',
										color:
											activeMethod === 'online'
												? 'var(--primary)'
												: 'var(--text-muted)',
										padding: '8px 4px',
										transition: 'all 0.2s ease',
										outline: 'none',
										boxShadow: 'none',
									}}
									onMouseEnter={(e) => {
										if (activeMethod !== 'online')
											e.target.style.color = 'var(--primary-mid)';
									}}
									onMouseLeave={(e) => {
										if (activeMethod !== 'online')
											e.target.style.color = 'var(--text-muted)';
									}}
								>
									{onlineTabLabel}
									{activeMethod === 'online' && (
										<div
											className="position-absolute bottom-0 start-0 end-0"
											style={{
												height: '3px',
												borderRadius: '3px 3px 0 0',
												backgroundColor: 'var(--primary)',
											}}
										/>
									)}
								</button>
							</div>

							{/* Konten Berdasarkan Metode yang Dipilih */}
							{activeMethod === 'qr' ? (
								<div className="d-flex flex-column gap-4">
									{/* Stat Cards Row */}
									<PosStats posList={posList} />

									{/* POS Stations Management Table */}
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
												<div
													style={{
														fontWeight: 500,
														color: '#212529',
														marginBottom: 4,
													}}
												>
													Belum ada pos scanner
												</div>
												<div
													style={{
														fontSize: '0.9rem',
														color: '#6c757d',
														marginBottom: 20,
													}}
												>
													Tambahkan pos pertama agar panitia bisa mulai
													menugaskan lokasi scan.
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
								</div>
							) : (
								<div>
									{/* Link Presensi Online (Magic Link Tool) */}
									{/* <OnlineAttendanceTool /> */}
									<MultiSessionAttendanceTool />
								</div>
							)}
						</Col>
					</Row>
				);
			})()}

			{/* ── 3. Form Modal (Add/Edit POS Station) ── */}
			<PosForm
				show={showForm}
				posData={selectedPos}
				onHide={() => {
					setShowForm(false);
					setSelectedPos(null);
				}}
			/>

			{/* ── 4. Confirmation Modal (Delete POS Station) ── */}
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

			{/* ── 5. Panduan Modal ── */}
			<Modal show={showGuideModal} onHide={() => setShowGuideModal(false)} centered>
				<PosGuideCard
					eventType={event?.location_type}
					onClose={() => setShowGuideModal(false)}
				/>
			</Modal>
		</div>
	);
};

export default EventPosPage;
