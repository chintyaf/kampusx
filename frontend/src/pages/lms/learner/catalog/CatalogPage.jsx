import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, ArrowRight, Award, BarChart2, CheckCircle2, Clock, Sparkles, Filter, ChevronRight, Compass, MapPin } from 'lucide-react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Badge } from 'react-bootstrap';
import { MOCK_LEARNING_PATHS } from '@/data/mockMicrolearningData';
import api from '@/api/axios';

const CatalogPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [dbProgress, setDbProgress] = useState({});

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/srl/progress');
          if (response.data && response.data.success) {
            setDbProgress(response.data.progress);
          }
        }
      } catch (err) {
        console.error('Failed to fetch SRL progress:', err);
      }
    };
    fetchProgress();
  }, []);

  const getModuleStatus = (id) => {
    if (dbProgress && dbProgress[id]) {
      return dbProgress[id].status;
    }
    const localPlanned = localStorage.getItem(`lms_planned_${id}`) === 'true';
    if (localPlanned) return 'in_progress';
    if (id === 2) return 'in_progress';
    return 'not_started';
  };

  const getModuleProgress = (id) => {
    if (dbProgress && dbProgress[id]) {
      return dbProgress[id].progress_percentage;
    }
    if (id === 2) return 60;
    return 0;
  };

  const handleModuleClick = (id) => {
    const status = getModuleStatus(id);
    const progress = getModuleProgress(id);
    if (progress > 0 || status === 'in_progress' || status === 'completed') {
      navigate(`/learner/modules/${id}`);
    } else {
      navigate(`/learner/modules/${id}/goals`);
    }
  };

  // Member personalization info
  const memberProfile = {
    prodi: 'Sistem Informasi',
    interests: 'UI/UX Design, Public Speaking',
    location: 'Bandung Campus'
  };

  const topics = ['All', 'Design', 'Speaking', 'Leadership', 'Productivity'];

  const filteredModules = MOCK_LEARNING_PATHS.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                          m.category.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = selectedTopic === 'All' || m.category === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  // Profil-based recommendation: matching either category with interests
  const recommendedPaths = MOCK_LEARNING_PATHS.filter(m => 
    memberProfile.interests.toLowerCase().includes(m.category.toLowerCase())
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Top Banner */}
      <div style={{ background: 'linear-gradient(135deg, #004e78 0%, #007ab5 100%)', color: '#fff', padding: '40px 0 50px' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <span className="badge bg-info mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                KampusX LMS
              </span>
              <h1 className="fw-extrabold mb-2" style={{ fontSize: 30 }}>Katalog Micro-Learning</h1>
              <p className="text-white-50 mb-0 small" style={{ maxWidth: 600 }}>
                Tingkatkan kompetensi harian dengan model belajar ringkas terstruktur (Self-Regulated Learning).
              </p>
            </div>
            <Button 
              variant="light" 
              onClick={() => navigate('/')}
              style={{ fontWeight: 700, color: '#005a87', borderRadius: 10, fontSize: 13 }}
            >
              Kembali ke Beranda
            </Button>
          </div>
        </Container>
      </div>

      <Container style={{ marginTop: -24 }}>
        <Row className="g-4">
          
          {/* Sidebar Profil & Onboarding Summary */}
          <Col lg={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3 mb-4" style={{ background: '#fff' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <Compass size={18} className="text-primary" />
                <h6 className="fw-extrabold mb-0 text-dark" style={{ fontSize: 13 }}>Personalized Profil</h6>
              </div>
              
              <div className="bg-light rounded-3 p-3 mb-3" style={{ fontSize: 12 }}>
                <div className="mb-2">
                  <span className="text-muted block mb-1">PRODI</span>
                  <p className="fw-bold mb-0 text-dark">{memberProfile.prodi}</p>
                </div>
                <div className="mb-2">
                  <span className="text-muted block mb-1">MINAT BELAJAR</span>
                  <p className="fw-bold mb-0 text-dark">{memberProfile.interests}</p>
                </div>
                <div>
                  <span className="text-muted block mb-1">LOKASI KAMPUS</span>
                  <p className="fw-bold mb-0 text-dark d-flex align-items-center gap-1">
                    <MapPin size={12} className="text-danger" /> {memberProfile.location}
                  </p>
                </div>
              </div>

              <Button 
                variant="outline-primary"
                size="sm"
                onClick={() => navigate('/learner/onboarding')}
                className="w-100 fw-bold"
                style={{ borderRadius: 8, fontSize: 11 }}
              >
                Ubah Minat Belajar
              </Button>
            </Card>

            {/* Topics Filter */}
            <Card className="border-0 shadow-sm rounded-4 p-3" style={{ background: '#fff' }}>
              <h6 className="fw-extrabold mb-3 text-secondary" style={{ fontSize: 11 }}>TOPIK UTAMA</h6>
              <div className="d-flex flex-column gap-1">
                {topics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: 'none',
                      textAlign: 'left',
                      fontSize: 12.5,
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
            </Card>
          </Col>

          {/* Catalog Listings */}
          <Col lg={9}>
            
            {/* Dynamic Next-Module SRL continuation Banner */}
            <Card className="border-0 shadow-sm rounded-4 p-3 mb-4" style={{ 
              background: '#f0fdf4',
              border: '1px solid #bbf7d0'
            }}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-success rounded-3 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                    <BarChart2 size={20} color="#fff" />
                  </div>
                  <div>
                    <span className="badge bg-success mb-1" style={{ fontSize: 9 }}>STRATEGI SRL AKTIF</span>
                    <h6 className="fw-extrabold mb-0 text-dark" style={{ fontSize: 13.5 }}>
                      Lanjutkan Modul: Teknik Presentasi yang Memukau Audiens
                    </h6>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/learner/modules/2')}
                  className="d-flex align-items-center gap-1 border-0"
                  style={{ background: '#16a34a', color: '#fff', borderRadius: 10, fontSize: 12, fontWeight: 700 }}
                >
                  Lanjutkan Belajar <ArrowRight size={14} />
                </Button>
              </div>
            </Card>

            {/* Profile-Based Personalized Recommendation Carousel/Grid */}
            <div className="mb-4">
              <h5 className="fw-extrabold mb-3 text-dark d-flex align-items-center gap-2" style={{ fontSize: 16 }}>
                <Sparkles size={18} className="text-warning" /> Rekomendasi Berbasis Minat & Prodi Anda
              </h5>
              <Row className="g-3">
                {recommendedPaths.map(path => (
                  <Col md={6} key={'rec-' + path.id}>
                    <Card 
                      className="border-0 shadow-sm rounded-4 overflow-hidden h-100 d-flex flex-column" 
                      style={{ background: '#fff', border: '1px solid #f1f5f9' }}
                    >
                      {/* Card Thumbnail Image */}
                      <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden' }}>
                        <img 
                          src={path.thumbnail} 
                          alt={path.title} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        {/* Category Badge top-left */}
                        <div style={{ position: 'absolute', top: 12, left: 12 }}>
                          <span 
                            style={{
                              background: path.category.toLowerCase() === 'design' ? '#f5f3ff' : path.category.toLowerCase() === 'productivity' ? '#e6f4ea' : '#fffbf0',
                              color: path.category.toLowerCase() === 'design' ? '#7c3aed' : path.category.toLowerCase() === 'productivity' ? '#137333' : '#d97706',
                              fontWeight: 800,
                              fontSize: 10,
                              padding: '4px 10px',
                              borderRadius: 6,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}
                          >
                            {path.category}
                          </span>
                        </div>
                        {/* Points Reward Badge top-right */}
                        <div style={{ position: 'absolute', top: 12, right: 12 }}>
                          <span 
                            style={{
                              background: '#fffbf0',
                              color: '#d97706',
                              border: '1px solid #fde68a',
                              fontWeight: 700,
                              fontSize: 11,
                              padding: '4px 10px',
                              borderRadius: 20,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            +{path.points_reward || 50} Poin
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <Card.Body className="p-3 d-flex flex-column justify-content-between" style={{ flex: 1 }}>
                        <div>
                          {/* Title */}
                          <h6 
                            className="fw-bold mb-2 text-dark" 
                            style={{ fontSize: 14.5, lineHeight: 1.4, minHeight: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                          >
                            {path.title}
                          </h6>
                          {/* Details line */}
                          <div className="d-flex align-items-center gap-1 text-muted mb-3" style={{ fontSize: 11.5 }}>
                            <span style={{ textTransform: 'capitalize' }}>{path.difficulty_level || 'beginner'}</span>
                            <span>•</span>
                            <span>Total {path.id === 1 ? '12' : path.id === 2 ? '13' : path.id === 3 ? '12' : '10'} Min</span>
                            <span>•</span>
                            <span>{path.modules[0].lessons.length} Lesson</span>
                          </div>
                        </div>

                        {/* Instructor Row */}
                        <div className="d-flex align-items-center gap-2 mb-3 pt-2 border-top border-light">
                          <img 
                            src={path.id === 1 ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' : 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'} 
                            alt="Instructor" 
                            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span className="small fw-semibold text-secondary" style={{ fontSize: 12 }}>
                            {path.id === 1 ? 'Sarah Wijaya' : path.id === 2 ? 'Fahri Hamzah' : path.id === 3 ? 'Budi Utomo' : 'Rina Kartika'}
                          </span>
                        </div>

                        {/* Action Button */}
                        <Button 
                          onClick={() => handleModuleClick(path.id)}
                          className="w-100 py-2 border-0"
                          style={{
                            background: '#005a87',
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 12
                          }}
                        >
                          {getModuleStatus(path.id) === 'completed' ? 'Pelajari Lagi' : getModuleStatus(path.id) === 'in_progress' ? 'Lanjutkan Modul' : 'Mulai Modul'}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Standard Catalog Listing */}
            <div>
              <h5 className="fw-extrabold mb-3 text-dark" style={{ fontSize: 16 }}>Semua Modul Pembelajaran</h5>
              
              {/* Search Control */}
              <InputGroup className="mb-3 border rounded-3 overflow-hidden" style={{ background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <InputGroup.Text style={{ background: 'transparent', border: 'none' }}>
                  <Search size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Cari modul atau topik..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: 'none', fontSize: 13, outline: 'none', boxShadow: 'none' }}
                />
              </InputGroup>

              {/* Grid */}
              <Row className="g-3">
                {filteredModules.map((mod) => (
                  <Col md={6} key={mod.id}>
                    <Card 
                      className="border-0 shadow-sm rounded-4 overflow-hidden h-100 d-flex flex-column" 
                      style={{ background: '#fff', border: '1px solid #f1f5f9' }}
                    >
                      {/* Card Thumbnail Image */}
                      <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden' }}>
                        <img 
                          src={mod.thumbnail} 
                          alt={mod.title} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        {/* Category Badge top-left */}
                        <div style={{ position: 'absolute', top: 12, left: 12 }}>
                          <span 
                            style={{
                              background: mod.category.toLowerCase() === 'design' ? '#f5f3ff' : mod.category.toLowerCase() === 'productivity' ? '#e6f4ea' : '#fffbf0',
                              color: mod.category.toLowerCase() === 'design' ? '#7c3aed' : mod.category.toLowerCase() === 'productivity' ? '#137333' : '#d97706',
                              fontWeight: 800,
                              fontSize: 10,
                              padding: '4px 10px',
                              borderRadius: 6,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}
                          >
                            {mod.category}
                          </span>
                        </div>
                        {/* Points Reward Badge top-right */}
                        <div style={{ position: 'absolute', top: 12, right: 12 }}>
                          <span 
                            style={{
                              background: '#fffbf0',
                              color: '#d97706',
                              border: '1px solid #fde68a',
                              fontWeight: 700,
                              fontSize: 11,
                              padding: '4px 10px',
                              borderRadius: 20,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            +{mod.points_reward} Poin
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <Card.Body className="p-3 d-flex flex-column justify-content-between" style={{ flex: 1 }}>
                        <div>
                          {/* Title */}
                          <h6 
                            className="fw-bold mb-2 text-dark" 
                            style={{ fontSize: 14.5, lineHeight: 1.4, minHeight: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                          >
                            {mod.title}
                          </h6>
                          {/* Details line */}
                          <div className="d-flex align-items-center gap-1 text-muted mb-3" style={{ fontSize: 11.5 }}>
                            <span style={{ textTransform: 'capitalize' }}>{mod.difficulty_level}</span>
                            <span>•</span>
                            <span>Total {mod.id === 1 ? '12' : mod.id === 2 ? '13' : mod.id === 3 ? '12' : '10'} Min</span>
                            <span>•</span>
                            <span>{mod.modules[0].lessons.length} Lesson</span>
                          </div>
                        </div>

                        {/* Instructor Row */}
                        <div className="d-flex align-items-center gap-2 mb-3 pt-2 border-top border-light">
                          <img 
                            src={mod.id === 1 ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' : 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'} 
                            alt="Instructor" 
                            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span className="small fw-semibold text-secondary" style={{ fontSize: 12 }}>
                            {mod.id === 1 ? 'Sarah Wijaya' : mod.id === 2 ? 'Fahri Hamzah' : mod.id === 3 ? 'Budi Utomo' : 'Rina Kartika'}
                          </span>
                        </div>

                        {/* Action Button */}
                        <Button 
                          onClick={() => handleModuleClick(mod.id)}
                          className="w-100 py-2 border-0"
                          style={{
                            background: '#005a87',
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 12
                          }}
                        >
                          {getModuleStatus(mod.id) === 'completed' ? 'Pelajari Lagi' : getModuleStatus(mod.id) === 'in_progress' ? 'Lanjutkan Modul' : 'Mulai Modul'}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CatalogPage;
