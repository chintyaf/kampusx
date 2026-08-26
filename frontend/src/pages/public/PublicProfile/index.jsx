import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { Calendar as CalendarIcon, ExternalLink, BookOpen } from 'lucide-react';
import api from '../../../api/axios';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileTabs from './ProfileTabs';
import CertificateGrid from './CertificateGrid';

const UserProfile = () => {
	const { id } = useParams();
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState('certificates');

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			setError(null);
			try {
				const res = await api.get(`/profile/${id}`);
				if (res.data?.success) {
					setData(res.data.data);
				} else {
					setError('Gagal memuat profil user.');
				}
			} catch (err) {
				console.error(err);
				setError(err.response?.data?.message || 'Profil user tidak ditemukan.');
			} finally {
				setIsLoading(false);
			}
		})();
	}, [id]);

	if (isLoading) {
		return (
			<div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
				<Spinner animation="border" style={{ color: 'var(--color-primary)' }} />
				<p className="mt-3 text-muted fw-semibold" style={{ fontSize: 'var(--font-sm)' }}>Memuat profil user…</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="d-flex flex-column align-items-center justify-content-center px-4" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
				<div className="bg-white border text-center p-5 rounded-4 shadow-sm" style={{ maxWidth: '400px', borderColor: 'var(--color-border)' }}>
					<h4 className="text-danger fw-bold mb-3">Oops!</h4>
					<p className="text-muted mb-4">{error}</p>
					<Link to="/" className="btn btn-dark rounded-pill px-4" style={{ backgroundColor: 'var(--color-text)', border: 'none' }}>
						Kembali ke Beranda
					</Link>
				</div>
			</div>
		);
	}

	const { profile = {}, interests = [], certificates = [], history = {}, learning_paths = [], is_own_profile = false } = data || {};
	const allEvents = [...(history.upcoming || []), ...(history.past || [])];

	const renderLearningTab = () => {
		if (!learning_paths || learning_paths.length === 0) {
			return (
				<div className="text-center py-5">
					<div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
						<BookOpen size={28} className="text-muted" />
					</div>
					<h5 className="fw-bold" style={{ color: 'var(--color-text)' }}>Belum Memulai Modul Belajar</h5>
					<p className="text-muted small mx-auto" style={{ maxWidth: '300px' }}>
						User ini belum mendaftar atau memulai modul pembelajaran apa pun.
					</p>
				</div>
			);
		}

		return (
			<Row className="g-4">
				{learning_paths.map((path) => {
					const isCompleted = path.status === 'completed';
					return (
						<Col md={6} key={path.id}>
							<div
								style={{
									background: '#fff',
									borderRadius: 16,
									border: '1px solid #e8ecf0',
									overflow: 'hidden',
									boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
									display: 'flex',
									flexDirection: 'column',
									height: '100%',
								}}
							>
								{/* Cover Image */}
								<div style={{ position: 'relative', width: '100%', height: 130 }}>
									<img
										src={path.thumbnail || 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&q=80'}
										alt={path.title}
										style={{ width: '100%', height: '100%', objectFit: 'cover' }}
									/>
									<div style={{
										position: 'absolute',
										inset: 0,
										background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 100%)',
									}} />
									
									{/* Category Tag Overlay */}
									<div style={{
										position: 'absolute',
										top: 10,
										left: 10,
										background: 'rgba(255, 255, 255, 0.95)',
										backdropFilter: 'blur(4px)',
										borderRadius: 6,
										padding: '2px 8px',
										fontSize: 9,
										fontWeight: 800,
										color: '#7c3aed',
										textTransform: 'uppercase',
									}}>
										{path.category || 'Belajar'}
									</div>

									{/* Status Overlay */}
									<div style={{
										position: 'absolute',
										top: 10,
										right: 10,
										background: isCompleted ? '#d1fae5' : '#e0f2fe',
										borderRadius: 20,
										padding: '2px 8px',
										fontSize: 9,
										fontWeight: 850,
										color: isCompleted ? '#065f46' : '#0369a1',
									}}>
										{isCompleted ? '🏆 Selesai' : '⏳ Berjalan'}
									</div>
								</div>

								{/* Body */}
								<div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
									<div>
										<h5 style={{ fontSize: 13, fontWeight: 850, color: '#0f172a', margin: '0 0 6px', lineHeight: 1.4 }}>
											{path.title}
										</h5>
										<div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center', marginBottom: 12 }}>
											<span style={{ textTransform: 'capitalize' }}>{path.difficulty_level}</span>
											<span>•</span>
											<span>{path.completed_lessons}/{path.total_lessons} Pelajaran</span>
										</div>
									</div>

									{/* Progress bar */}
									<div>
										<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>
											<span>Progres Modul</span>
											<span>{path.progress_percentage}%</span>
										</div>
										<div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
											<div 
												style={{ 
													height: '100%', 
													width: `${path.progress_percentage}%`, 
													background: isCompleted ? '#16a34a' : '#00699e', 
													borderRadius: 999,
													transition: 'width 0.4s ease'
												}} 
											/>
										</div>
									</div>
								</div>
							</div>
						</Col>
					);
				})}
			</Row>
		);
	};

	return (
		<div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
			<Container className="py-5">
				<ProfileHeader profile={profile} interests={interests} isOwnProfile={is_own_profile} />
				<ProfileStats stats={profile} onEventClick={() => setActiveTab('history')} />
				<ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

				{activeTab === 'certificates' ? (
					<CertificateGrid certificates={certificates} />
				) : activeTab === 'learning' ? (
					renderLearningTab()
				) : (
					<div>
						{allEvents.length === 0 ? (
							<div className="text-center py-5">
								<div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
									<CalendarIcon size={28} className="text-muted" />
								</div>
								<h5 className="fw-bold" style={{ color: 'var(--color-text)' }}>Belum Mengikuti Event</h5>
								<p className="text-muted small mx-auto" style={{ maxWidth: '300px' }}>
									User ini belum terdaftar atau menyelesaikan event apa pun.
								</p>
							</div>
						) : (
							<Row className="g-3">
								{allEvents.map((event) => (
									<Col md={6} key={event.id}>
										<div 
											className="d-flex align-items-center p-3 border bg-white" 
											style={{ 
												borderColor: 'var(--color-border)', 
												boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
												borderRadius: 12,
												transition: 'transform 0.2s ease, box-shadow 0.2s ease'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform = 'translateY(-2px)';
												e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
											}}
										>
											<div className="flex-grow-1">
												<Badge bg="light" text="secondary" className="border mb-2 text-capitalize">
													{event.status === 'published' ? 'Selesai' : 'Mendatang'}
												</Badge>
												<h6 className="fw-bold mb-1 text-truncate" style={{ color: 'var(--color-text)', maxWidth: '90%' }}>
													{event.title}
												</h6>
												<small className="text-muted">
													{new Date(event.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
												</small>
											</div>
											<Link 
												to={`/event/${event.slug || event.id}`} 
												className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border"
												style={{ width: '40px', height: '40px' }}
											>
												<ExternalLink size={16} className="text-secondary" />
											</Link>
										</div>
									</Col>
								))}
							</Row>
						)}
					</div>
				)}
			</Container>
		</div>
	);
};

export default UserProfile;