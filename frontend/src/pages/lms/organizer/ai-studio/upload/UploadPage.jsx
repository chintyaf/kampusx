import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	UploadCloud,
	FileText,
	Sparkles,
	Sliders,
	BrainCircuit,
	CheckCircle,
	X,
	ArrowRight,
	Layers,
	Target,
	HelpCircle,
} from 'lucide-react';

const UploadPage = () => {
	const navigate = useNavigate();

	// File Upload State
	const [uploadedFile, setUploadedFile] = useState(null);
	const [isDragging, setIsDragging] = useState(false);

	// AI Prompt Parameters
	const [targetOutcome, setTargetOutcome] = useState(
		'Mahasiswa mampu merancang REST API yang idempotent, terstandarisasi HTTP status code, dan aman dari SQL Injection.',
	);
	const [learningDepth, setLearningDepth] = useState('Intermediate');
	const [bloomLevel, setBloomLevel] = useState('Applying & Analyzing (C3-C4)');
	const [lessonDuration, setLessonDuration] = useState('5-7 Menit');
	const [generateQuizzes, setGenerateQuizzes] = useState(true);
	const [includeSRLPrompt, setIncludeSRLPrompt] = useState(true);
	const [isProcessing, setIsProcessing] = useState(false);

	const handleFileDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			setUploadedFile(e.dataTransfer.files[0]);
		}
	};

	const handleFileInput = (e) => {
		if (e.target.files && e.target.files[0]) {
			setUploadedFile(e.target.files[0]);
		}
	};

	const handleGenerate = (e) => {
		e.preventDefault();
		setIsProcessing(true);
		setTimeout(() => {
			setIsProcessing(false);
			navigate('/organizer/ai-studio/review');
		}, 1000);
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
						<span className="text-xs text-slate-500">• Curriculum Generator</span>
					</div>
					<h1 className="text-2xl font-bold text-slate-900 tracking-tight">
						Upload Source Document & AI Prompt
					</h1>
					<p className="text-sm text-slate-500 mt-1">
						Ekstrak silabus atau materi PDF menjadi struktur modul microlearning berpedagogi SRL secara otomatis.
					</p>
				</div>
			</div>

			<form onSubmit={handleGenerate} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Left Column: Document Upload Zone (5 cols) */}
				<div className="lg:col-span-5 space-y-4">
					<div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
						<div className="flex items-center gap-2 pb-2 border-b border-slate-100">
							<FileText className="w-5 h-5 text-purple-600" />
							<h2 className="text-base font-bold text-slate-900">1. Unggah Dokumen Sumber</h2>
						</div>

						<div
							onDragOver={(e) => {
								e.preventDefault();
								setIsDragging(true);
							}}
							onDragLeave={() => setIsDragging(false)}
							onDrop={handleFileDrop}
							className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center min-h-[260px] ${
								isDragging
									? 'border-purple-500 bg-purple-50/50'
									: uploadedFile
									? 'border-emerald-400 bg-emerald-50/20'
									: 'border-slate-200 hover:border-purple-400 bg-slate-50/50'
							}`}
						>
							{uploadedFile ? (
								<div className="space-y-3">
									<div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
										<CheckCircle className="w-6 h-6" />
									</div>
									<div>
										<div className="text-sm font-bold text-slate-900 line-clamp-1">
											{uploadedFile.name}
										</div>
										<div className="text-xs text-slate-500 mt-0.5">
											{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Berkas Siap
										</div>
									</div>
									<button
										type="button"
										onClick={() => setUploadedFile(null)}
										className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold"
									>
										<X className="w-3.5 h-3.5" />
										Ganti Berkas
									</button>
								</div>
							) : (
								<div className="space-y-3">
									<div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
										<UploadCloud className="w-6 h-6" />
									</div>
									<div>
										<p className="text-sm font-bold text-slate-800">
											Tarik & lepaskan file PDF / Silabus ke sini
										</p>
										<p className="text-xs text-slate-400 mt-1">
											Mendukung format PDF, DOCX, Markdown, atau TXT (Maks. 25MB)
										</p>
									</div>
									<div>
										<label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition">
											Pilih dari Komputer
											<input
												type="file"
												accept=".pdf,.docx,.doc,.txt,.md"
												onChange={handleFileInput}
												className="hidden"
											/>
										</label>
									</div>
								</div>
							)}
						</div>

						<div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-start gap-2">
							<HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
							<span>
								AI LLM akan memecah konten menjadi potongan microlearning (chunking) dan merumuskan kuis diagnostik.
							</span>
						</div>
					</div>
				</div>

				{/* Right Column: AI Prompt Parameter Form (7 cols) */}
				<div className="lg:col-span-7 space-y-6">
					<div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
						<div className="flex items-center gap-2 pb-2 border-b border-slate-100">
							<Sliders className="w-5 h-5 text-purple-600" />
							<h2 className="text-base font-bold text-slate-900">2. Parameter AI & Pedagogi SRL</h2>
						</div>

						<div>
							<label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
								<Target className="w-4 h-4 text-purple-600" />
								Target Learning Outcome (TLO)
							</label>
							<textarea
								rows="3"
								value={targetOutcome}
								onChange={(e) => setTargetOutcome(e.target.value)}
								className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
								placeholder="Spesifikasikan kompetensi apa yang harus dikuasai siswa setelah menyelesaikan modul ini..."
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="text-xs font-semibold text-slate-700 block mb-1.5">
									Tingkat Kedalaman (Target Depth)
								</label>
								<select
									value={learningDepth}
									onChange={(e) => setLearningDepth(e.target.value)}
									className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
								>
									<option value="Beginner">Beginner (Pemula - Konsep Inti)</option>
									<option value="Intermediate">Intermediate (Penerapan & Best Practice)</option>
									<option value="Advanced">Advanced (Studi Kasus Kompleks & Optimasi)</option>
								</select>
							</div>

							<div>
								<label className="text-xs font-semibold text-slate-700 block mb-1.5">
									Fokus Taksonomi Bloom
								</label>
								<select
									value={bloomLevel}
									onChange={(e) => setBloomLevel(e.target.value)}
									className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
								>
									<option value="Remembering & Understanding (C1-C2)">
										C1-C2 (Mengingat & Memahami)
									</option>
									<option value="Applying & Analyzing (C3-C4)">
										C3-C4 (Menerapkan & Menganalisis)
									</option>
									<option value="Evaluating & Creating (C5-C6)">
										C5-C6 (Mengevaluasi & Merancang)
									</option>
								</select>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="text-xs font-semibold text-slate-700 block mb-1.5">
									Target Durasi per Micro-Lesson
								</label>
								<select
									value={lessonDuration}
									onChange={(e) => setLessonDuration(e.target.value)}
									className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
								>
									<option value="3-5 Menit">3 - 5 Menit (Ultra Bite-Sized)</option>
									<option value="5-7 Menit">5 - 7 Menit (Standar Microlearning)</option>
									<option value="8-12 Menit">8 - 12 Menit (Deep Dive)</option>
								</select>
							</div>

							<div className="space-y-3 pt-2">
								<label className="flex items-center gap-2.5 cursor-pointer">
									<input
										type="checkbox"
										checked={generateQuizzes}
										onChange={(e) => setGenerateQuizzes(e.target.checked)}
										className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
									/>
									<span className="text-xs font-semibold text-slate-800">
										Generate Bank Soal Kuis (Opsi A-E)
									</span>
								</label>
								<label className="flex items-center gap-2.5 cursor-pointer">
									<input
										type="checkbox"
										checked={includeSRLPrompt}
										onChange={(e) => setIncludeSRLPrompt(e.target.checked)}
										className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
									/>
									<span className="text-xs font-semibold text-slate-800">
										Sertakan Template Refleksi SRL
									</span>
								</label>
							</div>
						</div>

						<div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
							<button
								type="button"
								onClick={() => navigate('/organizer/microlearning')}
								className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
							>
								Batal
							</button>
							<button
								type="submit"
								disabled={isProcessing}
								className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
							>
								{isProcessing ? (
									<span>Memproses dengan AI...</span>
								) : (
									<>
										<Sparkles className="w-4 h-4" />
										Generate Draft Kurikulum
										<ArrowRight className="w-4 h-4" />
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
};

export default UploadPage;
