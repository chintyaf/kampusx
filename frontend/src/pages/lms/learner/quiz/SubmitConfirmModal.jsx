import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';

const SubmitConfirmModal = ({ show, answeredCount, total, submitting, onHide, onConfirm }) => {
	return (
		<Modal show={show} onHide={onHide} centered contentClassName="border-0 shadow-lg">
			<Modal.Header closeButton className="px-4 pt-4 pb-2 border-bottom-0">
				<Modal.Title className="fs-3 fw-bold">Konfirmasi Pengiriman Quiz</Modal.Title>
			</Modal.Header>

			<Modal.Body className="px-4 py-2">
				<div className="qz-modal-summary">
					<div className="qz-modal-icon">
						<AlertTriangle size={22} />
					</div>
					<div>
						<h6 className="mb-1 fw-bold fs-4">Apakah Anda yakin ingin menyelesaikan quiz ini?</h6>
						<p className="text-muted fs-5">
							Jawaban Anda akan dikirim dan dinilai. Setelah dikirim, jawaban tidak dapat
							diubah.
						</p>
					</div>
				</div>

				<div className="qz-stat is-success">
					<span className="qz-stat-label">Sudah Dijawab</span>
					<span className="qz-stat-value">
						{answeredCount} <small className="text-muted fs-4 fw-normal">/ {total}</small>
					</span>
				</div>
			</Modal.Body>

			<Modal.Footer className="px-4 pb-4 pt-3 border-top-0">
				<Button variant="light" className="qz-btn qz-btn-ghost" disabled={submitting} onClick={onHide}>
					Batal
				</Button>
				<Button className="qz-btn border-0 px-4" disabled={submitting} onClick={onConfirm}>
					{submitting ? 'Mengirim...' : 'Ya, Kirim Jawaban'}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default SubmitConfirmModal;
