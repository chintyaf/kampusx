import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, InputGroup } from 'react-bootstrap';
import {
  Menu, Home, Calendar, Users, FileText, Award, Package, BarChart3,
  Megaphone, ChevronDown, ChevronRight, Bell, Plus,
  MessageSquare, CheckCircle2, Search, Star, CheckCheck
} from 'lucide-react';
import SurveyDetailPage from './SurveyDetailPage';

const surveysData = [
  { id: '1', title: 'Sesi 1 – UI/UX Basic', description: 'Rating pembicara dan materi untuk sesi UI/UX Basic', status: 'aktif', responses: 138, completionRate: 84, avgRating: 4.4, session: 'Sesi 1 – UI/UX Basic', createdAt: '15 Mar 2026' },
  { id: '2', title: 'Sesi 2 – Advanced Prototyping', description: 'Feedback khusus untuk kualitas pembicara dan metode penyampaian', status: 'aktif', responses: 45, completionRate: 71, avgRating: 4.1, session: 'Sesi 2 – Advanced Prototyping', createdAt: '15 Mar 2026' },
  { id: '3', title: 'Feedback Umum Event', description: 'Survei keseluruhan event dan pengalaman peserta secara umum', status: 'draft', responses: 0, completionRate: 0, avgRating: null, session: null, createdAt: '20 Mar 2026' },
];

export default function SurveyManagementPage() {
  const [filter, setFilter] = useState('semua');
  const [search, setSearch] = useState('');
  const [currentView, setCurrentView] = useState('list');
  const [selectedSurveyId, setSelectedSurveyId] = useState(undefined);

  const totalSurveys = surveysData.length;
  const aktifCount = surveysData.filter(s => s.status === 'aktif').length;
  const draftCount = surveysData.filter(s => s.status === 'draft').length;
  const totalResponses = surveysData.reduce((a, s) => a + s.responses, 0);

  const filtered = surveysData.filter(s => {
    const matchFilter = filter === 'semua' || s.status === filter;
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (currentView === 'detail' || currentView === 'new') {
    return (
      <SurveyDetailPage
        surveyId={currentView === 'detail' ? selectedSurveyId : undefined}
        onBack={() => { setCurrentView('list'); setSelectedSurveyId(undefined); }}
      />
    );
  }

  return (
    <Container fluid className="py-4 bg-light" style={{ minHeight: '100vh' }}>
      <div className="mb-4">
        <div className="d-flex align-items-start justify-content-between mb-4">
          <div>
            <h2 className="text-dark fw-bold mb-1">Pengaturan Feedback & Survei</h2>
            <p className="text-muted small mb-0">
              Buat dan kelola form feedback untuk mengumpulkan penilaian peserta
            </p>
          </div>
          <Button
            variant="primary"
            className="d-flex align-items-center gap-2 rounded-3"
            onClick={() => { setSelectedSurveyId(undefined); setCurrentView('new'); }}
          >
            <Plus size={18} /> Buat Survei Baru
          </Button>
        </div>

        {/* Stats Cards */}
        <Row className="g-3 mb-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary-subtle rounded-3 p-3 text-primary">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{totalSurveys}</h3>
                  <div className="text-muted small">Total Survei</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-success-subtle rounded-3 p-3 text-success">
                  <CheckCheck size={24} />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">
                    {aktifCount} <span className="fs-6 text-muted fw-normal">aktif</span> <span className="text-muted">/</span> {draftCount} <span className="fs-6 text-muted fw-normal">draft</span>
                  </h3>
                  <div className="text-muted small">Status Survei</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-warning-subtle rounded-3 p-3 text-warning">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{totalResponses}</h3>
                  <div className="text-muted small">Total Respons Terkumpul</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Search & Filter */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <InputGroup className="flex-grow-1 shadow-sm rounded-3 overflow-hidden">
            <InputGroup.Text className="bg-white border-0 text-muted"><Search size={18} /></InputGroup.Text>
            <Form.Control
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari survei..."
              className="border-0 shadow-none bg-white"
            />
          </InputGroup>
          <div className="d-flex bg-white rounded-3 shadow-sm overflow-hidden border">
            {['semua', 'aktif', 'draft'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'primary' : 'light'}
                className={`border-0 rounded-0 text-capitalize px-4 ${filter === f ? 'text-white' : 'text-muted bg-white'}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Survey List */}
        <div className="d-flex flex-column gap-3">
          {filtered.map((survey) => (
            <Card
              key={survey.id}
              className="border-0 shadow-sm rounded-4 overflow-hidden"
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.classList.add('shadow')}
              onMouseLeave={(e) => e.currentTarget.classList.remove('shadow')}
              onClick={() => { setSelectedSurveyId(survey.id); setCurrentView('detail'); }}
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-start gap-3">
                  <div className={`p-3 rounded-3 ${survey.status === 'aktif' ? 'bg-primary-subtle text-primary' : 'bg-light text-secondary'}`}>
                    <MessageSquare size={20} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h5 className="mb-0 text-dark fw-bold">{survey.title}</h5>
                      {survey.status === 'aktif' ? (
                        <Badge bg="success-subtle" className="text-success rounded-pill d-flex align-items-center gap-1">
                          <CheckCircle2 size={12} /> Aktif
                        </Badge>
                      ) : (
                        <Badge bg="light" className="text-secondary border rounded-pill text-dark">Draft</Badge>
                      )}
                    </div>
                    <p className="text-muted small mb-3">{survey.description}</p>
                    
                    {survey.responses > 0 ? (
                      <div className="d-flex align-items-center gap-3 small text-muted flex-wrap">
                        <div className="d-flex align-items-center gap-1"><Users size={14} /> {survey.responses} respons</div>
                        <div className="d-flex align-items-center gap-1"><CheckCircle2 size={14} /> {survey.completionRate}% selesai</div>
                        {survey.avgRating !== null && (
                          <div className="d-flex align-items-center gap-1 text-warning fw-medium"><Star size={14} className="fill-warning text-warning" /> {survey.avgRating} avg</div>
                        )}
                        {survey.session && (
                          <Badge bg="primary-subtle" className="text-primary rounded-pill fw-normal">{survey.session}</Badge>
                        )}
                      </div>
                    ) : (
                      <div className="d-flex align-items-center gap-1 small text-muted"><Users size={14} /> 0 respons</div>
                    )}
                  </div>
                  <div className="text-muted mt-2">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </Card.Body>
              <div className="bg-light px-4 py-2 border-top">
                <span className="small text-muted">Dibuat {survey.createdAt}</span>
              </div>
            </Card>
          ))}

          {filtered.length === 0 && (
            <Card className="border-0 shadow-sm rounded-4 text-center p-5">
              <div className="d-flex justify-content-center mb-3">
                <div className="p-3 bg-light rounded-circle text-muted">
                  <MessageSquare size={32} />
                </div>
              </div>
              <p className="text-muted mb-0">Tidak ada survei ditemukan</p>
            </Card>
          )}
        </div>
      </div>
    </Container>
  );
}
