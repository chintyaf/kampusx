import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';

const RedeemWarningModal = ({ show, onHide, pendingRedeemReward, executeRedemption }) => {
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
					Harap diperhatikan bahwa reward fisik hanya dapat diambil secara langsung di
					lokasi fisik acara atau harus diatur pengirimannya dengan panitia. Apakah
					Anda yakin ingin melanjutkan penukaran?
				</p>

				<div className="d-flex flex-column gap-2">
					<Button
						variant="warning"
						size="lg"
						className="rounded-pill fw-bold text-white shadow-sm"
						onClick={() =>
							pendingRedeemReward && executeRedemption(pendingRedeemReward)
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
