import React, { useState } from 'react';
import { Button, Collapse, Form, Row, Col } from 'react-bootstrap';
import { Trash2, ChevronDown, ChevronUp, Lock } from 'lucide-react';

function TicketCard({
	ticket,
	index,
	onChange,
	onDelete,
	canDelete,
	priceLocked = false,
	eventStartDate = '',
	locationType = 'offline',
}) {
	const [open, setOpen] = useState(true);

	const getLocalISOString = () => {
		const tzoffset = new Date().getTimezoneOffset() * 60000;
		return new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
	};

	const formatToLocalDatetime = (dateStr) => {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		if (isNaN(date.getTime())) return '';
		const tzoffset = date.getTimezoneOffset() * 60000;
		return new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
	};

	const todayDateTime = getLocalISOString();
	const maxDateTime = formatToLocalDatetime(eventStartDate);

	const formatReadableDatetime = (dateStr) => {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		if (isNaN(date.getTime())) return '';
		return date
			.toLocaleString('id-ID', {
				day: '2-digit',
				month: 'short', // Dibuat short agar tidak memakan tempat (contoh: 01 Jun 2026)
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				hour12: false,
			})
			.replace(/\./g, ':');
	};

	const formatRp = (val) => {
		if (!val) return '';
		const n = parseInt(String(val).replace(/\D/g, ''), 10);
		return isNaN(n) ? '' : n.toLocaleString('id-ID').replace(/,/g, '.');
	};

	// ==========================================
	// LOGIKA VALIDASI PERINGATAN TANGGAL
	// ==========================================
	let startWarning = '';
	if (ticket.sale_start) {
		const sVal = ticket.sale_start.slice(0, 16);
		if (sVal < todayDateTime) {
			startWarning = 'Waktu mulai tidak boleh di masa lalu.';
		} else if (maxDateTime && sVal >= maxDateTime) {
			startWarning = 'Waktu mulai harus sebelum acara dimulai.';
		} else if (ticket.sale_end && sVal >= ticket.sale_end.slice(0, 16)) {
			startWarning = 'Waktu mulai harus sebelum akhir pendaftaran.';
		}
	}

	let endWarning = '';
	if (ticket.sale_end) {
		const eVal = ticket.sale_end.slice(0, 16);
		if (eVal < todayDateTime) {
			endWarning = 'Waktu berakhir tidak boleh di masa lalu.';
		} else if (maxDateTime && eVal > maxDateTime) {
			endWarning = 'Waktu berakhir tidak boleh melewati waktu acara.';
		} else if (ticket.sale_start && eVal <= ticket.sale_start.slice(0, 16)) {
			endWarning = 'Waktu berakhir harus setelah waktu mulai.';
		}
	}
	// ==========================================

	return (
		<div className="custom-card shadow-sm mb-3">
			{/* Header Tiket*/}
			<div
				className={`px-4 py-3 d-flex justify-content-between align-items-center ${open ? 'border-bottom' : ''}`}
				style={{
					cursor: 'pointer',
					transition: 'background-color 0.2s',
					borderColor: '#e2e8f0',
				}}
				onClick={() => setOpen(!open)}
			>
				<div className="d-flex align-items-center gap-3">
					<div className="custom-badge-number">{index + 1}</div>
					<span className="text-dark" style={{ fontSize: '16px', fontWeight: 500 }}>
						{ticket.name || 'Tiket baru'}
					</span>
					{locationType === 'hybrid' && ticket.type && (
						<span
							style={{
								fontSize: '0.75rem',
								fontWeight: 600,
								padding: '4px 10px',
								borderRadius: 6,
								background: ticket.type === 'online' ? '#dbeafe' : '#f1f5f9',
								color: ticket.type === 'online' ? '#1d4ed8' : '#475569',
								border:
									ticket.type === 'online'
										? '1px solid #bfdbfe'
										: '1px solid #e2e8f0',
							}}
						>
							{ticket.type === 'online' ? 'Online' : 'Offline'}
						</span>
					)}
				</div>

				<div className="d-flex align-items-center gap-3">
					{canDelete && (
						<Button
							variant="link"
							className="p-0 text-danger"
							style={{ lineHeight: 1 }}
							onClick={(e) => {
								e.stopPropagation();
								onDelete();
							}}
							title="Hapus tiket ini"
						>
							<Trash2 size={18} strokeWidth={1.5} />
						</Button>
					)}
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
					<div className="p-4" style={{ paddingTop: '24px' }}>
						{/* Row 1: Nama Tiket & Tipe Tiket */}
						<Row className="mb-4 gx-4">
							<Col md={locationType === 'hybrid' ? 8 : 12} className="mb-3 mb-md-0">
								<Form.Group>
									<label className="form-label required mb-2">Nama Tiket</label>
									<Form.Control
										type="text"
										className="custom-soft-input"
										placeholder="Contoh: Early Bird, VIP, Regular"
										value={ticket.name || ''}
										onChange={(e) => onChange({ name: e.target.value })}
										style={{ color: ticket.name ? '#1e293b' : '#94a3b8' }}
										required
									/>
								</Form.Group>
							</Col>

							{locationType === 'hybrid' && (
								<Col md={4}>
									<Form.Group>
										<label className="form-label required mb-2">
											Tipe Tiket
										</label>
										<Form.Select
											className="custom-soft-input"
											value={ticket.type || ''}
											onChange={(e) => onChange({ type: e.target.value })}
											style={{ color: ticket.type ? '#1e293b' : '#94a3b8' }}
											required
										>
											<option value="" disabled>
												Pilih Tipe
											</option>
											<option value="offline">Offline</option>
											<option value="online">Online</option>
										</Form.Select>
									</Form.Group>
								</Col>
							)}
						</Row>

						{/* Row 2: Harga + Kapasitas */}
						<Row className="mb-4 gx-4">
							<Col md={6} className="mb-3 mb-md-0">
								<div className="d-flex justify-content-between align-items-center mb-2">
									<label className="form-label required mb-0 d-flex align-items-center gap-2">
										Harga (Rp)
										{priceLocked && (
											<span
												title="Harga tidak dapat diubah karena sudah ada peserta terdaftar"
												style={{
													background: '#fef3c7',
													color: '#92400e',
													borderRadius: 4,
													padding: '2px 6px',
													fontSize: '0.7rem',
													fontWeight: 600,
													display: 'flex',
													alignItems: 'center',
													gap: 4,
													cursor: 'help',
												}}
											>
												<Lock size={12} strokeWidth={2.5} />
												Terkunci
											</span>
										)}
									</label>
									<Form.Check
										type="switch"
										id={`free-switch-${index}`}
										className="custom-soft-switch m-0"
										label="Gratis"
										checked={ticket.isFree}
										onChange={(e) => onChange({ isFree: e.target.checked })}
										disabled={priceLocked}
									/>
								</div>
								<div
									className="custom-unified-wrapper"
									style={
										priceLocked ? { opacity: 0.7, cursor: 'not-allowed' } : {}
									}
								>
									<span className="custom-unified-prefix">Rp</span>
									<input
										type="text"
										value={ticket.isFree ? '' : formatRp(ticket.price)}
										disabled={ticket.isFree || priceLocked}
										readOnly={priceLocked}
										onChange={(e) => {
											if (priceLocked) return;
											const raw = e.target.value.replace(/\D/g, '');
											onChange({ price: raw });
										}}
										placeholder={ticket.isFree ? '0' : '75.000'}
										style={
											priceLocked
												? { cursor: 'not-allowed', background: '#f8fafc' }
												: {}
										}
									/>
								</div>
							</Col>

							<Col md={6}>
								<div className="d-flex justify-content-between align-items-center mb-2">
									<label className="form-label required mb-0">Kapasitas</label>
									<Form.Check
										type="switch"
										id={`unlimited-switch-${index}`}
										className="custom-soft-switch m-0"
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
										value={ticket.capacity || ''}
										disabled={ticket.unlimited}
										onChange={(e) => onChange({ capacity: e.target.value })}
										placeholder={
											ticket.unlimited ? '∞' : 'Masukkan kuota tiket'
										}
									/>
								</div>
							</Col>
						</Row>

						{/* Row 3: Tanggal Penjualan */}
						<Row className="mb-4 gx-4">
							<Col md={6} className="mb-3 mb-md-0">
								<Form.Group>
									<label className="form-label required mb-2">
										Mulai Pendaftaran
									</label>
									<Form.Control
										type="datetime-local"
										name="sale_start"
										className={`custom-soft-input ${startWarning ? 'is-invalid' : ''}`}
										value={
											ticket.sale_start ? ticket.sale_start.slice(0, 16) : ''
										}
										min={todayDateTime}
										max={maxDateTime || undefined}
										onChange={(e) => onChange({ sale_start: e.target.value })}
										style={{ color: ticket.sale_start ? '#1e293b' : '#94a3b8' }}
										required
									/>
									{/* Indikator Min/Maks dipindah ke bawah input agar lebih rapi */}
									<div
										className="text-muted mt-2"
										style={{ fontSize: '12px', fontWeight: 500 }}
									>
										Min: {formatReadableDatetime(new Date())}
										{eventStartDate &&
											` | Maks: ${formatReadableDatetime(eventStartDate)}`}
									</div>
									{startWarning && (
										<div
											className="text-danger mt-1"
											style={{ fontSize: '0.85rem' }}
										>
											{startWarning}
										</div>
									)}
								</Form.Group>
							</Col>

							<Col md={6}>
								<Form.Group>
									<label className="form-label required mb-2">
										Akhir Pendaftaran
									</label>
									<Form.Control
										type="datetime-local"
										className={`custom-soft-input ${endWarning ? 'is-invalid' : ''}`}
										value={ticket.sale_end ? ticket.sale_end.slice(0, 16) : ''}
										min={
											ticket.sale_start
												? ticket.sale_start.slice(0, 16)
												: todayDateTime
										}
										max={maxDateTime || undefined}
										onChange={(e) => onChange({ sale_end: e.target.value })}
										style={{ color: ticket.sale_end ? '#1e293b' : '#94a3b8' }}
										required
									/>
									<div
										className="text-muted mt-2"
										style={{ fontSize: '12px', fontWeight: 500 }}
									>
										Min: {formatReadableDatetime(new Date())}
										{eventStartDate &&
											` | Maks: ${formatReadableDatetime(eventStartDate)}`}
									</div>
									{endWarning && (
										<div
											className="text-danger mt-1"
											style={{ fontSize: '0.85rem' }}
										>
											{endWarning}
										</div>
									)}
								</Form.Group>
							</Col>
						</Row>

						{/* Row 4: Deskripsi Tiket */}
						{/* <Form.Group>
							<div className="d-flex justify-content-between align-items-center mb-2">
								<label className="form-label mb-0">Deskripsi Tiket</label>
								<span className="text-muted" style={{ fontSize: '13px' }}>
									Opsional
								</span>
							</div>
							<Form.Control
								as="textarea"
								className="custom-soft-input"
								rows={2}
								value={ticket.description || ''}
								onChange={(e) => onChange({ description: e.target.value })}
								placeholder="Tuliskan keuntungan atau info tambahan untuk pemegang tiket ini..."
								style={{ resize: 'none', height: '80px' }}
							/>
						</Form.Group> */}
					</div>
				</div>
			</Collapse>
		</div>
	);
}

export default TicketCard;
