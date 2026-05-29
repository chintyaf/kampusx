import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function EventChecklist({ issues = [], eventData = {}, eventId }) {
	const navigate = useNavigate();

	const hasIssue = (keywords) => {
		return issues.some(issue => 
			keywords.some(kw => issue.message.toLowerCase().includes(kw))
		);
	};

	const checklist = [
		{
			id: 'info',
			label: 'Isi Deskripsi & Informasi Dasar Event',
			completed: !hasIssue(['deskripsi', 'judul', 'informasi dasar']),
			link: `/organizer/${eventId}/event-dashboard/detail/info`
		},
		{
			id: 'tiket',
			label: 'Buat Kategori & Harga Tiket',
			completed: !hasIssue(['tiket', 'kategori', 'kuota', 'harga']),
			link: `/organizer/${eventId}/event-dashboard/detail/tiket`
		},
		{
			id: 'lokasi',
			label: 'Atur Lokasi / Platform Event',
			completed: !hasIssue(['lokasi', 'platform', 'meeting', 'tempat', 'alamat']),
			link: `/organizer/${eventId}/event-dashboard/detail/tempat`
		},
		{
			id: 'sesi',
			label: 'Atur Struktur Sesi & Pemateri',
			completed: !hasIssue(['sesi', 'pembicara', 'jadwal', 'pemateri']),
			link: `/organizer/${eventId}/event-dashboard/detail/sesi`
		},
		{
			id: 'poster',
			label: 'Unggah Poster Cover Event',
			completed: !hasIssue(['poster', 'gambar', 'cover']),
			link: `/organizer/${eventId}/event-dashboard/detail/info`
		}
	];

	const completedCount = checklist.filter(item => item.completed).length;
	const readyPercentage = Math.round((completedCount / checklist.length) * 100);

	return (
		<div className="card shadow-sm p-4 mb-4 border-0" style={{ borderRadius: '12px', backgroundColor: '#FFFFFF' }}>
			{/* Checklist Header */}
			<div className="d-flex flex-column gap-2 mb-3">
				<div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
					<h3 className="h5 fw-bold text-dark m-0 d-flex align-items-center gap-2">
						📋 Checklist Persiapan Acara
					</h3>
					<span className="fw-bold text-primary" style={{ fontSize: '15px' }}>
						{readyPercentage}% Siap Publish
					</span>
				</div>

				{/* Modern Progress Bar */}
				<div className="progress w-100" style={{ height: '8px', borderRadius: '4px', backgroundColor: '#F1F5F9' }}>
					<div 
						className={`progress-bar rounded-pill transition-all ${readyPercentage === 100 ? 'bg-success' : 'bg-primary'}`} 
						role="progressbar" 
						style={{ width: `${readyPercentage}%`, transition: 'width 0.5s ease-in-out' }} 
						aria-valuenow={readyPercentage} 
						aria-valuemin="0" 
						aria-valuemax="100"
					/>
				</div>
			</div>

			{/* Checklist Items */}
			<div className="d-flex flex-column gap-3 mt-2">
				{checklist.map((item) => (
					<div 
						key={item.id} 
						className="d-flex align-items-center justify-content-between p-3 rounded-3"
						style={{ 
							backgroundColor: item.completed ? '#F8FAFC' : '#FFFBEB',
							border: item.completed ? '1px solid #E2E8F0' : '1px solid #FDE68A',
							transition: 'all 0.15s ease-in-out'
						}}
					>
						<div className="d-flex align-items-center gap-3">
							{item.completed ? (
								<CheckCircle2 size={20} className="text-success flex-shrink-0" strokeWidth={2.5} />
							) : (
								<AlertCircle size={20} className="text-warning flex-shrink-0" strokeWidth={2.5} />
							)}
							<span className={`fw-semibold text-dark`} style={{ fontSize: '13.5px' }}>
								{item.label}
							</span>
						</div>

						{/* Action link if not completed */}
						{!item.completed ? (
							<button
								onClick={() => navigate(item.link)}
								className="btn btn-sm btn-minimal btn-minimal-outline px-3 d-inline-flex align-items-center gap-1.5 fw-semibold"
								style={{ height: '32px', fontSize: '12px' }}
							>
								Lengkapi
								<ArrowRight size={13} />
							</button>
						) : (
							<span className="badge bg-success-subtle text-success px-2.5 py-1 rounded" style={{ fontSize: '11px', fontWeight: '600' }}>
								Selesai
							</span>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
