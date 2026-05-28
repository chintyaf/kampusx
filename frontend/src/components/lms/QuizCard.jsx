import React, { useState } from 'react';
import { Card, Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import { HelpCircle, CheckCircle, XCircle, RefreshCw, Award, Play } from 'lucide-react';

const QuizCard = ({ material, onMarkAsCompleted, isCompleted }) => {
    // 3 Mock Questions related to the Seminar & Workshop evaluation
    const questions = [
        {
            id: 1,
            question: "Apa tujuan utama dari metode pembelajaran Micro-Learning?",
            options: [
                "Menghafal modul materi tebal dalam satu malam",
                "Membagi materi besar menjadi bagian kecil (chunking) agar lebih mudah diserap",
                "Menghapus peran mentor dalam proses belajar mengajar",
                "Mengurangi kuota internet peserta webinar secara drastis"
            ],
            correctIndex: 1
        },
        {
            id: 2,
            question: "Berdasarkan materi yang telah dipaparkan, manakah komponen utama dalam menyusun infografis yang efektif?",
            options: [
                "Menggunakan sebanyak-banyaknya kombinasi warna cerah",
                "Menuliskan seluruh paragraf teks penjelasan tanpa diringkas",
                "Fokus pada data kunci visual yang bersih, whitespace yang seimbang, dan tipografi jelas",
                "Menghindari penggunaan icon atau gambar pendukung"
            ],
            correctIndex: 2
        },
        {
            id: 3,
            question: "Setelah menyelesaikan post-event quiz ini, tindakan apa yang direkomendasikan untuk klaim e-sertifikat?",
            options: [
                "Menutup langsung halaman web",
                "Mengisi survei feedback/ulasan singkat di bagian 'Sertifikat & Ulasan'",
                "Mengirim email ke customer service kampus secara manual",
                "Membagikan tautan rahasia ke peserta lain"
            ],
            correctIndex: 1
        }
    ];

    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);

    const handleOptionSelect = (questionId, optionIndex) => {
        if (submitted) return;
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Calculate score
        let correctCount = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correctIndex) {
                correctCount += 1;
            }
        });

        const finalScore = Math.round((correctCount / questions.length) * 100);
        setScore(finalScore);
        setSubmitted(true);
        setShowFeedback(true);

        // If score is 100% (or passed), automatically mark as completed
        if (correctCount === questions.length) {
            onMarkAsCompleted(material.id);
        }
    };

    const handleRetry = () => {
        setAnswers({});
        setSubmitted(false);
        setScore(0);
        setShowFeedback(false);
    };

    const isAllAnswered = Object.keys(answers).length === questions.length;

    return (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <Card.Header 
                className="py-3 px-4 border-0 d-flex justify-content-between align-items-center"
                style={{ backgroundColor: 'var(--color-primary, #1A365D)', color: '#ffffff' }}
            >
                <div className="d-flex align-items-center gap-2">
                    <HelpCircle size={20} />
                    <h5 className="fw-bold mb-0">Post-Event Assessment Quiz</h5>
                </div>
                <span className="badge bg-light text-dark rounded-pill fw-semibold">3 Soal Evaluasi</span>
            </Card.Header>

            <Card.Body className="p-4" style={{ backgroundColor: 'var(--color-bg, #ffffff)' }}>
                {showFeedback ? (
                    <div className="text-center py-4 fade-in">
                        {score === 100 ? (
                            <div className="mb-4">
                                <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex p-4 mb-3 border border-success border-opacity-25">
                                    <Award size={48} className="animate-bounce" />
                                </div>
                                <h4 className="fw-bold text-success mb-1">Luar Biasa! Nilai Sempurna</h4>
                                <p className="text-muted small">Anda menjawab seluruh soal dengan benar (100%).</p>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex p-4 mb-3 border border-warning border-opacity-25">
                                    <RefreshCw size={48} className="text-warning" />
                                </div>
                                <h4 className="fw-bold text-warning mb-1">Skor Anda: {score}%</h4>
                                <p className="text-muted small">Anda perlu menjawab semua soal dengan benar untuk lulus modul kuis ini.</p>
                            </div>
                        )}

                        <ProgressBar 
                            now={score} 
                            variant={score === 100 ? "success" : "warning"} 
                            className="mb-4 mx-auto rounded-pill" 
                            style={{ height: '10px', maxWidth: '300px' }} 
                        />

                        {score === 100 ? (
                            <Alert variant="success" className="border-0 rounded-4 text-start mb-4 shadow-sm">
                                <h6 className="fw-bold mb-1">Lulus Kuis Penilaian!</h6>
                                <small>Selamat, modul quiz Anda telah diselesaikan. Anda sekarang siap melanjutkan ke langkah berikutnya untuk klaim sertifikat kelulusan.</small>
                            </Alert>
                        ) : (
                            <Alert variant="warning" className="border-0 rounded-4 text-start mb-4 shadow-sm">
                                <h6 className="fw-bold mb-1">Belum Lulus</h6>
                                <small>Fokus pada konsep *chunking* dan visualisasi infografis, lalu silakan mencoba kembali kuis.</small>
                            </Alert>
                        )}

                        <div className="d-flex justify-content-center gap-3">
                            {score !== 100 && (
                                <Button 
                                    variant="outline-primary" 
                                    className="rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
                                    onClick={handleRetry}
                                >
                                    <RefreshCw size={16} /> Coba Lagi
                                </Button>
                            )}
                            <Button 
                                variant="primary" 
                                className="rounded-pill px-4 fw-bold"
                                onClick={() => setShowFeedback(false)}
                                style={{ backgroundColor: 'var(--color-primary, #1A365D)', borderColor: 'var(--color-primary, #1A365D)' }}
                            >
                                Tinjau Jawaban
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Form onSubmit={handleSubmit}>
                        {questions.map((q, qIndex) => {
                            const isCorrect = answers[q.id] === q.correctIndex;
                            const isSelected = answers[q.id] !== undefined;

                            return (
                                <div key={q.id} className={`mb-4 pb-4 ${qIndex < questions.length - 1 ? 'border-bottom' : ''}`}>
                                    <h6 className="fw-bold mb-3 d-flex align-items-start gap-2">
                                        <span className="bg-light text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '24px', height: '24px', fontSize: '12px', flexShrink: 0 }}>
                                            {qIndex + 1}
                                        </span>
                                        <span>{q.question}</span>
                                    </h6>

                                    <div className="d-flex flex-column gap-2.5 ps-4">
                                        {q.options.map((opt, optIndex) => {
                                            const isOptSelected = answers[q.id] === optIndex;
                                            
                                            let optionClass = "p-3 rounded-4 border transition-all cursor-pointer d-flex align-items-center justify-content-between";
                                            let borderStyle = {};
                                            let textStyle = { color: 'var(--color-text, #1e293b)' };

                                            if (submitted) {
                                                if (optIndex === q.correctIndex) {
                                                    // Mark correct answer Green
                                                    optionClass += " bg-success bg-opacity-10 border-success";
                                                    textStyle.color = "#0f5132";
                                                } else if (isOptSelected && !isCorrect) {
                                                    // Mark user's incorrect choice Red
                                                    optionClass += " bg-danger bg-opacity-10 border-danger";
                                                    textStyle.color = "#842029";
                                                } else {
                                                    optionClass += " bg-light border-light opacity-50";
                                                }
                                            } else {
                                                if (isOptSelected) {
                                                    optionClass += " border-primary bg-primary bg-opacity-10";
                                                    borderStyle = { borderColor: 'var(--color-primary, #1A365D)' };
                                                } else {
                                                    optionClass += " bg-light border-light hover-border";
                                                }
                                            }

                                            return (
                                                <div 
                                                    key={optIndex} 
                                                    className={optionClass}
                                                    onClick={() => handleOptionSelect(q.id, optIndex)}
                                                    style={borderStyle}
                                                >
                                                    <div className="d-flex align-items-center gap-3">
                                                        <Form.Check
                                                            type="radio"
                                                            id={`q-${q.id}-opt-${optIndex}`}
                                                            checked={isOptSelected}
                                                            onChange={() => {}}
                                                            disabled={submitted}
                                                            className="m-0 cursor-pointer pointer-events-none custom-radio"
                                                        />
                                                        <span className="small fw-medium" style={textStyle}>{opt}</span>
                                                    </div>

                                                    {submitted && optIndex === q.correctIndex && (
                                                        <CheckCircle size={18} className="text-success" />
                                                    )}
                                                    {submitted && isOptSelected && !isCorrect && (
                                                        <XCircle size={18} className="text-danger" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {!submitted ? (
                            <div className="text-end pt-3 border-top">
                                <Button 
                                    type="submit" 
                                    disabled={!isAllAnswered}
                                    className="rounded-pill px-5 py-2.5 fw-bold shadow-sm"
                                    style={{
                                        backgroundColor: 'var(--color-primary, #1A365D)',
                                        borderColor: 'var(--color-primary, #1A365D)'
                                    }}
                                >
                                    Kirim Jawaban Quiz
                                </Button>
                            </div>
                        ) : (
                            <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                <div className="text-muted small">
                                    Status: {score === 100 ? (
                                        <Badge bg="success" className="px-2.5 py-1.5 rounded-pill">LULUS (100%)</Badge>
                                    ) : (
                                        <Badge bg="warning" className="px-2.5 py-1.5 rounded-pill">BELUM LULUS ({score}%)</Badge>
                                    )}
                                </div>
                                {score !== 100 && (
                                    <Button 
                                        variant="outline-primary" 
                                        className="rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
                                        onClick={handleRetry}
                                    >
                                        <RefreshCw size={16} /> Mulai Ulang Kuis
                                    </Button>
                                )}
                            </div>
                        )}
                    </Form>
                )}
            </Card.Body>
        </Card>
    );
};

export default QuizCard;
