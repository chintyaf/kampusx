import React from 'react';
import { Container, Button, Badge } from 'react-bootstrap';
import { ArrowLeft, Users, Wifi, Share2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EventHeader = ({
	eventDetails,
	isBookmarked,
	handleShare,
	handleToggleBookmark,
}) => {
	const navigate = useNavigate();

	return (
		<div className="bg-white border-bottom pt-4 pb-4 mb-4 shadow-sm">
			<Container>
				<Button
					variant="link"
					className="text-decoration-none p-0 d-flex align-items-center mb-3 text-muted"
					onClick={() => navigate(-1)}
				>
					<ArrowLeft size={16} className="me-2" /> Kembali
				</Button>
				<div className="d-flex gap-2 mb-3">
					{/* Render tipe event (Online/Onsite) */}
					{eventDetails.is_in_person ? (
						<Badge
							bg="light"
							text="dark"
							className="border px-3 py-2 d-flex align-items-center"
						>
							<Users size={14} className="me-1" /> Onsite
						</Badge>
					) : null}
					{eventDetails.is_online ? (
						<Badge
							bg="light"
							text="primary"
							className="border border-primary px-3 py-2 d-flex align-items-center"
						>
							<Wifi size={14} className="me-1" /> Online
						</Badge>
					) : null}
					{/* Kategori Event (Jika ada) */}
					{eventDetails.category ? (
						<Badge bg="light" text="dark" className="border px-3 py-2">
							{eventDetails.category}
						</Badge>
					) : null}
				</div>

				{/* Judul + Action Buttons */}
				<div className="d-flex justify-content-between align-items-start mb-3 gap-3">
					<div className="flex-grow-1">
						<h1
							className="fw-bold m-0"
							style={{
								color: 'var(--color-text)',
								fontSize: '2.5rem',
								lineHeight: 1.2,
							}}
						>
							{eventDetails.title}
						</h1>

						<p className="text-muted fs-5 mb-0" style={{ maxWidth: '800px' }}>
							{eventDetails.short_description ||
								'Bergabunglah dalam event luar biasa ini dan tingkatkan portofolio serta kemampuan profesional Anda bersama KampusX.'}
						</p>
					</div>

					<div className="d-flex gap-2 flex-shrink-0 mt-2">
						{/* Share */}
						<button
							onClick={handleShare}
							title="Bagikan Event"
							style={{
								width: '38px',
								height: '38px',
								borderRadius: '50%',
								border: '1.5px solid #e2e8f0',
								background: 'transparent',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								color: '#64748b',
								transition: 'all 0.15s ease',
							}}
							onMouseOver={(e) => {
								e.currentTarget.style.background = '#f8fafc';
								e.currentTarget.style.borderColor = '#cbd5e1';
								e.currentTarget.style.color = '#334155';
							}}
							onMouseOut={(e) => {
								e.currentTarget.style.background = 'transparent';
								e.currentTarget.style.borderColor = '#e2e8f0';
								e.currentTarget.style.color = '#64748b';
							}}
						>
							<Share2 size={16} strokeWidth={2} />
						</button>

						{/* Bookmark */}
						<button
							onClick={handleToggleBookmark}
							title={isBookmarked ? 'Hapus dari Simpan' : 'Simpan Event'}
							style={{
								width: '38px',
								height: '38px',
								borderRadius: '50%',
								border: `1.5px solid ${isBookmarked ? '#fecaca' : '#e2e8f0'}`,
								background: isBookmarked ? '#fff5f5' : 'transparent',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								transition: 'all 0.15s ease',
							}}
							onMouseOver={(e) => {
								if (!isBookmarked) {
									e.currentTarget.style.background = '#fff5f5';
									e.currentTarget.style.borderColor = '#fecaca';
								}
							}}
							onMouseOut={(e) => {
								if (!isBookmarked) {
									e.currentTarget.style.background = 'transparent';
									e.currentTarget.style.borderColor = '#e2e8f0';
								}
							}}
						>
							<Heart
								size={16}
								strokeWidth={2}
								style={{
									fill: isBookmarked ? '#ef4444' : 'none',
									color: isBookmarked ? '#ef4444' : '#64748b',
									transition: 'all 0.15s ease',
								}}
							/>
						</button>
					</div>
				</div>
			</Container>
		</div>
	);
};

export default EventHeader;
