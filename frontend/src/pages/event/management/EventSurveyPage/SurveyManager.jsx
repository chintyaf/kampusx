import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Tabs, Tab } from 'react-bootstrap';
import { Plus, Trash2, GripVertical, BarChart3, Settings, Star, Users, TrendingUp, MessageSquare, Award, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const mockAnalytics = {
  totalResponses: 156,
  satisfaction: [
    { name: '5★', value: 89, fill: '#10b981' },
    { name: '4★', value: 45, fill: '#3b82f6' },
    { name: '3★', value: 15, fill: '#f59e0b' },
    { name: '2★', value: 5, fill: '#f97316' },
    { name: '1★', value: 2, fill: '#ef4444' },
  ],
  departmentData: [
    { department: 'Teknik Informatika', count: 45 },
    { department: 'Sistem Informasi', count: 38 },
    { department: 'Teknik Elektro', count: 28 },
    { department: 'Manajemen', count: 25 },
    { department: 'Lainnya', count: 20 },
  ],
  responseOverTime: [
    { time: '09:00', responses: 12 },
    { time: '10:00', responses: 28 },
    { time: '11:00', responses: 45 },
    { time: '12:00', responses: 67 },
    { time: '13:00', responses: 89 },
    { time: '14:00', responses: 124 },
    { time: '15:00', responses: 156 },
  ],
};

export default function SurveyManager() {
  const [activeTab, setActiveTab] = useState('checkout');
  const [viewMode, setViewMode] = useState('builder');
  const [modules, setModules] = useState({
    checkout: {
      id: 'checkout',
      name: 'Custom Checkout Question',
      description: 'Formulir tambahan yang wajib diisi peserta saat pendaftaran',
      isRequired: true,
      enabled: true,
      questions: [
        { id: '1', type: 'text', label: 'Nomor Induk Mahasiswa (NIM)', required: true },
        { id: '2', type: 'select', label: 'Jurusan', required: true, options: ['Teknik Informatika', 'Sistem Informasi', 'Teknik Elektro', 'Manajemen'] },
        { id: '3', type: 'select', label: 'Ukuran Baju', required: true, options: ['S', 'M', 'L', 'XL', 'XXL'] },
      ],
    },
    midEvent: {
      id: 'midEvent',
      name: 'Mid-Event Engagement Check',
      description: 'Checkpoint kehadiran yang muncul selama acara berlangsung',
      isRequired: true,
      enabled: false,
      questions: [
        { id: '1', type: 'radio', label: 'Apakah Anda masih mengikuti acara ini?', required: true, options: ['Ya, saya hadir', 'Tidak'] },
      ],
    },
    postEvent: {
      id: 'postEvent',
      name: 'Post-Event Feedback & Survey',
      description: 'Kuesioner kepuasan yang harus diisi untuk unlock sertifikat',
      isRequired: true,
      enabled: true,
      questions: [
        { id: '1', type: 'rating', label: 'Berikan rating untuk acara ini', required: true },
        { id: '2', type: 'textarea', label: 'Apa yang paling Anda sukai dari acara ini?', required: true },
        { id: '3', type: 'textarea', label: 'Saran untuk perbaikan acara berikutnya', required: false },
      ],
    },
  });

  const addQuestion = (moduleId) => {
    const newQuestion = { id: Date.now().toString(), type: 'text', label: 'Pertanyaan baru', required: false };
    setModules({ ...modules, [moduleId]: { ...modules[moduleId], questions: [...modules[moduleId].questions, newQuestion] } });
  };

  const deleteQuestion = (moduleId, questionId) => {
    setModules({ ...modules, [moduleId]: { ...modules[moduleId], questions: modules[moduleId].questions.filter(q => q.id !== questionId) } });
  };

  const updateQuestion = (moduleId, questionId, updates) => {
    setModules({ ...modules, [moduleId]: { ...modules[moduleId], questions: modules[moduleId].questions.map(q => q.id === questionId ? { ...q, ...updates } : q) } });
  };

  const toggleModuleRequired = (moduleId) => {
    setModules({ ...modules, [moduleId]: { ...modules[moduleId], isRequired: !modules[moduleId].isRequired } });
  };

  const toggleModuleEnabled = (moduleId) => {
    setModules({ ...modules, [moduleId]: { ...modules[moduleId], enabled: !modules[moduleId].enabled } });
  };

  const questionTypeIcons = { text: '📝', textarea: '📄', select: '📋', radio: '⚪', checkbox: '☑️', rating: '⭐' };

  const renderQuestionTypeSelector = (moduleId, question) => (
    <Form.Select
      value={question.type}
      onChange={(e) => updateQuestion(moduleId, question.id, { type: e.target.value })}
      className="w-auto border rounded-3 shadow-sm bg-white"
    >
      <option value="text">📝 Text Pendek</option>
      <option value="textarea">📄 Text Panjang</option>
      <option value="select">📋 Dropdown</option>
      <option value="radio">⚪ Pilihan Ganda</option>
      <option value="checkbox">☑️ Checkbox</option>
      <option value="rating">⭐ Rating Bintang</option>
    </Form.Select>
  );

  const renderFormBuilder = (module) => (
    <div className="d-flex flex-column gap-4">
      <div className="rounded-4 p-4 text-white shadow position-relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #8b5cf6, #d946ef)' }}>
        <div className="position-absolute rounded-circle" style={{ top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)' }}></div>
        
        <div className="position-relative d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3" style={{ zIndex: 1 }}>
          <div className="flex-grow-1">
            <Badge bg={module.enabled ? 'success' : 'secondary'} className="mb-3 d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2">
              <div className={`rounded-circle ${module.enabled ? 'bg-white' : 'bg-light'}`} style={{ width: '8px', height: '8px' }}></div>
              {module.enabled ? 'Aktif' : 'Nonaktif'}
            </Badge>
            <h3 className="fw-bold mb-2">{module.name}</h3>
            <p className="mb-0" style={{ color: 'rgba(255,255,255,0.9)' }}>{module.description}</p>
          </div>
          
          <div className="bg-white bg-opacity-25 rounded-4 p-3 d-flex align-items-center gap-3 backdrop-blur">
            <div className="text-end">
              <div className="small" style={{ color: 'rgba(255,255,255,0.8)' }}>Status</div>
              <div className="fw-medium">{module.enabled ? 'Enabled' : 'Disabled'}</div>
            </div>
            <Form.Check type="switch" checked={module.enabled} onChange={() => toggleModuleEnabled(module.id)} style={{ transform: 'scale(1.2)' }} />
          </div>
        </div>

        <Row className="g-3 position-relative" style={{ zIndex: 1 }}>
          <Col md={6}>
            <div className="bg-white bg-opacity-25 rounded-4 p-3 border border-light border-opacity-25 backdrop-blur h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-3">
                  <div className={`p-2 rounded-3 ${module.isRequired ? 'bg-success' : 'bg-secondary bg-opacity-50'}`}>
                    {module.isRequired ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  </div>
                  <div>
                    <div className="small">Requirement Status</div>
                    <div className="small" style={{ color: 'rgba(255,255,255,0.8)' }}>{module.isRequired ? 'Wajib diisi' : 'Opsional'}</div>
                  </div>
                </div>
                <Form.Check type="switch" checked={module.isRequired} onChange={() => toggleModuleRequired(module.id)} style={{ transform: 'scale(1.2)' }} />
              </div>
              {module.id === 'postEvent' && module.isRequired && (
                <div className="bg-white bg-opacity-10 rounded-3 p-2 small d-flex align-items-center gap-2">
                  <Award size={14} /> Sertifikat terkunci hingga survei selesai
                </div>
              )}
            </div>
          </Col>
          <Col md={6}>
            <div className="bg-white bg-opacity-25 rounded-4 p-3 border border-light border-opacity-25 backdrop-blur h-100">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="p-2 bg-white bg-opacity-25 rounded-3"><MessageSquare size={20} /></div>
                <div>
                  <div className="small">Total Pertanyaan</div>
                  <div className="small" style={{ color: 'rgba(255,255,255,0.8)' }}>Tersimpan dalam form</div>
                </div>
              </div>
              <h2 className="mb-0 fw-bold">{module.questions.length}</h2>
            </div>
          </Col>
        </Row>
      </div>

      <div className="d-flex flex-column gap-3">
        {module.questions.map((question, index) => (
          <Card key={question.id} className="border-2 shadow-sm rounded-4" style={{ transition: 'all 0.3s' }}>
            <Card.Body className="p-4 d-flex align-items-start gap-3">
              <Button variant="link" className="text-muted p-0 mt-2" style={{ cursor: 'move' }}>
                <GripVertical size={20} />
              </Button>
              <div className="flex-grow-1 d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <Badge bg="primary" className="rounded-pill px-3 py-2 d-flex align-items-center gap-2" style={{ background: 'linear-gradient(to right, #8b5cf6, #a855f7)' }}>
                    <span className="fs-6">{questionTypeIcons[question.type]}</span> Pertanyaan #{index + 1}
                  </Badge>
                  {renderQuestionTypeSelector(module.id, question)}
                  <div className="bg-light rounded-pill px-3 py-2 d-flex align-items-center gap-2 border">
                    <Form.Check type="checkbox" checked={question.required} onChange={(e) => updateQuestion(module.id, question.id, { required: e.target.checked })} className="m-0" />
                    <span className="small fw-medium">{question.required ? '🔒 Wajib' : '⚪ Opsional'}</span>
                  </div>
                </div>
                
                <Form.Control
                  type="text"
                  value={question.label}
                  onChange={(e) => updateQuestion(module.id, question.id, { label: e.target.value })}
                  placeholder="Tulis pertanyaan di sini..."
                  className="border-2 rounded-3 px-3 py-3 fs-5"
                />

                {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                  <div className="bg-light p-3 rounded-3 mt-2">
                    <Badge bg="primary-subtle" className="text-primary rounded-pill mb-2">Opsi Pilihan</Badge>
                    <Form.Control
                      as="textarea"
                      value={question.options?.join('\n') || ''}
                      onChange={(e) => updateQuestion(module.id, question.id, { options: e.target.value.split('\n') })}
                      placeholder={"Tulis setiap opsi di baris baru\nContoh:\nOpsi 1\nOpsi 2\nOpsi 3"}
                      rows={4}
                      className="border-2 rounded-3 shadow-none bg-white"
                    />
                  </div>
                )}
              </div>
              <Button variant="link" onClick={() => deleteQuestion(module.id, question.id)} className="text-muted p-2 hover-bg-danger-subtle hover-text-danger rounded-3">
                <Trash2 size={20} />
              </Button>
            </Card.Body>
          </Card>
        ))}
      </div>

      <Button
        variant="outline-secondary"
        onClick={() => addQuestion(module.id)}
        className="w-100 py-4 rounded-4 border-2 bg-white text-muted d-flex align-items-center justify-content-center gap-2"
        style={{ borderStyle: 'dashed' }}
      >
        <div className="p-2 rounded-circle bg-light"><Plus size={20} /></div>
        <span className="fs-5">Tambah Pertanyaan Baru</span>
      </Button>
    </div>
  );

  const renderAnalytics = () => (
    <div className="d-flex flex-column gap-4">
      {/* Sama seperti analytics sebelumnya, disederhanakan */}
      <div className="rounded-4 p-4 text-white shadow position-relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #10b981, #06b6d4)' }}>
        <div className="d-flex align-items-center gap-3 position-relative" style={{ zIndex: 1 }}>
          <div className="p-3 bg-white bg-opacity-25 rounded-3"><BarChart3 size={28} /></div>
          <div>
            <h3 className="mb-0 fw-bold">Hasil Survei & Analytics</h3>
            <p className="mb-0" style={{ color: 'rgba(255,255,255,0.9)' }}>Visualisasi data survei yang masuk secara real-time</p>
          </div>
        </div>
      </div>
      {/* Mocking stats layout */}
      <Row className="g-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 text-white p-3" style={{ background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)' }}>
            <div className="d-flex justify-content-between mb-3"><Users size={24} /> Total</div>
            <h2 className="mb-0 fw-bold">{mockAnalytics.totalResponses}</h2>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 text-white p-3" style={{ background: 'linear-gradient(to bottom right, #facc15, #f97316)' }}>
            <div className="d-flex justify-content-between mb-3"><Star size={24} /> Rating</div>
            <h2 className="mb-0 fw-bold">4.7</h2>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 text-white p-3" style={{ background: 'linear-gradient(to bottom right, #22c55e, #059669)' }}>
            <div className="d-flex justify-content-between mb-3"><TrendingUp size={24} /> Kepuasan</div>
            <h2 className="mb-0 fw-bold">94%</h2>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 text-white p-3" style={{ background: 'linear-gradient(to bottom right, #a855f7, #db2777)' }}>
            <div className="d-flex justify-content-between mb-3"><Clock size={24} /> Waktu</div>
            <h2 className="mb-0 fw-bold">2.5m</h2>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <Container fluid className="py-4 bg-light" style={{ minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="mb-4 d-flex align-items-center gap-3">
        <div className="p-3 rounded-4 shadow-sm text-white" style={{ background: 'linear-gradient(to bottom right, #8b5cf6, #9333ea)' }}>
          <Settings size={28} />
        </div>
        <div>
          <h2 className="mb-1 fw-bold text-dark">Survey Form Management</h2>
          <p className="mb-0 text-muted">Kelola formulir survei untuk berbagai tahap acara di KampusX</p>
        </div>
      </div>

      <div className="bg-white p-2 rounded-pill shadow-sm d-inline-flex gap-2 mb-4 border">
        <Button
          variant={viewMode === 'builder' ? 'primary' : 'light'}
          className={`rounded-pill d-flex align-items-center gap-2 px-4 py-2 border-0 ${viewMode === 'builder' ? 'shadow' : 'bg-white text-muted'}`}
          style={{ background: viewMode === 'builder' ? 'linear-gradient(to right, #8b5cf6, #9333ea)' : undefined }}
          onClick={() => setViewMode('builder')}
        >
          <Settings size={18} /> Form Builder
        </Button>
        <Button
          variant={viewMode === 'analytics' ? 'success' : 'light'}
          className={`rounded-pill d-flex align-items-center gap-2 px-4 py-2 border-0 ${viewMode === 'analytics' ? 'shadow' : 'bg-white text-muted'}`}
          style={{ background: viewMode === 'analytics' ? 'linear-gradient(to right, #10b981, #0d9488)' : undefined }}
          onClick={() => setViewMode('analytics')}
        >
          <BarChart3 size={18} /> Result Analytics
        </Button>
      </div>

      {viewMode === 'builder' ? (
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 border-0 gap-2 custom-tabs">
          <Tab eventKey="checkout" title={<span className="d-flex align-items-center gap-2 px-3 py-2"><span className="fs-5">📝</span> Checkout Question</span>}>
            <div className="mt-3">{renderFormBuilder(modules.checkout)}</div>
          </Tab>
          <Tab eventKey="midEvent" title={<span className="d-flex align-items-center gap-2 px-3 py-2"><span className="fs-5">✅</span> Mid-Event Check</span>}>
            <div className="mt-3">{renderFormBuilder(modules.midEvent)}</div>
          </Tab>
          <Tab eventKey="postEvent" title={<span className="d-flex align-items-center gap-2 px-3 py-2"><span className="fs-5">⭐</span> Post-Event Feedback</span>}>
            <div className="mt-3">{renderFormBuilder(modules.postEvent)}</div>
          </Tab>
        </Tabs>
      ) : (
        renderAnalytics()
      )}
    </Container>
  );
}
