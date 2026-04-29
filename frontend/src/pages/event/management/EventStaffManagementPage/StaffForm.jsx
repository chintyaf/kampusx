import React, { useState, useEffect } from 'react';
import { Form, Button, InputGroup, Alert, Badge } from 'react-bootstrap';
import { UserPlus, Search, QrCode, Edit3, Mail, CheckCircle2 } from 'lucide-react';
import ModalBox from '@/components/dashboard/ModalBox';

const StaffForm = ({ show, onHide }) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [isUserFound, setIsUserFound] = useState(null); // null: idle, true: found, false: not found
	const [permissions, setPermissions] = useState({
		qrScanner: true,
		manualOverride: false,
	});

	// Simulasi pengecekan database saat mengetik email
	useEffect(() => {
		if (searchQuery.includes('@')) {
			// Logika asli nantinya memanggil API di sini
			const mockFound = searchQuery === 'chintya.elysia@gmail.com';
			setIsUserFound(mockFound);
		} else {
			setIsUserFound(null);
		}
	}, [searchQuery]);

	const handleAssign = () => {
		if (isUserFound) {
			console.log('Skenario A: Langsung Assign User ID');
		} else {
			console.log('Skenario B: Kirim Undangan Eksternal');
		}
		onHide();
	};

	return (
		<ModalBox
			show={show}
			onHide={onHide}
			title="Tambah Staf Baru"
			subtitle="Cari dan tugaskan member yang sudah terdaftar atau undang tim eksternal ke KampusX"
			size="lg">
			{/* Search Bar Section */}
			<div className="mb-4">
				<Form.Label className="form-label fw-bold">Cari Member</Form.Label>
				<InputGroup
					className={isUserFound === false ? 'border border-warning rounded-2' : ''}>
					<InputGroup.Text className="bg-white border-end-0 text-muted">
						<Search size={18} />
					</InputGroup.Text>
					<Form.Control
						type="email"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Masukkan email calon staf..."
						className="border-start-0 ps-2 shadow-none py-2"
					/>
				</InputGroup>

				{/* Feedback Skenario B (User Tidak Ditemukan) */}
				{isUserFound === false && (
					<div
						className="mt-2 d-flex align-items-start gap-2 text-warning"
						style={{ fontSize: '13px' }}>
						<Mail size={16} className="mt-1" />
						<span>
							Email belum terdaftar. Sistem akan mengirimkan <b>undangan eksternal</b>{' '}
							dan instruksi pendaftaran otomatis.
						</span>
					</div>
				)}

				{/* Feedback Skenario A (User Ditemukan) */}
				{isUserFound === true && (
					<div
						className="mt-2 d-flex align-items-center gap-2 text-success"
						style={{ fontSize: '13px' }}>
						<CheckCircle2 size={16} />
						<span>
							User ditemukan: <b>Chintya Elysia</b>{' '}
							<Badge bg="success" className="ms-1">
								Member KampusX
							</Badge>
						</span>
					</div>
				)}
			</div>

			{/* Hak Akses Section */}
			<div className="mb-4">
				<label className="form-label fw-bold">Hak Akses & Wewenang</label>
				<div className="d-flex flex-column gap-3">
					{/* Scanner QR */}
					<label
						className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-3 shadow-sm-hover transition-all"
						style={{ cursor: 'pointer' }}>
						<div className="d-flex align-items-center gap-3">
							<div className="p-2 rounded-2 bg-blue-light text-primary">
								<QrCode size={20} />
							</div>
							<div>
								<p className="mb-0 fw-bold text-dark" style={{ fontSize: '14px' }}>
									Scanner QR
								</p>
								<p className="mb-0 text-muted" style={{ fontSize: '12px' }}>
									Validasi tiket peserta secara real-time
								</p>
							</div>
						</div>
						<Form.Check
							type="switch"
							checked={permissions.qrScanner}
							onChange={() =>
								setPermissions({
									...permissions,
									qrScanner: !permissions.qrScanner,
								})
							}
						/>
					</label>

					{/* Manual Override */}
					<label
						className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-3 shadow-sm-hover transition-all"
						style={{ cursor: 'pointer' }}>
						<div className="d-flex align-items-center gap-3">
							<div className="p-2 rounded-2 bg-orange-light text-orange">
								<Edit3 size={20} />
							</div>
							<div>
								<p className="mb-0 fw-bold text-dark" style={{ fontSize: '14px' }}>
									Manual Override
								</p>
								<p className="mb-0 text-muted" style={{ fontSize: '12px' }}>
									Ubah status kehadiran secara manual
								</p>
							</div>
						</div>
						<Form.Check
							type="switch"
							checked={permissions.manualOverride}
							onChange={() =>
								setPermissions({
									...permissions,
									manualOverride: !permissions.manualOverride,
								})
							}
						/>
					</label>
				</div>
			</div>

			{/* Footer */}
			<div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
				<Button variant="light" onClick={onHide} className="px-4 text-secondary border">
					Batal
				</Button>
				<Button
					variant={isUserFound === false ? 'warning' : 'primary'}
					onClick={handleAssign}
					className="d-flex align-items-center gap-2 px-4 fw-bold shadow-sm">
					{isUserFound === false ? <Mail size={18} /> : <UserPlus size={18} />}
					{isUserFound === false ? 'Kirim Undangan' : 'Assign Staff'}
				</Button>
			</div>
		</ModalBox>
	);
};

export default StaffForm;
