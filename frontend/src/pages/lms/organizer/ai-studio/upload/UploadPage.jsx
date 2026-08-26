import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, ProgressBar, InputGroup } from 'react-bootstrap';
import { UploadCloud, Sparkles, AlertCircle, FileText, Calendar, ArrowRight, Settings, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const UploadPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [chunkSize, setChunkSize] = useState('micro');
  const [quizComplexity, setQuizComplexity] = useState('application');
  const [aiDirectives, setAiDirectives] = useState(
    'Act as a master instructor. Break down the content into a lesson, mapping it to specific forethought goals and building a quick self-reflection criteria.'
  );

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionStep, setExtractionStep] = useState('');

  const mockEvents = [
    { id: 1, title: 'Webinar Nasional: Startup Funding & Pitching 101' },
    { id: 2, title: 'UI/UX Bootcamp: Dari Wireframe ke Prototype' },
    { id: 3, title: 'Pelatihan Public Speaking & Presentasi Profesional' },
    { id: 4, title: 'Indonesia AI Summit 2025' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      toast.success(`File ${e.dataTransfer.files[0].name} berhasil dimuat!`);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast.success(`File ${e.target.files[0].name} berhasil dimuat!`);
    }
  };

  const handleStartExtraction = () => {
    if (!file && !selectedEvent) {
      toast.error('Harap unggah berkas silabus atau pilih event KampusX terlebih dahulu!');
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(0);
    
    const steps = [
      { progress: 15, text: 'Membaca berkas masukan...' },
      { progress: 40, text: 'Menganalisis konten & kata kunci penting...' },
      { progress: 65, text: 'AI Engine sedang merancang modul pembelajaran...' },
      { progress: 85, text: 'Menyusun soal kuis kognitif & evaluasi diri...' },
      { progress: 100, text: 'Penyusunan modul selesai!' }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setExtractionProgress(steps[currentStepIdx].progress);
        setExtractionStep(steps[currentStepIdx].text);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsExtracting(false);
          toast.success('Penyusunan modul AI selesai! Mengalihkan ke halaman Review.');
          navigate('/organizer/ai-studio/review', { 
            state: { 
              fileName: file ? file.name : 'Event: ' + mockEvents.find(e => e.id === Number(selectedEvent))?.title,
              chunkSize,
              quizComplexity,
              aiDirectives
            } 
          });
        }, 800);
      }
    }, 900);
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #091e3a 0%, #2f80ed 100%)', color: '#fff', padding: '40px 0' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <span className="badge bg-primary mb-2" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: 10 }}>
                AI Studio Creator
              </span>
              <h2 className="fw-extrabold mb-1">Upload & Build Micro-Learning</h2>
              <p className="text-white-50 mb-0 small" style={{ maxWidth: 550 }}>
                Ekstrak materi belajar berkualitas secara otomatis menggunakan AI berbasis kurikulum, silabus, atau event KampusX.
              </p>
            </div>
            <Button variant="outline-light" onClick={() => navigate('/organizer/dashboard')} style={{ borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
              Kembali ke Dashboard
            </Button>
          </div>
        </Container>
      </div>

      <Container className="mt-4">
        {isExtracting ? (
          <Card className="border-0 shadow-sm rounded-4 p-5 text-center my-5" style={{ background: '#fff' }}>
            <div className="d-flex flex-column align-items-center py-5">
              <div className="spinner-grow text-primary mb-4" style={{ width: '4rem', height: '4rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h4 className="fw-bold mb-2">Chintya AI Engine Sedang Mengekstrak Konten</h4>
              <p className="text-muted mb-4 small" style={{ maxWidth: 400 }}>
                Sistem sedang memilah-milah materi Anda ke dalam bagian mikro yang ramah kognitif.
              </p>
              
              <div style={{ width: '100%', maxWidth: '500px' }} className="mb-3">
                <div className="d-flex justify-content-between mb-1 small fw-bold text-muted">
                  <span>{extractionStep}</span>
                  <span>{extractionProgress}%</span>
                </div>
                <ProgressBar now={extractionProgress} animated variant="primary" style={{ height: 10, borderRadius: 10 }} />
              </div>
            </div>
          </Card>
        ) : (
          <Row className="g-4">
            {/* Left Inputs */}
            <Col lg={7}>
              <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                  <UploadCloud size={20} className="text-primary" /> Sumber Materi Pembelajaran
                </h5>
                
                {/* Dropzone */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input').click()}
                  style={{
                    border: isDragActive ? '2px dashed #2f80ed' : '2px dashed #cbd5e1',
                    borderRadius: 16,
                    padding: '40px 20px',
                    textAlign: 'center',
                    background: isDragActive ? '#f0f7ff' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: 20
                  }}
                >
                  <input
                    id="file-input"
                    type="file"
                    multiple={false}
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <UploadCloud size={40} className="text-muted mb-3" />
                  <h6 className="fw-bold mb-1">Seret & taruh file di sini atau klik untuk mencari</h6>
                  <p className="text-muted small mb-0">Mendukung berkas PDF, Word, atau Teks hingga 25MB.</p>
                </div>

                {file && (
                  <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 mb-4">
                    <FileText size={24} className="text-primary" />
                    <div className="flex-grow-1 min-w-0">
                      <h6 className="fw-bold mb-0 text-truncate">{file.name}</h6>
                      <small className="text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                    </div>
                    <Button variant="outline-danger" size="sm" onClick={() => setFile(null)} style={{ borderRadius: 8 }}>
                      Hapus
                    </Button>
                  </div>
                )}

                <div className="d-flex align-items-center gap-2 mb-3 text-muted">
                  <span style={{ height: 1, background: '#cbd5e1', flex: 1 }} />
                  <span className="small fw-bold">ATAU HUBUNGKAN DENGAN EVENT</span>
                  <span style={{ height: 1, background: '#cbd5e1', flex: 1 }} />
                </div>

                {/* Event Selector */}
                <Form.Group className="mb-2">
                  <Form.Label className="fw-bold small text-secondary mb-2">Pilih Event KampusX</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ background: '#fff', borderRight: 'none' }}>
                      <Calendar size={16} className="text-muted" />
                    </InputGroup.Text>
                    <Form.Select
                      value={selectedEvent}
                      onChange={(e) => {
                        setSelectedEvent(e.target.value);
                        if (e.target.value) setFile(null); // Clear file if event is selected
                      }}
                      style={{ borderLeft: 'none', borderRadius: '0 10px 10px 0', fontSize: 13 }}
                    >
                      <option value="">-- Pilih Event yang Diikuti Peserta --</option>
                      {mockEvents.map(ev => (
                        <option key={ev.id} value={ev.id}>{ev.title}</option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                  <Form.Text className="text-muted small">
                    AI akan mengekstrak transkrip, poster, dan materi event untuk menyusun modul micro-learning.
                  </Form.Text>
                </Form.Group>
              </Card>
            </Col>

            {/* Right Configuration parameters */}
            <Col lg={5}>
              <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                  <Settings size={20} className="text-primary" /> Pengaturan Parameter AI
                </h5>

                {/* Chunk Size Selector */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-secondary">Ukuran Segmentasi (Chunk Size)</Form.Label>
                  <Form.Select
                    value={chunkSize}
                    onChange={(e) => setChunkSize(e.target.value)}
                    style={{ borderRadius: 10, fontSize: 13 }}
                  >
                    <option value="micro">Modul Mikro (Estimasi baca 2-3 Menit)</option>
                    <option value="standard">Modul Standar (Estimasi baca 5-7 Menit)</option>
                  </Form.Select>
                </Form.Group>

                {/* Quiz Complexity */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-secondary">Kompleksitas Evaluasi Kuis</Form.Label>
                  <Form.Select
                    value={quizComplexity}
                    onChange={(e) => setQuizComplexity(e.target.value)}
                    style={{ borderRadius: 10, fontSize: 13 }}
                  >
                    <option value="recall">Konseptual & Definisi (Mudah)</option>
                    <option value="application">Penerapan Studi Kasus (Sedang)</option>
                    <option value="synthesis">Analisis & Sintesis Situasional (Tinggi)</option>
                  </Form.Select>
                </Form.Group>

                {/* AI directives */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small text-secondary">Instruksi Kustom AI (Directives)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={aiDirectives}
                    onChange={(e) => setAiDirectives(e.target.value)}
                    style={{ borderRadius: 10, fontSize: 13, resize: 'none' }}
                  />
                </Form.Group>

                <Button
                  onClick={handleStartExtraction}
                  style={{
                    background: 'linear-gradient(to right, #005a87, #007ab5)',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px',
                    fontWeight: 700,
                    width: '100%',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <Sparkles size={16} /> Buat Modul dengan Chintya AI <ArrowRight size={16} />
                </Button>
              </Card>

              {/* Alert Tips */}
              <Card className="border-0 shadow-sm rounded-4 p-3" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                <div className="d-flex gap-2 align-items-start">
                  <AlertCircle size={18} className="text-warning flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: 12 }}>Rekomendasi AI Creator</h6>
                    <p className="text-muted mb-0" style={{ fontSize: 11, lineHeight: 1.5 }}>
                      Untuk hasil terbaik, pastikan dokumen silabus memuat sub-bab materi, perkiraan durasi kuis, serta indikator pencapaian hasil belajar (learning outcomes).
                    </p>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default UploadPage;
