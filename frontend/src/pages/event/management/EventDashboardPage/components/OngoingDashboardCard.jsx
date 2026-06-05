import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import { PlayCircle, Clock, Users, ArrowRight } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';

const flattenSessions = (data, startDateStr) => {
	if (!data) return [];

	let arrayToProcess = [];
	let isAlreadyFlat = false;
	if (Array.isArray(data)) {
		if (data.length > 0 && (!data[0].sessions || !Array.isArray(data[0].sessions))) {
			isAlreadyFlat = true;
		}
		arrayToProcess = data;
	} else if (typeof data === 'object') {
		arrayToProcess = Object.values(data);
	}

	const fetchedSessions = [];

	if (isAlreadyFlat) {
		arrayToProcess.forEach((s) => {
			let dayNumber = s.day || s.day_number;
			if (!dayNumber && s.date && startDateStr) {
				const start = new Date(startDateStr);
				const sessDate = new Date(s.date);
				const diffTime = sessDate - start;
				const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
				if (diffDays >= 0) {
					dayNumber = diffDays + 1;
				}
			}
			if (!dayNumber) dayNumber = 1;

			fetchedSessions.push({
				id: s.id,
				title: s.title || s.name,
				day: dayNumber,
				time: s.time || (s.start_time && s.end_time ? `${s.start_time.substring(0, 5)} - ${s.end_time.substring(0, 5)}` : ''),
				speaker: s.speaker || (s.speakers ? s.speakers.map(sp => sp.name).join(', ') : ''),
				materialStatus: s.materialStatus || s.material_status || 'not_required',
				checkin_link: s.checkin_link || s.checkinLink,
				checkout_link: s.checkout_link || s.checkoutLink,
				date: s.date
			});
		});
		return fetchedSessions;
	}

	arrayToProcess.forEach((day, index) => {
		const dayNumber = day.day_number || index + 1;
		if (day.sessions && Array.isArray(day.sessions)) {
			day.sessions.forEach((s) => {
				const speakerNames =
					s.speakers && s.speakers.length > 0
						? s.speakers.map((spk) => spk.name).join(', ')
						: null;

				fetchedSessions.push({
					id: s.id,
					title: s.title || s.name,
					day: dayNumber,
					time:
						s.start_time && s.end_time
							? `${s.start_time.substring(0, 5)} - ${s.end_time.substring(0, 5)}`
							: s.startTime && s.endTime
								? `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)}`
								: '',
					speaker: speakerNames,
					materialStatus:
						s.material_status || s.materialStatus || 'not_required',
					checkin_link: s.checkin_link || s.checkinLink,
					checkout_link: s.checkout_link || s.checkoutLink,
					date: s.date
				});
			});
		}
	});

	return fetchedSessions;
};

