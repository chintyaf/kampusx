import React from 'react';
import { Button, Form, Card } from 'react-bootstrap';
import { Trash2, X } from 'lucide-react';
import { FIELDS, FONT_SIZES, COLORS } from './constants';

const SidebarEdit = ({ selectedEl, updateEl, deleteEl, clearSelection }) => {
	return (
		<div className="bg-white px-3 rounded-4 border cert-sidebar">
			<div className="p-3 border-bottom d-flex align-items-center justify-content-between">
				<h6 className="mb-0 fw-bold">Edit Elemen</h6>
				<Button
					variant="link"
					className="text-muted p-0 text-decoration-none"
					onClick={clearSelection}>
					<X size={18} />
				</Button>
			</div>

			<div className="p-3 flex-grow-1 overflow-auto sidebar-scrollable">
				<Card className="bg-primary bg-opacity-10 border-primary-subtle mb-4 shadow-none">
					<Card.Body className="p-2">
						<p className="mb-0 fw-bold text-primary fs-6">{selectedEl.label}</p>
						<small className="text-primary opacity-75">
							{FIELDS.find((f) => f.id === selectedEl.fieldId)?.example}
						</small>
					</Card.Body>
				</Card>

				{selectedEl.fieldId !== 'f3' && (
					<>
						<div className="mb-3">
							<label
								className="text-muted text-uppercase fw-bold small mb-2"
								style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>
								Ukuran Font
							</label>
							<div className="d-flex flex-wrap gap-1">
								{FONT_SIZES.map((sz) => (
									<Button
										key={sz}
										variant={
											selectedEl.fontSize === sz
												? 'dark'
												: 'outline-secondary'
										}
										size="sm"
										className="flex-grow-1 py-1 px-2"
										onClick={() => updateEl(selectedEl.id, { fontSize: sz })}>
										{sz}
									</Button>
								))}
							</div>
						</div>

						<div className="mb-3">
							<label
								className="text-muted text-uppercase fw-bold small mb-2"
								style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>
								Gaya Teks
							</label>
							<Button
								variant={selectedEl.bold ? 'dark' : 'outline-secondary'}
								size="sm"
								className="w-100 fw-bold py-2"
								onClick={() => updateEl(selectedEl.id, { bold: !selectedEl.bold })}>
								B Bold
							</Button>
						</div>

						<div className="mb-4">
							<label
								className="text-muted text-uppercase fw-bold small mb-2"
								style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>
								Warna
							</label>
							<div className="d-flex flex-wrap gap-2">
								{COLORS.map((c) => (
									<div
										key={c}
										className={`color-swatch rounded-circle border ${selectedEl.color === c ? 'border-primary border-3' : 'border-secondary'}`}
										style={{ backgroundColor: c, cursor: 'pointer' }}
										onClick={() => updateEl(selectedEl.id, { color: c })}
									/>
								))}
							</div>
						</div>
					</>
				)}

				<div className="mb-4">
					<label
						className="text-muted text-uppercase fw-bold small mb-2"
						style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>
						Posisi (%)
					</label>
					<div className="d-flex gap-2">
						<Form.Group className="flex-grow-1">
							<Form.Label className="text-muted small mb-1">Horizontal</Form.Label>
							<Form.Control
								type="number"
								min={0}
								max={100}
								value={Math.round(selectedEl.x)}
								onChange={(e) =>
									updateEl(selectedEl.id, { x: Number(e.target.value) })
								}
							/>
						</Form.Group>
						<Form.Group className="flex-grow-1">
							<Form.Label className="text-muted small mb-1">Vertikal</Form.Label>
							<Form.Control
								type="number"
								min={0}
								max={100}
								value={Math.round(selectedEl.y)}
								onChange={(e) =>
									updateEl(selectedEl.id, { y: Number(e.target.value) })
								}
							/>
						</Form.Group>
					</div>
				</div>

				<Button
					variant="outline-danger"
					className="w-100 d-flex align-items-center justify-content-center gap-2 py-2"
					onClick={() => deleteEl(selectedEl.id)}>
					<Trash2 size={16} /> Hapus Elemen
				</Button>
			</div>
		</div>
	);
};

export default SidebarEdit;
