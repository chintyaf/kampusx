import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import { ShieldCheck, ArrowLeft, Cpu, Activity, Server, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ActivityLogsPage = () => {
  const navigate = useNavigate();

  const logs = [
    { time: '22:10:45', event: 'LLM_GENERATE_SUCCESS', status: 'SUCCESS', payload: 'Generated 4 chunks for Module "Design Thinking"' },
    { time: '22:08:12', event: 'DB_USER_BADGE_GRANT', status: 'SUCCESS', payload: 'User Participant KampusX granted "Thinker Master" badge' },
    { time: '21:55:01', event: 'WEBHOOK_TRIGGER_SENT', status: 'SUCCESS', payload: 'Sent completion hook to global rewards manager' },
    { time: '21:30:12', event: 'AI_STUDIO_EXTRACTION_INIT', status: 'INFO', payload: 'File Syllabus_Design_Thinking.pdf successfully uploaded' }
  ];

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 48 }}>
      {/* Top Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '40px 0' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <button onClick={() => navigate('/organizer/dashboard')} style={{ background: 'none', border: 'none', color: '#fff' }}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <span className="badge bg-danger mb-2" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: 10 }}>
                  System Monitoring
                </span>
                <h2 className="fw-extrabold mb-1">Logs & Integration Monitor</h2>
                <p className="text-white-50 mb-0 small">
                  Monitor status koneksi API Chintya AI, statistik konsumsi token LLM, dan jejak audit aktivitas LMS.
                </p>
              </div>
            </div>
            <Button 
              variant="outline-light"
              onClick={() => toast.success('Status sistem berhasil dimuat ulang!')}
              className="d-flex align-items-center gap-1"
              style={{ borderRadius: 10, fontSize: 12, fontWeight: 700 }}
            >
              <RefreshCw size={14} /> Refresh Logs
            </Button>
          </div>
        </Container>
      </div>

      <Container className="mt-4">
        <Row className="g-4">
          
          {/* Left panel: system health */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#fff' }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <ShieldCheck size={20} className="text-success" /> Status Layanan AI
              </h5>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted d-flex align-items-center gap-2">
                    <Cpu size={16} /> API Chintya AI Engine
                  </span>
                  <Badge bg="success">Operational</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted d-flex align-items-center gap-2">
                    <Server size={16} /> Database Sync Node
                  </span>
                  <Badge bg="success">Synchronized</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted d-flex align-items-center gap-2">
                    <Activity size={16} /> Latensi Respon
                  </span>
                  <span className="fw-bold text-dark" style={{ fontSize: 12.5 }}>142 ms</span>
                </div>
              </div>

              <hr className="my-4" />

              <h6 className="fw-bold text-secondary mb-3 small">KONSUMSI TOKEN AI HARI INI</h6>
              <div className="d-flex justify-content-between mb-1 small text-muted">
                <span>Kuota Bulanan (Token)</span>
                <span>4.2%</span>
              </div>
              <ProgressBar now={4.2} variant="primary" style={{ height: 6, borderRadius: 10 }} />
              <small className="text-muted block mt-2" style={{ fontSize: 10.5 }}>4,250 tokens used of 100,000 quota.</small>
            </Card>
          </Col>

          {/* Right panel: audit logs table */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4 p-4" style={{ background: '#fff' }}>
              <h5 className="fw-bold mb-3">Audit Trails & Webhook Web Logs</h5>
              
              <Table responsive hover className="align-middle">
                <thead>
                  <tr className="table-light">
                    <th>Waktu</th>
                    <th>Jejak Aksi (Event)</th>
                    <th>Status</th>
                    <th>Detail Transaksi Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={idx}>
                      <td className="text-muted" style={{ fontSize: 11 }}>{log.time}</td>
                      <td className="fw-bold text-dark" style={{ fontSize: 12.5 }}>{log.event}</td>
                      <td>
                        <Badge bg={log.status === 'SUCCESS' ? 'success' : 'info'} style={{ fontSize: 9 }}>
                          {log.status}
                        </Badge>
                      </td>
                      <td className="text-muted text-truncate" style={{ fontSize: 12, maxWidth: '280px' }}>
                        {log.payload}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Col>

        </Row>
      </Container>
    </div>
  );
};

export default ActivityLogsPage;
