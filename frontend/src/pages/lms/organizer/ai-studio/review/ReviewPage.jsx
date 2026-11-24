import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
	Sparkles,
	CheckCircle2,
	Edit3,
	Trash2,
	ChevronRight,
	Plus,
	BookOpen,
	HelpCircle,
	ArrowRight,
	Save,
	Layers,
	Eye,
	Sliders,
} from 'lucide-react';

const INITIAL_GENERATED_MODULES = [
	{
		id: 'mod-ai-1',
		title: 'Modul 1: Prinsip Dasar RESTful API & HTTP Methods',
		duration: '15 Menit',
		lessons: [
			{
				id: 'les-1',
				title: '1.1 Anatomi HTTP Request, Headers, & Idempotensi',
				duration: '5 Menit',
				content:
					'Metode HTTP GET, PUT, dan DELETE harus bersifat idempoten — mengeksekusi request yang sama beberapa kali menghasilkan efek samping yang sama pada server.',
			},
			{
				id: 'les-2',
				title: '1.2 Desain Endpoint Semantik & Versioning API',
				duration: '6 Menit',
				content:
					'Gunakan kata benda jamak untuk koleksi sumber daya (misal: /api/v1/students) dan hindari kata kerja dalam URI.',
			},
		],
		quiz: {
			question: 'Manakah dari metode HTTP berikut yang diwajibkan bersifat idempoten menurut standar RFC 7231?',
			bloom: 'C2 - Understanding',
			options: [
				{ key: 'A', text: 'GET, PUT, dan DELETE' },
				{ key: 'B', text: 'POST dan PATCH saja' },
				{ key: 'C', text: 'Hanya POST' },
				{ key: 'D', text: 'Semua metode HTTP tanpa kecuali' },
				{ key: 'E', text: 'Hanya CONNECT dan TRACE' },
			],
			correct: 'A',
		},
	},
	{
		id: 'mod-ai-2',
		title: 'Modul 2: Keamanan API, Rate Limiting, & Autentikasi JWT',
		duration: '20 Menit',
		lessons: [
			{
				id: 'les-3',
				title: '2.1 Implementasi Stateless Token Bearer & Signing Algoritma',
				duration: '7 Menit',
				content:
					'JWT terdiri dari Header, Payload, dan Signature. Kunci rahasia HMAC-SHA256 atau asimetris RSA harus disimpan di Environment Variable yang aman.',
			},
		],
		quiz: {
			question: 'Bagian manakah dari JSON Web Token (JWT) yang mencegah terjadinya manipulasi data di sisi client?',
			bloom: 'C4 - Analyzing',
			options: [
				{ key: 'A', text: 'Cryptographic Signature (Signature yang ditandatangani private key)' },
				{ key: 'B', text: 'Base64 Encoded Header' },
				{ key: 'C', text: 'Payload Claim Set' },
				{ key: 'D', text: 'CORS Preflight Headers' },
				{ key: 'E', text: 'Client LocalStorage Cache' },
			],
			correct: 'A',
		},
	},
];

