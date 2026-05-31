import React, { useState, useEffect } from 'react';
import {
	Button,
	Row,
	Col,
	InputGroup,
	Form,
	Spinner,
	ToggleButtonGroup,
	ToggleButton,
} from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
	Users,
	CheckCircle2,
	Box,
	Ticket,
	Plus,
	MapPin,
	Trash2,
	Link as LinkIcon,
	Copy,
	RefreshCw,
	ScanLine,
} from 'lucide-react';

import api from '@/api/axios';
import StatCard from '@/components/dashboard/StatCard';
import PosTable from './PosTable';
import PosForm from './PosForm';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';
import VenueQrModal from '@/components/event/VenueQrModal';

/* ── Main ────────────────────────────────────────────────────── */
const EventPosPage = () => {
	const { eventId } = useParams();
	const [posList, setPosList] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [selectedPos, setSelectedPos] = useState(null);
	const [posPin, setPosPin] = useState('-');

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [posToDelete, setPosToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const [showVenueQr, setShowVenueQr] = useState(false);
	const [eventTitle, setEventTitle] = useState('');

	const [onlineLink, setOnlineLink] = useState('');
	const [loadingLink, setLoadingLink] = useState(false);
	const [linkType, setLinkType] = useState('in');

	const fetchPosList = async () => {
		try {
			const response = await api.get(`/event-dashboard/${eventId}/stations`);
			if (response.data.pos_pin) {
				setPosPin(response.data.pos_pin);
			}
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
		}
	};

	const fetchEventTitle = async () => {
		try {
			const response = await api.get(`/event-dashboard/${eventId}/overview`);
			if (response.data?.status === 'success') {
				setEventTitle(response.data.data.name);
			}
		} catch (error) {
			console.error('Failed to fetch event overview:', error);
		}
	};

	useEffect(() => {
		fetchPosList();
		fetchEventTitle();
	}, [eventId, showForm]);

	const activeCount = posList.filter((p) => p.status === 'Aktif').length;
	const unusedCount = posList.filter((p) => p.status === 'Tidak Aktif').length;
	const totalScanCount = posList.reduce((acc, curr) => acc + curr.totalScan, 0);

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

	const handleGenerateLink = async () => {
		setLoadingLink(true);
		try {
			const res = await api.get(`/event-dashboard/${eventId}/venue-qr?type=${linkType}`);
			if (res.data?.success) {
				const { event_id, signature, type } = res.data.data;
				const url = `${window.location.origin}/attend-venue?event_id=${event_id}&type=${type}&signature=${signature}`;
				setOnlineLink(url);
				toast.success('Magic link berhasil dibuat!');
			}
		} catch (error) {
			toast.error('Gagal membuat magic link.');
		} finally {
			setLoadingLink(false);
		}
	};

	const handleCopyLink = () => {
		navigator.clipboard
			.writeText(onlineLink)
			.then(() => toast.success('Link disalin ke clipboard!'))
			.catch(() => toast.error('Gagal menyalin link.'));
	};

	return (
		<div className="d-flex flex-column gap-4">
			<Toaster position="top-right" />

			{/* ── Header ── */}
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

			{/* ── Alat Presensi (QR Venue & Link Online) ── */}
			<div className="bg-light border rounded-3 p-3 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 shadow-none">
				<div>
					<div className="fw-medium text-dark" style={{ fontSize: '0.95rem' }}>
						Alat Presensi
					</div>
					<div className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>
						Tampilkan QR venue fisik atau buat magic link untuk peserta online.
					</div>
				</div>

				<div className="d-flex flex-wrap align-items-center gap-3">
					<Button
						variant="white"
						className="border rounded-2 px-3 py-1 d-flex align-items-center gap-2 shadow-none text-dark bg-white"
						onClick={() => setShowVenueQr(true)}
						style={{ fontSize: '0.85rem' }}
					>
						<ScanLine size={14} className="text-primary" /> QR Venue
					</Button>

					<div
						className="vr d-none d-lg-block opacity-25"
						style={{ height: '24px' }}
					></div>

					<div className="d-flex flex-wrap align-items-center gap-2">
						<ToggleButtonGroup
							type="radio"
							name="posLinkType"
							value={linkType}
							onChange={(val) => {
								setLinkType(val);
								setOnlineLink('');
							}}
							className="bg-white border rounded-2 p-1"
						>
							<ToggleButton
								id="pos-tbg-btn-1"
								value="in"
								variant={linkType === 'in' ? 'dark' : 'white'}
								className={`border-0 rounded-1 px-3 py-1 ${linkType !== 'in' && 'text-muted bg-transparent'}`}
								style={{ fontSize: '0.85rem' }}
							>
								Check-in
							</ToggleButton>
							<ToggleButton
								id="pos-tbg-btn-2"
								value="out"
								variant={linkType === 'out' ? 'dark' : 'white'}
								className={`border-0 rounded-1 px-3 py-1 ${linkType !== 'out' && 'text-muted bg-transparent'}`}
								style={{ fontSize: '0.85rem' }}
							>
								Check-out
							</ToggleButton>
						</ToggleButtonGroup>

						{!onlineLink ? (
							<Button
								variant="outline-secondary"
								className="rounded-2 px-3 py-1 d-flex align-items-center gap-2 bg-white shadow-none"
								onClick={handleGenerateLink}
								disabled={loadingLink}
								style={{ fontSize: '0.85rem', borderStyle: 'dashed' }}
							>
								{loadingLink ? (
									<Spinner size="sm" />
								) : (
									<>
										<LinkIcon size={14} /> Link Online
									</>
								)}
							</Button>
						) : (
							<div className="d-flex align-items-center gap-2">
								<InputGroup
									size="sm"
									className="shadow-none"
									style={{ width: '200px' }}
								>
									<Form.Control
										value={onlineLink}
										readOnly
										className="bg-white border-end-0 text-muted"
										style={{ cursor: 'text', fontSize: '0.85rem' }}
									/>
									<Button
										variant="white"
										onClick={handleCopyLink}
										className="border border-start-0 text-dark d-flex align-items-center"
										title="Salin Link"
									>
										<Copy size={14} />
									</Button>
								</InputGroup>
								<Button
									variant="link"
									className="text-muted p-0 ms-1 d-flex align-items-center"
									onClick={handleGenerateLink}
									disabled={loadingLink}
									title="Buat ulang link"
								>
									<RefreshCw size={14} />
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>

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

			{/* ── Manajemen Pos & Akses PIN ── */}
			<div className="d-flex flex-column gap-3">
				{/* Konten Utama Pos (Table / Empty State) */}
				{posList.length === 0 ? (
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
					<PosTable
						posList={posList}
						handleDelete={handleDeleteClick}
						handleEdit={handleEdit}
						setShowForm={handleAdd}
						posPin={posPin}
					/>
				)}
			</div>

			{/* ── Form Modal (Add/Edit) ── */}
			<PosForm
				show={showForm}
				posData={selectedPos}
				onHide={() => {
					setShowForm(false);
					setSelectedPos(null);
				}}
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
					iconColor: '#dc3545',
					iconBg: '#f8d7da',
					iconBorder: '#f5c2c7',
					btnVariant: 'danger',
				}}
			/>

			{/* ── Venue QR Modal ── */}
			<VenueQrModal
				show={showVenueQr}
				onHide={() => setShowVenueQr(false)}
				eventId={eventId}
				eventTitle={eventTitle}
			/>
		</div>
	);
};

export default EventPosPage;
