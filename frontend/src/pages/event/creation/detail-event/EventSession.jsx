import { useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { Plus } from 'lucide-react';

import EventLayout from '../../../../layouts/EventLayout';
import SessionCard from './sections/event-session/SessionCard';
import SessionSummary from './sections/event-session/SessionSummary';
import SessionForm from './sections/event-session/SessionForm';
import SpeakerList from './sections/event-session/SpeakerList';
import SpeakerForm from './sections/event-session/SpeakerForm';
import useEventMeta from '../../../../hooks/useEventMeta';
import { useEventSession } from './sections/event-session/useEventSession';
import './sections/event-session/EventSession.css';

const EventSession = () => {
	const { eventId } = useParams();
	const { eventStatus, hasParticipants } = useEventMeta(eventId);

	// summary, session-form, speaker-list, speaker-add
	const [sidebar, setSidebar] = useState('summary');

	const {
		days,
		selectedRow,
		setSelectedRow,
		formData,
		isLoading,
		allSpeakers,
		selectedSpeakerToEdit,
		setSelectedSpeakerToEdit,
		handleSave,
		handleAddDay,
		handleSaveSession,
		handleAddSpeakerToSession,
		handleDeleteSession,
		handleToggleHideSession,
		handleSaveSpeaker,
		handleDeleteSpeaker,
		handleEditSpeaker,
		handleAddSession,
		handleDeleteDay,
		handleEditDayDate,
		isCurrentStepCompleted,
		getStep3ValidationErrors,
	} = useEventSession(eventId);

	const totalSessions = days.reduce((acc, d) => acc + (d.sessions?.length || 0), 0);
	const hasAtLeastOneDay = days.length >= 1;
	const hasAtLeastOneSession = totalSessions >= 1;
	const allDaysHaveDateAndSession = days.every(
		(day) => day.date && day.date.trim() !== '' && day.sessions && day.sessions.length >= 1
	);
	const isSaveDisabled = !hasAtLeastOneDay || !hasAtLeastOneSession || !allDaysHaveDateAndSession;

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
						onSaveSession={(updatedSession) => handleSaveSession(updatedSession)}
						onDeleteSession={() => handleDeleteSession(selectedRow?.id, setSidebar)}
						onToggleHideSession={() => handleToggleHideSession(selectedRow?.id)}
						allSpeakers={allSpeakers}
						onSaveSpeaker={(speakerData) => handleSaveSpeaker(speakerData, null)}
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
						onEditSpeaker={(speaker) => handleEditSpeaker(speaker, setSidebar)}
						onDeleteSpeaker={handleDeleteSpeaker}
					/>
				);
			case 'speaker-add':
				return (
					<SpeakerForm
						onChangeSidebar={setSidebar}
						initialData={selectedSpeakerToEdit}
						onSave={(speakerData) => handleSaveSpeaker(speakerData, setSidebar)}
					/>
				);
			default:
				return 'summary';
		}
	};

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
			isSaveDisabled={isSaveDisabled}
		>
			<Outlet context={{ sidebar, setSidebar, setSelectedRow }} />

			{isLoading ? (
				<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
					<div className="spinner-border text-primary" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
					<span className="ms-3 text-secondary">Memuat data sesi...</span>
				</div>
			) : (
				<div>
					{days.map((dayItem, index) => (
						<SessionCard
							key={index}
							dayIndex={index} // Pass index ke SessionCard
							dayItem={dayItem}
							selectedRow={selectedRow}
							setSelectedRow={setSelectedRow}
							onSidebarChange={setSidebar}
							onAddSession={() => handleAddSession(index, setSidebar)}
							onDeleteDay={() => handleDeleteDay(index)} // Pass handler delete
							onEditDayDate={(newDate) => handleEditDayDate(index, newDate)} // Pass handler edit
						/>
					))}

					<button className="btn-add gap-2 py-3 rounded-3 mt-4" onClick={handleAddDay}>
						<Plus size={18} />
						Tambah Hari Baru
					</button>

	
				</div>
			)}
		</EventLayout>
	);
};

export default EventSession;
