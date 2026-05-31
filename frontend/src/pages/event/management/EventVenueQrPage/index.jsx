import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spinner, ToggleButtonGroup, ToggleButton, Card } from 'react-bootstrap';
import QRCode from 'react-qr-code';
import { ArrowLeft, Scan, CheckCircle, LogOut } from 'lucide-react';
import api from '@/api/axios';
import { notify } from '@/utils/notify';

export default function EventVenueQrPage() {
	const { eventId } = useParams();
	const navigate = useNavigate();
	const [eventTitle, setEventTitle] = useState('');
	const [qrData, setQrData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [linkType, setLinkType] = useState('in');

	useEffect(() => {
		if (eventId) {
			fetchEventTitle();
			fetchVenueQr();
		}
	}, [eventId, linkType]);

	const fetchEventTitle = async () => {
		try {
			const res = await api.get(`/event-dashboard/${eventId}/overview`);
			if (res.data?.status === 'success') {
				setEventTitle(res.data.data.name);
			}
		} catch (error) {
			console.error('Failed to fetch event overview:', error);
		}
	};

	const fetchVenueQr = async () => {
		setLoading(true);
		try {
			const res = await api.get(`/event-dashboard/${eventId}/venue-qr?type=${linkType}`);
			if (res.data?.success) {
				const { event_id, signature, type } = res.data.data;
				const url = `${window.location.origin}/attend-venue?event_id=${event_id}&type=${type}&signature=${signature}`;
				setQrData(url);
			}
		} catch (err) {
			console.error('Failed to fetch Venue QR:', err);
			notify('error', 'Gagal', 'Gagal mengambil data QR Venue.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div 
			className="d-flex flex-column min-vh-100 p-4" 
			style={{ 
				background: 'radial-gradient(circle at top right, #f8fafc, #f1f5f9)', 
				color: '#0f172a',
				fontFamily: 'Inter, sans-serif'
			}}
		>
			{/* Header Navigation */}
			<div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
				<Button
					variant="link"
					className="text-decoration-none text-secondary d-flex align-items-center gap-2 p-0 shadow-none hover-opacity"
					onClick={() => navigate(`/organizer/${eventId}/event-dashboard/event-pos`)}
					style={{ transition: 'opacity 0.2s', fontSize: '0.95rem', fontWeight: '500' }}
				>
					<ArrowLeft size={18} /> Kembali ke Manajemen Pos
				</Button>

				<div className="d-flex align-items-center gap-2 bg-white border rounded-pill px-3 py-1.5 shadow-sm">
					<span className="d-inline-block bg-success rounded-circle" style={{ width: 8, height: 8, animate: 'pulse 2s infinite' }}></span>
					<span className="text-secondary small fw-medium" style={{ fontSize: '0.85rem' }}>Portal QR Active</span>
				</div>
			</div>

			{/* Main Content */}
			<div className="d-flex flex-column align-items-center justify-content-center my-auto">
				<div className="text-center mb-4" style={{ maxWidth: '600px' }}>
					<span 
						className="badge rounded-pill text-primary mb-3 px-3 py-2 fw-semibold"
						style={{ backgroundColor: '#e0f2fe', letterSpacing: '0.5px', fontSize: '0.8rem' }}
					>
						QR PRESENSI ONSITE
					</span>
					<h1 className="fw-extrabold text-dark tracking-tight mb-2" style={{ fontSize: '2.25rem', letterSpacing: '-1px' }}>
						{eventTitle || 'Loading Event Name...'}
					</h1>
					<p className="text-secondary" style={{ fontSize: '1rem', opacity: 0.85 }}>
						Tampilkan halaman ini di layar proyektor atau cetak agar peserta dapat melakukan scan kehadiran secara mandiri melalui HP mereka.
					</p>
				</div>

				{/* Switch Mode Tab */}
				<div className="mb-4 bg-white border p-1 rounded-3 shadow-sm d-inline-flex">
					<ToggleButtonGroup 
						type="radio" 
						name="qrLinkType" 
						value={linkType} 
						onChange={(val) => setLinkType(val)}
					>
						<ToggleButton 
							id="qr-page-btn-1" 
							value="in" 
							variant={linkType === 'in' ? 'dark' : 'white'} 
							className={`border-0 rounded-2 px-4 py-2 d-flex align-items-center gap-2 fw-bold ${linkType !== 'in' && 'text-secondary bg-transparent'}`}
							style={{ fontSize: '0.9rem', minWidth: '130px', justifyContent: 'center' }}
						>
							<CheckCircle size={16} /> Check-in
						</ToggleButton>
						<ToggleButton 
							id="qr-page-btn-2" 
							value="out" 
							variant={linkType === 'out' ? 'dark' : 'white'} 
							className={`border-0 rounded-2 px-4 py-2 d-flex align-items-center gap-2 fw-bold ${linkType !== 'out' && 'text-secondary bg-transparent'}`}
							style={{ fontSize: '0.9rem', minWidth: '130px', justifyContent: 'center' }}
						>
							<LogOut size={16} /> Check-out
						</ToggleButton>
					</ToggleButtonGroup>
				</div>

				{/* QR Display Card */}
				<Card 
					className="border-0 shadow-lg rounded-4 p-5 text-center bg-white" 
					style={{ 
						maxWidth: '480px', 
						width: '100%',
						boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)'
					}}
				>
					{loading ? (
						<div className="py-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '350px' }}>
							<Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
							<p className="mt-4 text-secondary fw-medium">Menghasilkan QR Code...</p>
						</div>
					) : qrData ? (
						<div className="d-flex flex-column align-items-center">
							<div className="bg-light p-4 rounded-4 border mb-4 d-inline-block">
								<QRCode
									value={qrData}
									size={280}
									level="H"
								/>
							</div>

							<div className="d-flex align-items-center gap-2 text-primary fw-semibold mb-1" style={{ fontSize: '1.1rem' }}>
								<Scan size={18} />
								Scan Untuk {linkType === 'in' ? 'Check-in Masuk' : 'Check-out Keluar'}
							</div>
							<p className="text-secondary small mb-0" style={{ fontSize: '0.85rem' }}>
								Gunakan kamera HP atau scanner aplikasi untuk melakukan absensi
							</p>
						</div>
					) : (
						<div className="py-5 text-danger d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '350px' }}>
							<p className="fw-bold mb-1">Gagal memuat QR Code</p>
							<span className="small text-secondary">Silakan periksa koneksi Anda dan coba lagi</span>
						</div>
					)}
				</Card>
			</div>

			{/* Footer Instruction */}
			<div className="text-center mt-5 text-muted small" style={{ fontSize: '0.8rem' }}>
				© {new Date().getFullYear()} KampusX Onsite Attendance System. All rights reserved.
			</div>
		</div>
	);
}
