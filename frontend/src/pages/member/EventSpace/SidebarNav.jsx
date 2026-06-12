import React from 'react';
import { Card, Nav, Badge, Button } from 'react-bootstrap';
import {
	Layout,
	BookOpen,
	MessageCircle,
	Megaphone,
	Gift,
	Award,
} from 'lucide-react';

const SidebarNav = ({ activeTab, setActiveTab, memberPoints, alreadySubmitted, canClaimCertificate }) => {
	return (
		<>
			{/* MOBILE HORIZONTAL NAVIGATION (Visible on screens smaller than md) */}
			<div className="d-block d-md-none mb-3">
				<div 
					className="d-flex overflow-x-auto pb-2 gap-2 text-nowrap scrollbar-hidden" 
					style={{ 
						scrollbarWidth: 'none', 
						msOverflowStyle: 'none',
						WebkitOverflowScrolling: 'touch'
					}}
				>
					<Button
						variant={activeTab === 'overview' ? 'primary' : 'white'}
						className={`rounded-pill px-3 py-2 fw-medium d-flex align-items-center gap-2 border ${activeTab === 'overview' ? 'shadow-sm text-white' : 'text-dark bg-white'}`}
						onClick={() => setActiveTab('overview')}
						style={{ fontSize: '13px' }}
					>
						<Layout size={16} /> Overview
					</Button>
					
					<Button
						variant={activeTab === 'materi' ? 'primary' : 'white'}
						className={`rounded-pill px-3 py-2 fw-medium d-flex align-items-center gap-2 border ${activeTab === 'materi' ? 'shadow-sm text-white' : 'text-dark bg-white'}`}
						onClick={() => setActiveTab('materi')}
						style={{ fontSize: '13px' }}
					>
						<BookOpen size={16} /> Materi
					</Button>

					<Button
						variant={activeTab === 'diskusi' ? 'primary' : 'white'}
						className={`rounded-pill px-3 py-2 fw-medium d-flex align-items-center gap-2 border ${activeTab === 'diskusi' ? 'shadow-sm text-white' : 'text-dark bg-white'}`}
						onClick={() => setActiveTab('diskusi')}
						style={{ fontSize: '13px' }}
					>
						<MessageCircle size={16} /> Diskusi
					</Button>

					<Button
						variant={activeTab === 'pengumuman' ? 'primary' : 'white'}
						className={`rounded-pill px-3 py-2 fw-medium d-flex align-items-center gap-2 border ${activeTab === 'pengumuman' ? 'shadow-sm text-white' : 'text-dark bg-white'}`}
						onClick={() => setActiveTab('pengumuman')}
						style={{ fontSize: '13px' }}
					>
						<Megaphone size={16} /> Pengumuman
					</Button>

					<Button
						variant={activeTab === 'rewards' ? 'primary' : 'white'}
						className={`rounded-pill px-3 py-2 fw-medium d-flex align-items-center gap-2 border ${activeTab === 'rewards' ? 'shadow-sm text-white' : 'text-dark bg-white'}`}
						onClick={() => setActiveTab('rewards')}
						style={{ fontSize: '13px' }}
					>
						<Gift size={16} style={{ color: activeTab === 'rewards' ? '#fff' : '#0d9488' }} /> 
						Tukar Reward
						<Badge 
							bg={activeTab === 'rewards' ? 'light' : 'primary-subtle'} 
							className={`${activeTab === 'rewards' ? 'text-dark' : 'text-primary'} rounded-pill border px-1.5 py-0.5`}
							style={{ fontSize: '10px' }}
						>
							{memberPoints || 0} Pts
						</Badge>
					</Button>

					{canClaimCertificate && (
						<Button
							variant={activeTab === 'sertifikat' ? 'success' : 'white'}
							className={`rounded-pill px-3 py-2 fw-medium d-flex align-items-center gap-2 border ${activeTab === 'sertifikat' ? 'shadow-sm text-white' : 'text-success bg-white'}`}
							onClick={() => setActiveTab('sertifikat')}
							style={{ fontSize: '13px' }}
						>
							<Award size={16} /> Sertifikat
							{alreadySubmitted ? (
								<Badge
									bg="success-subtle"
									text="success"
									className="rounded-pill border border-success border-opacity-10"
									style={{ fontSize: '10px', padding: '0.2rem 0.4rem' }}
								>
									Aktif
								</Badge>
							) : (
								<Badge
									bg="warning-subtle"
									text="warning"
									className="rounded-pill border border-warning border-opacity-10"
									style={{ fontSize: '10px', padding: '0.2rem 0.4rem' }}
								>
									Klaim
								</Badge>
							)}
						</Button>
					)}
				</div>
			</div>

			{/* DESKTOP SIDEBAR NAVIGATION (Visible on screens md and larger) */}
			<div className="d-none d-md-block">
				<Card
					className="border-0 shadow-sm rounded-4 position-sticky"
					style={{ top: '100px' }}
				>
					<Card.Body className="p-3">
						<Nav className="flex-column gap-2 custom-pills">
							<Nav.Link
								className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'overview' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
								onClick={() => setActiveTab('overview')}
							>
								<Layout size={18} className="me-3" /> Overview
							</Nav.Link>
							<Nav.Link
								className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'materi' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
								onClick={() => setActiveTab('materi')}
							>
								<BookOpen size={18} className="me-3" /> Materi Pembelajaran
							</Nav.Link>
							<Nav.Link
								className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'diskusi' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
								onClick={() => setActiveTab('diskusi')}
							>
								<MessageCircle size={18} className="me-3" /> Forum Diskusi
							</Nav.Link>
							<Nav.Link
								className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'pengumuman' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
								onClick={() => setActiveTab('pengumuman')}
							>
								<Megaphone size={18} className="me-3" /> Pengumuman Event
							</Nav.Link>
							<Nav.Link
								className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'rewards' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
								onClick={() => setActiveTab('rewards')}
								style={{ transition: 'background-color 0.2s' }}
							>
								<Gift size={18} className="me-3" style={{ color: activeTab === 'rewards' ? '#fff' : '#0d9488' }} /> 
								Tukar Local Reward
								<Badge bg={activeTab === 'rewards' ? 'light' : 'primary-subtle'} className={`${activeTab === 'rewards' ? 'text-dark' : 'text-primary'} ms-auto rounded-pill border small font-bold px-2 py-1`}>
									{memberPoints || 0} Pts
								</Badge>
							</Nav.Link>

							{canClaimCertificate && (
								<>
									<hr className="my-2.5 opacity-25" />

									<Nav.Link
										className={`d-flex align-items-center px-3 py-2.5 rounded-3 fw-medium ${activeTab === 'sertifikat' ? 'bg-success text-white shadow-sm' : 'text-success hover-bg-success-subtle'}`}
										onClick={() => setActiveTab('sertifikat')}
										style={{ transition: 'all 0.2s ease' }}
									>
										<Award size={18} className="me-3" /> Sertifikat
										{alreadySubmitted ? (
											<Badge
												bg="success-subtle"
												text="success"
												className="ms-auto rounded-pill border border-success border-opacity-10 small"
											>
												Aktif
											</Badge>
										) : (
											<Badge
												bg="warning-subtle"
												text="warning"
												className="ms-auto rounded-pill border border-warning border-opacity-10 small"
											>
												Klaim
											</Badge>
										)}
									</Nav.Link>
								</>
							)}
						</Nav>
					</Card.Body>
				</Card>
			</div>
		</>
	);
};

export default SidebarNav;
