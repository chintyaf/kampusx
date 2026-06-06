import { Modal, Button, Spinner } from 'react-bootstrap';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const AuditModal = ({
	show,
	onHide,
	targetStatus,
	currentRequest,
	rejectionReason,
	setRejectionReason,
	canResubmit,
	setCanResubmit,
	submitting,
	onConfirm,
}) => {
	return (
		<Modal
			show={show}
			onHide={onHide}
			centered
			contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
		>
			<Modal.Body className="p-4" style={{ textAlign: 'left' }}>
				<div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
					<div
						className="d-flex align-items-center justify-content-center"
						style={{
							width: 44,
							height: 44,
							borderRadius: 10,
							backgroundColor:
								targetStatus === 'approved'
									? 'var(--success-bg)'
									: 'var(--danger-bg)',
							border: `1.5px solid ${targetStatus === 'approved' ? 'var(--success-border)' : 'var(--danger-border)'}`,
							color:
								targetStatus === 'approved'
									? 'var(--success-text)'
									: 'var(--danger-text)',
						}}
					>
						{targetStatus === 'approved' ? (
							<CheckCircle2 size={20} />
						) : (
							<XCircle size={20} />
						)}
					</div>
					<div>
						<h5 className="fw-bold text-dark m-0" style={{ fontSize: 15 }}>
							{targetStatus === 'approved'
								? 'Konfirmasi Persetujuan'
								: 'Konfirmasi Penolakan'}
						</h5>
						<p className="text-secondary m-0" style={{ fontSize: 12 }}>
							Tinjau dengan seksama sebelum melakukan tindakan audit
						</p>
					</div>
				</div>

				<div className="mb-4">
					<p className="text-secondary" style={{ fontSize: 13, lineHeight: '1.6' }}>
						{targetStatus === 'approved' ? (
							<>
								Apakah Anda yakin ingin <strong>menyetujui</strong> permohonan dari{' '}
								<strong>{currentRequest?.user?.name || 'User'}</strong>? Akun mereka
								akan otomatis ditingkatkan menjadi <strong>Organizer</strong> dengan
								masa aktif tanpa batas (otomatis kembali menjadi member jika tidak
								ada event baru yang dibuat dalam 1 tahun).
							</>
						) : (
							<>
								Anda akan <strong>menolak</strong> permohonan dari{' '}
								<strong>{currentRequest?.user?.name || 'User'}</strong>. Silakan isi
								alasan penolakan dan opsi pengajuan ulang di bawah ini.
							</>
						)}
					</p>

					{targetStatus === 'rejected' && (
						<div className="mt-3 animate__animated animate__fadeIn">
							<div className="mb-3">
								<label
									className="form-label fw-bold mb-1"
									style={{
										fontSize: 12,
										color: 'var(--text-color, #1e293b)',
									}}
								>
									Alasan Penolakan <span className="text-danger">*</span>
								</label>
								<textarea
									className="form-control"
									rows={3}
									placeholder="Contoh: Dokumen bukti fisik buram/tidak terbaca. Mohon unggah ulang foto KTM yang lebih jelas."
									value={rejectionReason}
									onChange={(e) => setRejectionReason(e.target.value)}
									required
									style={{
										fontSize: 13,
										borderRadius: 8,
										resize: 'none',
										padding: '10px 12px',
									}}
								/>
							</div>

							<div className="form-check form-switch d-flex align-items-center gap-2 p-0 mt-3">
								<input
									className="form-check-input ms-0"
									type="checkbox"
									id="can-resubmit-switch"
									checked={canResubmit}
									onChange={(e) => setCanResubmit(e.target.checked)}
									style={{ cursor: 'pointer', width: 36, height: 18 }}
								/>
								<label
									className="form-check-label fw-semibold text-secondary"
									htmlFor="can-resubmit-switch"
									style={{
										fontSize: 12.5,
										cursor: 'pointer',
										userSelect: 'none',
									}}
								>
									Izinkan pendaftar untuk mengajukan ulang permohonan (Resubmit)
								</label>
							</div>
							{!canResubmit && (
								<div
									className="form-text text-danger d-flex align-items-center gap-1.5 mt-1.5"
									style={{ fontSize: 11 }}
								>
									<AlertCircle size={12} /> Peringatan: Penolakan bersifat
									permanen. User tidak akan bisa mendaftar ulang.
								</div>
							)}
						</div>
					)}
				</div>

				<div className="d-flex justify-content-end gap-2.5 pt-3 border-top">
					<Button
						variant="light"
						className="border px-4"
						style={{ borderRadius: 8, fontSize: 12.5 }}
						onClick={onHide}
						disabled={submitting}
					>
						Batal
					</Button>
					<Button
						variant={targetStatus === 'approved' ? 'success' : 'danger'}
						className="px-4 fw-semibold text-white"
						style={{
							borderRadius: 8,
							fontSize: 12.5,
							backgroundColor:
								targetStatus === 'approved'
									? 'var(--success-text)'
									: 'var(--danger-text)',
							borderColor:
								targetStatus === 'approved'
									? 'var(--success-text)'
									: 'var(--danger-text)',
						}}
						onClick={onConfirm}
						disabled={
							submitting || (targetStatus === 'rejected' && !rejectionReason.trim())
						}
					>
						{submitting ? (
							<>
								<Spinner animation="border" size="sm" className="me-2" />{' '}
								Memproses...
							</>
						) : (
							'Konfirmasi Audit'
						)}
					</Button>
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default AuditModal;
