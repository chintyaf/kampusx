import React, { useState } from 'react';
import { Button, Collapse, Form, Row, Col } from 'react-bootstrap';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'; // Pastikan Anda menggunakan lucide-react

function formatRp(val) {
	if (!val) return '';
	const n = parseInt(String(val).replace(/\D/g, ''), 10);
	if (isNaN(n)) return '';
	return n.toLocaleString('id-ID');
}

function TicketCard({ ticket, index, onChange, onDelete, canDelete }) {
	const [open, setOpen] = useState(true);

	// Helper format Rupiah (pastikan fungsi ini ada di scope komponen atau file Anda)
	const formatRp = (val) => {
		if (!val) return '';
		const n = parseInt(String(val).replace(/\D/g, ''), 10);
		return isNaN(n) ? '' : n.toLocaleString('id-ID').replace(/,/g, '.');
	};

	return (
		<div className="custom-ticket-card">
			{/* Header */}
			<div
				className={`px-4 py-3 d-flex justify-content-between align-items-center ${open ? 'border-bottom' : ''}`}
				style={{
					cursor: 'pointer',
					transition: 'background-color 0.2s',
					borderColor: '#e2e8f0',
				}}
				onClick={() => setOpen(!open)}>
				<div className="d-flex align-items-center gap-3">
					<div className="custom-badge-number">{index + 1}</div>
					<span className="text-dark" style={{ fontSize: '16px', fontWeight: 400 }}>
						{ticket.name || 'Tiket baru'}
					</span>
				</div>

				<div className="d-flex align-items-center gap-3">
					{/* {canDelete && (
						<Button
							variant="link"
							className="p-0 text-muted d-flex align-items-center justify-content-center"
							style={{ width: '28px', height: '28px' }}
							onClick={(e) => {
								e.stopPropagation();
								onDelete();
							}}
							onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
							onMouseLeave={(e) => (e.currentTarget.style.color = '')}>
							<Trash2 size={18} strokeWidth={1.5} />
						</Button>
					)} */}
					{open ? (
						<ChevronUp size={20} className="text-muted" strokeWidth={1.5} />
					) : (
						<ChevronDown size={20} className="text-muted" strokeWidth={1.5} />
					)}
				</div>
			</div>

			{/* Body / Isi Form */}
			<Collapse in={open}>
				<div>
					<div className="p-4" style={{ paddingTop: '20px' }}>
						{/* Row 1: Nama Tiket */}
						{/* <Form.Group className="mb-4">
							<label className="custom-form-label">Nama Tiket</label>
							<Form.Control
								type="text"
								className="custom-soft-input"
								value={ticket.name}
								onChange={(e) => onChange({ name: e.target.value })}
								placeholder="Online"
							/>
						</Form.Group> */}

						{/* Row 2: Harga + Kapasitas */}
						<Row className="mb-4">
							{/* Kolom Harga */}
							<Col md={6} className="mb-3 mb-md-0">
								<div className="d-flex justify-content-between align-items-center mb-2">
									<label className="custom-form-label mb-0">Harga (Rp)</label>
									<Form.Check
										type="switch"
										id={`free-switch-${index}`}
										className="custom-soft-switch d-flex align-items-center"
										label="Gratis"
										checked={ticket.isFree}
										onChange={(e) => onChange({ isFree: e.target.checked })}
									/>
								</div>
								<div className="custom-unified-wrapper">
									<span className="custom-unified-prefix">Rp</span>
									<input
										type="text"
										value={ticket.isFree ? '' : formatRp(ticket.price)}
										disabled={ticket.isFree}
										onChange={(e) => {
											const raw = e.target.value.replace(/\D/g, '');
											onChange({ price: raw });
										}}
										placeholder={ticket.isFree ? '' : '75.000'}
									/>
								</div>
							</Col>

							{/* Kolom Kapasitas */}
							<Col md={6}>
								<div className="d-flex justify-content-between align-items-center mb-2">
									<label className="custom-form-label mb-0">Kapasitas</label>
									<Form.Check
										type="switch"
										id={`unlimited-switch-${index}`}
										className="custom-soft-switch d-flex align-items-center"
										label="Tak terbatas"
										checked={ticket.unlimited}
										onChange={(e) =>
											onChange({
												unlimited: e.target.checked,
												capacity: e.target.checked ? '' : ticket.capacity,
											})
										}
									/>
								</div>
								<div className="custom-unified-wrapper">
									<input
										type="number"
										min={1}
										value={ticket.capacity}
										disabled={ticket.unlimited}
										onChange={(e) => onChange({ capacity: e.target.value })}
										placeholder={ticket.unlimited ? '' : '500'}
									/>
									<span className="custom-unified-suffix">peserta</span>
								</div>
							</Col>
						</Row>

						{/* Row 3: Periode Penjualan */}
						<Row className="mb-4">
							<Col md={6} className="mb-3 mb-md-0">
								<Form.Group>
									<label className="custom-form-label">Mulai Penjualan</label>
									<Form.Control
										type="datetime-local"
										className="custom-soft-input"
										value={ticket.saleStart}
										onChange={(e) => onChange({ saleStart: e.target.value })}
										style={{ color: ticket.saleStart ? '#1e293b' : '#94a3b8' }}
									/>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group>
									<label className="custom-form-label">Akhir Penjualan</label>
									<Form.Control
										type="datetime-local"
										className="custom-soft-input"
										value={ticket.saleEnd}
										onChange={(e) => onChange({ saleEnd: e.target.value })}
										style={{ color: ticket.saleEnd ? '#1e293b' : '#94a3b8' }}
									/>
								</Form.Group>
							</Col>
						</Row>

						{/* Row 4: Deskripsi Tiket */}
						<Form.Group>
							<div className="d-flex justify-content-between align-items-center mb-2">
								<label className="custom-form-label mb-0">Deskripsi Tiket</label>
								<span className="text-muted" style={{ fontSize: '13px' }}>
									Opsional
								</span>
							</div>
							<Form.Control
								as="textarea"
								className="custom-soft-input"
								rows={2}
								value={ticket.description}
								onChange={(e) => onChange({ description: e.target.value })}
								placeholder="Keuntungan atau info tambahan untuk pemegang tiket ini..."
								style={{ resize: 'none', height: '80px' }}
							/>
						</Form.Group>
					</div>
				</div>
			</Collapse>
		</div>
	);
}

export default TicketCard;
