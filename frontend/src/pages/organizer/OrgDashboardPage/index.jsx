import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import StatCards from '@/components/dashboard/StatCards';
import { Search, Plus, Users, Activity, Mic2, ShieldAlert } from 'lucide-react';
import { useLoading } from '@/context/LoadingContext';

import './org-dashboard.css';
import HeroCard from './components/HeroCard';
import EventTabs from './components/EventTabs';
import EventCard from './components/EventCard';

export default function OrgDashboardPage() {
	const navigate = useNavigate();
	const [activeNav, setActiveNav] = useState('overview');
	const [activeTab, setActiveTab] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const { isPageLoading, setIsPageLoading } = useLoading();

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				setLoading(true);
				const response = await api.get('/organizer/events-list');
				if (response.data && response.data.status === 'success') {
					setEvents(response.data.data);
				} else {
					setEvents([]);
				}
			} catch (err) {
				console.error('Error fetching organizer events:', err);
				setError('Gagal memuat data event. Silakan coba beberapa saat lagi.');
			} finally {
				setLoading(false);
			}
		};

		fetchEvents();
	}, []);

	const activeEventsCount = events.filter(
		(e) => e.status === 'published' || e.status === 'ongoing',
	).length;
	const draftEventsCount = events.filter((e) => e.status === 'draft').length;
	const totalAttendeesCount = events.reduce((sum, e) => sum + (parseInt(e.attendees) || 0), 0);
	const totalCheckIns = events.reduce((sum, e) => sum + (parseInt(e.check_ins) || 0), 0);
	const checkInRate =
		totalAttendeesCount > 0 ? Math.round((totalCheckIns / totalAttendeesCount) * 100) : 0;

	const totalCapacity = events.reduce((sum, e) => sum + (parseInt(e.capacity) || 200), 0);
	const remainingCapacity = totalCapacity - totalAttendeesCount;

	const needsActionCount = events.filter((e) => e.status === 'draft' || e.needsAttention).length;

	const filteredByTab = events.filter((e) => {
		if (activeTab === 'all') return true;
		if (activeTab === 'upcoming') return e.status === 'published';
		return e.status === activeTab;
	});

	const filtered = filteredByTab.filter((e) =>
		e.title.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const heroEvent =
		events.find((e) => e.status === 'ongoing') ||
		events.find((e) => e.status === 'published') ||
		(events.length > 0 ? events[0] : null);

	const statsData = [
		{
			label: 'Event Aktif',
			value: `${activeEventsCount}`,
			sub: 'Sedang berjalan & mendatang',
			lucideIcon: Activity,
			iconBg: '#dcfce7',
			iconColor: '#166534',
		},
		{
			label: 'Total Peserta',
			value: totalAttendeesCount.toLocaleString('id-ID'),
			sub: `Sisa ${remainingCapacity > 0 ? remainingCapacity.toLocaleString('id-ID') : 0} kapasitas`,
			lucideIcon: Users,
			iconBg: '#dff3ff',
			iconColor: '#00699e',
		},
		{
			label: 'Tingkat Kehadiran',
			value: `${checkInRate}%`,
			sub: `Rata-rata check-in`,
			lucideIcon: Mic2,
			iconBg: '#fef3c7',
			iconColor: '#92400e',
		},
		{
			label: 'Perlu Tindakan',
			value: `${needsActionCount}`,
			sub: `${draftEventsCount} Draft menunggu rilis`,
			lucideIcon: ShieldAlert,
			iconBg: '#fee2e2',
			iconColor: '#991b1b',
		},
	];

	return (
		<>
			{/* Main */}
			<div className="flex-grow-1 d-flex flex-column min-w-0">
				<div>
					{/* Metrics */}
					<StatCards stats={statsData} />

					{/* Hero Card Highlight */}
					<HeroCard heroEvent={heroEvent} />

					{/* Body */}
					<div className="d-flex gap-4 align-items-start">
						{/* Events */}
						<div className="org-content-container flex-grow-1 border p-4 min-w-0">
							<div className="d-flex justify-content-between align-items-center mb-4">
								<h2 className="org-section-title fs-2 fw-bold m-0">
									Manajemen Event
								</h2>
								<div className="d-flex align-items-center gap-3">
									<div className="position-relative d-flex align-items-center">
										<Search
											size={13}
											color="var(--color-secondary)"
											className="position-absolute org-search-icon"
										/>
										<input
											placeholder="Cari event..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="org-search-input border rounded-2 py-2 pe-2 fs-4"
										/>
									</div>
									<button
										onClick={() => navigate('/organizer/buat-acara')}
										className="btn btn-dark d-flex align-items-center gap-2 px-3 py-2 fw-medium fs-4 rounded-2 text-nowrap"
									>
										Buat Event
										<Plus size={16} />
									</button>
								</div>
							</div>

							{/* Tabs */}
							<EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />

							<div className="d-flex flex-column gap-3">
								{loading ? (
									<div className="org-state-text-muted py-5 text-center fs-3">
										Memuat data event...
									</div>
								) : error ? (
									<div className="org-state-text-danger py-5 text-center fs-3">
										{error}
									</div>
								) : filtered.length === 0 ? (
									<div className="org-state-text-muted py-5 text-center fs-3">
										Tidak ada event ditemukan.
									</div>
								) : (
									filtered.map((event) => (
										<EventCard key={event.id} event={event} />
									))
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
