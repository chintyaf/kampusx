import React, { useState } from 'react';
import {
	Award,
	ShieldCheck,
	CheckCircle,
	ExternalLink,
	Copy,
	Check,
	FileCode,
	Download,
	Share2,
	Lock,
	Sparkles,
	Coins,
	X,
} from 'lucide-react';

const ACHIEVED_BADGES = [
	{
		id: 'bdg-01',
		title: 'Forethought Pioneer',
		desc: 'Menetapkan target belajar metakognitif (SRL Fase 1) secara konsisten selama 7 hari berturut-turut.',
		icon: '🎯',
		category: 'SRL Metacognitive',
		earnedAt: '2026-02-14',
		rarity: 'Top 10% Kohort',
	},
	{
		id: 'bdg-02',
		title: 'REST Architecture Master',
		desc: 'Menuntaskan seluruh evaluasi arsitektur API dengan skor kuis di atas 85.',
		icon: '🏆',
		category: 'Software Engineering',
		earnedAt: '2026-02-20',
		rarity: 'Distinction',
	},
	{
		id: 'bdg-03',
		title: 'Reflective Thinker',
		desc: 'Mengisi jurnal refleksi metakognitif mandiri pada 5 modul berturut-turut.',
		icon: '🧠',
		category: 'Self-Reflection',
		earnedAt: '2026-02-25',
		rarity: 'Silver Tier',
	},
	{
		id: 'bdg-04',
		title: 'Sprint Micro-Learner',
		desc: 'Menyelesaikan modul bite-sized dalam waktu kurang dari target waktu estimasi dengan skor sempurna.',
		icon: '⚡',
		category: 'Productivity',
		earnedAt: '2026-02-28',
		rarity: 'Gold Tier',
	},
];

const CERTIFICATES = [
	{
		id: 'cert-101',
		title: 'Professional Microlearning in Web Application Architecture',
		issuedBy: 'KampusX Decentralized Learning Hub',
		date: '28 Februari 2026',
		credentialId: 'KX-REST-2026-08912',
		status: 'Verified on Blockchain',
		contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
		tokenId: '103',
		txHash: '0x43b72c9182a419401988b6a12b7a0d4c9f138e64ce91a82f34',
		payload: {
			standard: 'ERC-1155',
			network: 'Polygon PoS',
			recipientName: 'Learner KampusX',
			courseId: 'lp-01',
			score: 88,
			srlReadiness: 'SIAP',
			completedAt: 1772437920,
			issuerSignature: '0x8f2a1b9c3...481e',
		},
	},
	{
		id: 'cert-102',
		title: 'Foundations of Self-Regulated Learning (SRL)',
		issuedBy: 'KampusX Cognitive Pedagogy Lab',
		date: '15 Februari 2026',
		credentialId: 'KX-SRL-2026-00431',
		status: 'Verified on Blockchain',
		contractAddress: '0x71C849Aa68364d9E4105B853e5e4E9Fa65749A32',
		tokenId: '98',
		txHash: '0x12a9e8841b09812480918b2189a4b7120a48c19539bf429b10',
		payload: {
			standard: 'ERC-1155',
			network: 'Polygon PoS',
			recipientName: 'Learner KampusX',
			courseId: 'lp-05',
			score: 95,
			srlReadiness: 'SIAP',
			completedAt: 1771142400,
			issuerSignature: '0x99a12c4b8...e990',
		},
	},
];

