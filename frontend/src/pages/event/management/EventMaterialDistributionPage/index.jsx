import React, { useState } from 'react';
import { Container, Card, Button, Form } from 'react-bootstrap';
import { Upload, FileText, Eye, EyeOff, Download, Trash2 } from 'lucide-react';

// 1. Ekstraksi Data (Bisa diganti dengan data dari API nantinya)
const initialMaterials = [
	{
		id: 1,
		title: 'Panduan Peserta ITCB 2026',
		date: '10 Mar 2026, 10.00',
		isVisible: true,
		category: 'pre',
	},
	{
		id: 2,
		title: 'Modul Prasyarat - Logic 101',
		date: '12 Mar 2026, 14.00',
		isVisible: true,
		category: 'pre',
	},
	{
		id: 3,
		title: 'Materi Presentasi Utama',
		date: '15 Mar 2026, 09.00',
		isVisible: false,
		category: 'post',
	},
	{
		id: 4,
		title: 'Sertifikat Kehadiran',
		date: '16 Mar 2026, 10.00',
		isVisible: false,
		category: 'post',
	},
];

// 2. Sub-komponen untuk meminimalisir duplikasi kode
const MaterialItem = ({ material, onToggleVisibility }) => (
	<Card className="mb-3 rounded-3 shadow-none border">
		<Card.Body className="d-flex justify-content-between align-items-center p-3">
			<div className="d-flex align-items-center">
				<FileText size={22} className="text-primary me-3" />
				<div>
					<h6 className="mb-1 fw-semibold">{material.title}</h6>
					<small className="text-muted text-uppercase" style={{ fontSize: '0.8rem' }}>
						<span className="me-1">📅</span> {material.date}
					</small>
				</div>
			</div>
			<div className="d-flex align-items-center gap-3">
				<span className="text-muted" style={{ fontSize: '0.9rem' }}>
					{material.isVisible ? 'Ditampilkan' : 'Tersembunyi'}
				</span>
				<Form.Check
					type="switch"
					id={`switch-visible-${material.id}`}
					checked={material.isVisible}
					onChange={() => onToggleVisibility(material.id)}
					className="fs-5 m-0"
				/>
				{material.isVisible ? (
					<Eye className="text-success" size={18} style={{ cursor: 'pointer' }} />
				) : (
					<EyeOff className="text-secondary" size={18} style={{ cursor: 'pointer' }} />
				)}
				<Download className="text-dark" size={18} style={{ cursor: 'pointer' }} />
				<Trash2 className="text-danger" size={18} style={{ cursor: 'pointer' }} />
			</div>
		</Card.Body>
	</Card>
);

