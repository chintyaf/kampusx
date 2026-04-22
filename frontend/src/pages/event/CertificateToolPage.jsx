import React, { useState, useRef, useCallback } from 'react';
import { Badge, Button } from 'react-bootstrap';
import {
	Type,
	Image as ImageIcon,
	Save,
	Download,
	GripVertical,
	Settings,
	Users,
	Move,
	Trash2,
	Bold,
	Italic,
	AlignLeft,
	AlignCenter,
	AlignRight,
	ChevronDown,
	Eye,
	Layers,
	RotateCcw,
	ZoomIn,
	ZoomOut,
	Lock,
	Unlock,
	Plus,
} from 'lucide-react';
import FormHeading from '../../components/dashboard/FormHeading';
import '../../assets/css/certificate-builder.css';

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const VARIABLES = [
	{ key: '{Nama_Peserta}', label: 'Nama Peserta', color: '#3b82f6' },
	{ key: '{Nama_Event}', label: 'Nama Event', color: '#8b5cf6' },
	{ key: '{Tanggal_Event}', label: 'Tanggal Event', color: '#10b981' },
	{ key: '{Penyelenggara}', label: 'Penyelenggara', color: '#f59e0b' },
	{ key: '{Nomor_Sertifikat}', label: 'Nomor Sertifikat', color: '#ef4444' },
];

const DEFAULT_ELEMENTS = [
	{
		id: 1,
		key: '{Nama_Peserta}',
		color: '#3b82f6',
		x: 200,
		y: 210,
		fontSize: 28,
		fontWeight: 'bold',
		align: 'center',
		locked: false,
	},
	{
		id: 2,
		key: '{Tanggal_Event}',
		color: '#10b981',
		x: 230,
		y: 310,
		fontSize: 14,
		fontWeight: 'normal',
		align: 'center',
		locked: false,
	},
];

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
let nextId = 10;
const uid = () => ++nextId;

/* ─── Sub-components ────────────────────────────────────────────────────────── */
const VarChip = ({ variable, onDragStart }) => (
	<div
		className="cert-var-chip"
		draggable
		onDragStart={(e) => {
			e.dataTransfer.setData('varKey', variable.key);
			e.dataTransfer.setData('varColor', variable.color);
		}}
		style={{ '--chip-color': variable.color }}>
		<span className="cert-var-chip__dot" />
		<code className="cert-var-chip__label">{variable.key}</code>
		<GripVertical size={13} className="cert-var-chip__grip" />
	</div>
);

const SectionLabel = ({ children }) => <p className="cert-panel-section-label">{children}</p>;

