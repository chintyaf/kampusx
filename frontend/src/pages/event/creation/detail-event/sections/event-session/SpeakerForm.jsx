import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { ArrowLeft, Upload, User, Building2, Check } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const SpeakerForm = ({ onChangeSidebar }) => {
	const [status, setStatus] = useState('menunggu');

	// Common styles untuk flat design form
	const inputStyle = {
		backgroundColor: '#f8fafc',
		border: '1px solid #cbd5e1',
		boxShadow: 'none', // Menghilangkan glow/shadow bawaan bootstrap
		color: '#334155',
		fontSize: '14px',
		padding: '10px 12px',
	};

	const iconContainerStyle = {
		backgroundColor: '#f8fafc',
		border: '1px solid #cbd5e1',
		borderRight: 'none',
		color: '#64748b',
	};

	const statusBtnStyle = (isActive) => ({
		flex: 1,
		backgroundColor: 'transparent',
		border: isActive ? '2px solid #d97706' : '1px solid #cbd5e1',
		color: isActive ? '#92400e' : '#64748b',
		fontWeight: isActive ? 600 : 400,
		boxShadow: 'none',
		fontSize: '14px',
		padding: '8px 0',
	});

	return (
		<div
			className="d-flex flex-column"
			style={{
				width: '400px',
				height: '100vh',
				backgroundColor: '#ffffff',
				borderLeft: '1px solid #e2e8f0',
				fontFamily: 'Inter, system-ui, sans-serif',
			}}
		>
			{/* Header */}
			<div
				className="p-3 border-bottom d-flex align-items-center gap-3"
				style={{ borderColor: '#e2e8f0' }}
			>
				<ArrowLeft
					size={20}
					color="#64748b"
					style={{ cursor: 'pointer' }}
					onClick={() => onChangeSidebar('speaker-list')}
				/>
				<div>
					<h5 className="mb-1 fw-bold" style={{ fontSize: '18px', color: '#1e293b' }}>
						Tambah Pembicara Baru
					</h5>
					<div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.2' }}>
						Langsung ditambahkan ke daftar & sesi ini
					</div>
				</div>
			</div>

			{/* Form Body (Scrollable) */}
			<div className="flex-grow-1 overflow-auto p-3">
				{/* Photo & Name/Title Section */}
				<div className="d-flex gap-3 mb-3">
					{/* Photo Upload Area */}
					<div
						className="d-flex flex-column align-items-center justify-content-center"
						style={{
							width: '72px',
							height: '72px',
							borderRadius: '50%',
							border: '2px dashed #93c5fd',
							backgroundColor: '#eff6ff',
							color: '#3b82f6',
							cursor: 'pointer',
							flexShrink: 0,
						}}
					>
						<Upload size={18} className="mb-1" />
						<span style={{ fontSize: '12px', fontWeight: 500 }}>Foto</span>
					</div>

					{/* Name & Title Inputs */}
					<div className="flex-grow-1 d-flex flex-column gap-2">
						<InputGroup>
							<InputGroup.Text style={iconContainerStyle}>
								<User size={16} />
							</InputGroup.Text>
							<Form.Control
								placeholder="Nama lengkap *"
								style={{ ...inputStyle, borderLeft: 'none', paddingLeft: 0 }}
							/>
						</InputGroup>

						<Form.Control placeholder="Jabatan / Posisi *" style={inputStyle} />
					</div>
				</div>

				{/* Institution Input */}
				<InputGroup className="mb-3">
					<InputGroup.Text style={iconContainerStyle}>
						<Building2 size={16} />
					</InputGroup.Text>
					<Form.Control
						placeholder="Institusi / Perusahaan *"
						style={{ ...inputStyle, borderLeft: 'none', paddingLeft: 0 }}
					/>
				</InputGroup>

				{/* Topic Dropdown */}
				<Form.Select className="mb-3" style={inputStyle}>
					<option value="" disabled selected>
						Topik (opsional)
					</option>
					<option value="1">Topik 1</option>
					<option value="2">Topik 2</option>
				</Form.Select>

				{/* Bio Textarea */}
				<Form.Control
					as="textarea"
					rows={3}
					placeholder="Bio singkat (opsional)..."
					style={{ ...inputStyle, resize: 'none' }}
					className="mb-4"
				/>

				{/* Confirmation Status */}
				<div>
					<label style={{ fontSize: '14px', color: '#475569', marginBottom: '10px' }}>
						Status Konfirmasi
					</label>
					<div className="d-flex gap-2">
						<Button
							style={statusBtnStyle(status === 'menunggu')}
							onClick={() => setStatus('menunggu')}
							variant="light"
						>
							Menunggu
						</Button>
						<Button
							style={statusBtnStyle(status === 'diundang')}
							onClick={() => setStatus('diundang')}
							variant="light"
						>
							Diundang
						</Button>
						<Button
							style={statusBtnStyle(status === 'terkonfirmasi')}
							onClick={() => setStatus('terkonfirmasi')}
							variant="light"
						>
							Terkonfirmasi
						</Button>
					</div>
				</div>
			</div>

			{/* Footer Actions */}
			<div className="p-3 border-top d-flex gap-3" style={{ borderColor: '#e2e8f0' }}>
				<Button
					variant="light"
					style={{
						flex: 1,
						backgroundColor: '#ffffff',
						border: '1px solid #cbd5e1',
						color: '#475569',
						boxShadow: 'none',
					}}
				>
					Batal
				</Button>
				<Button
					style={{
						flex: 2,
						backgroundColor: '#cbd5e1', // Warna disabled look sesuai referensi
						border: 'none',
						color: '#ffffff',
						boxShadow: 'none',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '6px',
					}}
				>
					<Check size={16} /> Simpan & Tambahkan ke Sesi
				</Button>
			</div>
		</div>
	);
};

export default SpeakerForm;
