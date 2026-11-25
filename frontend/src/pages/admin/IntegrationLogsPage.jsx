import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Table, Spinner, Alert, Modal } from 'react-bootstrap';
import { Play, RotateCw, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Layers, Cpu } from 'lucide-react';
import api from '@/api/axios';

const IntegrationLogsPage = () => {
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [logs, setLogs] = useState([]);
  const [triggerResult, setTriggerResult] = useState(null);
  const [resetMessage, setResetMessage] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('part@kampusx.com');
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/integrations/logs');
      if (res.data?.success) {
        setLogs(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching integration logs:', err);
      setError('Gagal memuat log integrasi eksternal.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoTrigger = async () => {
    try {
      setTriggering(true);
      setError(null);
      setTriggerResult(null);
      setResetMessage(null);

      const res = await api.post('/integrations/demo-trigger', {
        email: selectedStudent
      });
      if (res.data?.success) {
        setTriggerResult(res.data.data);
        fetchLogs();
      }
    } catch (err) {
      console.error('Error executing demo trigger:', err);
      setError(err.response?.data?.message || 'Gagal menjalankan simulasi demo trigger.');
    } finally {
      setTriggering(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      setResetting(true);
      setError(null);
      setTriggerResult(null);

      const res = await api.post('/integrations/reset-demo', {
        email: selectedStudent
      });
      if (res.data?.success) {
        setResetMessage(res.data.message);
        fetchLogs();
      }
    } catch (err) {
      console.error('Error resetting demo:', err);
      setError(err.response?.data?.message || 'Gagal mereset poin mahasiswa.');
    } finally {
      setResetting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge bg="success" className="rounded-pill px-3 py-1">SUCCESS</Badge>;
      case 'DUPLICATE':
        return <Badge bg="warning" text="dark" className="rounded-pill px-3 py-1">DUPLICATE REJECTED</Badge>;
      case 'FAILED':
        return <Badge bg="danger" className="rounded-pill px-3 py-1">FAILED</Badge>;
      default:
        return <Badge bg="secondary" className="rounded-pill px-3 py-1">{status}</Badge>;
    }
  };

  return (
    <Container className="py-4 py-md-5">
      {/* Header */}
      <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            
            <h2 className="fw-bold text-dark mb-1">Integration Logs & AI Trigger</h2>
            <p className="text-muted mb-0">
              {/* Audit trail pertukaran data antara modul AI Self-Regulated Learning (SRL) dan Student Hub Space. */}
            </p>
          </div>
          <div className="d-flex align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-bold">Target Mahasiswa:</span>
              <select
                className="form-select form-select-sm rounded-pill"
                style={{ width: '300px' }}
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="part@kampusx.com">Budi Pratama (part@kampusx.com)</option>
                <option value="ahmad.fauzi@mail.ugm.ac.id">Ahmad Fauzi (ahmad.fauzi@mail.ugm.ac.id)</option>
                <option value="siti.rahma@student.ub.ac.id">Siti Rahma (siti.rahma@student.ub.ac.id)</option>
                <option value="rian.hidayat@itb.ac.id">Rian Hidayat (rian.hidayat@itb.ac.id)</option>
                <option value="dian.sastro@ui.ac.id">Dian Sastro (dian.sastro@ui.ac.id)</option>
              </select>
            </div>
            <Button
              variant="light"
              className="border rounded-pill px-3 py-2 d-flex align-items-center gap-2"
              onClick={fetchLogs}
            >
              <RotateCw size={16} /> Refresh
            </Button>
            <Button
              variant="outline-warning"
              className="rounded-pill px-3 py-2 d-flex align-items-center gap-2 text-dark"
              onClick={handleResetDemo}
              disabled={resetting}
              title="Reset poin ke kondisi awal (450 Silver)"
            >
              {resetting ? <Spinner animation="border" size="sm" /> : <RotateCw size={15} />}
              Reset (450 Silver)
            </Button>
            <Button
              variant="primary"
              className="rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm fw-bold"
              onClick={handleDemoTrigger}
              disabled={triggering}
            >
              {triggering ? <Spinner animation="border" size="sm" /> : <Play size={18} />}
              Jalankan Demo Trigger (+50 Poin)
            </Button>
          </div>
        </div>
      </div>

      {/* Reset Feedback Alert */}
      {resetMessage && (
        <Alert variant="info" className="rounded-4 p-4 border shadow-sm mb-4" dismissible onClose={() => setResetMessage(null)}>
          <div className="d-flex align-items-center gap-2">
            <CheckCircle2 size={20} className="text-info" />
            <h6 className="fw-bold mb-0 text-info">{resetMessage}</h6>
          </div>
        </Alert>
      )}

      {/* Trigger Live Feedback Alert */}
      {triggerResult && (
        <Alert variant="success" className="rounded-4 p-4 border shadow-sm mb-4" dismissible onClose={() => setTriggerResult(null)}>
          <div className="d-flex align-items-center gap-2 mb-2">
            {/* <Sparkles size={20} className="text-success" /> */}
            <h5 className="fw-bold mb-0 text-success">Simulasi Callback AI SRL Berhasil Diproses!</h5>
          </div>
          {/* <p className="mb-2 small">
            Sistem menerima payload pencapaian <strong>{triggerResult.external_reference}</strong>.
            Poin gamifikasi berhasil ditambahkan: <strong>+{triggerResult.points_awarded} Poin</strong>.
            Total Poin Sekarang: <strong>{triggerResult.student?.total_points} Poin</strong> (Tier: <span className="badge bg-warning text-dark">{triggerResult.student?.tier}</span>).
          </p>
          <div className="d-flex align-items-center gap-2">
            <Badge bg="primary" className="px-2 py-1">Kredensial Baru: {triggerResult.credential?.status}</Badge>
            <span className="small text-muted">{triggerResult.credential?.note}</span>
          </div> */}
        </Alert>
      )}

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      {/* Tabel Log Integrasi */}
      <Card className="border rounded-4 shadow-sm">
        <Card.Header className="bg-white p-4 border-bottom">
          <h5 className="fw-bold text-dark mb-0">Riwayat Request Eksternal Masuk</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">External Reference</th>
                  <th className="py-3">Asal Sistem</th>
                  <th className="py-3">Waktu Request</th>
                  <th className="py-3">Hasil Pemrosesan</th>
                  <th className="py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-end">Kredensial</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <div className="text-muted small mt-2">Memuat riwayat integrasi...</div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      Belum ada log integrasi. Tekan tombol "Jalankan Demo Trigger" untuk mensimulasikan callback dari AI SRL.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 fw-bold font-monospace text-primary">
                        {log.external_reference}
                      </td>
                      <td className="py-3">
                        <Badge bg="light" className="text-dark border">
                          {log.source_system}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted small">
                        {new Date(log.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 small text-dark" style={{ maxWidth: '350px' }}>
                        {log.processing_result}
                      </td>
                      <td className="py-3 text-center">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Badge bg={log.credential_status === 'PENDING' ? 'warning' : (log.credential_status === 'MINTED' ? 'success' : 'light')} text={log.credential_status === 'PENDING' ? 'dark' : (log.credential_status === 'MINTED' ? 'white' : 'dark')} className="border px-2 py-1">
                          {log.credential_status || 'NONE'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default IntegrationLogsPage;
