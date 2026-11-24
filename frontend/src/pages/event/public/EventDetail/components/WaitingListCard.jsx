import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import {
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';

/**
 * Komponen Antarmuka Waiting List Terintegrasi.
 * Menangani state: WAITING, OFFERED, CLAIMED, EXPIRED, CANCELLED, serta auto-polling cerdas.
 */
const WaitingListCard = ({
  eventId,
  user,
  selectedTicket,
  eventDetails,
  onStatusChange
}) => {
  const navigate = useNavigate();

  const [waitlistStatus, setWaitlistStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Countdown timer untuk status OFFERED (dalam detik)
  const [countdown, setCountdown] = useState(0);

  const pollTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // 1. Fetch status antrean dari backend
  const fetchWaitlistStatus = useCallback(async (isPolling = false) => {
    if (!user || !eventId) {
      setIsLoading(false);
      return;
    }

    try {
      if (!isPolling) setErrorMessage(null);
      const res = await api.get(`/events/${eventId}/waitlist/my-status`);

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setWaitlistStatus(data);
        setLastUpdated(new Date().toLocaleTimeString('id-ID'));

        if (data.status === 'OFFERED' && data.remaining_offer_seconds > 0) {
          setCountdown(data.remaining_offer_seconds);
        }

        if (onStatusChange) {
          onStatusChange(data);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat status waiting list:', err);
      if (!isPolling) {
        // Jika 401 unauthenticated, biarkan null
        if (err?.response?.status !== 401) {
          setErrorMessage('Gagal sinkronisasi status antrean dengan server.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [eventId, user, onStatusChange]);

  // Initial fetch
  useEffect(() => {
    fetchWaitlistStatus(false);
  }, [fetchWaitlistStatus]);

  // 2. Setup Polling berkala (12 detik) untuk user dalam antrean aktif
  useEffect(() => {
    const shouldPoll = waitlistStatus?.in_queue &&
      (waitlistStatus.status === 'WAITING' || waitlistStatus.status === 'OFFERED');

    if (!shouldPoll) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    // Polling setiap 12 detik
    pollTimerRef.current = setInterval(() => {
      // Hanya poll jika tab browser sedang aktif (Task 14)
      if (document.visibilityState === 'visible') {
        fetchWaitlistStatus(true);
      }
    }, 12000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [waitlistStatus?.in_queue, waitlistStatus?.status, fetchWaitlistStatus]);

  // 3. Countdown timer interval untuk exclusive offer (setiap 1 detik)
  useEffect(() => {
    if (waitlistStatus?.status === 'OFFERED' && countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            // Re-fetch untuk sinkronkan status kadaluwarsa dari backend
            fetchWaitlistStatus(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [waitlistStatus?.status, countdown, fetchWaitlistStatus]);

  // Format detik menjadi mm:ss
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 4. Aksi: Bergabung ke Waiting List
  const handleJoinWaitlist = async () => {
    if (!user) {
      alert('Silakan Sign In terlebih dahulu untuk bergabung ke Waiting List.');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.post(`/events/${eventId}/waitlist/join`, {
        ticket_id: selectedTicket || null
      });

      if (res.data?.success) {
        setSuccessMessage(res.data.message || 'Berhasil masuk antrean Waiting List!');
        await fetchWaitlistStatus(false);
      } else {
        setErrorMessage(res.data?.message || 'Gagal bergabung ke waiting list.');
      }
    } catch (err) {
      console.error('Error join waitlist:', err);
      const msg = err?.response?.data?.message || 'Terjadi kesalahan saat mendaftar antrean.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Aksi: Keluar / Batalkan Antrean
  const handleCancelWaitlist = async () => {
    if (!window.confirm('Apakah Anda yakin ingin keluar dari antrean Waiting List? Anda akan kehilangan posisi nomor urut antrean Anda.')) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.post(`/events/${eventId}/waitlist/cancel`);
      if (res.data?.success) {
        setSuccessMessage('Anda telah keluar dari antrean.');
        await fetchWaitlistStatus(false);
      }
    } catch (err) {
      console.error('Error cancel waitlist:', err);
      setErrorMessage(err?.response?.data?.message || 'Gagal membatalkan antrean.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Aksi: Menerima Offer (Accept Offer) -> Konversi ke Checkout Hold 15 Menit
  const handleAcceptOffer = async () => {
    if (!waitlistStatus?.offer_token) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.post(`/waitlist/offer/${waitlistStatus.offer_token}/accept`);

      if (res.data?.success && res.data?.data) {
        const checkoutUrl = res.data.data.checkout_url;
        // Langsung arahkan ke halaman checkout resmi dengan lock token yang diterbitkan
        navigate(checkoutUrl);
      } else {
        setErrorMessage(res.data?.message || 'Penawaran gagal diklaim.');
        await fetchWaitlistStatus(false);
      }
    } catch (err) {
      console.error('Error accept offer:', err);
      const msg = err?.response?.data?.message || 'Batas waktu penawaran telah habis atau terjadi kesalahan.';
      setErrorMessage(msg);
      await fetchWaitlistStatus(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7. Aksi: Menolak Offer (Decline Offer)
  const handleDeclineOffer = async () => {
    if (!waitlistStatus?.offer_token) return;
    if (!window.confirm('Tolak penawaran tiket ini? Tiket akan dialihkan ke antrean peserta berikutnya.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/waitlist/offer/${waitlistStatus.offer_token}/decline`);
      if (res.data?.success) {
        setSuccessMessage('Penawaran ditolak. Terima kasih.');
        await fetchWaitlistStatus(false);
      }
    } catch (err) {
      console.error('Error decline offer:', err);
      setErrorMessage(err?.response?.data?.message || 'Gagal memproses penolakan offer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER CONDITIONAL STATE ---

  if (isLoading) {
    return (
      <Card className="border border-light-subtle shadow-sm rounded-4 mb-3 p-3 text-center bg-light">
        <div className="d-flex align-items-center justify-content-center gap-2 py-2 text-muted">
          <Spinner animation="border" size="sm" variant="primary" />
          <span style={{ fontSize: '13px' }}>Memeriksa ketersediaan antrean...</span>
        </div>
      </Card>
    );
  }

  // JIKA USER SUDAH TERDAFTAR DALAM ANTREAN (in_queue: true)
  if (waitlistStatus?.in_queue) {
    const isOffered = waitlistStatus.status === 'OFFERED';
    const isWaiting = waitlistStatus.status === 'WAITING';

    return (
      <Card
        className={`shadow-sm rounded-4 mb-4 border-2 transition-all ${
          isOffered
            ? 'border-warning bg-warning bg-opacity-10'
            : 'border-primary bg-primary bg-opacity-10'
        }`}
      >
        <Card.Body className="p-3 p-md-4">
          {/* Header Status */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <span
                className={`p-2 rounded-circle ${
                  isOffered ? 'bg-warning text-dark' : 'bg-primary text-white'
                }`}
              >
                {isOffered ? <Sparkles size={18} /> : <Users size={18} />}
              </span>
              <div>
                <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '15px' }}>
                  {isOffered ? 'Tiket Tersedia Untuk Anda!' : 'Anda Berada dalam Antrean'}
                </h6>
                <small className="text-muted" style={{ fontSize: '11px' }}>
                  Diperbarui: {lastUpdated || 'Baru saja'}
                </small>
              </div>
            </div>

            <Badge
              bg={isOffered ? 'warning' : 'primary'}
              text={isOffered ? 'dark' : 'white'}
              className="px-3 py-1.5 rounded-pill fw-semibold shadow-sm"
              style={{ fontSize: '12px' }}
            >
              {isOffered ? 'OFFER AKTIF' : `POSISI #${waitlistStatus.position}`}
            </Badge>
          </div>

          {errorMessage && (
            <Alert variant="danger" className="py-2 px-3 small rounded-3 mb-3">
              {errorMessage}
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" className="py-2 px-3 small rounded-3 mb-3">
              {successMessage}
            </Alert>
          )}

          {/* KASUS A: STATUS OFFERED (Eksklusif 3 Menit) */}
          {isOffered && (
            <div className="bg-white p-3 rounded-3 border border-warning shadow-sm mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted fw-medium">Sisa Waktu Klaim:</span>
                <span className="fw-bold text-danger fs-5 d-flex align-items-center gap-1">
                  <Clock size={18} /> {formatCountdown(countdown)}
                </span>
              </div>

              <p className="small text-muted mb-3" style={{ fontSize: '12.5px' }}>
                {waitlistStatus.seat_number
                  ? `Kursi ${waitlistStatus.seat_number} berhasil dicadangkan untuk Anda.`
                  : 'Satu kuota tiket berhasil diamankan khusus untuk Anda.'}{' '}
                Klaim sekarang sebelum dialihkan ke peserta berikutnya!
              </p>

              <div className="d-flex gap-2">
                <Button
                  variant="success"
                  className="w-100 py-2.5 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                  onClick={handleAcceptOffer}
                  disabled={isSubmitting || countdown <= 0}
                  style={{ fontSize: '14px' }}
                >
                  {isSubmitting ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <ShieldCheck size={18} />
                  )}
                  Ambil Kursi Sekarang
                </Button>

                <Button
                  variant="outline-danger"
                  className="rounded-pill px-3 py-2 fw-medium"
                  onClick={handleDeclineOffer}
                  disabled={isSubmitting}
                  style={{ fontSize: '12.5px' }}
                  title="Tolak Penawaran"
                >
                  Tolak
                </Button>
              </div>
            </div>
          )}

          {/* KASUS B: STATUS WAITING (Sedang Mengantre) */}
          {isWaiting && (
            <div className="bg-white p-3 rounded-3 border mb-3 shadow-sm">
              <div className="row g-2 text-center">
                <div className="col-6 border-end">
                  <div className="text-muted small" style={{ fontSize: '11px' }}>
                    Posisi Antrean
                  </div>
                  <div className="fs-4 fw-bold text-primary">
                    #{waitlistStatus.position}
                  </div>
                  <div className="text-muted" style={{ fontSize: '10px' }}>
                    Nomor FIFO: {waitlistStatus.queue_number}
                  </div>
                </div>

                <div className="col-6">
                  <div className="text-muted small" style={{ fontSize: '11px' }}>
                    Estimasi Menunggu
                  </div>
                  <div className="fs-6 fw-bold text-dark mt-1">
                    {waitlistStatus.estimated_wait_text || 'Menghitung...'}
                  </div>
                  <div className="text-muted" style={{ fontSize: '10px' }}>
                    Dinamis berbasis kapasitas
                  </div>
                </div>
              </div>

              <hr className="my-2 text-muted opacity-25" />

              <div className="d-flex align-items-center gap-1.5 text-muted small mt-2" style={{ fontSize: '11.5px' }}>
                <Info size={14} className="text-primary flex-shrink-0" />
                <span>
                  Halaman ini otomatis mengecek giliran Anda. Kami juga mengirimkan notifikasi saat tiket tersedia.
                </span>
              </div>
            </div>
          )}

          {/* Tombol Keluar Antrean */}
          {isWaiting && (
            <div className="d-flex justify-content-between align-items-center pt-1">
              <Button
                variant="link"
                className="text-danger text-decoration-none p-0 small fw-medium"
                onClick={handleCancelWaitlist}
                disabled={isSubmitting}
                style={{ fontSize: '12px' }}
              >
                {isSubmitting ? 'Memproses...' : 'Keluar dari Antrean'}
              </Button>

              <Button
                variant="link"
                className="text-muted text-decoration-none p-0 small d-flex align-items-center gap-1"
                onClick={() => fetchWaitlistStatus(false)}
                disabled={isSubmitting}
                style={{ fontSize: '12px' }}
              >
                <RefreshCw size={12} /> Segarkan
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  }

  // JIKA USER TIDAK DALAM ANTREAN TETAPI KUOTA SEDANG PENUH / SOLD OUT
  return (
    <div className="mt-2">
      {errorMessage && (
        <Alert variant="danger" className="py-2 px-3 small rounded-3 mb-2">
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="py-2 px-3 small rounded-3 mb-2">
          {successMessage}
        </Alert>
      )}

      <Button
        variant="primary"
        className="w-100 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
        onClick={handleJoinWaitlist}
        disabled={isSubmitting}
        style={{
          backgroundColor: '#1d4ed8',
          borderColor: '#1d4ed8',
          fontSize: '15px'
        }}
      >
        {isSubmitting ? (
          <>
            <Spinner animation="border" size="sm" />
            <span>Mendaftarkan Antrean...</span>
          </>
        ) : (
          <>
            <Clock size={18} />
            <span>Gabung Waiting List (Antrean)</span>
          </>
        )}
      </Button>

      <div className="text-center mt-2">
        <small className="text-muted" style={{ fontSize: '11.5px' }}>
          Tiket sedang penuh atau dalam proses pembayaran peserta lain. Masuk waiting list untuk mendapatkan penawaran eksklusif saat kuota terlepas.
        </small>
      </div>
    </div>
  );
};

export default WaitingListCard;
