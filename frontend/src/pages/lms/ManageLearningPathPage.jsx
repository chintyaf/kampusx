import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
	ChevronLeft,
	ChevronDown,
	ChevronRight,
	Calendar,
	Layers,
	Users,
	Eye,
	Award,
	Link,
	BarChart2,
	Plus,
	Sparkles,
	GripVertical,
	Edit,
	Trash2,
	BookOpen,
	Cpu,
	HelpCircle,
} from 'lucide-react';

// ==========================================
// CONSTANT DATA DEFINITIONS
// ==========================================

const LEARNING_PATH_DATA = {
	title: 'Intro to Machine Learning',
	collectionName: 'Intro to Machine Learning (Collection)',
	status: 'Published',
	linkedEvent: 'AI Summit 2026',
	totalModules: '8 Modules',
	enrolledStudents: '847 Enrolled Students',
};

const TABS_DATA = [
	{ id: 'curriculum', label: 'Curriculum Builder', icon: Layers },
	{ id: 'certificates', label: 'Certificate & Badges', icon: Award },
	{ id: 'linked-event', label: 'Linked Event & Rules', icon: Link },
	{ id: 'analytics', label: 'Analytics & Students', icon: BarChart2 },
];

const MODULES_DATA = [
	{
		id: 1,
		number: 1,
		title: 'Module 1: Fundamentals of Python',
		itemCountLabel: '3 Items',
		badgeColor: '#1d4ed8',
		isBadgePill: false,
		items: [
			{
				id: '1-1',
				title: 'Lesson 1.1 Introduction to Variables',
				meta: '· 5 mins · Article',
				icon: BookOpen,
				iconBg: 'var(--bahama-blue-100)',
				iconColor: 'var(--color-primary)',
			},
			{
				id: '1-2',
				title: 'Lesson 1.2 Data Structures Overview',
				meta: '· Microlearning Unit · ~8 mins',
				icon: Cpu,
				iconBg: 'var(--bahama-blue-100)',
				iconColor: 'var(--color-primary)',
			},
			{
				id: '1-3',
				title: 'Quiz 1.1 Reflection Quiz: Python Basics',
				meta: '· 5 Questions · Pass score: 80%',
				icon: HelpCircle,
				iconBg: '#fef3c7',
				iconColor: '#d97706',
				tag: {
					label: 'Graded',
					bg: '#fef3c7',
					color: '#92400e',
				},
			},
		],
	},
	{
		id: 2,
		number: 2,
		title: 'Module 2: Supervised Learning Techniques',
		itemCountLabel: '4 Lessons · 1 Quiz',
		badgeColor: 'var(--neutral-text)',
		isBadgePill: true,
		items: [],
	},
];

// ==========================================
// MAIN COMPONENT
// ==========================================

