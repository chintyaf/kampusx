import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
	Layers,
	Plus,
	Search,
	Filter,
	Edit,
	Trash2,
	Eye,
	MoreHorizontal,
	ChevronLeft,
	ChevronRight,
	Calendar,
	Users,
	BookOpen,
	CheckCircle,
	AlertCircle,
	ArrowUpDown,
	Sparkles,
} from 'lucide-react';

const INITIAL_PATHS = [
	{
		id: 'lp-01',
		title: 'Web Application Architecture & REST API',
		category: 'Software Engineering',
		description: 'Pelajari perancangan sistem backend modern, microservices, dan standarisasi API.',
		status: 'Published',
		modulesCount: 8,
		lessonsCount: 24,
		enrolledCount: 847,
		completionRate: 78,
		createdAt: '2025-11-12',
	},
	{
		id: 'lp-02',
		title: 'Data Science & Machine Learning Foundations',
		category: 'Artificial Intelligence',
		description: 'Konsep dasar Python, exploratory data analysis, dan model klasifikasi dasar.',
		status: 'Published',
		modulesCount: 6,
		lessonsCount: 18,
		enrolledCount: 634,
		completionRate: 64,
		createdAt: '2025-11-20',
	},
	{
		id: 'lp-03',
		title: 'Fullstack Microlearning with React 19 & Tailwind',
		category: 'Web Development',
		description: 'Praktek interaktif membuat aplikasi responsif dengan arsitektur komponen modern.',
		status: 'Draft',
		modulesCount: 10,
		lessonsCount: 30,
		enrolledCount: 0,
		completionRate: 0,
		createdAt: '2026-01-05',
	},
	{
		id: 'lp-04',
		title: 'Smart Contract & Blockchain Credentialing',
		category: 'Web3 & Security',
		description: 'Verifikasi ijazah dan mikro-kredensial transparan menggunakan jaringan blockchain.',
		status: 'Published',
		modulesCount: 5,
		lessonsCount: 15,
		enrolledCount: 512,
		completionRate: 89,
		createdAt: '2026-01-18',
	},
	{
		id: 'lp-05',
		title: 'Self-Regulated Learning (SRL) Masterclass',
		category: 'Education & Pedagogy',
		description: 'Strategi metakognitif untuk meningkatkan retensi materi dan fokus belajar mandiri.',
		status: 'Published',
		modulesCount: 4,
		lessonsCount: 12,
		enrolledCount: 320,
		completionRate: 82,
		createdAt: '2026-02-01',
	},
	{
		id: 'lp-06',
		title: 'Cloud Native DevOps with Docker & Kubernetes',
		category: 'Software Engineering',
		description: 'Containerization, CI/CD pipelines, dan orchestrasi deployment skala besar.',
		status: 'Draft',
		modulesCount: 7,
		lessonsCount: 21,
		enrolledCount: 0,
		completionRate: 0,
		createdAt: '2026-02-14',
	},
];

const ITEMS_PER_PAGE = 4;

