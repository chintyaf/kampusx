import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import {
  ShieldCheck,
  Award,
  ExternalLink,
  RotateCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/api/axios';

const CredentialManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState([]);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [mintingId, setMintingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/credentials');
      if (res.data?.success) {
        setCredentials(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching credentials:', err);
      setError('Gagal memuat daftar kredensial admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSbt = async (cred) => {
    try {
      setMintingId(cred.id);
      setActionSuccess(null);
      setError(null);
      const res = await api.post(`/credentials/${cred.id}/mint`);
      if (res.data?.success) {
        setActionSuccess(`SBT berhasil diterbitkan on-chain ke Polygon Amoy! Hash: ${res.data.data?.tx_hash}`);
        fetchCredentials();
      }
    } catch (err) {
      console.error('Error minting SBT:', err);
      setError(err.response?.data?.message || 'Gagal menerbitkan Soulbound Token ke blockchain.');
    } finally {
      setMintingId(null);
    }
  };

  const handleRetryMinting = async (cred) => {
    try {
      setMintingId(cred.id);
      const res = await api.post(`/credentials/${cred.id}/retry`);
      if (res.data?.success) {
        setActionSuccess(`Retry minting berhasil! Kredensial telah diterbitkan on-chain.`);
        fetchCredentials();
      }
    } catch (err) {
      setError('Gagal melakukan retry minting: ' + (err.response?.data?.message || err.message));
    } finally {
      setMintingId(null);
    }
  };

  const handleOpenPreview = (cred) => {
    setSelectedCredential(cred);
    setShowPreviewModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'MINTED':
        return <Badge bg="success" className="rounded-pill px-3 py-1">MINTED (ON-CHAIN)</Badge>;
      case 'PENDING':
        return <Badge bg="warning" text="dark" className="rounded-pill px-3 py-1">PENDING REVIEW</Badge>;
      case 'FAILED':
        return <Badge bg="danger" className="rounded-pill px-3 py-1">MINTING FAILED</Badge>;
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
            
            <h2 className="fw-bold text-dark mb-1">Credential Management (Penerbitan SBT)</h2>
            <p className="text-muted mb-0">
              Kelola verifikasi, preview sertifikat akademik, dan eksekusi transaksi Smart Contract Soulbound Token (ERC-5192).
            </p>
          </div>
          <Button
            variant="light"
            className="border rounded-pill px-3 py-2 d-flex align-items-center gap-2"
            onClick={fetchCredentials}
          >
            <RotateCw size={16} /> Refresh Data
          </Button>
        </div>
      </div>

      {actionSuccess && <Alert variant="success" dismissible onClose={() => setActionSuccess(null)}>{actionSuccess}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      {/* Tabel Kredensial */}
      <Card className="border rounded-4 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Credential ID</th>
                  <th className="py-3">Nama Mahasiswa</th>
                  <th className="py-3">Pencapaian / Modul</th>
                  <th className="py-3">Token ID</th>
                  <th className="py-3 text-center">Status Minting</th>
                  <th className="px-4 py-3 text-end">Aksi Penerbit</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <div className="text-muted small mt-2">Memuat daftar kredensial...</div>
                    </td>
                  </tr>
                ) : credentials.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      Belum ada kredensial yang diajukan. Jalankan simulasi AI SRL Trigger untuk membuat kredensial baru.
                    </td>
                  </tr>
                ) : (
                  credentials.map((cred) => (
                    <tr key={cred.id}>
                      <td className="px-4 py-3 fw-bold font-monospace text-primary">
                        {cred.credential_code}
                      </td>
                      <td className="py-3">
                        <div className="fw-semibold text-dark">{cred.student_name}</div>
                        <div className="text-muted small">{cred.student_email}</div>
                      </td>
                      <td className="py-3">
                        <div className="fw-medium text-dark">{cred.title}</div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>
                          Nilai Kognitif: {cred.cognitive_score}/100 | {cred.skill_category}
                        </div>
                      </td>
                      <td className="py-3 font-monospace text-secondary small">
                        {cred.token_id || '-'}
                      </td>
                      <td className="py-3 text-center">
                        {getStatusBadge(cred.minting_status)}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          <Button
                            variant="light"
                            size="sm"
                            className="border rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                            onClick={() => handleOpenPreview(cred)}
                          >
                            <Eye size={14} /> Preview
                          </Button>

                          {cred.minting_status === 'PENDING' && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="rounded-pill px-3 py-1 d-flex align-items-center gap-1 fw-bold shadow-sm"
                              onClick={() => handleIssueSbt(cred)}
                              disabled={mintingId === cred.id}
                            >
                              {mintingId === cred.id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <Sparkles size={14} />
                              )}
                              Issue SBT
                            </Button>
                          )}

                          {cred.minting_status === 'FAILED' && (
                            <Button
                              variant="warning"
                              size="sm"
                              className="rounded-pill px-3 py-1 d-flex align-items-center gap-1 fw-bold"
                              onClick={() => handleRetryMinting(cred)}
                              disabled={mintingId === cred.id}
                            >
                              <RotateCw size={14} /> Retry
                            </Button>
                          )}

                          {cred.minting_status === 'MINTED' && cred.tx_hash && (
                            <Link
                              to={`/blockchain/explorer/tx/${cred.tx_hash}`}
                              target="_blank"
                              className="btn btn-outline-success btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                            >
                              <ExternalLink size={14} /> PolygonScan
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* MODAL PREVIEW DIGITAL CERTIFICATE */}
      {selectedCredential && (
        <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="lg" centered>
          <Modal.Header closeButton className="border-0 px-4 pt-4">
            <Modal.Title className="fw-bold">Pratinjau Sertifikat Digital (ERC-5192)</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pb-4">
            {/* Visual Sertifikat Elegan */}
            <div
              className="p-4 p-md-5 rounded-4 border position-relative text-center shadow-sm"
              style={{
                backgroundColor: '#ffffff',
                border: '3px solid #0284c7',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)'
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div className="text-start">
                  <div className="fw-bold text-primary fs-5">🎓 KAMPUSX ACADEMIC PORTAL</div>
                  <div className="text-muted small">Center for Competence & Verified Credentials</div>
                </div>
                <Badge bg="success" className="px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                  <ShieldCheck size={16} /> SOULBOUND TOKEN (ERC-5192)
                </Badge>
              </div>

              <div className="my-4">
                <div className="text-uppercase text-muted fw-bold small letter-spacing mb-2">
                  SERTIFIKAT KOMPETENSI RESMI
                </div>
                <div className="text-muted small mb-2">Diberikan secara terdesentralisasi kepada:</div>
                <h2 className="fw-bold text-dark display-6 mb-3">{selectedCredential.student_name}</h2>
                <div className="text-muted small mb-1">Atas keberhasilan menyelesaikan evaluasi dan penguasaan materi:</div>
                <h4 className="fw-bold text-primary mb-3">{selectedCredential.title}</h4>
                <p className="text-muted small max-w-lg mx-auto mb-4">
                  Kredensial akademik ini diterbitkan sebagai bukti kompetensi terverifikasi dengan standar Soulbound Token (ERC-5192) yang terkunci secara permanen pada dompet digital mahasiswa dan tidak dapat dipindahtangankan.
                </p>
              </div>

              <div className="row align-items-center border-top pt-4 text-start">
                <div className="col-8">
                  <div className="small text-muted">Token ID: <span className="font-monospace fw-bold text-dark">{selectedCredential.token_id || '#SBT-PENDING'}</span></div>
                  <div className="small text-muted">Contract Address: <span className="font-monospace text-dark">{selectedCredential.contract_address}</span></div>
                  <div className="small text-muted">Wallet Penerima: <span className="font-monospace text-dark">{selectedCredential.student_wallet}</span></div>
                  <div className="small text-muted">Jaringan: <span className="fw-bold text-primary">{selectedCredential.network}</span></div>
                </div>
                <div className="col-4 text-end">
                  <div className="d-inline-block p-2 bg-white rounded-3 border shadow-sm">
                    <QRCodeSVG
                      value={selectedCredential.public_verify_url || window.location.origin + '/certificate/verify/' + selectedCredential.ticket_code}
                      size={80}
                      level="H"
                    />
                    <div className="text-muted text-center mt-1" style={{ fontSize: '9px' }}>Scan untuk Verifikasi</div>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4">
            <Button variant="light" className="rounded-pill border" onClick={() => setShowPreviewModal(false)}>
              Tutup Pratinjau
            </Button>
            {selectedCredential.minting_status === 'PENDING' && (
              <Button
                variant="primary"
                className="rounded-pill px-4 fw-bold shadow-sm"
                onClick={() => {
                  setShowPreviewModal(false);
                  handleIssueSbt(selectedCredential);
                }}
              >
                Lanjutkan Issue SBT On-Chain
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default CredentialManagementPage;
