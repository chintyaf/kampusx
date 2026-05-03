import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Spinner, Button } from "react-bootstrap";
import { CheckCircle, Calendar, MapPin, Download, ArrowLeft, Share2, Clock } from "lucide-react";
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

  useEffect(() => {
    (async () => {
      try {
        const res    = await api.get(`tickets/${ticketCode}`);
        const result = res.data;
        setTicket(result?.data ?? result);
      } catch (err) {
        setError(err.response?.data?.message ?? "Gagal memuat tiket.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [ticketCode, token]);

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
      <Spinner animation="border" style={{ color: "var(--color-primary)" }} />
    </div>
  );

  if (error || !ticket) return (
    <div style={{ textAlign: "center", padding: "80px 16px", color: "var(--color-secondary)" }}>
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

          {/* ── Success banner — hanya dari checkout ─────────────────────── */}
          {fromCheckout && (
            <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
              <CheckCircle size={32} color="#10B981" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "var(--font-md)", color: "#166534" }}>Pemesanan Berhasil!</p>
                <p style={{ margin: 0, fontSize: "var(--font-sm)", color: "#16a34a" }}>
                  Tiket digital kamu sudah aktif. Tunjukkan QR Code kepada panitia saat registrasi.
                </p>
              </div>
            </div>
          )}

          {/* ── Ticket card ───────────────────────────────────────────────── */}
          <Card style={{ border: "1px solid var(--color-border)", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,105,158,0.10)" }}>
            <Row className="g-0">

              {/* LEFT: Event info */}
              <Col md={8} style={{ background: "var(--color-white)", padding: "28px 28px 24px" }}>
                {/* Status badge */}
                <span style={{ background: statusInfo.bg, color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 99, padding: "4px 12px", letterSpacing: "0.6px", display: "inline-block", marginBottom: 14 }}>
                  {statusInfo.label}
                </span>

                <h3 style={{ fontWeight: 800, color: "var(--color-text)", fontSize: "var(--font-xl)", lineHeight: 1.3, marginBottom: 20 }}>
                  {event.title ?? "Nama Event"}
                </h3>

                {/* Event meta */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Calendar size={17} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--color-text)" }}>
                      {fmtDate(event.start_date)}
                    </span>
                  </div>
                  {event.location && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <MapPin size={17} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--color-text)" }}>
                        {event.location}
                      </span>
                    </div>
                  )}
                  {event.end_date && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <Clock size={17} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 1 }} />
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
                    <p style={{ margin: "0 0 3px", fontSize: "var(--font-xs)", color: "var(--color-secondary)", fontWeight: 500 }}>Nama Peserta</p>
                    <p style={{ margin: 0, fontWeight: 700, color: "var(--color-text)", fontSize: "var(--font-sm)" }}>
                      {ticket.attendee_name ?? "-"}
                    </p>
                  </Col>
                  <Col xs={6}>
                    <p style={{ margin: "0 0 3px", fontSize: "var(--font-xs)", color: "var(--color-secondary)", fontWeight: 500 }}>Kode Tiket</p>
                    <p style={{ margin: 0, fontWeight: 700, color: "var(--color-primary)", fontSize: "var(--font-sm)", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                      {ticket.ticket_code}
                    </p>
                  </Col>
                  {ticket.order_item?.order?.payment_status && (
                    <Col xs={6}>
                      <p style={{ margin: "0 0 3px", fontSize: "var(--font-xs)", color: "var(--color-secondary)", fontWeight: 500 }}>Status Bayar</p>
                      <p style={{ margin: 0, fontWeight: 700, color: "#10B981", fontSize: "var(--font-sm)", textTransform: "capitalize" }}>
                        {ticket.order_item.order.payment_status}
                      </p>
                    </Col>
                  )}
                  {ticket.order_item?.order?.total_price != null && (
                    <Col xs={6}>
                      <p style={{ margin: "0 0 3px", fontSize: "var(--font-xs)", color: "var(--color-secondary)", fontWeight: 500 }}>Total Dibayar</p>
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
                style={{ background: "var(--color-bg)", borderLeft: "2px dashed var(--color-border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 20px", textAlign: "center" }}>
                <div style={{ background: "#fff", padding: 14, borderRadius: 12, boxShadow: "0 2px 12px rgba(0,105,158,0.10)", marginBottom: 12 }}>
                  <QRCode value={ticket.qr_token ?? ticket.ticket_code} size={130} />
                </div>
                <p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--color-secondary)", fontWeight: 500, lineHeight: 1.5 }}>
                  Tunjukkan QR Code ini kepada panitia saat check-in.
                </p>
                <p style={{ margin: 0, fontSize: 10, color: "var(--color-secondary)", fontFamily: "monospace" }}>
                  {ticket.ticket_code}
                </p>
              </Col>
            </Row>
          </Card>

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <Button
              variant="outline-secondary"
              style={{ borderRadius: 8, fontWeight: 600, fontSize: "var(--font-sm)", display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderColor: "var(--color-border)", color: "var(--color-secondary)" }}
            >
              <Download size={15} /> Unduh PDF
            </Button>
            <Button
              variant="outline-secondary"
              style={{ borderRadius: 8, fontWeight: 600, fontSize: "var(--font-sm)", display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderColor: "var(--color-border)", color: "var(--color-secondary)" }}
            >
              <Share2 size={15} /> Bagikan
            </Button>
            <Link to="/explore-events" style={{ marginLeft: "auto" }}>
              <Button
                style={{ background: "var(--color-primary)", border: "none", borderRadius: 8, fontWeight: 700, fontSize: "var(--font-sm)", padding: "8px 20px" }}
              >
                Cari Event Lain
              </Button>
            </Link>
          </div>

        </div>
      </Container>
    </div>
  );
};

export default TicketDetail;