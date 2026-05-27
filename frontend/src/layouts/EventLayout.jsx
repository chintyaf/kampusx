import { useState } from 'react';
import { Form, Container, Button, Spinner, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import '../assets/css/form.css';
import { Image, Bell, BellOff, AlertTriangle } from 'lucide-react';
import { notify } from '../utils/notify';

const EventLayout = ({
	title,
	description,
	heading,
	subheading,
	children,
	sidebar,
	nextPath,
	prevPath,
	onSave,
	isFormDirty = false,
	formDirtyMessage = 'Mohon simpan atau batalkan perubahan yang sedang Anda lakukan sebelum pindah halaman.',
	// Props untuk fitur notifikasi peserta
	eventStatus = 'draft',
	hasParticipants = false,
}) => {
	const navigate = useNavigate();
	const [isSaving, setIsSaving] = useState(false);
	// State untuk modal konfirmasi notifikasi
	const [showNotifyModal, setShowNotifyModal] = useState(false);
	const [pendingAction, setPendingAction] = useState(null); // 'continue' | 'save'

	// Cek apakah perlu tampilkan modal konfirmasi
	const isPublished = ['published', 'ongoing'].includes(eventStatus);
	const needsConfirmation = isPublished && hasParticipants;

	const executeSave = async (shouldNotify, action) => {
		if (isSaving) return;
		setIsSaving(true);
		setShowNotifyModal(false);

		try {
			if (onSave) await onSave(shouldNotify);
			if (action === 'continue' && nextPath) {
				navigate(`../${nextPath}`);
			}
		} catch (error) {
			console.error('Navigation/save error:', error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleSaveAndContinue = async () => {
		if (isFormDirty) {
			alert(formDirtyMessage);
			return;
		}
		if (needsConfirmation) {
			setPendingAction('continue');
			setShowNotifyModal(true);
			return;
		}
		await executeSave(false, 'continue');
	};

	const handleSave = async () => {
		if (isSaving) return;
		if (needsConfirmation) {
			setPendingAction('save');
			setShowNotifyModal(true);
			return;
		}
		await executeSave(false, 'save');
	};

	return (
		<>
			{/* ── Modal Konfirmasi Notifikasi Peserta ── */}
			<Modal
				show={showNotifyModal}
				onHide={() => setShowNotifyModal(false)}
				centered
				backdrop="static"
				size="md"
			>
				<Modal.Body style={{ padding: '32px 28px' }}>
					{/* Icon */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: 56,
							height: 56,
							borderRadius: '50%',
							background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
							margin: '0 auto 20px auto',
							border: '2px solid #ffc107',
						}}
					>
						<AlertTriangle size={26} color="#e67e22" />
					</div>

					<h5
						style={{
							textAlign: 'center',
							fontWeight: 700,
							fontSize: '1.05rem',
							color: '#1e293b',
							marginBottom: 8,
						}}
					>
						Event Ini Sudah Dipublikasikan
					</h5>
					<p
						style={{
							textAlign: 'center',
							color: '#64748b',
							fontSize: '0.9rem',
							lineHeight: 1.6,
							marginBottom: 28,
						}}
					>
						Perubahan yang Anda simpan akan langsung terlihat di halaman event. Apakah
						Anda ingin <strong>mengumumkan perubahan ini</strong> kepada peserta yang
						sudah mendaftar?
					</p>

					<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
						{/* Opsi 1: Beritahu peserta */}
						<button
							onClick={() => executeSave(true, pendingAction)}
							disabled={isSaving}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 12,
								padding: '12px 16px',
								background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
								color: 'white',
								border: 'none',
								borderRadius: 10,
								cursor: 'pointer',
								fontSize: '0.9rem',
								fontWeight: 600,
								textAlign: 'left',
								transition: 'opacity 0.2s',
								opacity: isSaving ? 0.7 : 1,
							}}
						>
							<div
								style={{
									width: 36,
									height: 36,
									borderRadius: '50%',
									background: 'rgba(255,255,255,0.2)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0,
								}}
							>
								<Bell size={18} />
							</div>
							<div>
								<div>Ya, Beritahu Peserta</div>
								<div
									style={{ fontSize: '0.78rem', fontWeight: 400, opacity: 0.85 }}
								>
									Kirim notifikasi perubahan ke semua peserta terdaftar
								</div>
							</div>
						</button>

						{/* Opsi 2: Simpan tanpa notifikasi — dinonaktifkan sementara.
						    Untuk saat ini, setiap perubahan pada event published wajib disertai notifikasi ke peserta.
						<button
							onClick={() => executeSave(false, pendingAction)}
							disabled={isSaving}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 12,
								padding: '12px 16px',
								background: 'white',
								color: '#475569',
								border: '1.5px solid #e2e8f0',
								borderRadius: 10,
								cursor: 'pointer',
								fontSize: '0.9rem',
								fontWeight: 600,
								textAlign: 'left',
								transition: 'opacity 0.2s',
								opacity: isSaving ? 0.7 : 1,
							}}
						>
							<div style={{
								width: 36, height: 36, borderRadius: '50%',
								background: '#f1f5f9',
								display: 'flex', alignItems: 'center', justifyContent: 'center',
								flexShrink: 0,
							}}>
								<BellOff size={18} color="#94a3b8" />
							</div>
							<div>
								<div>Simpan Tanpa Notifikasi</div>
								<div style={{ fontSize: '0.78rem', fontWeight: 400, opacity: 0.7, lineHeight: 1.5 }}>
									Cocok untuk perubahan kecil seperti perbaikan typo atau koreksi internal
									yang tidak perlu diumumkan ke peserta
								</div>
							</div>
						</button>
						*/}

						{/* Batal */}
						<button
							onClick={() => setShowNotifyModal(false)}
							disabled={isSaving}
							style={{
								padding: '8px 16px',
								background: 'transparent',
								color: '#94a3b8',
								border: 'none',
								borderRadius: 8,
								cursor: 'pointer',
								fontSize: '0.85rem',
								textAlign: 'center',
								marginTop: 4,
							}}
						>
							Batal, kembali edit
						</button>
					</div>
				</Modal.Body>
			</Modal>

			{/* ── Layout Utama ── */}
			<div className="d-flex align-items-start gap-4">
				{/* ── KOLOM KIRI: Konten Utama (Grows to fill space) ── */}
				{/* minWidth: 0 penting agar form tidak meluber ke luar container */}
				<div className="flex-grow-1 position-relative" style={{ minWidth: 0 }}>
					{/* Header Section */}
					{heading ||
						(title && (
							<div className="mb-4 d-flex align-items-start">
								<div>
									<h5 className="fw-bold mb-1" style={{ fontSize: '1.1rem' }}>
										{heading}
										{title}
									</h5>
									<p className="text-muted small mb-0">
										{subheading}
										{description}
									</p>
								</div>
							</div>
						))}

					<div className="position-relative">
						<div
							className="d-flex flex-column gap-4"
							style={{
								opacity: isSaving ? 0.5 : 1,
								pointerEvents: isSaving ? 'none' : 'auto',
							}}
						>
							{children}
						</div>
					</div>

					{/* Footer Buttons */}
					<div className="w-100 d-flex justify-content-end mt-3 pt-3 border-top gap-1">
						{prevPath && (
							<Button
								variant="outline-secondary"
								disabled={isSaving}
								onClick={() => {
									if (isFormDirty) {
										alert(formDirtyMessage);
										return;
									}
									navigate(`../${prevPath}`);
								}}
							>
								Back
							</Button>
						)}

						{nextPath ? (
							<Button
								variant="primary"
								onClick={handleSaveAndContinue}
								disabled={isSaving}
							>
								{isSaving ? 'Saving...' : 'Selanjutnya'}
							</Button>
						) : (
							<Button variant="primary" onClick={handleSave} disabled={isSaving}>
								{isSaving ? 'Saving...' : 'Simpan'}
							</Button>
						)}
					</div>
				</div>

				{/* ── KOLOM KANAN: Sidebar Opsional ── */}
				{/* Kalau prop sidebar diisi, dia akan dirender di sini dan diberi sifat sticky */}
				{sidebar && (
					<div
						style={{
							position: 'sticky',
							top: '0px',
							flexShrink: 0,
							// maxWidth: '400px',
							height: '80vh',
						}}
					>
						{sidebar}
					</div>
				)}
			</div>
		</>
	);
};

export default EventLayout;
