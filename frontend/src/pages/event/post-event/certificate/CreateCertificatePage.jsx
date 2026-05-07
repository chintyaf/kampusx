import React, { useState } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import {
	Upload,
	Users,
	Hash,
	QrCode,
	Calendar,
	BookOpen,
	Move,
	Plus,
	Trash2,
	Eye,
	Send,
	Award,
	Info,
	Save,
} from 'lucide-react';

// Import komponen UI internal (Sesuaikan path-nya)
import { SectionCard, InfoBox } from '@/components/UI';
import FormHeading from '@/components/dashboard/FormHeading';
import { useDraggable } from '@/utils/useDraggable';

const ICON_MAP = { Users, Hash, QrCode, Calendar, BookOpen };

const FIELD_TEMPLATES = [
	{ id: 'name', label: 'Nama Peserta', icon: 'Users', desc: 'Nama lengkap' },
	{ id: 'certid', label: 'ID Sertifikat', icon: 'Hash', desc: 'Nomor unik' },
	{ id: 'qr', label: 'QR Code', icon: 'QrCode', desc: 'Verifikasi sistem' },
];

const CreateCertificatePage = () => {
	const [templateImage, setTemplateImage] = useState(null);
	const [dragOver, setDragOver] = useState(false);
	const [hoveredPalette, setHoveredPalette] = useState(null);

	const {
		fields,
		selected,
		setSelected,
		canvasRef,
		onMouseDown,
		onMouseMove,
		onMouseUp,
		addField,
		removeField,
	} = useDraggable([]);

	const handleUpload = (e) => {
		const file = e.target.files ? e.target.files[0] : null;
		if (file) {
			setTemplateImage(URL.createObjectURL(file));
		}
	};

	const handleAddField = (tpl) => {
		const exists = fields.find((f) => f.id === tpl.id);
		if (exists) return;
		addField({ ...tpl, x: 50, y: 50 }); // Default di tengah canvas
	};

	return (
		<div className="d-flex flex-column gap-0">
			<FormHeading
				heading="Certificate Template Editor"
				subheading="Upload template dan atur posisi field dinamis secara presisi"
			/>

			<Row className="g-3 mb-4 mt-2">
				{/* 1. Upload Section */}
				<Col md={6}>
					<SectionCard
						title="Upload Template"
						subtitle="Format: PNG, JPG (Rekomendasi A4)"
						icon={Upload}
						iconBg="blue">
						{!templateImage ? (
							<div
								className="d-flex flex-column align-items-center justify-content-center transition-all"
								onDragOver={(e) => {
									e.preventDefault();
									setDragOver(true);
								}}
								onDragLeave={() => setDragOver(false)}
								onDrop={(e) => {
									e.preventDefault();
									setDragOver(false);
									const file = e.dataTransfer.files[0];
									if (file) setTemplateImage(URL.createObjectURL(file));
								}}
								style={{
									border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
									borderRadius: 'var(--radius)',
									padding: '36px 20px',
									backgroundColor: dragOver
										? 'var(--info-bg)'
										: 'var(--neutral-bg)',
									cursor: 'pointer',
									gap: '8px',
								}}>
								<Form.Control
									type="file"
									id="upload-cert"
									className="d-none"
									onChange={handleUpload}
									accept="image/*"
								/>
								<label
									htmlFor="upload-cert"
									className="w-100 text-center m-0"
									style={{ cursor: 'pointer' }}>
									<Upload size={36} color="var(--primary)" className="mb-2" />
									<div
										style={{
											fontSize: '14px',
											fontWeight: 600,
											color: 'var(--text)',
										}}>
										Drag & drop template di sini
									</div>
									<div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
										atau klik untuk memilih file
									</div>
									<div className="d-flex justify-content-center gap-2 mt-2">
										{['PNG', 'JPG', 'PDF'].map((f) => (
											<span
												key={f}
												className="fw-semibold rounded"
												style={{
													backgroundColor: 'var(--card)',
													color: 'var(--text-muted)',
													fontSize: '10px',
													padding: '3px 8px',
													border: '1px solid var(--border)',
												}}>
												{f}
											</span>
										))}
									</div>
								</label>
							</div>
						) : (
							<div
								className="d-flex align-items-center gap-3 p-3 rounded"
								style={{ backgroundColor: 'var(--neutral-bg)' }}>
								<div
									className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
									style={{
										width: '42px',
										height: '42px',
										backgroundColor: 'var(--info-bg)',
									}}>
									<Award size={22} color="var(--primary)" />
								</div>
								<div className="flex-grow-1">
									<div
										style={{
											fontSize: '13px',
											fontWeight: 600,
											color: 'var(--text)',
										}}>
										template_sertifikat_uploaded.png
									</div>
									<div
										style={{
											fontSize: '11px',
											color: 'var(--text-muted)',
											marginTop: '1px',
										}}>
										Template aktif di canvas
									</div>
								</div>
								<Button
									variant="link"
									className="p-2 d-flex align-items-center justify-content-center rounded"
									style={{ backgroundColor: 'var(--danger-bg)', border: 'none' }}
									onClick={() => setTemplateImage(null)}>
									<Trash2 size={15} color="var(--danger-text)" />
								</Button>
							</div>
						)}
					</SectionCard>
				</Col>

				{/* 2. Field Palette Section */}
				<Col md={6}>
					<SectionCard
						title="Elemen Dinamis"
						subtitle="Klik elemen untuk menambah ke canvas"
						icon={Move}
						iconBg="blue"
						actions={
							<Button
								size="sm"
								style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
								<Plus size={13} className="me-1" /> Kustom
							</Button>
						}>
						<div
							className="d-flex flex-column"
							style={{ gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
							{FIELD_TEMPLATES.map((tpl) => {
								const Ico = ICON_MAP[tpl.icon];
								const isAdded = fields.some((f) => f.id === tpl.id);
								const isHovered = hoveredPalette === tpl.id;

								return (
									<button
										key={tpl.id}
										className="d-flex align-items-center w-100 text-start transition-all border-0 m-0"
										onMouseEnter={() => setHoveredPalette(tpl.id)}
										onMouseLeave={() => setHoveredPalette(null)}
										onClick={() => handleAddField(tpl)}
										style={{
											gap: '10px',
											padding: '10px 14px',
											borderRadius: 'var(--radius-sm)',
											backgroundColor: isAdded
												? 'var(--success-bg)'
												: isHovered
													? 'var(--info-bg)'
													: 'var(--neutral-bg)',
											border: `1.5px dashed ${isAdded ? 'var(--success-text)' : isHovered ? 'var(--primary)' : 'var(--border)'}`,
											color: 'var(--text)',
										}}>
										<div
											className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
											style={{
												width: '30px',
												height: '30px',
												backgroundColor: isAdded
													? 'transparent'
													: 'var(--card)',
												color: isAdded
													? 'var(--success-text)'
													: 'var(--text-muted)',
											}}>
											{Ico && <Ico size={15} />}
										</div>
										<div
											className="d-flex flex-column flex-grow-1"
											style={{ gap: '1px' }}>
											<span
												style={{
													fontSize: '12.5px',
													fontWeight: 600,
													color: 'var(--text)',
												}}>{`{ ${tpl.label} }`}</span>
											<span
												style={{
													fontSize: '11px',
													color: 'var(--text-muted)',
												}}>
												{tpl.desc}
											</span>
										</div>
										{isAdded ? (
											<span
												className="fw-bold"
												style={{
													fontSize: '10px',
													padding: '3px 8px',
													borderRadius: '20px',
													backgroundColor: 'var(--success-bg)',
													color: 'var(--success-text)',
													whiteSpace: 'nowrap',
												}}>
												Aktif
											</span>
										) : (
											<span
												className="fw-bold"
												style={{
													fontSize: '10px',
													padding: '3px 8px',
													borderRadius: '20px',
													backgroundColor: 'var(--card)',
													color: 'var(--text-muted)',
													whiteSpace: 'nowrap',
												}}>
												+
											</span>
										)}
									</button>
								);
							})}
						</div>
					</SectionCard>
				</Col>
			</Row>

			{/* 3. Main Canvas Section */}
			<SectionCard
				title="Canvas Editor"
				subtitle="Atur posisi field dengan cara klik dan seret"
				icon={Eye}
				iconBg="blue"
				actions={
					<div className="d-flex gap-2">
						<Button
							variant="outline-secondary"
							size="sm"
							className="d-flex align-items-center gap-1">
							<Eye size={13} /> Preview
						</Button>
						<Button
							size="sm"
							className="d-flex align-items-center gap-1"
							style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
							<Save size={13} /> Simpan Template
						</Button>
					</div>
				}>
				<div
					className="d-flex align-items-center justify-content-center position-relative overflow-hidden user-select-none"
					ref={canvasRef}
					onMouseMove={onMouseMove}
					onMouseUp={onMouseUp}
					onMouseLeave={onMouseUp}
					style={{
						backgroundColor: 'var(--neutral-bg)',
						border: '1px solid var(--border)',
						borderRadius: 'var(--radius)',
						height: '400px',
						marginBottom: '14px',
						cursor: 'default',
					}}>
					{templateImage ? (
						<div
							className="position-relative shadow-lg bg-white"
							style={{ maxWidth: '90%', maxHeight: '90%' }}>
							<img
								src={templateImage}
								alt="Template"
								className="img-fluid"
								style={{
									display: 'block',
									maxHeight: '100%',
									objectFit: 'contain',
									pointerEvents: 'none',
								}}
							/>

							{/* Draggable fields Layer */}
							{fields.map((f) => {
								const Ico = ICON_MAP[f.icon];
								const isSelected = selected === f.id;
								return (
									<div
										key={f.id}
										onMouseDown={(e) => onMouseDown(e, f.id)}
										onClick={() => setSelected(f.id)}
										style={{
											position: 'absolute',
											left: `${f.x}%`,
											top: `${f.y}%`,
											transform: 'translate(-50%, -50%)',
											backgroundColor: isSelected
												? 'var(--info-bg)'
												: 'rgba(223, 243, 255, 0.85)', // var(--bahama-blue-100) with opacity
											border: `${isSelected ? '2px solid' : '1.5px dashed'} var(--primary)`,
											borderRadius: '6px',
											padding: '4px 10px 4px 8px',
											fontSize: '11px',
											fontWeight: 700,
											color: 'var(--primary)',
											cursor: 'move',
											display: 'flex',
											alignItems: 'center',
											gap: '5px',
											whiteSpace: 'nowrap',
											zIndex: 10,
											boxShadow: isSelected
												? '0 0 0 3px var(--border-md)'
												: 'none',
											backdropFilter: 'blur(4px)',
											transition: 'box-shadow 0.15s, background 0.15s',
										}}>
										{Ico && <Ico size={11} />}
										<span>{`{ ${f.label} }`}</span>
										{isSelected && (
											<button
												onMouseDown={(e) => e.stopPropagation()}
												onClick={(e) => {
													e.stopPropagation();
													removeField(f.id);
												}}
												className="d-flex align-items-center justify-content-center p-0 m-0 ms-1 rounded-circle"
												style={{
													width: '16px',
													height: '16px',
													backgroundColor: 'var(--danger-bg)',
													border: 'none',
													color: 'var(--danger-text)',
													cursor: 'pointer',
												}}>
												<Trash2 size={10} />
											</button>
										)}
									</div>
								);
							})}
						</div>
					) : (
						<div
							className="text-center"
							style={{ opacity: 0.5, color: 'var(--text-muted)' }}>
							<Upload size={48} className="mb-2" />
							<p className="m-0 fw-medium">
								Upload template untuk mengaktifkan canvas
							</p>
						</div>
					)}
				</div>

				<InfoBox icon={Info} iconColor="var(--primary)" variant="blue" className="mt-3">
					Gunakan template dengan resolusi tinggi (min. 1920px lebar) untuk hasil cetak
					sertifikat yang tajam.
				</InfoBox>
			</SectionCard>
		</div>
	);
};

export default CreateCertificatePage;
