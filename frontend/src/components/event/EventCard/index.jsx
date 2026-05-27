import React from 'react';
import { Card } from 'react-bootstrap';
import { Calendar, MapPin, User, Users, Wifi, Ticket } from 'lucide-react';
import { STORAGE_URL } from '../../../api/storage';

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
		if (price === undefined || price === null || price === '') return 'Cek Detail';
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

	// Resolve Event fields with robust snake_case / camelCase fallbacks
	const isOnline =
		ev.isOnline ||
		ev.is_online ||
		['online', 'hybrid'].includes(ev.location_type || '');
	const isInPerson =
		ev.isInPerson ||
		ev.is_in_person ||
		['offline', 'hybrid'].includes(ev.location_type || '');
	const isFeatured = ev.isFeatured || ev.is_featured;

	const image = ev.image || (ev.image_path ? `${STORAGE_URL}/${ev.image_path}` : `${STORAGE_URL}/event-banners/${ev.id || 1}.jpg`);
	const title = ev.title || 'Untitled Event';
	const date = ev.date || (ev.start_date ? formatDate(ev.start_date) : 'TBA');
	const price = formatPrice(ev.price);
	const location =
		ev.location ||
		(ev.location_type === 'online' ? 'Online' : ev.venue || 'Offline Venue');
	const org =
		ev.org ||
		ev.organizer?.name ||
		ev.institution?.name ||
		'KampusX';

	return (
		<Card
			onClick={onClick}
			className="h-100 shadow-sm"
			style={{
				borderRadius: 12,
				border: '1px solid var(--color-border)',
				cursor: 'pointer',
				transition: 'transform .15s, box-shadow .15s',
				overflow: 'hidden',
				background: 'var(--color-white)',
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.transform = 'translateY(-4px)';
				e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,105,158,0.12)';
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.transform = 'translateY(0)';
				e.currentTarget.style.boxShadow = '';
			}}
		>
			{/* Badges baris atas */}
			<div
				style={{
					padding: '12px 12px 0',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					minHeight: 36,
				}}
			>
				<div style={{ display: 'flex', gap: 6 }}>
					{isInPerson && (
						<span
							style={{
								fontSize: 11,
								color: 'var(--color-primary)',
								border: '1px solid var(--color-primary)',
								borderRadius: 99,
								padding: '2px 8px',
								fontWeight: 600,
								display: 'flex',
								alignItems: 'center',
								gap: 4,
							}}
						>
							<Users size={11} /> In-Person
						</span>
					)}
					{isOnline && (
						<span
							style={{
								fontSize: 11,
								color: 'var(--color-primary)',
								border: '1px solid var(--color-primary)',
								borderRadius: 99,
								padding: '2px 8px',
								fontWeight: 600,
								display: 'flex',
								alignItems: 'center',
								gap: 4,
							}}
						>
							<Wifi size={11} /> Online
						</span>
					)}
				</div>
				{isFeatured && (
					<span
						style={{
							fontSize: 11,
							background: 'var(--bahama-blue-500)',
							color: '#fff',
							borderRadius: 99,
							padding: '2px 10px',
							fontWeight: 700,
						}}
					>
						Featured
					</span>
				)}
			</div>

			{/* Gambar */}
			<img
				src={image}
				alt={title}
				style={{
					width: '100%',
					height: 170,
					objectFit: 'cover',
					marginTop: 10,
				}}
				onError={(e) => {
					e.target.src = 'https://placehold.co/600x400/eeeeee/999999?text=No+Image';
				}}
			/>

			<Card.Body
				style={{
					padding: '12px 14px 14px',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{/* Tanggal & harga */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						fontSize: 'var(--font-sm)',
						color: 'var(--color-primary)',
						fontWeight: 600,
						marginBottom: 8,
					}}
				>
					<span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
						<Calendar size={14} />
						{date}
					</span>
					<span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
						<Ticket size={14} />
						{ev.price === undefined ? (
							<span style={{ color: 'var(--color-secondary)', opacity: 0.6, fontStyle: 'italic' }}>Memuat...</span>
						) : Number(ev.price) === 0 ? (
							<span style={{ color: '#22c55e', fontWeight: 700 }}>Gratis</span>
						) : (
							<span>
								{new Intl.NumberFormat('id-ID', {
									style: 'currency',
									currency: 'IDR',
									maximumFractionDigits: 0,
								}).format(ev.price)}
							</span>
						)}
					</span>
				</div>

				{/* Judul */}
				<Card.Title
					style={{
						fontSize: 'var(--font-md)',
						fontWeight: 700,
						color: 'var(--color-text)',
						lineHeight: 1.4,
						marginBottom: 'auto',
					}}
				>
					{title}
				</Card.Title>

				<hr
					style={{
						margin: '10px 0',
						borderColor: 'var(--color-border)',
						opacity: 1,
					}}
				/>

				{/* Lokasi & organizer */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						fontSize: 'var(--font-sm)',
						color: 'var(--color-primary)',
						fontWeight: 500,
					}}
				>
					<span
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 5,
							overflow: 'hidden',
							maxWidth: '60%',
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
							gap: 5,
							overflow: 'hidden',
							maxWidth: '40%',
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

