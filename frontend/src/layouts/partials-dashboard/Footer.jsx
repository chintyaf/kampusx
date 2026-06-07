import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Linkedin, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoKampusX from "../../assets/images/logo/Logo_KampusX_White_Text.png";

const Footer = () => {
	const { isAuthenticated } = useAuth();

	return (
		<footer
			style={{
				background: '#091524',
				color: '#b0bccb',
				padding: '60px 0 30px',
				fontSize: 'var(--font-sm)',
				borderTop: '1px solid rgba(255, 255, 255, 0.05)',
			}}
		>
			<Container>
				<Row className="g-4">
					{/* Kolom 1: Brand & Sosial Media */}
					<Col lg={5} md={6}>
						<div className="mb-3">
							<Link to="/" className="text-decoration-none fw-bold fs-4" style={{ color: 'var(--color-primary, #00699e)' }}>
							{/* <div className="logo-title">KampusX</div> */}
								<img src={LogoKampusX} alt="KampusX" width="100" />
								{/* Kampus<span style={{ color: '#ffffff' }}>X</span> */}
							</Link>
						</div>
						<p style={{ lineHeight: 1.6, maxWidth: '340px', marginBottom: '24px' }}>
							Platform manajemen event & gamifikasi kampus terdepan. Tingkatkan Xperience dan portofolio profesional mahasiswa melalui event terverifikasi.
						</p>
						<div className="d-flex gap-3">
							<a
								href="https://instagram.com"
								target="_blank"
								rel="noopener noreferrer"
								style={{
									color: '#b0bccb',
									background: 'rgba(255, 255, 255, 0.05)',
									width: '36px',
									height: '36px',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									transition: 'all 0.2s ease-in-out',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.color = '#ffffff';
									e.currentTarget.style.background = 'var(--color-primary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.color = '#b0bccb';
									e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
								}}
							>
								<Instagram size={18} />
							</a>
							<a
								href="https://twitter.com"
								target="_blank"
								rel="noopener noreferrer"
								style={{
									color: '#b0bccb',
									background: 'rgba(255, 255, 255, 0.05)',
									width: '36px',
									height: '36px',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									transition: 'all 0.2s ease-in-out',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.color = '#ffffff';
									e.currentTarget.style.background = 'var(--color-primary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.color = '#b0bccb';
									e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
								}}
							>
								<Twitter size={18} />
							</a>
							<a
								href="https://linkedin.com"
								target="_blank"
								rel="noopener noreferrer"
								style={{
									color: '#b0bccb',
									background: 'rgba(255, 255, 255, 0.05)',
									width: '36px',
									height: '36px',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									transition: 'all 0.2s ease-in-out',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.color = '#ffffff';
									e.currentTarget.style.background = 'var(--color-primary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.color = '#b0bccb';
									e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
								}}
							>
								<Linkedin size={18} />
							</a>
						</div>
					</Col>

					{/* Kolom 2: Eksplorasi */}
					<Col lg={3} md={3} sm={6} className="ps-lg-5">
						<h6 className="text-white fw-bold mb-3" style={{ letterSpacing: '0.5px' }}>Eksplorasi</h6>
						<ul className="list-unstyled mb-0" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
							<li>
								<Link
									to="/"
									className="text-decoration-none hover-link"
									style={{ color: '#b0bccb', transition: 'color 0.15s' }}
									onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
									onMouseLeave={(e) => (e.currentTarget.style.color = '#b0bccb')}
								>
									Beranda
								</Link>
							</li>
							<li>
								<Link
									to="/explore-events"
									className="text-decoration-none hover-link"
									style={{ color: '#b0bccb', transition: 'color 0.15s' }}
									onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
									onMouseLeave={(e) => (e.currentTarget.style.color = '#b0bccb')}
								>
									Eksplor Event
								</Link>
							</li>
							{isAuthenticated && (
								<li>
									<Link
										to="/rewards"
										className="text-decoration-none hover-link"
										style={{ color: '#b0bccb', transition: 'color 0.15s' }}
										onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
										onMouseLeave={(e) => (e.currentTarget.style.color = '#b0bccb')}
									>
										Katalog Reward
									</Link>
								</li>
							)}
						</ul>
					</Col>

					{/* Kolom 3: Bantuan & Kebijakan */}
					<Col lg={4} md={3} sm={6}>
						<h6 className="text-white fw-bold mb-3" style={{ letterSpacing: '0.5px' }}>Bantuan & Informasi</h6>
						<ul className="list-unstyled mb-0" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
							<li>
								<Link
									to="/about"
									className="text-decoration-none"
									style={{ color: '#b0bccb', transition: 'color 0.15s' }}
									onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
									onMouseLeave={(e) => (e.currentTarget.style.color = '#b0bccb')}
								>
									Tentang Kami
								</Link>
							</li>
							<li>
								<Link
									to="/syarat-ketentuan"
									className="text-decoration-none"
									style={{ color: '#b0bccb', transition: 'color 0.15s' }}
									onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
									onMouseLeave={(e) => (e.currentTarget.style.color = '#b0bccb')}
								>
									Syarat & Ketentuan
								</Link>
							</li>
							<li>
								<Link
									to="/kebijakan-privasi"
									className="text-decoration-none"
									style={{ color: '#b0bccb', transition: 'color 0.15s' }}
									onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
									onMouseLeave={(e) => (e.currentTarget.style.color = '#b0bccb')}
								>
									Kebijakan Privasi
								</Link>
							</li>
						</ul>
					</Col>
				</Row>

				<hr className="border-secondary my-4" style={{ opacity: 0.1 }} />

				<Row className="align-items-center">
					<Col md={6} className="text-center text-md-start mb-2 mb-md-0">
						<span style={{ fontSize: '12px', color: '#7c8b9e' }}>
							© 2026 KampusX. All rights reserved.
						</span>
					</Col>
					<Col md={6} className="text-center text-md-end">
						<span className="d-inline-flex align-items-center gap-1" style={{ fontSize: '12px', color: '#7c8b9e' }}>
							<Globe size={12} /> Bahasa Indonesia
						</span>
					</Col>
				</Row>
			</Container>
		</footer>
	);
};

export default Footer;
