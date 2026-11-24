import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, AlertCircle, Ticket, Calendar, RefreshCw, ExternalLink } from 'lucide-react';
import api from '../../../../api/axios';

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Duitku biasanya mengirim query parameter: merchantOrderId, resultCode, reference
  const orderIdFromUrl = searchParams.get('merchantOrderId') 
    || searchParams.get('order_id') 
    || searchParams.get('orderId') 
    || localStorage.getItem('last_checkout_order_id');

  const [orderId, setOrderId] = useState(orderIdFromUrl || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // Fungsi untuk mengambil status verifikasi resmi dari backend
  const fetchPaymentStatus = useCallback(async (isManualRefresh = false) => {
    if (!orderId) {
      setLoading(false);
      setError('ID Pesanan (Order ID) tidak ditemukan. Silakan cek daftar tiket Anda.');
      return;
    }

    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      // Backend akan melakukan inquiry server-side ke Duitku jika status masih pending
      const res = await api.get(`/payment/status/${orderId}`);
      if (res.data?.status === 'success') {
        setPaymentData(res.data);
        setError(null);

        // Hitung sisa waktu countdown jika ada expired_at dan status pending
        if (res.data.payment_status === 'pending' && res.data.expired_at) {
          const diffSeconds = Math.max(0, Math.floor((new Date(res.data.expired_at) - new Date()) / 1000));
          setTimeLeft(diffSeconds);
        }
      } else {
        setError(res.data?.message || 'Gagal memuat status pembayaran.');
      }
    } catch (err) {
      console.error('Error fetching payment status:', err);
      const errMsg = err?.response?.data?.message || 'Gagal memeriksa status pembayaran ke server.';
      setError(errMsg);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  // Polling terbatas: Jika status pending, poll setiap 5 detik maksimal 6 kali (30 detik)
  useEffect(() => {
    if (!paymentData || paymentData.payment_status !== 'pending') return;

    let pollCount = 0;
    const interval = setInterval(() => {
      pollCount++;
      if (pollCount > 6) {
        clearInterval(interval);
        return;
      }
      fetchPaymentStatus(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentData?.payment_status, fetchPaymentStatus]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          fetchPaymentStatus(true); // Re-check status setelah expired
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, fetchPaymentStatus]);

  const formatCountdown = (seconds) => {
    if (seconds === null || seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <Spinner animation="border" variant="primary" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
          <h5 className="fw-bold text-dark">Memverifikasi Status Pembayaran...</h5>
          <p className="text-muted small">Menghubungi server payment gateway untuk konfirmasi transaksi.</p>
        </div>
      </Container>
    );
  }

  const status = paymentData?.payment_status?.toLowerCase() || 'unknown';

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', padding: '40px 0' }}>
      <Container style={{ maxWidth: '680px' }}>
        {error && (
          <Alert variant="danger" className="rounded-4 border-0 shadow-sm mb-4">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </Alert>
        )}

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden text-center p-4 p-md-5 bg-white">
          {/* ================= STATUS: PAID (SUCCESS) ================= */}
          {status === 'paid' && (
            <div>
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: 80, height: 80, backgroundColor: '#dcfce7', color: '#16a34a' }}
              >
                <CheckCircle size={48} strokeWidth={2.5} />
              </div>

              <div className="mb-2">
                <Badge bg="success" className="px-3 py-1-5 rounded-pill fs-7 fw-semibold">
                  LUNAS • TERVERIFIKASI GATEWAY
                </Badge>
              </div>

              <h3 className="fw-bold text-dark mb-2">Pembayaran Berhasil Dikonfirmasi!</h3>
              <p className="text-muted small mb-4">
                Terima kasih! Tiket elektronik resmi Anda telah aktif dan siap digunakan untuk menghadiri acara.
              </p>

              <div className="p-3 bg-light rounded-4 text-start mb-4 border">
                <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
                  <span className="small text-muted">ID Order:</span>
                  <span className="fw-bold font-monospace text-dark">{paymentData.order_id}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
                  <span className="small text-muted">Event:</span>
                  <span className="fw-bold text-dark small">{paymentData.event_title || 'Event KampusX'}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
                  <span className="small text-muted">Total Tagihan:</span>
                  <span className="fw-bold text-primary">Rp {(paymentData.amount || 0).toLocaleString('id-ID')}</span>
                </div>
                {paymentData.primary_ticket_code && (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Kode Tiket Elektronik:</span>
                    <span className="fw-bold font-monospace text-success fs-6">{paymentData.primary_ticket_code}</span>
                  </div>
                )}
              </div>

              <div className="d-flex flex-column flex-sm-row gap-2">
                <Button
                  variant="dark"
                  className="flex-fill rounded-pill py-2-5 fw-bold d-flex align-items-center justify-content-center gap-2"
                  onClick={() => navigate('/my-tickets')}
                >
                  <Ticket size={16} />
                  <span>Lihat Tiket Saya</span>
                </Button>
                <Button
                  variant="outline-secondary"
                  className="flex-fill rounded-pill py-2-5 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  onClick={() => navigate('/explore-events')}
                >
                  <Calendar size={16} />
                  <span>Eksplor Acara Lain</span>
                </Button>
              </div>
            </div>
          )}

          {/* ================= STATUS: PENDING ================= */}
          {status === 'pending' && (
            <div>
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: 80, height: 80, backgroundColor: '#fef3c7', color: '#d97706' }}
              >
                <Clock size={48} strokeWidth={2.5} />
              </div>

              <div className="mb-2">
                <Badge bg="warning" text="dark" className="px-3 py-1-5 rounded-pill fs-7 fw-semibold">
                  MENUNGGU PEMBAYARAN
                </Badge>
              </div>

              <h3 className="fw-bold text-dark mb-2">Menunggu Pembayaran Anda</h3>
              <p className="text-muted small mb-3">
                Silakan selesaikan pembayaran sebelum batas waktu reservasi tiket kedaluwarsa.
              </p>

              {timeLeft !== null && (
                <div className="p-3 mb-4 rounded-4" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div className="small text-muted mb-1">Batas Waktu Pembayaran (Hold 15 Menit):</div>
                  <div className="fs-3 fw-bold font-monospace text-warning-emphasis">{formatCountdown(timeLeft)}</div>
                </div>
              )}

              <div className="p-3 bg-light rounded-4 text-start mb-4 border">
                <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
                  <span className="small text-muted">ID Order:</span>
                  <span className="fw-bold font-monospace text-dark">{paymentData.order_id}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
                  <span className="small text-muted">Event:</span>
                  <span className="fw-bold text-dark small">{paymentData.event_title || 'Event KampusX'}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted">Total Pembayaran:</span>
                  <span className="fw-bold text-primary">Rp {(paymentData.amount || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="d-flex flex-column gap-2">
                {paymentData.checkout_url && (
                  <Button
                    variant="primary"
                    className="w-100 rounded-pill py-2-5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    onClick={() => window.open(paymentData.checkout_url, '_blank')}
                  >
                    <ExternalLink size={16} />
                    <span>Lanjutkan Pembayaran (Buka Duitku)</span>
                  </Button>
                )}

                <Button
                  variant="outline-secondary"
                  className="w-100 rounded-pill py-2-5 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  onClick={() => fetchPaymentStatus(true)}
                  disabled={isRefreshing}
                >
                  <RefreshCw size={16} className={isRefreshing ? 'spinner-border spinner-border-sm' : ''} />
                  <span>{isRefreshing ? 'Memeriksa Status...' : 'Cek Status Pembayaran Sekarang'}</span>
                </Button>
              </div>
            </div>
          )}

          {/* ================= STATUS: FAILED / EXPIRED / CANCELLED ================= */}
          {['failed', 'expired', 'cancelled'].includes(status) && (
            <div>
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: 80, height: 80, backgroundColor: '#fee2e2', color: '#dc2626' }}
              >
                <XCircle size={48} strokeWidth={2.5} />
              </div>

              <div className="mb-2">
                <Badge bg="danger" className="px-3 py-1-5 rounded-pill fs-7 fw-semibold text-uppercase">
                  {status === 'expired' ? 'WAKTU PEMBAYARAN HABIS' : 'PEMBAYARAN DIBATALKAN / GAGAL'}
                </Badge>
              </div>

              <h3 className="fw-bold text-dark mb-2">Transaksi Tidak Berhasil</h3>
              <p className="text-muted small mb-4">
                {status === 'expired'
                  ? 'Batas waktu reservasi kursi (15 menit) telah habis dan kuota telah dilepaskan kembali.'
                  : 'Transaksi pembayaran dibatalkan atau ditolak oleh pihak penyedia pembayaran.'}
              </p>

              <div className="d-flex flex-column flex-sm-row gap-2">
                <Button
                  variant="dark"
                  className="flex-fill rounded-pill py-2-5 fw-bold d-flex align-items-center justify-content-center gap-2"
                  onClick={() => navigate('/explore-events')}
                >
                  <Calendar size={16} />
                  <span>Pilih Acara Kembali</span>
                </Button>
              </div>
            </div>
          )}
        </Card>
      </Container>
    </div>
  );
};

export default PaymentResultPage;
