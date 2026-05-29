import React, { useState, useEffect } from 'react';
import { ProgressBar, Spinner } from 'react-bootstrap';
import api from '@/api/axios';

const EventCard = ({ isCollapsed, eventId }) => {
	const [eventData, setEventData] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!eventId) {
			setEventData(null);
			return;
		}

		let isMounted = true;
		const loadData = async () => {
			setLoading(true);
			try {
				const res = await api.get(`/event-dashboard/${eventId}/overview`);
				if (isMounted && res.data && res.data.status === 'success') {
					setEventData(res.data.data);
				}
			} catch (err) {
				console.error("Gagal memuat event overview di sidebar:", err);
			} finally {
				if (isMounted) setLoading(false);
			}
		};
		
		loadData();
		
		return () => { isMounted = false; };
	}, [eventId]);

	if (isCollapsed || !eventId) {
		return null;
	}

	const ticketStats = eventData?.stats?.[0];
	const hasProgress = ticketStats && ticketStats.progress !== null;
	const isDraft = eventData?.status === 'draft';

	return (
		<div
			className="px-4 py-3 border-bottom border-top sticky-bottom"
			style={{ backgroundColor: '#f8fafc' }}>
			{loading ? (
				<div className="d-flex justify-content-center py-2">
					<Spinner animation="border" size="sm" variant="secondary" />
				</div>
			) : eventData ? (
				<>
					{/* Title */}
					<div className="text-dark fw-bold text-truncate mb-2" style={{ fontSize: '0.85rem' }} title={eventData.name}>
						{eventData.name}
					</div>
					
					{/* Progress / Capacity */}
					{isDraft ? (
						<div className="d-flex align-items-center gap-2 mt-1">
							<span 
								className="px-2 py-0.5 rounded text-center fw-bold" 
								style={{ 
									fontSize: '10px', 
									display: 'inline-block', 
									lineHeight: 1.5, 
									backgroundColor: 'hsl(48, 96%, 89%)', 
									border: '1px solid hsl(48, 50%, 50%)', 
									color: '#b7791f' 
								}}
							>
								Draft
							</span>
							<span className="text-secondary" style={{ fontSize: '11px', fontWeight: 500 }}>
								Dalam Persiapan
							</span>
						</div>
					) : (
						<div className="d-flex flex-column gap-1">
							<div className="d-flex align-items-center justify-content-between">
								<span className="text-muted" style={{ fontSize: '0.75rem' }}>
									{hasProgress ? 'Kapasitas Terisi' : 'Tiket Terjual'}
								</span>
								<span className="fw-semibold text-secondary" style={{ fontSize: '0.75rem' }}>
									{ticketStats ? ticketStats.value : '0'}
								</span>
							</div>
							
							{hasProgress ? (
								<div className="d-flex align-items-center gap-2 mt-1">
									<div className="flex-grow-1">
										<ProgressBar
											now={ticketStats.progress}
											variant={ticketStats.progress >= 90 ? "danger" : ticketStats.progress >= 70 ? "warning" : "primary"}
											style={{ height: '5px', backgroundColor: '#e2e8f0' }}
										/>
									</div>
									<span className="fw-bold" style={{ fontSize: '0.75rem', color: '#475569' }}>
										{ticketStats.progress}%
									</span>
								</div>
							) : (
								<span className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>Kapasitas tidak terbatas</span>
							)}
						</div>
					)}
				</>
			) : (
				<div className="text-muted" style={{ fontSize: '0.8rem' }}>Event tidak ditemukan</div>
			)}
		</div>
	);
};

export default EventCard;
