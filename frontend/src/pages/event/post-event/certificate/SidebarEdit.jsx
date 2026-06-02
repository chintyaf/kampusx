import React from 'react';
import { Button, Form, Card, InputGroup } from 'react-bootstrap';
import { Trash2, X } from 'lucide-react';
import { FIELDS, FONT_SIZES, COLORS, FONTS } from './constants';

// ==========================================
// 1. KOMPONEN HELPER: Label Section
// ==========================================
// Mencegah penulisan class dan inline-style berulang pada setiap label
const SectionLabel = ({ children, rightContent }) => (
	<label
		className="text-muted text-uppercase fw-bold small mb-2 d-flex justify-content-between w-100"
		style={{ letterSpacing: '1px', fontSize: '0.7rem' }}
	>
		<span>{children}</span>
		{rightContent && <span className="text-primary fw-bold">{rightContent}</span>}
	</label>
);

// ==========================================
// 2. KOMPONEN UTAMA
// ==========================================
const SidebarEdit = ({ selectedEl, updateEl, deleteEl, clearSelection }) => {
	const isQr = selectedEl.fieldId === 'f3';

	// Helper function agar penulisan update lebih singkat
	const handleChange = (key, value) => {
		updateEl(selectedEl.id, { [key]: value });
	};

	// --- BLOK RENDER: KHUSUS QR CODE ---
	const renderQRControls = () => (
		<div className="mb-3">
			<SectionLabel rightContent={`${selectedEl.fontSize || 80}px`}>
				Ukuran QR Code
			</SectionLabel>
			<Form.Range
				min={200}
				max={1000}
				value={selectedEl.fontSize || 80}
				onChange={(e) => handleChange('fontSize', Number(e.target.value))}
			/>
		</div>
	);

	// --- BLOK RENDER: KHUSUS TEKS ---
	const renderTextControls = () => (
		<>
			{selectedEl.fieldId === 'f7' && (
				<div className="mb-3">
					<SectionLabel>Teks Kustom</SectionLabel>
					<Form.Control
						type="text"
						size="sm"
						placeholder="Masukkan teks kustom..."
						value={selectedEl.label !== '{ Kustom }' ? selectedEl.label : ''}
						onChange={(e) => handleChange('label', e.target.value || 'Teks Kustom')}
						className="py-2"
					/>
				</div>
			)}
			<div className="mb-3">
				<SectionLabel>Jenis Font</SectionLabel>
				<Form.Select
					size="sm"
					className="py-2"
					value={selectedEl.fontFamily || 'Arial'}
					onChange={(e) => handleChange('fontFamily', e.target.value)}
				>
					{FONTS.map((font) => (
						<option
							key={font.name}
							value={font.name}
							style={{ fontFamily: font.family }}
						>
							{font.name}
						</option>
					))}
				</Form.Select>
			</div>

			<div className="mb-3">
				<SectionLabel>Ukuran Font</SectionLabel>

				<InputGroup size="sm">
					<Form.Control
						type="number"
						list="font-sizes-datalist" // 1. Hubungkan input dengan ID datalist
						min={0}
						max={300}
						value={selectedEl.fontSize || ''}
						onChange={(e) => {
							const val = Number(e.target.value);
							if (val >= 0 && val <= 300) {
								handleChange('fontSize', val);
							}
						}}
						className="text-center"
					/>
					<InputGroup.Text className="bg-light text-muted">px</InputGroup.Text>
				</InputGroup>

				{/* 2. Buat datalist tersembunyi yang berisi opsi dari konstanta FONT_SIZES */}
				<datalist id="font-sizes-datalist">
					{FONT_SIZES.map((sz) => (
						<option key={sz} value={sz} />
					))}
				</datalist>
			</div>

			<div className="mb-3">
				<SectionLabel>Gaya Teks</SectionLabel>
				<Button
					variant={selectedEl.bold ? 'dark' : 'outline-secondary'}
					size="sm"
					className="w-100 fw-bold py-2 text-center d-flex align-items-center justify-content-center gap-2"
					onClick={() => handleChange('bold', !selectedEl.bold)}
				>
					{selectedEl.bold ? 'Normal' : 'Bold'}
				</Button>
			</div>
		</>
	);

	// ==========================================
	// 3. JSX UTAMA (Menjadi jauh lebih rapi)
	// ==========================================
	return (
		<div className="h-100 bg-white px-3 rounded-4 border cert-sidebar overflow-auto">
			{/* Header Sidebar */}
			<div className="p-3 border-bottom d-flex align-items-center justify-content-between">
				<p
					className="text-uppercase text-muted fw-bold mb-0"
					style={{ fontSize: '0.75rem', letterSpacing: '1px' }}
				>
					Edit Elemen
				</p>
				<Button
					variant="link"
					className="text-muted p-0 text-decoration-none"
					onClick={clearSelection}
				>
					<X size={18} />
				</Button>
			</div>

			<div className="p-3 flex-grow-1 overflow-auto sidebar-scrollable">
				{/* Info Elemen yang Sedang Diedit */}
				{/* <Card className="border mb-4 shadow-none">
					<Card.Body className="p-2">
						<p className="mb-0 fw-bold fs-6">{selectedEl.label}</p>
						<small className="text-primary">
							{FIELDS.find((f) => f.id === selectedEl.fieldId)?.example}
						</small>
					</Card.Body>
				</Card> */}

				{/* Kontrol Spesifik (Tergantung jenis elemen) */}
				{isQr ? renderQRControls() : renderTextControls()}

				{/* Kontrol Umum: Warna */}
				<div className="mb-4">
					<SectionLabel>{isQr ? 'Warna QR Code' : 'Warna'}</SectionLabel>
					{/* 2. Input Hex Code Kustom & Color Picker Visual */}
					<InputGroup size="sm" className="mb-3">
						{/* Kotak warna yang bisa di-klik untuk membuka color picker bawaan OS/Browser */}
						<Form.Control
							type="color"
							value={selectedEl.color || '#000000'}
							onChange={(e) => handleChange('color', e.target.value)}
							style={{ width: '40px', padding: '0.2rem', cursor: 'pointer' }}
							title="Pilih Warna Kustom"
						/>
						{/* Kotak teks untuk mengetik atau paste Hex Code (contoh: #FF5733) */}
						<Form.Control
							type="text"
							value={selectedEl.color || '#000000'}
							onChange={(e) => handleChange('color', e.target.value)}
							placeholder="#000000"
							className="text-uppercase"
						/>
					</InputGroup>

					{/* 1. Palette Warna Cepat (Quick Swatches) */}
					<div className="d-flex flex-wrap gap-2 mb-3">
						{COLORS.map((c) => (
							<div
								key={c}
								className={`rounded-circle border ${selectedEl.color === c ? 'border-primary border-3' : 'border-secondary'}`}
								style={{
									backgroundColor: c,
									cursor: 'pointer',
									width: '28px',
									height: '28px',
								}}
								onClick={() => handleChange('color', c)}
							/>
						))}
					</div>
				</div>

				{/* Kontrol Umum: Posisi */}
				<div className="mb-4">
					<SectionLabel>Posisi (%)</SectionLabel>
					<div className="d-flex gap-2">
						<Form.Group className="flex-grow-1">
							<Form.Label className="text-muted small mb-1">
								Horizontal (X)
							</Form.Label>
							<Form.Control
								type="number"
								min={0}
								max={100}
								value={Math.round(selectedEl.x)}
								onChange={(e) => handleChange('x', Number(e.target.value))}
							/>
						</Form.Group>
						<Form.Group className="flex-grow-1">
							<Form.Label className="text-muted small mb-1">Vertikal (Y)</Form.Label>
							<Form.Control
								type="number"
								min={0}
								max={100}
								value={Math.round(selectedEl.y)}
								onChange={(e) => handleChange('y', Number(e.target.value))}
							/>
						</Form.Group>
					</div>
				</div>

				{/* Tombol Aksi Bawah */}
				<div className="d-flex gap-2">
					<Button
						variant="danger"
						className="d-flex align-items-center justify-content-center px-3 py-2"
						onClick={() => deleteEl(selectedEl.id)}
					>
						<Trash2 size={16} />
					</Button>
					<Button
						variant="primary"
						className="w-100 fw-semibold py-2"
						onClick={clearSelection}
					>
						Simpan Perubahan
					</Button>
				</div>
			</div>
		</div>
	);
};

export default SidebarEdit;
