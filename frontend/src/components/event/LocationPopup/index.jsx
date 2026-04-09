import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { MapPin, Navigation, MapPinOff, CheckCircle, Search } from 'lucide-react';

// PERUBAHAN: Kita menghapus 'show' dan 'handleClose' dari parameter props
const LocationPopup = ({ onLocationSuccess }) => {
	// PERUBAHAN: State internal untuk mengatur visibilitas modal. Default-nya TRUE (langsung muncul)
	const [showModal, setShowModal] = useState(false);

	const [status, setStatus] = useState('idle');
	const [location, setLocation] = useState({ latitude: null, longitude: null });
	const [permissionState, setPermissionState] = useState('prompt');
	// State baru untuk menyembunyikan modal saat popup browser muncul
	const [isPrompting, setIsPrompting] = useState(false);
	// PERBAIKAN 2: Menambahkan kembali state errorMessage
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		// 1. Cek apakah user sudah punya pilihan tersimpan
		const locationPreference = localStorage.getItem('user-location-preference');

		// 2. Jika belum ada pilihan, baru munculkan modal
		if (!locationPreference) {
			setShowModal(true);
		}

		if ((locationPreference === 'granted')) {
			setShowModal(false);
			handleRequestLocation();
		}
	}, []);

	// (useEffect untuk Permissions API tetap sama seperti sebelumnya...)
	useEffect(() => {
		if (!navigator.permissions) return;
		navigator.permissions.query({ name: 'geolocation' }).then((result) => {
			setPermissionState(result.state);
			if (result.state === 'denied') setStatus('error');

			result.onchange = () => {
				setPermissionState(result.state);
				if (result.state === 'granted') {
					handleRequestLocation();
				} else if (result.state === 'denied') {
					setStatus('error');
				} else {
					setStatus('idle');
				}
			};
		});
	}, []);

	const savePreference = (choice) => {
		// choice bisa berupa 'granted' atau 'manual'
		localStorage.setItem('user-location-preference', choice);
		setShowModal(false);
	};

	const handleRequestLocation = () => {
		if (!navigator.geolocation) {
			setStatus('error');
			return;
		}

		setStatus('loading');
		// PERBAIKAN 3: Menghapus variabel 'shouldHide' yang tidak terdefinisi
		if (permissionState === 'prompt') {
			setIsPrompting(true);
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				setIsPrompting(false); // Munculkan modal kembali
				const coords = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				};
				setLocation(coords);
				setStatus('success');
				savePreference('granted'); // Simpan bahwa sudah sukses
				if (onLocationSuccess) onLocationSuccess(coords);
			},
			(error) => {
				setIsPrompting(false); // Munculkan modal kembali
				setStatus('error');
				setPermissionState('denied');
				// PERBAIKAN 4: Menangani pesan error dengan benar
				switch (error.code) {
					case error.PERMISSION_DENIED:
						setErrorMessage('Akses lokasi ditolak.');
						break;
					case error.POSITION_UNAVAILABLE:
						setErrorMessage('Informasi lokasi tidak tersedia saat ini.');
						break;
					case error.TIMEOUT:
						setErrorMessage('Waktu permintaan lokasi habis.');
						break;
					default:
						setErrorMessage('Terjadi kesalahan yang tidak diketahui.');
						break;
				}
			},
		);
	};

	const onCloseInternal = () => {
		if (permissionState !== 'denied') setStatus('idle');

		// PERUBAHAN: Saat ditutup, ubah state internal menjadi false
		setShowModal(false);
	};

	// Fungsi baru untuk menangani penolakan eksplisit dari user
	const handleRefuseLocation = () => {
		// Di sini Anda bisa menyimpan preferensi di localStorage
		// agar popup ini tidak otomatis muncul lagi di masa depan.
		// localStorage.setItem('hasRefusedLocation', 'true');
		savePreference('manual');
		onCloseInternal();
	};

	const isModalVisible = showModal && !isPrompting;

	return (
		<Modal show={isModalVisible} onHide={onCloseInternal} centered backdrop="static">
			<Modal.Header className="border-0 pb-0" closeButton></Modal.Header>
			<Modal.Body className="text-center p-4">
				{/* Tampilan Default */}
				{status === 'idle' && permissionState !== 'denied' && (
					<>
						<div className="mb-4 text-primary">
							<MapPin size={56} strokeWidth={1.5} />
						</div>
						<h4 className="fw-bold mb-2">Temukan Event Sekitarmu</h4>
						<p className="text-muted mb-5">
							Izinkan akses lokasi untuk mendapatkan rekomendasi event terdekat secara
							otomatis.
						</p>
						<div className="d-grid gap-2">
							<Button
								variant="primary"
								size="lg"
								className="w-100 d-flex align-items-center justify-content-center gap-2 rounded-pill shadow-sm py-3"
								onClick={handleRequestLocation}>
								<Navigation size={18} />
								Gunakan Lokasi Saat Ini
							</Button>
							{/* Tombol Tolak/Cari Manual */}
							<Button
								variant="outline-secondary"
								className="d-flex align-items-center justify-content-center gap-2 rounded-pill mt-2"
								onClick={handleRefuseLocation}>
								<Search size={18} />
								Cari Manual Saja
							</Button>
						</div>
					</>
				)}

				{/* Tampilan Sukses */}
				{status === 'success' && (
					<div className="py-2">
						<div className="mb-3 text-success">
							<CheckCircle size={56} strokeWidth={1.5} />
						</div>
						<h4 className="mb-2">Berhasil!</h4>
						<p className="text-muted small mb-3">
							Lokasi ditemukan. Kami sedang menyiapkan daftar event untukmu.
						</p>
						<div className="bg-light p-2 rounded mb-3 small border">
							<code>
								{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
							</code>
						</div>
						<Button
							variant="success"
							className="w-100 rounded-pill"
							onClick={onCloseInternal}>
							Lihat Event
						</Button>
					</div>
				)}

				{/* Tampilan Error (Terbagi menjadi 2 kondisi: Diblokir vs Error Biasa) */}
				{status === 'error' && (
					<div className="py-2">
						<div className="mb-3 text-danger">
							<MapPinOff size={56} strokeWidth={1.5} />
						</div>

						{/* Kondisi 1: Akses Lokasi DIBLOKIR oleh pengguna */}
						{permissionState === 'denied' ? (
							<>
								<h5 className="mb-3">Akses Lokasi Diblokir</h5>
								<div className="text-start bg-light p-3 rounded mb-4 border border-warning">
									<p className="small fw-bold text-dark mb-2">
										Ingin menggunakan lokasi otomatis?
									</p>
									<ol className="small text-muted mb-0 ps-3">
										<li className="mb-1">
											Klik ikon 🔒 <strong>(Gembok)</strong> di bar alamat
											browser.
										</li>
										<li className="mb-1">
											Cari <strong>Location</strong> dan ubah menjadi{' '}
											<strong>Allow</strong>.
										</li>
										<li>
											<strong>Kembali ke sini</strong>, dan lokasi akan dimuat
											otomatis.
										</li>
									</ol>
								</div>
								{/* Perhatikan: Tidak ada tombol "Coba Lagi" di sini */}
								<Button
									variant="secondary"
									className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
									onClick={handleRefuseLocation}>
									<Search size={18} />
									Tetap Cari Manual Saja
								</Button>
							</>
						) : (
							/* Kondisi 2: Error lainnya (Timeout, Sinyal GPS hilang, dll) */
							<>
								<h5 className="mb-3">Akses Lokasi Gagal</h5>
								<Alert variant="danger" className="py-2 small text-start">
									{errorMessage}
								</Alert>
								<div className="d-flex gap-2 mt-4">
									<Button
										variant="light"
										className="w-100 rounded-pill"
										onClick={onCloseInternal}>
										Tutup
									</Button>
									{/* Tombol Coba Lagi aman untuk ditampilkan di sini */}
									<Button
										variant="primary"
										className="w-100 rounded-pill"
										onClick={() => handleRequestLocation()}>
										Coba Lagi
									</Button>
								</div>
							</>
						)}
					</div>
				)}
			</Modal.Body>
		</Modal>
	);
};

export default LocationPopup;
