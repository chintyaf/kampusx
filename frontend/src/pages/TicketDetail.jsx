import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Spinner, Button } from "react-bootstrap";
import { CheckCircle, Calendar, MapPin, Download, ArrowLeft, Share2, Clock, MonitorPlay } from "lucide-react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import QRCode from "react-qr-code";
import { useAuth } from "../context/AuthContext";

const TicketDetail = () => {
  const { ticketCode } = useParams();
  const { token }      = useAuth();
  const location       = useLocation();
  const navigate       = useNavigate();

  const fromCheckout = location.state?.fromCheckout === true;

  const [ticket,    setTicket]    = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);
  const [qrToken,   setQrToken]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res    = await api.get(`tickets/${ticketCode}`);
        const result = res.data;
        const ticketData = result?.data ?? result;
        setTicket(ticketData);

        // Fetch secure signed QR token
        try {
          const qrRes = await api.get(`tickets/${ticketCode}/qr-string`);
          if (qrRes.data?.qr_string) {
            setQrToken(qrRes.data.qr_string);
          }
        } catch (qrErr) {
          console.error("Gagal mengambil QR string yang ditandatangani:", qrErr);
        }
      } catch (err) {
        setError(err.response?.data?.message ?? "Gagal memuat tiket.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [ticketCode, token]);

  // Logika untuk Share Tiket
  const handleShare = async () => {
    const shareData = {
      title: 'Tiket Event KampusX',
      text: `Ini tiket saya untuk event ${ticket?.order_item?.order?.event?.title ?? 'KampusX'}!`,
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link tiket berhasil disalin ke clipboard!");
      }
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", background: "var(--color-bg)" }}>
      <Spinner animation="border" style={{ color: "var(--color-primary)" }} />
    </div>
  );

  if (error || !ticket) return (
    <div style={{ textAlign: "center", padding: "80px 16px", color: "var(--color-secondary)", background: "var(--color-bg)", minHeight: "100vh" }}>
      <p style={{ fontWeight: 700, color: "var(--color-text)", marginBottom: 8 }}>Tiket tidak ditemukan</p>
      <p style={{ fontSize: "var(--font-sm)", marginBottom: 20 }}>{error}</p>
      <Button onClick={() => navigate(-1)}
        style={{ background: "var(--color-primary)", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 600 }}>
        Kembali
      </Button>
    </div>
  );

  const event = ticket?.order_item?.order?.event ?? {};

  const statusMap = {
    active:    { label: "E-TICKET AKTIF",  bg: "#10B981" },
    used:      { label: "SUDAH DIGUNAKAN", bg: "#64748b" },
    cancelled: { label: "DIBATALKAN",      bg: "#ef4444" },
  };
  const statusInfo = statusMap[ticket.status] ?? statusMap.active;

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "Tanggal belum ditentukan";

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", paddingBottom: 56 }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{ background: "var(--color-white)", borderBottom: "1px solid var(--color-border)", padding: "16px 0", marginBottom: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <Container>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => navigate(-1)}
              style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "var(--color-secondary)" }}>
              <ArrowLeft size={20} />
            </button>
            <h5 style={{ margin: 0, fontWeight: 800, color: "var(--color-text)", fontSize: "var(--font-lg)" }}>
              Detail Tiket
            </h5>
          </div>
        </Container>
      </div>

      <Container>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>

          {/* ── Success banner — hanya muncul dari checkout ─────────────────────── */}
          {fromCheckout && (
            <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
              <CheckCircle size={32} color="#10B981" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "var(--font-md)", color: "#166534" }}>Pemesanan Berhasil!</p>
                <p style={{ margin: 0, fontSize: "var(--font-sm)", color: "#16a34a" }}>
                  Tiket digital kamu sudah aktif. Tunjukkan QR Code kepada panitia atau masuk ke Event Space untuk melihat materi.
                </p>
              </div>
            </div>
          )}

          {/* ── Ticket card ───────────────────────────────────────────────── */}
          <Card style={{ border: "1px solid var(--color-border)", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,105,158,0.08)" }}>
            <Row className="g-0">

              {/* LEFT: Event info */}
              <Col md={8} style={{ background: "var(--color-white)", padding: "28px 28px 24px" }}>
                {/* Status badge */}
                <span style={{ background: statusInfo.bg, color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 99, padding: "5px 12px", letterSpacing: "0.6px", display: "inline-block", marginBottom: 14 }}>
                  {statusInfo.label}
                </span>

                <h3 style={{ fontWeight: 800, color: "var(--color-text)", fontSize: "var(--font-xl)", lineHeight: 1.3, marginBottom: 20 }}>
                  {event.title ?? "Nama Event"}
                </h3>

                {/* Event meta */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Calendar size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--color-text)" }}>
                      {fmtDate(event.start_date)}
                    </span>
                  </div>
                  {event.location && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <MapPin size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--color-text)" }}>
                        {event.location}
                      </span>
                    </div>
                  )}
                  {event.end_date && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <Clock size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--color-text)" }}>
                        Selesai: {fmtDate(event.end_date)}
                      </span>
                    </div>
                  )}
                </div>

                <hr style={{ margin: "0 0 20px", borderColor: "var(--color-border)", opacity: 1, borderStyle: "dashed" }} />

                {/* Attendee info */}
                <Row className="g-3">
                  <Col xs={6}>
                    <p style={{ margin: "0 0 4px", fontSize: "var(--font-xs)", color: "var(--color-secondary)", fontWeight: 500 }}>Nama Peserta</p>
                    <p style={{ margin: 0, fontWeight: 700, color: "var(--color-text)", fontSize: "var(--font-sm)" }}>
                      {ticket.attendee_name ?? "-"}
                    </p>
                  </Col>
                  <Col xs={6}>
                    <p style={{ margin: "0 0 4px", fontSize: "var(--font-xs)", color: "var(--color-secondary)", fontWeight: 500 }}>Kode Tiket</p>
                    <p style={{ margin: 0, fontWeight: 700, color: "var(--color-primary)", fontSize: "var(--font-sm)", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                      {ticket.ticket_code}
                    </p>
                  </Col>
                  {ticket.order_item?.order?.payment_status && (
                    <Col xs={6}>
                      <p style={{ margin: "0 0 4px", fontSize: "var(--font-xs)", color: "var(--color-secondary)", fontWeight: 500 }}>Status Bayar</p>
                      <p style={{ margin: 0, fontWeight: 700, color: "#10B981", fontSize: "var(--font-sm)", textTransform: "capitalize" }}>
                        {ticket.order_item.order.payment_status}
                      </p>
                    </Col>
                  )}
                  {ticket.order_item?.order?.total_price != null && (
                    <Col xs={6}>
                      <p style={{ margin: "0 0 4px", fontSize: "var(--font-xs)", color: "var(--color-secondary)", fontWeight: 500 }}>Total Dibayar</p>
                      <p style={{ margin: 0, fontWeight: 700, color: "var(--color-text)", fontSize: "var(--font-sm)" }}>
                        {ticket.order_item.order.total_price === 0
                          ? "Gratis"
                          : `Rp ${Number(ticket.order_item.order.total_price).toLocaleString("id-ID")}`}
                      </p>
                    </Col>
                  )}
                </Row>
              </Col>

              {/* RIGHT: QR code */}
              <Col md={4}
                className="border-top border-md-top-0 border-md-start"
                style={{ 
                  background: "var(--color-bg)", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  padding: "32px 20px", 
                  textAlign: "center",
                  borderColor: "var(--color-border)",
                  borderStyle: "dashed" 
                }}>
                <div style={{ background: "#fff", padding: 16, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.06)", marginBottom: 16 }}>
                  <QRCode value={qrToken || ticket.ticket_code} size={140} />
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--color-secondary)", fontWeight: 600, lineHeight: 1.5 }}>
                  Tunjukkan QR Code ini kepada panitia saat check-in.
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "var(--color-secondary)", fontFamily: "monospace" }}>
                  {ticket.ticket_code}
                </p>
              </Col>
            </Row>
          </Card>

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
            
            {/* Secondary Actions */}
            <div className="d-flex gap-2 w-100 w-md-auto">
              <Button
                variant="outline-secondary"
                onClick={handleShare}
                className="flex-fill flex-md-grow-0"
                style={{ borderRadius: 8, fontWeight: 600, fontSize: "var(--font-sm)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 18px", borderColor: "var(--color-border)", color: "var(--color-secondary)" }}
              >
                <Share2 size={16} /> Bagikan
              </Button>
              <Button
                variant="outline-secondary"
                className="flex-fill flex-md-grow-0"
                style={{ borderRadius: 8, fontWeight: 600, fontSize: "var(--font-sm)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 18px", borderColor: "var(--color-border)", color: "var(--color-secondary)" }}
              >
                <Download size={16} /> Unduh PDF
              </Button>
            </div>

            {/* Primary Actions */}
            <div className="d-flex gap-2 w-100 w-md-auto">
              <Link to="/explore-events" className="flex-fill flex-md-grow-0">
                <Button
                  variant="light"
                  className="w-100"
                  style={{ borderRadius: 8, fontWeight: 600, fontSize: "var(--font-sm)", padding: "10px 20px", border: "1px solid var(--color-border)" }}
                >
                  Event Lain
                </Button>
              </Link>
              <Button
                onClick={() => navigate(`/event-space/${event.slug || event.id}`)}
                className="flex-fill flex-md-grow-0 d-flex align-items-center justify-content-center gap-2"
                style={{ background: "var(--color-primary)", border: "none", borderRadius: 8, fontWeight: 700, fontSize: "var(--font-sm)", padding: "10px 24px" }}
              >
                <MonitorPlay size={16} /> Masuk Event Space
              </Button>
            </div>

          </div>

        </div>
      </Container>
    </div>
  );
};

export default TicketDetail;