const OngoingDashboardCard = ({ eventData: initialEventData, sessions: initialSessions = [] }) => {
	const { eventId } = useParams();
	const [localEventData, setLocalEventData] = useState(initialEventData);
	const [localSessions, setLocalSessions] = useState(() => flattenSessions(initialSessions, initialEventData?.startDate));
	const [currentSession, setCurrentSession] = useState(null);
	const [nextSession, setNextSession] = useState(null);

	// Sync state when props change
	useEffect(() => {
		setLocalEventData(initialEventData);
	}, [initialEventData]);

	useEffect(() => {
		setLocalSessions(flattenSessions(initialSessions, initialEventData?.startDate));
	}, [initialSessions, initialEventData]);

	// Polling data terbaru dari database
	useEffect(() => {
		if (!eventId) return;

		const fetchLatestData = async () => {
			try {
				const res = await api.get(`/event-dashboard/${eventId}/overview`);
				if (res.data?.status === 'success' && res.data?.data) {
					setLocalEventData(res.data.data);
					if (res.data.data.sessions) {
						setLocalSessions(flattenSessions(res.data.data.sessions, res.data.data.startDate));
					}
				}
			} catch (error) {
				console.error('Failed to poll latest dashboard overview:', error);
			}
		};

		// Lakukan polling setiap 10 detik
		const interval = setInterval(fetchLatestData, 10000);
		return () => clearInterval(interval);
	}, [eventId]);

	// Cari sesi saat ini dan sesi berikutnya berdasarkan hari pelaksanaan
	useEffect(() => {
		if (!localSessions || localSessions.length === 0) return;

		const now = new Date();
		const currentHour = now.getHours();
		const currentMinute = now.getMinutes();
		const currentTimeInt = currentHour * 60 + currentMinute;

		// Hitung hari pelaksanaan aktif berdasarkan startDate
		let currentDay = 1;
		if (localEventData && localEventData.startDate) {
			const startDate = new Date(localEventData.startDate);
			const startZero = new Date(
				startDate.getFullYear(),
				startDate.getMonth(),
				startDate.getDate(),
			);
			const nowZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const diffTime = nowZero - startZero;
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
			if (diffDays >= 0) {
				currentDay = diffDays + 1;
			}
		}

		// Filter sesi yang terjadwal untuk hari ini
		const todaySessions = localSessions.filter((s) => s.day === currentDay);

		let foundCurrent = null;
		let foundNext = null;

		for (let i = 0; i < todaySessions.length; i++) {
			const s = todaySessions[i];
			if (s.time && s.time !== 'Belum diatur') {
				const [startStr, endStr] = s.time.split(' - ');
				if (startStr && endStr) {
					const [sH, sM] = startStr.split(':').map(Number);
					const [eH, eM] = endStr.split(':').map(Number);
					const startInt = sH * 60 + sM;
					const endInt = eH * 60 + eM;

					if (currentTimeInt >= startInt && currentTimeInt <= endInt) {
						foundCurrent = s;
						if (i + 1 < todaySessions.length) {
							foundNext = todaySessions[i + 1];
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
	}, [localSessions, localEventData]);

	const parseEventDate = (dateStr) => {
		if (!dateStr) return null;
		try {
			const cleaned = dateStr.replace(',', '');
			return new Date(cleaned);
		} catch (e) {
			return new Date(dateStr);
		}
	};

	const [hasEnded, setHasEnded] = useState(false);

	useEffect(() => {
		if (localEventData && localEventData.endDate) {
			const checkEnded = () => {
				const now = new Date();
				const endDate = parseEventDate(localEventData.endDate);
				if (endDate) {
					setHasEnded(now > endDate);
				}
			};

			checkEnded();
			const interval = setInterval(checkEnded, 10000);
			return () => clearInterval(interval);
		}
	}, [localEventData]);

	// Hitung progress absensi (Hadir vs Total Tiket Terjual)
	let checkedIn = 0;
	let totalSold = 0;
	if (localEventData && localEventData.stats) {
		const soldStat = localEventData.stats.find((s) => s.label === 'Tickets Sold');
		const checkStat = localEventData.stats.find((s) => s.label === 'Checked-In');

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
		<div className="border-0 shadow-sm mb-4 rounded-3 overflow-hidden">
			<div
				className={`${hasEnded ? 'bg-secondary' : 'bg-success'} text-white px-4 py-3 d-flex align-items-center justify-content-between`}
			>
				<div className="d-flex align-items-center gap-3">
					{!hasEnded && (
						<div
							className="spinner-grow spinner-grow-sm text-light"
							role="status"
							style={{ width: '0.5rem', height: '0.5rem' }}
						>
							<span className="visually-hidden">Loading...</span>
						</div>
					)}
					<h5 className="fw-bold mb-0 fs-4">
						{hasEnded ? 'Event Telah Selesai' : 'Event Sedang Berlangsung'}
					</h5>
				</div>
				<Badge
					bg="light"
					text={hasEnded ? 'secondary' : 'success'}
					className="fw-bold px-3 py-2 rounded-pill"
				>
					{hasEnded ? 'SELESAI' : 'LIVE NOW'}
				</Badge>
			</div>

			<div className="p-4 bg-white">
				<Row className="g-4">
					<Col md={7}>
						{hasEnded ? (
							<div className="h-100 d-flex flex-column justify-content-center p-4 bg-light rounded-3 border border-dashed text-center">
								<h5 className="fw-bold text-secondary mb-2">Selesai!</h5>
								<p className="text-muted mb-0">
									Seluruh rangkaian sesi event ini telah selesai dilaksanakan.
									Terima kasih atas kerja keras Anda!
								</p>
							</div>
						) : localSessions.length === 0 ? (
							<div className="h-100 d-flex flex-column align-items-center justify-content-center p-4 bg-light rounded-3 border border-dashed text-center text-muted">
								<PlayCircle size={24} className="mb-2 text-secondary" />
								<p className="mb-0" style={{ fontSize: '0.85rem' }}>
									Belum ada jadwal sesi yang dibuat. Silakan tambahkan struktur sesi di bawah.
								</p>
							</div>
						) : (
							<>
								<div className="mb-4">
									<h6 className="text-muted fw-bold mb-2 d-flex align-items-center gap-2 fs-4 text-uppercase">
										<PlayCircle size={16} /> Sesi Saat Ini
									</h6>
									{currentSession ? (
										<div className="p-3 bg-light rounded-3 border-start border-4 border-primary d-flex justify-content-between align-items-center">
											<div>
												<h5 className="fw-bold text-dark mb-1">
													{currentSession.title}
												</h5>
												<p className="text-muted small mb-0 d-flex align-items-center gap-2">
													<Clock size={14} /> {currentSession.time} | 👤{' '}
													{currentSession.speaker || 'Tanpa Pembicara'}
												</p>
											</div>
											<div className="d-flex gap-2">
												{currentSession.checkin_link && (
													<a
														href={currentSession.checkin_link}
														target="_blank"
														rel="noopener noreferrer"
														className="btn btn-sm btn-primary py-1 px-3 rounded-pill text-xs fw-semibold"
													>
														Check-in
													</a>
												)}
												{currentSession.checkout_link && (
													<a
														href={currentSession.checkout_link}
														target="_blank"
														rel="noopener noreferrer"
														className="btn btn-sm btn-success py-1 px-3 rounded-pill text-xs fw-semibold"
													>
														Check-out
													</a>
												)}
											</div>
										</div>
									) : (
										<div className="p-3 bg-light rounded-3 border border-dashed text-muted small">
											Tidak ada sesi yang dijadwalkan pada jam ini.
										</div>
									)}
								</div>

								<div>
									<h6 className="text-muted fw-bold mb-2 d-flex align-items-center gap-2 fs-4 text-uppercase">
										<ArrowRight size={16} className="text-secondary" /> Sesi Berikutnya
									</h6>
									{nextSession ? (
										<div className="p-2 border rounded-3 d-flex justify-content-between align-items-center bg-white">
											<div>
												<div
													className="fw-bold text-dark"
													style={{ fontSize: '0.9rem' }}
												>
													{nextSession.title}
												</div>
												<div
													className="text-muted"
													style={{ fontSize: '0.8rem' }}
												>
													{nextSession.time}
												</div>
											</div>
											<div className="d-flex gap-2">
												{nextSession.checkin_link && (
													<a
														href={nextSession.checkin_link}
														target="_blank"
														rel="noopener noreferrer"
														className="btn btn-sm btn-outline-primary py-1 px-3 rounded-pill text-xs fw-semibold"
													>
														Check-in
													</a>
												)}
												{nextSession.checkout_link && (
													<a
														href={nextSession.checkout_link}
														target="_blank"
														rel="noopener noreferrer"
														className="btn btn-sm btn-outline-success py-1 px-3 rounded-pill text-xs fw-semibold"
													>
														Check-out
													</a>
												)}
											</div>
										</div>
									) : (
										<div className="p-2 text-muted small border rounded-3 text-center bg-light">
											Ini adalah sesi terakhir.
										</div>
									)}
								</div>
							</>
						)}
					</Col>

					<Col md={5} className="d-flex flex-column justify-content-center border-start">
						<div className="text-center px-lg-4">
							<div
								className={`d-inline-flex align-items-center justify-content-center ${hasEnded ? 'bg-secondary bg-opacity-10 text-secondary' : 'bg-success bg-opacity-10 text-success'} rounded-circle mb-3`}
								style={{ width: '48px', height: '48px' }}
							>
								<Users size={24} />
							</div>
							<h6 className="fw-bold text-dark mb-1">
								{hasEnded ? 'Total Kehadiran' : 'Kehadiran Live'}
							</h6>
							<div
								className={`display-4 fw-extrabold ${hasEnded ? 'text-secondary' : 'text-success'} mb-2`}
							>
								{checkedIn}{' '}
								<span className="fs-6 text-muted fw-normal">/ {totalSold}</span>
							</div>
							<ProgressBar
								now={attendancePct}
								variant={hasEnded ? 'secondary' : 'success'}
								style={{ height: '8px' }}
								className="mb-2 rounded-pill"
							/>
							<div className="text-muted small fw-semibold">
								{attendancePct}% Peserta Hadir
							</div>
						</div>
					</Col>
				</Row>
			</div>
		</div>
	);
};

export default OngoingDashboardCard;
