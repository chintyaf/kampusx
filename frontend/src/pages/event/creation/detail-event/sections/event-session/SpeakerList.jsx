import React, { useState } from 'react';
import { Form, InputGroup, Image, Button } from 'react-bootstrap';
import { Search, X, Plus, CheckCircle } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

// Dummy data untuk mensimulasikan daftar pembicara
const DUMMY_SPEAKERS = [
	{
		id: 1,
		name: 'Dr. Budi Santoso',
		title: 'Menteri Komunikasi',
		company: 'Kementerian Kominfo',
		added: false,
		avatar: 'https://i.pravatar.cc/150?img=11',
	},
	{
		id: 2,
		name: 'Rina Hartati, M.Sc',
		title: 'AI Research Lead',
		company: 'Google Indonesia',
		added: true,
		avatar: 'https://i.pravatar.cc/150?img=5',
	},
	{
		id: 3,
		name: 'Ahmad Fauzi',
		title: 'CTO & Co-Founder',
		company: 'TechStartup ID',
		added: false,
		avatar: 'https://i.pravatar.cc/150?img=12',
	},
	{
		id: 4,
		name: 'Prof. Dewi Kusuma',
		title: 'Guru Besar Informatika',
		company: 'Universitas Indonesia',
		added: true,
		avatar: 'https://i.pravatar.cc/150?img=9',
	},
];

const SpeakerList = ({ onChangeSidebar }) => {
	const [searchQuery, setSearchQuery] = useState('');

	return (
		<div
			className="d-flex flex-column"
			style={{
				width: '400px',
				// height: '100vh',
				backgroundColor: '#ffffff',
				borderLeft: '1px solid #e0e0e0', // Border tegas tanpa shadow
			}}
		>
			{/* Header Section */}
			<div className="p-3 border-bottom" style={{ borderColor: '#e0e0e0' }}>
				<div className="d-flex justify-content-between align-items-start mb-3">
					<div>
						<h5 className="mb-1 fw-bold" style={{ fontSize: '18px', color: '#212529' }}>
							Pilih Pembicara
						</h5>
						<span style={{ fontSize: '14px', color: '#6c757d' }}>
							10 pembicara terdaftar
						</span>
					</div>
					<X
						size={20}
						color="#6c757d"
						style={{ cursor: 'pointer' }}
						onClick={() => onChangeSidebar('session-form')}
					/>
				</div>

				{/* Search Bar (Flat Design Style) */}
				<InputGroup
					style={{
						border: '1px solid #ced4da',
						borderRadius: '8px',
						overflow: 'hidden',
						backgroundColor: '#f8f9fa',
					}}
				>
					<InputGroup.Text
						style={{
							backgroundColor: 'transparent',
							border: 'none',
							paddingRight: 0,
						}}
					>
						<Search size={18} color="#6c757d" />
					</InputGroup.Text>
					<Form.Control
						placeholder="Cari nama, jabatan, atau perusa..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						style={{
							border: 'none',
							backgroundColor: 'transparent',
							boxShadow: 'none', // Menghilangkan default shadow bootstrap saat focus
							fontSize: '14px',
						}}
					/>
				</InputGroup>
			</div>

			{/* Speaker List (Scrollable) */}
			<div className="flex-grow-1 overflow-auto p-3">
				{DUMMY_SPEAKERS.map((speaker) => (
					<div key={speaker.id} className="d-flex align-items-center mb-4">
						{/* Avatar with Status */}
						<div
							style={{
								position: 'relative',
								width: '50px',
								height: '50px',
								marginRight: '16px',
							}}
						>
							<Image
								src={speaker.avatar}
								roundedCircle
								style={{
									width: '50px',
									height: '50px',
									objectFit: 'cover',
									opacity: speaker.added ? 0.4 : 1, // Dim avatar if added
								}}
							/>
							{speaker.added && (
								<div
									style={{
										position: 'absolute',
										bottom: '-2px',
										right: '-2px',
										backgroundColor: 'white',
										borderRadius: '50%',
										padding: '2px',
									}}
								>
									<CheckCircle size={18} fill="#82a3d4" color="white" />
								</div>
							)}
						</div>

						{/* Speaker Info */}
						<div className="flex-grow-1" style={{ minWidth: 0 }}>
							<h6
								className="mb-0 text-truncate"
								style={{
									fontSize: '15px',
									color: speaker.added ? '#adb5bd' : '#212529',
									fontWeight: 500,
								}}
							>
								{speaker.name}
							</h6>
							<p
								className="mb-0 text-truncate"
								style={{
									fontSize: '13px',
									color: speaker.added ? '#dee2e6' : '#6c757d',
								}}
							>
								{speaker.title} &middot; <br /> {speaker.company}
							</p>
						</div>

						{/* Action Button/Badge */}
						<div className="ms-2">
							{speaker.added ? (
								<div
									style={{
										backgroundColor: '#f1f5f9',
										color: '#94a3b8',
										padding: '6px 12px',
										borderRadius: '16px',
										fontSize: '12px',
										fontWeight: 500,
									}}
								>
									Ditambahkan
								</div>
							) : (
								<Button
									variant="light"
									className="rounded-circle d-flex align-items-center justify-content-center"
									style={{
										width: '36px',
										height: '36px',
										backgroundColor: '#f8f9fa',
										border: 'none',
									}}
								>
									<Plus size={18} color="#475569" />
								</Button>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Bottom Action Section */}
			<div
				className="p-3 border-top"
				style={{ borderColor: '#e0e0e0', backgroundColor: '#ffffff' }}
			>
				<Button
					className="w-100 d-flex align-items-center justify-content-center gap-2"
					style={{
						border: '1px dashed #3b82f6', // Dashed border sesuai referensi
						color: '#1d4ed8',
						backgroundColor: 'transparent',
						borderRadius: '8px',
						padding: '10px',
						fontSize: '14px',
						fontWeight: 500,
					}}
					onClick={() => onChangeSidebar('speaker-add')}
				>
					<Plus size={18} /> Tambah pembicara baru
				</Button>
			</div>
		</div>
	);
};

export default SpeakerList;
