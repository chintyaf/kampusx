import React from 'react';
import { Card } from 'react-bootstrap';
import { Calendar, MapPin, User, Users, Wifi, Ticket } from 'lucide-react';
import { STORAGE_URL } from '@/api/storage';

const EventCard = ({ ev = {}, onClick }) => {
	// Format Date helper
	const formatDate = (dateString) => {
		if (!dateString) return 'TBA';
		try {
			return new Date(dateString).toLocaleDateString('id-ID', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			});
		} catch (e) {
			return dateString;
		}
	};

	// Format Price helper
	const formatPrice = (price) => {
		if (price === undefined || price === null || price === '') return 'Memuat...';
		if (price === 0 || price === '0') return 'Gratis';
		if (typeof price === 'string') {
			const lowerPrice = price.toLowerCase();
			if (
				lowerPrice.includes('rp') ||
				lowerPrice.includes('cek') ||
				lowerPrice.includes('gratis')
			) {
				return price;
			}
		}
		const num = Number(price);
		if (isNaN(num)) return price;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
		}).format(num);
	};

	// Resolve Event fields
	const eventLocation = ev.location_detail || ev.locationDetail;

	const isOnline =
		ev.isOnline ||
		ev.is_online ||
		['online', 'hybrid'].includes(eventLocation?.type || ev.location_type || '');
	const isInPerson =
		ev.isInPerson ||
		ev.is_in_person ||
		['offline', 'hybrid'].includes(eventLocation?.type || ev.location_type || '');

	const image =
		ev.image ||
		(ev.image_path
			? `${STORAGE_URL}/${ev.image_path}`
			: `${STORAGE_URL}/event-banners/${ev.id || 1}.jpg`);
	const title = ev.title || 'Untitled Event';
	const date = ev.date || (ev.start_date ? formatDate(ev.start_date) : 'TBA');
	const price = formatPrice(ev.price);
	const location =
		ev.location ||
		(eventLocation
			? eventLocation.type === 'online'
				? `Online (${eventLocation.platform || 'Platform'})`
				: eventLocation.location_name || eventLocation.city || 'Offline Venue'
			: ev.location_type === 'online'
				? 'Online'
				: ev.venue || 'Offline Venue');
	const org = ev.org || ev.organizer?.name || ev.institution?.name || 'KampusX';

	// Warna konsisten sesuai desain
	const colorTheme = '#1E40AF'; // Biru gelap untuk teks & icon

	return (
		<Card
			onClick={onClick}
			className="h-100"
			style={{
				width: '100%',
				borderRadius: '16px',
				border: '1px solid #E5E7EB',
				cursor: 'pointer',
				transition: 'all 0.2s ease-in-out',
				overflow: 'hidden',
				background: '#FFFFFF',
				boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
				display: 'flex',
				flexDirection: 'column',
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.transform = 'translateY(-4px)';
				e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.transform = 'translateY(0)';
				e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
			}}
		>
			{/* Bagian Badges */}
			<div
				style={{
					padding: '16px 16px 12px',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					flexWrap: 'wrap', // PERBAIKAN: Agar badge tidak terpotong jika container sempit
					gap: '8px',
				}}
			>
				<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
					{isInPerson && (
						<span
							style={{
								fontSize: '12px',
								color: colorTheme,
								border: `1px solid ${colorTheme}`,
								borderRadius: '20px',
								padding: '4px 12px',
								fontWeight: 600,
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
							}}
						>
							<Users size={14} /> In-Person
						</span>
					)}
					{isOnline && (
						<span
							style={{
								fontSize: '12px',
								color: colorTheme,
								border: `1px solid ${colorTheme}`,
								borderRadius: '20px',
								padding: '4px 12px',
								fontWeight: 600,
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
							}}
						>
							<Wifi size={14} /> Online
						</span>
					)}
				</div>
			</div>

			{/* Gambar Inset */}
			<div style={{ padding: '0 16px' }}>
				<img
					src={image}
					alt={title}
					style={{
						width: '100%',
						aspectRatio: '3 / 2',
						height: '160px', // PERBAIKAN: Disesuaikan agar proporsional dengan lebar kartu
						objectFit: 'cover',
						borderRadius: '12px',
						backgroundColor: '#F3F4F6',
					}}
					onError={(e) => {
						e.target.src = 'https://placehold.co/600x400/eeeeee/999999?text=No+Image';
					}}
				/>
			</div>

			<Card.Body
				style={{
					padding: '16px',
					display: 'flex',
					flexDirection: 'column',
					flexGrow: 1, // PERBAIKAN: Membantu mengisi ruang kosong jika tinggi card seragam
				}}
			>
				{/* Tanggal & Harga */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						fontSize: '14px', // Sedikit dikecilkan agar muat
						color: colorTheme,
						fontWeight: 600,
						marginBottom: '12px',
						gap: '8px',
					}}
				>
					<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
						<Calendar size={16} />
						{date}
					</span>
					<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
						<Ticket size={16} />
						{price === 'Gratis' ? (
							<span style={{ color: '#059669' }}>Gratis</span>
						) : price === 'Memuat...' ? (
							<span style={{ opacity: 0.6, fontStyle: 'italic' }}>Memuat...</span>
						) : (
							<span>{price}</span>
						)}
					</span>
				</div>

				{/* Judul Event */}
				<Card.Title
					style={{
						fontSize: '18px',
						fontWeight: 700,
						color: '#111827',
						lineHeight: 1.4,
						marginBottom: '16px',
						// PERBAIKAN: Membatasi judul maksimal 2 baris agar rapi
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					}}
				>
					{title}
				</Card.Title>

				{/* Spacer agar posisi elemen bawah tetap di bawah */}
				<div style={{ flexGrow: 1 }} />

				{/* Divider Garis Tipis */}
				<div
					style={{
						height: '1px',
						backgroundColor: '#E5E7EB',
						width: '100%',
						margin: '0 0 16px 0',
					}}
				/>

				{/* Lokasi & Organizer */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						fontSize: '13px', // Disesuaikan agar pas berdampingan
						color: colorTheme,
						fontWeight: 500,
						gap: '8px',
					}}
				>
					<span
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '4px',
							overflow: 'hidden',
							maxWidth: '50%',
						}}
					>
						<MapPin size={14} style={{ flexShrink: 0 }} />
						<span
							style={{
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{location}
						</span>
					</span>
					<span
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '4px',
							overflow: 'hidden',
							maxWidth: '50%',
						}}
					>
						<User size={14} style={{ flexShrink: 0 }} />
						<span
							style={{
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{org}
						</span>
					</span>
				</div>
			</Card.Body>
		</Card>
	);
};

export default EventCard;
