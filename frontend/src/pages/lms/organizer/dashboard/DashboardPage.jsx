import React from 'react';
import { Link } from 'react-router-dom';
import {
	BarChart3,
	TrendingUp,
	Users,
	Sparkles,
	BookOpen,
	Award,
	Clock,
	CheckCircle2,
	AlertTriangle,
	ArrowRight,
	ExternalLink,
	BrainCircuit,
	Flame,
} from 'lucide-react';

const DashboardPage = () => {
	const overviewStats = [
		{
			title: 'Total Pembelajar Aktif',
			value: '3,428',
			trend: '+18.2% bulan ini',
			isPositive: true,
			icon: Users,
			color: 'text-blue-600 bg-blue-50 border-blue-200',
		},
		{
			title: 'Rata-rata Tingkat Penyelesaian',
			value: '74.6%',
			trend: '+4.1% vs kuartal lalu',
			isPositive: true,
			icon: TrendingUp,
			color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
		},
		{
			title: 'Aktivitas AI Studio',
			value: '142 Draf',
			trend: '38 dipublikasikan',
			isPositive: true,
			icon: Sparkles,
			color: 'text-purple-600 bg-purple-50 border-purple-200',
		},
		{
			title: 'Kredensial Terverifikasi',
			value: '1,890',
			trend: 'Polygon POS Mainnet',
			isPositive: true,
			icon: Award,
			color: 'text-amber-600 bg-amber-50 border-amber-200',
		},
	];

	const dropOffPoints = [
		{
			path: 'Web Application Architecture',
			lesson: 'Modul 2 - Lesson 3: Database Indexing & B-Trees',
			dropRate: '32% Drop-off',
			cause: 'Kuis evaluasi tingkat kesulitan tinggi',
			level: 'High Attention',
		},
		{
			path: 'Data Science & Machine Learning',
			lesson: 'Modul 1 - Lesson 4: Linear Algebra Matrix Ops',
			dropRate: '24% Drop-off',
			cause: 'Durasi video materi lebih dari 15 menit',
			level: 'Medium Attention',
		},
		{
			path: 'Smart Contract & Blockchain',
			lesson: 'Modul 3 - Lesson 2: Reentrancy Attack Prevention',
			dropRate: '19% Drop-off',
			cause: 'Kurangnya contoh kode interaktif',
			level: 'Low Attention',
		},
	];

	const aiActivities = [
		{
			id: 1,
			title: 'Silabus_CyberSecurity_2026.pdf',
			status: 'Ready for Review',
			date: '10 menit yang lalu',
			targetPath: 'Cyber Security Essentials',
			tokens: '3,450 tokens',
		},
		{
			id: 2,
			title: 'Prompt: Generative AI for Product Managers',
			status: 'Published to Path',
			date: '2 jam yang lalu',
			targetPath: 'Product Strategy & Innovation',
			tokens: '5,120 tokens',
		},
		{
			id: 3,
			title: 'Materi_DevOps_Container.docx',
			status: 'Draft Saved',
			date: 'Kemarin',
			targetPath: 'Cloud Native DevOps',
			tokens: '4,200 tokens',
		},
	];

	return (
		<div className="min-h-screen bg-slate-50/70 p-6 md:p-8 space-y-8">
			{/* Top Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
							Organizer LMS
						</span>
						<span className="text-xs text-slate-500">• Analytics & Cohort Insights</span>
					</div>
					<h1 className="text-2xl font-bold text-slate-900 tracking-tight">
						Executive Learning Dashboard
					</h1>
					<p className="text-sm text-slate-500 mt-1">
						Monitoring retensi kohort, titik hambatan materi (drop-off points), dan integrasi AI Studio.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Link
						to="/organizer/logs"
						className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
					>
						<Clock className="w-4 h-4 text-slate-500" />
						Lihat Log SRL & On-Chain
					</Link>
					<Link
						to="/organizer/ai-studio/upload"
						className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition shadow-sm"
					>
						<Sparkles className="w-4 h-4" />
						Generate Modul AI
					</Link>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{overviewStats.map((item, idx) => {
					const Icon = item.icon;
					return (
						<div
							key={idx}
							className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition duration-200"
						>
							<div className="flex items-center justify-between mb-3">
								<span className="text-xs font-medium text-slate-500">{item.title}</span>
								<div className={`p-2.5 rounded-xl border ${item.color}`}>
									<Icon className="w-5 h-5" />
								</div>
							</div>
							<div className="text-2xl font-bold text-slate-900">{item.value}</div>
							<div className="text-xs text-slate-500 mt-1 font-medium">{item.trend}</div>
						</div>
					);
				})}
			</div>

			{/* Middle Row: Cohort Retention & Drop-off Points */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Cohort Retention Performance */}
				<div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-base font-bold text-slate-900">
								Retensi Belajar Kohort (SRL Phase Funnel)
							</h2>
							<p className="text-xs text-slate-500 mt-0.5">
								Konversi pembelajar dari Fase 1 (Forethought) hingga Fase 3 (Refleksi & Kuis)
							</p>
						</div>
						<span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
							Kohort Aktif: 2026-Q1
						</span>
					</div>

					{/* Funnel Progress Bars */}
					<div className="space-y-4">
						<div>
							<div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
								<span className="flex items-center gap-1.5">
									<span className="w-2 h-2 rounded-full bg-blue-500" />
									Fase 1: Forethought & Goal Setting
								</span>
								<span>3,428 Pembelajar (100%)</span>
							</div>
							<div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
								<div className="bg-blue-600 h-3 rounded-full" style={{ width: '100%' }} />
							</div>
						</div>

						<div>
							<div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
								<span className="flex items-center gap-1.5">
									<span className="w-2 h-2 rounded-full bg-indigo-500" />
									Fase 2: Performance & Lesson Engagement
								</span>
								<span>2,870 Pembelajar (83.7%)</span>
							</div>
							<div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
								<div className="bg-indigo-600 h-3 rounded-full" style={{ width: '83.7%' }} />
							</div>
						</div>

						<div>
							<div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
								<span className="flex items-center gap-1.5">
									<span className="w-2 h-2 rounded-full bg-purple-500" />
									Fase 3: Self-Reflection & Evaluasi Kuis
								</span>
								<span>2,558 Pembelajar (74.6%)</span>
							</div>
							<div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
								<div className="bg-purple-600 h-3 rounded-full" style={{ width: '74.6%' }} />
							</div>
						</div>

						<div>
							<div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
								<span className="flex items-center gap-1.5">
									<span className="w-2 h-2 rounded-full bg-emerald-500" />
									Penerbitan Sertifikat & Mikro-Kredensial
								</span>
								<span>1,890 Pembelajar (55.1%)</span>
							</div>
							<div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
								<div className="bg-emerald-600 h-3 rounded-full" style={{ width: '55.1%' }} />
							</div>
						</div>
					</div>

					<div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-xs text-blue-800">
						<BrainCircuit className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
						<div>
							<span className="font-semibold">Insight Pedagogi SRL:</span> Peserta yang menyelesaikan
							tahap penentuan strategi belajar (Forethought) memiliki kemungkinan 2.4x lebih tinggi untuk
							menyelesaikan kuis refleksi pada percobaan pertama.
						</div>
					</div>
				</div>

				{/* Top Drop-Off Points Alert */}
				<div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
					<div>
						<div className="flex items-center gap-2 mb-1 text-rose-600">
							<AlertTriangle className="w-4 h-4" />
							<span className="text-xs font-bold uppercase tracking-wider">Hambatan Materi</span>
						</div>
						<h2 className="text-base font-bold text-slate-900">Top Drop-off Points</h2>
						<p className="text-xs text-slate-500 mt-0.5">
							Lesson dengan tingkat kesulitan atau tingkat kelelahan tertinggi.
						</p>

						<div className="space-y-3 mt-4">
							{dropOffPoints.map((dp, i) => (
								<div
									key={i}
									className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition"
								>
									<div className="flex items-center justify-between text-xs">
										<span className="font-semibold text-rose-600">{dp.dropRate}</span>
										<span
											className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
												dp.level === 'High Attention'
													? 'bg-rose-100 text-rose-700'
													: 'bg-amber-100 text-amber-700'
											}`}
										>
											{dp.level}
										</span>
									</div>
									<div className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
										{dp.lesson}
									</div>
									<div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
										Alasan: {dp.cause}
									</div>
								</div>
							))}
						</div>
					</div>

					<Link
						to="/organizer/learning-paths"
						className="w-full py-2.5 rounded-xl border border-slate-200 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition block"
					>
						Kelola & Sesuaikan Kurikulum
					</Link>
				</div>
			</div>

			{/* Bottom Row: AI Studio Activity */}
			<div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-base font-bold text-slate-900">Aktivitas Terakhir AI Studio</h2>
						<p className="text-xs text-slate-500 mt-0.5">
							Dokumen yang diunggah dan di-generate menjadi draf modul kuis otomatis.
						</p>
					</div>
					<Link
						to="/organizer/ai-studio/review"
						className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
					>
						Buka Panel Review AI
						<ArrowRight className="w-3.5 h-3.5" />
					</Link>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{aiActivities.map((act) => (
						<div
							key={act.id}
							className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 hover:bg-purple-50/50 transition flex flex-col justify-between"
						>
							<div>
								<div className="flex items-center justify-between text-xs mb-2">
									<span className="font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
										{act.status}
									</span>
									<span className="text-slate-400 text-[11px]">{act.date}</span>
								</div>
								<div className="font-semibold text-slate-900 text-sm line-clamp-1">{act.title}</div>
								<div className="text-xs text-slate-500 mt-1">Target: {act.targetPath}</div>
							</div>
							<div className="text-[11px] text-purple-600 font-medium mt-3 flex items-center justify-between">
								<span>{act.tokens}</span>
								<Link
									to="/organizer/ai-studio/review"
									className="hover:underline flex items-center gap-1"
								>
									Review Sekarang
									<ExternalLink className="w-3 h-3" />
								</Link>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default DashboardPage;
