import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Link as LinkIcon, Copy, RefreshCw } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';
import { notify } from '@/utils/notify';

const OnlineAttendanceTool = () => {
	const { eventId } = useParams();

	const [isFetching, setIsFetching] = useState(true);

	const [linkIn, setLinkIn] = useState('');
	const [loadingIn, setLoadingIn] = useState(false);
	const [expiresIn, setExpiresIn] = useState('');

	const [linkOut, setLinkOut] = useState('');
	const [loadingOut, setLoadingOut] = useState(false);
	const [expiresOut, setExpiresOut] = useState('');

	const formatDateTimeForInput = (dbDateTime) => {
		if (!dbDateTime) return '';
		return dbDateTime.replace(' ', 'T').substring(0, 16);
	};

	useEffect(() => {
		const fetchLinks = async () => {
			try {
				const res = await api.get(`/event-dashboard/${eventId}/attendance/links`);
				if (res.data?.success) {
					const eventData = res.data.data;

					setLinkIn(eventData.checkin_link || '');
					setExpiresIn(formatDateTimeForInput(eventData.checkin_expires_at));

					setLinkOut(eventData.checkout_link || '');
					setExpiresOut(formatDateTimeForInput(eventData.checkout_expires_at));
				}
			} catch (error) {
				console.error('Failed to fetch links:', error);
			} finally {
				setIsFetching(false);
			}
		};

		fetchLinks();
	}, [eventId]);

	const handleGenerate = async (type) => {
		const expiresAt = type === 'in' ? expiresIn : expiresOut;

		// --- VALIDASI WAJIB ISI TANGGAL ---
		if (!expiresAt) {
			notify('error', 'Perhatian!', 'Batas waktu akses wajib diisi sebelum membuat link.');
			return;
		}
		// ----------------------------------

		const setLoading = type === 'in' ? setLoadingIn : setLoadingOut;
		const setLink = type === 'in' ? setLinkIn : setLinkOut;

		setLoading(true);
		try {
			let query = `?type=${type}&expires_at=${expiresAt}`; // expires_at sekarang pasti ada

			const res = await api.get(`/event-dashboard/${eventId}/attendance/create-link${query}`);

			if (res.data?.success) {
				const {
					event_id,
					signature,
					type: resType,
					expires_at,
					url: backendUrl,
				} = res.data.data;

				let finalUrl =
					backendUrl ||
					`${window.location.origin}/attend-venue?event_id=${event_id}&type=${resType}&signature=${signature}&expires_at=${expires_at}`;

				setLink(finalUrl);
				notify(
					'success',
					'Berhasil!',
					`Link ${type === 'in' ? 'Check-in' : 'Check-out'} berhasil dibuat!`,
				);
			}
		} catch (error) {
			console.error('Failed to generate magic link:', error);
			notify('error', 'Gagal', 'Gagal membuat link presensi.');
		} finally {
			setLoading(false);
		}
	};

	const handleCopy = (link) => {
		navigator.clipboard
			.writeText(link)
			.then(() => notify('success', 'Berhasil!', 'Link disalin ke clipboard!'))
			.catch(() => notify('error', 'Gagal!', 'Gagal menyalin link.'));
	};

	const renderActionRow = (type, title, link, loading, expires, setExpires) => (
		<div className="p-3 border rounded-3 bg-light d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 shadow-none">
			<div className="fw-medium text-dark" style={{ fontSize: '0.875rem' }}>
				<Form.Label className="form-label mb-1">{title}</Form.Label>
				<div className="d-flex align-items-center gap-2 mt-1">
					<Form.Control
						type="datetime-local"
						size="sm"
						value={expires}
						onChange={(e) => setExpires(e.target.value)}
						className={`shadow-none border rounded-2 ${!expires && !link ? 'border-danger' : ''}`} // Memberikan highlight merah jika kosong
						style={{ width: '180px', height: '34px', fontSize: '0.875rem' }}
						title="Batas waktu akses (Wajib)"
						required
					/>
					<Button
						variant="outline-dark"
						size="sm"
						className="border bg-white"
						style={{ height: '34px' }}
						onClick={() => handleGenerate(type)}
						disabled={loading || (!link && !expires)} // Disable tombol jika link belum ada dan input kosong
					>
						{loading ? (
							<Spinner size="sm" />
						) : (
							<>
								<LinkIcon size={14} className="me-1" /> Buat Link
							</>
						)}
					</Button>
				</div>
				{!expires && !link && (
					<div className="text-danger mt-1" style={{ fontSize: '0.75rem' }}>
						* Wajib diisi
					</div>
				)}
			</div>

			<div className="d-flex flex-wrap align-items-center gap-2">
				{link && (
					<InputGroup size="sm" style={{ width: '1000px', height: '34px' }}>
						<Form.Control
							value={link}
							readOnly
							className="bg-white border-end-0 shadow-none text-muted"
							style={{ fontSize: '0.875rem' }}
						/>
						<Button
							variant="white"
							onClick={() => handleCopy(link)}
							className="d-flex align-items-center border border-start-0 px-3 shadow-none text-dark"
							title="Salin Link"
						>
							<Copy size={14} />
						</Button>
						<Button
							variant="white"
							onClick={() => handleGenerate(type)}
							disabled={loading || !expires} // Disable tombol regenerasi jika input dikosongkan
							className="d-flex align-items-center border px-3 shadow-none ms-1 rounded-end text-dark"
							title="Buat ulang link"
						>
							{loading ? <Spinner size="sm" /> : <RefreshCw size={14} />}
						</Button>
					</InputGroup>
				)}
			</div>
		</div>
	);

	if (isFetching) {
		return (
			<div className="bg-white border rounded-3 p-5 d-flex justify-content-center">
				<Spinner animation="border" variant="secondary" />
			</div>
		);
	}

	return (
		<div className="bg-white border rounded-3 p-4 shadow-none">
			<div className="mb-4">
				<h6 className="mb-1 text-dark fw-semibold">Manajemen Link Presensi Online</h6>
				<p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
					Buat link terpisah untuk check-in dan check-out peserta. Anda{' '}
					<strong>wajib</strong> mengatur batas waktu kedaluwarsa agar presensi lebih
					disiplin.
				</p>
			</div>

			<div className="d-flex flex-column gap-3">
				{renderActionRow(
					'in',
					'Akses Check-in',
					linkIn,
					loadingIn,
					expiresIn,
					setExpiresIn,
				)}
				{renderActionRow(
					'out',
					'Akses Check-out',
					linkOut,
					loadingOut,
					expiresOut,
					setExpiresOut,
				)}
			</div>
		</div>
	);
};

export default OnlineAttendanceTool;
