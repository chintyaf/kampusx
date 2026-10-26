import React, { useState } from 'react';
import { Card, Button, ProgressBar, Badge, Form } from 'react-bootstrap';
import {
	HelpCircle,
	Clock,
	CheckCircle2,
	XCircle,
	RotateCcw,
	ChevronRight,
	ChevronLeft,
	Award,
	AlertCircle,
} from 'lucide-react';

const LessonQuiz = ({ item, onNext }) => {
	// Mock data soal kuis jika tidak ada item.questions
	const questions = item?.questions || [
		{
			id: 1,
			question: 'Apa tujuan utama dari arsitektur RESTful API?',
			options: [
				'Menghubungkan database langsung dengan browser tanpa backend',
				'Membuat antarmuka web yang fleksibel, terstandarisasi, dan stateless',
				'Menggantikan fungsi HTML dan CSS pada tampilan web',
				'Meningkatkan kecepatan render komponen React',
			],
			correctAnswer: 1,
		},
		{
			id: 2,
			question:
				'HTTP Status Code manakah yang digunakan untuk menandakan bahwa resource berhasil dibuat?',
			options: ['200 OK', '201 Created', '204 No Content', '400 Bad Request'],
			correctAnswer: 1,
		},
		{
			id: 3,
			question: 'Manakah dari HTTP Method berikut yang bersifat Idempotent?',
			options: [
				'POST dan PATCH',
				'GET, PUT, dan DELETE',
				'POST, PUT, dan DELETE',
				'Semua HTTP Method bersifat Idempotent',
			],
			correctAnswer: 1,
		},
	];

	const passingScore = item?.passingScore || 70;

	// State kuis
	const [isStarted, setIsStarted] = useState(false);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState({});
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [score, setScore] = useState(0);

	// Tandai jawaban pilihan pengguna
	const handleSelectOption = (questionIndex, optionIndex) => {
		if (isSubmitted) return;
		setSelectedAnswers((prev) => ({
			...prev,
			[questionIndex]: optionIndex,
		}));
	};

	// Hitung hasil kuis
	const handleSubmitQuiz = () => {
		let correctCount = 0;
		questions.forEach((q, idx) => {
			if (selectedAnswers[idx] === q.correctAnswer) {
				correctCount += 1;
			}
		});

		const calculatedScore = Math.round((correctCount / questions.length) * 100);
		setScore(calculatedScore);
		setIsSubmitted(true);
	};

	// Reset kuis untuk re-take
	const handleReset = () => {
		setSelectedAnswers({});
		setCurrentQuestionIndex(0);
		setIsSubmitted(false);
		setIsStarted(true);
	};

	const isPassed = score >= passingScore;
	const currentQuestion = questions[currentQuestionIndex];
	const isAnsweredAll = Object.keys(selectedAnswers).length === questions.length;

	// --- SCREEN 1: LANDING PAGE KUIS (Sebelum Mulai) ---
	if (!isStarted) {
		return (
			<Card className="border shadow-sm rounded-3 overflow-hidden bg-white">
				<Card.Body className="p-4 p-md-5 text-center">
					<div
						className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
						style={{
							width: '64px',
							height: '64px',
							backgroundColor: 'var(--primary-light)',
							color: 'var(--primary)',
						}}
					>
						<HelpCircle size={32} />
					</div>

					<h4 className="fw-bold mb-2" style={{ color: 'var(--text)' }}>
						{item?.title || 'Kuis Evaluasi Pemahaman'}
					</h4>

					<p
						className="text-muted mx-auto mb-4"
						style={{ maxWidth: '540px', fontSize: '14px' }}
					>
						Uji pemahaman Anda mengenai materi ini. Pastikan Anda menyelesaikan seluruh
						pertanyaan untuk melanjutkan.
					</p>

					<div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
						<div className="d-flex align-items-center gap-2 px-3 py-2 rounded bg-light border">
							<HelpCircle size={16} className="text-muted" />
							<span className="small fw-medium">{questions.length} Pertanyaan</span>
						</div>
						<div className="d-flex align-items-center gap-2 px-3 py-2 rounded bg-light border">
							<Clock size={16} className="text-muted" />
							<span className="small fw-medium">{item?.duration || '10 Menit'}</span>
						</div>
						<div className="d-flex align-items-center gap-2 px-3 py-2 rounded bg-light border">
							<Award size={16} className="text-muted" />
							<span className="small fw-medium">
								Batas Kelulusan: {passingScore}%
							</span>
						</div>
					</div>

					<Button
						onClick={() => setIsStarted(true)}
						className="px-4 py-2 border-0 fw-semibold"
						style={{ backgroundColor: 'var(--primary)' }}
					>
						Mulai Kuis Sekarang
					</Button>
				</Card.Body>
			</Card>
		);
	}

	// --- SCREEN 2: HASIL KUIS (Setelah Submit) ---
	if (isSubmitted) {
		return (
			<Card className="border-0 shadow-sm rounded-3 overflow-hidden bg-white">
				<Card.Body className="p-4 p-md-5 text-center">
					<div
						className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
						style={{
							width: '72px',
							height: '72px',
							backgroundColor: isPassed
								? 'rgba(25, 135, 84, 0.1)'
								: 'rgba(220, 53, 69, 0.1)',
							color: isPassed ? '#198754' : '#dc3545',
						}}
					>
						{isPassed ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
					</div>

					<Badge
						bg={isPassed ? 'success' : 'danger'}
						className="mb-2 px-3 py-2 fs-6 fw-semibold"
					>
						{isPassed ? 'Lulus Kuis' : 'Belum Lulus'}
					</Badge>

					<h3 className="fw-bold my-2" style={{ color: 'var(--text)' }}>
						Skor Anda: {score} / 100
					</h3>

					<p
						className="text-muted mx-auto mb-4"
						style={{ maxWidth: '480px', fontSize: '14px' }}
					>
						{isPassed
							? 'Selamat! Anda telah memahami materi ini dengan baik. Silakan lanjut ke materi berikutnya.'
							: `Nilai Anda belum memenuhi batas kelulusan (${passingScore}%). Anda dapat mengulang kuis untuk memperbaiki nilai.`}
					</p>

					<div className="d-flex justify-content-center gap-3">
						<Button
							variant="outline-secondary"
							onClick={handleReset}
							className="d-inline-flex align-items-center gap-2 px-4 py-2 fw-medium"
						>
							<RotateCcw size={16} /> Ulangi Kuis
						</Button>

						{isPassed && onNext && (
							<Button
								onClick={onNext}
								className="d-inline-flex align-items-center gap-2 px-4 py-2 border-0 fw-medium"
								style={{ backgroundColor: 'var(--primary)' }}
							>
								Lanjut Materi <ChevronRight size={16} />
							</Button>
						)}
					</div>
				</Card.Body>
			</Card>
		);
	}

	// --- SCREEN 3: LEMBAR SOAL KUIS ---
	return (
		<Card className="border-0 shadow-sm rounded-3 overflow-hidden bg-white">
			{/* Header Soal & Progress */}
			<Card.Header className="bg-white border-bottom p-3 p-md-4">
				<div className="d-flex justify-content-between align-items-center mb-2">
					<span className="fw-semibold text-muted small">
						Soal {currentQuestionIndex + 1} dari {questions.length}
					</span>
					<Badge bg="light" text="dark" className="border">
						<Clock size={12} className="me-1 text-muted" /> {item?.duration || '10 Min'}
					</Badge>
				</div>

				<ProgressBar
					now={((currentQuestionIndex + 1) / questions.length) * 100}
					style={{ height: '6px' }}
				/>
			</Card.Header>

			{/* Bodi Soal */}
			<Card.Body className="p-3 p-md-4">
				<h5 className="fw-bold mb-4" style={{ color: 'var(--text)', lineHeight: '1.4' }}>
					{currentQuestion.question}
				</h5>

				<div className="d-flex flex-column gap-2 mb-4">
					{currentQuestion.options.map((option, optIdx) => {
						const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
						return (
							<div
								key={optIdx}
								onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
								className={`p-3 rounded-3 border d-flex align-items-center gap-3 cursor-pointer transition-all ${
									isSelected
										? 'border-primary bg-primary-subtle'
										: 'bg-light-hover'
								}`}
								style={{
									cursor: 'pointer',
									borderColor: isSelected
										? 'var(--primary)'
										: 'var(--neutral-border)',
									backgroundColor: isSelected
										? 'var(--primary-light)'
										: '#f8f9fa',
								}}
							>
								<Form.Check
									type="radio"
									name={`question-${currentQuestionIndex}`}
									id={`opt-${currentQuestionIndex}-${optIdx}`}
									checked={isSelected}
									onChange={() => {}}
								/>
								<label
									htmlFor={`opt-${currentQuestionIndex}-${optIdx}`}
									className="mb-0 flex-grow-1 cursor-pointer"
									style={{
										fontSize: '14px',
										color: 'var(--text)',
										cursor: 'pointer',
									}}
								>
									{option}
								</label>
							</div>
						);
					})}
				</div>

				{!isAnsweredAll && currentQuestionIndex === questions.length - 1 && (
					<div className="alert alert-warning py-2 px-3 d-flex align-items-center gap-2 mb-3 small">
						<AlertCircle size={16} />
						<span>Masih ada pertanyaan yang belum dijawab.</span>
					</div>
				)}
			</Card.Body>

			{/* Footer Navigasi Soal */}
			<Card.Footer className="bg-white border-top p-3 d-flex justify-content-between align-items-center">
				<Button
					variant="outline-secondary"
					size="sm"
					disabled={currentQuestionIndex === 0}
					onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
					className="d-flex align-items-center gap-1"
				>
					<ChevronLeft size={16} /> Sebelumnya
				</Button>

				{currentQuestionIndex < questions.length - 1 ? (
					<Button
						size="sm"
						onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
						className="d-flex align-items-center gap-1 border-0"
						style={{ backgroundColor: 'var(--primary)' }}
					>
						Selanjutnya <ChevronRight size={16} />
					</Button>
				) : (
					<Button
						size="sm"
						variant="success"
						onClick={handleSubmitQuiz}
						className="d-flex align-items-center gap-1 px-3 fw-semibold"
					>
						Kirim Jawaban
					</Button>
				)}
			</Card.Footer>
		</Card>
	);
};

export default LessonQuiz;
