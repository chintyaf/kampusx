import { useState, useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
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
import './sections/event-session/EventSession.css';

const EventSession = () => {
	const { eventId } = useParams();

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
				const response = await api.get(`event-dashboard/${eventId}/info-utama/session`);

				const sessionResult = response.data;
				if (sessionResult.status === 'success' && sessionResult.data) {
					const groupedDaysArray = Object.values(sessionResult.data);
					const extractedSpeakersMap = new Map();

					if (groupedDaysArray.length > 0) {
						setFormData((prev) => ({
							...prev,
							startDate: groupedDaysArray[0].date,
							endDate: groupedDaysArray[groupedDaysArray.length - 1].date,
						}));

						// Konversi property mapping dan ekstrak pembicara
						const formattedDays = groupedDaysArray.map(day => ({
							...day,
							sessions: day.sessions.map(session => {
								if (session.speakers) {
									session.speakers.forEach(spk => extractedSpeakersMap.set(spk.id, spk));
								}
								return {
									...session,
									startTime: session.start_time || session.startTime,
									endTime: session.end_time || session.endTime
								};
							})
						}));

						setDays(formattedDays);
						setActiveSessions(formattedDays[0].sessions || []);
					} else {
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
	const handleSave = async () => {
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
					});
				});
			}
		});

		const sessionPayload = {
			...formData,
			sessions: flatSessions,
		};

		// 2. Format Payload Speaker
		const speakerPayload = {
			speakers: allSpeakers.map((speaker) => {
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

				return {
					...speaker,
					id: typeof speaker.id === 'string' && speaker.id.startsWith('spk-') ? null : speaker.id,
					sessions: assignedSessions,
				};
			}),
		};

		try {
			await api.post(`event-dashboard/${eventId}/info-utama/session`, sessionPayload);
			await api.post(`event-dashboard/${eventId}/info-utama/speaker`, speakerPayload);
			notify('success', 'Berhasil!', 'Sesi dan pembicara telah disimpan.');
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
			return prevDays.map((day) => ({
				...day,
				sessions: day.sessions.map((session) =>
					session.id === updatedSession.id ? updatedSession : session,
				),
			}));
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
			day.sessions.some((session) =>
				session.speakers && session.speakers.some((s) => s.id === speakerId)
			)
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
		setSelectedRow(null);
	};

	const renderSidebar = () => {
		switch (sidebar) {
			case 'summary':
				return <SessionSummary days={days} />;
			case 'session-form':
				return (
					<SessionForm
						key={selectedRow?.id || 'new-session'}
						data={selectedRow}
						onClose={handleCloseForm}
						onChangeSidebar={setSidebar}
						onSaveSession={handleSaveSession}
						onDeleteSession={() => handleDeleteSession(selectedRow?.id)}
						onToggleHideSession={() => handleToggleHideSession(selectedRow?.id)}
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

	// -- RENDER --
	return (
		<EventLayout
			onSave={handleSave}
			nextPath={'pembicara'}
			prevPath={'tempat'}
			sidebar={renderSidebar()}
		>
			<Outlet context={{ sidebar, setSidebar, setSelectedRow }} />
			<FormHeading
				heading="Schedule Breakdown"
				subheading="Susun jadwal detail per hari dan sesi menggunakan matriks waktu"
			/>

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
			</div>
		</EventLayout>
	);
};

export default EventSession;
