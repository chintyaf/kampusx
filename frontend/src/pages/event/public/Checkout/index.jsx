import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import {
  ArrowLeft,
  CheckCircle,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Tag,
  CreditCard,
  Ticket,
  QrCode,
  Download,
  Lock,
  Clock,
  Copy,
  ExternalLink,
  ChevronRight,
  Gift,
  Check
} from 'lucide-react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../../../api/axios';
import { useAuth } from '../../../../context/AuthContext';
import './Checkout.css';

// === DUMMY EVENT FALLBACK DATA JIKA BACKEND OFFLINE ===
const DEFAULT_MOCK_EVENT = {
  id: 1,
  title: 'National AI & Data Science Workshop 2026: From Theory to Industry Application',
  organizer_name: 'KampusX Tech & GDSC Indonesia',
  start_date: '2026-11-28T09:00:00Z',
  location: 'Auditorium Utama Kampus & Zoom Hybrid',
  price: 50000,
  banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
  event_tickets: [
    {
      id: 'reg1',
      name: 'Tiket Peserta Regular (Seat-Locked)',
      price: 50000,
      quota: 45
    }
  ]
};

// ── Step indicator ────────────────────────────────────────────────────────────
const Steps = ({ current }) => {
  const items = ['Informasi', 'Pembayaran', 'Selesai'];
  return (
    <div className="steps-container">
      {items.map((label, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <React.Fragment key={idx}>
            <div className="step-node">
              <div
                className={`step-circle ${
                  done ? 'done' : active ? 'active' : 'pending'
                }`}
              >
                {done ? <CheckCircle size={16} /> : idx}
              </div>
              <span
                className={`step-label ${
                  done ? 'done' : active ? 'active' : 'pending'
                }`}
              >
                {label}
              </span>
            </div>
            {i < items.length - 1 && (
              <div
                className={`step-line ${
                  current > idx ? 'done' : 'pending'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Field wrapper ─────────────────────────────────────────────────────────────
const FieldIcon = ({ icon: Icon, children }) => (
  <div style={{ position: 'relative' }}>
    <Icon
      size={16}
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        color: '#64748b',
        pointerEvents: 'none'
      }}
    />
    {React.cloneElement(children, {
      style: {
        ...children.props.style,
        paddingLeft: 38,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        fontSize: '13.5px'
      }
    })}
  </div>
);

// ── Main Checkout Component ───────────────────────────────────────────────────
const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('ticketId');

  // Step state: 1 = Form, 2 = Payment Selection & QRIS, 3 = Success Ticket
  const [step, setStep] = useState(1);
  const [eventDetails, setEventDetails] = useState(DEFAULT_MOCK_EVENT);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Seat Locking Timer State (15 Menit = 900 Detik)
  const [timeLeft, setTimeLeft] = useState(900);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || 'Budi Pratama',
    email: user?.email || 'budi.pratama@ui.ac.id',
    phone: user?.phone || '081234567890'
  });

  // Selected Payment Method: 'qris' | 'bca_va' | 'gopay'
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [copiedVA, setCopiedVA] = useState(false);

  // Issued Ticket Info after payment
  const [issuedTicket, setIssuedTicket] = useState(null);

  // Countdown Timer Effect (Redis-based Seat Lock simulation)
  useEffect(() => {
    if (step === 3) return; // Stop timer if completed
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Waktu penguncian kursi Anda telah habis (15 menit). Silakan pilih tiket kembali.');
          navigate('/explore-events');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, navigate]);

  // Format detik menjadi mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Coba fetch event asli jika backend ada
  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const res = await api.get(`events/${id}`).catch(() => null);
        if (res && res.data) {
          const result = res.data?.data ?? res.data;
          setEventDetails(result);
        }
      } catch (err) {
        console.warn('Menggunakan fallback mock event data:', err);
      }
    })();
  }, [id]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Kalkulasi Harga
  const tickets = eventDetails?.event_tickets || eventDetails?.eventTickets || [];
  const displayTickets =
    tickets.length > 0
      ? tickets
      : [
          {
            id: 'reg1',
            name: 'Tiket Peserta Regular',
            price: eventDetails?.price || 50000
          }
        ];
  const selectedTicket = displayTickets.find((t) => String(t.id) === String(ticketId)) || displayTickets[0];
  const ticketName = selectedTicket ? selectedTicket.name : 'Tiket Peserta Regular';
  const eventPrice = selectedTicket ? parseFloat(selectedTicket.price) || 0 : parseFloat(eventDetails.price) || 0;
  const adminFee = eventPrice > 0 ? 1000 : 0;
  const total = eventPrice + adminFee;
  const isFree = total === 0;

  // Lanjut dari Step 1 ke Step 2
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setSubmitError('Harap lengkapi semua data pemesan.');
      return;
    }
    setSubmitError(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Simulasikan Pembayaran Sukses (Step 2 ke Step 3)
  const handleSimulatePaymentSuccess = async () => {
    setIsProcessingPayment(true);
    // Simulasi delay gateway pembayaran (Midtrans/Xendit) 1.2 detik
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const generatedTicketCode = `TK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticketData = {
      orderId: `ORD-${Date.now()}`,
      ticketCode: generatedTicketCode,
      eventTitle: eventDetails.title,
      attendeeName: formData.name,
      attendeeEmail: formData.email,
      ticketType: ticketName,
      totalPaid: total,
      paymentMethod:
        paymentMethod === 'qris'
          ? 'QRIS Mandiri/BCA/Gojek'
          : paymentMethod === 'bca_va'
          ? 'BCA Virtual Account'
          : 'GoPay / E-Wallet',
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setIssuedTicket(ticketData);
    setIsProcessingPayment(false);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText('8219081234567890');
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  return (
    <div className="checkout-page-wrapper">
      {/* ── Header Bar ─────────────────────────────────────────── */}
      <div className="checkout-header-bar">
        <Container>
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="checkout-back-btn"
              onClick={() => {
                if (step === 2) setStep(1);
                else navigate(-1);
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '18px' }}>
                {step === 3 ? 'Pemesanan Berhasil' : 'Checkout & Kunci Kursi'}
              </h5>
              <p className="text-muted small mb-0">
                {step === 3
                  ? 'E-Tiket resmi telah terbit dan siap digunakan'
                  : 'Selesaikan transaksi sebelum batas waktu penguncian habis'}
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        {/* Step Indicator */}
        <Steps current={step} />

        {/* ── REDIS SEAT LOCKING TIMER BANNER (Sesuai Proposal TA Brigitta) ── */}
        {step !== 3 && (
          <div className="seat-lock-banner">
            <div className="seat-lock-info">
              <div className="seat-lock-icon">
                <Lock size={20} />
              </div>
              <div>
                <div className="seat-lock-title">
                  🔒 Kursi Anda Diamankan (Redis Seat-Lock Engine)
                </div>
                <p className="seat-lock-desc">
                  Sistem mengunci 1 kuota tiket untuk Anda selama 15 menit agar terhindar dari *overbooking*.
                </p>
              </div>
            </div>

            <div className="seat-lock-timer-box">
              <div className="seat-lock-timer-label">Sisa Waktu</div>
              <div className="seat-lock-timer-val">{formatTime(timeLeft)}</div>
            </div>
          </div>
        )}

        {submitError && (
          <Alert variant="danger" className="rounded-3 border-0 shadow-sm mb-4">
            {submitError}
          </Alert>
        )}

        {/* ==================== STEP 1: FORM INFORMASI PEMESAN ==================== */}
        {step === 1 && (
          <Form onSubmit={handleProceedToPayment}>
            <Row className="g-4">
              {/* Left Column: Event details & Customer inputs */}
              <Col lg={8}>
                {/* Event info mini card */}
                <div className="checkout-event-card">
                  <img
                    src={eventDetails.banner_url || DEFAULT_MOCK_EVENT.banner_url}
                    alt={eventDetails.title}
                    className="checkout-event-img"
                  />
                  <div>
                    <h6 className="checkout-event-title">{eventDetails.title}</h6>
                    <div className="checkout-event-meta">
                      <span>
                        <Calendar size={13} className="me-1 text-primary" />
                        {new Date(eventDetails.start_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span>
                        <MapPin size={13} className="me-1 text-secondary" />
                        {eventDetails.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Inputs Card */}
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-3">
                  <div className="p-3 px-4 border-bottom bg-white">
                    <h6 className="fw-bold mb-0 text-dark">Informasi Pemesan</h6>
                    <small className="text-muted">
                      Data ini akan dicantumkan pada E-Tiket dan sertifikat kehadiran.
                    </small>
                  </div>

                  <Card.Body className="p-4">
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-dark">
                        Nama Lengkap <span className="text-danger">*</span>
                      </Form.Label>
                      <FieldIcon icon={User}>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Nama sesuai identitas resmi"
                        />
                      </FieldIcon>
                    </Form.Group>

                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold text-dark">
                            Email <span className="text-danger">*</span>
                          </Form.Label>
                          <FieldIcon icon={Mail}>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              placeholder="email@kampus.ac.id"
                            />
                          </FieldIcon>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold text-dark">
                            Nomor WhatsApp <span className="text-danger">*</span>
                          </Form.Label>
                          <FieldIcon icon={Phone}>
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              required
                              placeholder="081234567890"
                            />
                          </FieldIcon>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Security Guarantees */}
                <div className="d-flex gap-4 flex-wrap text-muted small px-2">
                  <div className="d-flex align-items-center gap-2">
                    <ShieldCheck size={16} className="text-success" />
                    <span>Seat-Locking Redis 15 Menit Aktif</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Ticket size={16} className="text-primary" />
                    <span>E-Tiket & QR Code Otomatis</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Tag size={16} className="text-secondary" />
                    <span>Bebas Biaya Tersembunyi</span>
                  </div>
                </div>
              </Col>

              {/* Right Column: Order Summary */}
              <Col lg={4}>
                <div className="order-summary-card">
                  <div className="order-summary-header">
                    <h6 className="fw-bold mb-0 text-dark">Ringkasan Pesanan</h6>
                  </div>

                  <div className="order-summary-body">
                    <div className="mb-3">
                      <div className="fw-bold text-dark small mb-1">{eventDetails.title}</div>
                      <small className="text-muted d-flex align-items-center gap-1">
                        <MapPin size={12} /> {eventDetails.location}
                      </small>
                    </div>

                    <hr className="my-2" style={{ borderColor: '#f1f5f9' }} />

                    <div className="d-flex justify-content-between small text-secondary py-1">
                      <span>1× {ticketName}</span>
                      <span className="fw-bold text-dark">
                        {eventPrice === 0 ? 'Gratis' : `Rp ${eventPrice.toLocaleString('id-ID')}`}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between small text-secondary py-1">
                      <span>Biaya Layanan & Payment</span>
                      <span className="fw-bold text-dark">
                        {adminFee === 0 ? '–' : `Rp ${adminFee.toLocaleString('id-ID')}`}
                      </span>
                    </div>

                    <hr className="my-2" style={{ borderColor: '#f1f5f9' }} />

                    <div className="d-flex justify-content-between align-items-center py-2 mb-3">
                      <span className="fw-bold text-dark">Total Pembayaran</span>
                      <span className="fw-bold fs-5 text-primary">
                        {isFree ? 'GRATIS' : `Rp ${total.toLocaleString('id-ID')}`}
                      </span>
                    </div>

                    <Button
                      type="submit"
                      variant="dark"
                      className="w-100 rounded-pill py-2-5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                      style={{ fontSize: '14px' }}
                    >
                      <CreditCard size={16} />
                      <span>Lanjut ke Pembayaran</span>
                    </Button>

                    <p className="text-center text-muted small mt-3 mb-0" style={{ fontSize: '11px' }}>
                      Dengan melanjutkan, Anda menyetujui syarat & ketentuan pemesanan tiket KampusX.
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </Form>
        )}

        {/* ==================== STEP 2: METODE PEMBAYARAN & SIMULATOR GATEWAY ==================== */}
        {step === 2 && (
          <Row className="g-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-3">
                <div className="p-3 px-4 border-bottom bg-white d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">Pilih Metode Pembayaran</h6>
                    <small className="text-muted">
                      Transaksi instan terverifikasi otomatis via Payment Gateway
                    </small>
                  </div>
                  <Badge bg="success-subtle" className="text-success border border-success-subtle">
                    Instant Gateway
                  </Badge>
                </div>

                <Card.Body className="p-4">
                  <div className="payment-method-selector">
                    {/* 1. QRIS */}
                    <div
                      className={`payment-option-card ${paymentMethod === 'qris' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('qris')}
                    >
                      <div className="payment-option-left">
                        <div className="payment-radio-circle">
                          {paymentMethod === 'qris' && <div className="payment-radio-inner" />}
                        </div>
                        <div>
                          <div className="fw-bold text-dark small">QRIS (GoPay, OVO, Dana, BCA Mobile)</div>
                          <small className="text-muted">Scan QR instan dari semua e-wallet dan m-banking</small>
                        </div>
                      </div>
                      <Badge bg="primary-subtle" className="text-primary">Rekomendasi</Badge>
                    </div>

                    {/* 2. Virtual Account */}
                    <div
                      className={`payment-option-card ${paymentMethod === 'bca_va' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('bca_va')}
                    >
                      <div className="payment-option-left">
                        <div className="payment-radio-circle">
                          {paymentMethod === 'bca_va' && <div className="payment-radio-inner" />}
                        </div>
                        <div>
                          <div className="fw-bold text-dark small">BCA Virtual Account</div>
                          <small className="text-muted">Verifikasi instan 24 jam bebas biaya admin</small>
                        </div>
                      </div>
                      <span className="small text-muted fw-semibold">VA Otomatis</span>
                    </div>

                    {/* 3. GoPay / E-Wallet */}
                    <div
                      className={`payment-option-card ${paymentMethod === 'gopay' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('gopay')}
                    >
                      <div className="payment-option-left">
                        <div className="payment-radio-circle">
                          {paymentMethod === 'gopay' && <div className="payment-radio-inner" />}
                        </div>
                        <div>
                          <div className="fw-bold text-dark small">GoPay / ShopeePay E-Wallet</div>
                          <small className="text-muted">Arahkan langsung ke aplikasi pembayaran</small>
                        </div>
                      </div>
                      <span className="small text-muted fw-semibold">1-Klik Bayar</span>
                    </div>
                  </div>

                  {/* Payment Details Box */}
                  {paymentMethod === 'qris' && (
                    <div className="qris-box-container">
                      <div className="fw-bold text-dark mb-1">Scan Kode QRIS Pembayaran</div>
                      <p className="text-muted small mb-3">
                        Gunakan aplikasi GoPay, OVO, Dana, ShopeePay, atau m-Banking Anda.
                      </p>
                      <div className="qris-code-frame">
                        <QRCodeSVG
                          value={`https://kampusx.id/pay/qris?order=${Date.now()}&amt=${total}`}
                          size={176}
                        />
                      </div>
                      <div className="small text-muted">
                        Ref ID: <strong className="text-dark font-monospace">QRIS-KX-{Date.now().toString().slice(-6)}</strong>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'bca_va' && (
                    <div className="p-4 bg-light rounded-4 border mb-3">
                      <div className="small text-muted mb-1">Nomor Virtual Account:</div>
                      <div className="d-flex align-items-center justify-content-between p-3 bg-white rounded-3 border mb-2">
                        <span className="fs-5 fw-bold font-monospace text-dark">
                          8219 0812 3456 7890
                        </span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="rounded-pill"
                          onClick={handleCopyVA}
                        >
                          {copiedVA ? <Check size={14} className="me-1" /> : <Copy size={14} className="me-1" />}
                          {copiedVA ? 'Tersalin' : 'Salin'}
                        </Button>
                      </div>
                      <small className="text-muted">
                        Pembayaran akan terverifikasi secara instan dalam 3-5 detik setelah transfer.
                      </small>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Right Column: Order Confirmation */}
            <Col lg={4}>
              <div className="order-summary-card">
                <div className="order-summary-header">
                  <h6 className="fw-bold mb-0 text-dark">Konfirmasi Bayar</h6>
                </div>

                <div className="order-summary-body">
                  <div className="d-flex justify-content-between small text-secondary py-1">
                    <span>Pemesan:</span>
                    <span className="fw-bold text-dark">{formData.name}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-secondary py-1">
                    <span>Metode:</span>
                    <span className="fw-bold text-primary text-uppercase">{paymentMethod}</span>
                  </div>

                  <hr className="my-2" style={{ borderColor: '#f1f5f9' }} />

                  <div className="d-flex justify-content-between align-items-center py-2 mb-3">
                    <span className="fw-bold text-dark">Total Tagihan</span>
                    <span className="fw-bold fs-5 text-primary">
                      Rp {total.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Simulator Button */}
                  <Button
                    type="button"
                    variant="success"
                    className="w-100 rounded-pill py-2-5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm mb-2"
                    onClick={handleSimulatePaymentSuccess}
                    disabled={isProcessingPayment}
                    style={{ fontSize: '14px' }}
                  >
                    {isProcessingPayment ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        <span>Memverifikasi Pembayaran...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Bayar Sekarang (Simulasi)</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="w-100 rounded-pill py-2 fw-semibold"
                    onClick={() => setStep(1)}
                    disabled={isProcessingPayment}
                    style={{ fontSize: '13px' }}
                  >
                    Ubah Data Pemesan
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        )}

        {/* ==================== STEP 3: PEMBAYARAN SUKSES & TIKET TERBIT ==================== */}
        {step === 3 && issuedTicket && (
          <div className="checkout-success-card">
            <div className="success-badge-circle">
              <CheckCircle size={40} strokeWidth={2.5} />
            </div>

            <Badge bg="success" className="px-3 py-1-5 rounded-pill mb-2">
              LUNAS • TERVERIFIKASI PAYMENT GATEWAY
            </Badge>

            <h3 className="fw-bold text-dark mb-1">Pemesanan Tiket Berhasil!</h3>
            <p className="text-muted small mb-3">
              Kursi Anda telah resmi terkonfirmasi. Detail tiket elektronik telah diterbitkan di bawah ini.
            </p>

            {/* Ticket Claim Box */}
            <div className="ticket-claim-box">
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <span className="small text-muted">KODE TIKET RESMI:</span>
                <span className="fw-bold font-monospace text-primary fs-5">
                  {issuedTicket.ticketCode}
                </span>
              </div>

              <div className="small mb-2">
                <span className="text-muted">Event: </span>
                <strong className="text-dark">{issuedTicket.eventTitle}</strong>
              </div>

              <div className="small mb-2">
                <span className="text-muted">Nama Peserta: </span>
                <strong className="text-dark">{issuedTicket.attendeeName}</strong> ({issuedTicket.attendeeEmail})
              </div>

              <div className="small mb-2">
                <span className="text-muted">Tipe Tiket: </span>
                <strong className="text-dark">{issuedTicket.ticketType}</strong>
              </div>

              <div className="small mb-2">
                <span className="text-muted">Metode Pembayaran: </span>
                <strong className="text-dark">{issuedTicket.paymentMethod}</strong>
              </div>

              <div className="small text-muted">
                Waktu Transaksi: {issuedTicket.date}
              </div>
            </div>

            {/* Interactive Functional Navigation Buttons to Existing Pages */}
            <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
              {/* 1. Navigate to /my-tickets (Existing Page!) */}
              <button
                type="button"
                className="btn btn-dark flex-fill rounded-pill py-2-5 fw-bold d-flex align-items-center justify-content-center gap-2"
                onClick={() => navigate('/my-tickets')}
              >
                <Ticket size={16} />
                <span>Lihat Tiket Saya</span>
              </button>

              {/* 2. Navigate to /explore-events (Existing Page!) */}
              <button
                type="button"
                className="btn btn-outline-secondary flex-fill rounded-pill py-2-5 fw-semibold d-flex align-items-center justify-content-center gap-2"
                onClick={() => navigate('/explore-events')}
              >
                <Calendar size={16} />
                <span>Eksplor Event Lain</span>
              </button>

              {/* 3. Navigate to /rewards (Existing Page!) */}
              <button
                type="button"
                className="btn btn-outline-primary flex-fill rounded-pill py-2-5 fw-semibold d-flex align-items-center justify-content-center gap-2"
                onClick={() => navigate('/rewards')}
              >
                <Gift size={16} />
                <span>Cek Poin Loyalty</span>
              </button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Checkout;
