import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Form, Row, Col, Button } from 'react-bootstrap';
import {
	X,
	Trash2,
	Sparkles,
	AlignLeft,
	Calendar,
	Clock,
	Link as LinkIcon,
	Users,
	Plus,
	Mic,
	HelpCircle,
} from 'lucide-react';

const SessionForm = ({ data, onClose, onSaveSession, onChangeSidebar }) => {
	const [sessionData, setSessionData] = useState({
		title: '',
		description: '',
		startTime: '',
		endTime: '',
	});
	const [activeType, setActiveType] = useState('Keynote');
	const sessionTypes = ['Keynote', 'Panel', 'Workshop', 'Sesi', 'Break'];

	// Ketika props 'data' berubah (user klik sesi lain), update form
	useEffect(() => {
		if (data) {
			setSessionData({
				title: data.title || '',
				startTime: data.startTime || '',
				endTime: data.endTime || '',
			});
		}
	}, [data]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setSessionData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = () => {
		// Gabungkan data lama (id dll) dengan editan baru
		const updatedSession = { ...data, ...sessionData };
		onSaveSession(updatedSession);
	};

	// Reusable inline style untuk flat input agar tidak berulang
	const flatInputStyle = {
		borderRadius: '12px',
		borderColor: '#cbd5e1',
		fontSize: '0.95rem',
		backgroundColor: '#f8fafc',
		boxShadow: 'none',
	};

	const labelStyle = {
		// fontSize: '0.75rem',
		// fontWeight: 600,/
		// color: '#64748b',
		// letterSpacing: '0.5px',
	};

	return (
		<div
			style={{ width: '500px', height: '100%', overflow: 'auto' }}
			className="bg-white border rounded-2"
		>
			{/* Title Section */}
			<div className="px-4 my-3 d-flex justify-content-between align-items-center">
				<div className="w-100">
					<div className="d-flex align-items-center ">
						<div
							className="rounded-circle me-2"
							style={{ width: '8px', height: '8px', backgroundColor: '#8b5cf6' }}
						></div>
						<span style={labelStyle} className="fs-5">
							EDIT SESI
						</span>
					</div>
				</div>
			</div>

			{/* Scrollable Body */}
			<div className="flex-grow-1 overflow-auto px-4">
				{/* Tipe Sesi
					<div className="mb-4">
						<Form.Label
							className='form-label'
						>
							<Sparkles size={14} className="me-1" /> Tipe Sesi
						</Form.Label>
						<div className="d-flex flex-wrap gap-2">
							{sessionTypes.map((type) => (
								<button
									key={type}
									className="btn rounded-pill"
									style={{
										padding: '6px 16px',
										fontSize: '0.875rem',
										fontWeight: 500,
										border: '1px solid',
										backgroundColor: activeType === type ? '#f3e8ff' : '#ffffff',
										borderColor: activeType === type ? '#c084fc' : '#cbd5e1',
										color: activeType === type ? '#7e22ce' : '#475569',
										transition: 'all 0.2s',
									}}
									onClick={() => setActiveType(type)}
								>
									{type}
								</button>
							))}
						</div>
					</div> */}

				{/* Judul Sesi */}
				<Form.Group className="mb-4">
					<Form.Label className="form-label">
						<AlignLeft size={14} className="me-1" /> Judul Sesi
					</Form.Label>
					<Form.Control
						type="text"
						defaultValue={data.title}
						handleChange={handleChange}
						// style={flatInputStyle}
					/>
				</Form.Group>

				{/* Deskripsi */}
				<Form.Group className="mb-4">
					<Form.Label className="form-label">
						<AlignLeft size={14} className="me-1" /> Deskripsi{' '}
						<span className="text-muted fw-normal text-lowercase">(opsional)</span>
					</Form.Label>
					<Form.Control
						as="textarea"
						rows={4}
						defaultValue="Pembukaan resmi summit dan keynote speech dari Menteri Kominfo tentang roadmap AI nasional..."
						style={{ ...flatInputStyle, resize: 'none' }}
					/>
				</Form.Group>

				{/* Hari & Waktu */}
				<Row>
					<Col xs={12} className="mb-4">
						<Form.Label className="form-label">
							<Calendar size={14} className="me-1" /> Hari
						</Form.Label>
						<Form.Select style={flatInputStyle}>
							<option>Hari 1</option>
							<option>Hari 2</option>
						</Form.Select>
					</Col>
					<Col xs={12} className="mb-4">
						<Form.Label className="form-label">
							<Clock size={14} className="me-1" /> Waktu
						</Form.Label>
						<div className="d-flex align-items-center gap-2">
							<Form.Control
								type="time"
								className="text-center px-1"
								style={flatInputStyle}
							/>
							<span className="text-muted">-</span>
							<Form.Control
								type="time"
								className="text-center px-1"
								style={flatInputStyle}
							/>
						</div>
					</Col>
				</Row>

				{/* Prasyarat Sesi */}
				<Form.Group className="mb-4">
					<Form.Label className="form-label">
						<LinkIcon size={14} /> Prasyarat Sesi
					</Form.Label>
					<Form.Select style={flatInputStyle}>
						<option>Tidak ada prasyarat</option>
						<option>Sesi Fundamental AI</option>
					</Form.Select>
				</Form.Group>

				{/* Pembicara */}
				<div className="mb-4">
					<div className="d-flex justify-content-between align-items-center mb-2">
						<Form.Label className="form-label">
							<Users size={14} /> Pembicara
							<span
								className="badge rounded-pill bg-light text-primary border"
								style={{ fontSize: '11px' }}
							>
								1
							</span>
						</Form.Label>
						<Button
							variant="link"
							className="text-decoration-none p-0 d-flex align-items-center gap-1"
							style={{ fontSize: '0.875rem', fontWeight: 500 }}
							onClick={() => onChangeSidebar('speaker-list')}
						>
							<Plus size={16} /> Tambah
						</Button>
					</div>

					{/* Speaker Card */}
					<div
						className="border bg-white p-3 mt-3"
						style={{ borderRadius: '16px', borderColor: '#cbd5e1' }}
					>
						<div className="d-flex align-items-center gap-3">
							<div
								className="position-relative"
								style={{ width: '48px', height: '48px' }}
							>
								<img
									src="https://via.placeholder.com/48"
									alt="Speaker"
									className="rounded-circle w-100 h-100"
									style={{ objectFit: 'cover' }}
								/>
								<div
									className="position-absolute bg-white border d-flex align-items-center justify-content-center rounded-circle"
									style={{
										bottom: '-4px',
										right: '-4px',
										width: '20px',
										height: '20px',
										fontSize: '0.65rem',
										fontWeight: 600,
										color: '#64748b',
										borderColor: '#cbd5e1',
									}}
								>
									1
								</div>
							</div>
							<div>
								<h6 className="m-0" style={{ fontWeight: 600, color: '#0f172a' }}>
									Dr. Budi Santoso
								</h6>
								<p
									className="m-0"
									style={{
										fontSize: '0.8rem',
										color: '#64748b',
										lineHeight: 1.4,
									}}
								>
									Menteri Komunikasi
									<br />
									Kementerian Kominfo
								</p>
							</div>
						</div>

						<div className="d-flex align-items-center gap-3 mt-3">
							<Mic size={18} color="#64748b" />
							<Form.Control
								type="text"
								defaultValue="Roadmap AI Nasional 203"
								style={flatInputStyle}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="p-3 border-top bg-white" style={{ borderColor: '#e2e8f0' }}>
				<Button
					disabled
					className="w-100 border-0"
					style={{
						backgroundColor: '#f1f5f9',
						color: '#64748b',
						borderRadius: '12px',
						padding: '12px',
						fontWeight: 500,
					}}
				>
					Tidak ada perubahan
				</Button>
			</div>
		</div>
	);
};

export default SessionForm;
