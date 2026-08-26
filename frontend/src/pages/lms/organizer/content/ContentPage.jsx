import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Modal, InputGroup } from 'react-bootstrap';
import { BookOpen, Edit3, Trash2, HelpCircle, Sparkles, Check, ToggleLeft, ToggleRight, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ContentPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  // Mock list of modules
  const [modules, setModules] = useState([
    { id: 1, code: 'MOD-DT1', title: 'Pengenalan Design Thinking untuk Pemula', lessons: 4, status: 'published' },
    { id: 2, code: 'MOD-PS1', title: 'Teknik Presentasi yang Memukau Audiens', lessons: 6, status: 'published' },
    { id: 3, code: 'MOD-LD1', title: 'Dasar-dasar Kepemimpinan Tim Efektif', lessons: 5, status: 'published' },
    { id: 4, code: 'MOD-DW1', title: 'Deep Work: Fokus Tanpa Distraksi Digital', lessons: 3, status: 'draft' }
  ]);

  // Quiz Builder states inside editor
  const [quizzes, setQuizzes] = useState([
    { id: 1, question: 'Apa kegunaan utama tahap Empathy Map?', options: ['A: Memetakan finansial proyek', 'B: Memahami pikiran & perilaku user', 'C: Mempersingkat waktu koding'], correct: 'B' }
  ]);

  // Manual override bypass status for members
  const [overrideUsers, setOverrideUsers] = useState([
    { id: 2, name: 'Participant KampusX', email: 'part@kampusx.com', unlocked: false },
    { id: 3, name: 'Chintya Amelia', email: 'chintya@kampusx.com', unlocked: true },
    { id: 4, name: 'Budi Santoso', email: 'budi@kampusx.com', unlocked: false }
  ]);

  const handleToggleOverride = (userId) => {
    setOverrideUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextState = !u.unlocked;
        toast.success(`Akses modul berhasil ${nextState ? 'DIBUKA secara paksa' : 'DIKUNCI kembali'} untuk ${u.name}!`);
        return { ...u, unlocked: nextState };
      }
      return u;
    }));
  };

  const handleEditModule = (mod) => {
    setSelectedModule(mod);
    setShowModal(true);
  };

  const handleAddQuestion = () => {
    const newId = quizzes.length + 1;
    setQuizzes(prev => [...prev, {
      id: newId,
      question: 'Pertanyaan Baru ' + newId,
      options: ['A: Pilihan A', 'B: Pilihan B', 'C: Pilihan C'],
      correct: 'A'
    }]);
    toast.success('Pertanyaan baru ditambahkan!');
  };

  const handleGenerateAIQuiz = () => {
    toast.loading('Chintya AI sedang merumuskan kuis...');
    setTimeout(() => {
      setQuizzes([
        { id: 1, question: 'Apa kegunaan utama tahap Empathy Map?', options: ['A: Memetakan finansial proyek', 'B: Memahami pikiran & perilaku user', 'C: Mempersingkat waktu koding'], correct: 'B' },
        { id: 2, question: 'Manakah di bawah ini pilar utama Design Thinking?', options: ['A: Empathize, Define, Ideate', 'B: Planning, Execution, Reflection', 'C: Budgeting, Marketing, Sales'], correct: 'A' },
        { id: 3, question: 'Apa itu metode brainstorming?', options: ['A: Mengevaluasi ide secara cepat', 'B: Mengumpulkan gagasan sebanyak-banyaknya tanpa kritik', 'C: Menolak ide alternatif'], correct: 'B' }
      ]);
      toast.dismiss();
      toast.success('3 Soal kuis berhasil dirumuskan AI secara otomatis!');
    }, 1200);
  };

  const handleSaveModule = () => {
    toast.success('Pengaturan modul & kuis berhasil disimpan!');
    setShowModal(false);
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', padding: '40px 0' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <button onClick={() => navigate('/organizer/dashboard')} style={{ background: 'none', border: 'none', color: '#fff' }}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <span className="badge bg-primary mb-2" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: 10 }}>
                  LMS Studio
                </span>
                <h2 className="fw-extrabold mb-1">Manajemen Konten & Kuis</h2>
                <p className="text-white-50 mb-0 small">
                  Kelola bab pelajaran, atur manual override kelulusan, dan konfigurasikan kuis kognitif.
                </p>
              </div>
            </div>
            <Button 
              style={{ background: '#005a87', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13 }}
              onClick={() => {
                setSelectedModule({ code: 'NEW-00', title: 'Modul Baru', status: 'draft' });
                setShowModal(true);
              }}
            >
              + Buat Modul Baru
            </Button>
          </div>
        </Container>
      </div>

      <Container className="mt-4">
        <Row className="g-4">
          
          {/* Left panel: Modules List table */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4 p-4" style={{ background: '#fff' }}>
              <h5 className="fw-bold mb-3">Daftar Modul Terbitan</h5>
              
              <Table responsive hover className="align-middle">
                <thead>
                  <tr className="table-light">
                    <th>Kode</th>
                    <th>Judul Modul</th>
                    <th className="text-center">Jumlah Lesson</th>
                    <th className="text-center">Status</th>
                    <th className="text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map(mod => (
                    <tr key={mod.id}>
                      <td className="fw-bold text-secondary" style={{ fontSize: 12 }}>{mod.code}</td>
                      <td className="fw-bold text-dark" style={{ fontSize: 13 }}>{mod.title}</td>
                      <td className="text-center fw-semibold" style={{ fontSize: 12.5 }}>{mod.lessons} Materi</td>
                      <td className="text-center">
                        <Badge bg={mod.status === 'published' ? 'success' : 'secondary'} className="px-2 py-1">
                          {mod.status === 'published' ? 'Terbit' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button variant="outline-primary" size="sm" onClick={() => handleEditModule(mod)} className="me-2" style={{ borderRadius: 8 }}>
                          <Edit3 size={12} /> Edit
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => toast.success('Modul dihapus!')} style={{ borderRadius: 8 }}>
                          <Trash2 size={12} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Col>

          {/* Right panel: Prerequisite Bypass / Manual override switch */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 p-4" style={{ background: '#fff' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <ShieldAlert size={20} className="text-danger" />
                <h5 className="fw-bold text-dark mb-0">Manual Unlock Switch</h5>
              </div>
              <p className="text-muted small mb-4">
                Gunakan panel override ini jika ingin membuka paksa akses modul untuk peserta tertentu tanpa mewajibkan penyelesaian syarat prerequisite.
              </p>

              <ListGroup variant="flush">
                {overrideUsers.map(user => (
                  <ListGroup.Item key={user.id} className="px-0 py-3 border-light d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-0" style={{ fontSize: 12.5 }}>{user.name}</h6>
                      <small className="text-muted">{user.email}</small>
                    </div>
                    <button 
                      onClick={() => handleToggleOverride(user.id)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                      {user.unlocked ? (
                        <ToggleRight size={38} className="text-success" />
                      ) : (
                        <ToggleLeft size={38} className="text-muted" />
                      )}
                    </button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>

        </Row>
      </Container>

      {/* Editor Modal containing Quiz Builder */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered contentClassName="border-0 shadow-lg rounded-4">
        <Modal.Header closeButton className="bg-light px-4 py-3">
          <Modal.Title className="fw-bold text-dark" style={{ fontSize: 16 }}>
            Konfigurasi Modul & Quiz Builder: {selectedModule?.title || 'Modul Baru'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          
          {/* General Metadata form */}
          <h6 className="fw-bold text-secondary mb-3 small">INFORMASI MODUL</h6>
          <Row className="g-3 mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Kode Modul</Form.Label>
                <Form.Control type="text" defaultValue={selectedModule?.code} style={{ borderRadius: 8, fontSize: 13 }} />
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Judul Modul</Form.Label>
                <Form.Control type="text" defaultValue={selectedModule?.title} style={{ borderRadius: 8, fontSize: 13 }} />
              </Form.Group>
            </Col>
          </Row>

          <hr className="my-4" />

          {/* Quiz Builder form */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold text-secondary mb-0 small">QUIZ BUILDER</h6>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-purple" 
                size="sm" 
                onClick={handleGenerateAIQuiz} 
                className="d-flex align-items-center gap-1"
                style={{ fontSize: 11, fontWeight: 700, borderColor: '#d8b4fe', color: '#7e22ce' }}
              >
                <Sparkles size={12} /> Generate kuis dengan AI
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={handleAddQuestion}
                style={{ fontSize: 11, fontWeight: 700 }}
              >
                + Tambah Soal Manual
              </Button>
            </div>
          </div>

          {quizzes.map((quiz, index) => (
            <Card className="border p-3 mb-3 bg-light" style={{ borderRadius: 10 }} key={quiz.id}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-secondary" style={{ fontSize: 9 }}>Kuis MC</span>
                <span className="text-muted small">Soal {index + 1}</span>
              </div>

              <Form.Group className="mb-2">
                <Form.Label className="small fw-semibold">Soal Pertanyaan</Form.Label>
                <Form.Control 
                  type="text" 
                  value={quiz.question} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuizzes(prev => prev.map(q => q.id === quiz.id ? { ...q, question: val } : q));
                  }}
                  style={{ borderRadius: 8, fontSize: 13 }}
                />
              </Form.Group>

              <Row className="g-2 mb-2">
                {quiz.options.map((opt, optIdx) => (
                  <Col md={4} key={optIdx}>
                    <Form.Control 
                      type="text" 
                      value={opt} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuizzes(prev => prev.map(q => {
                          if (q.id === quiz.id) {
                            const newOpts = [...q.options];
                            newOpts[optIdx] = val;
                            return { ...q, options: newOpts };
                          }
                          return q;
                        }));
                      }}
                      style={{ borderRadius: 8, fontSize: 11 }}
                    />
                  </Col>
                ))}
              </Row>

              <div className="d-flex align-items-center gap-2">
                <span className="small fw-bold text-secondary">Kunci Jawaban:</span>
                <Form.Select 
                  value={quiz.correct} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuizzes(prev => prev.map(q => q.id === quiz.id ? { ...q, correct: val } : q));
                  }}
                  style={{ width: '100px', borderRadius: 8, padding: '4px 8px', fontSize: 12 }}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </Form.Select>
              </div>
            </Card>
          ))}

        </Modal.Body>
        <Modal.Footer className="border-0 bg-light px-4 py-3">
          <Button variant="outline-secondary" onClick={() => setShowModal(false)} style={{ borderRadius: 10, fontSize: 13 }}>
            Tutup
          </Button>
          <Button onClick={handleSaveModule} style={{ background: '#005a87', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
            Simpan Perubahan
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ContentPage;
