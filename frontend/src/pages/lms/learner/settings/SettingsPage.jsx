import React, { useState } from 'react';
import {
	User,
	Mail,
	Bell,
	Shield,
	Sparkles,
	Save,
	Check,
	Clock,
	Tag,
	Sliders,
	Camera,
	CheckCircle2,
} from 'lucide-react';

const TOPIC_INTERESTS = [
	'Software Engineering',
	'REST API Architecture',
	'Artificial Intelligence',
	'Machine Learning',
	'Data Science',
	'Web3 & Smart Contracts',
	'UI/UX Design',
	'Metacognitive Self-Regulated Learning',
	'Cloud Native DevOps',
	'Cyber Security',
];

const SettingsPage = () => {
	// Profile States
	const [fullName, setFullName] = useState('Faiz Pratama');
	const [headline, setHeadline] = useState('Computer Science Student & Aspiring Fullstack Developer');
	const [email, setEmail] = useState('faiz.pratama@kampusx.id');
	const [selectedInterests, setSelectedInterests] = useState([
		'Software Engineering',
		'REST API Architecture',
		'Metacognitive Self-Regulated Learning',
	]);

	// Notification & Learning Preferences
	const [dailyReminder, setDailyReminder] = useState(true);
	const [reminderTime, setReminderTime] = useState('19:30');
	const [weeklyDigest, setWeeklyDigest] = useState(true);
	const [srlNudges, setSrlNudges] = useState(true);

	const [isSaved, setIsSaved] = useState(false);

	const toggleInterest = (topic) => {
		setSelectedInterests((prev) =>
			prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
		);
	};

	const handleSave = (e) => {
		e.preventDefault();
		setIsSaved(true);
		setTimeout(() => setIsSaved(false), 2500);
	};

	return (
		<div className="min-h-screen bg-slate-50/70 p-6 md:p-8 space-y-8">
			{/* Top Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
							Learner Preferences
						</span>
						<span className="text-xs text-slate-500">• Profile & Personalization</span>
					</div>
					<h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan & Minat Belajar</h1>
					<p className="text-sm text-slate-500 mt-1">
						Sesuaikan profil learner, preferensi notifikasi ritme belajar mandiri (SRL), dan topik minat.
					</p>
				</div>
				{isSaved && (
					<div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
						<CheckCircle2 className="w-4 h-4 text-emerald-600" />
						Perubahan berhasil disimpan!
					</div>
				)}
			</div>

			<form onSubmit={handleSave} className="space-y-8">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Left Column: Profile & Interests (7 cols) */}
					<div className="lg:col-span-7 space-y-6">
						{/* Profile Card */}
						<div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
							<div className="flex items-center gap-2 pb-3 border-b border-slate-100">
								<User className="w-5 h-5 text-blue-600" />
								<h2 className="text-base font-bold text-slate-900">Profil Pembelajar</h2>
							</div>

							<div className="flex items-center gap-4">
								<div className="relative">
									<div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
										FP
									</div>
									<button
										type="button"
										className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 shadow-xs"
									>
										<Camera className="w-3.5 h-3.5" />
									</button>
								</div>
								<div>
									<h3 className="font-bold text-slate-900 text-sm">{fullName}</h3>
									<p className="text-xs text-slate-500 mt-0.5">{email}</p>
									<span className="inline-block mt-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
										Member Terverifikasi
									</span>
								</div>
							</div>

							<div className="space-y-4 pt-2">
								<div>
									<label className="text-xs font-semibold text-slate-700 block mb-1.5">
										Nama Lengkap
									</label>
									<input
										type="text"
										value={fullName}
										onChange={(e) => setFullName(e.target.value)}
										className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
										required
									/>
								</div>

								<div>
									<label className="text-xs font-semibold text-slate-700 block mb-1.5">
										Headline / Peran Target
									</label>
									<input
										type="text"
										value={headline}
										onChange={(e) => setHeadline(e.target.value)}
										className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
									/>
								</div>

								<div>
									<label className="text-xs font-semibold text-slate-700 block mb-1.5">
										Email Terdaftar
									</label>
									<input
										type="email"
										value={email}
										disabled
										className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
									/>
								</div>
							</div>
						</div>

						{/* Interest Selection Card */}
						<div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
							<div className="flex items-center gap-2 pb-3 border-b border-slate-100">
								<Tag className="w-5 h-5 text-purple-600" />
								<div>
									<h2 className="text-base font-bold text-slate-900">Peminatan Topik Belajar</h2>
									<p className="text-xs text-slate-500">
										Mempengaruhi kurasi modul rekomendasi berbasis AI Content-Based Filtering.
									</p>
								</div>
							</div>

							<div className="flex flex-wrap gap-2 pt-2">
								{TOPIC_INTERESTS.map((topic) => {
									const isSelected = selectedInterests.includes(topic);
									return (
										<button
											key={topic}
											type="button"
											onClick={() => toggleInterest(topic)}
											className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
												isSelected
													? 'bg-purple-600 text-white shadow-xs'
													: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
											}`}
										>
											{isSelected && <Check className="w-3.5 h-3.5" />}
											{topic}
										</button>
									);
								})}
							</div>
						</div>
					</div>

					{/* Right Column: Account Settings & SRL Reminders (5 cols) */}
					<div className="lg:col-span-5 space-y-6">
						<div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
							<div className="flex items-center gap-2 pb-3 border-b border-slate-100">
								<Bell className="w-5 h-5 text-amber-600" />
								<h2 className="text-base font-bold text-slate-900">Ritme & Notifikasi SRL</h2>
							</div>

							<div className="space-y-4">
								<label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
									<input
										type="checkbox"
										checked={dailyReminder}
										onChange={(e) => setDailyReminder(e.target.checked)}
										className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500"
									/>
									<div>
										<div className="text-xs font-bold text-slate-900">Pengingat Belajar Harian</div>
										<div className="text-[11px] text-slate-500">
											Kirim reminder untuk menjaga learning streak kamu.
										</div>
									</div>
								</label>

								{dailyReminder && (
									<div className="pl-7">
										<label className="text-xs font-semibold text-slate-700 block mb-1">
											Waktu Pengingat:
										</label>
										<input
											type="time"
											value={reminderTime}
											onChange={(e) => setReminderTime(e.target.value)}
											className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
										/>
									</div>
								)}

								<label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
									<input
										type="checkbox"
										checked={srlNudges}
										onChange={(e) => setSrlNudges(e.target.checked)}
										className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500"
									/>
									<div>
										<div className="text-xs font-bold text-slate-900">
											SRL Metacognitive Prompts
										</div>
										<div className="text-[11px] text-slate-500">
											Tampilkan interseptor goal setting & refleksi otomatis.
										</div>
									</div>
								</label>

								<label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
									<input
										type="checkbox"
										checked={weeklyDigest}
										onChange={(e) => setWeeklyDigest(e.target.checked)}
										className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500"
									/>
									<div>
										<div className="text-xs font-bold text-slate-900">Laporan Mingguan via Email</div>
										<div className="text-[11px] text-slate-500">
											Ringkasan readiness score dan skill-matrix terbaru.
										</div>
									</div>
								</label>
							</div>

							<div className="pt-3 border-t border-slate-100">
								<button
									type="submit"
									className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
								>
									<Save className="w-4 h-4" />
									Simpan Pengaturan
								</button>
							</div>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
};

export default SettingsPage;
