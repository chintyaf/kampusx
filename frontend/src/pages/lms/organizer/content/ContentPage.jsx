import React, { useState } from 'react';
import {
	FolderGit2,
	FileText,
	Video,
	Code2,
	Database,
	Link2,
	Plus,
	Search,
	Filter,
	Calendar,
	ExternalLink,
	Download,
	Trash2,
	CheckCircle,
	Sparkles,
	Tag,
} from 'lucide-react';

const INITIAL_RESOURCES = [
	{
		id: 'res-1',
		name: 'Arsitektur_Microservices_Clean_Arch.pdf',
		type: 'PDF',
		size: '4.2 MB',
		category: 'Backend Architecture',
		downloads: 342,
		linkedPaths: 3,
		uploadedAt: '2026-01-10',
	},
	{
		id: 'res-2',
		name: 'Lecture_Video_REST_vs_gRPC.mp4',
		type: 'Video',
		size: '48.5 MB',
		category: 'API Engineering',
		downloads: 810,
		linkedPaths: 2,
		uploadedAt: '2026-01-15',
	},
	{
		id: 'res-3',
		name: 'Starter_Kit_Express_TypeScript.zip',
		type: 'Code',
		size: '1.8 MB',
		category: 'Fullstack Dev',
		downloads: 512,
		linkedPaths: 4,
		uploadedAt: '2026-01-20',
	},
	{
		id: 'res-4',
		name: 'Dataset_Machine_Learning_Student_Readiness.csv',
		type: 'Dataset',
		size: '12.4 MB',
		category: 'Data Science',
		downloads: 219,
		linkedPaths: 1,
		uploadedAt: '2026-02-02',
	},
];

const INITIAL_EVENTS = [
	{
		id: 'ev-1',
		eventName: 'AI Summit Indonesia 2026',
		date: '15 Maret 2026',
		linkedLearningPath: 'Data Science & Machine Learning Foundations',
		attendeesCount: 450,
		status: 'Active Synced',
	},
	{
		id: 'ev-2',
		eventName: 'KampusX National Hackathon',
		date: '28 Maret 2026',
		linkedLearningPath: 'Web Application Architecture & REST API',
		attendeesCount: 320,
		status: 'Active Synced',
	},
	{
		id: 'ev-3',
		eventName: 'Web3 & Blockchain Career Fair',
		date: '10 April 2026',
		linkedLearningPath: 'Smart Contract & Blockchain Credentialing',
		attendeesCount: 210,
		status: 'Pending Verification',
	},
];

