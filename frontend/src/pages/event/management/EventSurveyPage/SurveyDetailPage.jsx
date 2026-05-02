import React, { useState } from 'react';
import { Container, Card, Button, Form, Badge } from 'react-bootstrap';
import {
  Plus, Trash2, GripVertical, CheckCircle2, ArrowLeft, Eye, Save,
  ToggleLeft, ToggleRight, Star, ChevronDown
} from 'lucide-react';

const questionTypeOptions = [
  { value: 'text', label: 'Text Pendek' },
  { value: 'textarea', label: 'Text Panjang' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Pilihan Ganda' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'rating', label: 'Rating Bintang' },
];

export default function SurveyDetailPage({ surveyId, onBack }) {
  const isNew = !surveyId;

  const [status, setStatus] = useState(isNew ? 'draft' : 'aktif');
  const [session, setSession] = useState(isNew ? '' : 'Sesi 1 - UI/UX Basic');

  const [questions, setQuestions] = useState(
    isNew
      ? [{ id: '1', type: 'rating', label: '', required: true }]
      : [
          { id: '1', type: 'rating', label: 'Berikan rating keseluruhan untuk acara ini', required: true },
          { id: '2', type: 'radio', label: 'Apakah sesi ini sesuai ekspektasi Anda?', required: true, options: ['Sangat sesuai', 'Cukup sesuai', 'Kurang sesuai', 'Tidak sesuai'] },
          { id: '3', type: 'textarea', label: 'Apa yang paling Anda sukai dari sesi ini?', required: true },
          { id: '4', type: 'textarea', label: 'Saran untuk perbaikan berikutnya', required: false },
        ]
  );

  const [editingOptions, setEditingOptions] = useState({});

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now().toString(),
      type: 'text',
      label: '',
      required: false,
    }]);
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, updates) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  return (
    <Container fluid className="py-4 bg-light" style={{ minHeight: '100vh', maxWidth: '800px', margin: '0 auto' }}>
      {/* Page top bar */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <Button variant="link" onClick={onBack} className="text-muted text-decoration-none d-flex align-items-center gap-2 p-0">
            <ArrowLeft size={18} /> Kembali
          </Button>
          <div className="border-start border-2 h-50 mx-1"></div>
          <h3 className="mb-0 fw-bold text-dark">{isNew ? 'Buat Survei Baru' : 'Detail Survei'}</h3>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button
            variant={status === 'aktif' ? 'success' : 'light'}
            onClick={() => setStatus(status === 'aktif' ? 'draft' : 'aktif')}
            className={`d-flex align-items-center gap-2 rounded-3 border ${status === 'aktif' ? 'bg-success-subtle text-success border-success-subtle' : 'text-muted'}`}
          >
            {status === 'aktif' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            {status === 'aktif' ? 'Aktif' : 'Draft'}
          </Button>
          <Button variant="light" className="d-flex align-items-center gap-2 rounded-3 border text-secondary bg-white">
            <Eye size={18} /> Preview
          </Button>
          <Button variant="primary" className="d-flex align-items-center gap-2 rounded-3">
            <Save size={18} /> Simpan
          </Button>
        </div>
      </div>

      {/* Sesi Terkait */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="d-flex align-items-center gap-4 p-4">
          <Form.Label className="text-muted small mb-0 flex-shrink-0 fw-medium">Sesi Terkait</Form.Label>
          <Form.Select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="border-0 border-bottom rounded-0 shadow-none px-0 text-dark"
          >
            <option value="">Semua Sesi / Berlaku untuk seluruh acara</option>
            <option value="Sesi 1 - UI/UX Basic">Sesi 1 – UI/UX Basic</option>
            <option value="Sesi 2 - Advanced Prototyping">Sesi 2 – Advanced Prototyping</option>
            <option value="Sesi 3 - Design System">Sesi 3 – Design System</option>
            <option value="Workshop A">Workshop A</option>
          </Form.Select>
        </Card.Body>
      </Card>

      {/* Pertanyaan */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div className="px-4 py-3 border-bottom bg-white d-flex align-items-center justify-content-between">
          <div>
            <div className="small text-muted text-uppercase fw-bold mb-1" style={{ letterSpacing: '1px' }}>Daftar Pertanyaan</div>
            <div className="small text-muted">{questions.length} pertanyaan · {questions.filter(q => q.required).length} wajib</div>
          </div>
        </div>

        <div className="d-flex flex-column">
          {questions.map((q, index) => (
            <div key={q.id} className="p-4 border-bottom bg-white" style={{ transition: 'background-color 0.2s' }}>
              <div className="d-flex align-items-start gap-3">
                <Button variant="link" className="text-secondary p-0 mt-2" style={{ cursor: 'move' }}>
                  <GripVertical size={20} />
                </Button>

                <div className="flex-grow-1">
                  {/* Controls row */}
                  <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                    <Badge bg="light" text="secondary" className="border rounded-pill">#{index + 1}</Badge>

                    <Form.Select
                      value={q.type}
                      onChange={(e) => updateQuestion(q.id, { type: e.target.value, options: undefined })}
                      className="w-auto rounded-pill border text-muted shadow-none py-1"
                      size="sm"
                    >
                      {questionTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Form.Select>

                    <Form.Check
                      type="switch"
                      id={`required-switch-${q.id}`}
                      label="Wajib"
                      checked={q.required}
                      onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                      className="ms-auto text-muted small mb-0"
                    />

                    <Button
                      variant="link"
                      onClick={() => deleteQuestion(q.id)}
                      className="text-secondary p-1"
                      onMouseEnter={(e) => e.currentTarget.classList.replace('text-secondary', 'text-danger')}
                      onMouseLeave={(e) => e.currentTarget.classList.replace('text-danger', 'text-secondary')}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  {/* Question label input */}
                  <Form.Control
                    type="text"
                    value={q.label}
                    onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                    placeholder="Tulis pertanyaan di sini..."
                    className="border-0 border-bottom rounded-0 px-0 shadow-none fw-medium text-dark bg-transparent"
                    style={{ fontSize: '1.1rem' }}
                  />

                  {/* Rating preview */}
                  {q.type === 'rating' && (
                    <div className="mt-3 d-flex align-items-center gap-2">
                      <div className="d-flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div key={star} className="bg-warning-subtle rounded text-warning d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                            <Star size={20} className="fill-warning" />
                          </div>
                        ))}
                      </div>
                      <span className="small text-muted ms-2">Skala 1 – 5 bintang</span>
                    </div>
                  )}

                  {/* Options */}
                  {(q.type === 'select' || q.type === 'radio' || q.type === 'checkbox') && (
                    <div className="mt-3">
                      <div className="small text-muted mb-2">Tulis setiap opsi di baris baru:</div>
                      <Form.Control
                        as="textarea"
                        value={editingOptions[q.id] !== undefined ? editingOptions[q.id] : (q.options?.join('\n') || '')}
                        onChange={(e) => {
                          setEditingOptions({ ...editingOptions, [q.id]: e.target.value });
                          updateQuestion(q.id, { options: e.target.value.split('\n').filter(o => o.trim()) });
                        }}
                        onFocus={() => setEditingOptions({ ...editingOptions, [q.id]: q.options?.join('\n') || '' })}
                        placeholder={"Opsi 1\nOpsi 2\nOpsi 3"}
                        rows={3}
                        className="rounded-3 shadow-none border bg-light"
                      />
                    </div>
                  )}

                  {/* Text preview */}
                  {(q.type === 'text' || q.type === 'textarea') && (
                    <div
                      className={`mt-3 border rounded-3 d-flex align-items-center px-3 small text-muted bg-light ${q.type === 'textarea' ? 'py-4' : 'py-2'}`}
                      style={{ borderStyle: 'dashed' }}
                    >
                      {q.type === 'text' ? 'Input teks singkat...' : 'Input teks panjang (paragraf)...'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white border-top">
          <Button
            variant="outline-primary"
            onClick={addQuestion}
            className="w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2 border-2 text-secondary bg-white"
            style={{ borderStyle: 'dashed' }}
            onMouseEnter={(e) => e.currentTarget.classList.replace('text-secondary', 'text-primary')}
            onMouseLeave={(e) => e.currentTarget.classList.replace('text-primary', 'text-secondary')}
          >
            <Plus size={18} /> Tambah Pertanyaan
          </Button>
        </div>
      </Card>

      {/* Bottom actions */}
      <div className="d-flex align-items-center justify-content-between py-2 mb-5">
        <Button variant="link" onClick={onBack} className="text-muted text-decoration-none p-0">
          Batal
        </Button>
        <div className="d-flex align-items-center gap-3">
          <Button variant="light" className="d-flex align-items-center gap-2 rounded-3 border text-secondary bg-white shadow-sm">
            <Eye size={18} /> Preview Survei
          </Button>
          <Button variant="primary" className="d-flex align-items-center gap-2 rounded-3 shadow-sm">
            <Save size={18} /> {isNew ? 'Buat Survei' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>
    </Container>
  );
}
