import React from 'react';
import { Card } from 'react-bootstrap';
import { Calendar, Info, Wifi, MapPin } from 'lucide-react';
import { formatEventDate } from '@/utils/dateUtils';

const EventLocationCard = ({ eventDetails, eventLocation, getTzLabel }) => {
	// Ekstraksi styling wrapper ikon agar rapi dan tidak redundan
	const iconWrapperClass =
		'bg-light p-2 rounded me-3 d-flex align-items-center justify-content-center flex-shrink-0';
	const iconWrapperStyle = { width: '40px', height: '40px' };

	return (
		<Card className="border shadow-sm rounded-4 mb-4">
			<Card.Body className="p-4">
				<h6 className="fw-bold mb-3">Waktu & Lokasi</h6>

				{/* --- Section: Waktu --- */}
				<div className="d-flex mb-3 align-items-center">
					<div className={iconWrapperClass} style={iconWrapperStyle}>
						<Calendar size={20} style={{ color: 'var(--color-primary)' }} />
					</div>
					<div>
						<div className="text-muted" style={{ fontSize: 'var(--font-xs)' }}>
							Waktu Event
						</div>
						<div
							className="fw-semibold text-dark"
							style={{ fontSize: 'var(--font-sm)' }}
						>
							{formatEventDate(
								eventDetails.date || eventDetails.start_date,
								getTzLabel(eventDetails.timezone),
							)}
						</div>
					</div>
				</div>

				{/* --- Section: Tipe Pelaksanaan --- */}
				<div className="d-flex mb-3 align-items-center border-top pt-3">
					<div className={iconWrapperClass} style={iconWrapperStyle}>
						<Info size={20} style={{ color: 'var(--color-primary)' }} />
					</div>
					<div>
						<div className="text-muted" style={{ fontSize: 'var(--font-xs)' }}>
							Tipe Pelaksanaan
						</div>
						<div
							className="fw-semibold text-dark"
							style={{ fontSize: 'var(--font-sm)' }}
						>
							{eventLocation?.type === 'online' && (
								<span className="d-flex align-items-center text-primary">
									<Wifi size={16} className="me-2" /> Online / Daring
								</span>
							)}
							{eventLocation?.type === 'offline' && (
								<span className="d-flex align-items-center text-success">
									<MapPin size={16} className="me-2" /> Offline / Tatap Muka
								</span>
							)}
							{eventLocation?.type === 'hybrid' && (
								<span
									className="d-flex align-items-center"
									style={{ color: '#d97706' }}
								>
									<Wifi size={16} className="me-1" />+
									<MapPin size={16} className="mx-1 me-2" /> Hybrid
								</span>
							)}
							{!eventLocation?.type && 'Tidak ada keterangan'}
						</div>
					</div>
				</div>

				{/* --- Section: Online Platform --- */}
				{(eventLocation?.type === 'online' || eventLocation?.type === 'hybrid') &&
					eventLocation?.platform && (
						<div className="d-flex mb-3 border-top pt-3 align-items-center">
							<div className={iconWrapperClass} style={iconWrapperStyle}>
								<Wifi size={20} style={{ color: 'var(--color-primary)' }} />
							</div>
							<div>
								<div className="text-muted" style={{ fontSize: 'var(--font-xs)' }}>
									Platform
								</div>
								<div
									className="fw-semibold text-dark"
									style={{ fontSize: 'var(--font-sm)' }}
								>
									{eventLocation.platform}
								</div>
							</div>
						</div>
					)}

				{/* --- Section: Offline Location Detail --- */}
				{(eventLocation?.type === 'offline' || eventLocation?.type === 'hybrid') && (
					<div className="d-flex border-top pt-3">
						<div className={iconWrapperClass} style={iconWrapperStyle}>
							<MapPin size={20} style={{ color: 'var(--color-primary)' }} />
						</div>
						<div className="w-100">
							<div className="text-muted" style={{ fontSize: 'var(--font-xs)' }}>
								Lokasi Event
							</div>
							<div
								className="fw-semibold text-dark mb-1"
								style={{ fontSize: 'var(--font-sm)' }}
							>
								{eventLocation?.location_name || 'Lokasi Fisik'}
							</div>

							{/* Detail Alamat (Alamat, Kota, Provinsi) */}
							{(eventLocation?.address_detail ||
								eventLocation?.city ||
								eventLocation?.province) && (
									<div
										className="text-muted"
										style={{ fontSize: 'var(--font-xs)', lineHeight: '1.4' }}
									>
										{eventLocation.address_detail && (
											<div>{eventLocation.address_detail}</div>
										)}
										{(eventLocation.city || eventLocation.province) && (
											<div className="fw-medium mt-1">
												{[eventLocation.city, eventLocation.province]
													.filter(Boolean)
													.join(', ')}
											</div>
										)}
									</div>
								)}

							{/* Koordinat */}
							{(eventLocation?.latitude || eventLocation?.longitude) && (
								<div
									className="text-muted mt-2"
									style={{ fontSize: '11px', fontFamily: 'monospace' }}
								>
									Koordinat: {eventLocation.latitude}, {eventLocation.longitude}
								</div>
							)}

							{/* Google Maps Link */}
							{eventLocation?.maps_url && (
								<a
									href={eventLocation.maps_url}
									target="_blank"
									rel="noopener noreferrer"
									className="btn btn-outline-primary py-1 px-3 mt-2 rounded-2 d-inline-flex align-items-center fw-semibold text-decoration-none"
									style={{ fontSize: '12px' }}
								>
									<MapPin size={12} className="me-2" /> Petunjuk Google Maps
								</a>
							)}
						</div>
					</div>
				)}
			</Card.Body>
		</Card>
	);
};

export default EventLocationCard;