const LearningPathsPage = () => {
	const navigate = useNavigate();
	const [paths, setPaths] = useState(INITIAL_PATHS);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [selectedStatus, setSelectedStatus] = useState('All');
	const [currentPage, setCurrentPage] = useState(1);
	const [deleteModalId, setDeleteModalId] = useState(null);

	const categories = useMemo(() => {
		const cats = Array.from(new Set(INITIAL_PATHS.map((p) => p.category)));
		return ['All', ...cats];
	}, []);

	const filteredPaths = useMemo(() => {
		return paths.filter((item) => {
			const matchSearch =
				item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.description.toLowerCase().includes(searchQuery.toLowerCase());
			const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
			const matchStatus = selectedStatus === 'All' || item.status === selectedStatus;
			return matchSearch && matchCategory && matchStatus;
		});
	}, [paths, searchQuery, selectedCategory, selectedStatus]);

	const totalPages = Math.ceil(filteredPaths.length / ITEMS_PER_PAGE) || 1;
	const paginatedPaths = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredPaths.slice(start, start + ITEMS_PER_PAGE);
	}, [filteredPaths, currentPage]);

	const handleDelete = (id) => {
		setPaths((prev) => prev.filter((p) => p.id !== id));
		setDeleteModalId(null);
	};

	return (
		<div className="min-h-screen bg-slate-50/70 p-6 md:p-8 space-y-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
							Organizer LMS
						</span>
						<span className="text-xs text-slate-500">• Learning Paths Catalog</span>
					</div>
					<h1 className="text-2xl font-bold text-slate-900 tracking-tight">
						Manajemen Learning Paths
					</h1>
					<p className="text-sm text-slate-500 mt-1">
						Kelola semua jalur kurikulum mikro, pantau status publikasi, dan atur struktur modul.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Link
						to="/organizer/ai-studio/upload"
						className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 font-semibold text-sm hover:bg-purple-100 transition duration-150"
					>
						<Sparkles className="w-4 h-4 text-purple-600" />
						Generate via AI Studio
					</Link>
					<Link
						to="/organizer/learning-path/add"
						className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition duration-150 shadow-sm"
					>
						<Plus className="w-4 h-4" />
						Tambah Learning Path
					</Link>
				</div>
			</div>

			{/* Filter & Search Bar */}
			<div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="relative flex-1">
					<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
					<input
						type="text"
						placeholder="Cari berdasarkan judul atau deskripsi..."
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							setCurrentPage(1);
						}}
						className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
					/>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center gap-2">
						<Filter className="w-4 h-4 text-slate-400" />
						<span className="text-xs font-medium text-slate-500">Kategori:</span>
						<select
							value={selectedCategory}
							onChange={(e) => {
								setSelectedCategory(e.target.value);
								setCurrentPage(1);
							}}
							className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
						>
							{categories.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>

					<div className="flex items-center gap-2">
						<span className="text-xs font-medium text-slate-500">Status:</span>
						<select
							value={selectedStatus}
							onChange={(e) => {
								setSelectedStatus(e.target.value);
								setCurrentPage(1);
							}}
							className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
						>
							<option value="All">Semua</option>
							<option value="Published">Published</option>
							<option value="Draft">Draft</option>
						</select>
					</div>
				</div>
			</div>

			{/* Data Table */}
			<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm text-slate-600">
						<thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
							<tr>
								<th className="px-6 py-4">Learning Path</th>
								<th className="px-6 py-4">Kategori</th>
								<th className="px-6 py-4">Struktur</th>
								<th className="px-6 py-4">Status</th>
								<th className="px-6 py-4">Penyelesaian</th>
								<th className="px-6 py-4 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{paginatedPaths.length === 0 ? (
								<tr>
									<td colSpan="6" className="px-6 py-12 text-center text-slate-400">
										<Layers className="w-10 h-10 mx-auto mb-2 text-slate-300" />
										Tidak ada learning path yang ditemukan sesuai kriteria filter.
									</td>
								</tr>
							) : (
								paginatedPaths.map((item) => (
									<tr key={item.id} className="hover:bg-slate-50/70 transition duration-150">
										<td className="px-6 py-4 max-w-xs">
											<div className="font-semibold text-slate-900 line-clamp-1">{item.title}</div>
											<div className="text-xs text-slate-400 mt-1 line-clamp-1">{item.description}</div>
										</td>
										<td className="px-6 py-4">
											<span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
												{item.category}
											</span>
										</td>
										<td className="px-6 py-4">
											<div className="text-xs text-slate-800 font-medium">
												{item.modulesCount} Modul • {item.lessonsCount} Lesson
											</div>
											<div className="text-xs text-slate-400 mt-0.5">
												{item.enrolledCount} Peserta
											</div>
										</td>
										<td className="px-6 py-4">
											<span
												className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
													item.status === 'Published'
														? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
														: 'bg-amber-50 text-amber-700 border border-amber-200'
												}`}
											>
												<span
													className={`w-1.5 h-1.5 rounded-full ${
														item.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'
													}`}
												/>
												{item.status}
											</span>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2.5">
												<div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
													<div
														className="bg-blue-600 h-2 rounded-full"
														style={{ width: `${item.completionRate}%` }}
													/>
												</div>
												<span className="text-xs font-semibold text-slate-700">
													{item.completionRate}%
												</span>
											</div>
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex items-center justify-end gap-1.5">
												<button
													onClick={() => navigate(`/organizer/learning-path/${item.id}`)}
													className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
													title="Edit & Kelola Kurikulum"
												>
													<Edit className="w-4 h-4" />
												</button>
												<Link
													to={`/learner/learning-paths/${item.id}`}
													target="_blank"
													className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
													title="Preview sebagai Learner"
												>
													<Eye className="w-4 h-4" />
												</Link>
												<button
													onClick={() => setDeleteModalId(item.id)}
													className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
													title="Hapus Learning Path"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination Controls */}
				<div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
					<div className="text-xs text-slate-500">
						Menampilkan halaman <span className="font-semibold">{currentPage}</span> dari{' '}
						<span className="font-semibold">{totalPages}</span> (Total {filteredPaths.length} items)
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
							className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
						>
							<ChevronLeft className="w-3.5 h-3.5" />
							Sebelumnya
						</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
							<button
								key={pg}
								onClick={() => setCurrentPage(pg)}
								className={`w-7 h-7 text-xs font-semibold rounded-lg transition ${
									currentPage === pg
										? 'bg-blue-600 text-white'
										: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
								}`}
							>
								{pg}
							</button>
						))}
						<button
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
							className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
						>
							Berikutnya
							<ChevronRight className="w-3.5 h-3.5" />
						</button>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			{deleteModalId && (
				<div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
						<div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
							<AlertCircle className="w-6 h-6" />
						</div>
						<div>
							<h3 className="text-lg font-bold text-slate-900">Konfirmasi Hapus</h3>
							<p className="text-sm text-slate-500 mt-1">
								Apakah Anda yakin ingin menghapus learning path ini? Semua data modul dan statistik terkait akan dinonaktifkan.
							</p>
						</div>
						<div className="flex items-center justify-end gap-3 pt-2">
							<button
								onClick={() => setDeleteModalId(null)}
								className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
							>
								Batal
							</button>
							<button
								onClick={() => handleDelete(deleteModalId)}
								className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
							>
								Ya, Hapus
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default LearningPathsPage;
