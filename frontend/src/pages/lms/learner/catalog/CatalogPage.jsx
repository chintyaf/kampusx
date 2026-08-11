import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, ArrowRight, Award, BarChart2, CheckCircle2, Clock, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Badge } from 'react-bootstrap';

const CatalogPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');

  const modules = [
    {
      id: 1,
      tag: 'Design Thinking',
      title: 'Pengenalan Design Thinking untuk Pemula',
      desc: 'Pahami cara berpikir kreatif dan solutif untuk memecahkan masalah user secara mendalam.',
      duration: '12 min',
      lessons: 4,
      difficulty: 'Pemula',
      phase: 'Forethought',
      status: 'not_started',
      points: 50,
    },
    {
      id: 2,
      tag: 'Public Speaking',
      title: 'Teknik Presentasi yang Memukau Audiens',
      desc: 'Kuasai bahasa tubuh, intonasi suara, dan struktur presentasi untuk meyakinkan audiens Anda.',
      duration: '18 min',
      lessons: 6,
      difficulty: 'Menengah',
      phase: 'Performance',
      status: 'in_progress',
      points: 75,
    },
    {
      id: 3,
      tag: 'Leadership',
      title: 'Dasar-dasar Kepemimpinan Tim Efektif',
      desc: 'Pelajari cara mendelegasikan tugas, memberikan umpan balik, dan memotivasi anggota tim.',
      duration: '15 min',
      lessons: 5,
      difficulty: 'Pemula',
      phase: 'Self-Reflection',
      status: 'completed',
      points: 100,
    },
    {
      id: 4,
      tag: 'Produktivitas',
      title: 'Deep Work: Fokus Tanpa Distraksi Digital',
      desc: 'Temukan metode ilmiah untuk melatih fokus mendalam di era digital yang penuh gangguan.',
      duration: '10 min',
      lessons: 3,
      difficulty: 'Semua Tingkat',
      phase: 'Forethought',
      status: 'not_started',
      points: 40,
    },
  ];

  const topics = ['All', 'Design Thinking', 'Public Speaking', 'Leadership', 'Produktivitas'];

  const filteredModules = modules.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                          m.tag.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = selectedTopic === 'All' || m.tag === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Top Banner */}
      <div style={{ background: 'linear-gradient(135deg, #004e78 0%, #007ab5 100%)', color: '#fff', padding: '40px 0 60px' }}>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7dd3fc' }}>
                KampusX LMS
              </span>
              <h1 style={{ fontSize: 32, fontWeight: 800, margin: '8px 0 12px' }}>Katalog Micro-Learning</h1>
              <p style={{ margin: 0, fontSize: 16, color: 'rgba(255,255,255,0.85)', maxWidth: 600 }}>
                Tingkatkan keahlianmu dengan modul belajar terstruktur menggunakan metode Self-Regulated Learning (SRL).
              </p>
            </div>
            <Button 
              variant="light" 
              onClick={() => navigate('/')}
              style={{ fontWeight: 600, color: '#005a87', borderRadius: 10 }}
            >
              Kembali ke Dashboard
            </Button>
          </div>
        </Container>
      </div>

      <Container style={{ marginTop: -30 }}>
        <Row className="g-4">
          {/* Sidebar Filters */}
          <Col lg={3}>
            <Card style={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: 20 }}>
              <h5 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#0f172a' }}>Topik Belajar</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: 'none',
                      textAlign: 'left',
                      fontSize: 13,
                      fontWeight: selectedTopic === topic ? 700 : 500,
                      background: selectedTopic === topic ? '#f0f9ff' : 'transparent',
                      color: selectedTopic === topic ? '#00699e' : '#64748b',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{topic === 'All' ? 'Semua Topik' : topic}</span>
                    {selectedTopic === topic && <ChevronRight size={14} />}
                  </button>
                ))}
              </div>

              <hr style={{ margin: '20px 0', borderColor: '#e2e8f0' }} />

              <h5 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: '#0f172a' }}>Pencapaian</h5>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#f8fafc', borderRadius: 12 }}>
                <Award size={20} color="#f59e0b" />
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#0f172a' }}>3 Badge Terkumpul</p>
                  <p style={{ margin: 0, fontSize: 10, color: '#94a3b8' }}>Lihat pencapaian belajarmu</p>
                </div>
              </div>
            </Card>
          </Col>

          {/* Catalog Listings */}
          <Col lg={9}>
            {/* Search and Quick Continue Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Continue banner */}
              <Card style={{ 
                borderRadius: 16, 
                border: '1px solid #b9e7fe', 
                background: '#f0f9ff',
                padding: 16,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChart2 size={20} color="#00699e" />
                  </div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#00699e', textTransform: 'uppercase' }}>Lanjutkan Belajar</span>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Teknik Presentasi yang Memukau Audiens</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/learner/modules/2/forethought')}
                  style={{ background: '#005a87', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600 }}
                >
                  Lanjut Belajar <ArrowRight size={14} className="ms-1" />
                </Button>
              </Card>

              {/* Search Control */}
              <InputGroup style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <InputGroup.Text style={{ background: 'transparent', border: 'none', paddingLeft: 16 }}>
                  <Search size={18} color="#94a3b8" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Cari modul atau keahlian..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: 'none', fontSize: 14, padding: '12px 12px 12px 0', outline: 'none', boxShadow: 'none' }}
                />
              </InputGroup>

              {/* Modules Grid */}
              <Row className="g-3">
                {filteredModules.map((mod) => (
                  <Col md={6} key={mod.id}>
                    <Card style={{ 
                      borderRadius: 16, 
                      border: '1px solid #e2e8f0', 
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <Badge bg="light" text="dark" style={{ border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, color: '#0f172a' }}>
                            {mod.tag}
                          </Badge>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: 11 }}>
                            <Clock size={12} />
                            <span>{mod.duration}</span>
                          </div>
                        </div>

                        <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 8, lineHeight: 1.4 }}>
                          {mod.title}
                        </h4>
                        
                        <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                          {mod.desc}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                          <span>{mod.lessons} Pelajaran</span>
                          <span style={{ fontWeight: 600, color: '#047857' }}>+{mod.points} Poin</span>
                        </div>
                      </div>

                      <div style={{ padding: '0 20px 20px' }}>
                        <Button 
                          onClick={() => navigate(`/learner/modules/${mod.id}/forethought`)}
                          style={{
                            width: '100%',
                            background: mod.status === 'completed' ? '#16a34a' : '#005a87',
                            border: 'none',
                            borderRadius: 10,
                            padding: '10px',
                            fontWeight: 700,
                            fontSize: 13
                          }}
                        >
                          {mod.status === 'completed' ? 'Pelajari Lagi' : 'Mulai Modul'}
                        </Button>
                      </div>
                    </Card>
                  </Col>
                ))}
                {filteredModules.length === 0 && (
                  <Col xs={12}>
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                      <BookOpen size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
                      <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>Tidak ada modul yang cocok dengan pencarian Anda.</p>
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CatalogPage;
