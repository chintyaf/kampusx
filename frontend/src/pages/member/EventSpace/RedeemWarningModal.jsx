import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';

const RedeemWarningModal = ({ show, onHide, pendingRedeemReward, executeRedemption }) => {
	const [notes, setNotes] = useState('');

	useEffect(() => {
		if (show) {
			setNotes('');
		}
	}, [show]);

	return (
		<Modal
			show={show}
			onHide={onHide}
			centered
			backdrop="static"
			contentClassName="border-0 rounded-4 shadow-lg"
		>
			<Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
			<Modal.Body className="text-center px-4 pb-5 pt-0">
				<div className="mb-4">
					<div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex p-3.5 mb-2 border border-warning border-opacity-25">
						<AlertTriangle size={48} className="text-warning animate-bounce" />
					</div>
				</div>
				<h4 className="fw-bold text-dark mb-2">
					Peringatan: Event Online + Reward Fisik
				</h4>
				<p
					className="text-muted small mb-4 px-2"
					style={{ lineHeight: '1.6', fontSize: '0.86rem' }}
				>
					Anda saat ini mengikuti event ini secara <strong>Online</strong>, namun Anda
					menukar reward fisik <strong>({pendingRedeemReward?.title})</strong>.
					<br />
					<br />
					Harap masukkan alamat pengiriman Anda di bawah ini agar panitia dapat mengirimkan hadiah tersebut ke alamat Anda.
				</p>

				<Form.Group className="mb-4 text-start">
					<Form.Label className="fw-semibold text-secondary small">
						Alamat Pengiriman (Min. 10 karakter):
					</Form.Label>
					<Form.Control
						as="textarea"
						rows={3}
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder="Nama Penerima, No HP, Alamat Lengkap (Jalan, RT/RW, Kecamatan, Kota, Kode Pos)..."
						style={{ fontSize: '13px', borderRadius: '8px' }}
					/>
				</Form.Group>

				<div className="d-flex flex-column gap-2">
					<Button
						variant="warning"
						size="lg"
						className="rounded-pill fw-bold text-white shadow-sm"
						disabled={!notes || notes.trim().length < 10}
						onClick={() =>
							pendingRedeemReward && executeRedemption(pendingRedeemReward, notes)
						}
					>
						Ya, Tukar Sekarang
					</Button>
					<Button
						variant="outline-secondary"
						size="lg"
						className="rounded-pill"
						onClick={onHide}
					>
						Batal
					</Button>
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default RedeemWarningModal;
