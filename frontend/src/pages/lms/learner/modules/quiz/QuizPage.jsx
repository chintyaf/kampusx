import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ProgressBar, Button, Badge } from 'react-bootstrap';
import { ChevronLeft, HelpCircle, Check, ArrowRight, CheckCircle } from 'lucide-react';

const QuizPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  // Helper info about module
  const mockModuleData = {
    1: { title: 'Pengenalan Design Thinking untuk Pemula' },
    2: { title: 'Teknik Presentasi yang Memukau Audiens' },
    3: { title: 'Dasar-dasar Kepemimpinan Tim Efektif' },
    4: { title: 'Deep Work: Fokus Tanpa Distraksi Digital' },
  };

  const moduleTitle = mockModuleData[moduleId]?.title || 'LMS Micro-Learning Modul';

  const quizData = [
    {
      q: 'Apa langkah pertama yang harus dilakukan dalam proses Design Thinking?',
      options: [
        { key: 'A', text: 'Membuat prototype produk secepat mungkin.' },
        { key: 'B', text: 'Berempati (Empathize) untuk memahami kebutuhan pengguna.' },
        { key: 'C', text: 'Melakukan testing langsung ke pasar luas.' }
      ],
      correct: 'B'
    },
    {
      q: 'Mengapa batasan waktu (time boxing) penting dalam sesi pembelajaran mikro?',
      options: [
        { key: 'A', text: 'Membatasi kapasitas otak agar tidak lelah belajar.' },
        { key: 'B', text: 'Mengurangi beban kognitif dan memaksimalkan fokus jangka pendek.' },
        { key: 'C', text: 'Mempermudah organizer membuat sertifikat.' }
      ],
      correct: 'B'
    },
    {
      q: 'Apa indikator keberhasilan dari tahap evaluasi diri (Self-Reflection)?',
      options: [
        { key: 'A', text: 'Mendapat nilai sempurna di percobaan pertama kuis.' },
        { key: 'B', text: 'Mampu merefleksikan kelemahan dan memetakan aksi koreksi diri.' },
        { key: 'C', text: 'Mendapatkan poin global terbanyak dibanding teman.' }
      ],
      correct: 'B'
    }
  ];

  const handleOptionSelect = (key) => {
    setSelectedOption(key);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null); // Reset select
    } else {
      // Completed, go to reflection
      navigate(`/learner/modules/${moduleId}/reflection`);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Top Navbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 0' }}>
        <Container>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={() => navigate(`/learner/modules/${moduleId}`)}
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', color: '#64748b', fontSize: 14, fontWeight: 600, padding: 0 }}
            >
              <ChevronLeft size={18} /> Kembali ke Materi
            </button>
            <div style={{ width: 1, height: 20, background: '#cbd5e1' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Kuis: {moduleTitle}</span>
          </div>
        </Container>
      </div>

      <Container style={{ paddingTop: 32 }}>
        <Row className="g-4">
          
          {/* Progress Tracker Sidebar */}
          <Col lg={3}>
            <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 20 }}>
              <h6 style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Alur Pembelajaran
              </h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f0fdf4', color: '#15803d', fontSize: 12, fontWeight: 600 }}>
                  <CheckCircle size={14} />
                  <span>1. Forethought</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f0fdf4', color: '#15803d', fontSize: 12, fontWeight: 600 }}>
                  <CheckCircle size={14} />
                  <span>2. Materi Pembelajaran</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f0f9ff', color: '#0369a1', fontSize: 12, fontWeight: 700 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid #0369a1' }} />
                  <span>3. Kuis Evaluasi (Aktif)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: '#64748b', fontSize: 12, fontWeight: 500 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid #cbd5e1' }} />
                  <span>4. Refleksi Diri</span>
                </div>
              </div>

              <hr style={{ borderColor: '#cbd5e1', margin: '0 0 16px' }} />

              <h6 style={{ fontWeight: 700, fontSize: 12, color: '#64748b', marginBottom: 12 }}>PROGRES KUIS</h6>
              <div style={{ display: 'flex', gap: 8 }}>
                {quizData.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      height: 32,
                      borderRadius: 8,
                      border: currentQuestion === index ? '2px solid #00699e' : '1px solid #e2e8f0',
                      background: currentQuestion > index ? '#16a34a' : currentQuestion === index ? '#f0f9ff' : '#fff',
                      color: currentQuestion > index ? '#fff' : currentQuestion === index ? '#00699e' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 13
                    }}
                  >
                    {currentQuestion > index ? <Check size={14} /> : index + 1}
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Quiz Container */}
          <Col lg={9}>
            
            {/* Header info */}
            <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Soal Kuis</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#00699e' }}>
                  Pertanyaan {currentQuestion + 1} dari {quizData.length}
                </span>
              </div>
              <ProgressBar now={((currentQuestion + 1) / quizData.length) * 100} style={{ height: 6, borderRadius: 999 }} />
            </Card>

            {/* Question */}
            <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <HelpCircle size={20} color="#00699e" style={{ flexShrink: 0, marginTop: 2 }} />
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.5, margin: 0 }}>
                  {quizData[currentQuestion].q}
                </h4>
              </div>
            </Card>

            {/* Answer Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {quizData[currentQuestion].options.map((option) => {
                const isSelected = selectedOption === option.key;
                return (
                  <div
                    key={option.key}
                    onClick={() => handleOptionSelect(option.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      background: isSelected ? '#f0f9ff' : '#fff',
                      border: isSelected ? '2px solid #00699e' : '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: 16,
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 6px -1px rgba(0, 105, 158, 0.05)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: isSelected ? '#00699e' : '#f1f5f9',
                      color: isSelected ? '#fff' : '#64748b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 12, flexShrink: 0
                    }}>
                      {option.key}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: isSelected ? '#004e78' : '#0f172a', lineHeight: 1.5 }}>
                      {option.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Navigation controls */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                disabled={selectedOption === null}
                onClick={handleNext}
                style={{ 
                  background: '#005a87', 
                  border: 'none', 
                  borderRadius: 10, 
                  padding: '12px 24px', 
                  fontWeight: 700, 
                  fontSize: 13, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6 
                }}
              >
                {currentQuestion === quizData.length - 1 ? 'Selesai & Lihat Refleksi' : 'Pertanyaan Selanjutnya'} <ArrowRight size={16} />
              </Button>
            </div>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default QuizPage;
