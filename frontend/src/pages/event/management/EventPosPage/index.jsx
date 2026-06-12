import React, { useState, useEffect } from 'react';
import { Button, Modal, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
	Plus,
	Trash2,
	BookOpen,
	ShieldCheck,
	Copy,
	QrCode,
	Monitor,
	MapPin,
	CheckCircle2,
	LogOut,
	Scan,
} from 'lucide-react';

import FormHeading from '@/components/dashboard/FormHeading';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';
import api from '@/api/axios';

import { PosForm, PosGuideCard, PosTable, PosStats } from './components';
import { useLoading } from '@/context/LoadingContext';

/**
 * Page Component: EventPosPage
 * Main entry point for Organizer POS and Scanner Station management.
 */
const EventPosPage = () => {
	const { eventId } = useParams();
	const { setIsPageLoading } = useLoading();
	const [posList, setPosList] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [selectedPos, setSelectedPos] = useState(null);
	const [posPin, setPosPin] = useState('-');
	const [event, setEvent] = useState(null);
	const [showGuideModal, setShowGuideModal] = useState(false);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [posToDelete, setPosToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const fetchPosList = async () => {
		try {
			setIsPageLoading(true);
			const response = await api.get(`/event-dashboard/${eventId}/stations`);
			if (response.data.pos_pin) setPosPin(response.data.pos_pin);
			if (response.data.event) setEvent(response.data.event);
			const mappedData = response.data.data.map((station) => ({
				id: station.id,
				name: station.name,
				description: station.description,
				photo_url: station.photo_url,
				status: station.is_active ? 'Aktif' : 'Tidak Aktif',
				totalScan: 0,
			}));
			setPosList(mappedData);
		} catch (error) {
			console.error('Failed to fetch stations:', error);
			toast.error('Gagal mengambil daftar pos.');
		} finally {
			setIsPageLoading(false);
		}
	};

	useEffect(() => {
		fetchPosList();
	}, [eventId, showForm]);

	const handleDeleteClick = (id) => {
		setPosToDelete(id);
		setShowDeleteModal(true);
	};

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

	const handleEdit = (pos) => {
		setSelectedPos(pos);
		setShowForm(true);
	};

	const handleAdd = () => {
		setSelectedPos(null);
		setShowForm(true);
	};

	return (
		<div className="container-fluid p-0 d-flex flex-column gap-4 fade-in">

			{/* ── Page Header ── */}
			<div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
				<FormHeading
					title="Manajemen Kehadiran"
					description="Kelola metode presensi peserta — tampilkan QR dinamis di layar atau kelola stasiun scanner di lokasi."
				/>
				<Button
					variant="outline-secondary"
					size="sm"
					className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-none fw-semibold border"
					onClick={() => setShowGuideModal(true)}
				>
					<BookOpen size={15} />
					<span>Panduan</span>
				</Button>
			</div>

			{/* ── Two Method Cards ── */}
			<Row className="g-3">
				{/* Card 1: Dynamic QR Screen */}
				<Col md={6}>
					<div
						className="h-100 p-4 rounded-4 d-flex flex-column gap-3"
						style={{
							background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
							border: '1.5px solid #bbf7d0',
						}}
					>
						<div className="d-flex align-items-center gap-3">
							<div
								style={{
									width: '44px', height: '44px', borderRadius: '12px',
									backgroundColor: '#22c55e',
									display: 'flex', alignItems: 'center', justifyContent: 'center',
									color: '#fff', flexShrink: 0,
								}}
							>
								<Monitor size={20} />
							</div>
							<div>
								<h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem' }}>
									Layar QR Presensi Dinamis
								</h6>
								<p className="mb-0 text-muted" style={{ fontSize: '0.78rem' }}>
									Tampilkan di layar / proyektor untuk peserta scan mandiri
								</p>
							</div>
						</div>

						<p className="mb-0 text-muted" style={{ fontSize: '0.82rem', lineHeight: '1.65' }}>
							Buka halaman layar QR, lalu arahkan ke peserta. Mereka cukup scan menggunakan kamera HP untuk{' '}
							<strong className="text-success">check-in</strong> atau{' '}
							<strong style={{ color: '#db2777' }}>check-out</strong>.
							QR diperbarui otomatis setiap <strong>5 menit</strong>.
						</p>

						<div className="d-flex gap-2 flex-wrap align-items-center">
							<Button
								size="sm"
								className="d-flex align-items-center gap-2 border-0 fw-bold px-3 py-2 rounded-3 shadow-none"
								style={{ backgroundColor: '#22c55e', color: '#fff' }}
								onClick={() => window.open(`/organizer/${eventId}/event-dashboard/venue-qr`, '_blank')}
							>
								<QrCode size={14} /> Buka Layar QR
							</Button>
							<div className="d-flex gap-1">
								<span
									className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-2 fw-semibold"
									style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', border: '1px solid #bbf7d0' }}
								>
									<CheckCircle2 size={11} /> Check-In
								</span>
								<span
									className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-2 fw-semibold"
									style={{ background: '#fce7f3', color: '#be185d', fontSize: '0.72rem', border: '1px solid #fbcfe8' }}
								>
									<LogOut size={11} /> Check-Out
								</span>
							</div>
						</div>
					</div>
				</Col>

				{/* Card 2: Staff Scanner */}
				<Col md={6}>
					<div
						className="h-100 p-4 rounded-4 d-flex flex-column gap-3"
						style={{
							background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
							border: '1.5px solid #e2e8f0',
						}}
					>
						<div className="d-flex align-items-center gap-3">
							<div
								style={{
									width: '44px', height: '44px', borderRadius: '12px',
									backgroundColor: 'var(--primary, #4f46e5)',
									display: 'flex', alignItems: 'center', justifyContent: 'center',
									color: '#fff', flexShrink: 0,
								}}
							>
								<Scan size={20} />
							</div>
							<div>
								<h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem' }}>
									Panitia / Staf Scanner
								</h6>
								<p className="mb-0 text-muted" style={{ fontSize: '0.78rem' }}>
									Scan QR tiket peserta secara manual di lokasi
								</p>
							</div>
						</div>

						<p className="mb-0 text-muted" style={{ fontSize: '0.82rem', lineHeight: '1.65' }}>
							Bagikan <strong>Link Login Staf</strong> ke panitia. PIN{' '}
							<strong
								className="font-monospace"
								style={{ color: 'var(--primary, #4f46e5)', letterSpacing: '1px' }}
							>
								{posPin}
							</strong>{' '}
							akan terisi otomatis sehingga staf bisa langsung scan QR tiket atau check-in manual.
						</p>

						<div className="d-flex gap-2 flex-wrap">
							<Button
								variant="light"
								size="sm"
								className="border d-flex align-items-center gap-1 px-3 py-2 rounded-3 shadow-none fw-semibold bg-white"
								onClick={() => { navigator.clipboard.writeText(posPin); toast.success('PIN disalin!'); }}
							>
								<Copy size={13} /> PIN: {posPin}
							</Button>
							<Button
								variant="dark"
								size="sm"
								className="d-flex align-items-center gap-1 px-3 py-2 rounded-3 shadow-none fw-semibold border-0"
								onClick={() => {
									const url = `${window.location.origin}/staff/login?pin=${posPin}`;
									navigator.clipboard.writeText(url)
										.then(() => toast.success('Link staf disalin!'))
										.catch(() => toast.error('Gagal.'));
								}}
							>
								<ShieldCheck size={13} /> Salin Link Staf
							</Button>
						</div>
					</div>
				</Col>
			</Row>

			{/* ── Scanner Stations Section ── */}
			<div>
				{/* Section heading row */}
				<div className="d-flex justify-content-between align-items-center mb-3">
					<div>
						<h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem' }}>
							Pos Scanner QR
						</h6>
						<p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
							Stasiun scan tiket peserta yang beroperasi di lokasi
						</p>
					</div>
					<Button
						size="sm"
						className="d-flex align-items-center gap-2 border-0 fw-bold px-3 py-2 rounded-3 shadow-none"
						style={{ backgroundColor: 'var(--primary, #4f46e5)', color: '#fff', fontSize: '0.83rem' }}
						onClick={handleAdd}
					>
						<Plus size={14} /> Tambah Pos
					</Button>
				</div>

				{/* Stats */}
				<div className="mb-3">
					<PosStats posList={posList} />
				</div>

				{/* Table / Empty state */}
				<div className="bg-white border rounded-4 overflow-hidden shadow-none">
					{posList.length === 0 ? (
						<div className="text-center py-5">
							<div
								style={{
									width: 56, height: 56, borderRadius: '50%',
									backgroundColor: '#f8f9fa',
									display: 'flex', alignItems: 'center', justifyContent: 'center',
									margin: '0 auto 16px',
								}}
							>
								<MapPin size={24} className="text-muted" />
							</div>
							<div style={{ fontWeight: 500, color: '#212529', marginBottom: 4 }}>
								Belum ada pos scanner
							</div>
							<div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: 20 }}>
								Tambahkan pos agar panitia bisa mulai menugaskan lokasi scan.
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

			{/* ── Modals ── */}
			<PosForm
				show={showForm}
				posData={selectedPos}
				onHide={() => {
					setShowForm(false);
					setSelectedPos(null);
				}}
			/>

			<ConfirmationModal
				show={showDeleteModal}
				onHide={() => { setShowDeleteModal(false); setPosToDelete(null); }}
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
