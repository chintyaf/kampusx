import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Armchair } from 'lucide-react';
import api from '@/api/axios';

const SeatSelectionPage = () => {
  const { id } = useParams();
  const eventId = id || 1;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [seatsData, setSeatsData] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [locking, setLocking] = useState(false);
  const [booking, setBooking] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(900); // 15 menit
  const [activeLockToken, setActiveLockToken] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchSeats();
  }, [eventId]);

  // Countdown timer untuk kursi yang sedang di-lock
  useEffect(() => {
    let interval = null;
    if (activeLockToken && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleReleaseSeat();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeLockToken, timerSeconds]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${eventId}/seats`);
      if (res.data?.success) {
        setSeatsData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching seat map:', err);
      setErrorMsg('Gagal memuat data denah kursi event.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSeat = (seat) => {
    if (seat.status === 'BOOKED') {
      setErrorMsg(`Kursi ${seat.seat_number} sudah dibeli (BOOKED) oleh peserta lain.`);
      return;
    }
    if (seat.status === 'RESERVED' && !seat.is_mine) {
      setErrorMsg(`Kursi ${seat.seat_number} sedang dikunci (RESERVED) oleh peserta lain.`);
      return;
    }
    setSelectedSeat(seat.seat_number);
    setErrorMsg(null);
  };

  const handleLockSeat = async () => {
    if (!selectedSeat) return;

    try {
      setLocking(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await api.post(`/events/${eventId}/lock-seat`, {
        seat_number: selectedSeat,
      });

      if (res.data?.success) {
        setActiveLockToken(res.data.data.lock_token);
        setTimerSeconds(res.data.data.ttl_seconds || 900);
        setSuccessMsg(`Kursi ${selectedSeat} berhasil dikunci selama 15 menit dengan Redis Atomic SETNX!`);
        fetchSeats();
      }
    } catch (err) {
      console.error('Error locking seat:', err);
      setErrorMsg(err.response?.data?.message || 'Gagal mengunci kursi.');
    } finally {
      setLocking(false);
    }
  };

  const handleReleaseSeat = async () => {
    if (!selectedSeat) return;

    try {
      await api.post(`/events/${eventId}/release-seat`, {
        seat_number: selectedSeat,
      });
      setActiveLockToken(null);
      setSelectedSeat(null);
      setSuccessMsg('Kunci kursi telah dilepaskan dan kembali tersedia.');
      fetchSeats();
    } catch (err) {
      console.warn('Gagal melepas lock:', err);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSeat) return;

    try {
      setBooking(true);
      const res = await api.post(`/events/${eventId}/confirm-booking`, {
        seat_number: selectedSeat,
      });
      if (res.data?.success) {
        setActiveLockToken(null);
        setSuccessMsg(`Pembayaran Berhasil! Kursi ${selectedSeat} telah resmi berstatus BOOKED.`);
        fetchSeats();
      }
    } catch (err) {
      console.error('Error confirming booking:', err);
      setErrorMsg('Gagal mengonfirmasi booking.');
    } finally {
      setBooking(false);
    }
  };

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const getSeatColor = (seat) => {
    if (seat.status === 'BOOKED') {
      return '#ef4444'; // Red
    }
    if (seat.status === 'RESERVED') {
      return seat.is_mine || seat.seat_number === selectedSeat ? '#f59e0b' : '#f97316'; // Yellow/Orange
    }
    if (seat.seat_number === selectedSeat) {
      return '#3b82f6'; // Selected blue
    }
    return '#10b981'; // Available Green
  };

  return (
    <Container className="py-4 py-md-5">
      <Button
        variant="light"
        className="mb-4 d-flex align-items-center gap-2 border shadow-sm rounded-pill px-3 py-1 text-muted small"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} /> Kembali
      </Button>

      {/* Header */}
      <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-4">
        <Row className="align-items-center g-4">
          <Col md={8}>
            
            <h2 className="fw-bold text-dark mb-1">Denah Kursi & Reservasi Real-Time</h2>
            <p className="text-muted mb-0">
              Pilih kursi favorit Anda. Mekanisme penguncian atomik Redis mencegah overbooking dan memastikan tidak ada peserta lain yang dapat memilih kursi yang sama.
            </p>
          </Col>
          <Col md={4} className="text-md-end">
            {activeLockToken && (
              <div className="p-3 bg-warning-subtle text-warning-emphasis rounded-4 border border-warning d-inline-block text-start w-100">
                <div className="d-flex align-items-center gap-2 fw-bold small">
                  <Clock size={16} /> Countdown Sisa Waktu:
                </div>
                <div className="display-6 fw-bold mt-1 text-dark">
                  {formatCountdown(timerSeconds)}
                </div>
                <div style={{ fontSize: '11px' }} className="text-muted mt-1">
                  Kursi {selectedSeat} diamankan
                </div>
              </div>
            )}
          </Col>
        </Row>
      </div>

      {successMsg && <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>}
      {errorMsg && <Alert variant="danger" dismissible onClose={() => setErrorMsg(null)}>{errorMsg}</Alert>}

      <Row className="g-4">
        {/* DENAH KURSI INTERAKTIF */}
        <Col lg={8}>
          <Card className="border rounded-4 shadow-sm bg-white p-4">
            {/* Panggung / Screen */}
            <div
              className="py-2 text-center text-muted fw-bold rounded-3 mb-5 border"
              style={{ backgroundColor: '#f1f5f9', letterSpacing: '4px' }}
            >
              AREA PANGGUNG / SCREEN AUDITORIUM
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Memuat denah kursi realtime...</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3 mb-4">
                {['A', 'B', 'C'].map((rowLetter) => (
                  <div key={rowLetter} className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                    <span className="fw-bold text-muted me-2" style={{ width: '20px' }}>{rowLetter}</span>
                    {seatsData?.seats
                      .filter((s) => s.seat_number.startsWith(rowLetter))
                      .map((seat) => (
                        <button
                          key={seat.seat_number}
                          type="button"
                          className="btn d-flex flex-column align-items-center justify-content-center p-2 rounded-3 text-white transition-all"
                          style={{
                            width: '56px',
                            height: '56px',
                            backgroundColor: getSeatColor(seat),
                            border: seat.seat_number === selectedSeat ? '3px solid #1e293b' : 'none',
                            opacity: seat.status === 'BOOKED' ? 0.7 : 1,
                            cursor: seat.status === 'BOOKED' ? 'not-allowed' : 'pointer',
                          }}
                          onClick={() => handleSelectSeat(seat)}
                        >
                          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{seat.seat_number}</span>
                          <span style={{ fontSize: '9px' }}>
                            {seat.status === 'BOOKED' ? 'SOLD' : (seat.status === 'RESERVED' ? 'LOCK' : 'AVAIL')}
                          </span>
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="d-flex justify-content-center gap-4 border-top pt-4 flex-wrap">
              <div className="d-flex align-items-center gap-2 small">
                <div style={{ width: '16px', height: '16px', backgroundColor: '#10b981', borderRadius: '4px' }}></div>
                <span>AVAILABLE (Tersedia)</span>
              </div>
              <div className="d-flex align-items-center gap-2 small">
                <div style={{ width: '16px', height: '16px', backgroundColor: '#f59e0b', borderRadius: '4px' }}></div>
                <span>RESERVED (Terkunci)</span>
              </div>
              <div className="d-flex align-items-center gap-2 small">
                <div style={{ width: '16px', height: '16px', backgroundColor: '#ef4444', borderRadius: '4px' }}></div>
                <span>SOLD (Sudah Terjual)</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* PANEL AKSI RESERVASI */}
        <Col lg={4}>
          <Card className="border rounded-4 shadow-sm bg-white p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <h5 className="fw-bold text-dark mb-3">Detail Pilihan Kursi</h5>

              <div className="p-3 bg-light rounded-4 border mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">Kursi Terpilih:</span>
                  <span className="h4 fw-bold text-primary mb-0">{selectedSeat || '-'}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">Status Kursi:</span>
                  <Badge bg={selectedSeat ? 'primary' : 'secondary'} className="rounded-pill">
                    {selectedSeat ? 'SIAP DIKUNCI' : 'PILIH KURSI'}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Masa Berlaku Lock:</span>
                  <span className="small text-dark fw-medium">15 Menit</span>
                </div>
              </div>

              
            </div>

            <div className="d-flex flex-column gap-2">
              {!activeLockToken ? (
                <Button
                  variant="primary"
                  className="w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  onClick={handleLockSeat}
                  disabled={!selectedSeat || locking}
                >
                  {locking ? <Spinner animation="border" size="sm" /> : <Clock size={18} />}
                  Kunci Kursi {selectedSeat || ''} (Redis Lock)
                </Button>
              ) : (
                <>
                  <Button
                    variant="success"
                    className="w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    onClick={handleConfirmBooking}
                    disabled={booking}
                  >
                    {booking ? <Spinner animation="border" size="sm" /> : <CheckCircle2 size={18} />}
                    Simulasikan Pembayaran & BOOKED
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="w-100 rounded-pill py-1"
                    onClick={handleReleaseSeat}
                  >
                    Batalkan / Lepas Lock
                  </Button>
                </>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SeatSelectionPage;