const EventMaterialDistributionPage = () => {
	// 3. Inisialisasi State
	const [materials, setMaterials] = useState(initialMaterials);
	const [activeTab, setActiveTab] = useState('pre'); // 'pre' atau 'post'

	// Fungsi untuk mengubah visibilitas materi
	const handleToggleVisibility = (id) => {
		setMaterials(
			materials.map((mat) => (mat.id === id ? { ...mat, isVisible: !mat.isVisible } : mat)),
		);
	};

	// Filter data berdasarkan tab aktif
	const filteredMaterials = materials.filter((m) => m.category === activeTab);
	const preCount = materials.filter((m) => m.category === 'pre').length;
	const postCount = materials.filter((m) => m.category === 'post').length;

	return (
		<Container className="">
			{/* Header */}
			<div className="mb-4">
				<h2 className="fw-bold mb-1">Distribusi Materi</h2>
				<p className="text-muted" style={{ fontSize: '1.1rem' }}>
					Kelola materi, presentasi, dan dokumentasi
				</p>
			</div>

			{/* Upload Section */}
			<Card
				className="mb-4 rounded-3 shadow-sm border-0"
				style={{ border: '1px solid #eaeaea' }}
			>
				<Card.Body className="p-4">
					<div className="d-flex align-items-center mb-4">
						<Upload className="me-2" size={20} />
						<h5 className="mb-0 fw-semibold">Unggah Materi Baru</h5>
					</div>

					<div
						className="text-center p-5 rounded-3"
						style={{ border: '2px dashed #d3d3d3', backgroundColor: '#fefefe' }}
					>
						<Upload size={36} className="text-secondary mb-3" />
						<h5 className="fw-semibold">Klik untuk mengunggah atau seret dan lepas</h5>
						<p className="text-muted mb-4">
							File PDF, PPT, DOC, atau Video (Maks. 100MB)
						</p>
						<Button variant="dark" className="px-4 py-2 rounded-2">
							Pilih File
						</Button>
					</div>
				</Card.Body>
			</Card>

			{/* Tab Navigasi Pilihan (Dinamis) */}
			<div className="d-inline-flex bg-light rounded-pill p-1 mb-4">
				<Button
					variant="light"
					onClick={() => setActiveTab('pre')}
					className={`rounded-pill px-4 py-2 fw-semibold border-0 ${
						activeTab === 'pre' ? 'bg-white shadow-sm' : 'text-muted bg-transparent'
					}`}
				>
					Materi Pra-Acara ({preCount})
				</Button>
				<Button
					variant="light"
					onClick={() => setActiveTab('post')}
					className={`rounded-pill px-4 py-2 fw-semibold border-0 ${
						activeTab === 'post' ? 'bg-white shadow-sm' : 'text-muted bg-transparent'
					}`}
				>
					Materi Pasca-Acara ({postCount})
				</Button>
			</div>

			{/* Materials List (Dirender menggunakan .map) */}
			<Card
				className="mb-4 rounded-3 shadow-sm border-0"
				style={{ border: '1px solid #eaeaea' }}
			>
				<Card.Body className="p-4">
					<h5 className="fw-semibold mb-2">
						{activeTab === 'pre' ? 'Materi Pra-Acara' : 'Materi Pasca-Acara'}
					</h5>
					<p className="text-muted mb-4">
						{activeTab === 'pre'
							? 'Materi yang tersedia sebelum acara dimulai (misal: panduan, modul)'
							: 'Materi yang dirilis setelah acara selesai (misal: sertifikat, presentasi)'}
					</p>

					{filteredMaterials.length > 0 ? (
						filteredMaterials.map((material) => (
							<MaterialItem
								key={material.id}
								material={material}
								onToggleVisibility={handleToggleVisibility}
							/>
						))
					) : (
						<div className="text-center text-muted py-4">
							Belum ada materi di kategori ini.
						</div>
					)}
				</Card.Body>
			</Card>

			{/* Visibility Settings Legend */}
			<Card
				className="rounded-3 shadow-sm border-0 mb-5"
				style={{ border: '1px solid #eaeaea' }}
			>
				<Card.Body className="p-4">
					<h5 className="fw-semibold mb-4">Pengaturan Visibilitas</h5>

					<div className="mb-3 d-flex align-items-start">
						<Eye className="text-success me-3 mt-1" size={20} />
						<div>
							<span className="fw-bold me-1">Tampil:</span>
							<span>Materi dapat dilihat dan diunduh oleh peserta</span>
						</div>
					</div>

					<div className="mb-4 d-flex align-items-start">
						<EyeOff className="text-secondary me-3 mt-1" size={20} />
						<div>
							<span className="fw-bold me-1">Tersembunyi:</span>
							<span>
								Materi telah diunggah tetapi belum dapat diakses oleh peserta
							</span>
						</div>
					</div>

					<p
						className="text-muted mb-0"
						style={{ fontSize: '0.95rem', lineHeight: '1.5' }}
					>
						Gunakan tombol sakelar (toggle) untuk mengatur kapan materi tersedia bagi
						peserta. Fitur ini berguna jika Anda ingin merilis materi secara bertahap
						atau setelah sesi tertentu selesai.
					</p>
				</Card.Body>
			</Card>
		</Container>
	);
};

export default EventMaterialDistributionPage;
