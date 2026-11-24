import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  Spinner,
  Alert,
  InputGroup
} from 'react-bootstrap';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Settings,
  RefreshCw,
  Search,
  ArrowLeft,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import api from '@/api/axios';

const EventWaitlistPage = () => {
  const { eventId } = useParams();

  const [waitlistData, setWaitlistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Status Filter & Search
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // TTL Config Form State (Task 12)
  const [offerTtlMinutes, setOfferTtlMinutes] = useState(3);
  const [isSavingTtl, setIsSavingTtl] = useState(false);

  const fetchWaitlistData = useCallback(async (isSilent = false) => {
    if (!eventId) return;

    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const res = await api.get(`/admin/events/${eventId}/waitlist`);
      if (res.data?.success && res.data?.data) {
        setWaitlistData(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data waitlist admin:', err);
      const msg = err?.response?.data?.message || 'Gagal memuat daftar antrean waiting list.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchWaitlistData(false);
  }, [fetchWaitlistData]);

  // Handle Save TTL Settings
  const handleSaveTtl = async (e) => {
    e.preventDefault();
    setIsSavingTtl(true);
    setSuccessMsg(null);
    setError(null);

    try {
      const res = await api.put(`/admin/events/${eventId}/waitlist/config`, {
        offer_ttl_minutes: parseInt(offerTtlMinutes, 10)
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Konfigurasi batas waktu offer berhasil disimpan.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menyimpan konfigurasi TTL.');
    } finally {
      setIsSavingTtl(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OFFERED':
        return <Badge bg="warning" text="dark" className="px-2.5 py-1.5 rounded-pill fw-semibold"><Sparkles size={12} className="me-1" />OFFERED</Badge>;
      case 'WAITING':
        return <Badge bg="primary" className="px-2.5 py-1.5 rounded-pill fw-semibold">WAITING</Badge>;
      case 'CLAIMED':
        return <Badge bg="success" className="px-2.5 py-1.5 rounded-pill fw-semibold">CLAIMED</Badge>;
      case 'EXPIRED':
        return <Badge bg="secondary" className="px-2.5 py-1.5 rounded-pill fw-semibold">EXPIRED</Badge>;
      case 'CANCELLED':
        return <Badge bg="danger" className="px-2.5 py-1.5 rounded-pill fw-semibold">CANCELLED</Badge>;
      default:
        return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Memuat data antrean event...</p>
      </Container>
    );
  }

  const metrics = waitlistData?.metrics || {
    total_waiting: 0,
    total_offered: 0,
    total_claimed: 0,
    total_expired: 0,
    total_cancelled: 0
  };

  const allWaitlists = waitlistData?.waitlists || [];

  const filteredWaitlists = allWaitlists.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const nameStr = item.user?.name || '';
    const emailStr = item.user?.email || '';
    const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emailStr.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="py-4">
      <Container fluid className="px-3 px-md-4">
        {/* Navigation Bar */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <Link
              to={`/organizer/${eventId}/event-dashboard`}
              className="text-decoration-none text-muted small d-flex align-items-center gap-1 mb-1"
            >
              <ArrowLeft size={14} /> Kembali ke Dashboard Event
            </Link>
            <h4 className="fw-bold mb-0 text-dark">
              Manajemen Waiting List & Antrean FIFO
            </h4>
            <small className="text-muted">
              Event: {waitlistData?.title || 'Detail Event'}
            </small>
          </div>

          <Button
            variant="outline-secondary"
            size="sm"
            className="rounded-pill d-flex align-items-center gap-1.5 px-3 py-1.5 shadow-sm"
            onClick={() => fetchWaitlistData(true)}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
          </Button>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
        {successMsg && <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>}

        {/* METRICS CARDS */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm rounded-4 bg-white p-3 border-start border-4 border-primary">
              <div className="text-muted small fw-medium">Antrean Menunggu</div>
              <div className="display-6 fw-bold text-primary mt-1">{metrics.total_waiting}</div>
              <small className="text-muted">Status WAITING</small>
            </Card>
          </Col>

          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm rounded-4 bg-white p-3 border-start border-4 border-warning">
              <div className="text-muted small fw-medium">Penawaran Aktif</div>
              <div className="display-6 fw-bold text-warning-emphasis mt-1">{metrics.total_offered}</div>
              <small className="text-muted">Status OFFERED (Jendela 3m)</small>
            </Card>
          </Col>

          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm rounded-4 bg-white p-3 border-start border-4 border-success">
              <div className="text-muted small fw-medium">Berhasil Diklaim</div>
              <div className="display-6 fw-bold text-success mt-1">{metrics.total_claimed}</div>
              <small className="text-muted">Terkonversi ke Checkout</small>
            </Card>
          </Col>

          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm rounded-4 bg-white p-3 border-start border-4 border-secondary">
              <div className="text-muted small fw-medium">Kedaluwarsa / Batal</div>
              <div className="display-6 fw-bold text-secondary mt-1">
                {(metrics.total_expired || 0) + (metrics.total_cancelled || 0)}
              </div>
              <small className="text-muted">Dialihkan ke antrean berikutnya</small>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          {/* TABEL ANTREAN FIFO */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
              <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h6 className="fw-bold mb-0 text-dark">Daftar Antrean Peserta (Urutan FIFO)</h6>

                {/* Filter and Search */}
                <div className="d-flex gap-2 flex-wrap">
                  <InputGroup size="sm" style={{ width: '200px' }}>
                    <InputGroup.Text className="bg-light border-end-0">
                      <Search size={14} className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Cari nama/email..."
                      className="border-start-0 bg-light"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>

                  <Form.Select
                    size="sm"
                    className="w-auto bg-light rounded-3"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="WAITING">WAITING</option>
                    <option value="OFFERED">OFFERED</option>
                    <option value="CLAIMED">CLAIMED</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </Form.Select>
                </div>
              </Card.Header>

              <div className="table-responsive">
                <Table hover className="align-middle mb-0" style={{ fontSize: '13.5px' }}>
                  <thead className="table-light text-muted small">
                    <tr>
                      <th className="ps-3 py-3">No. Urut</th>
                      <th>Peserta</th>
                      <th>Tipe Tiket</th>
                      <th>Status</th>
                      <th>Waktu Daftar</th>
                      <th>Waktu Penawaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWaitlists.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          <Users size={32} className="opacity-50 mb-2" />
                          <p className="mb-0">Tidak ada data antrean yang sesuai.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredWaitlists.map((entry) => (
                        <tr key={entry.id}>
                          <td className="ps-3 font-monospace fw-bold text-primary">
                            #{entry.queue_number}
                          </td>
                          <td>
                            <div className="fw-semibold text-dark">{entry.user?.name || 'Peserta'}</div>
                            <small className="text-muted">{entry.user?.email || '-'}</small>
                          </td>
                          <td>
                            <span>{entry.event_ticket?.name || 'Tiket Regular'}</span>
                            {entry.seat_number && (
                              <Badge bg="light" text="dark" className="ms-1 border">
                                Kursi {entry.seat_number}
                              </Badge>
                            )}
                          </td>
                          <td>{getStatusBadge(entry.status)}</td>
                          <td className="text-muted small">
                            {new Date(entry.created_at).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="text-muted small">
                            {entry.offered_at ? (
                              <div>
                                <span className="text-dark fw-medium">
                                  {new Date(entry.offered_at).toLocaleTimeString('id-ID')}
                                </span>
                                {entry.expires_at && (
                                  <div className="text-danger" style={{ fontSize: '11px' }}>
                                    Exp: {new Date(entry.expires_at).toLocaleTimeString('id-ID')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card>
          </Col>

          {/* PANEL PENGATURAN TTL & ATURAN FIFO (Task 12) */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 mb-4">
              <h6 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                <Settings size={18} className="text-primary" /> Pengaturan Batas Waktu Offer
              </h6>

              <Form onSubmit={handleSaveTtl}>
                <Form.Group className="mb-3">
                  <Form.Label className="small text-muted fw-semibold">
                    Durasi Penawaran Eksklusif (Menit)
                  </Form.Label>
                  <Form.Select
                    value={offerTtlMinutes}
                    onChange={(e) => setOfferTtlMinutes(e.target.value)}
                    className="rounded-3"
                  >
                    <option value={1}>1 Menit (Ultra Fast Flash)</option>
                    <option value={2}>2 Menit</option>
                    <option value={3}>3 Menit (Rekomendasi Default)</option>
                    <option value={5}>5 Menit (Standar)</option>
                    <option value={10}>10 Menit (Maksimum)</option>
                  </Form.Select>
                  <Form.Text className="text-muted" style={{ fontSize: '11.5px' }}>
                    Peserta terdepan memiliki waktu ini untuk mengklaim kursi sebelum penawaran otomatis dialihkan ke antrean berikutnya.
                  </Form.Text>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 rounded-pill py-2 fw-semibold shadow-sm"
                  disabled={isSavingTtl}
                >
                  {isSavingTtl ? <Spinner animation="border" size="sm" /> : 'Simpan Pengaturan TTL'}
                </Button>
              </Form>
            </Card>

            <Card className="border-0 shadow-sm rounded-4 bg-white p-3 p-md-4">
              <h6 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                <ShieldAlert size={18} className="text-success" /> Aturan Fairness FIFO
              </h6>
              <ul className="small text-muted ps-3 mb-0 d-flex flex-column gap-2" style={{ fontSize: '12.5px' }}>
                <li>
                  <strong>Strictly FIFO:</strong> Peserta dilayani secara berurutan berdasarkan waktu mendaftar antrean.
                </li>
                <li>
                  <strong>Exclusive Hold:</strong> Kursi yang ditawarkan dicadangkan secara eksklusif dan tidak dapat diserobot oleh pengguna baru (Anti-Bypass).
                </li>
                <li>
                  <strong>Idempotent Dispatch:</strong> Pelepasan kursi otomatis mendispatch offer ke kandidat berikutnya secara aman.
                </li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EventWaitlistPage;
