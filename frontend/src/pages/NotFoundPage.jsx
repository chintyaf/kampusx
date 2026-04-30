import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import KampusXLogo from '@/assets/images/logo/Logo_KampusX.svg'; // Sesuaikan path ini dengan struktur folder Anda

const NotFound = () => {
	const navigate = useNavigate();

	return (
		<div className="min-vh-100 d-flex flex-column" style={{ background: 'var(--color-bg)' }}>
			{/* Header */}
			<header className="px-4 py-3 border-bottom bg-white">
				{/* Gunakan tag img, dan atur ukurannya via style atau class */}
				<img src={KampusXLogo} alt="Logo KampusX" style={{ height: '40px' }} />
			</header>

			{/* Main Content */}
			<main className="flex-grow-1 d-flex align-items-center justify-content-center px-3">
				<div className="text-center">
					{/* 404 Number */}
					<div>
						<span
							style={{
								fontSize: 'clamp(100px, 22vw, 180px)',
								fontWeight: '900',
								lineHeight: 1,
								background:
									'linear-gradient(135deg, var(--bahama-blue-700), var(--bahama-blue-400))',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
								display: 'block',
								letterSpacing: '-0.04em',
							}}>
							404
						</span>
					</div>

					{/* Text & CTA */}
					<div className="mt-3">
						<h1
							className="text-body mb-2"
							style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '700' }}>
							Halaman Tidak Ditemukan
						</h1>
						<p
							className="text-muted mb-4 mx-auto"
							style={{ fontSize: '15px', maxWidth: '320px' }}>
							Kayak kelas kosong di hari Senin — nggak ada yang bisa ditemukan di
							sini.
						</p>

						{/* Tombol CTA */}
						<button
							onClick={() => navigate('/')}
							className="btn d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2 text-white fw-semibold border-0"
							style={{
								borderRadius: '0.75rem',
								fontSize: '0.875rem',
								background:
									'linear-gradient(135deg, var(--bahama-blue-700), var(--bahama-blue-500))',
								boxShadow: '0 4px 20px rgba(0,105,158,0.35)',
								transition: 'all 0.3s ease',
							}}>
							<Home size={18} />
							Kembali ke Beranda
						</button>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer
				className="px-4 py-3 text-center"
				style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
				© {new Date().getFullYear()} KampusX — Student Hub Space
			</footer>
		</div>
	);
};

export default NotFound;
