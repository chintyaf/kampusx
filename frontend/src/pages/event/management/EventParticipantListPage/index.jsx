import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';
import FormHeading from '@/components/dashboard/FormHeading';
import '@/assets/css/participant-list.css';
import { notify } from '@/utils/notify';
import { useLoading } from '@/context/LoadingContext';

// Import komponen terpisah
import ParticipantStats from './components/ParticipantStats';
import ParticipantToolbar from './components/ParticipantToolbar';
import ParticipantTable from './components/ParticipantTable';
import ParticipantPagination from './components/ParticipantPagination';

const EventParticipantListPage = () => {
	const { eventId } = useParams();
	const { setIsPageLoading } = useLoading();

	const [participants, setParticipants] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isExporting, setIsExporting] = useState(false);
	const [showAll, setShowAll] = useState(false);
	const [attendanceFilter, setAttendanceFilter] = useState('');
	const [revealed, setRevealed] = useState({});
	const [pageInfo, setPageInfo] = useState({ current_page: 1, last_page: 1, total: 0 });

	const [summary, setSummary] = useState({
		total: 0,
		not_attended: 0,
		checked_in: 0,
		checked_out: 0,
		total_attendance: 1,
	});

	const fetchParticipants = async (page = 1) => {
		try {
			setLoading(true);
			setIsPageLoading(true);
			const params = { all: showAll, page };
			if (attendanceFilter) params.attendance = attendanceFilter;

			const response = await api.get(`/event-dashboard/${eventId}/daftar-peserta`, {
				params,
			});
			const { data, attendance_summary } = response.data;

			if (attendance_summary) setSummary(attendance_summary);

			if (showAll) {
				setParticipants(data);
				setPageInfo({ total: data.length });
			} else {
				setParticipants(data.data);
				setPageInfo({
					current_page: data.current_page,
					last_page: data.last_page,
					total: data.total,
				});
			}
		} catch (error) {
			notify('error', 'Gagal', 'Tidak dapat memuat daftar peserta. Silakan coba lagi nanti.');
		} finally {
			setLoading(false);
			setIsPageLoading(false);
		}
	};

	useEffect(() => {
		if (eventId) fetchParticipants();
	}, [eventId, showAll, attendanceFilter]);

	const toggleReveal = (ticketId, field) => {
		setRevealed((prev) => ({
			...prev,
			[ticketId]: { ...prev[ticketId], [field]: !prev[ticketId]?.[field] },
		}));
	};

	const handlePageChange = (page) => {
		if (page < 1 || page > pageInfo.last_page) return;
		fetchParticipants(page);
	};

	const handleExportCSV = async () => {
		setIsExporting(true);
		try {
			const res = await api.get(`/event-dashboard/${eventId}/export-report`, {
				responseType: 'blob',
			});
			const url = window.URL.createObjectURL(new Blob([res.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `laporan_kehadiran_event_${eventId}.xlsx`);
			document.body.appendChild(link);
			link.click();
			link.parentNode.removeChild(link);
			notify('success', 'Berhasil', 'Laporan berhasil diunduh!');
		} catch (error) {
			console.error('Export error:', error);
			notify('error', 'Gagal', 'Tidak dapat mengunduh laporan. Silakan coba lagi nanti.');
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className="participant-page">
			<div className="d-flex justify-content-between align-items-start">
				<FormHeading
					title="Daftar Peserta Event"
					description={`Total: ${summary.total} peserta terdaftar`}
				/>
			</div>

			<ParticipantStats summary={summary} />

			<div className="participant-card">
				<ParticipantToolbar
					attendanceFilter={attendanceFilter}
					setAttendanceFilter={setAttendanceFilter}
					showAll={showAll}
					setShowAll={setShowAll}
					isExporting={isExporting}
					handleExportCSV={handleExportCSV}
				/>

				<div className="table-responsive">
					<ParticipantTable
						participants={participants}
						loading={loading}
						showAll={showAll}
						pageInfo={pageInfo}
						revealed={revealed}
						toggleReveal={toggleReveal}
						summary={summary}
					/>
				</div>

				{!loading && (
					<ParticipantPagination
						showAll={showAll}
						pageInfo={pageInfo}
						handlePageChange={handlePageChange}
					/>
				)}
			</div>
		</div>
	);
};

export default EventParticipantListPage;
