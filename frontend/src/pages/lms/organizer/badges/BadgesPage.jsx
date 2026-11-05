import React, { useState } from 'react';
import {
	Award,
	ShieldCheck,
	Plus,
	Sliders,
	Save,
	CheckCircle2,
	Sparkles,
	Coins,
	FileBadge,
	Lock,
	Check,
} from 'lucide-react';

const INITIAL_BADGES = [
	{
		id: 'bdg-1',
		title: 'REST API Architect',
		category: 'Backend Development',
		minScore: 80,
		srlRequired: true,
		issuedCount: 342,
		icon: '🏆',
		network: 'Polygon Mainnet (ERC-1155)',
	},
	{
		id: 'bdg-2',
		title: 'SRL Self-Regulated Master',
		category: 'Metacognitive Skills',
		minScore: 75,
		srlRequired: true,
		issuedCount: 512,
		icon: '🎯',
		network: 'Internal Signed Credential',
	},
	{
		id: 'bdg-3',
		title: 'Machine Learning Practitioner',
		category: 'Artificial Intelligence',
		minScore: 85,
		srlRequired: false,
		issuedCount: 189,
		icon: '⚡',
		network: 'Polygon Mainnet (ERC-1155)',
	},
];

const BadgesPage = () => {
	const [badges, setBadges] = useState(INITIAL_BADGES);

	// Form State for Creator
	const [badgeTitle, setBadgeTitle] = useState('');
	const [badgeDesc, setBadgeDesc] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('Software Engineering');
	const [badgeIcon, setBadgeIcon] = useState('🎖️');
	const [networkType, setNetworkType] = useState('polygon');

	// Passing Score Criteria Manager States
	const [minScore, setMinScore] = useState(75);
	const [requireForethought, setRequireForethought] = useState(true);
	const [requireReflection, setRequireReflection] = useState(true);
	const [autoMintBlockchain, setAutoMintBlockchain] = useState(true);

	const handleCreateBadge = (e) => {
		e.preventDefault();
		if (!badgeTitle) return;

		const newBadge = {
			id: `bdg-${Date.now()}`,
			title: badgeTitle,
			category: selectedCategory,
			minScore: minScore,
			srlRequired: requireForethought && requireReflection,
			issuedCount: 0,
			icon: badgeIcon,
			network: networkType === 'polygon' ? 'Polygon Mainnet (ERC-1155)' : 'Internal Signed Credential',
		};

		setBadges([newBadge, ...badges]);
		setBadgeTitle('');
		setBadgeDesc('');
	};

	return (
		<div className="min-h-screen bg-slate-50/70 p-6 md:p-8 space-y-8">
			{/* Top Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
							Organizer LMS
						</span>
						<span className="text-xs text-slate-500">• Credentialing & Criteria Manager</span>
					</div>
					<h1 className="text-2xl font-bold text-slate-900 tracking-tight">
						Badges & Certificates Creator
					</h1>
					<p className="text-sm text-slate-500 mt-1">
						Konfigurasi kriteria kelulusan (passing score), bobot SRL, dan penerbitan smart contract credential.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-700 flex items-center gap-1.5">
						<Coins className="w-4 h-4 text-purple-600" />
						Smart Contract: 0x71C849...9Fa6
					</span>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Column 1 & 2: Form Creator & Criteria Manager */}
				<div className="lg:col-span-2 space-y-6">
					{/* Creator Form */}
					<form onSubmit={handleCreateBadge} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
						<div className="flex items-center gap-2 pb-3 border-b border-slate-100">
							<FileBadge className="w-5 h-5 text-blue-600" />
							<h2 className="text-base font-bold text-slate-900">Buat Badge / Sertifikat Baru</h2>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="text-xs font-semibold text-slate-700 block mb-1.5">
									Nama Badge / Sertifikat
								</label>
								<input
									type="text"
									placeholder="Contoh: REST API Architecture Specialist"
									value={badgeTitle}
									onChange={(e) => setBadgeTitle(e.target.value)}
									className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
									required
								/>
							</div>

							<div>
								<label className="text-xs font-semibold text-slate-700 block mb-1.5">
									Kategori Kompetensi
								</label>
								<select
									value={selectedCategory}
									onChange={(e) => setSelectedCategory(e.target.value)}
									className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
								>
									<option value="Software Engineering">Software Engineering</option>
									<option value="Artificial Intelligence">Artificial Intelligence</option>
									<option value="Data Science">Data Science</option>
									<option value="Metacognitive Skills">Metacognitive / SRL Skills</option>
								</select>
							</div>
						</div>

						<div>
							<label className="text-xs font-semibold text-slate-700 block mb-1.5">
								Deskripsi Capaian Pembelajaran
							</label>
							<textarea
								rows="3"
								placeholder="Diberikan kepada peserta yang berhasil menyelesaikan seluruh modul..."
								value={badgeDesc}
								onChange={(e) => setBadgeDesc(e.target.value)}
								className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
							/>
						</div>

						{/* Icon & Network selection */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
							<div>
								<label className="text-xs font-semibold text-slate-700 block mb-1.5">
									Pilih Lambang Badge
								</label>
								<div className="flex items-center gap-2">
									{['🏆', '🎯', '⚡', '🎖️', '🧠', '🛡️'].map((ico) => (
										<button
											key={ico}
											type="button"
											onClick={() => setBadgeIcon(ico)}
											className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center border transition ${
												badgeIcon === ico
													? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20'
													: 'border-slate-200 hover:bg-slate-50'
											}`}
										>
											{ico}
										</button>
									))}
								</div>
							</div>

							<div>
								<label className="text-xs font-semibold text-slate-700 block mb-1.5">
									Tipe Penerbitan Kredensial
								</label>
								<select
									value={networkType}
									onChange={(e) => setNetworkType(e.target.value)}
									className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
								>
									<option value="polygon">Blockchain Token (Polygon ERC-1155)</option>
									<option value="internal">KampusX Verified Digital Signature</option>
								</select>
							</div>
						</div>

						<div className="pt-2 flex justify-end">
							<button
								type="submit"
								className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition flex items-center gap-2"
							>
								<Plus className="w-4 h-4" />
								Terbitkan Template Badge
							</button>
						</div>
					</form>

					{/* Passing Score Criteria Manager */}
					<div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
						<div className="flex items-center gap-2 pb-3 border-b border-slate-100">
							<Sliders className="w-5 h-5 text-indigo-600" />
							<div>
								<h2 className="text-base font-bold text-slate-900">Passing Score & SRL Criteria Manager</h2>
								<p className="text-xs text-slate-500">
									Syarat ambang batas yang harus dipenuhi peserta agar badge dapat diklaim.
								</p>
							</div>
						</div>

						{/* Score Slider */}
						<div className="space-y-2">
							<div className="flex justify-between text-xs font-semibold text-slate-700">
								<span>Ambang Batas Nilai Kuis (Passing Score)</span>
								<span className="text-blue-600 font-bold text-sm">{minScore} / 100</span>
							</div>
							<input
								type="range"
								min="60"
								max="95"
								step="5"
								value={minScore}
								onChange={(e) => setMinScore(Number(e.target.value))}
								className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
							/>
							<div className="flex justify-between text-[11px] text-slate-400">
								<span>60 (Kriteria Cukup)</span>
								<span>75 (Standar Nasional)</span>
								<span>95 (Distinction)</span>
							</div>
						</div>

						{/* Checklist Requirements */}
						<div className="space-y-3 pt-2">
							<label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
								<input
									type="checkbox"
									checked={requireForethought}
									onChange={(e) => setRequireForethought(e.target.checked)}
									className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
								/>
								<div>
									<div className="text-xs font-bold text-slate-900">Wajib Selesaikan SRL Forethought</div>
									<div className="text-[11px] text-slate-500">
										Peserta harus mengisi penetapan target belajar sebelum membuka materi.
									</div>
								</div>
							</label>

							<label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
								<input
									type="checkbox"
									checked={requireReflection}
									onChange={(e) => setRequireReflection(e.target.checked)}
									className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
								/>
								<div>
									<div className="text-xs font-bold text-slate-900">Wajib Selesaikan Refleksi Metakognitif</div>
									<div className="text-[11px] text-slate-500">
										Mengevaluasi hasil kuis dan tingkat kesiapan belajar mandiri.
									</div>
								</div>
							</label>

							<label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
								<input
									type="checkbox"
									checked={autoMintBlockchain}
									onChange={(e) => setAutoMintBlockchain(e.target.checked)}
									className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
								/>
								<div>
									<div className="text-xs font-bold text-slate-900">
										Auto-Mint ke Smart Contract Saat Lulus
									</div>
									<div className="text-[11px] text-slate-500">
										Sistem otomatis mencetak hash kredensial ke Polygon Blockchain.
									</div>
								</div>
							</label>
						</div>
					</div>
				</div>

				{/* Column 3: Badges List */}
				<div className="space-y-4">
					<h3 className="text-base font-bold text-slate-900">Badge Aktif ({badges.length})</h3>
					<div className="space-y-3">
						{badges.map((b) => (
							<div
								key={b.id}
								className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4 hover:shadow-md transition"
							>
								<div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0">
									{b.icon}
								</div>
								<div className="flex-1">
									<div className="font-bold text-slate-900 text-sm">{b.title}</div>
									<div className="text-xs text-slate-400 mt-0.5">{b.category}</div>
									<div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
										<span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold">
											Min {b.minScore}%
										</span>
										<span className="text-slate-500">{b.issuedCount} Penerima</span>
									</div>
									<div className="mt-2 text-[10px] text-purple-600 font-medium">
										{b.network}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default BadgesPage;
