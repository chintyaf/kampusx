import React, { useState, useEffect } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';
import FormHeading from '../../../../components/dashboard/FormHeading';
import StatCard from '@/components/dashboard/StatCard';
import PosTable from './PosTable';
import PosForm from './PosForm';
// Import Trash2 untuk icon modal, dan pastikan path ConfirmationModal sesuai dengan struktur folder Anda
import { Users, CheckCircle2, Box, Ticket, Plus, MapPin, Trash2, Link as LinkIcon, Copy, RefreshCw, Download } from 'lucide-react';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';
import PosPinHeader from './PosPinHeader';
import toast, { Toaster } from 'react-hot-toast';
import { InputGroup, Form, Spinner, Card, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
/* ── Main ────────────────────────────────────────────────────── */
const EventPosPage = () => {
	const { eventId } = useParams();
	const [posList, setPosList] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [selectedPos, setSelectedPos] = useState(null);
	const [posPin, setPosPin] = useState('-');
	const [isExporting, setIsExporting] = useState(false);

	// State untuk Modal Delete
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [posToDelete, setPosToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// State untuk Online Link
	const [onlineLink, setOnlineLink] = useState('');
	const [loadingLink, setLoadingLink] = useState(false);
	const [linkType, setLinkType] = useState('in');

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
				photo_url: station.photo_url,
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
		navigator.clipboard.writeText(onlineLink)
			.then(() => toast.success('Link disalin ke clipboard!'))
			.catch(() => toast.error('Gagal menyalin link.'));
	};

	const handleExportCSV = async () => {
		setIsExporting(true);
		try {
			const res = await api.get(`/event-dashboard/${eventId}/export-report`, { responseType: 'blob' });
			const url = window.URL.createObjectURL(new Blob([res.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `laporan_kehadiran_event_${eventId}.xlsx`);
			document.body.appendChild(link);
			link.click();
			link.parentNode.removeChild(link);
			toast.success('Laporan berhasil diunduh!');
		} catch (error) {
			console.error('Export error:', error);
			toast.error('Gagal mengunduh laporan');
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className="d-flex flex-column gap-3">
			<Toaster position="top-right" />
			{/* ── Header & Action Button ── */}
			<div className="d-flex justify-content-between align-items-start">
				<FormHeading
					heading="Manajemen Pos Scanner"
					subheading="Kelola akses dan peran tim panitia Anda di sini."
				/>
				<Button 
					variant="outline-success" 
					onClick={handleExportCSV} 
					disabled={isExporting}
					className="d-flex align-items-center gap-2 fw-semibold rounded-pill px-4 shadow-sm"
				>
					{isExporting ? <Spinner size="sm" /> : <Download size={18} />}
					Export Laporan
				</Button>
			</div>

			<PosPinHeader pin={posPin} />

			{/* ── Presensi Online Link ── */}
			<Card className="border-0 shadow-sm rounded-4">
				<Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center text-center">
					<h5 className="fw-bold mb-2">Presensi Online (Link Temporer)</h5>
					<p className="text-muted mb-3 px-3" style={{ fontSize: '0.9rem' }}>
						Buat "Magic Link" unik yang bisa dibagikan kepada peserta online.
					</p>

					<ToggleButtonGroup type="radio" name="posLinkType" value={linkType} onChange={(val) => { setLinkType(val); setOnlineLink(''); }} className="mb-3 shadow-sm">
						<ToggleButton id="pos-tbg-btn-1" value="in" variant={linkType === 'in' ? 'primary' : 'outline-primary'} className="fw-semibold px-3" style={{ fontSize: '0.9rem' }}>
							Check-in
						</ToggleButton>
						<ToggleButton id="pos-tbg-btn-2" value="out" variant={linkType === 'out' ? 'primary' : 'outline-primary'} className="fw-semibold px-3" style={{ fontSize: '0.9rem' }}>
							Check-out
						</ToggleButton>
					</ToggleButtonGroup>
					
					{!onlineLink ? (
						<Button 
							variant="outline-primary" 
							className="rounded-pill px-4 fw-semibold shadow-sm"
							onClick={handleGenerateLink}
							disabled={loadingLink}
						>
							{loadingLink ? (
								<><Spinner size="sm" className="me-2" /> Memproses...</>
							) : (
								<><LinkIcon size={16} className="me-2" /> Generate Magic Link</>
							)}
						</Button>
					) : (
						<div className="w-100" style={{ maxWidth: '500px' }}>
							<InputGroup className="mb-2 shadow-sm">
								<Form.Control
									value={onlineLink}
									readOnly
									style={{ backgroundColor: '#f8f9fa', cursor: 'text' }}
								/>
								<Button variant="primary" onClick={handleCopyLink} className="d-flex align-items-center">
									<Copy size={16} className="me-1" /> Copy
								</Button>
							</InputGroup>
							<Button 
								variant="link" 
								className="text-muted text-decoration-none p-0 mt-1 d-inline-flex align-items-center"
								onClick={handleGenerateLink}
								disabled={loadingLink}
								style={{ fontSize: '0.85rem' }}
							>
								<RefreshCw size={12} className="me-1" /> Buat Ulang Link
							</Button>
						</div>
					)}
				</Card.Body>
			</Card>

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
