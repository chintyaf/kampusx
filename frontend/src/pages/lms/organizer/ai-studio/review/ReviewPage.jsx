import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Accordion, Badge, ListGroup } from 'react-bootstrap';
import { Check, Edit, AlertCircle, FileText, ArrowRight, Play, Award, HelpCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract router state or set fallback default data
  const { fileName = 'Syllabus_Design_Thinking.pdf', chunkSize = 'micro', quizComplexity = 'application' } = location.state || {};

  // Form State initialized with simulated AI extraction results
  const [pathTitle, setPathTitle] = useState('Modul Hasil AI: ' + fileName.replace(/\.[^/.]+$/, ""));
  const [category, setCategory] = useState('Design');
  const [difficulty, setDifficulty] = useState('beginner');
  const [rewardPoints, setRewardPoints] = useState(50);
  const [description, setDescription] = useState(
    'Materi pembelajaran praktis yang diekstraksi dari dokumen sumber untuk membantu peserta memahami konsep inti secara interaktif.'
  );

  const [modules, setModules] = useState([
    {
      id: 1,
      title: 'Bab 1: Pengenalan Konsep & Kerangka Kerja',
      lessons: [
        { id: 101, title: 'Definisi & Pentingnya Topik Ini', content_type: 'article', body: 'Bagian ini menjabarkan konsep dasar, sejarah singkat, dan mengapa keahlian ini sangat krusial untuk dipelajari di era modern saat ini.' },
        { id: 102, title: 'Prinsip Utama & Studi Kasus Lapangan', content_type: 'article', body: 'Menjelaskan 5 pilar utama dan memberikan contoh nyata keberhasilan implementasinya dalam proyek-proyek skala global.' },
        { id: 103, title: 'Video: Demonstrasi & Praktik Mandiri', content_type: 'video', body: 'https://www.w3schools.com/html/mov_bbb.mp4' }
      ],
      quizzes: [
        { id: 201, question: 'Apa pilar paling dasar dari pembelajaran topik ini?', correct: 'A', options: ['A: Pemahaman fundamental & praktis', 'B: Asumsi teoritis belaka', 'C: Meniru hasil kerja kompetitor'] },
        { id: 202, question: 'Bagaimana cara melacak keefektifan implementasi metode ini?', correct: 'B', options: ['A: Menunggu feedback pasif', 'B: Melakukan evaluasi terstruktur secara berkala', 'C: Menghentikan iterasi awal'] }
      ]
    }
  ]);

  const handleEditLessonTitle = (modId, lesId, newTitle) => {
    setModules(prev => prev.map(m => {
      if (m.id === modId) {
        return {
          ...m,
          lessons: m.lessons.map(l => l.id === lesId ? { ...l, title: newTitle } : l)
        };
      }
      return m;
    }));
  };

  const handleEditLessonBody = (modId, lesId, newBody) => {
    setModules(prev => prev.map(m => {
      if (m.id === modId) {
        return {
          ...m,
          lessons: m.lessons.map(l => l.id === lesId ? { ...l, body: newBody } : l)
        };
      }
      return m;
    }));
  };

  const handlePublish = () => {
    toast.success('Modul micro-learning berhasil diterbitkan ke katalog!');
    navigate('/organizer/dashboard');
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #091e3a 0%, #2f80ed 100%)', color: '#fff', padding: '40px 0' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <span className="badge bg-success mb-2" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: 10 }}>
                AI Generation Complete (Quality Score: 96%)
              </span>
              <h2 className="fw-extrabold mb-1">Review & Tinjau Modul</h2>
              <p className="text-white-50 mb-0 small">
                Tinjau silabus mikro, lesson chunk, dan kuis buatan AI sebelum diterbitkan ke katalog pembelajar.
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-light" onClick={() => navigate('/organizer/ai-studio/upload')} style={{ borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                Unggah Ulang
              </Button>
              <Button variant="success" onClick={handlePublish} className="d-flex align-items-center gap-1" style={{ borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                Terbitkan Modul <Check size={16} />
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="mt-4">
        <Row className="g-4">
          
          {/* Metadata Path Settings (Left Panel) */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                <Edit size={18} className="text-primary" /> Pengaturan Jalur Belajar
              </h5>
              
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small text-secondary">Judul Learning Path</Form.Label>
                <Form.Control 
                  type="text" 
                  value={pathTitle} 
                  onChange={(e) => setPathTitle(e.target.value)} 
                  style={{ borderRadius: 10, fontSize: 13 }}
                />
              </Form.Group>

              <Row className="g-2 mb-3">
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold small text-secondary">Kategori</Form.Label>
                    <Form.Select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)} 
                      style={{ borderRadius: 10, fontSize: 13 }}
                    >
                      <option value="Design">Design</option>
                      <option value="Speaking">Speaking</option>
                      <option value="Leadership">Leadership</option>
                      <option value="Productivity">Productivity</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold small text-secondary">Tingkat Kesulitan</Form.Label>
                    <Form.Select 
                      value={difficulty} 
                      onChange={(e) => setDifficulty(e.target.value)} 
                      style={{ borderRadius: 10, fontSize: 13 }}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small text-secondary">Hadiah Poin (Gamifikasi)</Form.Label>
                <Form.Control 
                  type="number" 
                  value={rewardPoints} 
                  onChange={(e) => setRewardPoints(Number(e.target.value))} 
                  style={{ borderRadius: 10, fontSize: 13 }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small text-secondary">Deskripsi Singkat</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={4} 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  style={{ borderRadius: 10, fontSize: 13, resize: 'none' }}
                />
              </Form.Group>

              <Button 
                variant="outline-primary" 
                onClick={() => toast.success('Detail jalur belajar berhasil disimpan!')}
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                style={{ borderRadius: 10, fontSize: 12, fontWeight: 700 }}
              >
                <Save size={14} /> Simpan Pengaturan
              </Button>
            </Card>

            <Card className="border-0 shadow-sm rounded-4 p-3 bg-light" style={{ border: '1px dashed #cbd5e1' }}>
              <div className="d-flex gap-2">
                <AlertCircle size={16} className="text-primary mt-1" />
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                  <strong>Tip AI Builder:</strong> Pembagian segmentasi pembelajaran disesuaikan dengan parameter chunk size <strong>{chunkSize === 'micro' ? 'Mikro (2-3 mnt)' : 'Standar (5-7 mnt)'}</strong>. Gunakan editor di sebelah kanan untuk memperhalus narasi AI.
                </div>
              </div>
            </Card>
          </Col>

          {/* Module Editor Panel (Right Panel) */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4 p-4" style={{ background: '#fff' }}>
              <h5 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Daftar Modul & Lesson yang Diekstrak</h5>

              <Accordion defaultActiveKey="0">
                {modules.map((mod, modIdx) => (
                  <Accordion.Item eventKey={String(modIdx)} key={mod.id} className="border-0 mb-3" style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <Accordion.Header className="bg-light" style={{ borderRadius: 12 }}>
                      <div className="d-flex align-items-center gap-3">
                        <span className="badge bg-primary">Modul {modIdx + 1}</span>
                        <span className="fw-bold text-dark" style={{ fontSize: 14 }}>{mod.title}</span>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="bg-white border-top">
                      
                      {/* Lesson list inside module */}
                      <h6 className="fw-bold text-secondary mb-3 small d-flex align-items-center gap-1">
                        <FileText size={14} /> LESSON CHUNKS
                      </h6>
                      
                      {mod.lessons.map((les, lesIdx) => (
                        <Card className="border-0 p-3 mb-3 bg-light" style={{ borderRadius: 10 }} key={les.id}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-secondary text-capitalize" style={{ fontSize: 9 }}>
                              {les.content_type === 'video' ? 'Video' : 'Artikel'}
                            </span>
                            <span className="text-muted" style={{ fontSize: 11 }}>Lesson {lesIdx + 1}</span>
                          </div>

                          <Form.Group className="mb-2">
                            <Form.Control 
                              type="text" 
                              value={les.title} 
                              onChange={(e) => handleEditLessonTitle(mod.id, les.id, e.target.value)} 
                              style={{ borderRadius: 8, fontSize: 13, fontWeight: 700 }}
                              placeholder="Judul Lesson"
                            />
                          </Form.Group>

                          <Form.Group>
                            <Form.Control 
                              as="textarea" 
                              rows={3} 
                              value={les.body} 
                              onChange={(e) => handleEditLessonBody(mod.id, les.id, e.target.value)} 
                              style={{ borderRadius: 8, fontSize: 12, resize: 'none' }}
                              placeholder={les.content_type === 'video' ? 'Link Video URL' : 'Isi Artikel'}
                            />
                          </Form.Group>
                        </Card>
                      ))}

                      {/* Quiz list inside module */}
                      <hr className="my-4" />
                      <h6 className="fw-bold text-secondary mb-3 small d-flex align-items-center gap-1">
                        <HelpCircle size={14} /> SOAL EVALUASI KUIS
                      </h6>

                      {mod.quizzes.map((quiz, quizIdx) => (
                        <Card className="border p-3 mb-3 bg-white" style={{ borderRadius: 10, borderColor: '#cbd5e1' }} key={quiz.id}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-warning text-dark" style={{ fontSize: 9 }}>Kuis MC</span>
                            <span className="text-muted" style={{ fontSize: 11 }}>Soal {quizIdx + 1}</span>
                          </div>

                          <Form.Group className="mb-2">
                            <Form.Control 
                              type="text" 
                              value={quiz.question} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setModules(prev => prev.map(m => {
                                  if (m.id === mod.id) {
                                    return {
                                      ...m,
                                      quizzes: m.quizzes.map(q => q.id === quiz.id ? { ...q, question: val } : q)
                                    };
                                  }
                                  return m;
                                }));
                              }}
                              style={{ borderRadius: 8, fontSize: 13, fontWeight: 600 }}
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
                                    setModules(prev => prev.map(m => {
                                      if (m.id === mod.id) {
                                        return {
                                          ...m,
                                          quizzes: m.quizzes.map(q => {
                                            if (q.id === quiz.id) {
                                              const newOpts = [...q.options];
                                              newOpts[optIdx] = val;
                                              return { ...q, options: newOpts };
                                            }
                                            return q;
                                          })
                                        };
                                      }
                                      return m;
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
                                setModules(prev => prev.map(m => {
                                  if (m.id === mod.id) {
                                    return {
                                      ...m,
                                      quizzes: m.quizzes.map(q => q.id === quiz.id ? { ...q, correct: val } : q)
                                    };
                                  }
                                  return m;
                                }));
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

                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReviewPage;