/* ─── Main ───────────────────────────────────────────────────────────────────── */
const CertificateToolPage = () => {
	const [elements, setElements] = useState(DEFAULT_ELEMENTS);
	const [selected, setSelected] = useState(null);
	const [bgImage, setBgImage] = useState(null);
	const [zoom, setZoom] = useState(100);
	const [draggingEl, setDraggingEl] = useState(null);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [previewMode, setPreviewMode] = useState(false);

	const canvasRef = useRef(null);
	const fileInputRef = useRef(null);

	/* ── Zoom ── */
	const handleZoom = (dir) => setZoom((z) => Math.min(150, Math.max(50, z + dir * 10)));

	/* ── BG Upload ── */
	const handleBgUpload = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = URL.createObjectURL(file);
		setBgImage(url);
	};

	/* ── Drop var from sidebar ── */
	const handleCanvasDrop = useCallback(
		(e) => {
			e.preventDefault();
			const varKey = e.dataTransfer.getData('varKey');
			const varColor = e.dataTransfer.getData('varColor');
			if (!varKey || !canvasRef.current) return;
			const rect = canvasRef.current.getBoundingClientRect();
			const scale = zoom / 100;
			const x = (e.clientX - rect.left) / scale - 80;
			const y = (e.clientY - rect.top) / scale - 18;
			const newEl = {
				id: uid(),
				key: varKey,
				color: varColor,
				x: Math.max(0, x),
				y: Math.max(0, y),
				fontSize: 18,
				fontWeight: 'normal',
				align: 'center',
				locked: false,
			};
			setElements((prev) => [...prev, newEl]);
			setSelected(newEl.id);
		},
		[zoom],
	);

	/* ── Element drag on canvas ── */
	const handleElMouseDown = (e, el) => {
		if (el.locked) return;
		e.stopPropagation();
		setSelected(el.id);
		const rect = canvasRef.current.getBoundingClientRect();
		const scale = zoom / 100;
		setDraggingEl(el.id);
		setDragOffset({
			x: e.clientX / scale - el.x,
			y: e.clientY / scale - el.y,
		});
	};

	const handleMouseMove = useCallback(
		(e) => {
			if (!draggingEl) return;
			const scale = zoom / 100;
			setElements((prev) =>
				prev.map((el) =>
					el.id === draggingEl
						? {
								...el,
								x: e.clientX / scale - dragOffset.x,
								y: e.clientY / scale - dragOffset.y,
							}
						: el,
				),
			);
		},
		[draggingEl, dragOffset, zoom],
	);

	const handleMouseUp = useCallback(() => setDraggingEl(null), []);

	/* ── Delete selected ── */
	const handleDelete = () => {
		setElements((prev) => prev.filter((el) => el.id !== selected));
		setSelected(null);
	};

	/* ── Update selected element prop ── */
	const updateEl = (prop, value) => {
		setElements((prev) =>
			prev.map((el) => (el.id === selected ? { ...el, [prop]: value } : el)),
		);
	};

	const selectedEl = elements.find((el) => el.id === selected);

	/* ── Preview sample data ── */
	const PREVIEW_DATA = {
		'{Nama_Peserta}': 'Budi Santoso',
		'{Nama_Event}': 'Seminar Nasional AI 2025',
		'{Tanggal_Event}': '21 April 2025',
		'{Penyelenggara}': 'Universitas Bandung',
		'{Nomor_Sertifikat}': 'CERT-2025-0042',
	};

	return (
		<div className="cert-page">
			<FormHeading
				heading="Certificate Builder"
				subheading="Desain template e-sertifikat dengan seret variabel dinamis ke kanvas."
			/>

			<div className="cert-layout">
				{/* ── LEFT PANEL ────────────────────────────────────────── */}
				<aside className="cert-panel cert-panel--left">
					{/* Background */}
					<div className="cert-panel-section">
						<SectionLabel>Template Background</SectionLabel>
						<div
							className="cert-upload-zone"
							onClick={() => fileInputRef.current?.click()}>
							{bgImage ? (
								<img
									src={bgImage}
									alt="bg preview"
									className="cert-upload-zone__preview"
								/>
							) : (
								<>
									<ImageIcon size={22} strokeWidth={1.5} />
									<span>Klik atau seret gambar</span>
									<span className="cert-upload-zone__hint">
										PNG, JPG · Disarankan 1400×990px
									</span>
								</>
							)}
						</div>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							className="d-none"
							onChange={handleBgUpload}
						/>
						{bgImage && (
							<button
								className="cert-btn cert-btn--ghost cert-btn--sm mt-2 w-100"
								onClick={() => setBgImage(null)}>
								<RotateCcw size={12} /> Ganti background
							</button>
						)}
					</div>

					<div className="cert-divider" />

					{/* Variables */}
					<div className="cert-panel-section">
						<SectionLabel>Variabel Dinamis</SectionLabel>
						<p className="cert-hint">
							Seret variabel ke kanvas untuk menempatkan teks otomatis.
						</p>
						<div className="cert-var-list">
							{VARIABLES.map((v) => (
								<VarChip key={v.key} variable={v} />
							))}
						</div>
					</div>

					<div className="cert-divider" />

					{/* Layers */}
					<div className="cert-panel-section">
						<SectionLabel>Layer ({elements.length})</SectionLabel>
						<div className="cert-layer-list">
							{[...elements].reverse().map((el) => (
								<div
									key={el.id}
									className={`cert-layer-item${selected === el.id ? ' cert-layer-item--active' : ''}`}
									onClick={() => setSelected(el.id)}>
									<span
										className="cert-layer-dot"
										style={{ background: el.color }}
									/>
									<code className="cert-layer-label">{el.key}</code>
									<button
										className="cert-layer-lock"
										onClick={(e) => {
											e.stopPropagation();
											updateEl('locked', !el.locked);
										}}
										title={el.locked ? 'Buka kunci' : 'Kunci posisi'}>
										{el.locked ? <Lock size={11} /> : <Unlock size={11} />}
									</button>
								</div>
							))}
						</div>
					</div>
				</aside>

				{/* ── CANVAS AREA ───────────────────────────────────────── */}
				<main className="cert-workspace">
					{/* Toolbar */}
					<div className="cert-toolbar">
						<div className="d-flex align-items-center gap-2">
							<button
								className="cert-btn cert-btn--ghost cert-btn--sm"
								onClick={() => handleZoom(-1)}>
								<ZoomOut size={14} />
							</button>
							<span className="cert-zoom-label">{zoom}%</span>
							<button
								className="cert-btn cert-btn--ghost cert-btn--sm"
								onClick={() => handleZoom(1)}>
								<ZoomIn size={14} />
							</button>
						</div>

						<div className="d-flex align-items-center gap-2">
							<span className="cert-canvas-meta">1400 × 990 px</span>
							<div className="cert-toolbar-divider" />
							<button
								className={`cert-btn cert-btn--ghost cert-btn--sm${previewMode ? ' cert-btn--active' : ''}`}
								onClick={() => setPreviewMode((v) => !v)}>
								<Eye size={14} /> {previewMode ? 'Edit' : 'Preview'}
							</button>
							<button className="cert-btn cert-btn--ghost cert-btn--sm">
								<Download size={14} /> Ekspor
							</button>
							<button className="cert-btn cert-btn--primary cert-btn--sm">
								<Save size={14} /> Simpan Template
							</button>
						</div>
					</div>

					{/* Canvas */}
					<div className="cert-canvas-outer">
						<div
							className="cert-canvas-scroll"
							onMouseMove={handleMouseMove}
							onMouseUp={handleMouseUp}>
							<div
								ref={canvasRef}
								className="cert-canvas"
								style={{
									transform: `scale(${zoom / 100})`,
									transformOrigin: 'top center',
									backgroundImage: bgImage ? `url(${bgImage})` : undefined,
									cursor: draggingEl ? 'grabbing' : 'default',
								}}
								onClick={() => setSelected(null)}
								onDragOver={(e) => e.preventDefault()}
								onDrop={handleCanvasDrop}>
								{/* Default canvas message when no background */}
								{!bgImage && (
									<div className="cert-canvas-empty">
										<ImageIcon size={32} strokeWidth={1} />
										<p>Upload background sertifikat</p>
										<p className="cert-canvas-empty__sub">
											atau seret variabel untuk mulai tanpa background
										</p>
									</div>
								)}

								{/* Grid overlay */}
								{!previewMode && <div className="cert-grid-overlay" />}

								{/* Elements */}
								{elements.map((el) => (
									<div
										key={el.id}
										className={`cert-element${selected === el.id ? ' cert-element--selected' : ''}${el.locked ? ' cert-element--locked' : ''}`}
										style={{
											left: el.x,
											top: el.y,
											fontSize: el.fontSize,
											fontWeight: el.fontWeight,
											color: previewMode ? '#1a1a1a' : el.color,
											textAlign: el.align,
											cursor: el.locked ? 'not-allowed' : 'grab',
										}}
										onMouseDown={(e) => handleElMouseDown(e, el)}>
										{previewMode ? (PREVIEW_DATA[el.key] ?? el.key) : el.key}
										{selected === el.id && !previewMode && (
											<div className="cert-element-handles">
												<div className="cert-element-handle cert-element-handle--tl" />
												<div className="cert-element-handle cert-element-handle--tr" />
												<div className="cert-element-handle cert-element-handle--bl" />
												<div className="cert-element-handle cert-element-handle--br" />
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					</div>
				</main>

				{/* ── RIGHT PANEL ───────────────────────────────────────── */}
				<aside className="cert-panel cert-panel--right">
					{selectedEl ? (
						<>
							<div className="cert-panel-section">
								<SectionLabel>Elemen Terpilih</SectionLabel>
								<div
									className="cert-selected-chip"
									style={{ '--chip-color': selectedEl.color }}>
									<span className="cert-var-chip__dot" />
									<code>{selectedEl.key}</code>
								</div>
							</div>

							<div className="cert-divider" />

							<div className="cert-panel-section">
								<SectionLabel>Tipografi</SectionLabel>

								<div className="cert-prop-row">
									<label>Ukuran Font</label>
									<div className="cert-number-input">
										<button
											onClick={() =>
												updateEl(
													'fontSize',
													Math.max(8, selectedEl.fontSize - 1),
												)
											}>
											−
										</button>
										<span>{selectedEl.fontSize}px</span>
										<button
											onClick={() =>
												updateEl(
													'fontSize',
													Math.min(80, selectedEl.fontSize + 1),
												)
											}>
											+
										</button>
									</div>
								</div>

								<div className="cert-prop-row">
									<label>Tebal</label>
									<div className="cert-toggle-group">
										<button
											className={
												selectedEl.fontWeight === 'bold' ? 'active' : ''
											}
											onClick={() =>
												updateEl(
													'fontWeight',
													selectedEl.fontWeight === 'bold'
														? 'normal'
														: 'bold',
												)
											}>
											<Bold size={13} />
										</button>
									</div>
								</div>

								<div className="cert-prop-row">
									<label>Alignment</label>
									<div className="cert-toggle-group">
										{['left', 'center', 'right'].map((a) => (
											<button
												key={a}
												className={selectedEl.align === a ? 'active' : ''}
												onClick={() => updateEl('align', a)}>
												{a === 'left' && <AlignLeft size={13} />}
												{a === 'center' && <AlignCenter size={13} />}
												{a === 'right' && <AlignRight size={13} />}
											</button>
										))}
									</div>
								</div>
							</div>

							<div className="cert-divider" />

							<div className="cert-panel-section">
								<SectionLabel>Posisi</SectionLabel>
								<div className="cert-prop-row">
									<label>X</label>
									<div className="cert-pos-input">
										<input
											type="number"
											value={Math.round(selectedEl.x)}
											onChange={(e) => updateEl('x', Number(e.target.value))}
										/>
										<span>px</span>
									</div>
								</div>
								<div className="cert-prop-row">
									<label>Y</label>
									<div className="cert-pos-input">
										<input
											type="number"
											value={Math.round(selectedEl.y)}
											onChange={(e) => updateEl('y', Number(e.target.value))}
										/>
										<span>px</span>
									</div>
								</div>
							</div>

							<div className="cert-divider" />

							<div className="cert-panel-section">
								<button
									className="cert-btn cert-btn--danger cert-btn--sm w-100"
									onClick={handleDelete}>
									<Trash2 size={13} /> Hapus Elemen
								</button>
							</div>
						</>
					) : (
						<div className="cert-panel-empty">
							<Layers size={28} strokeWidth={1.2} />
							<p>Pilih elemen di kanvas untuk mengedit propertinya.</p>
						</div>
					)}
				</aside>
			</div>
		</div>
	);
};

export default CertificateToolPage;
