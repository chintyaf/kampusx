import { Card, Badge, Button, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { Trash2, Users } from 'lucide-react';

export default function TierRow({ tier, isOnline, onUpdate, onDelete, canDelete }) {
	const isFree = tier.is_free;

	return (
		<Card
			className="mb-3"
			style={{
				border: '1.5px solid #dee2e6',
				borderRadius: 7,
			}}>
			<Card.Body className="p-3">
				{/* Header Row */}
				{/* <div className="d-flex align-items-center justify-content-between mb-3">
					<div className="d-flex align-items-center gap-2">
						<h6 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
							{tier.name || 'Nama Tiket'}
						</h6>
						<Badge
							bg={isOnline ? 'success' : 'danger'}
							style={{ fontSize: 10, fontWeight: 500, borderRadius: 20 }}>
							{isOnline ? 'Online' : 'Offline'}
						</Badge>
						{isFree && (
							<Badge
								bg="primary"
								style={{ fontSize: 10, fontWeight: 500, borderRadius: 20 }}>
								Gratis
							</Badge>
						)}
					</div>
					<Button
						variant="link"
						size="sm"
						disabled={!canDelete}
						onClick={() => onDelete(tier.id)}
						style={{ color: canDelete ? '#e53935' : '#ccc', padding: 4 }}>
						<Trash2 size={15} />
					</Button>
				</div> */}

				{/* Name */}
				<Col xs={12} sm={12} lg={12} className='mb-3'>
					<Form.Label className="form-label">
						Nama Tiket <span className="text-danger">*</span>
					</Form.Label>
					<Form.Control
						size="sm"
						value={tier.name}
						placeholder='Misal: "Early Bird", "VIP"'
						onChange={(e) => onUpdate(tier.id, { name: e.target.value })}
					/>
				</Col>

				{/* Fields */}
				<Row className="g-3">
					{/* Price & Free Toggle */}
					<Col xs={12} sm={6} lg={6} className='mb-3'>
						<div className="d-flex justify-content-between align-items-end mb-1">
							<Form.Label className="form-label">Harga (Rp)</Form.Label>
							<Form.Check
								type="switch"
								id={`free-switch-${tier.id}`}
								label="Gratis?"
								checked={isFree}
								onChange={(e) => {
									const val = e.target.checked;
									onUpdate(tier.id, {
										is_free: val,
										price: val ? 0 : tier.price,
									});
								}}
							/>
						</div>
						<InputGroup size="sm">
							<InputGroup.Text>Rp</InputGroup.Text>
							<Form.Control
								type="number"
								min={0}
								step={5000}
								value={tier.price}
								disabled={isFree}
								onChange={(e) =>
									onUpdate(tier.id, { price: Number(e.target.value) })
								}
							/>
						</InputGroup>
					</Col>

					{/* Capacity */}
					<Col xs={12} sm={6} lg={6}>
						<Form.Label className="form-label">Kapasitas (Kuota)</Form.Label>
						<InputGroup size="sm">
							<Form.Control
								type="number"
								min={1}
								step={10}
								value={tier.capacity}
								onChange={(e) =>
									onUpdate(tier.id, { capacity: Number(e.target.value) })
								}
							/>
							<InputGroup.Text>
								<Users size={11} className="me-1" />
								peserta
							</InputGroup.Text>
						</InputGroup>
					</Col>

					{/* Sale Start */}
					<Col xs={12} sm={6}>
						<Form.Label className="form-label">Mulai Penjualan</Form.Label>
						<Form.Control
							type="datetime-local"
							size="sm"
							value={tier.sale_start || ''}
							onChange={(e) => onUpdate(tier.id, { sale_start: e.target.value })}
						/>
					</Col>

					{/* Sale End */}
					<Col xs={12} sm={6}>
						<Form.Label className="form-label">Akhir Penjualan</Form.Label>
						<Form.Control
							type="datetime-local"
							size="sm"
							value={tier.sale_end || ''}
							onChange={(e) => onUpdate(tier.id, { sale_end: e.target.value })}
						/>
					</Col>
				</Row>
			</Card.Body>
		</Card>
	);
}
