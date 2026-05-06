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

	// -- DATA FETCHING --
	useEffect(() => {
		const fetchEventSession = async () => {
			if (!eventId) return;

			try {
				const response = await api.get(`event-dashboard/${eventId}/info-utama/session`);
				const result = response.data;

				if (result.status === 'success' && result.data) {
					const groupedDaysArray = Object.values(result.data);

					if (groupedDaysArray.length > 0) {
						setFormData((prev) => ({
							...prev,
							startDate: groupedDaysArray[0].date,
							endDate: groupedDaysArray[groupedDaysArray.length - 1].date,
						}));

						setDays(groupedDaysArray);
						setActiveSessions(groupedDaysArray[0].sessions || []);
					} else {
						setDays([]);
						setActiveSessions([]);
					}
				}
			} catch (error) {
				console.error('Gagal mengambil data event:', error);
			}
		};

		fetchEventSession();
	}, [eventId]);

	// -- HANDLERS --
	const handleSave = async () => {
		const payload = {
			...formData,
			days: days,
		};

		try {
			await api.post(`event-dashboard/${eventId}/info-utama/session`, payload);
			notify('success', 'Berhasil!', 'Perubahan informasi utama telah disimpan.');
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
					/>
				);
			case 'speaker-list':
				return (<SpeakerList onChangeSidebar={setSidebar} />);
			case 'speaker-add':
				return <SpeakerForm onChangeSidebar={setSidebar} />;
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