const ContentPage = () => {
	const [activeTab, setActiveTab] = useState('resources'); // 'resources' | 'events'
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedType, setSelectedType] = useState('All');
	const [resources, setResources] = useState(INITIAL_RESOURCES);
	const [events, setEvents] = useState(INITIAL_EVENTS);
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [showLinkModal, setShowLinkModal] = useState(false);

	// Resource type icons
	const getTypeIcon = (type) => {
		switch (type) {
			case 'PDF':
				return <FileText className="w-4 h-4 text-rose-500" />;
			case 'Video':
				return <Video className="w-4 h-4 text-blue-500" />;
			case 'Code':
				return <Code2 className="w-4 h-4 text-emerald-500" />;
			case 'Dataset':
				return <Database className="w-4 h-4 text-amber-500" />;
			default:
				return <FolderGit2 className="w-4 h-4 text-slate-500" />;
		}
	};

	const filteredResources = resources.filter((item) => {
		const matchSearch =
			item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.category.toLowerCase().includes(searchQuery.toLowerCase());
		const matchType = selectedType === 'All' || item.type === selectedType;
		return matchSearch && matchType;
	});

	return (
		<div className="min-h-screen bg-slate-50/70 p-6 md:p-8 space-y-6">
			{/* Top Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
							Organizer LMS
						</span>
						<span className="text-xs text-slate-500">• Repository & Event Integration</span>
					</div>
					<h1 className="text-2xl font-bold text-slate-900 tracking-tight">
						Content Repository & Event Linker
					</h1>
					<p className="text-sm text-slate-500 mt-1">
						Pusat penyimpanan aset modul microlearning dan penautan otomatis materi ke event KampusX.
					</p>
				</div>
				<div className="flex items-center gap-3">
					{activeTab === 'resources' ? (
						<button
							onClick={() => setShowUploadModal(true)}
							className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition shadow-sm"
						>
							<Plus className="w-4 h-4" />
							Unggah Resource Baru
						</button>
					) : (
						<button
							onClick={() => setShowLinkModal(true)}
							className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition shadow-sm"
						>
							<Link2 className="w-4 h-4" />
							Tautkan Event Baru
						</button>
					)}
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="flex items-center gap-2 border-b border-slate-200">
				<button
					onClick={() => setActiveTab('resources')}
					className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
						activeTab === 'resources'
							? 'border-blue-600 text-blue-600'
							: 'border-transparent text-slate-500 hover:text-slate-700'
					}`}
				>
					Resource Repository ({resources.length})
				</button>
				<button
					onClick={() => setActiveTab('events')}
					className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
						activeTab === 'events'
							? 'border-blue-600 text-blue-600'
							: 'border-transparent text-slate-500 hover:text-slate-700'
					}`}
				>
					Event Linker Interface ({events.length})
				</button>
			</div>

			{/* TAB 1: RESOURCE REPOSITORY */}
			{activeTab === 'resources' && (
				<div className="space-y-4">
					{/* Search & Filter Controls */}
					<div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div className="relative flex-1">
							<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
							<input
								type="text"
								placeholder="Cari nama berkas atau kategori..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Filter className="w-4 h-4 text-slate-400" />
							<select
								value={selectedType}
								onChange={(e) => setSelectedType(e.target.value)}
								className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
							>
								<option value="All">Semua Tipe File</option>
								<option value="PDF">PDF Dokumen</option>
								<option value="Video">Video Materi</option>
								<option value="Code">Source Code / Repo</option>
								<option value="Dataset">Dataset / CSV</option>
							</select>
						</div>
					</div>

					{/* Resources Table */}
					<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm text-slate-600">
								<thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
									<tr>
										<th className="px-6 py-4">Nama Resource</th>
										<th className="px-6 py-4">Kategori</th>
										<th className="px-6 py-4">Ukuran</th>
										<th className="px-6 py-4">Tertaut ke</th>
										<th className="px-6 py-4">Unduhan</th>
										<th className="px-6 py-4 text-right">Aksi</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100">
									{filteredResources.map((res) => (
										<tr key={res.id} className="hover:bg-slate-50/70 transition">
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<div className="p-2 rounded-lg bg-slate-100">
														{getTypeIcon(res.type)}
													</div>
													<div>
														<div className="font-semibold text-slate-900">{res.name}</div>
														<div className="text-[11px] text-slate-400">
															Diunggah pada {res.uploadedAt}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-md">
													{res.category}
												</span>
											</td>
											<td className="px-6 py-4 text-xs font-medium text-slate-600">{res.size}</td>
											<td className="px-6 py-4 text-xs font-medium text-blue-600">
												{res.linkedPaths} Learning Path
											</td>
											<td className="px-6 py-4 text-xs text-slate-600">{res.downloads}x</td>
											<td className="px-6 py-4 text-right">
												<div className="flex items-center justify-end gap-2">
													<button
														className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
														title="Unduh File"
													>
														<Download className="w-4 h-4" />
													</button>
													<button
														onClick={() =>
															setResources((prev) => prev.filter((r) => r.id !== res.id))
														}
														className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
														title="Hapus Resource"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}

			{/* TAB 2: EVENT LINKER INTERFACE */}
			{activeTab === 'events' && (
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{events.map((ev) => (
							<div
								key={ev.id}
								className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
							>
								<div>
									<div className="flex items-center justify-between text-xs mb-2">
										<span className="px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
											{ev.status}
										</span>
										<span className="text-slate-400 flex items-center gap-1 text-[11px]">
											<Calendar className="w-3.5 h-3.5" />
											{ev.date}
										</span>
									</div>
									<h3 className="font-bold text-slate-900 text-base">{ev.eventName}</h3>
									<div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
										<span className="text-slate-400 block text-[11px] font-medium">
											Learning Path Terkait:
										</span>
										<span className="font-semibold text-slate-800 line-clamp-1 mt-0.5">
											{ev.linkedLearningPath}
										</span>
									</div>
								</div>

								<div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
									<span>{ev.attendeesCount} Peserta Terdaftar</span>
									<button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
										Sinkronisasi
										<Sparkles className="w-3.5 h-3.5 text-blue-500" />
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Simple Upload Modal Mock */}
			{showUploadModal && (
				<div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
						<h3 className="text-lg font-bold text-slate-900">Unggah Materi Baru</h3>
						<div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 hover:border-blue-400 transition cursor-pointer">
							<FolderGit2 className="w-8 h-8 mx-auto mb-2 text-slate-400" />
							<p className="text-xs font-semibold text-slate-700">Tarik berkas PDF/Video/ZIP ke sini</p>
							<p className="text-[11px] text-slate-400 mt-1">Maksimum ukuran 100MB per file</p>
						</div>
						<div className="flex justify-end gap-2 pt-2">
							<button
								onClick={() => setShowUploadModal(false)}
								className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
							>
								Batal
							</button>
							<button
								onClick={() => setShowUploadModal(false)}
								className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
							>
								Simpan Resource
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ContentPage;
