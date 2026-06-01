import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import { PlayCircle, Clock, Users, ArrowRight } from 'lucide-react';

const OngoingDashboardCard = ({ eventData, sessions = [] }) => {
	const [currentSession, setCurrentSession] = useState(null);
	const [nextSession, setNextSession] = useState(null);
	
	// Cari sesi saat ini dan sesi berikutnya
	useEffect(() => {
		if (!sessions || sessions.length === 0) return;

		const now = new Date();
		const currentHour = now.getHours();
		const currentMinute = now.getMinutes();
		const currentTimeInt = currentHour * 60 + currentMinute;

		let foundCurrent = null;
		let foundNext = null;

		// Assuming sessions are sorted by time, and they occur today.
		// Since we don't have accurate date mapping for each session easily available,
		// we just use the time.
		for (let i = 0; i < sessions.length; i++) {
			const s = sessions[i];
			if (s.time && s.time !== 'Belum diatur') {
				const [startStr, endStr] = s.time.split(' - ');
				if (startStr && endStr) {
					const [sH, sM] = startStr.split(':').map(Number);
					const [eH, eM] = endStr.split(':').map(Number);
					const startInt = sH * 60 + sM;
					const endInt = eH * 60 + eM;

					if (currentTimeInt >= startInt && currentTimeInt <= endInt) {
						foundCurrent = s;
						if (i + 1 < sessions.length) {
							foundNext = sessions[i + 1];
						}
						break;
					} else if (startInt > currentTimeInt && !foundNext) {
						foundNext = s;
					}
				}
			}
		}

		setCurrentSession(foundCurrent);
		if (!foundCurrent && foundNext) {
			setNextSession(foundNext);
		} else if (foundCurrent && foundNext) {
			setNextSession(foundNext);
		} else {
            setNextSession(null);
        }
	}, [sessions]);

	// Hitung progress absensi (Hadir vs Total Tiket Terjual)
	let checkedIn = 0;
	let totalSold = 0;
	if (eventData && eventData.stats) {
		const soldStat = eventData.stats.find((s) => s.label === 'Tickets Sold');
		const checkStat = eventData.stats.find((s) => s.label === 'Checked-In');
		
		if (soldStat) {
			// value might be "15 / 50" or "15"
			const soldVal = soldStat.value.split(' ')[0];
			totalSold = parseInt(soldVal, 10) || 0;
		}
		if (checkStat) {
			checkedIn = parseInt(checkStat.value, 10) || 0;
		}
	}

	const attendancePct = totalSold > 0 ? Math.round((checkedIn / totalSold) * 100) : 0;

	return (
		<Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
			<div className="bg-success text-white px-4 py-3 d-flex align-items-center justify-content-between">
				<div className="d-flex align-items-center gap-2">
					<div className="spinner-grow spinner-grow-sm text-light" role="status" style={{ width: '1rem', height: '1rem' }}>
						<span className="visually-hidden">Loading...</span>
					</div>
					<h5 className="fw-bold mb-0" style={{ fontSize: '1.1rem' }}>Event Sedang Berlangsung</h5>
				</div>
				<Badge bg="light" text="success" className="fw-bold px-3 py-2 rounded-pill">
					LIVE NOW
				</Badge>
			</div>
			
			<Card.Body className="p-4 bg-white">
				<Row className="g-4">
					<Col md={7}>
						<div className="mb-4">
							<h6 className="text-muted fw-bold mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
								<PlayCircle size={16} className="text-primary" /> Sesi Saat Ini
							</h6>
							{currentSession ? (
								<div className="p-3 bg-light rounded-3 border-start border-4 border-primary">
									<h5 className="fw-bold text-dark mb-1">{currentSession.title}</h5>
									<p className="text-muted small mb-0 d-flex align-items-center gap-2">
										<Clock size={14} /> {currentSession.time} | 👤 {currentSession.speaker || 'Tanpa Pembicara'}
									</p>
								</div>
							) : (
								<div className="p-3 bg-light rounded-3 border border-dashed text-muted small">
									Tidak ada sesi yang dijadwalkan pada jam ini.
								</div>
							)}
						</div>

						<div>
							<h6 className="text-muted fw-bold mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
								<ArrowRight size={16} className="text-secondary" /> Sesi Berikutnya
							</h6>
							{nextSession ? (
								<div className="p-2 border rounded-3 d-flex justify-content-between align-items-center">
									<div>
										<div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{nextSession.title}</div>
										<div className="text-muted" style={{ fontSize: '0.8rem' }}>{nextSession.time}</div>
									</div>
								</div>
							) : (
								<div className="p-2 text-muted small border rounded-3 text-center bg-light">
									Ini adalah sesi terakhir.
								</div>
							)}
						</div>
					</Col>

					<Col md={5} className="d-flex flex-column justify-content-center border-start">
						<div className="text-center px-lg-4">
							<div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle mb-3" style={{ width: '48px', height: '48px' }}>
								<Users size={24} />
							</div>
							<h6 className="fw-bold text-dark mb-1">Kehadiran Live</h6>
							<div className="display-4 fw-extrabold text-success mb-2">
								{checkedIn} <span className="fs-6 text-muted fw-normal">/ {totalSold}</span>
							</div>
							<ProgressBar 
								now={attendancePct} 
								variant="success" 
								style={{ height: '8px' }} 
								className="mb-2 rounded-pill"
							/>
							<div className="text-muted small fw-semibold">{attendancePct}% Peserta Hadir</div>
						</div>
					</Col>
				</Row>
			</Card.Body>
		</Card>
	);
};

export default OngoingDashboardCard;
