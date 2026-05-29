import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { Heart, Search, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import EventCard from '../../../components/event/EventCard';
import api from '../../../api/axios';

const BookmarkPage = () => {
	const navigate = useNavigate();
	const [bookmarks, setBookmarks] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchBookmarks = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await api.get('v1/bookmarks');
			const result = res.data;
			const list = result?.data ?? result ?? [];
			setBookmarks(list);
		} catch (err) {
			console.error('Gagal memuat bookmark:', err);
			setError('Gagal memuat daftar bookmark Anda. Pastikan koneksi internet stabil.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchBookmarks();
	}, []);

	return (
		<div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 56 }}>
			{/* ── HEADER ──────────────────────────────────────────────────────── */}
			<div
				style={{
					background: 'var(--color-white)',
					borderBottom: '1px solid var(--color-border)',
					padding: '28px 0 24px',
					marginBottom: 32,
					boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
				}}>
				<Container>
					<div>
						<h2
							style={{
								fontWeight: 800,
								color: 'var(--color-text)',
								margin: 0,
								fontSize: 'var(--font-xl)',
							}}>
							Bookmark Saya
						</h2>
						<p
							style={{
								color: 'var(--color-secondary)',
								margin: '4px 0 0',
								fontSize: 'var(--font-sm)',
							}}>
							Daftar event kampus pilihan yang telah Anda simpan
						</p>
					</div>
				</Container>
			</div>

			<Container>
				{/* Loading */}
				{isLoading && (
					<div style={{ textAlign: 'center', padding: '80px 0' }}>
						<Spinner animation="border" style={{ color: 'var(--color-primary)' }} />
						<p
							style={{
								marginTop: 12,
								color: 'var(--color-secondary)',
								fontSize: 'var(--font-sm)',
							}}>
							Memuat event yang disimpan…
						</p>
					</div>
				)}

				{/* Error */}
				{error && !isLoading && (
					<Alert
						style={{
							borderRadius: 10,
							fontSize: 'var(--font-sm)',
							background: 'var(--error-bg)',
							border: '1px solid var(--error-border)',
							color: 'var(--error-text)',
							marginBottom: 24,
						}}>
						{error}
					</Alert>
				)}

				{/* Empty State */}
				{!isLoading && !error && bookmarks.length === 0 && (
					<div
						style={{
							textAlign: 'center',
							padding: '80px 20px',
							background: 'var(--color-white)',
							borderRadius: 16,
							border: '1px solid var(--color-border)',
							boxShadow: '0 4px 12px rgba(0,105,158,0.03)',
							maxWidth: 580,
							margin: '0 auto',
						}}>
						<div
							style={{
								width: 80,
								height: 80,
								borderRadius: '50%',
								background: 'var(--bahama-blue-50)',
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								marginBottom: 20,
							}}>
							<Heart size={36} color="var(--color-primary)" style={{ opacity: 0.8 }} />
						</div>
						<h4
							style={{
								fontWeight: 700,
								color: 'var(--color-text)',
								marginBottom: 8,
							}}>
							Belum Ada Event Tersimpan
						</h4>
						<p
							style={{
								color: 'var(--color-secondary)',
								fontSize: 'var(--font-sm)',
								lineHeight: 1.6,
								maxWidth: 400,
								margin: '0 auto 24px',
							}}>
							Temukan berbagai event kampus menarik, simpan ke bookmark, dan pantau
							semua kegiatannya di sini.
						</p>
						<Button
							as={Link}
							to="/explore-events"
							style={{
								background: 'var(--color-primary)',
								border: 'none',
								borderRadius: 8,
								padding: '10px 24px',
								fontWeight: 700,
								fontSize: 'var(--font-sm)',
								display: 'inline-flex',
								alignItems: 'center',
								gap: 8,
							}}>
							Eksplor Event Sekarang <ArrowRight size={16} />
						</Button>
					</div>
				)}

				{/* Event Grid */}
				{!isLoading && !error && bookmarks.length > 0 && (
					<Row className="g-4">
						{bookmarks.map((ev) => (
							<Col xs={12} md={6} xl={4} key={ev.id}>
								<EventCard ev={ev} onClick={() => navigate(`/event/${ev.slug || ev.id}`)} />
							</Col>
						))}
					</Row>
				)}
			</Container>
		</div>
	);
};

export default BookmarkPage;
