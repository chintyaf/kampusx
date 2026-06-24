import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import {
	ArrowLeft,
	CheckCircle2,
	LogOut,
	RefreshCw,
	Maximize2,
	Minimize2,
	Wifi,
	WifiOff,
	Clock,
} from 'lucide-react';
import api from '@/api/axios';

const REFRESH_INTERVAL = 15000; // 15 detik (normal dynamic QR)

export default function EventVenueQrPage() {
	const { eventId } = useParams();
	const navigate = useNavigate();

	const [mode, setMode] = useState('in'); // 'in' | 'out'
	const [qrData, setQrData] = useState(null);
	const [eventTitle, setEventTitle] = useState('');
	const [loading, setLoading] = useState(true);
	const [isOnline, setIsOnline] = useState(true);
	const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [lastRefresh, setLastRefresh] = useState(null);

	const countdownRef = useRef(null);
	const fetchRef = useRef(null);
	const modeRef = useRef(mode);
	modeRef.current = mode;

	// Fetch event title once
	useEffect(() => {
		api
			.get(`/event-dashboard/${eventId}/overview`)
			.then((res) => {
				if (res.data?.status === 'success') {
					setEventTitle(res.data.data.name);
				}
			})
			.catch(() => { });
	}, [eventId]);

	// Fetch QR data
	const fetchQr = useCallback(
		async (isInitial = false) => {
			if (isInitial) setLoading(true);
			try {
				const res = await api.get(
					`/event-dashboard/${eventId}/venue-qr?type=${modeRef.current}&dynamic=true`
				);
				if (res.data?.success) {
					const { event_id, signature, type, expires_at } = res.data.data;
					const url = `${window.location.origin}/attend-venue?event_id=${event_id}&type=${type}&signature=${signature}&expires_at=${encodeURIComponent(expires_at)}`;
					setQrData(url);
					setIsOnline(true);
					setLastRefresh(new Date());
				}
			} catch {
				setIsOnline(false);
			} finally {
				if (isInitial) setLoading(false);
			}
		},
		[eventId]
	);

	// Auto-refresh loop
	useEffect(() => {
		fetchQr(true);
		setCountdown(REFRESH_INTERVAL / 1000);

		// Clear existing intervals
		if (fetchRef.current) clearInterval(fetchRef.current);
		if (countdownRef.current) clearInterval(countdownRef.current);

		// QR fetch interval
		fetchRef.current = setInterval(() => {
			fetchQr(false);
			setCountdown(REFRESH_INTERVAL / 1000);
		}, REFRESH_INTERVAL);

		// Countdown interval
		countdownRef.current = setInterval(() => {
			setCountdown((prev) => (prev <= 1 ? REFRESH_INTERVAL / 1000 : prev - 1));
		}, 1000);

		return () => {
			clearInterval(fetchRef.current);
			clearInterval(countdownRef.current);
		};
	}, [mode, fetchQr]);

	// Fullscreen API
	const toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen?.();
			setIsFullscreen(true);
		} else {
			document.exitFullscreen?.();
			setIsFullscreen(false);
		}
	};

	useEffect(() => {
		const handler = () => setIsFullscreen(!!document.fullscreenElement);
		document.addEventListener('fullscreenchange', handler);
		return () => document.removeEventListener('fullscreenchange', handler);
	}, []);

	const isCheckin = mode === 'in';

	// Color palette per mode
	const theme = isCheckin
		? {
			bg: '#f8fafc',
			accent: '#16a34a',
			accentDim: '#dcfce7',
			accentBorder: '#bbf7d0',
			badge: '#dcfce7',
			badgeText: '#14532d',
			label: 'CHECK-IN',
			icon: CheckCircle2,
			pulse: '#22c55e',
		}
		: {
			bg: '#f8fafc',
			accent: '#ec4899',
			accentDim: '#fce7f3',
			accentBorder: '#fbcfe8',
			badge: '#fce7f3',
			badgeText: '#831843',
			label: 'CHECK-OUT',
			icon: LogOut,
			pulse: '#f472b6',
		};

	const ModeIcon = theme.icon;

	const circumference = 2 * Math.PI * 20;
	const progress = (countdown / (REFRESH_INTERVAL / 1000)) * circumference;

	return (
		<div
			style={{
				background: theme.bg,
				minHeight: '100vh',
				color: '#1e293b',
				fontFamily: "'Inter', 'Segoe UI', sans-serif",
				display: 'flex',
				flexDirection: 'column',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{/* ── Top Bar ── */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '20px 28px',
					borderBottom: '1px solid #e2e8f0',
					backgroundColor: '#ffffff',
					position: 'relative',
					zIndex: 10,
				}}
			>
				{/* Back Button */}
				<button
					onClick={() => navigate(`/organizer/${eventId}/event-dashboard/check-in`)}
					style={{
						background: '#ffffff',
						border: '1px solid #e2e8f0',
						borderRadius: '10px',
						color: '#64748b',
						padding: '8px 16px',
						cursor: 'pointer',
						fontSize: '0.85rem',
						fontWeight: '500',
						display: 'flex',
						alignItems: 'center',
						gap: '6px',
						transition: 'all 0.2s',
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = '#f1f5f9';
						e.currentTarget.style.color = '#0f172a';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = '#ffffff';
						e.currentTarget.style.color = '#64748b';
					}}
				>
					<ArrowLeft size={16} />
					Kembali
				</button>

				{/* Event Name */}
				<div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
					<div style={{ fontSize: '0.75rem', color: '#64748b', letterSpacing: '0.08em', marginBottom: '2px', fontWeight: '600' }}>
						PRESENSI EVENT
					</div>
					<div
						style={{
							fontSize: '0.95rem',
							fontWeight: '600',
							color: '#0f172a',
							maxWidth: '400px',
							margin: '0 auto',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{eventTitle || '—'}
					</div>
				</div>

				{/* Right Controls */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
					{/* Connection Status */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '6px',
							background: isOnline ? '#dcfce7' : '#fee2e2',
							border: `1px solid ${isOnline ? '#bbf7d0' : '#fecaca'}`,
							borderRadius: '8px',
							padding: '6px 12px',
							fontSize: '0.78rem',
							color: isOnline ? '#16a34a' : '#ef4444',
							fontWeight: '600',
						}}
					>
						{isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
						{isOnline ? 'Live' : 'Offline'}
					</div>

					{/* Fullscreen Toggle */}
					<button
						onClick={toggleFullscreen}
						style={{
							background: '#ffffff',
							border: '1px solid #e2e8f0',
							borderRadius: '10px',
							color: '#64748b',
							padding: '8px',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							transition: 'all 0.2s',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = '#f1f5f9';
							e.currentTarget.style.color = '#0f172a';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = '#ffffff';
							e.currentTarget.style.color = '#64748b';
						}}
						title={isFullscreen ? 'Keluar Fullscreen' : 'Mode Fullscreen'}
					>
						{isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
					</button>
				</div>
			</div>

			{/* ── Main Content ── */}
			<div
				style={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '32px 20px',
					position: 'relative',
					zIndex: 5,
				}}
			>
				{/* Mode Toggle Pill */}
				<div
					style={{
						display: 'flex',
						background: '#ffffff',
						border: '1px solid #e2e8f0',
						borderRadius: '16px',
						padding: '5px',
						gap: '4px',
						marginBottom: '36px',
						boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
					}}
				>
					{[
						{ value: 'in', label: 'Check-In', icon: CheckCircle2, color: '#16a34a', bg: '#dcfce7' },
						{ value: 'out', label: 'Check-Out', icon: LogOut, color: '#ec4899', bg: '#fce7f3' },
					].map(({ value, label, icon: Icon, color, bg }) => {
						const active = mode === value;
						return (
							<button
								key={value}
								onClick={() => setMode(value)}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
									padding: '10px 24px',
									borderRadius: '12px',
									border: 'none',
									cursor: 'pointer',
									fontWeight: '600',
									fontSize: '0.9rem',
									transition: 'all 0.25s',
									background: active ? bg : 'transparent',
									color: active ? color : '#64748b',
								}}
							>
								<Icon size={16} />
								{label}
							</button>
						);
					})}
				</div>

				{/* QR Card */}
				<div
					style={{
						background: '#ffffff',
						border: `1px solid ${theme.accentBorder}`,
						borderRadius: '28px',
						padding: '40px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
						maxWidth: '420px',
						width: '100%',
						position: 'relative',
					}}
				>
					{/* Mode badge at top */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							background: theme.accentDim,
							border: `1px solid ${theme.accentBorder}`,
							borderRadius: '10px',
							padding: '8px 18px',
							marginBottom: '28px',
							color: theme.accent,
							fontWeight: '700',
							fontSize: '0.85rem',
							letterSpacing: '0.08em',
						}}
					>
						<ModeIcon size={15} />
						{theme.label}
					</div>

					{/* QR Code */}
					<div
						style={{
							background: '#ffffff',
							borderRadius: '20px',
							padding: '24px',
							width: '280px',
							height: '280px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: '0 0 0 1px #e2e8f0, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
							position: 'relative',
							overflow: 'hidden',
						}}
					>
						{loading ? (
							<div style={{ textAlign: 'center' }}>
								<div
									style={{
										width: '48px',
										height: '48px',
										border: `3px solid ${theme.accent}30`,
										borderTop: `3px solid ${theme.accent}`,
										borderRadius: '50%',
										animation: 'spin 0.8s linear infinite',
										margin: '0 auto 12px',
									}}
								/>
								<p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Memuat QR...</p>
							</div>
						) : qrData ? (
							<QRCode value={qrData} size={232} level="H" />
						) : (
							<div style={{ textAlign: 'center', color: '#ef4444' }}>
								<WifiOff size={40} style={{ marginBottom: '8px', opacity: 0.6 }} />
								<p style={{ fontSize: '0.8rem', margin: 0, color: '#64748b' }}>
									Gagal memuat QR
								</p>
							</div>
						)}

						{/* Refresh overlay flash */}
						{!loading && qrData && (
							<div
								style={{
									position: 'absolute',
									inset: 0,
									background: 'rgba(255,255,255,0)',
									borderRadius: '20px',
									pointerEvents: 'none',
								}}
							/>
						)}
					</div>

					{/* Countdown Ring + Timer */}
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							marginTop: '28px',
							gap: '4px',
						}}
					>
						<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
							{/* SVG Countdown Ring */}
							<svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
								<circle cx="24" cy="24" r="20" fill="none" stroke="#f1f5f9" strokeWidth="3" />
								<circle
									cx="24"
									cy="24"
									r="20"
									fill="none"
									stroke={theme.accent}
									strokeWidth="3"
									strokeLinecap="round"
									strokeDasharray={circumference}
									strokeDashoffset={circumference - progress}
									style={{ transition: 'stroke-dashoffset 1s linear' }}
								/>
								<text
									x="24"
									y="24"
									textAnchor="middle"
									dominantBaseline="central"
									fill={theme.accent}
									fontSize="12"
									fontWeight="700"
									style={{ transform: 'rotate(90deg)', transformOrigin: '24px 24px' }}
								>
									{countdown}
								</text>
							</svg>
							<div>
								<div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
									QR diperbarui setiap
								</div>
								<div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '600' }}>
									15 detik otomatis
								</div>
							</div>
						</div>

						{lastRefresh && (
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '5px',
									fontSize: '0.72rem',
									color: '#94a3b8',
									marginTop: '4px',
								}}
							>
								<Clock size={11} />
								Terakhir diperbarui:{' '}
								{lastRefresh.toLocaleTimeString('id-ID', {
									hour: '2-digit',
									minute: '2-digit',
									second: '2-digit',
								})}
							</div>
						)}
					</div>
				</div>

				{/* Instruction text */}
				<p
					style={{
						marginTop: '28px',
						color: '#64748b',
						fontSize: '0.85rem',
						textAlign: 'center',
						maxWidth: '360px',
						lineHeight: '1.6',
					}}
				>
					Arahkan layar ini ke peserta. Minta peserta scan QR menggunakan kamera HP untuk mencatat kehadiran.
				</p>

				{/* Manual refresh button */}
				<button
					onClick={() => fetchQr(false)}
					style={{
						marginTop: '16px',
						background: '#ffffff',
						border: '1px solid #e2e8f0',
						borderRadius: '10px',
						color: '#64748b',
						padding: '8px 18px',
						cursor: 'pointer',
						fontSize: '0.8rem',
						fontWeight: '500',
						display: 'flex',
						alignItems: 'center',
						gap: '6px',
						transition: 'all 0.2s',
						boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.borderColor = theme.accentBorder;
						e.currentTarget.style.color = theme.accent;
						e.currentTarget.style.background = theme.accentDim;
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.borderColor = '#e2e8f0';
						e.currentTarget.style.color = '#64748b';
						e.currentTarget.style.background = '#ffffff';
					}}
				>
					<RefreshCw size={13} />
					Perbarui Manual
				</button>
			</div>

			{/* ── Bottom Footer ── */}
			<div
				style={{
					textAlign: 'center',
					padding: '16px',
					borderTop: '1px solid #e2e8f0',
					fontSize: '0.72rem',
					color: '#94a3b8',
					position: 'relative',
					zIndex: 10,
					backgroundColor: '#ffffff',
				}}
			>
				© {new Date().getFullYear()} KampusX · Sistem Presensi QR Dinamis
			</div>

			{/* CSS animation for spinner */}
			<style>{`
				@keyframes spin {
					to { transform: rotate(360deg); }
				}
			`}</style>
		</div>
	);
}
