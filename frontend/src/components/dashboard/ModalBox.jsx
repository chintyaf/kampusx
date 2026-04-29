import React from 'react';
import { Modal } from 'react-bootstrap';
import { Globe, X } from 'lucide-react';

// ✅ Tambahkan ...props agar pengaturan seperti size="lg" bisa diteruskan ke Modal
const ModalBox = ({ show, onHide, title, subtitle, children, ...props }) => {
	return (
		<Modal
			show={show}
			onHide={onHide}
			centered
			contentClassName="border-0 shadow-lg rounded-4 overflow-hidden pop-down"
			{...props} // ✅ Spread props di sini
		>
			<Modal.Header className="d-flex border border-bottom align-items-start justify-content-between gap-3 border-0 px-4 py-3">
				<div className="d-flex align-items-center gap-2">
					<div
						className="d-flex align-items-center justify-content-center rounded flex-shrink-0 bg-opacity-10"
						style={{ width: 36, height: 36 }}>
						<Globe size={18} color="#000" strokeWidth={2} />
					</div>
					<div>
						<div
							className="fw-bold m-0"
							style={{
								fontSize: 15,
								letterSpacing: '-0.3px',
							}}>
							{title}
						</div>
						<div
							className="text-secondary text-opacity-75"
							style={{ fontSize: 11, letterSpacing: '0.3px' }}>
							{subtitle}
						</div>
					</div>
				</div>
				<button
					onClick={onHide}
					className="btn"
					>
					<X size={20} />
				</button>
			</Modal.Header>

			<Modal.Body className="p-4">{children}</Modal.Body>
		</Modal>
	);
};

export default ModalBox;
