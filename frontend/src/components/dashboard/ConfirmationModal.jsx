import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

const ConfirmationModal = ({
	show,
	onHide,
	onConfirm,
	loading = false,
	config = {}, // Mengelompokkan semua opsi tampilan di sini
}) => {
	// Destructuring config dengan nilai default
	const {
		title = 'Konfirmasi',
		desc = 'Apakah Anda yakin ingin melakukan tindakan ini?',
		icon: Icon,
		iconColor = '#000',
		iconBg = '#f8f9fa',
		iconBorder = '#dee2e6',
		btnVariant = 'primary',
	} = config;

	return (
		<Modal
			show={show}
			onHide={onHide}
			centered
			contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
			<Modal.Body className="text-center p-5 pb-4">
				{Icon && (
					<div
						className="d-flex align-items-center justify-content-center mx-auto mb-3"
						style={{
							width: 52,
							height: 52,
							borderRadius: 14,
							border: `1.5px solid ${iconBorder}`,
							backgroundColor: iconBg,
						}}>
						<Icon size={22} color={iconColor} strokeWidth={2} />
					</div>
				)}

				<h5 className="fw-bold text-dark mb-2" style={{ fontSize: 15 }}>
					{title}
				</h5>
				<p className="text-secondary m-0" style={{ fontSize: 13 }}>
					{desc}
				</p>
			</Modal.Body>

			<Modal.Footer className="border-0 justify-content-center gap-2 pb-4">
				<Button
					variant="light"
					className="border px-4"
					style={{ borderRadius: 9, fontSize: 13 }}
					onClick={onHide}
					disabled={loading}>
					Batal
				</Button>
				<Button
					variant={btnVariant}
					className="px-4 fw-semibold"
					style={{ borderRadius: 9, fontSize: 13 }}
					onClick={onConfirm}
					disabled={loading}>
					{loading ? (
						<>
							<Spinner animation="border" size="sm" className="me-2" /> Memproses...
						</>
					) : (
						'Konfirmasi'
					)}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmationModal;
