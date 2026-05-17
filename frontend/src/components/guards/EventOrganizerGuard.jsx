import { useEffect, useState } from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import api from '@/api/axios';
import { useLoading } from '../../context/LoadingContext';

const EventOrganizerGuard = () => {
	const { eventId } = useParams();
	const { setIsPageLoading } = useLoading();
	const [isAuthorized, setIsAuthorized] = useState(null);

	useEffect(() => {
		const checkAccess = async () => {
			// 1. Panggil loading di DALAM useEffect
			setIsPageLoading(true);

			try {
				await api.get(`/events/${eventId}/check-organizer`);
				setIsAuthorized(true);
			} catch (error) {
				setIsAuthorized(false);
			} finally {
				// 2. Matikan loading di DALAM useEffect setelah proses selesai
				setIsPageLoading(false);
			}
		};

		if (eventId) {
			checkAccess();
		} else {
			setIsAuthorized(true);
			setIsPageLoading(false); // Matikan juga di sini jika tidak ada eventId
		}
	}, [eventId, setIsPageLoading]); // Tambahkan setIsPageLoading ke dependency array

	// 3. Tahan render dengan mengembalikan null selama masih loading
	if (isAuthorized === null) {
		return null;
	}

	// 4. Jika ditolak, redirect
	if (isAuthorized === false) {
		return <Navigate to="/404" replace />;
	}

	// 5. Jika diizinkan, render halaman
	return <Outlet />;
};

export default EventOrganizerGuard;
