import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Compass, Sparkles, BookOpen, MapPin, Tag, ChevronRight, User } from 'lucide-react';
import toast from 'react-hot-toast';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [prodi, setProdi] = useState('Sistem Informasi');
  const [campusLocation, setCampusLocation] = useState('Bandung Campus');
  const [selectedInterests, setSelectedInterests] = useState(['Design Thinking', 'Public Speaking']);

  const interestOptions = [
    'Design Thinking',
    'Public Speaking',
    'Leadership',
    'Produktivitas',
    'Artificial Intelligence',
    'Web Development'
  ];

  const handleInterestToggle = (topic) => {
    if (selectedInterests.includes(topic)) {
      setSelectedInterests(prev => prev.filter(t => t !== topic));
    } else {
      setSelectedInterests(prev => [...prev, topic]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (selectedInterests.length === 0) {
      toast.error('Harap pilih minimal satu topik minat belajar Anda!');
      return;
    }
    toast.success('Profil belajar terpersonalisasi berhasil disimpan!');
    navigate('/learner/catalog');
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '40px 0' }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            
            {/* Header branding */}
            <div className="text-center mb-4">
              <div className="bg-primary-subtle rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3" style={{ width: 64, height: 64 }}>
                <Compass size={32} className="text-primary" />
              </div>
              <h2 className="fw-extrabold text-dark mb-1">Personalisasi Jalur Belajarmu</h2>
              <p className="text-muted small mb-0" style={{ maxWidth: 450, margin: '0 auto' }}>
                Chintya AI Engine akan merekomendasikan modul micro-learning yang relevan berdasarkan bidang prodi, domisili kampus, dan minat keahlian Anda.
              </p>
            </div>

            {/* Onboarding personalization card */}
            <Card className="border-0 shadow-sm rounded-4 p-4" style={{ background: '#fff' }}>
              <Form onSubmit={handleSave}>
                <Row className="g-3 mb-4">
                  
                  {/* Prodi */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold small text-secondary d-flex align-items-center gap-1">
                        <User size={14} /> Program Studi
                      </Form.Label>
                      <Form.Select 
                        value={prodi} 
                        onChange={(e) => setProdi(e.target.value)} 
                        style={{ borderRadius: 10, fontSize: 13, padding: '12px 16px' }}
                      >
                        <option value="Sistem Informasi">Sistem Informasi</option>
                        <option value="Teknik Informatika">Teknik Informatika</option>
                        <option value="Manajemen Bisnis">Manajemen Bisnis</option>
                        <option value="Ilmu Komunikasi">Ilmu Komunikasi</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* Campus Location */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold small text-secondary d-flex align-items-center gap-1">
                        <MapPin size={14} /> Domisili Kampus
                      </Form.Label>
                      <Form.Select 
                        value={campusLocation} 
                        onChange={(e) => setCampusLocation(e.target.value)} 
                        style={{ borderRadius: 10, fontSize: 13, padding: '12px 16px' }}
                      >
                        <option value="Bandung Campus">Bandung Campus (Jalan Ganesha)</option>
                        <option value="Jakarta Campus">Jakarta Campus (Jalan Sudirman)</option>
                        <option value="Surabaya Campus">Surabaya Campus (Jalan Manyar)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                </Row>

                {/* Interest Topics tag selector */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small text-secondary d-flex align-items-center gap-1 mb-2">
                    <Tag size={14} /> Pilih Topik Minat Belajar (Interest Topics)
                  </Form.Label>
                  
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {interestOptions.map(topic => {
                      const isSelected = selectedInterests.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => handleInterestToggle(topic)}
                          style={{
                            border: isSelected ? '1px solid #00699e' : '1px solid #cbd5e1',
                            background: isSelected ? '#f0f9ff' : '#fff',
                            color: isSelected ? '#00699e' : '#64748b',
                            padding: '8px 16px',
                            borderRadius: 20,
                            fontSize: 12.5,
                            fontWeight: isSelected ? 700 : 500,
                            transition: 'all 0.15s ease',
                            cursor: 'pointer'
                          }}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                  <Form.Text className="text-muted small">
                    Pilih minimal satu topik untuk menyusun rekomendasi di katalog belajar.
                  </Form.Text>
                </Form.Group>

                <hr className="my-4" />

                {/* Action controls */}
                <div className="d-flex gap-3 justify-content-end">
                  <Button 
                    type="submit" 
                    style={{ 
                      background: '#005a87', 
                      border: 'none', 
                      borderRadius: 10, 
                      padding: '12px 30px', 
                      fontWeight: 700, 
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    Simpan & Mulai Eksplor Modul <ChevronRight size={16} />
                  </Button>
                </div>

              </Form>
            </Card>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OnboardingPage;
