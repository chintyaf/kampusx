import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, Award, Download } from 'lucide-react';

const CertificateTab = ({ id, alreadySubmitted, participantName }) => {
	return (
		<div className="fade-in text-center py-4">
			{!alreadySubmitted ? (
				<Card
					className="border-0 shadow-sm rounded-4 d-inline-block text-start"
					style={{ maxWidth: '500px', width: '100%' }}
				>
					<Card.Body className="p-5 d-flex flex-column align-items-center text-center">
						<div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex p-3.5 mb-4 border border-warning border-opacity-25">
							<Lock size={40} className="animate-pulse" />
						</div>
						<h4 className="fw-bold mb-2">Sertifikat Belum Terbuka</h4>
						<p className="text-muted small mb-4">
							Sertifikat apresiasi kelulusan Anda saat ini masih terkunci.
							Mohon berikan feedback/penilaian evaluasi singkat Anda
							mengenai pelaksanaan event ini untuk membuka sertifikat.
						</p>
						<Link
							to={`/event-space/${id}/survey`}
							className="w-100 text-decoration-none"
						>
							<Button
								variant="primary"
								className="w-100 rounded-pill py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
							>
								<Sparkles size={18} /> Mulai Isi Survei Feedback
							</Button>
						</Link>
					</Card.Body>
				</Card>
			) : (
				<Card
					className="border-0 shadow-sm rounded-4 d-inline-block text-start"
					style={{ maxWidth: '550px', width: '100%' }}
				>
					<Card.Body className="p-5 d-flex flex-column align-items-center text-center">
						<div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex p-3.5 mb-4 border border-success border-opacity-25">
							<Award size={44} className="text-warning" />
						</div>
						<h4 className="fw-bold mb-2">Sertifikat Anda Telah Siap!</h4>
						<p className="text-muted small mb-4">
							Terima kasih telah berpartisipasi dan mengirimkan ulasan
							evaluasi. Anda dapat melihat preview sertifikat digital Anda
							secara instan dan mengunduhnya dalam format PDF berkualitas
							tinggi.
						</p>
						<div className="bg-light p-3.5 rounded-4 w-100 mb-4 border border-dashed text-start">
							<div className="d-flex justify-content-between mb-2">
								<span className="text-muted small">Status Klaim</span>
								<Badge
									bg="success"
									className="px-2.5 py-1.5 rounded-pill fw-semibold"
								>
									AKTIF & TERVERIFIKASI
								</Badge>
							</div>
							<div className="d-flex justify-content-between">
								<span className="text-muted small">Nama Penerima</span>
								<span
									className="fw-bold text-dark text-truncate"
									style={{ maxWidth: '220px' }}
								>
									{participantName || 'Peserta Kelas'}
								</span>
							</div>
						</div>
						<Link
							to={`/event-space/${id}/survey`}
							className="w-100 text-decoration-none"
						>
							<Button
								variant="success"
								className="w-100 rounded-pill py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
							>
								<Download size={18} /> Lihat & Unduh Sertifikat (PDF)
							</Button>
						</Link>
					</Card.Body>
				</Card>
			)}
		</div>
	);
};

export default CertificateTab;
