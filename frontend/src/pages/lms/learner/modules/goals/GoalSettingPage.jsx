import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, ProgressBar, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Brain, ArrowRight, Target, Clock, ShieldAlert, Sparkles, ChevronLeft, X, HelpCircle } from 'lucide-react';
import { MOCK_LEARNING_PATHS } from '@/data/mockMicrolearningData';
import api from '@/api/axios';
import toast from 'react-hot-toast';

const GoalSettingPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Pre-populate with saved default preference if available, otherwise fallback to defaults
  const [sessionGoal, setSessionGoal] = useState(localStorage.getItem('lms_default_goal') || '');
  const [focusStrategy, setFocusStrategy] = useState(localStorage.getItem('lms_default_strategy') || 'Teknik Pomodoro (25 menit belajar, 5 menit istirahat)');
  const [estimatedTime, setEstimatedTime] = useState(Number(localStorage.getItem('lms_default_time')) || 25);
  const [confidence, setConfidence] = useState(Number(localStorage.getItem('lms_default_confidence')) || 3);
  const [useDefaults, setUseDefaults] = useState(localStorage.getItem('lms_use_defaults') === 'true');

  // Helper info about module
  const learningPath = MOCK_LEARNING_PATHS.find(p => p.id === Number(moduleId)) || MOCK_LEARNING_PATHS[0];

  useEffect(() => {
    const checkSkipStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get(`/srl/status/${moduleId}`);
          if (response.data && response.data.success) {
            const { is_planned, progress } = response.data;
            if (is_planned || (progress && (progress.status === 'in_progress' || progress.status === 'completed'))) {
              navigate(`/learner/modules/${moduleId}`, { replace: true });
              return;
            }
          }
        } else {
          const isPlanned = localStorage.getItem(`lms_planned_${moduleId}`) === 'true';
          if (isPlanned) {
            navigate(`/learner/modules/${moduleId}`, { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error('Failed to check SRL status:', err);
        const isPlanned = localStorage.getItem(`lms_planned_${moduleId}`) === 'true';
        if (isPlanned) {
          navigate(`/learner/modules/${moduleId}`, { replace: true });
          return;
        }
      }

      // Auto-skip and save defaults if useDefaults is enabled
      const useDefaultsPref = localStorage.getItem('lms_use_defaults') === 'true';
      if (useDefaultsPref) {
        const defaultGoal = localStorage.getItem('lms_default_goal') || 'Paham konsep dasar';
        const defaultTime = localStorage.getItem('lms_default_time') || '25';
        const defaultConfidence = localStorage.getItem('lms_default_confidence') || '3';

        try {
          const token = localStorage.getItem('token');
          if (token) {
            await api.post('/srl/forethought', {
              moduleId: Number(moduleId),
              learning_goals: defaultGoal,
              estimated_time_minutes: Number(defaultTime),
            });
          }
        } catch (err) {
          console.error('Failed to save auto-skip forethought to backend:', err);
        }

        localStorage.setItem(`lms_planned_${moduleId}`, 'true');
        localStorage.setItem(`lms_goal_${moduleId}`, defaultGoal);
        localStorage.setItem(`lms_strategy_${moduleId}`, focusStrategy);
        localStorage.setItem(`lms_time_${moduleId}`, defaultTime);
        localStorage.setItem(`lms_confidence_${moduleId}`, defaultConfidence);

        navigate(`/learner/modules/${moduleId}`, { replace: true });
        return;
      }

      setLoading(false);
    };

    checkSkipStatus();

    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      #srl-info-tooltip .tooltip-inner {
        background: #ffffff !important;
        color: #334155 !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 8px !important;
        padding: 10px 14px !important;
        font-family: inherit !important;
        font-size: 11px !important;
        line-height: 1.5 !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
        text-align: left !important;
        max-width: 260px !important;
      }
      #srl-info-tooltip .tooltip-arrow::before {
        border-right-color: #cbd5e1 !important;
        border-left-color: #cbd5e1 !important;
        border-top-color: #cbd5e1 !important;
        border-bottom-color: #cbd5e1 !important;
      }
      /* Custom styled range input for high contrast */
      .form-range::-webkit-slider-runnable-track {
        background: #cbd5e1 !important;
        height: 6px !important;
        border-radius: 3px !important;
      }
      .form-range::-moz-range-track {
        background: #cbd5e1 !important;
        height: 6px !important;
        border-radius: 3px !important;
      }
      .form-range::-webkit-slider-thumb {
        background: #005a87 !important;
        width: 18px !important;
        height: 18px !important;
        margin-top: -6px !important;
        border-radius: 50% !important;
      }
      .form-range::-moz-range-thumb {
        background: #005a87 !important;
        width: 18px !important;
        height: 18px !important;
        border-radius: 50% !important;
      }
      /* Custom backdrop styling for premium dark blurred effect */
      .modal-backdrop {
        background-color: rgba(15, 23, 42, 0.7) !important;
        opacity: 1 !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        transition: all 0.3s ease-in-out !important;
      }
    `;
    document.head.appendChild(styleEl);
    return () => {
      styleEl.remove();
    };
  }, [moduleId, navigate]);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const confidenceLevels = [
    { value: 1, label: 'Tidak Yakin' },
    { value: 2, label: 'Ragu-ragu' },
    { value: 3, label: 'Cukup Yakin' },
    { value: 4, label: 'Yakin' },
    { value: 5, label: 'Sangat Yakin' }
  ];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/srl/forethought', {
          moduleId: Number(moduleId),
          learning_goals: sessionGoal || 'Paham konsep dasar',
          estimated_time_minutes: Number(estimatedTime)
        });
      }
    } catch (err) {
      console.error('Failed to save SRL forethought to backend:', err);
    }
    
    // Save or clear default preference
    if (useDefaults) {
      localStorage.setItem('lms_use_defaults', 'true');
      localStorage.setItem('lms_default_goal', sessionGoal || 'Paham konsep dasar');
      localStorage.setItem('lms_default_strategy', focusStrategy);
      localStorage.setItem('lms_default_time', estimatedTime.toString());
      localStorage.setItem('lms_default_confidence', confidence.toString());
    } else {
      localStorage.removeItem('lms_use_defaults');
    }

    localStorage.setItem(`lms_planned_${moduleId}`, 'true');
    localStorage.setItem(`lms_goal_${moduleId}`, sessionGoal);
    localStorage.setItem(`lms_strategy_${moduleId}`, focusStrategy);
    localStorage.setItem(`lms_time_${moduleId}`, estimatedTime.toString());
    localStorage.setItem(`lms_confidence_${moduleId}`, confidence.toString());

    toast.success('Rencana belajar berhasil disimpan!');
    navigate(`/learner/modules/${moduleId}`);
  };

  const handleSkip = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/srl/forethought', {
          moduleId: Number(moduleId),
          learning_goals: 'Lewati Perencanaan (Skip)',
          estimated_time_minutes: 0
        });
      }
    } catch (err) {
      console.error('Failed to save skip forethought to backend:', err);
    }

    localStorage.setItem(`lms_planned_${moduleId}`, 'true');
    toast.success('Melompati perencanaan belajar.');
    navigate(`/learner/modules/${moduleId}`);
  };

  const renderTooltip = (props) => (
    <Tooltip id="srl-info-tooltip" {...props}>
      Menetapkan tujuan (Goal Setting) dan memilih strategi belajar (Strategic Planning) terbukti meningkatkan fokus serta daya ingat materi hingga 40%.
    </Tooltip>
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', position: 'relative' }}>


      {/* Blurred background backdrop mimicking the active module details */}
      <div style={{ filter: 'blur(5px) opacity(0.4)', pointerEvents: 'none', userSelect: 'none' }}>
        <Container className="mt-4">
          <Row className="g-4">
            {/* Left sidebar preview */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff', height: 400 }}>
                <div style={{ width: '60%', height: 12, background: '#cbd5e1', borderRadius: 4, marginBottom: 20 }} />
                {[1, 2, 3, 4].map(n => (
                  <div key={n} style={{ padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 10 }}>
                    <div style={{ width: '80%', height: 10, background: '#cbd5e1', borderRadius: 4 }} />
                  </div>
                ))}
              </Card>
            </Col>
            
            {/* Main content area preview */}
            <Col lg={8}>
              <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff', height: 80 }}>
                <div style={{ width: '40%', height: 12, background: '#cbd5e1', borderRadius: 4 }} />
              </Card>
              <Card className="border-0 shadow-sm rounded-4 p-4" style={{ background: '#fff', height: 300 }}>
                <div style={{ width: '70%', height: 16, background: '#cbd5e1', borderRadius: 4, marginBottom: 15 }} />
                <div style={{ width: '95%', height: 10, background: '#e2e8f0', borderRadius: 4, marginBottom: 10 }} />
                <div style={{ width: '90%', height: 10, background: '#e2e8f0', borderRadius: 4, marginBottom: 10 }} />
                <div style={{ width: '40%', height: 10, background: '#e2e8f0', borderRadius: 4 }} />
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Interactive Modal Popup */}
      <Modal

        show={true}
        onHide={handleSkip}
        centered
        backdrop="static"
        keyboard={false}
        size="lg"
        contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
      >
        <Modal.Header className="border-0 bg-light px-4 py-3 d-flex justify-content-between align-items-center">
          <div>
            <span className="badge bg-primary-subtle text-primary mb-1" style={{ textTransform: 'uppercase', fontSize: 9, fontWeight: 700 }}>
              Fase 1: Forethought & Planning
            </span>
            <div className="d-flex align-items-center gap-2">
              <Modal.Title className="fw-extrabold text-dark mb-0" style={{ fontSize: 16 }}>
                Persiapkan Sesi Belajarmu
              </Modal.Title>
              <OverlayTrigger
                placement="right"
                delay={{ show: 100, hide: 250 }}
                overlay={renderTooltip}
              >
                <span style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                  <HelpCircle size={16} className="text-primary" />
                </span>
              </OverlayTrigger>
            </div>
          </div>
          <button onClick={handleSkip} style={{ background: 'none', border: 'none', color: '#94a3b8' }} title="Lewati Perencanaan (Skip)">
            <X size={20} />
          </button>
        </Modal.Header>

        <Modal.Body className="p-4" style={{ background: '#fff' }}>
          {/* Header Info */}
          <div className="mb-4">
            <p className="text-secondary small mb-0">
              Modul: <strong className="text-dark">{learningPath.title}</strong>
            </p>
          </div>

          <Form onSubmit={handleSubmit}>

            {/* Goal input */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold small text-secondary mb-1">
                1. Apa target/sasaran utamamu dalam sesi belajar ini?
              </Form.Label>
              <div className="text-muted small mb-2" style={{ fontSize: 11.5 }}>
                Tuliskan secara spesifik apa yang ingin kamu ingat atau praktikkan dari modul ini.
              </div>
              <Form.Control
                type="text"
                required
                placeholder="Contoh: Menguasai cara membuat ideasi masalah user"
                value={sessionGoal}
                onChange={(e) => setSessionGoal(e.target.value)}
                style={{ borderRadius: 10, padding: '12px 16px', fontSize: 13.5, marginBottom: 10 }}
              />
              {/* Preset / Quick Chips */}
              <div className="d-flex flex-wrap gap-2 mt-2">
                {['Paham konsep dasar', 'Bisa praktikkan ideasi', 'Siap untuk kuis'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setSessionGoal(chip)}
                    style={{
                      background: sessionGoal === chip ? '#e0f2fe' : '#f1f5f9',
                      border: sessionGoal === chip ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      color: sessionGoal === chip ? '#0369a1' : '#475569',
                      borderRadius: 20,
                      padding: '4px 12px',
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (sessionGoal !== chip) {
                        e.currentTarget.style.background = '#e2e8f0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (sessionGoal !== chip) {
                        e.currentTarget.style.background = '#f1f5f9';
                      }
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </Form.Group>

            {/* Slider */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold small text-secondary mb-3">
                2. Berapa menit estimasi waktu yang kamu siapkan?
              </Form.Label>
              
              {/* Floating Tooltip Container */}
              <div style={{ position: 'relative', width: '100%', height: 28, marginBottom: 4 }}>
                <span 
                  className="badge bg-primary py-2 px-3 fw-bold position-absolute" 
                  style={{ 
                    fontSize: 11,
                    left: `calc(${(estimatedTime - 5) / (60 - 5) * 100}% + (${12 - ((estimatedTime - 5) / (60 - 5) * 100) * 0.24}px))`,
                    transform: 'translateX(-50%)',
                    bottom: 0,
                    whiteSpace: 'nowrap',
                    transition: 'left 0.1s ease-out'
                  }}
                >
                  {estimatedTime} Menit
                </span>
              </div>

              <Form.Range
                min={5}
                max={60}
                step={5}
                value={estimatedTime}
                className="form-range"
                onChange={(e) => setEstimatedTime(Number(e.target.value))}
              />
              <div className="d-flex justify-content-between small text-muted mt-1" style={{ fontSize: 11 }}>
                <span>5 Menit</span>
                <span>60 Menit</span>
              </div>
            </Form.Group>

            {/* Confidence Star buttons */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold small text-secondary mb-2">
                3. Seberapa yakin kamu bisa menyelesaikan modul ini hari ini?
              </Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {confidenceLevels.map((level) => (
                  <button
                    type="button"
                    key={level.value}
                    onClick={() => setConfidence(level.value)}
                    style={{
                      flex: '1 1 0px',
                      minWidth: '80px',
                      padding: '12px 6px',
                      borderRadius: 10,
                      border: confidence === level.value ? '2.5px solid #00699e' : '1px solid #cbd5e1',
                      background: confidence === level.value ? '#00699e' : '#fff',
                      color: confidence === level.value ? '#fff' : '#64748b',
                      fontWeight: 700,
                      fontSize: 11,
                      transition: 'all 0.15s ease',
                      cursor: 'pointer'
                    }}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </Form.Group>

            {/* Save Defaults Checkbox */}
            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                id="use-defaults-checkbox"
                label="Gunakan pengaturan ini untuk modul berikutnya"
                checked={useDefaults}
                onChange={(e) => setUseDefaults(e.target.checked)}
                className="small fw-semibold text-secondary"
                style={{ fontSize: 12.5 }}
              />
            </Form.Group>

            <hr className="my-4" />

            {/* Actions */}
            <div className="d-flex gap-3 justify-content-end align-items-center">
              <Button
                variant="link"
                onClick={handleSkip}
                style={{ color: '#64748b', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}
              >
                Lewati Perencanaan
              </Button>
              <Button
                type="submit"
                style={{
                  background: '#005a87',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 30px',
                  fontWeight: 750,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                Simpan & Mulai Belajar <ArrowRight size={16} />
              </Button>
            </div>

          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GoalSettingPage;