const ReviewPage = () => {
	const navigate = useNavigate();
	const [modules, setModules] = useState(INITIAL_GENERATED_MODULES);
	const [selectedModuleId, setSelectedModuleId] = useState('mod-ai-1');
	const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'quiz'
	const [isPublished, setIsPublished] = useState(false);

	const activeModule = modules.find((m) => m.id === selectedModuleId) || modules[0];

	const handlePublish = () => {
		setIsPublished(true);
		setTimeout(() => {
			navigate('/organizer/microlearning');
		}, 1500);
	};

	return (
		<div className="min-h-screen bg-slate-50/70 p-6 md:p-8 space-y-8">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
							AI Studio
						</span>
						<span className="text-xs text-slate-500">• Curriculum Verification & Editing</span>
					</div>
					<h1 className="text-2xl font-bold text-slate-900 tracking-tight">
						Review & Validasi Draf Modul AI
					</h1>
					<p className="text-sm text-slate-500 mt-1">
						Periksa akurasi materi, sesuaikan opsi kuis Bloom taxonomy, lalu publikasikan ke Learning Path.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
						<CheckCircle2 className="w-4 h-4 text-emerald-600" />
						Akurasi Taksonomi: 96%
					</div>
					<button
						onClick={handlePublish}
						className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition shadow-sm"
					>
						<Save className="w-4 h-4" />
						Publikasikan ke Learning Path
					</button>
				</div>
			</div>

			{/* Success Alert */}
			{isPublished && (
				<div className="p-4 rounded-2xl bg-emerald-500 text-white flex items-center justify-between shadow-lg animate-fade-in">
					<div className="flex items-center gap-3">
						<CheckCircle2 className="w-6 h-6" />
						<span className="font-semibold text-sm">
							Draf berhasil divalidasi dan diimpor ke daftar Learning Path Organizer! Mengalihkan...
						</span>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Sidebar: Module Tree (4 cols) */}
				<div className="lg:col-span-4 space-y-4">
					<div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
						<div className="flex items-center justify-between pb-2 border-b border-slate-100">
							<span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
								Struktur Modul Ter-generate
							</span>
							<span className="text-xs text-slate-400">{modules.length} Modul</span>
						</div>

						<div className="space-y-2">
							{modules.map((mod, index) => (
								<button
									key={mod.id}
									onClick={() => setSelectedModuleId(mod.id)}
									className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
										selectedModuleId === mod.id
											? 'border-purple-500 bg-purple-50/50 text-purple-950 font-semibold ring-1 ring-purple-500/20'
											: 'border-slate-200 hover:bg-slate-50 text-slate-700'
									}`}
								>
									<div>
										<div className="text-xs line-clamp-1">{mod.title}</div>
										<div className="text-[11px] text-slate-400 mt-1 font-normal">
											{mod.lessons.length} Lesson • {mod.duration}
										</div>
									</div>
									<ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
								</button>
							))}
						</div>

						<button className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:border-purple-400 hover:text-purple-600 transition flex items-center justify-center gap-1.5">
							<Plus className="w-3.5 h-3.5" />
							Tambah Modul Draf Manual
						</button>
					</div>
				</div>

				{/* Main Editor & Validation Panel (8 cols) */}
				<div className="lg:col-span-8 space-y-4">
					<div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
						<div className="flex items-center justify-between pb-3 border-b border-slate-100">
							<div>
								<span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-md">
									Editing Draf
								</span>
								<h2 className="text-lg font-bold text-slate-900 mt-1">{activeModule.title}</h2>
							</div>

							<div className="flex items-center gap-2">
								<button
									onClick={() => setActiveTab('lessons')}
									className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
										activeTab === 'lessons'
											? 'bg-slate-900 text-white'
											: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
									}`}
								>
									Materi Lessons ({activeModule.lessons.length})
								</button>
								<button
									onClick={() => setActiveTab('quiz')}
									className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
										activeTab === 'quiz'
											? 'bg-slate-900 text-white'
											: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
									}`}
								>
									Soal Evaluasi Kuis
								</button>
							</div>
						</div>

						{/* TAB CONTENT: LESSONS */}
						{activeTab === 'lessons' && (
							<div className="space-y-4">
								{activeModule.lessons.map((les, i) => (
									<div
										key={les.id}
										className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
									>
										<div className="flex items-center justify-between">
											<div className="font-bold text-sm text-slate-800">{les.title}</div>
											<span className="text-xs text-slate-400">{les.duration}</span>
										</div>
										<div>
											<label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
												Konten Ringkasan Microlearning (Markdown / Text):
											</label>
											<textarea
												rows="3"
												defaultValue={les.content}
												className="w-full p-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
											/>
										</div>
									</div>
								))}
							</div>
						)}

						{/* TAB CONTENT: QUIZ */}
						{activeTab === 'quiz' && activeModule.quiz && (
							<div className="space-y-4">
								<div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
											Bloom: {activeModule.quiz.bloom}
										</span>
										<span className="text-xs text-slate-500">Kunci Jawaban: Opsi {activeModule.quiz.correct}</span>
									</div>

									<div>
										<label className="text-xs font-semibold text-slate-700 block mb-1">
											Pertanyaan Kuis:
										</label>
										<input
											type="text"
											defaultValue={activeModule.quiz.question}
											className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
										/>
									</div>

									<div className="space-y-2 pt-2">
										<label className="text-xs font-semibold text-slate-700 block">
											Pilihan Jawaban (A-E):
										</label>
										{activeModule.quiz.options.map((opt) => (
											<div key={opt.key} className="flex items-center gap-2">
												<span
													className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
														opt.key === activeModule.quiz.correct
															? 'bg-emerald-600 text-white'
															: 'bg-slate-200 text-slate-700'
													}`}
												>
													{opt.key}
												</span>
												<input
													type="text"
													defaultValue={opt.text}
													className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
												/>
											</div>
										))}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ReviewPage;