const BadgeCertificatePage = () => {
	const [selectedCert, setSelectedCert] = useState(null);
	const [copied, setCopied] = useState(false);

	const handleCopy = (text) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="min-h-screen bg-slate-50/70 p-6 md:p-8 space-y-8">
			{/* Top Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
							Learner Portfolio
						</span>
						<span className="text-xs text-slate-500">• Cryptographic Credentials</span>
					</div>
					<h1 className="text-2xl font-bold text-slate-900 tracking-tight">
						Badges & Sertifikat Terverifikasi
					</h1>
					<p className="text-sm text-slate-500 mt-1">
						Koleksi pencapaian mikro-kredensial dan sertifikat digital yang terdaftar permanen di Smart Contract.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold flex items-center gap-2">
						<Coins className="w-4 h-4 text-purple-600" />
						Blockchain Credential: Auto-Issued
					</div>
				</div>
			</div>

			{/* SECTION 1: BADGES GRID */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-bold text-slate-900">Digital Badges ({ACHIEVED_BADGES.length})</h2>
						<p className="text-xs text-slate-500">
							Lencana pencapaian kompetensi dan kebiasaan metakognitif SRL.
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{ACHIEVED_BADGES.map((b) => (
						<div
							key={b.id}
							className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3"
						>
							<div>
								<div className="flex items-center justify-between mb-3">
									<div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
										{b.icon}
									</div>
									<span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
										{b.rarity}
									</span>
								</div>
								<h3 className="font-bold text-slate-900 text-sm">{b.title}</h3>
								<p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">{b.desc}</p>
							</div>

							<div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
								<span>{b.category}</span>
								<span>{b.earnedAt}</span>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* SECTION 2: CERTIFICATES LIST */}
			<div className="space-y-4">
				<div>
					<h2 className="text-lg font-bold text-slate-900">
						Sertifikat Kelulusan ({CERTIFICATES.length})
					</h2>
					<p className="text-xs text-slate-500">
						Ijazah mikro-kredensial yang dijamin keasliannya via cryptographic proof.
					</p>
				</div>

				<div className="space-y-4">
					{CERTIFICATES.map((cert) => (
						<div
							key={cert.id}
							className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition"
						>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
										<CheckCircle className="w-3.5 h-3.5" />
										{cert.status}
									</span>
									<span className="text-xs font-mono text-slate-400">ID: {cert.credentialId}</span>
								</div>
								<h3 className="text-base font-bold text-slate-900">{cert.title}</h3>
								<div className="text-xs text-slate-500">
									Diterbitkan oleh <span className="font-semibold text-slate-700">{cert.issuedBy}</span> • {cert.date}
								</div>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<button
									onClick={() => setSelectedCert(cert)}
									className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition flex items-center gap-1.5"
								>
									<FileCode className="w-3.5 h-3.5" />
									Lihat Payload Smart Contract
								</button>
								<button className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1.5 shadow-xs">
									<Download className="w-3.5 h-3.5" />
									Unduh PDF
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* MODAL: BLOCKCHAIN CREDENTIAL PAYLOAD JSON VIEWER */}
			{selectedCert && (
				<div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-slate-900 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl border border-slate-700 space-y-4">
						<div className="flex items-center justify-between pb-3 border-b border-slate-800">
							<div className="flex items-center gap-2">
								<ShieldCheck className="w-5 h-5 text-emerald-400" />
								<div>
									<h3 className="font-bold text-sm">On-Chain Credential Payload</h3>
									<p className="text-[11px] text-slate-400">Token ID #{selectedCert.tokenId}</p>
								</div>
							</div>
							<button
								onClick={() => setSelectedCert(null)}
								className="text-slate-400 hover:text-white p-1 rounded-lg"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Telemetry info */}
						<div className="space-y-1.5 text-xs text-slate-300">
							<div className="flex justify-between">
								<span className="text-slate-400">Contract Address:</span>
								<span className="font-mono text-emerald-400">{selectedCert.contractAddress}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-400">Tx Hash:</span>
								<span className="font-mono text-blue-400 truncate max-w-xs">{selectedCert.txHash}</span>
							</div>
						</div>

						{/* JSON Code Viewer */}
						<div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto max-h-64">
							<button
								onClick={() => handleCopy(JSON.stringify(selectedCert.payload, null, 2))}
								className="absolute right-3 top-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 transition"
							>
								{copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
								{copied ? 'Tersalin' : 'Salin JSON'}
							</button>
							<pre className="text-emerald-400">
								{JSON.stringify(selectedCert.payload, null, 2)}
							</pre>
						</div>

						<div className="flex items-center justify-between pt-2 text-xs">
							<span className="text-slate-400">Proof: ECDSA secp256k1 Signature Verified</span>
							<button
								onClick={() => setSelectedCert(null)}
								className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-semibold transition"
							>
								Tutup
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BadgeCertificatePage;
