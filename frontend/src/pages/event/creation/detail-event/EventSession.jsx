import { useState, useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { Plus } from 'lucide-react';

import EventLayout from '../../../../layouts/EventLayout';
import FormHeading from '@/components/dashboard/FormHeading';
import SessionCard from './sections/event-session/SessionCard';

// SIDEBAR

import SessionSummary from './sections/event-session/SessionSummary';
import SessionForm from './sections/event-session/SessionForm';
import SpeakerList from './sections/event-session/SpeakerList';
import SpeakerForm from './sections/event-session/SpeakerForm';

import api from '../../../../api/axios';
import { notify } from '../../../../utils/notify';
import useEventMeta from '../../../../hooks/useEventMeta';
import './sections/event-session/EventSession.css';

const EventSession = () => {
	const { eventId } = useParams();
	const { eventStatus, hasParticipants } = useEventMeta(eventId);

	// summary, session-form, speaker-list, speaker-add
	const [sidebar, setSidebar] = useState('summary');
	// -- STATE MANAGEMENTS --
	const [days, setDays] = useState([]);
	const [activeSessions, setActiveSessions] = useState([]);
	const [selectedRow, setSelectedRow] = useState(null);
	const [formData, setFormData] = useState({
		timezone: '',
		startDate: '',
		endDate: '',
	});

	const [allSpeakers, setAllSpeakers] = useState([]);
	const [selectedSpeakerToEdit, setSelectedSpeakerToEdit] = useState(null);

	// -- DATA FETCHING --
	useEffect(() => {
		const fetchEventData = async () => {
			if (!eventId) return;

			try {
				const [sessionRes, speakerRes] = await Promise.all([
					api.get(`event-dashboard/${eventId}/info-utama/session`),
					api.get(`event-dashboard/${eventId}/info-utama/speaker`).catch((err) => {
						console.error('Gagal mengambil data speaker:', err);
						return { data: { data: [] } };
					}),
				]);

				const sessionResult = sessionRes.data;
				const speakerResult = speakerRes.data;

				let dbSpeakers = [];
				if (
					(speakerResult.status === 'success' || speakerResult.success) &&
					speakerResult.data
				) {
					dbSpeakers = speakerResult.data;
				}

				if (sessionResult.status === 'success' && sessionResult.data) {
					const groupedDaysArray = Object.values(sessionResult.data);
					const extractedSpeakersMap = new Map();

					// Tambahkan pembicara dari master list pembicara event terlebih dahulu
					dbSpeakers.forEach((spk) => {
						extractedSpeakersMap.set(spk.id, spk);
					});

					const mapToIndonesianTimezone = (tz) => {
						const mapping = {
							'Asia/Jakarta': 'WIB',
							'Asia/Makassar': 'WITA',
							'Asia/Jayapura': 'WIT',
						};
						return mapping[tz] || tz;
					};
					const dbTimezone = mapToIndonesianTimezone(sessionResult.timezone) || '-';

					if (groupedDaysArray.length > 0) {
						setFormData((prev) => ({
							...prev,
							startDate: groupedDaysArray[0].date,
							endDate: groupedDaysArray[groupedDaysArray.length - 1].date,
							timezone: dbTimezone,
						}));

						// Konversi property mapping dan ekstrak pembicara
						const formattedDays = groupedDaysArray.map((day) => ({
							...day,
							sessions: day.sessions.map((session) => {
								if (session.speakers) {
									session.speakers.forEach((spk) =>
										extractedSpeakersMap.set(spk.id, spk),
									);
								}
								return {
									...session,
									startTime: session.start_time || session.startTime,
									endTime: session.end_time || session.endTime,
								};
							}),
						}));

						setDays(formattedDays);
						setActiveSessions(formattedDays[0].sessions || []);
					} else {
						setFormData((prev) => ({
							...prev,
							timezone: dbTimezone,
						}));
						setDays([]);
						setActiveSessions([]);
					}

					setAllSpeakers(Array.from(extractedSpeakersMap.values()));
				}
			} catch (error) {
				console.error('Gagal mengambil data event:', error);
			}
		};

		fetchEventData();
	}, [eventId]);

	// -- HANDLERS --
	const handleSave = async (shouldNotify = false) => {
		// 1. Format Payload Sesi
		const flatSessions = [];
		days.forEach((day, index) => {
			const dayNumber = day.day_number || index + 1;
			if (day.sessions) {
				day.sessions.forEach((s) => {
					flatSessions.push({
						id: s.id,
						title: s.title,
						description: s.description,
						day: dayNumber,
						startTime: s.startTime || s.start_time,
						endTime: s.endTime || s.end_time,
						prerequisite_session_ids: s.prerequisite_session_ids || [],
						no_speaker: s.no_speaker || false,
					});
				});
			}
		});

		// Automatically calculate startDate and endDate based on sorted list of valid day dates
		const validDates = days
			.map((d) => d.date)
			.filter((d) => d && d.trim() !== '')
			.sort();

		const calculatedStartDate = validDates[0] || '';
		const calculatedEndDate = validDates[validDates.length - 1] || calculatedStartDate;

		const sessionPayload = {
			...formData,
			startDate: calculatedStartDate,
			endDate: calculatedEndDate,
			sessions: flatSessions,
		};

		// 2. Format Payload Speaker dengan FormData untuk Mendukung Upload Gambar
		const speakerFormData = new FormData();
		allSpeakers.forEach((speaker, index) => {
			const cleanId =
				typeof speaker.id === 'string' && speaker.id.startsWith('spk-') ? '' : speaker.id;

			speakerFormData.append(`speakers[${index}][id]`, cleanId || '');
			speakerFormData.append(`speakers[${index}][name]`, speaker.name || '');
			speakerFormData.append(`speakers[${index}][role]`, speaker.role || '');
			speakerFormData.append(`speakers[${index}][bio]`, speaker.bio || '');

			// Social links
			const socialLinks = speaker.social_link || [];
			socialLinks.forEach((link, linkIndex) => {
				speakerFormData.append(
					`speakers[${index}][social_link][${linkIndex}][platform]`,
					link.platform || '',
				);
				speakerFormData.append(
					`speakers[${index}][social_link][${linkIndex}][url]`,
					link.url || '',
				);
			});

			const assignedSessions = [];
			days.forEach((day) => {
				if (day.sessions) {
					day.sessions.forEach((s) => {
						if (s.speakers && s.speakers.some((spk) => spk.id === speaker.id)) {
							// Cegah ID "new-..." terkirim ke backend untuk relasi pivot
							if (typeof s.id === 'number' || !String(s.id).startsWith('new-')) {
								assignedSessions.push(s.id);
							}
						}
					});
				}
			});

			assignedSessions.forEach((sessId, sessIdx) => {
				speakerFormData.append(`speakers[${index}][sessions][${sessIdx}]`, sessId);
			});

			// Kirim file gambar pembicara baru jika ada
			if (speaker._imageFile) {
				speakerFormData.append(`speakers_image_${index}`, speaker._imageFile);
			}
		});

		try {
			const res1 = await api.post(
				`event-dashboard/${eventId}/info-utama/session`,
				sessionPayload,
			);
			const res2 = await api.post(
				`event-dashboard/${eventId}/info-utama/speaker`,
				speakerFormData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				},
			);
			if (
				res1.data?.notified_participants ||
				res2.data?.notified_participants ||
				shouldNotify
			) {
				notify(
					'success',
					'Berhasil!',
					'Sesi dan pembicara telah disimpan. Peserta terdaftar telah dikirimi notifikasi perubahan.',
				);
			} else {
				notify('success', 'Berhasil!', 'Sesi dan pembicara telah disimpan.');
			}
		} catch (error) {
			const errorMsg = error.response?.data?.message || 'Terjadi kesalahan pada server.';
			if (error.response?.data?.errors) console.table(error.response.data.errors);
			notify('error', 'Gagal!', errorMsg);
		}
	};

	const handleAddDay = () => {
		setDays((prevDays) => [
			...prevDays,
			{ date: '', sessions: [], day_number: prevDays.length + 1 },
		]);
	};

	const handleSaveSession = (updatedSession) => {
		setDays((prevDays) => {
			const newDays = [...prevDays.map((d) => ({ ...d, sessions: [...d.sessions] }))];

			let oldDayIndex = -1;
			let oldSessionIndex = -1;

			for (let i = 0; i < newDays.length; i++) {
				const sIndex = newDays[i].sessions.findIndex((s) => s.id === updatedSession.id);
				if (sIndex !== -1) {
					oldDayIndex = i;
					oldSessionIndex = sIndex;
					break;
				}
			}

			if (oldDayIndex !== -1) {
				const oldDayNumber = newDays[oldDayIndex].day_number || oldDayIndex + 1;
				const newDayNumber = parseInt(updatedSession.dayNumber);

				if (oldDayNumber !== newDayNumber) {
					newDays[oldDayIndex].sessions.splice(oldSessionIndex, 1);

					const newDayIndex = newDays.findIndex(
						(d) => (d.day_number || newDays.indexOf(d) + 1) === newDayNumber,
					);
					if (newDayIndex !== -1) {
						newDays[newDayIndex].sessions.push(updatedSession);
						newDays[newDayIndex].sessions.sort((a, b) =>
							(a.startTime || '').localeCompare(b.startTime || ''),
						);
					} else {
						newDays[oldDayIndex].sessions.push(updatedSession);
						newDays[oldDayIndex].sessions.sort((a, b) =>
							(a.startTime || '').localeCompare(b.startTime || ''),
						);
					}
				} else {
					newDays[oldDayIndex].sessions[oldSessionIndex] = updatedSession;
					newDays[oldDayIndex].sessions.sort((a, b) =>
						(a.startTime || '').localeCompare(b.startTime || ''),
					);
				}
			}
			return newDays;
		});
		setSelectedRow(updatedSession);
		notify('success', 'Berhasil!', 'Sesi berhasil diperbarui.');
	};

	const handleAddSpeakerToSession = (speaker) => {
		if (!selectedRow) return;

		const updatedSession = {
			...selectedRow,
			speakers: [...(selectedRow.speakers || []), speaker],
		};

		handleSaveSession(updatedSession);
	};

	const handleDeleteSession = (sessionId) => {
		if (!sessionId) return;
		setDays((prevDays) => {
			return prevDays.map((day) => ({
				...day,
				sessions: day.sessions.filter((session) => session.id !== sessionId),
			}));
		});
		setSelectedRow(null);
		setSidebar('summary');
		notify('success', 'Berhasil!', 'Sesi berhasil dihapus.');
	};

	const handleToggleHideSession = (sessionId) => {
		if (!sessionId) return;
		setDays((prevDays) => {
			return prevDays.map((day) => ({
				...day,
				sessions: day.sessions.map((session) =>
					session.id === sessionId
						? { ...session, isHidden: !session.isHidden }
						: session,
				),
			}));
		});
		setSelectedRow((prev) =>
			prev && prev.id === sessionId ? { ...prev, isHidden: !prev.isHidden } : prev,
		);
		notify('success', 'Berhasil!', 'Status visibilitas sesi diubah.');
	};

	const handleSaveSpeaker = (speakerData) => {
		if (speakerData.id) {
			setAllSpeakers((prev) => prev.map((s) => (s.id === speakerData.id ? speakerData : s)));
			notify('success', 'Berhasil', 'Data pembicara diperbarui.');
		} else {
			const newSpeaker = { ...speakerData, id: `spk-${Date.now()}` };
			setAllSpeakers((prev) => [...prev, newSpeaker]);
			notify('success', 'Berhasil', 'Pembicara baru ditambahkan.');
		}
		setSidebar('speaker-list');
	};

	const handleDeleteSpeaker = (speakerId) => {
		// Cek apakah pembicara ada di sesi
		const isAssigned = days.some((day) =>
			day.sessions.some(
				(session) => session.speakers && session.speakers.some((s) => s.id === speakerId),
			),
		);

		if (isAssigned) {
			notify('error', 'Gagal', 'Pembicara tidak dapat dihapus karena sedang mengisi sesi.');
			return;
		}

		setAllSpeakers((prev) => prev.filter((s) => s.id !== speakerId));
		notify('success', 'Berhasil', 'Pembicara dihapus dari daftar.');
	};

	const handleEditSpeaker = (speaker) => {
		setSelectedSpeakerToEdit(speaker);
		setSidebar('speaker-add');
	};

	const handleAddSession = (dayIndex) => {
		const newSession = {
			id: `new-${Date.now()}`,
			title: '',
			description: '',
			startTime: '',
			endTime: '',
			speakers: [],
			dayNumber: days[dayIndex].day_number || dayIndex + 1,
			prerequisite_session_ids: [],
		};

		setDays((prevDays) => {
			const newDays = [...prevDays];
			newDays[dayIndex] = {
				...newDays[dayIndex],
				sessions: [...newDays[dayIndex].sessions, newSession],
			};
			return newDays;
		});

		setSelectedRow(newSession);
		setSidebar('session-form');
	};

	// TAMBAHAN: Handler Delete Hari
	const handleDeleteDay = (indexToRemove) => {
		setDays((prevDays) => prevDays.filter((_, index) => index !== indexToRemove));
		notify('success', 'Berhasil', 'Hari berhasil dihapus dari daftar.');
	};

	// TAMBAHAN: Handler Edit Tanggal Hari
	const handleEditDayDate = (indexToEdit, newDate) => {
		setDays((prevDays) => {
			const newDays = [...prevDays];
			newDays[indexToEdit] = { ...newDays[indexToEdit], date: newDate };
			return newDays;
		});
	};

	const handleCloseForm = () => {
		setSidebar('summary');
		setSelectedRow(null);
	};

	const renderSidebar = () => {
		switch (sidebar) {
			case 'summary':
				return (
					<SessionSummary
						days={days}
						allSpeakers={allSpeakers}
						timezone={formData.timezone}
					/>
				);
			case 'session-form':
				return (
					<SessionForm
						key={selectedRow?.id || 'new-session'}
						data={selectedRow}
						days={days}
						onClose={handleCloseForm}
						onChangeSidebar={setSidebar}
						onSaveSession={handleSaveSession}
						onDeleteSession={() => handleDeleteSession(selectedRow?.id)}
						onToggleHideSession={() => handleToggleHideSession(selectedRow?.id)}
						allSpeakers={allSpeakers}
						onSaveSpeaker={handleSaveSpeaker}
						onDeleteSpeaker={handleDeleteSpeaker}
					/>
				);
			case 'speaker-list':
				return (
					<SpeakerList
						sessionSpeakers={selectedRow?.speakers || []}
						onAddSpeaker={handleAddSpeakerToSession}
						onChangeSidebar={(action) => {
							if (action === 'speaker-add') setSelectedSpeakerToEdit(null);
							setSidebar(action);
						}}
						allSpeakers={allSpeakers}
						onEditSpeaker={handleEditSpeaker}
						onDeleteSpeaker={handleDeleteSpeaker}
					/>
				);
			case 'speaker-add':
				return (
					<SpeakerForm
						onChangeSidebar={setSidebar}
						initialData={selectedSpeakerToEdit}
						onSave={handleSaveSpeaker}
					/>
				);
			default:
				return 'summary';
		}
	};

	const isCurrentStepCompleted =
		days.length > 0 &&
		days.every(
			(day) =>
				day.date &&
				day.date.trim() !== '' &&
				day.sessions &&
				day.sessions.length > 0 &&
				day.sessions.every(
					(s) =>
						s.title?.trim() !== '' &&
						(s.startTime || s.start_time) &&
						(s.endTime || s.end_time) &&
						((s.speakers && s.speakers.length > 0) || s.no_speaker),
				),
		);

	const getStep3ValidationErrors = () => {
		const errorsList = [];
		if (days.length === 0) {
			errorsList.push('Silakan tambahkan minimal satu hari pelaksanaan.');
			return errorsList;
		}

		days.forEach((day, dIdx) => {
			const dayLabel = `Hari ke-${dIdx + 1}${day.date ? ` (${day.date})` : ''}`;

			if (!day.date || day.date.trim() === '') {
				errorsList.push(`Tanggal pelaksanaan untuk ${dayLabel} belum ditentukan.`);
			}

			if (!day.sessions || day.sessions.length === 0) {
				errorsList.push(`${dayLabel} belum memiliki sesi acara.`);
			} else {
				day.sessions.forEach((s, sIdx) => {
					const sessionLabel = `Sesi ke-${sIdx + 1}${s.title ? ` "${s.title}"` : ''} di ${dayLabel}`;

					if (!s.title || s.title.trim() === '') {
						errorsList.push(`Nama/judul untuk ${sessionLabel} wajib diisi.`);
					}
					if (!s.startTime && !s.start_time) {
						errorsList.push(`Waktu mulai untuk ${sessionLabel} belum ditentukan.`);
					}
					if (!s.endTime && !s.end_time) {
						errorsList.push(`Waktu selesai untuk ${sessionLabel} belum ditentukan.`);
					}
					const hasSpeakers = s.speakers && s.speakers.length > 0;
					if (!hasSpeakers && !s.no_speaker) {
						errorsList.push(
							`${sessionLabel} belum memiliki pembicara (atau centang opsi Tanpa Pembicara jika sesi ini tidak membutuhkannya).`,
						);
					}
				});
			}
		});

		return errorsList;
	};

	// -- RENDER --
	return (
		<EventLayout
			title="Schedule Breakdown"
			description="Susun jadwal detail per hari dan sesi menggunakan matriks waktu"
			onSave={handleSave}
			nextPath={'tiket'}
			prevPath={'tempat'}
			sidebar={renderSidebar()}
			eventStatus={eventStatus}
			hasParticipants={hasParticipants}
			isCurrentStepCompleted={isCurrentStepCompleted}
		>
			<Outlet context={{ sidebar, setSidebar, setSelectedRow }} />

			<div>
				{days.map((dayItem, index) => (
					<SessionCard
						key={index}
						dayIndex={index} // Pass index ke SessionCard
						dayItem={dayItem}
						selectedRow={selectedRow}
						setSelectedRow={setSelectedRow}
						onSidebarChange={setSidebar}
						onAddSession={() => handleAddSession(index)}
						onDeleteDay={() => handleDeleteDay(index)} // Pass handler delete
						onEditDayDate={(newDate) => handleEditDayDate(index, newDate)} // Pass handler edit
					/>
				))}

				<button className="btn-add gap-2 py-3 rounded-3 mt-4" onClick={handleAddDay}>
					<Plus size={18} />
					Tambah Hari Baru
				</button>

				{!isCurrentStepCompleted && (
					<div
						style={{
							padding: '16px 20px',
							background: '#fff5f5',
							border: '1.5px solid #feb2b2',
							borderRadius: '12px',
							marginTop: '24px',
						}}
					>
						<h6
							style={{
								color: '#c53030',
								fontWeight: '700',
								marginBottom: '8px',
								fontSize: '0.9rem',
							}}
						>
							⚠️ Mohon lengkapi data sesi dan jadwal berikut:
						</h6>
						<ul
							style={{
								margin: 0,
								paddingLeft: '20px',
								color: '#9b2c2c',
								fontSize: '0.85rem',
								lineHeight: '1.6',
							}}
						>
							{getStep3ValidationErrors().map((err, i) => (
								<li key={i}>{err}</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</EventLayout>
	);
};

export default EventSession;
