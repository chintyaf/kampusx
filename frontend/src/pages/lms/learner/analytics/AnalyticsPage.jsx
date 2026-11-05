import React, { useState } from 'react';
import {
	BarChart3,
	TrendingUp,
	Award,
	BrainCircuit,
	Briefcase,
	Target,
	AlertCircle,
	ArrowUpRight,
	Calendar,
	Clock,
	Zap,
	ShieldCheck,
	CheckCircle2,
} from 'lucide-react';
import {
	AreaChart,
	Area,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';

const READINESS_TREND_DATA = [
	{ week: 'W1', score: 58, target: 75 },
	{ week: 'W2', score: 64, target: 75 },
	{ week: 'W3', score: 71, target: 75 },
	{ week: 'W4', score: 68, target: 75 },
	{ week: 'W5', score: 82, target: 75 },
	{ week: 'W6', score: 89, target: 75 },
];

const SKILL_GAP_DATA = [
	{ skill: 'REST API Design', current: 88, target: 90 },
	{ skill: 'Database Indexing', current: 62, target: 80 },
	{ skill: 'JWT Auth & Security', current: 79, target: 85 },
	{ skill: 'Docker Container', current: 55, target: 75 },
	{ skill: 'SRL Metacognition', current: 92, target: 80 },
];

const AnalyticsPage = () => {
	const [selectedRole, setSelectedRole] = useState('Fullstack Cloud Engineer');

	const stats = [
		{
			title: 'Total Jam Belajar',
			value: '38.5 Jam',
			sub: '+4.2 jam minggu ini',
			icon: Clock,
			color: 'text-blue-600 bg-blue-50 border-blue-200',
		},
		{
			title: 'Readiness Score Saat Ini',
			value: '89 / 100',
			sub: 'Level: SIAP (Mandiri)',
			icon: Zap,
			color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
		},
		{
			title: 'Job Market Match',
			value: '84%',
			sub: 'Kompatibel dengan 14 lowongan',
			icon: Briefcase,
			color: 'text-purple-600 bg-purple-50 border-purple-200',
		},
		{
			title: 'Sertifikat & Badges',
			value: '6 Diraih',
			sub: 'Semua on-chain verified',
			icon: Award,
			color: 'text-amber-600 bg-amber-50 border-amber-200',
		},
	];

	return (
		<div className="min-h-screen bg-slate-50/70 p-6 md:p-8 space-y-8">
			{/* Top Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
							Learner Intelligence
						</span>
						<span className="text-xs text-slate-500">• Metacognitive SRL & Career Radar</span>
					</div>
					<h1 className="text-2xl font-bold text-slate-900 tracking-tight">
						Learning Analytics & Skill-Matrix
					</h1>
					<p className="text-sm text-slate-500 mt-1">
						Evaluasi tren kesiapan belajar mandiri (readiness score), pemetaan vektor skill, dan analisis kesenjangan karir.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
						<span className="w-2 h-2 rounded-full bg-emerald-500" />
						Status Kesiapan: SIAP (High Readiness)
					</div>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{stats.map((s, idx) => {
					const Icon = s.icon;
					return (
						<div
							key={idx}
							className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition"
						>
							<div className="flex items-center justify-between mb-3">
								<span className="text-xs font-medium text-slate-500">{s.title}</span>
								<div className={`p-2.5 rounded-xl border ${s.color}`}>
									<Icon className="w-5 h-5" />
								</div>
							</div>
							<div className="text-2xl font-bold text-slate-900">{s.value}</div>
							<div className="text-xs text-slate-500 mt-1 font-medium">{s.sub}</div>
						</div>
					);
				})}
			</div>

			{/* Middle Row: Readiness Trend Graph & Vector Skill Matrix */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Readiness Trend (7 cols) */}
				<div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-base font-bold text-slate-900">
								Tren Kesiapan Belajar Mandiri (SRL Readiness Score)
							</h2>
							<p className="text-xs text-slate-500">
								Grafik perkembangan skor refleksi dan konsistensi penyelesaian materi per minggu.
							</p>
						</div>
						<span className="text-xs font-semibold text-slate-400">Target Kelulusan: 75%</span>
					</div>

					<div className="h-64 w-full pt-4">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={READINESS_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
								<defs>
									<linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
										<stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
								<XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
								<YAxis stroke="#94a3b8" fontSize={12} domain={[40, 100]} />
								<Tooltip
									contentStyle={{
										backgroundColor: '#0f172a',
										borderRadius: '12px',
										border: 'none',
										color: '#fff',
										fontSize: '12px',
									}}
								/>
								<Area
									type="monotone"
									dataKey="score"
									stroke="#2563eb"
									strokeWidth={3}
									fillOpacity={1}
									fill="url(#scoreGrad)"
									name="Skor Kamu"
								/>
								<Area
									type="monotone"
									dataKey="target"
									stroke="#94a3b8"
									strokeDasharray="4 4"
									strokeWidth={1.5}
									fill="transparent"
									name="Target Threshold"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>

					<div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<TrendingUp className="w-4 h-4 text-blue-600" />
							<span>Kamu melampaui target ambang batas selama 2 minggu berturut-turut!</span>
						</div>
					</div>
				</div>

				{/* Job Matching & Vector Skill Panel (5 cols) */}
				<div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
					<div>
						<div className="flex items-center justify-between pb-3 border-b border-slate-100">
							<div className="flex items-center gap-2">
								<Briefcase className="w-4 h-4 text-purple-600" />
								<h2 className="text-base font-bold text-slate-900">Job Matching Vector</h2>
							</div>
							<span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
								AI Match: 84%
							</span>
						</div>

						<div className="mt-3 space-y-3">
							<div>
								<label className="text-xs text-slate-500 block mb-1">Target Posisi Pekerjaan:</label>
								<select
									value={selectedRole}
									onChange={(e) => setSelectedRole(e.target.value)}
									className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
								>
									<option value="Fullstack Cloud Engineer">Fullstack Cloud Engineer</option>
									<option value="Backend REST API Developer">Backend REST API Developer</option>
									<option value="Machine Learning Associate">Machine Learning Associate</option>
								</select>
							</div>

							<div className="space-y-2 pt-2">
								<div className="text-xs font-semibold text-slate-700">Skill Vektor yang Dikuasai:</div>
								<div className="flex flex-wrap gap-1.5">
									{['Node.js', 'REST Architecture', 'PostgreSQL', 'Metacognitive SRL', 'React 19'].map(
										(tag) => (
											<span
												key={tag}
												className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-1"
											>
												<CheckCircle2 className="w-3 h-3 text-emerald-500" />
												{tag}
											</span>
										),
									)}
								</div>
							</div>

							<div className="space-y-2 pt-2">
								<div className="text-xs font-semibold text-slate-700">Skill yang Masih Kurang (Gap):</div>
								<div className="flex flex-wrap gap-1.5">
									{['Docker Swarm / K8s', 'Database Indexing'].map((tag) => (
										<span
											key={tag}
											className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-1"
										>
											<AlertCircle className="w-3 h-3 text-rose-500" />
											{tag}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>

					<button className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 mt-4">
						Lihat Rekomendasi Modul Remedial
						<ArrowUpRight className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>

			{/* Bottom Section: Skill Gap Analysis Bar Chart */}
			<div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-base font-bold text-slate-900">Analisis Kesenjangan Keterampilan (Skill Gap)</h2>
						<p className="text-xs text-slate-500">
							Perbandingan antara tingkat keahlian saat ini vs target kompetensi industri.
						</p>
					</div>
					<div className="flex items-center gap-4 text-xs font-semibold">
						<span className="flex items-center gap-1.5 text-blue-600">
							<span className="w-3 h-3 bg-blue-600 rounded" /> Level Kamu
						</span>
						<span className="flex items-center gap-1.5 text-slate-400">
							<span className="w-3 h-3 bg-slate-300 rounded" /> Target Industri
						</span>
					</div>
				</div>

				<div className="h-64 w-full pt-4">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={SKILL_GAP_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
							<XAxis dataKey="skill" stroke="#94a3b8" fontSize={12} />
							<YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
							<Tooltip
								contentStyle={{
									backgroundColor: '#0f172a',
									borderRadius: '12px',
									border: 'none',
									color: '#fff',
									fontSize: '12px',
								}}
							/>
							<Bar dataKey="current" fill="#2563eb" radius={[6, 6, 0, 0]} name="Level Kamu" />
							<Bar dataKey="target" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Target Industri" />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
};

export default AnalyticsPage;
