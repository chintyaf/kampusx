import React from 'react';
import { Button } from 'react-bootstrap';
import { Check, Plus, GripVertical, X } from 'lucide-react';
import { FIELDS } from './constants';

const SidebarList = ({ elements, addField, deleteEl, setSelectedId }) => {
	const isAdded = (fid) => elements.some((e) => e.fieldId === fid);

	return (
		<div className="bg-white px-3 rounded-4 border cert-sidebar">
			{/* ── Elemen Dinamis ── */}
			<div className="p-3 border-bottom">
				<label
					className="text-muted text-uppercase fw-bold small mb-3"
					style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>
					Elemen Dinamis
				</label>
				<div className="d-flex flex-column gap-1">
					{FIELDS.map((field) => {
						const added = isAdded(field.id);
						return (
							<div
								key={field.id}
								onClick={() => !added && addField(field)}
								className={`d-flex align-items-center gap-3 p-2 rounded-3 dynamic-element-item ${added ? 'added-item' : 'cursor-pointer'}`}>
								<div
									className={`p-2 rounded bg-white border d-flex align-items-center justify-content-center ${added ? 'text-primary border-primary-subtle' : 'text-muted'}`}>
									{field.icon}
								</div>
								<span
									className={`flex-grow-1 fs-6 ${added ? 'text-dark' : 'text-body'}`}>
									{field.label}
								</span>
								{added ? (
									<Check size={16} className="text-primary" />
								) : (
									<Plus size={16} className="text-muted" />
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* ── Di Canvas ── */}
			<div className="p-3 flex-grow-1 overflow-auto sidebar-scrollable">
				{elements.length > 0 ? (
					<>
						<label
							className="text-muted text-uppercase fw-bold small mb-3 ps-1"
							style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>
							Di Canvas
						</label>
						<div className="d-flex flex-column gap-1">
							{elements.map((el) => {
								const field = FIELDS.find((f) => f.id === el.fieldId);
								return (
									<div
										key={el.id}
										onClick={() => setSelectedId(el.id)}
										className="d-flex align-items-center gap-2 p-2 rounded-2 cursor-pointer on-canvas-item">
										<GripVertical size={14} className="text-muted" />
										<div className="p-1 rounded bg-light border d-flex align-items-center justify-content-center text-secondary">
											{field?.icon}
										</div>
										<span className="flex-grow-1 fs-6 text-dark text-truncate">
											{field?.label}
										</span>
										<Button
											variant="link"
											className="text-muted p-0 text-decoration-none d-flex"
											onClick={(e) => {
												e.stopPropagation();
												deleteEl(el.id);
											}}>
											<X size={14} />
										</Button>
									</div>
								);
							})}
						</div>
					</>
				) : (
					<div className="text-center py-4 px-2">
						<p className="text-muted small">
							Tambahkan elemen di atas lalu klik untuk mengedit posisi & gayanya.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default SidebarList;
