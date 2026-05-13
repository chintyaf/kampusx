import { useEffect, useState } from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import api from '@/api/axios';

const EventOrganizerGuard = () => {
	const { eventId } = useParams();
	const [isAuthorized, setIsAuthorized] = useState(null);

	useEffect(() => {
		// Logika pengecekan ke backend/state lokal
		// Contoh: Memanggil API Laravel yang sudah dipasang middleware sebelumnya
		const checkAccess = async () => {
			try {
				// Ganti dengan endpoint atau fungsi fetch kamu yang sebenarnya
				const response = await fetch(`/api/events/${eventId}/check-organizer`, {
					headers: {
						// Pastikan token auth dikirim jika pakai Sanctum/JWT
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				});

				if (response.ok) {
					setIsAuthorized(true);
				} else {
					setIsAuthorized(false);
				}
			} catch (error) {
				setIsAuthorized(false);
			}
		};

		checkAccess();
	}, [eventId]);

	// Tampilkan loading screen selama proses pengecekan
	if (isAuthorized === null) {
		return <div>Memeriksa akses...</div>;
	}

	// Jika bukan organizer, lempar ke halaman 404 (atau halaman lain)
	if (isAuthorized === false) {
		return <Navigate to="/404" replace />;
	}

	// Jika lolos pengecekan, render semua route yang ada di dalamnya
	return <Outlet />;
};

export default EventOrganizerGuard;