const ManageLearningPathPage = () => {
	// Hooks untuk Navigasi Router
	const navigate = useNavigate();
	const { learningId } = useParams();

	// State untuk Tab Aktif
	const [activeTab, setActiveTab] = useState('curriculum');

	// State untuk kontrol Expand/Collapse modul
	const [expandedModules, setExpandedModules] = useState({
		1: true,
		2: false,
	});

	// State pencarian
	const [searchQuery, setSearchQuery] = useState('');

	// Toggle modul tertentu
	const toggleModule = (id) => {
		setExpandedModules((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	// Toggle Expand All / Collapse All
	const toggleExpandAll = () => {
		const allExpanded = Object.values(expandedModules).every(Boolean);
		const newExpandedState = {};
		MODULES_DATA.forEach((mod) => {
			newExpandedState[mod.id] = !allExpanded;
		});
		setExpandedModules(newExpandedState);
	};

	// Fungsi Navigasi Edit Module
	const handleEditModule = (moduleId) => {
		// Menggunakan learningId dari URL params, atau fallback ID default jika belum ada
		const currentLearningId = learningId || '1';
		navigate(`/organizer/learning-path/${currentLearningId}/edit-module/${moduleId}`);
	};

	const isAllExpanded = Object.values(expandedModules).every(Boolean);

	return (
		<div
			style={{
				fontFamily: 'var(--font)',
				backgroundColor: 'var(--color-bg)',
				color: 'var(--color-text)',
				minHeight: '100vh',
				padding: '24px 32px',
			}}
		>
			{/* 1. Breadcrumb */}
			<div
				className="d-flex align-items-center gap-1 mb-2"
				style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-text)' }}
			>
				<ChevronLeft size={16} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
				<span style={{ cursor: 'pointer' }} onClick={() => navigate('/learning-paths')}>
					Learning Paths
				</span>
				<span>/</span>
				<span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
					{LEARNING_PATH_DATA.collectionName}
				</span>
			</div>

			{/* 2. Header Bar (Judul, Status Badge, Tombol Aksi) */}
			<div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-3">
				<div className="d-flex align-items-center gap-3">
					<h1
						className="m-0"
						style={{
							fontSize: 'var(--font-xl)',
							fontWeight: 700,
							color: 'var(--color-text)',
						}}
					>
						{LEARNING_PATH_DATA.title}
					</h1>
					{/* Badge Published */}
					<span
						className="d-inline-flex align-items-center gap-2 px-3 py-1"
						style={{
							backgroundColor: 'var(--success-bg)',
							color: 'var(--success-text)',
							borderRadius: 'var(--radius-full)',
							fontSize: 'var(--font-xs)',
							fontWeight: 600,
						}}
					>
						<span
							style={{
								width: 7,
								height: 7,
								borderRadius: '50%',
								backgroundColor: 'var(--success-text)',
							}}
						/>
						{LEARNING_PATH_DATA.status}
					</span>
				</div>

				{/* Tombol Kanan Atas */}
				<div className="d-flex align-items-center gap-2">
					<button
						className="btn d-inline-flex align-items-center gap-2 px-3 py-2"
						style={{
							backgroundColor: 'var(--card)',
							border: '1px solid var(--neutral-border)',
							borderRadius: 'var(--radius-md)',
							color: 'var(--color-text)',
							fontSize: 'var(--font-sm)',
							fontWeight: 600,
						}}
					>
						<Eye size={16} />
						Preview as Student
					</button>
					<button
						className="btn d-inline-flex align-items-center gap-2 px-3 py-2"
						style={{
							backgroundColor: 'var(--color-primary)',
							color: 'var(--color-white)',
							borderRadius: 'var(--radius-md)',
							fontSize: 'var(--font-sm)',
							fontWeight: 600,
							border: 'none',
						}}
					>
						Save Changes
					</button>
				</div>
			</div>

			{/* 3. Sub-header Metadata */}
			<div
				className="d-flex align-items-center gap-4 mb-4 flex-wrap"
				style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-text)' }}
			>
				<div className="d-flex align-items-center gap-2">
					<Calendar size={16} />
					<span>
						Linked Event:{' '}
						<strong style={{ color: 'var(--color-text-muted)' }}>
							{LEARNING_PATH_DATA.linkedEvent}
						</strong>
					</span>
				</div>
				<span>·</span>
				<div className="d-flex align-items-center gap-2">
					<Layers size={16} />
					<span>{LEARNING_PATH_DATA.totalModules}</span>
				</div>
				<span>·</span>
				<div className="d-flex align-items-center gap-2">
					<Users size={16} />
					<span>{LEARNING_PATH_DATA.enrolledStudents}</span>
				</div>
			</div>

			{/* 4. Tab Navigasi */}
			<div
				className="d-flex align-items-center gap-4 mb-4 border-bottom"
				style={{ borderColor: 'var(--neutral-border)' }}
			>
				{TABS_DATA.map((tab) => {
					const IconComponent = tab.icon;
					const isActive = activeTab === tab.id;
					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className="btn pb-3 px-1 d-inline-flex align-items-center gap-2 rounded-0 border-0"
							style={{
								fontSize: 'var(--font-sm)',
								fontWeight: isActive ? 600 : 500,
								color: isActive ? 'var(--color-primary)' : 'var(--neutral-text)',
								borderBottom: isActive
									? '2px solid var(--color-primary)'
									: '2px solid transparent',
								marginBottom: '-1px',
							}}
						>
							<IconComponent size={18} />
							{tab.label}
						</button>
					);
				})}
			</div>

			{/* 5. Tool Bar */}
			<div className="row g-3 align-items-center mb-4">
				<div className="col-md-5">
					<div className="position-relative">
						<input
							type="text"
							className="form-control ps-4 py-2"
							placeholder="Search lessons and quizzes..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							style={{
								borderRadius: 'var(--radius-full)',
								fontSize: 'var(--font-sm)',
								borderColor: 'var(--neutral-border)',
								backgroundColor: 'var(--card)',
							}}
						/>
					</div>
				</div>
				<div className="col-md-7 d-flex justify-content-md-end gap-2 flex-wrap">
					<button
						onClick={toggleExpandAll}
						className="btn d-inline-flex align-items-center gap-2 px-3 py-2"
						style={{
							backgroundColor: 'var(--card)',
							border: '1px solid var(--neutral-border)',
							borderRadius: 'var(--radius-md)',
							fontSize: 'var(--font-sm)',
							fontWeight: 500,
							color: 'var(--color-text)',
						}}
					>
						{isAllExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
						Expand All
					</button>

					<button
						className="btn d-inline-flex align-items-center gap-2 px-3 py-2"
						style={{
							backgroundColor: 'var(--card)',
							border: '1px solid var(--neutral-border)',
							borderRadius: 'var(--radius-md)',
							fontSize: 'var(--font-sm)',
							fontWeight: 600,
							color: 'var(--color-text)',
						}}
					>
						<Plus size={16} />
						Add Module
					</button>

					<button
						className="btn d-inline-flex align-items-center gap-2 px-3 py-2"
						style={{
							backgroundColor: 'var(--card)',
							border: '1px solid var(--neutral-border)',
							borderRadius: 'var(--radius-md)',
							fontSize: 'var(--font-sm)',
							fontWeight: 600,
							color: 'var(--purple-text)',
						}}
					>
						<Sparkles size={16} style={{ color: 'var(--purple-text)' }} />
						AI Auto-Generate
					</button>
				</div>
			</div>

			{/* 6. Daftar Modul */}
			<div className="d-flex flex-column gap-3">
				{MODULES_DATA.map((module) => {
					const isExpanded = !!expandedModules[module.id];

					return (
						<div
							key={module.id}
							style={{
								backgroundColor: 'var(--card)',
								borderRadius: 'var(--radius-lg)',
								border: '1px solid var(--border)',
								overflow: 'hidden',
							}}
						>
							{/* Header Module */}
							<div
								className={`d-flex align-items-center justify-content-between p-3 ${
									isExpanded ? 'border-bottom' : ''
								}`}
								style={{ borderColor: 'var(--neutral-border)' }}
							>
								<div className="d-flex align-items-center gap-2">
									<GripVertical
										size={18}
										style={{ color: '#cbd5e1', cursor: 'grab' }}
									/>
									<button
										className="btn p-0 border-0 me-1"
										onClick={() => toggleModule(module.id)}
										style={{ background: 'none' }}
									>
										{isExpanded ? (
											<ChevronDown size={18} />
										) : (
											<ChevronRight size={18} />
										)}
									</button>

									{/* Badge Nomor */}
									<span
										className="d-flex align-items-center justify-content-center text-white me-2"
										style={{
											width: 28,
											height: 28,
											borderRadius: '50%',
											backgroundColor: module.badgeColor,
											fontSize: 'var(--font-sm)',
											fontWeight: 700,
										}}
									>
										{module.number}
									</span>

									<span
										style={{
											fontWeight: 700,
											fontSize: 'var(--font-md)',
											color: 'var(--color-text)',
										}}
									>
										{module.title}
									</span>

									{/* Label / Badge Jumlah Item */}
									<span
										className={module.isBadgePill ? 'ms-2 px-3 py-1' : 'ms-2'}
										style={
											module.isBadgePill
												? {
														fontSize: 'var(--font-xs)',
														color: 'var(--neutral-text)',
														backgroundColor: 'var(--neutral-bg)',
														borderRadius: 'var(--radius-full)',
														fontWeight: 500,
													}
												: {
														fontSize: 'var(--font-sm)',
														color: 'var(--neutral-text)',
													}
										}
									>
										{module.itemCountLabel}
									</span>
								</div>

								<div className="d-flex align-items-center gap-3">
									{/* Tombol Edit Modul dengan Navigasi */}
									<button
										onClick={() => handleEditModule(module.id)}
										className="btn p-0 border-0 d-flex align-items-center gap-1"
										style={{
											fontSize: 'var(--font-sm)',
											color: 'var(--color-text)',
										}}
									>
										<Edit size={16} /> Edit
									</button>

									<button
										className="btn p-0 border-0 d-flex align-items-center gap-1"
										style={{
											fontSize: 'var(--font-sm)',
											color: 'var(--error-text)',
										}}
									>
										<Trash2 size={16} /> Delete
									</button>
								</div>
							</div>

							{/* Body Module (List Item) */}
							{isExpanded && (
								<div
									className="p-3 d-flex flex-column gap-2"
									style={{ backgroundColor: '#fafbfc' }}
								>
									{module.items.map((item) => {
										const ItemIcon = item.icon;
										return (
											<div
												key={item.id}
												className="d-flex align-items-center justify-content-between p-3"
												style={{
													backgroundColor: 'var(--card)',
													borderRadius: 'var(--radius-md)',
													border: '1px solid var(--neutral-border)',
												}}
											>
												<div className="d-flex align-items-center gap-3">
													<GripVertical
														size={16}
														style={{ color: '#cbd5e1', cursor: 'grab' }}
													/>
													<div
														className="d-flex align-items-center justify-content-center"
														style={{
															width: 36,
															height: 36,
															borderRadius: 'var(--radius-md)',
															backgroundColor: item.iconBg,
															color: item.iconColor,
														}}
													>
														<ItemIcon size={18} />
													</div>
													<div className="d-flex align-items-center gap-2 flex-wrap">
														<span
															style={{
																fontWeight: 600,
																fontSize: 'var(--font-sm)',
																color: 'var(--color-text)',
															}}
														>
															{item.title}
														</span>
														<span
															style={{
																fontSize: 'var(--font-xs)',
																color: 'var(--neutral-text)',
															}}
														>
															{item.meta}
														</span>
														{item.tag && (
															<span
																className="px-2 py-1"
																style={{
																	backgroundColor: item.tag.bg,
																	color: item.tag.color,
																	borderRadius:
																		'var(--radius-sm)',
																	fontSize: 'var(--font-xs)',
																	fontWeight: 600,
																}}
															>
																{item.tag.label}
															</span>
														)}
													</div>
												</div>
											</div>
										);
									})}

									{/* Area Tambah Lesson / Quiz (Dashed) */}
									<div
										className="d-flex align-items-center justify-content-center p-3 mt-2"
										style={{
											border: '2px dashed var(--bahama-blue-300)',
											backgroundColor: 'var(--bahama-blue-50)',
											borderRadius: 'var(--radius-md)',
											color: 'var(--color-primary)',
											cursor: 'pointer',
											fontWeight: 600,
											fontSize: 'var(--font-sm)',
										}}
									>
										<Plus size={16} className="me-2" />
										Add Lesson / Quiz to Module {module.number}
									</div>
								</div>
							)}
						</div>
					);
				})}

				{/* 7. Tombol Dashed Tambah Modul Baru */}
				<div
					className="d-flex align-items-center justify-content-center p-3 mt-2"
					style={{
						border: '2px dashed var(--neutral-border)',
						backgroundColor: 'var(--card)',
						borderRadius: 'var(--radius-lg)',
						color: 'var(--neutral-text)',
						cursor: 'pointer',
						fontWeight: 600,
						fontSize: 'var(--font-sm)',
					}}
				>
					<Plus size={16} className="me-2" />
					Add New Module
				</div>
			</div>
		</div>
	);
};

export default ManageLearningPathPage;
