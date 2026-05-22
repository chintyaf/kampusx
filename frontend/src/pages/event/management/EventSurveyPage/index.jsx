import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, InputGroup } from 'react-bootstrap';
import {
	Menu,
	Home,
	Calendar,
	Users,
	FileText,
	Award,
	Package,
	BarChart3,
	Megaphone,
	ChevronDown,
	ChevronRight,
	Bell,
	Plus,
	MessageSquare,
	CheckCircle2,
	Search,
	Star,
	CheckCheck,
} from 'lucide-react';
import SurveyDetailPage from './SurveyDetailPage';
import EventLayout from '@/layouts/EventLayout';
import StatCard from '@/components/dashboard/StatCard';
import SurveyCard from './SurveyCard';
const surveysData = [
	{
		id: '1',
		title: 'Sesi 1 – UI/UX Basic',
		description: 'Rating pembicara dan materi untuk sesi UI/UX Basic',
		status: 'aktif',
		responses: 138,
		completionRate: 84,
		avgRating: 4.4,
		session: 'Sesi 1 – UI/UX Basic',
		createdAt: '15 Mar 2026',
	},
	{
		id: '2',
		title: 'Sesi 2 – Advanced Prototyping',
		description: 'Feedback khusus untuk kualitas pembicara dan metode penyampaian',
		status: 'aktif',
		responses: 45,
		completionRate: 71,
		avgRating: 4.1,
		session: 'Sesi 2 – Advanced Prototyping',
		createdAt: '15 Mar 2026',
	},
	{
		id: '3',
		title: 'Feedback Umum Event',
		description: 'Survei keseluruhan event dan pengalaman peserta secara umum',
		status: 'draft',
		responses: 0,
		completionRate: 0,
		avgRating: null,
		session: null,
		createdAt: '20 Mar 2026',
	},
];

export default function SurveyManagementPage() {
	const [filter, setFilter] = useState('semua');
	const [search, setSearch] = useState('');
	const [currentView, setCurrentView] = useState('list');
	const [selectedSurveyId, setSelectedSurveyId] = useState(undefined);

	const totalSurveys = surveysData.length;
	const aktifCount = surveysData.filter((s) => s.status === 'aktif').length;
	const draftCount = surveysData.filter((s) => s.status === 'draft').length;
	const totalResponses = surveysData.reduce((a, s) => a + s.responses, 0);

	const filtered = surveysData.filter((s) => {
		const matchFilter = filter === 'semua' || s.status === filter;
		const matchSearch =
			s.title.toLowerCase().includes(search.toLowerCase()) ||
			s.description.toLowerCase().includes(search.toLowerCase());
		return matchFilter && matchSearch;
	});

	if (currentView === 'detail' || currentView === 'new') {
		return (
			<SurveyDetailPage
				surveyId={currentView === 'detail' ? selectedSurveyId : undefined}
				onBack={() => {
					setCurrentView('list');
					setSelectedSurveyId(undefined);
				}}
			/>
		);
	}

	return (
		<EventLayout
			title="Pengaturan Feedback & Survei"
			description="Buat dan kelola form feedback untuk mengumpulkan penilaian peserta"
		>
			<div className="mb-4">
				{/* Stats Cards */}
				<Row className="g-3 mb-4">
					<Col md={3}>
						<StatCard
							Icon={MessageSquare}
							label={'Total'}
							value={totalSurveys}
							type="primary"
						/>
					</Col>
					<Col md={3}>
						<StatCard
							Icon={CheckCheck}
							label={'Aktif'}
							value={aktifCount}
							type="green"
						/>
					</Col>
					<Col md={3}>
						<StatCard
							Icon={CheckCheck}
							label={'Draft'}
							value={draftCount}
							type="green"
						/>
					</Col>
					<Col md={3}>
						<StatCard
							Icon={Users}
							label={'Total Respons Terkumpul'}
							value={totalResponses}
							type="yellow"
						/>
					</Col>
				</Row>

				{/* Search & Filter */}
				<div className="d-flex align-items-center gap-3 mb-4">
					<div className="flex-grow-1">
						<InputGroup className="border  rounded-3 overflow-hidden">
							<InputGroup.Text className="bg-white border-0 text-muted">
								<Search size={18} />
							</InputGroup.Text>
							<Form.Control
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Cari survei..."
								className="border-0 shadow-none bg-white rounded-0"
							/>
						</InputGroup>
					</div>
					<div className="d-flex bg-white rounded-3  overflow-hidden border">
						{['semua', 'aktif', 'draft'].map((f) => (
							<Button
								key={f}
								variant={filter === f ? 'primary' : 'light'}
								className={`border-0 rounded-0 text-capitalize px-4 ${filter === f ? 'text-white' : 'text-muted bg-white'}`}
								onClick={() => setFilter(f)}
							>
								{f}
							</Button>
						))}
					</div>
				</div>

				{/* Survey List */}
				<div className="d-flex flex-column gap-3">
					{filtered.map((survey) => (
						<SurveyCard
							survey={survey}
							setSelectedSurveyId={setSelectedSurveyId}
							setCurrentView={setCurrentView}
						/>
					))}

					{filtered.length === 0 && (
						<Card className="border-0  rounded-4 text-center p-5">
							<div className="d-flex justify-content-center mb-3">
								<div className="p-3 bg-light rounded-circle text-muted">
									<MessageSquare size={32} />
								</div>
							</div>
							<p className="text-muted mb-0">Tidak ada survei ditemukan</p>
						</Card>
					)}
				</div>
			</div>
		</EventLayout>
	);
}
